import mongoose from "mongoose";
export const DocumentInformationSchema = new mongoose.Schema(
  {
    porterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Porters",
      required: true,
    },
    userId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    porterLicenseNumber: {
      type: String,
      required: true,
    },
    porterLicenseDocument: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const DocumentInformation = mongoose.model(
  "DocumentInformation",
  DocumentInformationSchema
);
export default DocumentInformation;
