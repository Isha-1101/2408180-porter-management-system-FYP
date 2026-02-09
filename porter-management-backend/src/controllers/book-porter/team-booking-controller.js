import mongoose from "mongoose";
import PorterBooking from "../../models/PorterBooking.js";
import Porters from "../../models/porter/Porters.js";
import PorterTeam from "../../models/porter/porterTeam.js";
import BookingPorterRequest from "../../models/BookintgPorterRequest.js";
import TeamBookingSelection from "../../models/TeamBookingSelection.js";
import User from "../../models/User.js";
import {
    notifyTeamLead,
    notifyUser,
    notifyTeamMembers,
    notifyTeamLeadAboutResponse,
} from "../../utils/notification-service.js";

/**
 * Create team porter booking
 * POST /api/bookings/team
 */
export const createTeamBooking = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            pickup,
            drop,
            weightKg,
            teamSize,
            requirements,
            bookingDate,
            bookingTime,
            hasVehicle,
            vehicleType,
            numberOfVehicles,
            radiusKm = 5,
        } = req.body;

        const userId = req.user.id;

        // Validate required fields
        if (!pickup || !drop || !weightKg || !teamSize) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message:
                    "Pickup location, drop location, weight, and team size are required",
            });
        }

        // Create booking
        const booking = await PorterBooking.create(
            [
                {
                    userId,
                    bookingType: "team",
                    pickup,
                    drop,
                    weightKg,
                    teamSize,
                    requirements: requirements || null,
                    bookingDate: bookingDate ? new Date(bookingDate) : null,
                    bookingTime: bookingTime || null,
                    hasVehicle: hasVehicle || false,
                    vehicleType: hasVehicle ? vehicleType : null,
                    numberOfVehicles: hasVehicle ? numberOfVehicles : null,
                    radiusKm,
                    status: "SEARCHING",
                },
            ],
            { session }
        );

        const bookingDoc = booking[0];

        // Find teams with enough members and team leads
        const teams = await PorterTeam.aggregate([
            {
                $match: {
                    isActive: true,
                },
            },
            {
                $lookup: {
                    from: "porters",
                    localField: "_id",
                    foreignField: "teamId",
                    as: "members",
                },
            },
            {
                $match: {
                    "members.status": "active",
                    "members.isVerified": true,
                },
            },
            {
                $addFields: {
                    activeMembers: {
                        $filter: {
                            input: "$members",
                            as: "member",
                            cond: {
                                $and: [
                                    { $eq: ["$$member.status", "active"] },
                                    { $eq: ["$$member.isVerified", true] },
                                    { $eq: ["$$member.currentStatus", "online"] },
                                    { $gte: ["$$member.maxWeightKg", weightKg / teamSize] },
                                ],
                            },
                        },
                    },
                },
            },
            {
                $match: {
                    $expr: { $gte: [{ $size: "$activeMembers" }, teamSize] },
                },
            },
        ]);

        if (!teams.length) {
            await session.abortTransaction();
            session.endSession();

            return res.status(404).json({
                success: false,
                message: `No teams with ${teamSize} available members found`,
            });
        }

        // Find team leads and calculate distances
        const teamLeadsToNotify = [];

        for (const team of teams) {
            // Find team lead (owner)
            const teamLead = await Porters.findOne({
                teamId: team._id,
                role: "owner",
                status: "active",
                isVerified: true,
            })
                .populate("userId")
                .session(session);

            if (!teamLead || !teamLead.userId) continue;

            // Calculate distance from team lead location to pickup
            const distance = calculateDistance(
                teamLead.location.coordinates[1],
                teamLead.location.coordinates[0],
                pickup.lat,
                pickup.lng
            );

            if (distance <= radiusKm) {
                teamLeadsToNotify.push({
                    teamLead,
                    teamId: team._id,
                    distance,
                });
            }
        }

        if (!teamLeadsToNotify.length) {
            await session.abortTransaction();
            session.endSession();

            return res.status(404).json({
                success: false,
                message: `No team leads available within ${radiusKm} km`,
            });
        }

        // Sort by distance and limit to top 5
        teamLeadsToNotify.sort((a, b) => a.distance - b.distance);
        const topTeamLeads = teamLeadsToNotify.slice(0, 5);

        // Create porter requests for team leads
        const porterRequests = topTeamLeads.map((item) => ({
            bookingId: bookingDoc._id,
            porterId: item.teamLead._id,
            distanceKm: Number(item.distance.toFixed(2)),
            notificationType: "TEAM_LEAD",
            isTeamLead: true,
            status: "PENDING",
        }));

        await BookingPorterRequest.insertMany(porterRequests, { session });

        // Update booking status
        bookingDoc.status = "WAITING_TEAM_LEAD";
        await bookingDoc.save({ session });

        await session.commitTransaction();
        session.endSession();

        // Send notifications to team leads (async)
        for (const item of topTeamLeads) {
            notifyTeamLead(
                item.teamLead.userId._id,
                bookingDoc,
                item.distance
            ).catch((err) => console.error("Notification error:", err));
        }

        // Notify user
        notifyUser(userId, bookingDoc, "BOOKING_CREATED").catch((err) =>
            console.error("User notification error:", err)
        );

        return res.status(201).json({
            success: true,
            message: "Team booking created, notifying team leads",
            bookingId: bookingDoc._id,
            teamLeadsNotified: topTeamLeads.length,
            data: {
                booking: bookingDoc,
            },
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error("Error creating team booking:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create team booking",
            error: error.message,
        });
    }
};

