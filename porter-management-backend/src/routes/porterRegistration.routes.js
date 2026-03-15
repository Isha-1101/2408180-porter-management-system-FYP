import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  startRegistration,
  saveBasicInfo,
  saveVehicleInfo,
  saveDocuments,
  getRegistrationProgress,
  submitRegistration,
  approveRegistration,
  getProterRegistrationByUserId,
} from "../controllers/porters/porterRegistration.controller.js";

import upload from "../middlewares/uploadFile.js";
import { authorizeRole } from "../middlewares/roleMiddleware.js";
const porterRegistrationRouter = Router();

/**
 * Start / Resume registration
 * Creates draft if not exists
 */
porterRegistrationRouter.post(
  "/start",
  authenticate,
  authorizeRole("porter"),
  startRegistration,
);

/**
 * STEP: Basic Info + Photo
 */
porterRegistrationRouter.put(
  "/:registrationId/basic-info",
  authenticate,
  authorizeRole("porter"),
  upload.fields([
    { name: "identityCardImageFront", maxCount: 1 },
    { name: "identityCardImageBack", maxCount: 1 },
    { name: "porterPhoto", maxCount: 1 },
  ]),
  saveBasicInfo,
);

/**
 * STEP: Vehicle Info
 */
porterRegistrationRouter.put(
  "/:registrationId/vehicle",
  authenticate,
  authorizeRole("porter"),
  saveVehicleInfo,
);

/**
 * STEP: Documents (License)
 */
porterRegistrationRouter.put(
  "/:registrationId/documents",
  authenticate,
  authorizeRole("porter"),
  upload.single("porterLicenseDocument"),
  saveDocuments,
);

/**
 * Get full progress (resume)
 */
porterRegistrationRouter.get(
  "/user",
  authenticate,
  authorizeRole("porter"),
  getProterRegistrationByUserId,
);

porterRegistrationRouter.get(
  "/:registrationId",
  authenticate,
  authorizeRole("porter"),
  getRegistrationProgress,
);
/**
 * Submit registration
 */
porterRegistrationRouter.post(
  "/:registrationId/submit",
  authenticate,
  authorizeRole("porter"),
  submitRegistration,
);

/**
 * Approve registration
 */
porterRegistrationRouter.post(
  "/:registrationId/approve",
  authenticate,
  authorizeRole("admin"),
  approveRegistration,
);

export default porterRegistrationRouter;
