import Payment from "../models/Payment.js";
import PorterBooking from "../models/PorterBooking.js";
import CancellationLog from "../models/CancellationLog.js";
import {
  generateTransactionId,
  generateEsewaPaymentData,
  verifyEsewaSignature,
} from "../config/esewa.config.js";

/**
 * Initiate payment for a booking
 * POST /core-api/payments/initiate
 */
export const initiatePayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod } = req.body;
    const userId = req.user._id;

    // Validate input
    if (
      !bookingId ||
      !paymentMethod ||
      !["cash", "digital"].includes(paymentMethod)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID or payment method",
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

    // Check if user is the booking creator
    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to pay for this booking",
      });
    }

    // Check if payment already exists
    let payment = await Payment.findOne({ bookingId });
    if (payment && payment.status !== "failed") {
      return res.status(400).json({
        success: false,
        message: "Payment already initiated for this booking",
      });
    }

    // Create or update payment record
    if (!payment) {
      payment = new Payment({
        bookingId,
        userId,
        amount: booking.totalPrice,
        method: paymentMethod,
        status: "pending",
      });
    } else {
      // Update failed payment with new attempt
      payment.status = "pending";
      payment.retryCount = (payment.retryCount || 0) + 1;
      payment.lastRetryAt = new Date();
      payment.failureReason = null;
    }

    // For digital payments, generate eSewa form data
    if (paymentMethod === "digital") {
      const transactionId = generateTransactionId(bookingId);
      payment.esewaTxnId = transactionId;

      const esewaData = generateEsewaPaymentData(
        booking.totalPrice,
        transactionId,
        "PORTERS",
        `Porter Service - Booking ${bookingId.toString().substring(0, 8)}`,
      );

      await payment.save();

      // Update booking with payment info
      booking.paymentId = payment._id;
      booking.paymentMethod = paymentMethod;
      booking.paymentStatus = "pending";
      await booking.save();

      return res.status(200).json({
        success: true,
        message: "Payment initiated successfully",
        data: {
          paymentId: payment._id,
          esewaData,
          gatewayUrl: process.env.ESEWA_GATEWAY_URL,
        },
      });
    } else {
      // Cash payment
      await payment.save();

      // Update booking with payment info
      booking.paymentId = payment._id;
      booking.paymentMethod = paymentMethod;
      booking.paymentStatus = "pending";
      await booking.save();

      return res.status(200).json({
        success: true,
        message: "Cash payment initialized. Proceed with booking.",
        data: {
          paymentId: payment._id,
          amount: booking.totalPrice,
          method: "cash",
        },
      });
    }
  } catch (error) {
    console.error("Payment initiation error:", error);
    res.status(500).json({
      success: false,
      message: "Error initiating payment",
      error: error.message,
    });
  }
};

/**
 * Get payment details by booking ID
 * GET /core-api/payments/:bookingId
 */
export const getPaymentByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const payment = await Payment.findOne({ bookingId })
      .populate("userId", "name email phone")
      .populate("verifiedBy", "name email");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Get payment error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment",
      error: error.message,
    });
  }
};

/**
 * Verify cash payment (Admin)
 * POST /core-api/payments/:paymentId/verify-cash
 */
export const verifyCashPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const adminId = req.user._id;

    // Verify admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can verify cash payments",
      });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.method !== "cash") {
      return res.status(400).json({
        success: false,
        message: "This is not a cash payment",
      });
    }

    // Update payment
    payment.status = "verified";
    payment.verifiedAt = new Date();
    payment.verifiedBy = adminId;
    await payment.save();

    // Update booking
    const booking = await PorterBooking.findById(payment.bookingId);
    if (booking) {
      booking.paymentStatus = "verified";
      await booking.save();
    }

    res.status(200).json({
      success: true,
      message: "Cash payment verified successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Verify cash payment error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying cash payment",
      error: error.message,
    });
  }
};

/**
 * Retry digital payment
 * POST /core-api/payments/:paymentId/retry-esewa
 */
