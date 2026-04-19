import express from "express";
import { authenticate } from "../../middlewares/authMiddleware.js";
import { authorizeRole } from "../../middlewares/roleMiddleware.js";
import { isPorterRegisteredAsTeam } from "../../middlewares/porterRegisterdAsTeam.js";
import { attachPorterId } from "../../middlewares/porterMiddleware.js";
import {
  getPorterByTeamId,
  getTeamDashboard,
  getTeamBookingHistory,
  getTeamPendingBookings,
} from "../../controllers/porters/team/team-controller.js";
import {
  searchIndividualPorters,
  invitePorterToTeam,
  respondToTeamInvitation,
  getPendingTeamJoinRequests,
  getMyPendingInvitations,
  removeTeamMember,
} from "../../controllers/porters/team/team-join-request-controller.js";
import {
  browseAvailableTeams,
} from "../../controllers/porters/team/team-browse-controller.js";
import {
  getAllRegisterRequestedPorter,
  registerRequestForPorter,
} from "../../controllers/porters/team/register-request-for-porter.js";

const teamRouter = express.Router();

// ─── Team Management (Owner) ─────────────────────────────────────────────────

teamRouter.get(
  "/dashboard",
  authenticate,
  authorizeRole("porter"),
  attachPorterId,
  isPorterRegisteredAsTeam,
  getTeamDashboard,
);

teamRouter.get(
  "/booking-history",
  authenticate,
  authorizeRole("porter"),
  attachPorterId,
  isPorterRegisteredAsTeam,
  getTeamBookingHistory,
);

teamRouter.get(
  "/pending-bookings",
  authenticate,
  authorizeRole("porter"),
  attachPorterId,
  isPorterRegisteredAsTeam,
  getTeamPendingBookings,
);

// ─── Team Join Requests (US-005) ─────────────────────────────────────────────
teamRouter.get(
  "/join-requests",
  authenticate,
  authorizeRole("porter"),
  attachPorterId,
  isPorterRegisteredAsTeam,
  getPendingTeamJoinRequests,
);

teamRouter.get(
  "/search-porters",
  authenticate,
  authorizeRole("porter"),
  isPorterRegisteredAsTeam,
  searchIndividualPorters,
);

teamRouter.post(
  "/invite-porter",
  authenticate,
  authorizeRole("porter"),
  attachPorterId,
  isPorterRegisteredAsTeam,
  invitePorterToTeam,
);

teamRouter.post(
  "/invite/:requestId/respond",
  authenticate,
  authorizeRole("porter"),
  attachPorterId,
  respondToTeamInvitation,
);

teamRouter.get(
  "/my-invitations",
  authenticate,
  authorizeRole("porter"),
  attachPorterId,
  getMyPendingInvitations,
);

teamRouter.delete(
  "/member/:porterId",
  authenticate,
  authorizeRole("porter"),
  attachPorterId,
  isPorterRegisteredAsTeam,
  removeTeamMember,
);

// ─── Browse Teams (User) ─────────────────────────────────────────────────────
teamRouter.get(
  "/browse",
  authenticate,
  authorizeRole("user"),
  browseAvailableTeams,
);

// ─── Legacy Routes (keep for backward compatibility) ─────────────────────────
teamRouter.get(
  "/register-request/:teamId",
  authenticate,
  authorizeRole("porter"),
  getAllRegisterRequestedPorter,
);

teamRouter.post(
  "/register-request",
  authenticate,
  authorizeRole("porter"),
  registerRequestForPorter,
);

// ─── Wildcard Route (Must be last) ───────────────────────────────────────────
teamRouter.get(
  "/:teamId",
  authenticate,
  authorizeRole("porter"),
  attachPorterId,
  isPorterRegisteredAsTeam,
  getPorterByTeamId,
);

export default teamRouter;
