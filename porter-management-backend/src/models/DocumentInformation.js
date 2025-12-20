import mongoose from "mongoose";
export const DocumentInformationSchema = new mongoose.Schema(
  {
    porterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Porters",
      required: true,
    },
    porterLincenseNumber: {
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
