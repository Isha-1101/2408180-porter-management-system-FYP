import mongoose from "mongoose";

const PorterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PorterRegistration",
      // required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["active", "pending", "inactive", "banned"],
      default: "pending",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    latitude: Number,
    longitude: Number,
  },
  { timestamps: true },
);

export default mongoose.model("Porters", PorterSchema);
