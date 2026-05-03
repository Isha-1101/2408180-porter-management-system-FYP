import Payment from "../models/Payment.js";
import PorterBooking from "../models/PorterBooking.js";
import CancellationLog from "../models/CancellationLog.js";
import {
  generateTransactionId,
  generateEsewaPaymentData,
  verifyEsewaSignature,
  decodeEsewaResponse,
} from "../config/esewa.config.js";

/**
 * Initiate payment for a booking
 * POST /core-api/payments/initiate
 */
export const initiatePayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod } = req.body;
    const userId = req.user.id;

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
    if (booking?.userId?.toString() !== userId?.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to pay for this booking",
      });
    }

    // Check if booking is completed (payment only after completion)
    if (booking.status !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Payment can only be initiated after booking completion",
      });
    }

    // Check if payment already exists and is not failed
    let payment = await Payment.findOne({ bookingId });
    if (payment && payment.status === "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Payment already completed for this booking",
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
      payment.method = paymentMethod;
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
        null, // Use default from config (EPAYTEST)
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
      null, // Use default from config
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
 * GET /core-api/payments/esewa/success?data=<base64_encoded_json>
 *
 * Flow:
 * 1. Decode base64 data from query param
 * 2. Verify signature (prevent fraud)
 * 3. Find payment by transaction_uuid
 * 4. Update payment.status = "confirmed" (if status === "COMPLETE")
 * 5. Update booking.paymentStatus = "confirmed"
 * 6. Redirect to frontend success page
 */
export const esewaSuccessCallback = async (req, res) => {
  try {
    const { data } = req.query;

    if (!data) {
      return res.status(400).send(`
        <html><body>
        <h2>Payment Error</h2>
        <p>Missing payment data. Please contact support.</p>
        <a href="${process.env.CLIENT_URL_DEV || "http://localhost:5173"}">Go to Home</a>
        </body></html>
      `);
    }

    // Decode base64 response from eSewa
    const decodedData = decodeEsewaResponse(data);
    const { total_amount, transaction_uuid, status, signature, transaction_code } = decodedData;

    console.log("[eSewa Success] Callback received:", decodedData);

    // Verify signature to prevent fraud
    if (!verifyEsewaSignature(decodedData, signature)) {
      console.error("[eSewa Success] Invalid signature!");
      return res.status(400).send(`
        <html><body>
        <h2>Payment Verification Failed</h2>
        <p>Invalid payment signature. Please contact support.</p>
        <a href="${process.env.CLIENT_URL_DEV || "http://localhost:5173"}">Go to Home</a>
        </body></html>
      `);
    }

    // Find payment by transaction ID
    const payment = await Payment.findOne({ esewaTxnId: transaction_uuid });
    if (!payment) {
      console.error("[eSewa Success] Payment record not found for transaction:", transaction_uuid);
      return res.status(404).send(`
        <html><body>
        <h2>Payment Record Not Found</h2>
        <p>We could not find your payment record. Please contact support.</p>
        <a href="${process.env.CLIENT_URL_DEV || "http://localhost:5173"}">Go to Home</a>
        </body></html>
      `);
    }

    // Update payment status
    if (status === "COMPLETE") {
      payment.status = "confirmed";
      payment.esewaMerchantCode = decodedData.transaction_code || transaction_code;
      await payment.save();

      // Update booking payment status
      const booking = await PorterBooking.findById(payment.bookingId);
      if (booking) {
        booking.paymentStatus = "confirmed";
        await booking.save();
      }

      console.log("[eSewa Success] Payment confirmed for booking:", payment.bookingId);
    } else {
      payment.status = "failed";
      payment.failureReason = `eSewa status: ${status}`;
      await payment.save();
    }

    // Redirect to frontend success page with porterId for rating
    const clientUrl = process.env.CLIENT_URL_DEV || "http://localhost:5173";
    
    // Fetch booking to get porterId for rating
    const bookingForRating = await PorterBooking.findById(payment.bookingId);
    let porterId = null;
    
    if (bookingForRating) {
      // Individual booking
      if (bookingForRating.assignedPorterId) {
        porterId = bookingForRating.assignedPorterId.toString();
      }
      // Team booking
      if (!porterId && bookingForRating.assignedPorters && bookingForRating.assignedPorters.length > 0) {
        const firstPorter = bookingForRating.assignedPorters[0];
        porterId = firstPorter.porterId?.toString() || firstPorter.porterId?.toString() || null;
      }
    }
    
    const redirectUrl = `${clientUrl}/dashboard/payment/success?bookingId=${payment.bookingId}&transactionCode=${decodedData.transaction_code || ""}&amount=${total_amount}&porterId=${porterId || ""}`;
    return res.redirect(redirectUrl);

  } catch (error) {
    console.error("eSewa success callback error:", error);
    const clientUrl = process.env.CLIENT_URL_DEV || "http://localhost:5173";
    return res.redirect(`${clientUrl}/dashboard/payment/failure?bookingId=${req.query.bookingId || ""}&reason=server_error`);
  }
};

/**
 * eSewa Failure Callback
 * GET /core-api/payments/esewa/failure?data=<base64_encoded_json>
 *
 * Flow:
 * 1. Decode base64 data from query param
 * 2. Find payment by transaction_uuid
 * 3. Update payment.status = "failed"
 * 4. Store failure reason
 * 5. Update booking.paymentStatus = "failed"
 * 6. Redirect to frontend failure page
 */
export const esewaFailureCallback = async (req, res) => {
  try {
    const { data } = req.query;

    if (!data) {
      const clientUrl = process.env.CLIENT_URL_DEV || "http://localhost:5173";
      return res.redirect(`${clientUrl}/dashboard/payment/failure?reason=missing_data`);
    }

    // Decode base64 response from eSewa
    const decodedData = decodeEsewaResponse(data);
    const { transaction_uuid, status, error_code } = decodedData;

    console.log("[eSewa Failure] Callback received:", decodedData);

    // Find payment
    const payment = await Payment.findOne({ esewaTxnId: transaction_uuid });

    if (payment) {
      // Update payment
      payment.status = "failed";
      payment.failureReason = `eSewa Error: ${error_code || "unknown"} - ${status || "failed"}`;
      await payment.save();

      // Update booking
      const booking = await PorterBooking.findById(payment.bookingId);
      if (booking) {
        booking.paymentStatus = "failed";
        await booking.save();
      }

      console.log("[eSewa Failure] Payment marked as failed for booking:", payment.bookingId);

      // Redirect to frontend failure page with booking details
      const clientUrl = process.env.CLIENT_URL_DEV || "http://localhost:5173";
      const redirectUrl = `${clientUrl}/dashboard/payment/failure?bookingId=${payment.bookingId}&reason=${encodeURIComponent(payment.failureReason)}`;
      return res.redirect(redirectUrl);
    } else {
      console.error("[eSewa Failure] Payment record not found for transaction:", transaction_uuid);
      const clientUrl = process.env.CLIENT_URL_DEV || "http://localhost:5173";
      return res.redirect(`${clientUrl}/dashboard/payment/failure?reason=payment_not_found`);
    }

  } catch (error) {
    console.error("eSewa failure callback error:", error);
    const clientUrl = process.env.CLIENT_URL_DEV || "http://localhost:5173";
    return res.redirect(`${clientUrl}/dashboard/payment/failure?reason=server_error`);
  }
};

/**
 * eSewa Webhook Verification (for additional security)
 * POST /core-api/payments/esewa/webhook
 *
 * eSewa may send server-to-server webhook notifications for payment status updates.
 * This provides an additional layer of security beyond the redirect callbacks.
 */
export const esewaWebhook = async (req, res) => {
  try {
    // eSewa webhook sends data in the body
    const webhookData = req.body;
    
    console.log("[eSewa Webhook] Received:", webhookData);

    // Handle both direct JSON and base64 encoded data
    let decodedData;
    if (webhookData.data) {
      // Base64 encoded in 'data' field
      decodedData = decodeEsewaResponse(webhookData.data);
    } else {
      decodedData = webhookData;
    }

    const { transaction_uuid, status, signature } = decodedData;

    if (!transaction_uuid) {
      return res.status(400).json({
        success: false,
        message: "Missing transaction_uuid",
      });
    }

    // Verify signature if present
    if (signature && !verifyEsewaSignature(decodedData, signature)) {
      console.error("[eSewa Webhook] Invalid signature!");
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    // Find payment
    const payment = await Payment.findOne({ esewaTxnId: transaction_uuid });
    if (!payment) {
      console.error("[eSewa Webhook] Payment not found for transaction:", transaction_uuid);
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Idempotent update - only update if status changed
    if (status === "COMPLETE" && payment.status !== "confirmed") {
      payment.status = "confirmed";
      payment.esewaMerchantCode = decodedData.transaction_code || "";
      await payment.save();

      const booking = await PorterBooking.findById(payment.bookingId);
      if (booking && booking.paymentStatus !== "confirmed") {
        booking.paymentStatus = "confirmed";
        await booking.save();
      }

      console.log("[eSewa Webhook] Payment confirmed via webhook for booking:", payment.bookingId);
    } else if (status !== "COMPLETE" && payment.status !== "failed") {
      payment.status = "failed";
      payment.failureReason = `Webhook status: ${status}`;
      await payment.save();

      const booking = await PorterBooking.findById(payment.bookingId);
      if (booking) {
        booking.paymentStatus = "failed";
        await booking.save();
      }
    }

    // Always return 200 OK for eSewa webhook
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
