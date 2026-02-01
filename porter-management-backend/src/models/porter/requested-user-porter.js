import mongoose from "mongoose";

const PorterRequestSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PorterTeam",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    porterType: {
      type: String,
      enum: ["individual"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export const RequestedUserPorter = mongoose.model(
  "RequestedUserPorter",
  PorterRequestSchema,
);
