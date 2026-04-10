import mongoose from "mongoose";

const PorterTeamSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isActive: { type: Boolean, default: true },
  noOfMember: { type: Number, default: 0 },
  noOfAvailableMember: { type: Number, default: 0 },

  members: [
    {
      porterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Porters",
        required: true,
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    },
  ],

  totalCompletedJobs: {
    type: Number,
    default: 0,
  },

  totalActiveJobs: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

export default mongoose.model("PorterTeam", PorterTeamSchema);
