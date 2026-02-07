import mongoose from "mongoose";
import PorterBasicInfo from "../../models/porter/porter-basic-info.js";
import PorterRegistration from "../../models/porter/porter-registration.js";
import PorterDocument from "../../models/porter/porter-document-info.js";
import PorterVehicle from "../../models/porter/porter-vehicle-info.js";
import Porters from "../../models/porter/Porters.js";
import { uploadToCloudinary } from "../uploadToCloudinary.js";
import porterTeam from "../../models/porter/porterTeam.js";
import User from "../../models/User.js";
import registeredAsPorterMailController from "../../utils/nodeMailer/controller/registerdAsPorterController.js";
// export const startRegistration = async (req, res) => {
//   try {
//     const registrationId = `DKN-${Date.now()}`;

//     const registration = await PorterRegistration.findOneAndUpdate(
//       { userId: req.user.id },
//       {
//         $setOnInsert: {
//           registrationId,
//           userId: req.user.id,
//           status: "draft",
//         },
//       },
//       { upsert: true, new: true },
//     );

//     res.status(200).json({
//       success: true,
//       registrationId: registration.registrationId,
//     });
//   } catch (error) {
//     console.error("Error starting registration:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to start registration",
//     });
//   }
// };

export const startRegistration = async (req, res) => {
  try {
    const { registrationType } = req.body;

    // if (!registrationType) {
    //   return res.status(400).json({ message: "registrationType is required" });
    // }

    const targetUserId = req.user.id;

    // Check existing registration
    const existingRegistration = await PorterRegistration.findOne({
      userId: targetUserId,
      // registrationType,
      status: { $ne: "submitted" },
    });

    if (existingRegistration) {
      if (!existingRegistration.registrationId) {
        return res.status(400).json({
          success: false,
          message:
            "Existing registration found without registrationId. Please contact support.",
        });
      }
    }
    if (existingRegistration) {
      return res.status(200).json({
        success: true,
        registrationId: existingRegistration.registrationId,
        teamId: existingRegistration.teamId,
        role: existingRegistration.role,
        message: "Resuming existing registration",
      });
    }

    let finalTeamId = null;
    let role = "owner";

    // Team Owner Registration
    if (registrationType === "team") {
      const team = await porterTeam.create({
        ownerId: targetUserId,
      });
      finalTeamId = team._id;
      role = "owner";
    }

    const user = await User.findById(targetUserId);
    if (user.teamId) {
      finalTeamId = user.teamId;
    }

    // // Team Member Registration
    // if (registrationType === "team_member") {
    //   if (!teamId) {
    //     return res.status(400).json({ message: "teamId is required" });
    //   }
    //   finalTeamId = teamId;
    //   role = "worker";
    // }

    // Create new registration ONLY once
    const registration = await PorterRegistration.create({
      userId: targetUserId,
      registrationId: `DKN-${Date.now()}`,
      createdBy: targetUserId,
      registrationType,
      teamId: finalTeamId,
      role,
      status: "draft",
    });

    return res.status(200).json({
      success: true,
      registrationId: registration.registrationId,
      teamId: finalTeamId,
      role,
      message: "Registration started",
    });
  } catch (error) {
    console.error("Error starting registration:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to start registration",
    });
  }
};

