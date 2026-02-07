import mongoose from "mongoose";

const PorterDocumentSchema = new mongoose.Schema(
  {
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PorterRegistration",
      required: true,
      index: true,
    },

    // documentType: { type: String, required: true },
    licenseNumber:{ type: String, required: true },
    porterLicenseDocument: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model(
  "PorterDocument",
  PorterDocumentSchema
);
