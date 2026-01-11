import mongoose from "mongoose";

const PorterVehicleSchema = new mongoose.Schema(
  {
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PorterRegistration",
      required: true,
      unique: true,
    },

    vehicleNumber: { type: String, required: true },
    vehicleCategory: { type: String, required: true },
    capacity: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model(
  "PorterVehicle",
  PorterVehicleSchema
);
