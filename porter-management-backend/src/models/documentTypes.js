import mongoose from "mongoose";

const DocumentTypesSchema = new mongoose.Schema(
  {
    systemName: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("DocumentTypes", DocumentTypesSchema);
