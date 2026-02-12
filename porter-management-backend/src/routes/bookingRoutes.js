import express from "express";
import {
  createIndividualBooking,
  porterAcceptBooking,
  porterRejectBooking,
  completeBooking,
} from "../controllers/book-porter/individual-booking-controller.js";
import {
  createTeamBooking,
  teamLeadAcceptBooking,
  teamLeadSelectPorters,
  teamMemberRespond,
  teamLeadConfirm,
  teamLeadRejectBooking,
  completeTeamBooking,
} from "../controllers/book-porter/team-booking-controller.js";
import {
  getUserBookings,
  getPorterBookings,
  getBookingDetails,
  cancelBooking,
  searchNearbyPorters,
  createBookingWithSelectedPorter,
} from "../controllers/book-porter/porter-booking-controller.js";

import { authenticate } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/roleMiddleware.js";
import { attachPorterId } from "../middlewares/porterMiddleware.js";
const router = express.Router();

// Middleware helpers
const userOnly = [authenticate, attachPorterId, authorizeRole("user")];
const porterOnly = [authenticate, attachPorterId, authorizeRole("porter")];
const protect = [authenticate, attachPorterId]; // For routes accessible by both

//============================================
// SEARCH NEARBY PORTERS
//============================================
/**
 * @route   POST /api/bookings/search-porters
 * @desc    Search for nearby porters
 * @access  Private (User)
 */
router.post("/search-porters/:bookingType", ...userOnly, searchNearbyPorters);

//============================================
// CREATE BOOKING WITH SELECTED PORTER
//============================================
/**
 * @route   POST /api/bookings/create-booking-with-selected-porter
 * @desc    Create booking with selected porter
 * @access  Private (User)
 */
router.post(
  "/create-booking-with-selected-porter/:bookingType",
  ...userOnly,
  createBookingWithSelectedPorter
);

// ============================================
// INDIVIDUAL BOOKING ROUTES
// ============================================

/**
 * @route   POST /api/bookings/individual
 * @desc    Create individual porter booking
 * @access  Private (User)
 */
router.post("/individual", ...userOnly, createIndividualBooking);

/**
 * @route   POST /api/bookings/individual/:id/accept
 * @desc    Porter accepts individual booking
 * @access  Private (Porter)
 */
router.post("/individual/:id/accept", ...porterOnly, porterAcceptBooking);

/**
 * @route   POST /api/bookings/individual/:id/reject
 * @desc    Porter rejects individual booking
 * @access  Private (Porter)
 */
router.post("/individual/:id/reject", ...porterOnly, porterRejectBooking);

/**
 * @route   POST /api/bookings/individual/:id/complete
 * @desc    Complete individual booking
 * @access  Private (Porter)
 */
router.post("/individual/:id/complete", ...porterOnly, completeBooking);

// ============================================
// TEAM BOOKING ROUTES
// ============================================

/**
 * @route   POST /api/bookings/team
 * @desc    Create team porter booking
 * @access  Private (User)
 */
router.post("/team", ...userOnly, createTeamBooking);

/**
 * @route   POST /api/bookings/team/:id/team-lead/accept
 * @desc    Team lead accepts booking request
 * @access  Private (Team Lead Porter)
 */
router.post("/team/:id/team-lead/accept", ...porterOnly, teamLeadAcceptBooking);

/**
 * @route   POST /api/bookings/team/:id/team-lead/select-porters
 * @desc    Team lead selects porters for the booking
 * @access  Private (Team Lead Porter)
 */
router.post(
  "/team/:id/team-lead/select-porters",
  ...porterOnly,
  teamLeadSelectPorters,
);

/**
 * @route   POST /api/bookings/team/:id/team-lead/confirm
 * @desc    Team lead confirms booking after porter responses
 * @access  Private (Team Lead Porter)
 */
router.post("/team/:id/team-lead/confirm", ...porterOnly, teamLeadConfirm);

/**
 * @route   POST /api/bookings/team/:id/team-lead/reject
 * @desc    Team lead rejects booking
 * @access  Private (Team Lead Porter)
 */
router.post("/team/:id/team-lead/reject", ...porterOnly, teamLeadRejectBooking);

/**
 * @route   POST /api/bookings/team/:id/porter/:porterId/respond
 * @desc    Team member responds to porter selection
 * @access  Private (Porter)
 */
router.post(
  "/team/:id/porter/:porterId/respond",
  ...porterOnly,
  teamMemberRespond,
);

/**
 * @route   POST /api/bookings/team/:id/complete
 * @desc    Complete team booking
 * @access  Private (Team Lead Porter)
 */
router.post("/team/:id/complete", ...porterOnly, completeTeamBooking);

// ============================================
// COMMON BOOKING ROUTES
// ============================================

/**
 * @route   GET /api/bookings/user
 * @desc    Get all bookings for current user
 * @access  Private (User)
 * @query   status, bookingType, page, limit
 */
router.get("/user", ...userOnly, getUserBookings);

/**
 * @route   GET /api/bookings/porter
 * @desc    Get all bookings for current porter
 * @access  Private (Porter)
 * @query   status, page, limit
 */
router.get("/porter", ...porterOnly, getPorterBookings);

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking details
 * @access  Private (User or assigned Porter)
 */
router.get("/:id", ...protect, getBookingDetails);

/**
 * @route   DELETE /api/bookings/:id/cancel
 * @desc    Cancel booking
 * @access  Private (User - booking owner)
 */
router.delete("/:id/cancel", ...userOnly, cancelBooking);

export default router;
