import mongoose from "mongoose";
import PorterBooking from "../../models/PorterBooking.js";
import Porters from "../../models/porter/Porters.js";
import PorterTeam from "../../models/porter/porterTeam.js";
import BookingPorterRequest from "../../models/BookintgPorterRequest.js";
import TeamBookingSelection from "../../models/TeamBookingSelection.js";
import User from "../../models/User.js";
import sseService from "../../utils/sse-service.js";
import { notifyUser } from "../../utils/notification-service.js";

// ─── Helpers ───────────────────────────────────────────────────────────────

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create team porter booking (pre-booking)
 * POST /api/bookings/team
 *
 * No radius / online-status filter — this is a pre-booking for a future date.
 * Notifies ALL active team owners whose teams have enough members.
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
    } = req.body;

    const userId = req.user.id;

    if (!pickup || !drop || !teamSize) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Pickup location, drop location, and team size are required",
      });
    }

    // Create booking
    const [bookingDoc] = await PorterBooking.create(
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
          status: "SEARCHING",
        },
      ],
      { session },
    );

    // Find ALL active teams that have enough members (no radius filter for pre-bookings)
    const activeTeams = await PorterTeam.find({ isActive: true }).session(
      session,
    );

    if (!activeTeams.length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "No active teams found in the system",
      });
    }

    const teamLeadsToNotify = [];

    for (const team of activeTeams) {
      // Count active verified workers in this team
      const memberCount = await Porters.countDocuments({
        teamId: team._id,
        role: "worker",
        status: "active",
        isVerified: true,
      }).session(session);

      if (memberCount < teamSize) continue;

      // Find the team lead (owner)
      const teamLead = await Porters.findOne({
        teamId: team._id,
        role: "owner",
        status: "active",
        isVerified: true,
      })
        .populate("userId")
        .session(session);

      if (!teamLead || !teamLead.userId) continue;

      // Calculate distance (informational only, not a filter)
      let distance = 0;
      if (
        teamLead.location?.coordinates?.[0] !== 0 ||
        teamLead.location?.coordinates?.[1] !== 0
      ) {
        distance = calculateDistance(
          teamLead.location.coordinates[1],
          teamLead.location.coordinates[0],
          pickup.lat,
          pickup.lng,
        );
      }

      teamLeadsToNotify.push({ teamLead, teamId: team._id, distance });
    }

    if (!teamLeadsToNotify.length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: `No teams found with at least ${teamSize} active verified members`,
      });
    }

    // Create porter requests for all matching team leads
    const porterRequests = teamLeadsToNotify.map((item) => ({
      bookingId: bookingDoc._id,
      porterId: item.teamLead._id,
      distanceKm: Number(item.distance.toFixed(2)),
      notificationType: "TEAM_LEAD",
      isTeamLead: true,
      status: "PENDING",
    }));

    await BookingPorterRequest.insertMany(porterRequests, { session });

    bookingDoc.status = "WAITING_TEAM_LEAD";
    await bookingDoc.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Fire SSE notifications to each team lead (async, non-blocking)
    for (const item of teamLeadsToNotify) {
      const { teamLead } = item;
      const notificationPayload = {
        bookingId: bookingDoc._id,
        bookingType: "team",
        weight: bookingDoc.weightKg,
        teamSize: bookingDoc.teamSize,
        pickup: bookingDoc.pickup,
        drop: bookingDoc.drop,
        requirements: bookingDoc.requirements,
        bookingDate: bookingDoc.bookingDate,
        bookingTime: bookingDoc.bookingTime,
        distance: item.distance,
        notificationType: "TEAM_LEAD",
        isTeamLead: true,
      };
      // SSE to porter stream (keyed by porter._id)
      sseService.sendToPorter(
        teamLead._id,
        "new-booking-request",
        notificationPayload,
      );
    }

    // Notify user
    notifyUser(userId, bookingDoc, "BOOKING_CREATED").catch((err) =>
      console.error("User notification error:", err),
    );

    return res.status(201).json({
      success: true,
      message: "Team pre-booking created, notifying team owners",
      bookingId: bookingDoc._id,
      teamLeadsNotified: teamLeadsToNotify.length,
      data: { booking: bookingDoc },
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
 * Team owner accepts booking — auto-selects ALL linked workers and notifies them
 * POST /api/bookings/team/:id/team-lead/accept
 */
export const teamLeadAcceptBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const bookingId = req.params.id;
    const porterId = req.user.porterId;

    if (!porterId) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(403)
        .json({ success: false, message: "Porter not found for this user" });
    }

    // Verify this is a team owner
    const teamLead = await Porters.findById(porterId)
      .populate("userId")
      .session(session);
    if (!teamLead || teamLead.role !== "owner") {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: "Only team owners can accept team bookings",
      });
    }

    const booking = await PorterBooking.findById(bookingId).session(session);
    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "WAITING_TEAM_LEAD") {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: "Booking is no longer available" });
    }

    // Verify this team lead has a pending request for this booking
    const porterRequest = await BookingPorterRequest.findOne({
      bookingId,
      porterId,
      isTeamLead: true,
      status: "PENDING",
    }).session(session);

    if (!porterRequest) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "No pending request found for this booking",
      });
    }

    // Accept this team lead's request
    porterRequest.status = "ACCEPTED";
    porterRequest.respondedAt = new Date();
    await porterRequest.save({ session });

    // Expire other team lead requests
    await BookingPorterRequest.updateMany(
      {
        bookingId,
        porterId: { $ne: porterId },
        isTeamLead: true,
        status: "PENDING",
      },
      { status: "EXPIRED", respondedAt: new Date() },
      { session },
    );

    // Get ALL active+verified workers in this team
    const teamWorkers = await Porters.find({
      teamId: teamLead.teamId,
      role: "worker",
      status: "active",
      isVerified: true,
    })
      .populate("userId", "name email phone")
      .session(session);

    if (!teamWorkers.length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "No active workers found in your team",
      });
    }

    // Create TeamBookingSelection with all workers set to PENDING
    const [selection] = await TeamBookingSelection.create(
      [
        {
          bookingId,
          teamId: teamLead.teamId,
          teamLeadId: teamLead.userId._id,
          selectedPorters: teamWorkers.map((w) => ({
            porterId: w._id,
            status: "PENDING",
          })),
        },
      ],
      { session },
    );

    // Update booking status
    booking.status = "WAITING_PORTER_RESPONSE";
    booking.assignedTeamId = teamLead.teamId;
    await booking.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Fire SSE + in-app notification to each worker (async)
    for (const worker of teamWorkers) {
      const payload = {
        bookingId: booking._id,
        notificationType: "PORTERS_SELECTED",
        bookingType: "team",
        weight: booking.weightKg,
        teamSize: booking.teamSize,
        pickup: booking.pickup,
        drop: booking.drop,
        requirements: booking.requirements,
        bookingDate: booking.bookingDate,
        bookingTime: booking.bookingTime,
        teamLeadName: teamLead.userId.name,
      };
      sseService.sendToPorter(worker._id, "new-booking-request", payload);
    }

    return res.status(200).json({
      success: true,
      message: "Booking accepted. All team workers have been notified.",
      data: {
        booking,
        selection,
        workersNotified: teamWorkers.length,
        requiredMembers: booking.teamSize,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in team lead accept:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to accept booking",
      error: error.message,
    });
  }
};

