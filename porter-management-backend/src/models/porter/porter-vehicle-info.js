import mongoose from "mongoose";

const PorterVehicleSchema = new mongoose.Schema(
  {
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PorterRegistration",
      required: true,
      index: true,
      unique: true,
    },
    hasVehicle: { type: Boolean, required: true },
    vehicleNumber: {
      type: String,
      required: function () {
        return this.hasVehicle;
      },
    },
    vehicleCategory: {
      type: String,
       ref: "VehicleTypes",
      required: function () {
        return this.hasVehicle;
      },
    },
    capacity: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model("PorterVehicle", PorterVehicleSchema);
