// models/porterTeam.model.js
import mongoose from "mongoose";

const porterTeamSchema = new mongoose.Schema(
  {
    teamLeaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    teamName: {
      type: String,
      required: true,
      trim: true,
    },

    teamSize: {
      type: Number,
      default: 1,
      min: 1,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const PorterTeam = mongoose.model("porter_teams", porterTeamSchema);
export default PorterTeam;
