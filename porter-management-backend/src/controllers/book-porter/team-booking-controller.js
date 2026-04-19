import mongoose from "mongoose";
import PorterBooking from "../../models/PorterBooking.js";
import Porters from "../../models/porter/Porters.js";
import PorterTeam from "../../models/porter/porterTeam.js";
import TeamBookingSelection from "../../models/TeamBookingSelection.js";
import User from "../../models/User.js";
import { getIO } from "../../utils/socketInstance.js";
import { notifyUser } from "../../utils/notification-service.js";

export const createTeamBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      pickup,
      drop,
      weightKg,
      portersRequired,
      workDescription,
      hasVehicle,
      vehicleType,
      bookingDate,
      bookingTime,
    } = req.body;
    const userId = req.user.id;

    if (!pickup || !drop || !portersRequired) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Pickup, drop, and porters required are mandatory",
      });
    }

    if (!pickup.lat || !pickup.lng || !drop.lat || !drop.lng) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Pickup and drop coordinates are required",
      });
    }

    if (portersRequired < 1) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Porters required must be at least 1",
      });
    }

    const eligibleTeams = await PorterTeam.find({
      isActive: true,
      noOfMember: { $gte: portersRequired },
    })
      .populate("ownerId", "name email phone")
      .session(session);

    if (!eligibleTeams.length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: `No teams found with at least ${portersRequired} members`,
      });
    }

    const [bookingDoc] = await PorterBooking.create(
      [
        {
          userId,
          bookingType: "team",
          pickup,
          drop,
          weightKg,
          teamSize: portersRequired,
          workDescription: workDescription || null,
          bookingDate: bookingDate ? new Date(bookingDate) : null,
          bookingTime: bookingTime || null,
          hasVehicle: hasVehicle || false,
          vehicleType: hasVehicle ? vehicleType : null,
          status: "PENDING_TEAM_REVIEW",
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    const io = getIO();

    for (const team of eligibleTeams) {
      const teamLeadPorter = await Porters.findOne({
        userId: team.ownerId._id,
        role: "owner",
      });

      if (!teamLeadPorter) continue;

      const notificationPayload = {
        bookingId: bookingDoc._id,
        bookingType: "team",
        weight: bookingDoc.weightKg,
        portersRequired: bookingDoc.teamSize,
        pickup: bookingDoc.pickup,
        drop: bookingDoc.drop,
        workDescription: bookingDoc.workDescription,
        bookingDate: bookingDoc.bookingDate,
        bookingTime: bookingDoc.bookingTime,
        hasVehicle: bookingDoc.hasVehicle,
        vehicleType: bookingDoc.vehicleType,
        teamId: team._id,
        teamName: `Team of ${team.ownerId.name}`,
      };

      io.to(`porter:${teamLeadPorter._id}`).emit(
        "team-booking-request",
        notificationPayload,
      );
    }

    notifyUser(userId, bookingDoc, "BOOKING_CREATED").catch((err) =>
      console.error("User notification error:", err),
    );

    return res.status(201).json({
      success: true,
      message: "Team booking request created, notifying eligible teams",
      bookingId: bookingDoc._id,
      teamsNotified: eligibleTeams.length,
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

export const teamOwnerReviewBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const bookingId = req.params.id;
    const { action } = req.body;
    const porterId = req.user.porterId;

    if (!porterId) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(403)
        .json({ success: false, message: "Porter not found for this user" });
    }

    const teamLead = await Porters.findById(porterId).session(session);
    if (!teamLead || teamLead.role !== "owner") {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: "Only team owners can review team bookings",
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

    if (booking.status !== "PENDING_TEAM_REVIEW") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Booking is no longer pending review",
      });
    }

    const io = getIO();

    if (action === "decline") {
      booking.status = "DECLINED";
      await booking.save({ session });

      await session.commitTransaction();
      session.endSession();

      io.to(`user:${booking.userId.toString()}`).emit("team-booking-declined", {
        bookingId: booking._id,
        status: "DECLINED",
        message: "A team has declined your booking request",
      });

      notifyUser(booking.userId, booking, "BOOKING_REJECTED").catch((err) =>
        console.error("User notification error:", err),
      );

      return res.status(200).json({
        success: true,
        message: "Booking declined",
        data: { booking },
      });
    }

    if (action === "forward") {
      // Find all active workers in this team.
      // NOTE: canAcceptBooking / isVerified apply to individual porters,
      // NOT team workers — team members are managed by the owner directly.
      const teamWorkers = await Porters.find({
        teamId: teamLead.teamId,
        role: "worker",
        status: { $in: ["active", "approved", "pending"] },
      })
        .populate("userId", "name email phone")
        .session(session);

      if (!teamWorkers.length) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message:
            "No workers found in your team. Add team members first before forwarding a booking.",
        });
      }

      booking.status = "PENDING_MEMBER_RESPONSE";
      booking.assignedTeamId = teamLead.teamId;
      booking.forwardedAt = new Date();
      booking.memberResponses = teamWorkers.map((w) => ({
        porterId: w._id,
        response: "PENDING",
      }));
      await booking.save({ session });

      const [selection] = await TeamBookingSelection.create(
        [
          {
            bookingId,
            teamId: teamLead.teamId,
            teamLeadId: teamLead.userId,
            selectedPorters: teamWorkers.map((w) => ({
              porterId: w._id,
              status: "PENDING",
            })),
          },
        ],
        { session },
      );

      await session.commitTransaction();
      session.endSession();

      for (const worker of teamWorkers) {
        const payload = {
          bookingId: booking._id,
          bookingType: "team",
          weight: booking.weightKg,
          portersRequired: booking.teamSize,
          pickup: booking.pickup,
          drop: booking.drop,
          workDescription: booking.workDescription,
          bookingDate: booking.bookingDate,
          bookingTime: booking.bookingTime,
          hasVehicle: booking.hasVehicle,
          vehicleType: booking.vehicleType,
          teamLeadName: teamLead.userId?.name || "Team Lead",
        };
        io.to(`porter:${worker._id}`).emit(
          "team-booking-forwarded",
          payload,
        );
      }

      return res.status(200).json({
        success: true,
        message: "Booking forwarded to team members",
        data: { booking, selection, workersNotified: teamWorkers.length },
      });
    }

    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({
      success: false,
      message: "Invalid action. Use 'forward' or 'decline'",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in team owner review:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process booking review",
      error: error.message,
    });
  }
};

