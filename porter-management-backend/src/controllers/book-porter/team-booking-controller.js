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
      purpose_of_booking,
      noOfFloors,
      hasLift,
      no_of_trips,
    } = req.body;
    const userId = req.user.id;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!pickup || !drop || !teamSize) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Pickup location, drop location, and team size are required",
      });
    }

    if (!pickup.lat || !pickup.lng) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Pickup latitude and longitude are required",
      });
    }

    if (!drop.lat || !drop.lng) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Drop-off latitude and longitude are required",
      });
    }

    if (teamSize < 1) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Team size must be at least 1",
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
          purpose_of_booking: purpose_of_booking || "transportation",
          noOfFloors: noOfFloors || null,
          hasLift: hasLift || false,
          no_of_trips: no_of_trips || null,
          status: "SEARCHING",
        },
      ],
      { session },
    );

    // Use noOfAvailableMember instead of counting manually
    const eligibleTeams = await PorterTeam.find({
      isActive: true,
      noOfAvailableMember: { $gte: teamSize },
    }).session(session);

    if (!eligibleTeams.length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: `No teams found with at least ${teamSize} available members`,
      });
    }

    // ── Build date range for conflict check (same calendar day) ──────────────
    let bookingDayStart = null;
    let bookingDayEnd = null;
    if (bookingDate) {
      const d = new Date(bookingDate);
      bookingDayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      bookingDayEnd   = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
    }

    const teamLeadsToNotify = [];

    for (const team of eligibleTeams) {
      // ── Skip teams that already have a booking confirmed on the same day ──
      if (bookingDayStart && bookingDayEnd) {
        const conflictingBooking = await PorterBooking.findOne({
          assignedTeamId: team._id,
          status: { $in: ["CONFIRMED", "WAITING_PORTER_RESPONSE", "IN_PROGRESS"] },
          bookingDate: { $gte: bookingDayStart, $lte: bookingDayEnd },
        }).session(session);

        if (conflictingBooking) {
          console.log(
            `Team ${team._id} already has a booking on ${bookingDate}. Skipping.`,
          );
          continue;
        }
      }

      const availableWorkerCount = await Porters.countDocuments({
        teamId: team._id,
        role: "worker",
        status: "active",
        isVerified: true,
        canAcceptBooking: true,
        assigned_status: "not_assigned",
      }).session(session);

      // Skip if not enough free workers
      if (availableWorkerCount < teamSize) {
        console.warn(
          `Team ${team._id} has noOfAvailableMember=${team.noOfAvailableMember} but actual count is ${availableWorkerCount}. Skipping.`,
        );
        continue;
      }

      // Find the team lead (owner) — must be active & verified
      const teamLead = await Porters.findOne({
        teamId: team._id,
        role: "owner",
        status: "active",
        isVerified: true,
        // Team owner's canAcceptBooking may be false (owners manage rather than carry)
      })
        .populate("userId")
        .session(session);

      if (!teamLead || !teamLead.userId) {
        console.warn(`Team ${team._id} has no valid team lead. Skipping.`);
        continue;
      }

      // Skip busy team owners (already on a job that day)
      if (teamLead.currentStatus === "busy") {
        console.warn(`Team lead ${teamLead._id} is busy. Skipping.`);
        continue;
      }

      // Calculate distance from team lead to pickup
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

      teamLeadsToNotify.push({
        teamLead,
        teamId: team._id,
        distance,
        memberCount: availableWorkerCount,
      });
    }

    if (!teamLeadsToNotify.length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: `No available team leads found for the requested date and team size`,
      });
    }

    // ── Create porter requests for ALL eligible team leads ───────────────
    const porterRequests = teamLeadsToNotify.map((item) => ({
      bookingId: bookingDoc._id,
      porterId: item.teamLead._id,
      teamId: item.teamId,
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

    // ── Fire SSE notifications to EACH team lead (async, non-blocking) ──
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
        hasVehicle: bookingDoc.hasVehicle,
        vehicleType: bookingDoc.vehicleType,
        numberOfVehicles: bookingDoc.numberOfVehicles,
        purpose_of_booking: bookingDoc.purpose_of_booking,
        noOfFloors: bookingDoc.noOfFloors,
        hasLift: bookingDoc.hasLift,
        no_of_trips: bookingDoc.no_of_trips,
        distance: item.distance,
        memberCount: item.memberCount,
        notificationType: "TEAM_LEAD",
        isTeamLead: true,
      };

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
      return res.status(400).json({
        success: false,
        message: "Booking is no longer available. Another team owner may have already accepted it.",
      });
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
      canAcceptBooking: true,
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
        isTeamMember: true,
        weight: booking.weightKg,
        teamSize: booking.teamSize,
        pickup: booking.pickup,
        drop: booking.drop,
        requirements: booking.requirements,
        bookingDate: booking.bookingDate,
        bookingTime: booking.bookingTime,
        hasVehicle: booking.hasVehicle,
        vehicleType: booking.vehicleType,
        numberOfVehicles: booking.numberOfVehicles,
        purpose_of_booking: booking.purpose_of_booking,
        noOfFloors: booking.noOfFloors,
        hasLift: booking.hasLift,
        no_of_trips: booking.no_of_trips,
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

    // ── Mark all accepted porters as BUSY (cannot receive new requests)
    const acceptedPorterIds = acceptedPorters.map((p) => p.porterId);
    await Porters.updateMany(
      { _id: { $in: acceptedPorterIds } },
      { canAcceptBooking: false, assigned_status: "assigned", currentStatus: "busy" },
    );

    // ── Mark team lead (owner) as busy too
    await Porters.findByIdAndUpdate(teamLeadPorterId, {
      currentStatus: "busy",
    });

    // ── Notify user via SSE + in-app notification
    const userId = booking.userId;
    // Send the SSE status-update event so TeamBookingTracking updates live
    sseService.sendToUser(userId, "booking-status-update", {
      bookingId: booking._id,
      status: "CONFIRMED",
      message: "Your team booking has been confirmed!",
    });

    // Also persist the in-app notification
    notifyUser(userId, booking, "BOOKING_CONFIRMED").catch((err) =>
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

    // ── Free up all assigned porters (they can accept new bookings again)
    const assignedPorterIds = booking.assignedPorters.map((p) => p.porterId);
    if (assignedPorterIds.length > 0) {
      await Porters.updateMany(
        { _id: { $in: assignedPorterIds } },
        { canAcceptBooking: true, assigned_status: "not_assigned", currentStatus: "online" },
      );
    }

    // ── Also free up the team lead
    const teamLeadPorter = await Porters.findOne({
      teamId: booking.assignedTeamId,
      role: "owner",
    });
    if (teamLeadPorter) {
      await Porters.findByIdAndUpdate(teamLeadPorter._id, {
        currentStatus: "online",
      });
    }

    // ── Notify user: SSE status-update + in-app notification
    const userId = booking.userId;
    sseService.sendToUser(userId, "booking-status-update", {
      bookingId: booking._id,
      status: "COMPLETED",
      message: "Your team booking has been completed!",
    });

    notifyUser(userId, booking, "BOOKING_COMPLETED").catch((err) =>
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
