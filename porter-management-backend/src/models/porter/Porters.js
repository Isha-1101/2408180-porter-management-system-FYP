import mongoose from "mongoose";

const PorterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PorterRegistration",
      unique: true,
    },

    porterType: {
      type: String,
      enum: ["individual", "team"],
      required: true,
    },

    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PorterTeam",
      default: null,
    },

    role: {
      type: String,
      enum: ["owner", "worker"],
      required: true,
    },

    canAcceptBooking: {
      type: Boolean,
      default: false,
    },

    SystemStatus: {
      type: String,
      enum: ["active", "pending", "inactive", "banned"],
      default: "pending",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    //porter job status
    currentStatus: {
      type: String,
      enum: ["online", "offline", "busy", "assigned"],
      default: "offline",
    },
    assigned_status: {
      type: String,
      enum: ["assigned", "not_assigned"],
      default: "not_assigned",
    },
    //porter can takes
    maxWeightKg: {
      type: Number,
      required: true,
      default: 0,
    },
    //porter current location
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], //lat, lng
        default: [0, 0],
        required: true,
      },
    },
    lastLocationUpdatedAt: {
      type: Date,
      default: Date.now,
    },
    maxDistance: {
      type: Number,
      required: true,
      default: 5000,
    },
  },
  { timestamps: true },
);
PorterSchema.index({ location: "2dsphere" });
export default mongoose.model("Porters", PorterSchema);
