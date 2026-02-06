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
    registrationIdType: {
      type: String,
      required: true,
      ref: "DocumentTypes",
    },
    registrationIdNumber: { type: String, required: true },
    registrationIdDocument: [
      {
        idFront: {
          type: String,
          required: true,
        },
        idBack: {
          type: String,
        },
      },
    ],

    porterPhoto: { type: String, required: true },
    experienceYears: { type: Number, default: 1 },
  },
  { timestamps: true },
);

export default mongoose.model("PorterBasicInfo", PorterBasicInfoSchema);
