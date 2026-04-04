import mongoose from "mongoose";

const cancellationLogSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PorterBooking",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    cancelledBy: {
      type: String,
      enum: ["user", "porter"],
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    // refundAmount: {
    //   type: Number,
    //   default: 0,
    // },

    // refundStatus: {
    //   type: String,
    //   enum: ["pending", "processed", "failed"],
    //   default: "pending",
    // },

    // paymentMethod: {
    //   type: String,
    //   enum: ["cash", "digital"],
    //   required: true,
    // },

    // For digital refunds
    // refundTxnId: {
    //   type: String,
    //   default: null,
    // },

    // For cash refunds - admin approval
    // approvedBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    //   default: null,
    // },

    // approvedAt: {
    //   type: Date,
    //   default: null,
    // },

    // rejectionReason: {
    //   type: String,
    //   default: null,
    // },
  },
  { timestamps: true },
);

export default mongoose.model("CancellationLog", cancellationLogSchema);
