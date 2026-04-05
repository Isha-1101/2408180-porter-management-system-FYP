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
 * Create individual porter booking and search nearby porters
 * POST /api/bookings/individual
 * Body: { pickup, drop, weightKg, hasVehicle, vehicleType, radiusKm, totalPrice, noOfFloors, hasLift, no_of_trips, purpose_of_booking }
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
      totalPrice = 0,
      noOfFloors,
      hasLift = false,
      no_of_trips = 1,
      purpose_of_booking = "transportation",
    } = req.body;

    const userId = req.user.id;

    if (!pickup || !drop) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Pickup location and drop location are required",
      });
    }

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
          totalPrice,
          paymentMethod: null,
          paymentStatus: "pending",
          noOfFloors: noOfFloors || null,
          hasLift: hasLift || false,
          no_of_trips: no_of_trips || 1,
          purpose_of_booking: purpose_of_booking || "transportation",
          status: "WAITING_PORTER",
        },
      ],
      { session },
    );

    const bookingDoc = booking[0];

    // Find nearby porters
    const nearbyPorters = await Porters.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [pickup.lng, pickup.lat],
          },
          maxDistance: (radiusKm || 5) * 1000,
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

    // Create BookingPorterRequest for each nearby porter
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

    // Notify porters via Socket.IO
    try {
      const io = getIO();
      nearbyPorters.forEach((porter) => {
        io.to(`porter:${porter._id.toString()}`).emit("booking-request", {
          bookingId: bookingDoc._id,
          pickup,
          drop,
          weightKg,
          hasVehicle: hasVehicle || false,
          vehicleType: hasVehicle ? vehicleType : null,
          totalPrice,
          distanceKm: Number((porter.distanceMeters / 1000).toFixed(2)),
          createdAt: bookingDoc.createdAt,
        });
      });
    } catch (socketErr) {
      console.error("Socket emit error:", socketErr.message);
    }

    // Notify porters via SSE
    const porterIds = nearbyPorters.map((p) => p._id);
    const distances = nearbyPorters.map((p) =>
      Number((p.distanceMeters / 1000).toFixed(2)),
    );
    notifyMultiplePorters(porterIds, bookingDoc, distances).catch((err) =>
      console.error("Notification error:", err),
    );

    return res.status(201).json({
      success: true,
      message: "Booking created. Searching for available porters...",
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
      const sseService = await import("../../utils/sse-service.js").then(
        (m) => m.default,
      );
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

/**
 * Search for nearby porters after payment confirmation
 * POST /api/bookings/individual/:id/confirm-and-search
 * Called after payment is confirmed (cash verified or digital payment successful)
 */
export const confirmPaymentAndSearchPorters = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    const booking = await PorterBooking.findById(bookingId).session(session);

    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Verify ownership
    if (booking.userId.toString() !== userId.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: "Unauthorized to confirm this booking",
      });
    }

    // Check if payment is confirmed
    if (
      booking.paymentStatus !== "confirmed" &&
      booking.paymentStatus !== "verified"
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Payment not confirmed. Please complete payment first.",
      });
    }

    // Update booking status to start searching
    booking.status = "WAITING_PORTER";
    await booking.save({ session });

    // Find nearby porters with $geoNear
    const nearbyPorters = await Porters.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [booking.pickup.lng, booking.pickup.lat],
          },
          maxDistance: (booking.radiusKm || 5) * 1000,
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

    // Create BookingPorterRequest for each nearby porter
    const porterRequests = nearbyPorters.map((porter) => ({
      bookingId: booking._id,
      porterId: porter._id,
      distanceKm: Number((porter.distanceMeters / 1000).toFixed(2)),
      notificationType: "DIRECT",
      isTeamLead: false,
      status: "PENDING",
    }));

    await BookingPorterRequest.insertMany(porterRequests, { session });

    await session.commitTransaction();
    session.endSession();

    // Emit socket booking-request events
    try {
      const io = getIO();
      nearbyPorters.forEach((porter) => {
        io.to(`porter:${porter._id.toString()}`).emit("booking-request", {
          bookingId: booking._id,
          pickup: booking.pickup,
          drop: booking.drop,
          weightKg: booking.weightKg,
          hasVehicle: booking.hasVehicle,
          vehicleType: booking.vehicleType,
          totalPrice: booking.totalPrice,
          paymentMethod: booking.paymentMethod,
          distanceKm: Number((porter.distanceMeters / 1000).toFixed(2)),
          createdAt: booking.createdAt,
        });
      });
    } catch (socketErr) {
      console.error("Socket emit error:", socketErr.message);
    }

    // Send notifications
    const porterIds = nearbyPorters.map((p) => p._id);
    const distances = nearbyPorters.map((p) =>
      Number((p.distanceMeters / 1000).toFixed(2)),
    );
    notifyMultiplePorters(porterIds, booking, distances).catch((err) =>
      console.error("Notification error:", err),
    );

    return res.status(200).json({
      success: true,
      message: "Payment confirmed. Searching for available porters...",
      bookingId: booking._id,
      portersNotified: nearbyPorters.length,
      data: { booking },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error confirming payment and searching porters:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search for porters",
      error: error.message,
    });
  }
};

/**
 * Update payment method after journey completion
 * POST /api/bookings/individual/:id/update-payment-method
 * Called after booking is COMPLETED, before navigating to orders
 */
export const updatePaymentMethodAfterCompletion = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;
    const { paymentMethod } = req.body;

    // Validate payment method
    if (!paymentMethod || !["cash", "digital"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Valid payment method (cash or digital) is required",
      });
    }

    const booking = await PorterBooking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Verify ownership and booking is completed
    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this booking",
      });
    }

    if (booking.status !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Payment method can only be updated after booking completion",
      });
    }

    // Update payment method
    booking.paymentMethod = paymentMethod;
    booking.paymentStatus = "pending"; // Reset to pending until payment is processed
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Payment method updated successfully",
      data: { booking },
    });
  } catch (error) {
    console.error("Error updating payment method:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update payment method",
      error: error.message,
    });
  }
};
