import mongoose from "mongoose";

const PorterDocumentSchema = new mongoose.Schema(
  {
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PorterRegistration",
      required: true,
      unique: true,
    },

    licenseNumber: { type: String, required: true },
    licenseDocument: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model(
  "PorterDocument",
  PorterDocumentSchema
);
