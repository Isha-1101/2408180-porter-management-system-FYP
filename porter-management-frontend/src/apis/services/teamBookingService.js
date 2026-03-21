/**
 * @file teamBookingService.js
 * @description API service layer for all team-porter related endpoints.
 *
 * Covers two domains:
 *   1. Team management (registration requests, fetching team members)
 *   2. Team booking lifecycle (create → team-lead accept/reject → select porters
 *      → porter respond → confirm → complete)
 *
 * All functions return Axios promises; error handling is done in the
 * corresponding React Query hooks (porterTeamHooks.jsx).
 */

import axiosInstance from "../axiosInstance";

// ─────────────────────────────────────────────────────────────────────────────
// TEAM MANAGEMENT (formerly teamSearvice.js — typo corrected)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Team lead requests a porter user to join the team.
 * POST /api/team-porters/register-request
 * @param {{ userName: string, email: string, phone: string }} payload
 */
export const requestPorterUserRegistration = (payload) =>
  axiosInstance.post("/team-porters/register-request", {
    userName: payload.userName,
    email: payload.email,
    phone: payload.phone,
  });

/**
 * Fetch all pending (not-yet-approved) registration requests for a team.
 * GET /api/team-porters/register-request/:teamId
 * @param {string} teamId
 */
export const getRequestedPorterByTeam = (teamId) =>
  axiosInstance.get(`/team-porters/register-request/${teamId}`);

/**
 * Fetch all active porters belonging to a team.
 * GET /api/team-porters/:teamId
 * @param {string} teamId
 */
export const getPorterByTeam = (teamId) =>
  axiosInstance.get(`/team-porters/${teamId}`);

// ─────────────────────────────────────────────────────────────────────────────
// TEAM BOOKING — USER SIDE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new team porter booking.
 * POST /api/bookings/team
 *
 * @param {{
 *   pickup: { lat: number, lng: number, address: string },
 *   drop:   { lat: number, lng: number, address: string },
 *   weightKg: number,
 *   teamSize: number,
 *   requirements?: string,
 *   bookingDate?: string,
 *   bookingTime?: string,
 *   hasVehicle?: boolean,
 *   vehicleType?: string,
 *   numberOfVehicles?: number,
 *   radiusKm?: number
 * }} payload
 */
export const createTeamBookingService = (payload) =>
  axiosInstance.post("/bookings/team", payload);

// ─────────────────────────────────────────────────────────────────────────────
// TEAM BOOKING — TEAM LEAD SIDE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Team lead accepts a booking request.
 * POST /api/bookings/team/:id/team-lead/accept
 *
 * Response: { booking, availableMembers, requiredMembers }
 *
 * @param {string} bookingId
 */
export const teamLeadAcceptBookingService = (bookingId) =>
  axiosInstance.post(`/bookings/team/${bookingId}/team-lead/accept`);

/**
 * Team lead rejects a booking request.
 * POST /api/bookings/team/:id/team-lead/reject
 *
 * @param {string} bookingId
 */
export const teamLeadRejectBookingService = (bookingId) =>
  axiosInstance.post(`/bookings/team/${bookingId}/team-lead/reject`);

/**
 * Team lead selects specific porters for the booking.
 * POST /api/bookings/team/:id/team-lead/select-porters
 *
 * @param {string}   bookingId
 * @param {string[]} selectedPorterIds  – Array of porter _id strings
 */
export const teamLeadSelectPortersService = (bookingId, selectedPorterIds) =>
  axiosInstance.post(`/bookings/team/${bookingId}/team-lead/select-porters`, {
    selectedPorterIds,
  });

/**
 * Team lead confirms the booking after enough porters have accepted.
 * POST /api/bookings/team/:id/team-lead/confirm
 *
 * @param {string} bookingId
 */
export const teamLeadConfirmBookingService = (bookingId) =>
  axiosInstance.post(`/bookings/team/${bookingId}/team-lead/confirm`);

/**
 * Team lead marks the team booking as completed.
 * POST /api/bookings/team/:id/complete
 *
 * @param {string} bookingId
 */
export const completeTeamBookingService = (bookingId) =>
  axiosInstance.post(`/bookings/team/${bookingId}/complete`);

// ─────────────────────────────────────────────────────────────────────────────
// TEAM BOOKING — TEAM MEMBER SIDE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A selected team member accepts or rejects the booking invitation.
 * POST /api/bookings/team/:id/porter/:porterId/respond
 *
 * @param {string}  bookingId
 * @param {string}  porterId  – The responding porter's _id
 * @param {boolean} accepted  – true = accept, false = reject
 */
export const teamMemberRespondService = (bookingId, porterId, accepted) =>
  axiosInstance.post(`/bookings/team/${bookingId}/porter/${porterId}/respond`, {
    accepted,
  });