export const saveBasicInfo = async (req, res) => {
  try {
    const { registrationId } = req.params; // this registration ID is created RegistrationID using Date.now()

    if (!req.files || typeof req.files !== "object") {
      return res.status(400).json({
        success: false,
        message: "Files are required and must be valid.",
      });
    }
    const files = req.files;
    //get porter photo
    const porterPhoto = files.porterPhoto ? files.porterPhoto[0] : null;

    //get identity type and number
    const identityCardImageFront = files.identityCardImageFront
      ? files.identityCardImageFront[0]
      : null;

    //get identity number
    const identityCardImageBack = files.identityCardImageBack
      ? files.identityCardImageBack[0]
      : null;
    const registration = await PorterRegistration.findOne({ registrationId });
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    const { fullName, phone, address, identityType, identityNumber } = req.body;
    if (!fullName || !phone || !address || !identityType || !identityNumber) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingBasicInfo = await PorterBasicInfo.findOne({
      registrationId: registration._id,
    });
    const updatePayload = {
      fullName,
      phone,
      address,
      identityType,
      identityNumber,
      registrationIdDocument: existingBasicInfo?.registrationIdDocument || {},
    };

    if (porterPhoto) {
      const uploaded = await uploadToCloudinary(porterPhoto);
      const url = uploaded.url;
      const trimmedUrl = url.split("image")[1];
      updatePayload.porterPhoto = trimmedUrl;
    } else if (existingBasicInfo?.porterPhoto) {
      updatePayload.porterPhoto = existingBasicInfo.porterPhoto;
    }

    if (identityCardImageFront) {
      const uploaded = await uploadToCloudinary(identityCardImageFront);
      const url = uploaded.url;
      const trimmedUrl = url.split("image")[1];
      updatePayload.registrationIdDocument.identityCardImageFront = trimmedUrl;
    } else if (
      existingBasicInfo?.registrationIdDocument.identityCardImageFront
    ) {
      updatePayload.registrationIdDocument.identityCardImageFront =
        existingBasicInfo.registrationIdDocument.identityCardImageFront;
    }

    if (identityCardImageBack) {
      const uploaded = await uploadToCloudinary(identityCardImageBack);
      const url = uploaded.url;
      const trimmedUrl = url.split("image")[1];
      updatePayload.registrationIdDocument.identityCardImageBack = trimmedUrl;
    } else if (
      existingBasicInfo?.registrationIdDocument.identityCardImageBack
    ) {
      updatePayload.registrationIdDocument.identityCardImageBack =
        existingBasicInfo.registrationIdDocument.identityCardImageBack;
    }
    await PorterBasicInfo.findOneAndUpdate(
      { registrationId: registration._id },
      updatePayload,
      {
        upsert: true,
        new: true,
      },
    );

    registration.steps.basicInfo = {
      completed: true,
      updatedAt: new Date(),
    };
    registration.currentStep = 2;
    await registration.save();

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

  const { licenseNumber } = req.body;
  if (!licenseNumber) {
    return res.status(400).json({ message: "License number is required." });
  }

  const file = req.file;
  if (!file) {
    return res.status(400).json({
      success: false,
      message: "porter document is required",
    });
  }

  const registration = await PorterRegistration.findOne({ registrationId });
  if (!registration) {
    return res.status(404).json({ message: "Registration not found" });
  }

  try {
    const existingDocuments = await PorterDocument.findOne({
      registrationId: registration._id,
    });

    const updatePayload = { licenseNumber };
    if (file) {
      const uploaded = await uploadToCloudinary(file);
      const url = uploaded.url;
      const trimmedUrl = url.split("image")[1];
      updatePayload.porterLicenseDocument = trimmedUrl;
    } else if (existingDocuments?.porterLicenseDocument) {
      updatePayload.porterLicenseDocument =
        existingDocuments.porterLicenseDocument;
    }

    await PorterDocument.findOneAndUpdate(
      { registrationId: registration._id },
      updatePayload,
      {
        upsert: true,
        new: true,
      },
    );

    registration.steps.documents = {
      completed: true,
      updatedAt: new Date(),
    };
    registration.currentStep = 3;
    await registration.save();

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
  const { vehicleCategory, vehicleNumber, hasVehicle, capacity } = req.body;

  if (hasVehicle === "true") {
    if (!vehicleCategory || !vehicleNumber) {
      return res.status(400).json({ message: "All fields are required." });
    }
  }

  try {
    const registration = await PorterRegistration.findOne({ registrationId });
    if (!registration) {
      return res
        .status(404)
        .json({ success: false, message: "Registration not found" });
    }

    await PorterVehicle.findOneAndUpdate(
      { registrationId: registration._id },
      { vehicleCategory, vehicleNumber, hasVehicle, capacity },
      { upsert: true, new: true },
    );

    registration.steps.vehicle = {
      completed: true,
      updatedAt: new Date(),
    };
    registration.currentStep = 4;
    await registration.save();

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
    const registration = await PorterRegistration.findOne({ registrationId });
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }
    const [basicInfo, vehicle, documents] = await Promise.all([
      PorterBasicInfo.findOne({ registrationId: registration._id }),
      PorterVehicle.findOne({ registrationId: registration._id }),
      PorterDocument.findOne({ registrationId: registration._id }),
    ]);

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

export const getProterRegistrationByUserId = async (req, res) => {
  const userId = req.user.id;
  try {
    const registration = await PorterRegistration.find({
      userId: userId,
    }).populate("userId");
    if (!registration || registration.length === 0) {
      return res.status(404).json({ message: "Registration not found" });
    }
    res.status(200).json({ success: true, registration });
  } catch (error) {
    console.error("Error getting registration progress:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get registration progress" });
  }
};

export const submitRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const registration = await PorterRegistration.findOne({ registrationId });
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    const { basicInfo, vehicle, documents } = registration.steps;

    if (!basicInfo.completed || !vehicle.completed || !documents.completed) {
      return res.status(400).json({
        message: "Complete all steps before submission",
      });
    }

    registration.status = "submitted";
    await registration.save();

    res.status(200).json({
      success: true,
      message: "Registration submitted for admin approval",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Submission failed" });
  }
};

export const approveRegistration = async (req, res) => {
  const { registrationId } = req.params;
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const registration = await PorterRegistration.findOne(
        { registrationId },
        null,
        { session },
      );
      if (!registration || registration.status !== "submitted") {
        throw new Error("Invalid registration");
      }

      // Prevent duplicate porter
      // const existingPorter = await Porters.findOne(
      //   { userId: registration.userId },
      //   null,
      //   { session },
      // );

      // if (existingPorter ) {
      //   throw new Error("Porter already exists for this user");
      // }

      let porterType;
      let role;
      let teamId = null;
      let canAcceptBooking = true;
      let userId;

      // Derive behavior from registrationType
      if (registration.registrationType === "individual") {
        porterType = "individual";
        role = "worker";
        canAcceptBooking = true;
        userId = registration.userId;
        teamId = registration.teamId ? registration.teamId : null;
      }

      if (registration.registrationType === "team") {
        porterType = "team";
        role = "owner";
        canAcceptBooking = false;
        userId = registration.userId;
        teamId = registration?.teamId;
      }

      const porter = await Porters.create(
        [
          {
            userId: userId,
            porterType,
            role,
            teamId,
            canAcceptBooking,
            status: "active",
            isVerified: true,
            registrationId: registration._id,
          },
        ],
        { session },
      );
      const user = await User.findById(userId);
      registration.status = "approved";
      await registeredAsPorterMailController(user.email, user.name);
      await registration.save({ session });
    });

    return res.status(200).json({
      success: true,
      message: "Registration approved and porter created",
    });
  } catch (error) {
    console.error("Approve registration error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to approve registration",
    });
  } finally {
    session.endSession();
  }
};