/**
 * Team member responds to their auto-selection
 * POST /api/bookings/team/:id/porter/:porterId/respond
 */
export const teamMemberRespond = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const porterId = req.params.porterId;
    const { accepted } = req.body;
    const currentPorterId = req.user.porterId;

    if (porterId !== currentPorterId.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "You can only respond for yourself" });
    }

    const selection = await TeamBookingSelection.findOne({ bookingId });
    if (!selection) {
      return res
        .status(404)
        .json({ success: false, message: "Team booking selection not found" });
    }

    const porterSelection = selection.selectedPorters.find(
      (p) => p.porterId.toString() === porterId,
    );

    if (!porterSelection) {
      return res.status(404).json({
        success: false,
        message: "You are not selected for this booking",
      });
    }

    if (porterSelection.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "You have already responded to this booking",
      });
    }

    porterSelection.status = accepted ? "ACCEPTED" : "REJECTED";
    porterSelection.respondedAt = new Date();
    await selection.save();

    // Notify team lead via SSE
    const porter = await Porters.findById(porterId).populate("userId");
    const teamLead = await User.findById(selection.teamLeadId);
    const teamLeadPorter = await Porters.findOne({
      userId: selection.teamLeadId,
    });

    if (teamLeadPorter) {
      sseService.sendToPorter(teamLeadPorter._id, "porter-responded", {
        bookingId,
        porterName: porter?.userId?.name || "A porter",
        accepted,
      });
    }

    const allResponded = selection.selectedPorters.every(
      (p) => p.status !== "PENDING",
    );
    const acceptedCount = selection.selectedPorters.filter(
      (p) => p.status === "ACCEPTED",
    ).length;
    const booking = await PorterBooking.findById(bookingId);

    return res.status(200).json({
      success: true,
      message: `Response recorded: ${accepted ? "Accepted" : "Rejected"}`,
      data: {
        selection,
        allResponded,
        acceptedCount,
        requiredMembers: booking?.teamSize,
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
 * Team lead confirms booking after enough workers accepted
 * POST /api/bookings/team/:id/team-lead/confirm
 */
export const teamLeadConfirm = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const bookingId = req.params.id;
    const teamLeadPorterId = req.user.porterId;

    const booking = await PorterBooking.findById(bookingId).session(session);
    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "WAITING_PORTER_RESPONSE") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Booking is not awaiting porter responses",
      });
    }

    const selection = await TeamBookingSelection.findOne({ bookingId }).session(
      session,
    );
    if (!selection) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Team booking selection not found" });
    }

    const acceptedPorters = selection.selectedPorters.filter(
      (p) => p.status === "ACCEPTED",
    );

    if (acceptedPorters.length < booking.teamSize) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Not enough porters accepted. Need ${booking.teamSize}, got ${acceptedPorters.length}`,
      });
    }

    selection.teamLeadConfirmed = true;
    selection.confirmedAt = new Date();
    await selection.save({ session });

    booking.status = "CONFIRMED";
    booking.assignedPorters = acceptedPorters.map((p) => ({
      porterId: p.porterId,
      status: "ASSIGNED",
    }));
    await booking.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Notify user via SSE + in-app
    notifyUser(booking.userId, booking, "BOOKING_CONFIRMED").catch((err) =>
      console.error("User notification error:", err),
    );

    return res.status(200).json({
      success: true,
      message: "Booking confirmed successfully",
      data: { booking, assignedPorters: acceptedPorters.length },
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

    const porterRequest = await BookingPorterRequest.findOne({
      bookingId,
      porterId,
      isTeamLead: true,
    });

    if (!porterRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Team lead request not found" });
    }

    porterRequest.status = "REJECTED";
    porterRequest.respondedAt = new Date();
    await porterRequest.save();

    const pendingRequests = await BookingPorterRequest.countDocuments({
      bookingId,
      isTeamLead: true,
      status: "PENDING",
    });

    if (pendingRequests === 0) {
      const booking = await PorterBooking.findById(bookingId);
      if (booking && booking.status === "WAITING_TEAM_LEAD") {
        booking.status = "CANCELLED";
        booking.cancellationReason = "No team owners accepted";
        await booking.save();
        notifyUser(
          booking.userId,
          booking,
          "BOOKING_CANCELLED",
          "No teams accepted your booking.",
        ).catch((err) => console.error("User notification error:", err));
      }
    }

    return res
      .status(200)
      .json({ success: true, message: "Booking rejected", pendingRequests });
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

    const teamLead = await Porters.findById(teamLeadPorterId);
    if (!teamLead || teamLead.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Only team owners can complete team bookings",
      });
    }

    const booking = await PorterBooking.findById(bookingId);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (booking.assignedTeamId?.toString() !== teamLead.teamId?.toString()) {
      return res.status(403).json({
        success: false,
        message: "Your team is not assigned to this booking",
      });
    }

    booking.status = "COMPLETED";
    booking.completedAt = new Date();
    await booking.save();

    notifyUser(booking.userId, booking, "BOOKING_COMPLETED").catch((err) =>
      console.error("User notification error:", err),
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

/**
 * Get team booking selection status (for team lead polling)
 * GET /api/bookings/team/:id/selection
 */
export const getTeamBookingSelection = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const selection = await TeamBookingSelection.findOne({ bookingId })
      .populate("selectedPorters.porterId", "userId maxWeightKg")
      .populate({
        path: "selectedPorters.porterId",
        populate: { path: "userId", select: "name email phone" },
      });

    if (!selection) {
      return res
        .status(404)
        .json({ success: false, message: "Selection not found" });
    }

    const booking = await PorterBooking.findById(bookingId);

    return res.status(200).json({
      success: true,
      data: {
        selection,
        acceptedCount: selection.selectedPorters.filter(
          (p) => p.status === "ACCEPTED",
        ).length,
        rejectedCount: selection.selectedPorters.filter(
          (p) => p.status === "REJECTED",
        ).length,
        pendingCount: selection.selectedPorters.filter(
          (p) => p.status === "PENDING",
        ).length,
        requiredMembers: booking?.teamSize || 0,
        canConfirm:
          selection.selectedPorters.filter((p) => p.status === "ACCEPTED")
            .length >= (booking?.teamSize || 0),
      },
    });
  } catch (error) {
    console.error("Error fetching selection:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch selection",
      error: error.message,
    });
  }
};
