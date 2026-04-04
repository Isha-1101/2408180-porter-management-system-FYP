import express from "express";
import {
  initiatePayment,
  getPaymentByBooking,
  verifyCashPayment,
  retryEsewaPayment,
  esewaSuccessCallback,
  esewaFailureCallback,
  esewaWebhook,
  getUserPaymentHistory,
} from "../controllers/paymentController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Public eSewa callbacks (no auth required)
router.get("/esewa/success", esewaSuccessCallback);
router.get("/esewa/failure", esewaFailureCallback);
router.post("/esewa/webhook", esewaWebhook);

// Protected payment routes (requires authentication)
router.post("/initiate", authenticate, initiatePayment);
router.get("/:bookingId", authenticate, getPaymentByBooking);
router.post(
  "/:paymentId/verify-cash",
  authenticate,
  authorizeRole("admin"),
  verifyCashPayment,
);
router.post("/:paymentId/retry-esewa", authenticate, retryEsewaPayment);
router.get("/user/:userId/history", authenticate, getUserPaymentHistory);

export default router;
