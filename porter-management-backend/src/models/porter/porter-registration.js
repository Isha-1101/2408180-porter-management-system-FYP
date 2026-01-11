import mongoose from "mongoose";

const PorterRegistrationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
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
  { timestamps: true }
);

export default mongoose.model(
  "PorterRegistration",
  PorterRegistrationSchema
);
