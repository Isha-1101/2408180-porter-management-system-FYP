import mongoose from "mongoose";

const teamJoinRequestSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PorterTeam",
      required: true,
    },

    invitedPorterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Porters",
      required: true,
    },

    invitedByOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Porters",
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "DECLINED", "ADMIN_APPROVED", "ADMIN_REJECTED", "CANCELLED"],
      default: "PENDING",
    },

    adminApprovalStatus: {
      type: String,
      enum: ["NOT_REQUESTED", "PENDING", "APPROVED", "REJECTED"],
      default: "NOT_REQUESTED",
    },

    declinedReason: {
      type: String,
      default: null,
    },

    respondedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

teamJoinRequestSchema.index({ teamId: 1, status: 1 });
teamJoinRequestSchema.index({ invitedPorterId: 1, status: 1 });
teamJoinRequestSchema.index({ invitedByOwnerId: 1, status: 1 });

export default mongoose.model("TeamJoinRequest", teamJoinRequestSchema);
