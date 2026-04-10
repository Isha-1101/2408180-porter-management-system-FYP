import axiosInstance from "../axiosInstance";

// ─────────────────────────────────────────────────────────────────────────────
// TEAM MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

export const requestPorterUserRegistration = (payload) =>
  axiosInstance.post("/team-porters/register-request", {
    userName: payload.userName,
    email: payload.email,
    phone: payload.phone,
  });

export const getRequestedPorterByTeam = (teamId) =>
  axiosInstance.get(`/team-porters/register-request/${teamId}`);

export const getPorterByTeam = (teamId) =>
  axiosInstance.get(`/team-porters/${teamId}`);

export const getTeamDashboard = () =>
  axiosInstance.get("/team-porters/dashboard");

export const getTeamBookingHistory = (status) => {
  const params = status ? `?status=${status}` : "";
  return axiosInstance.get(`/team-porters/booking-history${params}`);
};

export const getTeamPendingBookings = () =>
  axiosInstance.get("/team-porters/pending-bookings");

// ─────────────────────────────────────────────────────────────────────────────
// TEAM JOIN REQUESTS (US-005)
// ─────────────────────────────────────────────────────────────────────────────

export const searchIndividualPorters = (query) =>
  axiosInstance.get("/team-porters/search-porters", { params: query });

export const invitePorterToTeam = (porterId) =>
  axiosInstance.post("/team-porters/invite-porter", { porterId });

export const respondToTeamInvitation = (requestId, action, reason) =>
  axiosInstance.post(`/team-porters/invite/${requestId}/respond`, { action, reason });

export const getPendingTeamJoinRequests = () =>
  axiosInstance.get("/team-porters/join-requests");

export const getMyPendingInvitations = () =>
  axiosInstance.get("/team-porters/my-invitations");

export const removeTeamMember = (porterId) =>
  axiosInstance.delete(`/team-porters/member/${porterId}`);

// ─────────────────────────────────────────────────────────────────────────────
// BROWSE TEAMS (User)
// ─────────────────────────────────────────────────────────────────────────────

export const browseAvailableTeams = (portersRequired) =>
  axiosInstance.get("/team-porters/browse", { params: { portersRequired } });

// ─────────────────────────────────────────────────────────────────────────────
// TEAM BOOKING — USER SIDE
// ─────────────────────────────────────────────────────────────────────────────

export const createTeamBookingService = (payload) =>
  axiosInstance.post("/bookings/team", payload);

export const getTeamBookingStatusService = (bookingId) =>
  axiosInstance.get(`/bookings/team/${bookingId}`);

// ─────────────────────────────────────────────────────────────────────────────
// TEAM BOOKING — TEAM OWNER SIDE
// ─────────────────────────────────────────────────────────────────────────────

export const teamOwnerReviewBookingService = (bookingId, action) =>
  axiosInstance.post(`/bookings/team/${bookingId}/review`, { action });

export const teamOwnerConfirmBookingService = (bookingId) =>
  axiosInstance.post(`/bookings/team/${bookingId}/owner/confirm`);

export const teamOwnerCancelBookingService = (bookingId) =>
  axiosInstance.post(`/bookings/team/${bookingId}/owner/cancel`);

export const completeTeamBookingService = (bookingId) =>
  axiosInstance.post(`/bookings/team/${bookingId}/complete`);

export const startTeamBookingService = (bookingId) =>
  axiosInstance.post(`/bookings/team/${bookingId}/start`);

// ─────────────────────────────────────────────────────────────────────────────
// TEAM BOOKING — TEAM MEMBER SIDE
// ─────────────────────────────────────────────────────────────────────────────

export const teamMemberRespondService = (bookingId, response) =>
  axiosInstance.post(`/bookings/team/${bookingId}/member/respond`, { response });
