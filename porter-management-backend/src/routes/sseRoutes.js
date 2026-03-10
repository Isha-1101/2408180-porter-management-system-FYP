import express from "express";
import {
  connectUserSSE,
  connectPorterSSE,
} from "../controllers/sse-controller.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { attachPorterId } from "../middlewares/porterMiddleware.js";
import { authorizeRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// SSE doesn't easily support Authorization headers in standard EventSource,
// so the frontend might pass token via query param ?token=...
// Our authenticate middleware checks for token in headers OR req.query.token.
// Let's assume authenticate handles req.query.token natively. If not, we might need a custom wrapper.

const authQueryToken = (req, res, next) => {
  // If frontend sends ?token=xxx, manually set authorization header for existing authenticate middleware
  if (req.query.token && !req.headers.authorization) {
    req.headers.authorization = `Bearer ${req.query.token}`;
  }
  next();
};

const userOnly = [
  authQueryToken,
  authenticate,
  attachPorterId,
  authorizeRole("user"),
];
const porterOnly = [
  authQueryToken,
  authenticate,
  attachPorterId,
  authorizeRole("porter"),
];

/**
 * @route   GET /api/bookings/sse/user
 * @desc    Establish SSE connection for users
 * @access  Private (User)
 */
router.get("/user", ...userOnly, connectUserSSE);

/**
 * @route   GET /api/bookings/sse/porter
 * @desc    Establish SSE connection for porters
 * @access  Private (Porter)
 */
router.get("/porter", ...porterOnly, connectPorterSSE);

export default router;
