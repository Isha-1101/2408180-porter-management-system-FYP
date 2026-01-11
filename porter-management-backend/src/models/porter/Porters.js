import mongoose from "mongoose";

const PorterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "banned"],
      default: "active",
    },

    isVerified: {
      type: Boolean,
      default: true,
    },

    latitude: Number,
    longitude: Number,
  },
  { timestamps: true }
);

export default mongoose.model("Porters", PorterSchema);
