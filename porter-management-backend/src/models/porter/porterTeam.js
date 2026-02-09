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
}, { timestamps: true });

export default mongoose.model("PorterTeam", PorterTeamSchema);
