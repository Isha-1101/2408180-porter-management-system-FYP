import { approvePorterRegisterRequest } from "../../controllers/porters/team/register-request-for-porter.js";
import {
  getAllRegistrations,
  rejectRegistration,
} from "../../controllers/admin/adminRegistration.controller.js";
import { getAdminStats } from "../../controllers/authController.js";

import express from "express";
import { authenticate } from "../../middlewares/authMiddleware.js";
import { authorizeRole } from "../../middlewares/roleMiddleware.js";
const adminRouter = express.Router();

// Porter Registration Approval (Team requested)
adminRouter.post(
  "/approve-porter-registration/:id",
  authenticate,
  authorizeRole("admin"),
  approvePorterRegisterRequest,
);

// Porter Registrations (Self-registered)
adminRouter.get(
  "/registrations",
  authenticate,
  authorizeRole("admin"),
  getAllRegistrations,
);

adminRouter.post(
  "/registrations/:id/reject",
  authenticate,
  authorizeRole("admin"),
  rejectRegistration,
);

adminRouter.get("/stats", authenticate, authorizeRole("admin"), getAdminStats);

export default adminRouter;