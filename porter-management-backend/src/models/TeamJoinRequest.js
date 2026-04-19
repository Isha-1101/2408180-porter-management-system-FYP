import mongoose from "mongoose";

const TeamJoinRequestSchema = new mongoose.Schema(
  {
    porterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Porters",
      required: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PorterTeam",
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "DECLINED"],
      default: "PENDING",
    },
    responseReason: {
      type: String,
      default: null,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
    adminApprovalStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", null],
      default: null,
    },
    adminApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    adminApprovedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const TeamJoinRequest = mongoose.model(
  "TeamJoinRequest",
  TeamJoinRequestSchema,
);

export default TeamJoinRequest;
