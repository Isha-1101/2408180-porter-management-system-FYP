// models/porterBooking.model.js
import mongoose from "mongoose";

const porterBookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    porterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "porters",
      default: null, // used for individual hire
    },

    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "porter_teams",
      default: null, // used for team hire
    },

    numberOfPorters: {
      type: Number,
      default: 1,
      min: 1,
    },

    pickupLocation: {
      type: String,
      required: true,
      trim: true,
    },

    dropLocation: {
      type: String,
      required: true,
      trim: true,
    },

    pickupLat: {
      type: Number,
      required: true,
    },

    pickupLng: {
      type: Number,
      required: true,
    },

    bookingDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const PorterBooking = mongoose.model(
  "porter_bookings",
  porterBookingSchema
);

export default PorterBooking;