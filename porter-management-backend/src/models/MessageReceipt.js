import mongoose from "mongoose";

const messageReceiptSchema = new mongoose.Schema(
  {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PorterBooking",
      required: true,
    },

    readBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    readerModel: {
      type: String,
      enum: ["User", "Porters", "PorterTeam"],
      required: true,
    },

    readAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("MessageReceipt", messageReceiptSchema);
