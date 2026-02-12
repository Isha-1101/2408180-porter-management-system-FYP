//acceptance schema
import mongoose from "mongoose";

const bookingPorterRequestSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PorterBooking",
      required: true,
    },

    porterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Porters",
      required: true,
    },

    teamId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "PorterTeam",
    },
    
    distanceKm: {
      type: Number,
      required: true,
    },

    notificationType: {
      type: String,
      enum: ["DIRECT", "TEAM_LEAD", "TEAM_MEMBER"],
      default: "DIRECT",
    },

    isTeamLead: {
      type: Boolean,
      default: false,
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
