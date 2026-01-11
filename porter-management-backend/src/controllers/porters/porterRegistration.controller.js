import mongoose from "mongoose";
import PorterBasicInfo from "../../models/porter/porter-basic-info.js";
import PorterRegistration from "../../models/porter/porter-registration.js";
import PorterDocument from "../../models/porter/porter-document-info.js";
import PorterVehicle from "../../models/porter/porter-vehicle-info.js";
import Porters from "../../models/porter/Porters.js";
import { uploadToCloudinary } from "../uploadToCloudinary.js";

export const startRegistration = async (req, res) => {
  try {
    const registration = await PorterRegistration.findOneAndUpdate(
      { userId: req.user.id },
      {},
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, registrationId: registration._id });
  } catch (error) {
    console.error("Error starting registration:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to start registration" });
  }
};

export const saveBasicInfo = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const file = req.file;
    const registration = await PorterRegistration.findById(registrationId);
    if (
      !file &&
      req.user.role !== "admin" &&
      !registration?.steps?.basicInfo?.completed
    ) {
      return res.status(400).json({
        success: false,
        message: "Porter photo is required.",
      });
    }
    const { fullName, phone, address, porterType } = req.body;
    // Validate fields
    if (!fullName || !phone || !address || !porterType) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (!["individual", "team_member"].includes(porterType)) {
      return res.status(400).json({
        message: "porterType must be either 'individual' or 'team_member'.",
      });
    }

    const existingBasicInfo = await PorterBasicInfo.findOne({ registrationId });
    const updatePayload = { fullName, phone, address, porterType };

    if (file) {
      const uploaded = await uploadToCloudinary(file);
      const url = uploaded.url;
      const trimmedUrl = url.split("image")[1];
      updatePayload.porterPhoto = trimmedUrl;
    } else if (existingBasicInfo?.porterPhoto) {
      updatePayload.porterPhoto = existingBasicInfo.porterPhoto;
    }

    await PorterBasicInfo.findOneAndUpdate(
      { registrationId },
      updatePayload,
      { upsert: true, new: true }
    );

    await PorterRegistration.findByIdAndUpdate(registrationId, {
      currentStep: 2,
      "steps.basicInfo.completed": true,
      "steps.basicInfo.updatedAt": new Date(),
    });

    res.status(200).json({ success: true, message: "Basic info saved" });
  } catch (error) {
    console.error("Error saving basic info:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to save basic info" });
  }
};

export const saveDocuments = async (req, res) => {
  const { registrationId } = req.params;
  const file = req.file;
  const registration = await PorterRegistration.findById(registrationId);
  if (!file && !registration?.steps?.documents?.completed) {
    return res.status(400).json({
      success: false,
      message: "porter document is required",
    });
  }
  const { licenseNumber } = req.body;
  try {
    const existingDocuments = await PorterDocument.findOne({ registrationId });
    const updatePayload = { licenseNumber };

    if (file) {
      const uploaded = await uploadToCloudinary(file);
      const url = uploaded.url;
      const trimmedUrl = url.split("image")[1];
      updatePayload.licenseDocument = trimmedUrl;
    } else if (existingDocuments?.licenseDocument) {
      updatePayload.licenseDocument = existingDocuments.licenseDocument;
    }

    await PorterDocument.findOneAndUpdate(
      { registrationId },
      updatePayload,
      { upsert: true, new: true }
    );

    await PorterRegistration.findByIdAndUpdate(registrationId, {
      currentStep: 4,
      "steps.documents.completed": true,
      "steps.documents.updatedAt": new Date(),
    });

    res.status(200).json({ success: true, message: "Documents saved" });
  } catch (error) {
    console.error("Error saving documents:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to save documents" });
  }
};

export const saveVehicleInfo = async (req, res) => {
  const { registrationId } = req.params;
  try {
    await PorterVehicle.findOneAndUpdate(
      { registrationId },
      { ...req.body },
      { upsert: true, new: true }
    );

    await PorterRegistration.findByIdAndUpdate(registrationId, {
      currentStep: 3,
      "steps.vehicle.completed": true,
      "steps.vehicle.updatedAt": new Date(),
    });

    res.status(200).json({ success: true, message: "Vehicle info saved" });
  } catch (error) {
    console.error("Error saving vehicle info:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to save vehicle info" });
  }
};

export const getRegistrationProgress = async (req, res) => {
  const { registrationId } = req.params;
  try {
    const registration = await PorterRegistration.findById(registrationId);
    const basicInfo = await PorterBasicInfo.findOne({ registrationId });
    const vehicle = await PorterVehicle.findOne({ registrationId });
    const documents = await PorterDocument.findOne({ registrationId });

    res.status(200).json({
      success: true,
      registration,
      basicInfo,
      vehicle,
      documents,
    });
  } catch (error) {
    console.error("Error getting registration progress:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get registration progress" });
  }
};

export const submitRegistration = async (req, res) => {
  const { registrationId } = req.params;
  try {
    const registration = await PorterRegistration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    const steps = registration.steps;
    if (
      !steps.basicInfo.completed ||
      !steps.vehicle.completed ||
      !steps.documents.completed
    ) {
      return res.status(400).json({ message: "All steps must be completed" });
    }

    registration.status = "submitted";
    await registration.save();

    res.status(200).json({ message: "Registration submitted", success: true });
  } catch (error) {
    console.error("Error submitting registration:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to submit registration" });
  }
};

export const approveRegistration = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const registration = await PorterRegistration.findById(
      req.params.registrationId
    );
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    await Porters.create([{ userId: registration.userId }], { session });

    registration.status = "approved";
    await registration.save({ session });

    await session.commitTransaction();
    res
      .status(200)
      .json({ message: "Porter approved & created", success: true });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};
