import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PorterBooking",
      required: true,
      unique: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    method: {
      type: String,
      enum: ["cash", "digital"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "verified", "failed", "refunded"],
      default: "pending",
    },

    // eSewa specific fields
    esewaTxnId: {
      type: String,
      default: null,
    },

    esewaMerchantCode: {
      type: String,
      default: null,
    },

    // Cash payment verification
    paymentProof: {
      type: String,
      default: null,
    },

    // Failure tracking
    failureReason: {
      type: String,
      default: null,
    },

    // Admin verification for cash
    verifiedAt: {
      type: Date,
      default: null,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Retry tracking
    retryCount: {
      type: Number,
      default: 0,
    },

    lastRetryAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