/**
 * Team lead accepts booking and gets list of team members
 * POST /api/bookings/team/:id/team-lead/accept
 */
export const teamLeadAcceptBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const porterId = req.user.porterId;

        if (!porterId) {
            return res.status(403).json({
                success: false,
                message: "Only team leads can accept team bookings",
            });
        }

        // Verify this is a team lead
        const porter = await Porters.findById(porterId);
        if (!porter || porter.role !== "owner") {
            return res.status(403).json({
                success: false,
                message: "Only team leads can accept team bookings",
            });
        }

        // Find booking
        const booking = await PorterBooking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Check if booking is still available
        if (booking.status !== "WAITING_TEAM_LEAD") {
            return res.status(400).json({
                success: false,
                message: "Booking is no longer available",
            });
        }

        // Find the porter request
        const porterRequest = await BookingPorterRequest.findOne({
            bookingId,
            porterId,
            isTeamLead: true,
        });

        if (!porterRequest) {
            return res.status(404).json({
                success: false,
                message: "Team lead request not found",
            });
        }

        // Update porter request
        porterRequest.status = "ACCEPTED";
        porterRequest.respondedAt = new Date();
        await porterRequest.save();

        // Update booking status
        booking.status = "TEAM_LEAD_SELECTING";
        booking.assignedTeamId = porter.teamId;
        await booking.save();

        // Get available team members
        const teamMembers = await Porters.find({
            teamId: porter.teamId,
            role: "worker",
            status: "active",
            isVerified: true,
            currentStatus: "online",
        })
            .populate("userId", "name email phone")
            .select("_id userId maxWeightKg location");

        // Expire other team lead requests
        await BookingPorterRequest.updateMany(
            {
                bookingId,
                porterId: { $ne: porterId },
                isTeamLead: true,
                status: "PENDING",
            },
            {
                status: "EXPIRED",
                respondedAt: new Date(),
            }
        );

        return res.status(200).json({
            success: true,
            message: "Booking accepted. Please select team members.",
            data: {
                booking,
                availableMembers: teamMembers,
                requiredMembers: booking.teamSize,
            },
        });
    } catch (error) {
        console.error("Error in team lead accept:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to accept booking",
            error: error.message,
        });
    }
};

/**
 * Team lead selects specific porters for the booking
 * POST /api/bookings/team/:id/team-lead/select-porters
 */
