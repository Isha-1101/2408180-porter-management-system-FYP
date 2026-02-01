import { approvePorterRegisterRequest } from "../../controllers/porters/team/register-request-for-porter.js";

import express from "express";
import { authenticate } from "../../middlewares/authMiddleware.js";
import { authorizeRole } from "../../middlewares/roleMiddleware.js";
const adminRouter = express.Router();

adminRouter.post(
  "/approve-porter-registration/:id",
  authenticate,
  authorizeRole("admin"),
  approvePorterRegisterRequest,
);
export default adminRouter;