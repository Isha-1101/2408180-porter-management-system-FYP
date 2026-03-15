import express from "express";
import {
  submitRating,
  getPorterRating,
  getBookingRating,
} from "../controllers/rating.controller.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/roleMiddleware.js";

const ratingRouter = express.Router();

// Submit a new rating (user only, must be COMPLETED booking owner)
ratingRouter.post(
  "/",
  authenticate,
  authorizeRole("user"),
  submitRating
);

// Get average rating + reviews for a porter (any authenticated user/porter/admin)
ratingRouter.get("/porter/:porterId", authenticate, getPorterRating);

// Check if current user already rated a booking
ratingRouter.get("/booking/:bookingId", authenticate, getBookingRating);

export default ratingRouter;
