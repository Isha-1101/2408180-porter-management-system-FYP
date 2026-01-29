import mongoose from "mongoose";

const PorterRegistrationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    registrationType: {
      type: String,
      enum: ["individual", "team", "team_member"],
      required: true,
    },
    role: {
      type: String,
      enum: ["owner", "worker"],
      required: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PorterTeam",
      default: null,
    },
    registrationId: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "rejected"],
      default: "draft",
    },

    currentStep: {
      type: Number,
      default: 1,
    },

    steps: {
      basicInfo: {
        completed: { type: Boolean, default: false },
        updatedAt: { type: Date, default: null },
      },
      vehicle: {
        completed: { type: Boolean, default: false },
        updatedAt: { type: Date, default: null },
      },
      documents: {
        completed: { type: Boolean, default: false },
        updatedAt: { type: Date, default: null },
      },
    },

    rejectionReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export default mongoose.model("PorterRegistration", PorterRegistrationSchema);
