// models/locationLog.model.js
import mongoose from "mongoose";

const locationLogSchema = new mongoose.Schema(
  {
    porterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "porters",
      required: true,
    },

    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "porter_teams",
      default: null,
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

const LocationLog = mongoose.model("location_logs", locationLogSchema);
export default LocationLog;