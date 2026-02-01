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

    status: {
      type: String,
      enum: ["active", "pending", "inactive", "banned"],
      default: "pending",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    latitude: Number,
    longitude: Number,
  },
  { timestamps: true },
);
export default mongoose.model("Porters", PorterSchema);
