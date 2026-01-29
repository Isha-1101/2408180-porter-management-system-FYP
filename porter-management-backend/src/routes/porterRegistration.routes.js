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
  startRegistration
);

/**
 * STEP 1: Basic Info + Photo
 */
porterRegistrationRouter.put(
  "/:registrationId/basic-info",
  authenticate,
  authorizeRole("porter"),
  upload.single("porterPhoto"),
  saveBasicInfo
);

/**
 * STEP 2: Vehicle Info
 */
porterRegistrationRouter.put(
  "/:registrationId/vehicle",
  authenticate,
  authorizeRole("porter"),
  saveVehicleInfo
);

/**
 * STEP 3: Documents (License)
 */
porterRegistrationRouter.put(
  "/:registrationId/documents",
  authenticate,
  authorizeRole("porter"),
  upload.single("documentFile"),
  saveDocuments
);

/**
 * Get full progress (resume)
 */
porterRegistrationRouter.get(
  "/:registrationId",
  authenticate,
  authorizeRole("porter"),
  getRegistrationProgress
);

porterRegistrationRouter.get(
  "/user",
  authenticate,
  authorizeRole("porter"),
  getProterRegistrationByUserId
);
/**
 * Submit registration
 */
porterRegistrationRouter.post(
  "/:registrationId/submit",
  authenticate,
  authorizeRole("porter"),
  submitRegistration
);

//admin
/**
 * Approve registration
 */
porterRegistrationRouter.post(
  "/:registrationId/approve",
  authenticate,
  authorizeRole("admin"),
  approveRegistration
);

export default porterRegistrationRouter;
