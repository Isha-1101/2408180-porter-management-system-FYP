import { getPorterByTeamId } from "../../controllers/porters/team/team-controller.js";
import express from "express";
import { authenticate } from "../../middlewares/authMiddleware.js";
import { authorizeRole } from "../../middlewares/roleMiddleware.js";
import { isPorterRegisteredAsTeam } from "../../middlewares/porterRegisterdAsTeam.js";
import { registerRequestForPorter } from "../../controllers/porters/team/register-request-for-porter.js";
// Define teamRouter
const teamRouter = express.Router();
// Route to get porter by team ID
teamRouter.get(
  "/:teamId",
  authenticate,
  authorizeRole("porter"),
  isPorterRegisteredAsTeam,
  getPorterByTeamId,
);
teamRouter.post(
  "/register-request",
  authenticate,
  authorizeRole("porter"),
  registerRequestForPorter,
);
export default teamRouter;
