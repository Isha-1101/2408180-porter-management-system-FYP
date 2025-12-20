import mongoose from "mongoose";

const PortersSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "porter_teams",
      default: null,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },
    porterPhoto: {
      type: String,
      default: null,
    },
    porterType: {
      type: String,
      enum: ["individual", "team_member"],
      required: true,
    },

    experienceYears: {
      type: Number,
      default: 1,
      min: 1,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },

    lastLocationUpdate: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    remarks: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Porter = mongoose.model("Porters", PortersSchema);
export default Porter;
