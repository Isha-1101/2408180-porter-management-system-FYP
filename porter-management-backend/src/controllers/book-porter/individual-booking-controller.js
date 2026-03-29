import mongoose from "mongoose";
import PorterBooking from "../../models/PorterBooking.js";
import Porters from "../../models/porter/Porters.js";
import BookingPorterRequest from "../../models/BookintgPorterRequest.js";
import { getIO } from "../../utils/socketInstance.js";
import sseService from "../../utils/sse-service.js";
import {
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
      weightKg = 100,
      hasVehicle,
      vehicleType,
      radiusKm = 5,
    } = req.body;

    const userId = req.user.id;

    // Validate required fields
    if (!pickup || !drop) {
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
          status: "WAITING_PORTER",
        },
      ],
      { session },
    );

    const bookingDoc = booking[0];

    // Find nearby porters with $geoNear (was broken: model class was being .map()-ed directly)
    const nearbyPorters = await Porters.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [pickup.lng, pickup.lat] },
          maxDistance: radiusKm * 1000,
          distanceField: "distanceMeters",
          spherical: true,
          query: {
            status: "active",
            isVerified: true,
            canAcceptBooking: true,
            currentStatus: "online",
          },
        },
      },
      { $limit: 10 },
    ]);

    if (nearbyPorters.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "No porters available nearby. Please try again later.",
      });
    }

    // Create a BookingPorterRequest for each nearby porter
    const porterRequests = nearbyPorters.map((porter) => ({
      bookingId: bookingDoc._id,
      porterId: porter._id,
      distanceKm: Number((porter.distanceMeters / 1000).toFixed(2)),
      notificationType: "DIRECT",
      isTeamLead: false,
      status: "PENDING",
    }));

    await BookingPorterRequest.insertMany(porterRequests, { session });

    await session.commitTransaction();
    session.endSession();

    // Emit live socket booking-request events to each porter's room
    try {
      const io = getIO();
      nearbyPorters.forEach((porter) => {
        io.to(`porter:${porter._id.toString()}`).emit("booking-request", {
          bookingId: bookingDoc._id,
          pickup: bookingDoc.pickup,
          drop: bookingDoc.drop,
          weightKg: bookingDoc.weightKg,
          hasVehicle: bookingDoc.hasVehicle,
          vehicleType: bookingDoc.vehicleType,
          distanceKm: Number((porter.distanceMeters / 1000).toFixed(2)),
          createdAt: bookingDoc.createdAt,
        });
      });
    } catch (socketErr) {
      console.error("Socket emit error:", socketErr.message);
    }

    // Push notifications (fire-and-forget)
    const porterIds = nearbyPorters.map((p) => p._id);
    const distances = nearbyPorters.map((p) =>
      Number((p.distanceMeters / 1000).toFixed(2)),
    );
    notifyMultiplePorters(porterIds, bookingDoc, distances).catch((err) =>
      console.error("Notification error:", err),
    );
    notifyUser(userId, bookingDoc, "BOOKING_CREATED").catch((err) =>
      console.error("User notification error:", err),
    );

    return res.status(201).json({
      success: true,
      message: "Booking created, notifying nearby porters",
      bookingId: bookingDoc._id,
      portersNotified: nearbyPorters.length,
      data: { booking: bookingDoc },
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
    const porterId = req.user.porterId;

    if (!porterId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: "Only porters can accept bookings",
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

    if (booking.status !== "WAITING_PORTER") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Booking is no longer available",
      });
    }

    const porterRequest = await BookingPorterRequest.findOne({
      bookingId,
      porterId,
    }).session(session);

    if (!porterRequest) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Porter request not found" });
    }

    porterRequest.status = "ACCEPTED";
    porterRequest.respondedAt = new Date();
    await porterRequest.save({ session });

    booking.status = "CONFIRMED";
    booking.assignedPorterId = porterId;
    await booking.save({ session });

    //porter stauts
    await Porters.findByIdAndUpdate(
      porterId,
      { currentStatus: "busy", canAcceptBooking: false },
      { session },
    );

    // Expire all other pending requests for this booking
    await BookingPorterRequest.updateMany(
      { bookingId, porterId: { $ne: porterId }, status: "PENDING" },
      { status: "EXPIRED", respondedAt: new Date() },
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    // Notify user via socket that booking is confirmed
    try {
      const io = getIO();
      io.emit("booking-confirmed", {
        bookingId: booking._id,
        porterId,
        status: "CONFIRMED",
      });
    } catch (socketErr) {
      console.error("Socket emit error:", socketErr.message);
    }

    // Notify user via SSE (real-time tracking page update)
    sseService.sendToUser(booking.userId, "booking-status-update", {
      bookingId: booking._id,
      status: "CONFIRMED",
      message: "A porter has accepted your booking!",
    });

    notifyUser(booking.userId, booking, "BOOKING_ACCEPTED").catch((err) =>
      console.error("User notification error:", err),
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

    const porterRequest = await BookingPorterRequest.findOne({
      bookingId,
      porterId,
    });

    if (!porterRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Porter request not found" });
    }

    porterRequest.status = "REJECTED";
    porterRequest.respondedAt = new Date();
    await porterRequest.save();

    const pendingRequests = await BookingPorterRequest.countDocuments({
      bookingId,
      status: "PENDING",
    });

    if (pendingRequests === 0) {
      const booking = await PorterBooking.findById(bookingId);
      if (booking && booking.status === "WAITING_PORTER") {
        booking.status = "CANCELLED";
        booking.cancellationReason = "No porters accepted";
        await booking.save();
        notifyUser(
          booking.userId,
          booking,
          "BOOKING_CANCELLED",
          "No porters accepted your booking. Please try again.",
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

    const booking = await PorterBooking.findById(bookingId);

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (booking.assignedPorterId.toString() !== porterId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this booking",
      });
    }

    booking.status = "COMPLETED";
    booking.completedAt = new Date();
    await booking.save();

    // Notify user
    notifyUser(booking.userId, booking, "BOOKING_COMPLETED").catch((err) =>
      console.error("User notification error:", err),
    );

    // Reset porter status to available
    await Porters.findByIdAndUpdate(porterId, {
      currentStatus: "online",
      canAcceptBooking: true,
    });

    // Socket event
    try {
      const io = getIO();
      // Notify user via SSE/Socket for live tracking update
      const sseService = await import("../../utils/sse-service.js").then(m => m.default);
      sseService.sendToUser(booking.userId, "booking-status-update", {
        bookingId: booking._id,
        status: "COMPLETED",
        message: "Your booking has been completed!",
      });

      io.emit("booking-completed", {
        bookingId: booking._id,
        status: "COMPLETED",
      });
    } catch (socketErr) {
      console.error("Socket emit error:", socketErr.message);
    }

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

/**
 * Porter starts individual booking journey
 * POST /api/bookings/individual/:id/start
 */
export const startBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const porterId = req.user.porterId;

    const booking = await PorterBooking.findById(bookingId);

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (
      !booking.assignedPorterId ||
      booking.assignedPorterId.toString() !== porterId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this booking",
      });
    }

    if (booking.status !== "CONFIRMED") {
      return res.status(400).json({
        success: false,
        message: "Booking must be CONFIRMED before starting",
      });
    }

    booking.status = "IN_PROGRESS";
    await booking.save();

    // Notify user via socket
    try {
      const io = getIO();
      io.emit("booking-in-progress", {
        bookingId: booking._id,
        porterId,
        status: "IN_PROGRESS",
      });
    } catch (socketErr) {
      console.error("Socket emit error:", socketErr.message);
    }

    // Notify user via SSE (real-time tracking page update)
    sseService.sendToUser(booking.userId, "booking-status-update", {
      bookingId: booking._id,
      status: "IN_PROGRESS",
      message: "Your porter has started the journey!",
    });

    return res.status(200).json({
      success: true,
      message: "Journey started",
      data: { booking },
    });
  } catch (error) {
    console.error("Error starting booking:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to start booking",
      error: error.message,
    });
  }
};
