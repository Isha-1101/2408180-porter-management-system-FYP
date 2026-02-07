//acceptance schema
import mongoose from "mongoose";

const bookingPorterRequestSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    porterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Porter",
      required: true,
    },

    distanceKm: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "EXPIRED"],
      default: "PENDING",
    },

    requestedAt: {
      type: Date,
      default: Date.now,
    },

    respondedAt: Date,
  },
  { timestamps: true }
);

// Prevent duplicate requests
bookingPorterRequestSchema.index(
  { bookingId: 1, porterId: 1 },
  { unique: true }
);

export default mongoose.model(
  "BookingPorterRequest",
  bookingPorterRequestSchema
);