export const teamLeadSelectPorters = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const bookingId = req.params.id;
        const { selectedPorterIds } = req.body;
        const teamLeadPorterId = req.user.porterId;

        if (!selectedPorterIds || !Array.isArray(selectedPorterIds)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: "Selected porter IDs array is required",
            });
        }

        // Find booking
        const booking = await PorterBooking.findById(bookingId).session(session);

        if (!booking) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Verify status
        if (booking.status !== "TEAM_LEAD_SELECTING") {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: "Booking is not in selection phase",
            });
        }

        // Verify number of selected porters
        if (selectedPorterIds.length < booking.teamSize) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: `Please select at least ${booking.teamSize} porters`,
            });
        }

        // Get team lead info
        const teamLead = await Porters.findById(teamLeadPorterId)
            .populate("userId")
            .session(session);

        // Create team booking selection
        const selection = await TeamBookingSelection.create(
            [
                {
                    bookingId,
                    teamId: booking.assignedTeamId,
                    teamLeadId: teamLead.userId._id,
                    selectedPorters: selectedPorterIds.map((porterId) => ({
                        porterId,
                        status: "PENDING",
                    })),
                },
            ],
            { session }
        );

        // Update booking status
        booking.status = "WAITING_PORTER_RESPONSE";
        await booking.save({ session });

        await session.commitTransaction();
        session.endSession();

        // Notify selected porters (async)
        notifyTeamMembers(
            selectedPorterIds,
            booking,
            teamLead.userId.name
        ).catch((err) => console.error("Notification error:", err));

        return res.status(200).json({
            success: true,
            message: "Porters selected. Waiting for their responses.",
            data: {
                booking,
                selection: selection[0],
            },
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error("Error selecting porters:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to select porters",
            error: error.message,
        });
    }
};

/**
 * Team member responds to selection
 * POST /api/bookings/team/:id/porter/:porterId/respond
 */
export const teamMemberRespond = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const porterId = req.params.porterId;
        const { accepted } = req.body;
        const currentPorterId = req.user.porterId;

        // Verify porter is responding for themselves
        if (porterId !== currentPorterId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only respond for yourself",
            });
        }

        // Find selection
        const selection = await TeamBookingSelection.findOne({ bookingId });

        if (!selection) {
            return res.status(404).json({
                success: false,
                message: "Team booking selection not found",
            });
        }

        // Find the porter in selections
        const porterSelection = selection.selectedPorters.find(
            (p) => p.porterId.toString() === porterId
        );

        if (!porterSelection) {
            return res.status(404).json({
                success: false,
                message: "You are not selected for this booking",
            });
        }

        // Update porter response
        porterSelection.status = accepted ? "ACCEPTED" : "REJECTED";
        porterSelection.respondedAt = new Date();
        await selection.save();

        // Get porter info
        const porter = await Porters.findById(porterId).populate("userId");

        // Notify team lead
        const teamLead = await User.findById(selection.teamLeadId);
        if (teamLead) {
            notifyTeamLeadAboutResponse(
                teamLead._id,
                await PorterBooking.findById(bookingId),
                porter.userId.name,
                accepted
            ).catch((err) => console.error("Notification error:", err));
        }

        // Check if all selected porters have responded
        const allResponded = selection.selectedPorters.every(
            (p) => p.status !== "PENDING"
        );

        return res.status(200).json({
            success: true,
            message: `Response recorded: ${accepted ? "Accepted" : "Rejected"}`,
            data: {
                selection,
                allResponded,
            },
        });
    } catch (error) {
        console.error("Error in team member response:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to record response",
            error: error.message,
        });
    }
};

/**
 * Team lead confirms booking after porter responses
 * POST /api/bookings/team/:id/team-lead/confirm
 */
