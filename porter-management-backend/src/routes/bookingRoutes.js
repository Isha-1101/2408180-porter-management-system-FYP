import express from "express";
import {
  createIndividualBooking,
  porterAcceptBooking,
  porterRejectBooking,
  completeBooking,
  startBooking,
  confirmPaymentAndSearchPorters,
  updatePaymentMethodAfterCompletion,
} from "../controllers/book-porter/individual-booking-controller.js";
import {
  createTeamBooking,
  teamOwnerReviewBooking,
  teamMemberRespondToBooking,
  teamOwnerConfirmBooking,
  teamOwnerCancelBooking,
  teamOwnerMarkComplete,
  startTeamBooking,
  userStartTeamBooking,
  getTeamBookingStatus,
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
import { PorterSearchValidation } from "../validator/porter-booking-validator.js";
import { validate } from "../middlewares/validate.js";
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
router.post(
  "/search-porters/:bookingType",
  ...userOnly,
  PorterSearchValidation,
  validate,
  searchNearbyPorters,
);

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
  createBookingWithSelectedPorter,
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

/**
 * @route   POST /api/bookings/individual/:id/start
 * @desc    Porter starts the journey (sets IN_PROGRESS)
 * @access  Private (Porter)
 */
router.post("/individual/:id/start", ...porterOnly, startBooking);

/**
 * @route   POST /api/bookings/individual/:id/confirm-and-search
 * @desc    Confirm payment and start searching for porters
 * @access  Private (User)
 */
router.post("/individual/:id/confirm-and-search", ...userOnly, confirmPaymentAndSearchPorters);

/**
 * @route   POST /api/bookings/individual/:id/update-payment-method
 * @desc    Update payment method after journey completion
 * @access  Private (User)
 */
router.post("/individual/:id/update-payment-method", ...userOnly, updatePaymentMethodAfterCompletion);

// ============================================
// TEAM BOOKING ROUTES
// ============================================

/**
 * @route   POST /api/bookings/team
 * @desc    Create team porter booking (notifies all eligible teams)
 * @access  Private (User)
 */
router.post("/team", ...userOnly, createTeamBooking);

/**
 * @route   GET /api/bookings/team/:id
 * @desc    Get team booking status with member responses
 * @access  Private (User or assigned Porter)
 */
router.get("/team/:id", ...protect, getTeamBookingStatus);

/**
 * @route   POST /api/bookings/team/:id/review
 * @desc    Team owner reviews booking (forward to team or decline)
 * @access  Private (Team Owner Porter)
 */
router.post("/team/:id/review", ...porterOnly, teamOwnerReviewBooking);

/**
 * @route   POST /api/bookings/team/:id/member/respond
 * @desc    Team member responds to forwarded booking (accept/decline)
 * @access  Private (Team Member Porter)
 */
router.post("/team/:id/member/respond", ...porterOnly, teamMemberRespondToBooking);

/**
 * @route   POST /api/bookings/team/:id/owner/confirm
 * @desc    Team owner confirms booking after quorum reached
 * @access  Private (Team Owner Porter)
 */
router.post("/team/:id/owner/confirm", ...porterOnly, teamOwnerConfirmBooking);

/**
 * @route   POST /api/bookings/team/:id/owner/cancel
 * @desc    Team owner cancels booking
 * @access  Private (Team Owner Porter)
 */
router.post("/team/:id/owner/cancel", ...porterOnly, teamOwnerCancelBooking);

/**
 * @route   POST /api/bookings/team/:id/start
 * @desc    Team owner starts the team booking job (CONFIRMED -> IN_PROGRESS)
 * @access  Private (Team Owner Porter)
 */
router.post("/team/:id/start", ...porterOnly, startTeamBooking);

/**
 * @route   POST /api/bookings/team/:id/complete
 * @desc    Team owner marks booking as complete
 * @access  Private (Team Owner Porter)
 */
router.post("/team/:id/complete", ...porterOnly, teamOwnerMarkComplete);

/**
 * @route   POST /api/bookings/team/:id/user/start
 * @desc    User starts the team booking journey (CONFIRMED -> IN_PROGRESS)
 * @access  Private (User)
 */
router.post("/team/:id/user/start", ...userOnly, userStartTeamBooking);

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
