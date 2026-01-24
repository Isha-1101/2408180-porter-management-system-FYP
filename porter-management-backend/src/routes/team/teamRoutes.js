import { getPorterByTeamId } from "../../controllers/porters/team/team-controller.js";
import express from "express";
import { authenticate } from "../../middlewares/authMiddleware.js";
import { authorizeRole } from "../../middlewares/roleMiddleware.js";
import { isPorterRegisteredAsTeam } from "../../middlewares/porterRegisterdAsTeam.js";

// Define teamRouter
const teamRouter = express.Router();
// Route to get porter by team ID
teamRouter.get("/:teamId", authenticate, authorizeRole("porter"), isPorterRegisteredAsTeam, getPorterByTeamId);
export default teamRouter;