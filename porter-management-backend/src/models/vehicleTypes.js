import mongoose from "mongoose";

export const VehicleTypesSchema = new mongoose.Schema(
  {
    porterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Porters",
      required: true,
    },
    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
    },
    vehicleCategory: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);
const VehicleTypes = mongoose.model("VehicleTypes", VehicleTypesSchema);
export default VehicleTypes;