export const teamMemberRespondToBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { response } = req.body;
    const currentPorterId = req.user.porterId;

    if (!response || !["ACCEPTED", "DECLINED"].includes(response)) {
      return res.status(400).json({
        success: false,
        message: "Response must be 'ACCEPTED' or 'DECLINED'",
      });
    }

    const booking = await PorterBooking.findById(bookingId);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "PENDING_MEMBER_RESPONSE") {
      return res.status(400).json({
        success: false,
        message: "Booking is not awaiting member responses",
      });
    }

    const memberResponse = booking.memberResponses.find(
      (r) => r.porterId.toString() === currentPorterId.toString(),
    );

    if (!memberResponse) {
      return res.status(404).json({
        success: false,
        message: "You are not part of this team booking",
      });
    }

    if (memberResponse.response !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "You have already responded to this booking",
      });
    }

    memberResponse.response = response;
    memberResponse.respondedAt = new Date();
    await booking.save();

    await TeamBookingSelection.updateOne(
      { bookingId, "selectedPorters.porterId": currentPorterId },
      {
        $set: {
          "selectedPorters.$.status": response === "ACCEPTED" ? "ACCEPTED" : "REJECTED",
          "selectedPorters.$.respondedAt": new Date(),
        },
      },
    );

    const acceptedCount = booking.memberResponses.filter(
      (r) => r.response === "ACCEPTED",
    ).length;
    const requiredCount = booking.teamSize;
    const allResponded = booking.memberResponses.every(
      (r) => r.response !== "PENDING",
    );

    const io = getIO();
    const teamLeadPorter = await Porters.findOne({
      teamId: booking.assignedTeamId,
      role: "owner",
    });

    if (teamLeadPorter) {
      io.to(`porter:${teamLeadPorter._id}`).emit("team-member-responded", {
        bookingId: booking._id,
        porterId: currentPorterId,
        response,
        acceptedCount,
        requiredCount,
        allResponded,
      });
    }

    if (acceptedCount >= requiredCount && booking.status === "PENDING_MEMBER_RESPONSE") {
      booking.status = "AWAITING_OWNER_CONFIRMATION";
      await booking.save();

      if (teamLeadPorter) {
        io.to(`porter:${teamLeadPorter._id}`).emit(
          "team-quorum-reached",
          {
            bookingId: booking._id,
            acceptedCount,
            requiredCount,
            message: "Enough members have accepted. Ready for your confirmation.",
          },
        );
      }
    }

    const pendingCount = booking.memberResponses.filter(
      (r) => r.response === "PENDING",
    ).length;
    const declinedCount = booking.memberResponses.filter(
      (r) => r.response === "DECLINED",
    ).length;

    return res.status(200).json({
      success: true,
      message: `Response recorded: ${response}`,
      data: {
        acceptedCount,
        declinedCount,
        pendingCount,
        requiredCount,
        allResponded,
        quorumReached: acceptedCount >= requiredCount,
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

export const teamOwnerConfirmBooking = async (req, res) => {
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

    const teamLead = await Porters.findById(porterId).session(session);
    if (!teamLead || teamLead.role !== "owner") {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: "Only team owners can confirm team bookings",
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

    if (booking.status !== "AWAITING_OWNER_CONFIRMATION") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Booking is not awaiting owner confirmation",
      });
    }

    const acceptedPorters = booking.memberResponses.filter(
      (r) => r.response === "ACCEPTED",
    );

    if (acceptedPorters.length < booking.teamSize) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Not enough porters accepted. Need ${booking.teamSize}, got ${acceptedPorters.length}`,
      });
    }

    booking.status = "CONFIRMED";
    booking.ownerConfirmedAt = new Date();
    booking.assignedPorters = acceptedPorters.map((p) => ({
      porterId: p.porterId,
      status: "ASSIGNED",
    }));
    await booking.save({ session });

    const acceptedPorterIds = acceptedPorters.map((p) => p.porterId);
    await Porters.updateMany(
      { _id: { $in: acceptedPorterIds } },
      { canAcceptBooking: false, assigned_status: "assigned", currentStatus: "busy" },
      { session },
    );

    await Porters.findByIdAndUpdate(porterId, {
      currentStatus: "busy",
    }, { session });

    await PorterTeam.findByIdAndUpdate(booking.assignedTeamId, {
      $inc: { totalActiveJobs: 1 },
    }, { session });

    await session.commitTransaction();
    session.endSession();

    const io = getIO();
    const userId = booking.userId;

    const assignedPorterDetails = await Porters.find({
      _id: { $in: acceptedPorterIds },
    }).populate("userId", "name email phone");

    io.to(`user:${userId.toString()}`).emit("team-booking-confirmed", {
      bookingId: booking._id,
      status: "CONFIRMED",
      assignedPorters: assignedPorterDetails.map((p) => ({
        name: p.userId?.name,
        phone: p.userId?.phone,
      })),
      message: "Your team booking has been confirmed!",
    });

    for (const workerPorter of assignedPorterDetails) {
      io.to(`porter:${workerPorter._id}`).emit("team-booking-confirmed", {
        bookingId: booking._id,
        status: "CONFIRMED",
        message: "The booking has been confirmed by the team lead.",
      });
    }

    notifyUser(userId, booking, "BOOKING_CONFIRMED").catch((err) =>
      console.error("User notification error:", err),
    );

    return res.status(200).json({
      success: true,
      message: "Booking confirmed successfully",
      data: {
        booking,
        assignedPorters: assignedPorterDetails.map((p) => ({
          id: p._id,
          name: p.userId?.name,
          phone: p.userId?.phone,
        })),
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

export const teamOwnerCancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const porterId = req.user.porterId;

    if (!porterId) {
      return res
        .status(403)
        .json({ success: false, message: "Porter not found for this user" });
    }

    const teamLead = await Porters.findById(porterId);
    if (!teamLead || teamLead.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Only team owners can cancel team bookings",
      });
    }

    const booking = await PorterBooking.findById(bookingId);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (!["PENDING_MEMBER_RESPONSE", "AWAITING_OWNER_CONFIRMATION"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: "Booking cannot be cancelled at this stage",
      });
    }

    booking.status = "CANCELLED";
    booking.cancellationReason = "Cancelled by team owner";
    await booking.save();

    const io = getIO();
    io.to(`user:${booking.userId.toString()}`).emit("team-booking-cancelled", {
      bookingId: booking._id,
      status: "CANCELLED",
      message: "The team has cancelled your booking request",
    });

    notifyUser(booking.userId, booking, "BOOKING_CANCELLED").catch((err) =>
      console.error("User notification error:", err),
    );

    return res.status(200).json({
      success: true,
      message: "Booking cancelled",
      data: { booking },
    });
  } catch (error) {
    console.error("Error cancelling team booking:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
      error: error.message,
    });
  }
};

export const startTeamBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const porterId = req.user.porterId;

    const teamLead = await Porters.findById(porterId);
    if (!teamLead || teamLead.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Only team owners can start team bookings",
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

    if (booking.status !== "CONFIRMED") {
      return res.status(400).json({
        success: false,
        message: "Booking must be CONFIRMED before starting the job",
      });
    }

    booking.status = "IN_PROGRESS";
    booking.startedAt = new Date();
    await booking.save();

    const io = getIO();
    const userId = booking.userId;

    io.to(`user:${userId.toString()}`).emit("team-booking-started", {
      bookingId: booking._id,
      status: "IN_PROGRESS",
      message: "Your team has started the job!",
    });

    for (const assignedPorter of booking.assignedPorters) {
      io.to(`porter:${assignedPorter.porterId.toString()}`).emit("team-booking-started", {
        bookingId: booking._id,
        status: "IN_PROGRESS",
        message: "The team lead has started the job!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Team booking started successfully",
      data: { booking },
    });
  } catch (error) {
    console.error("Error starting team booking:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to start team booking",
      error: error.message,
    });
  }
};

export const teamOwnerMarkComplete = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const porterId = req.user.porterId;

    const teamLead = await Porters.findById(porterId);
    if (!teamLead || teamLead.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Only team owners can mark team bookings as complete",
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

    if (booking.status !== "IN_PROGRESS") {
      return res.status(400).json({
        success: false,
        message: "Booking must be in progress to mark as complete",
      });
    }

    booking.status = "COMPLETED";
    booking.completedAt = new Date();
    await booking.save();

    const assignedPorterIds = booking.assignedPorters.map((p) => p.porterId);
    if (assignedPorterIds.length > 0) {
      await Porters.updateMany(
        { _id: { $in: assignedPorterIds } },
        { canAcceptBooking: true, assigned_status: "not_assigned", currentStatus: "online" },
      );
    }

    await Porters.findByIdAndUpdate(porterId, {
      currentStatus: "online",
    });

    await PorterTeam.findByIdAndUpdate(booking.assignedTeamId, {
      $inc: { totalActiveJobs: -1, totalCompletedJobs: 1 },
    });

    const io = getIO();
    const userId = booking.userId;

    io.to(`user:${userId.toString()}`).emit("team-booking-completed", {
      bookingId: booking._id,
      status: "COMPLETED",
      message: "Your job has been marked as complete. Please proceed with payment.",
    });

    notifyUser(userId, booking, "BOOKING_COMPLETED").catch((err) =>
      console.error("User notification error:", err),
    );

    return res.status(200).json({
      success: true,
      message: "Team booking marked as complete",
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

export const getTeamBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await PorterBooking.findById(bookingId)
      .populate("userId", "name email phone")
      .populate("assignedTeamId", "noOfMember")
      .populate("assignedPorters.porterId", "userId")
      .populate({
        path: "assignedPorters.porterId",
        populate: { path: "userId", select: "name email phone" },
      });

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    const memberResponses = booking.memberResponses || [];
    const acceptedCount = memberResponses.filter(
      (r) => r.response === "ACCEPTED",
    ).length;
    const declinedCount = memberResponses.filter(
      (r) => r.response === "DECLINED",
    ).length;
    const pendingCount = memberResponses.filter(
      (r) => r.response === "PENDING",
    ).length;

    return res.status(200).json({
      success: true,
      data: {
        booking,
        memberStats: {
          acceptedCount,
          declinedCount,
          pendingCount,
          requiredCount: booking.teamSize,
          quorumReached: acceptedCount >= booking.teamSize,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching team booking status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch booking status",
      error: error.message,
    });
  }
};
