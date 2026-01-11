import mongoose from "mongoose";

const PorterBasicInfoSchema = new mongoose.Schema(
  {
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PorterRegistration",
      required: true,
      unique: true,
    },

    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },

    porterType: {
      type: String,
      enum: ["individual", "team_member"],
      required: true,
    },

    porterPhoto: { type: String, required: true },
    experienceYears: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.model(
  "PorterBasicInfo",
  PorterBasicInfoSchema
);
