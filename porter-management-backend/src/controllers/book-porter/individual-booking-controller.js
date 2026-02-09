import mongoose from "mongoose";
import PorterBooking from "../../models/PorterBooking.js";
import Porters from "../../models/porter/Porters.js";
import BookingPorterRequest from "../../models/BookintgPorterRequest.js";
import {
    notifyPorter,
    notifyUser,
    notifyMultiplePorters,
} from "../../utils/notification-service.js";

/**
 * Create individual porter booking
 * POST /api/bookings/individual
 */
export const createIndividualBooking = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            pickup,
            drop,
            weightKg,
            hasVehicle,
            vehicleType,
            radiusKm = 5,
        } = req.body;

        const userId = req.user.id;

        // Validate required fields
        if (!pickup || !drop || !weightKg) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: "Pickup location, drop location, and weight are required",
            });
        }

        // Create booking
        const booking = await PorterBooking.create(
            [
                {
                    userId,
                    bookingType: "individual",
                    pickup,
                    drop,
                    weightKg,
                    hasVehicle: hasVehicle || false,
                    vehicleType: hasVehicle ? vehicleType : null,
                    radiusKm,
                    status: "SEARCHING",
                },
            ],
            { session }
        );

        const bookingDoc = booking[0];

        // Build aggregation pipeline for finding eligible porters
        const matchQuery = {
            porterType: "individual",
            status: "active",
            isVerified: true,
            canAcceptBooking: true,
            currentStatus: "online",
            maxWeightKg: { $gte: weightKg },
        };

        // Find eligible porters within radius using geospatial query
        const porters = await Porters.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [pickup.lng, pickup.lat],
                    },
                    maxDistance: radiusKm * 1000, // Convert km to meters
                    distanceField: "distanceMeters",
                    spherical: true,
                    query: matchQuery,
                },
            },
            {
                $lookup: {
                    from: "portervehicles",
                    localField: "registrationId",
                    foreignField: "registrationId",
                    as: "vehicle",
                },
            },
            { $unwind: { path: "$vehicle", preserveNullAndEmptyArrays: true } },
            // Filter by vehicle requirements if specified
            ...(hasVehicle
                ? [
                    {
                        $match: {
                            "vehicle.hasVehicle": true,
                            "vehicle.vehicleCategory": vehicleType,
                        },
                    },
                ]
                : []),
            { $sort: { distanceMeters: 1 } },
            { $limit: 5 },
        ]);

        // If no porters found
        if (!porters.length) {
            await session.abortTransaction();
            session.endSession();

            return res.status(404).json({
                success: false,
                message: `No individual porters available within ${radiusKm} km`,
            });
        }

        // Create porter requests
        const porterRequests = porters.map((porter) => ({
            bookingId: bookingDoc._id,
            porterId: porter._id,
            distanceKm: Number((porter.distanceMeters / 1000).toFixed(2)),
            notificationType: "DIRECT",
            isTeamLead: false,
            status: "PENDING",
        }));

        await BookingPorterRequest.insertMany(porterRequests, { session });

        // Update booking status
        bookingDoc.status = "WAITING_PORTER";
        await bookingDoc.save({ session });

        await session.commitTransaction();
        session.endSession();

        // Send notifications to porters (async, don't wait)
        const porterIds = porters.map((p) => p._id);
        const distances = porters.map((p) =>
            Number((p.distanceMeters / 1000).toFixed(2))
        );
        notifyMultiplePorters(porterIds, bookingDoc, distances).catch((err) =>
            console.error("Notification error:", err)
        );

        // Notify user
        notifyUser(userId, bookingDoc, "BOOKING_CREATED").catch((err) =>
            console.error("User notification error:", err)
        );

        return res.status(201).json({
            success: true,
            message: "Booking created, searching for nearby porters",
            bookingId: bookingDoc._id,
            portersNotified: porters.length,
            data: {
                booking: bookingDoc,
                nearbyPorters: porters.map((p) => ({
                    id: p._id,
                    distance: Number((p.distanceMeters / 1000).toFixed(2)),
                })),
            },
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error("Error creating individual booking:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create booking",
            error: error.message,
        });
    }
};

/**
 * Porter accepts individual booking
 * POST /api/bookings/individual/:id/accept
 */
export const porterAcceptBooking = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const bookingId = req.params.id;
        const porterId = req.user.porterId; // Assuming porter ID is in user object

        if (!porterId) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({
                success: false,
                message: "Only porters can accept bookings",
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

        // Check if booking is still available
        if (booking.status !== "WAITING_PORTER") {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: "Booking is no longer available",
            });
        }

        // Find the porter request
        const porterRequest = await BookingPorterRequest.findOne({
            bookingId,
            porterId,
        }).session(session);

        if (!porterRequest) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: "Porter request not found",
            });
        }

        // Update porter request
        porterRequest.status = "ACCEPTED";
        porterRequest.respondedAt = new Date();
        await porterRequest.save({ session });

        // Update booking
        booking.status = "CONFIRMED";
        booking.assignedPorterId = porterId;
        await booking.save({ session });

        // Reject all other pending requests
        await BookingPorterRequest.updateMany(
            {
                bookingId,
                porterId: { $ne: porterId },
                status: "PENDING",
            },
            {
                status: "EXPIRED",
                respondedAt: new Date(),
            },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        // Notify user
        notifyUser(booking.userId, booking, "BOOKING_ACCEPTED").catch((err) =>
            console.error("User notification error:", err)
        );

        return res.status(200).json({
            success: true,
            message: "Booking accepted successfully",
            data: { booking },
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error("Error accepting booking:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to accept booking",
            error: error.message,
        });
    }
};

/**
 * Porter rejects individual booking
 * POST /api/bookings/individual/:id/reject
 */
export const porterRejectBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const porterId = req.user.porterId;

        if (!porterId) {
            return res.status(403).json({
                success: false,
                message: "Only porters can reject bookings",
            });
        }

        // Find the porter request
        const porterRequest = await BookingPorterRequest.findOne({
            bookingId,
            porterId,
        });

        if (!porterRequest) {
            return res.status(404).json({
                success: false,
                message: "Porter request not found",
            });
        }

        // Update porter request
        porterRequest.status = "REJECTED";
        porterRequest.respondedAt = new Date();
        await porterRequest.save();

        // Check if there are any pending requests left
        const pendingRequests = await BookingPorterRequest.countDocuments({
            bookingId,
            status: "PENDING",
        });

        // If no pending requests, update booking status
        if (pendingRequests === 0) {
            const booking = await PorterBooking.findById(bookingId);
            if (booking && booking.status === "WAITING_PORTER") {
                booking.status = "CANCELLED";
                booking.cancellationReason = "No porters available";
                await booking.save();

                // Notify user
                notifyUser(
                    booking.userId,
                    booking,
                    "BOOKING_CANCELLED",
                    "No porters accepted your booking. Please try again."
                ).catch((err) => console.error("User notification error:", err));
            }
        }

        return res.status(200).json({
            success: true,
            message: "Booking rejected",
            pendingRequests,
        });
    } catch (error) {
        console.error("Error rejecting booking:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to reject booking",
            error: error.message,
        });
    }
};

/**
 * Complete individual booking
 * POST /api/bookings/individual/:id/complete
 */
export const completeBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const porterId = req.user.porterId;

        // Find booking
        const booking = await PorterBooking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Verify porter is assigned to this booking
        if (booking.assignedPorterId.toString() !== porterId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not assigned to this booking",
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
            message: "Booking completed successfully",
            data: { booking },
        });
    } catch (error) {
        console.error("Error completing booking:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to complete booking",
            error: error.message,
        });
    }
};
