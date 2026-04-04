import express from "express";
import {
  cancelBooking,
  getUserCancellationHistory,
  getPorterCancellationHistory,
  getRemainingCancellationsToday,
  approveCashRefund,
  rejectCashRefund,
} from "../controllers/cancellationController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/roleMiddleware.js";
const router = express.Router();

// User/Porter routes
router.post("/:bookingId/cancel", authenticate, cancelBooking);
router.get("/remaining", authenticate, getRemainingCancellationsToday);
router.get("/user/:userId/history", authenticate, getUserCancellationHistory);
router.get(
  "/porter/:porterId/history",
  authenticate,
  getPorterCancellationHistory,
);

// Admin routes
router.post(
  "/:cancellationId/approve-refund",
  authenticate,
  authorizeRole("admin"),
  approveCashRefund,
);
router.post(
  "/:cancellationId/reject-refund",
  authenticate,
  authorizeRole("admin"),
  rejectCashRefund,
);

export default router;
