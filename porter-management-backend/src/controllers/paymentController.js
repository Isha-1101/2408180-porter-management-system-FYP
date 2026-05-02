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
    const userId = req.user.id;
    console.log({ userId: req.user.id })

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
    if (!booking.userId) {
      return res.status(400).json({
        success: false,
        message: "Booking has no associated user",
      });
    }
    console.log({ bookingUserId: booking.userId, userId })
    console.log(booking.userId.toString())

    if (booking.userId?.toString() !== userId?.toString()) {
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
        process.env.ESEWA_MERCHANT_CODE || "EPAYTEST",
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
    if (!payment.userId) {
      return res.status(400).json({
        success: false,
        message: "Payment has no associated user",
      });
    }
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
      process.env.ESEWA_MERCHANT_CODE || "EPAYTEST",
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
 * 
 * eSewa redirects here after successful payment with base64 encoded data
 * Query params: data=<base64_encoded_json>
 * 
 * Decoded data contains:
 * - transaction_code: eSewa transaction reference
 * - status: COMPLETE/FAILED
 * - total_amount: Paid amount
 * - transaction_uuid: Our transaction ID
 * - product_code: Merchant code
 * - signature: Response signature for verification
 */
export const esewaSuccessCallback = async (req, res) => {
  try {
    const { data } = req.query;

    if (!data) {
      console.error("[eSewa] Success callback: Missing data parameter");
      const clientUrl = process.env.CLIENT_URL_DEV || "http://localhost:5173";
      return res.redirect(`${clientUrl}/dashboard/payment/failure?reason=Missing payment data`);
    }

    // Decode base64 data
    let decodedData;
    try {
      decodedData = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
    } catch (parseError) {
      console.error("[eSewa] Success callback: Failed to decode data", parseError);
      const clientUrl = process.env.CLIENT_URL_DEV || "http://localhost:5173";
      return res.redirect(`${clientUrl}/dashboard/payment/failure?reason=Invalid payment data`);
    }

    const { transaction_code, status, total_amount, transaction_uuid, signature } = decodedData;

    console.log("[eSewa] Success callback received:", {
      transaction_code,
      status,
      total_amount,
      transaction_uuid,
    });

    // Verify signature to prevent fraud
    if (!verifyEsewaSignature(decodedData, signature)) {
      console.error("[eSewa] Success callback: Invalid signature - possible fraud attempt");
      const clientUrl = process.env.CLIENT_URL_DEV || "http://localhost:5173";
      return res.redirect(`${clientUrl}/dashboard/payment/failure?reason=Invalid payment signature`);
    }

    // Find payment by transaction UUID
    const payment = await Payment.findOne({ esewaTxnId: transaction_uuid });
    if (!payment) {
      console.error("[eSewa] Success callback: Payment not found for transaction:", transaction_uuid);
      const clientUrl = process.env.CLIENT_URL_DEV || "http://localhost:5173";
      return res.redirect(`${clientUrl}/dashboard/payment/failure?reason=Payment record not found`);
    }

    // Update payment status based on eSewa response
    if (status === "COMPLETE") {
      payment.status = "confirmed";
      payment.esewaMerchantCode = decodedData.product_code;

      // Store transaction response data
      payment.paymentProof = JSON.stringify({
        transaction_code,
        status,
        total_amount,
        transaction_uuid,
        product_code: decodedData.product_code,
        verified_at: new Date().toISOString(),
      });
    } else {
      payment.status = "failed";
      payment.failureReason = `eSewa returned status: ${status}`;
    }

    await payment.save();

    // Update booking payment status
    const booking = await PorterBooking.findById(payment.bookingId);
    if (booking) {
      booking.paymentStatus = payment.status === "confirmed" ? "confirmed" : "failed";
      await booking.save();
    }

    // Redirect to frontend success or failure page
    const clientUrl = process.env.CLIENT_URL_DEV || "http://localhost:5173";

    if (payment.status === "confirmed") {
      const redirectUrl = `${clientUrl}/dashboard/payment/success?bookingId=${payment.bookingId}&transactionCode=${transaction_code}&amount=${total_amount}`;
      return res.redirect(redirectUrl);
    } else {
      const redirectUrl = `${clientUrl}/dashboard/payment/failure?bookingId=${payment.bookingId}&reason=${encodeURIComponent(payment.failureReason)}`;
      return res.redirect(redirectUrl);
    }
  } catch (error) {
    console.error("[eSewa] Success callback error:", error);
    const clientUrl = process.env.CLIENT_URL_DEV || "http://localhost:5173";
    res.redirect(`${clientUrl}/dashboard/payment/failure?reason=Payment processing error`);
  }
};

/**
 * eSewa Failure Callback
 * GET /core-api/payments/esewa/failure
 * 
 * eSewa redirects here when payment fails or is cancelled by user
 * Query params: data=<base64_encoded_json> (may or may not be present)
 */
export const esewaFailureCallback = async (req, res) => {
  try {
    const { data } = req.query;

    let decodedData = null;
    let transaction_uuid = null;
    let failureReason = "Payment failed or was cancelled";

    if (data) {
      try {
        decodedData = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
        transaction_uuid = decodedData.transaction_uuid;
        failureReason = decodedData.error_code
          ? `eSewa Error: ${decodedData.error_code} - ${decodedData.status || "Unknown"}`
          : `Payment cancelled by user`;
      } catch (parseError) {
        console.error("[eSewa] Failure callback: Failed to decode data", parseError);
      }
    }

    console.log("[eSewa] Failure callback received:", {
      transaction_uuid,
      failureReason,
      hasData: !!data,
    });

    // Find payment by transaction UUID if available
    if (transaction_uuid) {
      const payment = await Payment.findOne({ esewaTxnId: transaction_uuid });
      if (payment) {
        payment.status = "failed";
        payment.failureReason = failureReason;
        await payment.save();

        // Update booking payment status
        const booking = await PorterBooking.findById(payment.bookingId);
        if (booking) {
          booking.paymentStatus = "failed";
          await booking.save();
        }

        // Redirect to frontend failure page with booking details
        const clientUrl = process.env.CLIENT_URL_DEV || "http://localhost:5173";
        const redirectUrl = `${clientUrl}/dashboard/payment/failure?bookingId=${payment.bookingId}&reason=${encodeURIComponent(failureReason)}`;
        return res.redirect(redirectUrl);
      }
    }

    // If no transaction UUID or payment not found, redirect to generic failure page
    const clientUrl = process.env.CLIENT_URL_DEV || "http://localhost:5173";
    const redirectUrl = `${clientUrl}/dashboard/payment/failure?reason=${encodeURIComponent(failureReason)}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("[eSewa] Failure callback error:", error);
    const clientUrl = process.env.CLIENT_URL_DEV || "http://localhost:5173";
    res.redirect(`${clientUrl}/dashboard/payment/failure?reason=Payment processing error`);
  }
};

/**
 * eSewa Webhook Verification
 * POST /core-api/payments/esewa/webhook
 * 
 * eSewa may send server-to-server webhook notifications for payment status updates.
 * This endpoint handles idempotent updates to prevent double-processing.
 * 
 * Request body:
 * - data: Base64 encoded payment data (same format as success callback)
 * - signature: HMAC-SHA256 signature
 */
export const esewaWebhook = async (req, res) => {
  try {
    const { data, signature } = req.body;

    if (!data || !signature) {
      console.error("[eSewa] Webhook: Missing data or signature");
      return res.status(400).json({
        success: false,
        message: "Missing data or signature",
      });
    }

    // Decode base64 data
    let decodedData;
    try {
      decodedData = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
    } catch (parseError) {
      console.error("[eSewa] Webhook: Failed to decode data", parseError);
      return res.status(400).json({
        success: false,
        message: "Invalid data format",
      });
    }

    const { transaction_uuid, status, total_amount, transaction_code } = decodedData;

    console.log("[eSewa] Webhook received:", {
      transaction_uuid,
      status,
      total_amount,
      transaction_code,
    });

    // Verify signature
    if (!verifyEsewaSignature(decodedData, signature)) {
      console.error("[eSewa] Webhook: Invalid signature");
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    // Find payment by transaction UUID
    const payment = await Payment.findOne({ esewaTxnId: transaction_uuid });
    if (!payment) {
      console.error("[eSewa] Webhook: Payment not found for transaction:", transaction_uuid);
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Idempotent update: only process if payment is still pending or failed
    // If already confirmed, skip to prevent double-processing
    if (payment.status === "confirmed") {
      console.log("[eSewa] Webhook: Payment already confirmed, skipping");
      return res.status(200).json({
        success: true,
        message: "Webhook processed (already confirmed)",
      });
    }

    // Update payment status based on webhook data
    if (status === "COMPLETE") {
      payment.status = "confirmed";
      payment.esewaMerchantCode = decodedData.product_code;
      payment.paymentProof = JSON.stringify({
        transaction_code,
        status,
        total_amount,
        transaction_uuid,
        product_code: decodedData.product_code,
        verified_via: "webhook",
        verified_at: new Date().toISOString(),
      });
    } else {
      payment.status = "failed";
      payment.failureReason = `Webhook status: ${status}`;
    }

    await payment.save();

    // Update booking payment status
    const booking = await PorterBooking.findById(payment.bookingId);
    if (booking) {
      booking.paymentStatus = payment.status === "confirmed" ? "confirmed" : "failed";
      await booking.save();
    }

    console.log("[eSewa] Webhook: Payment updated successfully", {
      paymentId: payment._id,
      newStatus: payment.status,
    });

    // Return 200 OK to eSewa
    res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
      data: {
        paymentId: payment._id,
        status: payment.status,
        transaction_uuid,
      },
    });
  } catch (error) {
    console.error("[eSewa] Webhook error:", error);
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
