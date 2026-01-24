import mongoose from "mongoose";

const PorterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.role === "owner";
      },
      unique: true,
      sparse: true,
    },
    porterType: {
      type: String,
      enum: ["individual", "team"],
      required: true,
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

    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PorterTeam",
      required: function () {
        return this.role === "worker";
      },
      default: null,
    },

    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PorterRegistration",
      unique: true,
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
