import PorterBooking from "../models/PorterBooking.js";
import CancellationLog from "../models/CancellationLog.js";
import Payment from "../models/Payment.js";
import Porters from "../models/porter/Porters.js";
import BookingPorterRequest from "../models/BookintgPorterRequest.js";
import { notifyUser, notifyPorter } from "../utils/notification-service.js";
import { getIO } from "../utils/socketInstance.js";

const MAX_CANCELLATIONS_PER_DAY =
  parseInt(process.env.MAX_CANCELLATIONS_PER_DAY) || 3;

/**
 * Cancel booking
 * POST /core-api/bookings/:bookingId/cancel
 * Body: { cancelledBy (user/porter), reason }
 */
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Validate input
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cancellation reason is required",
      });
    }

    // Get booking
    const booking = await PorterBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Verify authorization
    if (
      userRole === "user" &&
      booking.userId.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to cancel this booking",
      });
    }

    if (
      userRole === "porter" &&
      booking.assignedPorterId?.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this booking",
      });
    }

    // Check if booking can be cancelled
    if (["COMPLETED", "CANCELLED"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ${booking.status} booking`,
      });
    }

    // Check daily cancellation limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cancellationsToday = await CancellationLog.countDocuments({
      $or: [
        { cancelledBy: "user", createdAt: { $gte: today } },
        { cancelledBy: "porter", createdAt: { $gte: today } },
      ],
    });

    if (cancellationsToday >= MAX_CANCELLATIONS_PER_DAY) {
      return res.status(400).json({
        success: false,
        message: `You have reached the daily cancellation limit (${MAX_CANCELLATIONS_PER_DAY}/day)`,
      });
    }

    // Calculate refund (if payment exists)
    let refundAmount = 0;
    const payment = await Payment.findOne({ bookingId });

    if (
      payment &&
      payment.method === "digital" &&
      payment.status === "confirmed"
    ) {
      // Full refund for digital payments
      refundAmount = payment.amount;
    } else if (
      payment &&
      payment.method === "cash" &&
      payment.status === "verified"
    ) {
      // Refund for cash payments (admin needs to verify)
      refundAmount = payment.amount;
    }

    // Create cancellation log
    const cancellationLog = new CancellationLog({
      bookingId,
      userId,
      cancelledBy: userRole === "user" ? "user" : "porter",
      reason,
      refundAmount,
      paymentMethod: booking.paymentMethod,
      refundStatus: refundAmount > 0 ? "pending" : "n/a",
    });

    await cancellationLog.save();

    // Update booking status
    booking.status = "CANCELLED";
    booking.cancelledBy = userId;
    booking.cancellationReason = reason;
    await booking.save();

    // Reset porter if assigned
    if (booking.assignedPorterId) {
      await Porters.findByIdAndUpdate(booking.assignedPorterId, {
        currentStatus: "online",
        canAcceptBooking: true,
      });
    }

    // Mark all pending porter requests as expired
    await BookingPorterRequest.updateMany(
      { bookingId, status: "PENDING" },
      { status: "EXPIRED", respondedAt: new Date() },
    );

    // Send notifications
    if (userRole === "user") {
      // User cancelled - notify porter
      if (booking.assignedPorterId) {
        notifyPorter(
          booking.assignedPorterId,
          booking,
          "BOOKING_CANCELLED",
          `Booking cancelled by user: ${reason}`,
        ).catch((err) => console.error("Porter notification error:", err));
      }
    } else {
      // Porter cancelled - notify user
      notifyUser(
        booking.userId,
        booking,
        "BOOKING_CANCELLED",
        `Booking cancelled by porter: ${reason}`,
      ).catch((err) => console.error("User notification error:", err));
    }

    // Socket notification
    try {
      const io = getIO();
      io.emit("booking-cancelled", {
        bookingId: booking._id,
        cancelledBy: userRole,
        reason,
        status: "CANCELLED",
      });
    } catch (socketErr) {
      console.error("Socket emit error:", socketErr.message);
    }

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: {
        booking,
        cancellationLog,
        refundAmount,
        refundStatus: cancellationLog.refundStatus,
      },
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling booking",
      error: error.message,
    });
  }
};

/**
 * Get user cancellation history
 * GET /core-api/bookings/user/:userId/cancellations
 */
export const getUserCancellationHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const cancellations = await CancellationLog.find({
      userId,
      cancelledBy: "user",
    })
      .populate("bookingId", "pickup drop totalPrice status paymentMethod")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await CancellationLog.countDocuments({
      userId,
      cancelledBy: "user",
    });

    // Get today's count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await CancellationLog.countDocuments({
      userId,
      cancelledBy: "user",
      createdAt: { $gte: today },
    });

    res.status(200).json({
      success: true,
      data: cancellations,
      stats: {
        totalCancellations: total,
        todaysCancellations: todayCount,
        remainingToday: MAX_CANCELLATIONS_PER_DAY - todayCount,
      },
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get user cancellation history error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching cancellation history",
      error: error.message,
    });
  }
};

/**
 * Get porter cancellation history
 * GET /core-api/bookings/porter/:porterId/cancellations
 */
export const getPorterCancellationHistory = async (req, res) => {
  try {
    const { porterId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const cancellations = await CancellationLog.find({
      userId: porterId,
      cancelledBy: "porter",
    })
      .populate("bookingId", "pickup drop totalPrice status paymentMethod")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await CancellationLog.countDocuments({
      userId: porterId,
      cancelledBy: "porter",
    });

    // Get today's count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await CancellationLog.countDocuments({
      userId: porterId,
      cancelledBy: "porter",
      createdAt: { $gte: today },
    });

    res.status(200).json({
      success: true,
      data: cancellations,
      stats: {
        totalCancellations: total,
        todaysCancellations: todayCount,
        remainingToday: MAX_CANCELLATIONS_PER_DAY - todayCount,
      },
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get porter cancellation history error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching cancellation history",
      error: error.message,
    });
  }
};

/**
 * Get cancellation count remaining for user/porter today
 * GET /core-api/bookings/cancellations/remaining
 */
export const getRemainingCancellationsToday = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cancelledToday = await CancellationLog.countDocuments({
      userId,
      cancelledBy: userRole === "user" ? "user" : "porter",
      createdAt: { $gte: today },
    });

    const remaining = Math.max(0, MAX_CANCELLATIONS_PER_DAY - cancelledToday);

    res.status(200).json({
      success: true,
      data: {
        usedToday: cancelledToday,
        remaining,
        limit: MAX_CANCELLATIONS_PER_DAY,
      },
    });
  } catch (error) {
    console.error("Get remaining cancellations error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching cancellation count",
      error: error.message,
    });
  }
};

/**
 * Admin: Approve cash refund
 * POST /core-api/bookings/cancellations/:cancellationId/approve-refund
 */
export const approveCashRefund = async (req, res) => {
  try {
    const { cancellationId } = req.params;
    const adminId = req.user._id;

    // Verify admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can approve refunds",
      });
    }

    const cancellation = await CancellationLog.findById(cancellationId);
    if (!cancellation) {
      return res.status(404).json({
        success: false,
        message: "Cancellation record not found",
      });
    }

    if (cancellation.paymentMethod !== "cash") {
      return res.status(400).json({
        success: false,
        message: "This cancellation is not for a cash payment",
      });
    }

    // Update cancellation
    cancellation.refundStatus = "processed";
    cancellation.approvedBy = adminId;
    cancellation.approvedAt = new Date();
    await cancellation.save();

    res.status(200).json({
      success: true,
      message: "Cash refund approved",
      data: cancellation,
    });
  } catch (error) {
    console.error("Approve cash refund error:", error);
    res.status(500).json({
      success: false,
      message: "Error approving refund",
      error: error.message,
    });
  }
};

/**
 * Admin: Reject cash refund
 * POST /core-api/bookings/cancellations/:cancellationId/reject-refund
 */
export const rejectCashRefund = async (req, res) => {
  try {
    const { cancellationId } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user._id;

    // Verify admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can reject refunds",
      });
    }

    const cancellation = await CancellationLog.findById(cancellationId);
    if (!cancellation) {
      return res.status(404).json({
        success: false,
        message: "Cancellation record not found",
      });
    }

    // Update cancellation
    cancellation.refundStatus = "failed";
    cancellation.approvedBy = adminId;
    cancellation.rejectionReason = rejectionReason || "Admin rejected";
    cancellation.approvedAt = new Date();
    await cancellation.save();

    res.status(200).json({
      success: true,
      message: "Cash refund rejected",
      data: cancellation,
    });
  } catch (error) {
    console.error("Reject cash refund error:", error);
    res.status(500).json({
      success: false,
      message: "Error rejecting refund",
      error: error.message,
    });
  }
};