export const teamLeadConfirm = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const bookingId = req.params.id;
        const teamLeadPorterId = req.user.porterId;

        // Find booking
        const booking = await PorterBooking.findById(bookingId).session(session);

        if (!booking) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Find selection
        const selection = await TeamBookingSelection.findOne({
            bookingId,
        }).session(session);

        if (!selection) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: "Team booking selection not found",
            });
        }

        // Count accepted porters
        const acceptedPorters = selection.selectedPorters.filter(
            (p) => p.status === "ACCEPTED"
        );

        if (acceptedPorters.length < booking.teamSize) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: `Not enough porters accepted. Need ${booking.teamSize}, got ${acceptedPorters.length}`,
            });
        }

        // Update selection
        selection.teamLeadConfirmed = true;
        selection.confirmedAt = new Date();
        await selection.save({ session });

        // Update booking
        booking.status = "CONFIRMED";
        booking.assignedPorters = acceptedPorters.map((p) => ({
            porterId: p.porterId,
            status: "ASSIGNED",
        }));
        await booking.save({ session });

        await session.commitTransaction();
        session.endSession();

        // Notify user
        notifyUser(booking.userId, booking, "BOOKING_CONFIRMED").catch((err) =>
            console.error("User notification error:", err)
        );

        return res.status(200).json({
            success: true,
            message: "Booking confirmed successfully",
            data: {
                booking,
                assignedPorters: acceptedPorters.length,
            },
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error("Error confirming team booking:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to confirm booking",
            error: error.message,
        });
    }
};

/**
 * Team lead rejects booking
 * POST /api/bookings/team/:id/team-lead/reject
 */
export const teamLeadRejectBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const porterId = req.user.porterId;

        // Find the porter request
        const porterRequest = await BookingPorterRequest.findOne({
            bookingId,
            porterId,
            isTeamLead: true,
        });

        if (!porterRequest) {
            return res.status(404).json({
                success: false,
                message: "Team lead request not found",
            });
        }

        // Update porter request
        porterRequest.status = "REJECTED";
        porterRequest.respondedAt = new Date();
        await porterRequest.save();

        // Check if there are any other pending team lead requests
        const pendingRequests = await BookingPorterRequest.countDocuments({
            bookingId,
            isTeamLead: true,
            status: "PENDING",
        });

        // If no pending requests, cancel booking
        if (pendingRequests === 0) {
            const booking = await PorterBooking.findById(bookingId);
            if (booking && booking.status === "WAITING_TEAM_LEAD") {
                booking.status = "CANCELLED";
                booking.cancellationReason = "No team leads accepted";
                await booking.save();

                // Notify user
                notifyUser(
                    booking.userId,
                    booking,
                    "BOOKING_CANCELLED",
                    "No team leads accepted your booking. Please try again."
                ).catch((err) => console.error("User notification error:", err));
            }
        }

        return res.status(200).json({
            success: true,
            message: "Booking rejected",
            pendingRequests,
        });
    } catch (error) {
        console.error("Error rejecting team booking:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to reject booking",
            error: error.message,
        });
    }
};

/**
 * Complete team booking
 * POST /api/bookings/team/:id/complete
 */
export const completeTeamBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const teamLeadPorterId = req.user.porterId;

        // Verify this is a team lead
        const teamLead = await Porters.findById(teamLeadPorterId);
        if (!teamLead || teamLead.role !== "owner") {
            return res.status(403).json({
                success: false,
                message: "Only team leads can complete team bookings",
            });
        }

        // Find booking
        const booking = await PorterBooking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Verify team is assigned to this booking
        if (booking.assignedTeamId.toString() !== teamLead.teamId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Your team is not assigned to this booking",
            });
        }

        // Update booking
        booking.status = "COMPLETED";
        booking.completedAt = new Date();
        await booking.save();

        // Notify user
        notifyUser(booking.userId, booking, "BOOKING_COMPLETED").catch((err) =>
            console.error("User notification error:", err)
        );

        return res.status(200).json({
            success: true,
            message: "Team booking completed successfully",
            data: { booking },
        });
    } catch (error) {
        console.error("Error completing team booking:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to complete booking",
            error: error.message,
        });
    }
};

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}