export const retryEsewaPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user._id;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Verify ownership
    if (payment.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to retry this payment",
      });
    }

    if (payment.method !== "digital") {
      return res.status(400).json({
        success: false,
        message: "This is not a digital payment",
      });
    }

    // Generate new transaction ID for retry
    const transactionId = generateTransactionId(payment.bookingId);
    payment.esewaTxnId = transactionId;
    payment.status = "pending";
    payment.retryCount = (payment.retryCount || 0) + 1;
    payment.lastRetryAt = new Date();
    payment.failureReason = null;
    await payment.save();

    // Get booking for amount
    const booking = await PorterBooking.findById(payment.bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const esewaData = generateEsewaPaymentData(
      booking.totalPrice,
      transactionId,
      "PORTERS",
      `Porter Service - Booking ${booking._id.toString().substring(0, 8)}`,
    );

    res.status(200).json({
      success: true,
      message: "Payment retry initiated",
      data: {
        paymentId: payment._id,
        esewaData,
        gatewayUrl: process.env.ESEWA_GATEWAY_URL,
        retryCount: payment.retryCount,
      },
    });
  } catch (error) {
    console.error("Retry eSewa payment error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrying payment",
      error: error.message,
    });
  }
};

/**
 * eSewa Success Callback
 * GET /core-api/payments/esewa/success
 */
export const esewaSuccessCallback = async (req, res) => {
  try {
    const { data } = req.query;

    if (!data) {
      return res.status(400).json({
        success: false,
        message: "Missing data",
      });
    }

    // Decode base64 data
    const decodedData = JSON.parse(Buffer.from(data, "base64").toString());
    const { total_amount, transaction_uuid, status, signature } = decodedData;

    // Verify signature
    if (!verifyEsewaSignature(decodedData, signature)) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature - possible fraud attempt",
      });
    }

    // Find payment by transaction ID
    const payment = await Payment.findOne({ esewaTxnId: transaction_uuid });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    // Update payment
    payment.status = status === "COMPLETE" ? "confirmed" : "failed";
    await payment.save();

    // Update booking
    const booking = await PorterBooking.findById(payment.bookingId);
    if (booking) {
      booking.paymentStatus = payment.status;
      await booking.save();
    }

    // Redirect to frontend with status
    const clientUrl = process.env.CLIENT_URL_DEV;
    const redirectUrl = `${clientUrl}/booking/${payment.bookingId}?paymentStatus=${payment.status}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("eSewa success callback error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing payment callback",
      error: error.message,
    });
  }
};

/**
 * eSewa Failure Callback
 * GET /core-api/payments/esewa/failure
 */
export const esewaFailureCallback = async (req, res) => {
  try {
    const { data } = req.query;

    if (!data) {
      return res.status(400).json({
        success: false,
        message: "Missing data",
      });
    }

    // Decode base64 data
    const decodedData = JSON.parse(Buffer.from(data, "base64").toString());
    const { transaction_uuid, status, error_code } = decodedData;

    // Find payment
    const payment = await Payment.findOne({ esewaTxnId: transaction_uuid });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    // Update payment
    payment.status = "failed";
    payment.failureReason = `eSewa Error: ${error_code} - ${status}`;
    await payment.save();

    // Update booking
    const booking = await PorterBooking.findById(payment.bookingId);
    if (booking) {
      booking.paymentStatus = "failed";
      await booking.save();
    }

    // Redirect to frontend with failure status
    const clientUrl = process.env.CLIENT_URL_DEV;
    const redirectUrl = `${clientUrl}/booking/${payment.bookingId}?paymentStatus=failed&reason=${error_code}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("eSewa failure callback error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing failure callback",
      error: error.message,
    });
  }
};

/**
 * eSewa Webhook Verification (for additional security)
 * POST /core-api/payments/esewa/webhook
 */
export const esewaWebhook = async (req, res) => {
  try {
    const { data, signature } = req.body;

    if (!data || !signature) {
      return res.status(400).json({
        success: false,
        message: "Missing data or signature",
      });
    }

    // Verify signature
    if (!verifyEsewaSignature(data, signature)) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    // Find and update payment
    const payment = await Payment.findOne({
      esewaTxnId: data.transaction_uuid,
    });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Update based on status
    if (data.status === "COMPLETE") {
      payment.status = "confirmed";
    } else {
      payment.status = "failed";
      payment.failureReason = `Webhook status: ${data.status}`;
    }
    await payment.save();

    res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("eSewa webhook error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing webhook",
      error: error.message,
    });
  }
};

/**
 * Get payment history for user
 * GET /core-api/payments/user/:userId
 */
export const getUserPaymentHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const payments = await Payment.find({ userId })
      .populate("bookingId", "pickup drop totalPrice status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get payment history error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment history",
      error: error.message,
    });
  }
};
