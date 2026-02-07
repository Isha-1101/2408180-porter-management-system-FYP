import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    pickup: {
      lat: Number,
      lng: Number,
    },

    drop: {
      address: String,
      lat: Number,
      lng: Number,
    },

    weightKg: {
      type: Number,
      required: true,
    },

    radiusKm: {
      type: Number,
      default: 5,
    },

    status: {
      type: String,
      enum: [
        "SEARCHING",
        "WAITING_PORTER",
        "ASSIGNED",
        "CANCELLED",
        "COMPLETED",
      ],
      default: "SEARCHING",
    },

    assignedPorterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Porter",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PorterBooking", bookingSchema);
