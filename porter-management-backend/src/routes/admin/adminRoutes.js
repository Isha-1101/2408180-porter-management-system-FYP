import express from "express";
import { authenticate } from "../../middlewares/authMiddleware.js";
import { authorizeRole } from "../../middlewares/roleMiddleware.js";
import { attachPorterId } from "../../middlewares/porterMiddleware.js";

import {
  approvePorterRegisterRequest,
  getAllRegisterRequestedPorter,
} from "../../controllers/porters/team/register-request-for-porter.js";
import {
  getAllRegistrations,
  rejectRegistration,
} from "../../controllers/admin/adminRegistration.controller.js";
import { getAdminStats } from "../../controllers/authController.js";
import {
  getComprehensiveAdminStats,
  getBookingTrends,
  getBookingStatusDistribution,
} from "../../controllers/admin/adminAnalytics.controller.js";
import {
  getAllBookings,
  getBookingDetail,
  updateBookingStatus,
  getLiveBookings,
} from "../../controllers/admin/adminBookingMonitor.controller.js";
import {
  getAllCancellations,
  getCancellationStats,
} from "../../controllers/admin/adminCancellationMonitor.controller.js";
import {
  getAllPayments,
  getRevenueStats,
  verifyPayment,
} from "../../controllers/admin/adminPaymentMonitor.controller.js";
import {
  getAllPorterPerformance,
  getPorterDetail,
  getPorterStats,
} from "../../controllers/admin/adminPorterPerformance.controller.js";
import {
  getRecentActivity,
  getSystemHealth,
} from "../../controllers/admin/adminActivityFeed.controller.js";

const adminRouter = express.Router();

const adminAuth = [authenticate, authorizeRole("admin")];

// --- Overview & Analytics ---
adminRouter.get("/stats", ...adminAuth, getAdminStats);
adminRouter.get("/analytics/comprehensive", ...adminAuth, getComprehensiveAdminStats);
adminRouter.get("/analytics/trends", ...adminAuth, getBookingTrends);
adminRouter.get("/analytics/distribution", ...adminAuth, getBookingStatusDistribution);

// --- System Health & Activity ---
adminRouter.get("/system-health", ...adminAuth, getSystemHealth);
adminRouter.get("/activity-feed", ...adminAuth, getRecentActivity);

// --- Booking Monitor ---
adminRouter.get("/bookings", ...adminAuth, getAllBookings);
adminRouter.get("/bookings/live", ...adminAuth, getLiveBookings);
adminRouter.get("/bookings/:id", ...adminAuth, getBookingDetail);
adminRouter.put("/bookings/:id/status", ...adminAuth, updateBookingStatus);

// --- Cancellation Monitor ---
adminRouter.get("/cancellations", ...adminAuth, getAllCancellations);
adminRouter.get("/cancellations/stats", ...adminAuth, getCancellationStats);

// --- Payment Monitor ---
adminRouter.get("/payments", ...adminAuth, getAllPayments);
adminRouter.get("/payments/revenue", ...adminAuth, getRevenueStats);
adminRouter.put("/payments/:id/verify", ...adminAuth, verifyPayment);

// --- Porter Performance ---
adminRouter.get("/porters/performance", ...adminAuth, getAllPorterPerformance);
adminRouter.get("/porters/stats", ...adminAuth, getPorterStats);
adminRouter.get("/porters/:id/detail", ...adminAuth, getPorterDetail);

// --- Porter Registrations (existing) ---
adminRouter.post(
  "/approve-porter-registration/:id",
  ...adminAuth,
  approvePorterRegisterRequest,
);
adminRouter.get("/registrations", ...adminAuth, getAllRegistrations);
adminRouter.post("/registrations/:id/reject", ...adminAuth, rejectRegistration);

// --- Team Member Requests (team-owner added porters awaiting admin approval) ---
adminRouter.get("/team-member-requests", ...adminAuth, async (req, res) => {
  try {
    const { RequestedUserPorter } = await import("../../models/porter/requested-user-porter.js");
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};
    // Frontend sends "submitted" for pending items — map it back to "pending"
    if (status === "submitted" || status === "pending") query.status = "pending";
    else if (status === "approved" || status === "rejected") query.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const data = await RequestedUserPorter.find(query)
      .populate({ path: "teamId", populate: { path: "ownerId", select: "name" } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    const total = await RequestedUserPorter.countDocuments(query);
    return res.status(200).json({
      success: true,
      data,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    console.error("Error fetching team member requests:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

adminRouter.post("/team-member-requests/:id/reject", ...adminAuth, async (req, res) => {
  try {
    const { RequestedUserPorter } = await import("../../models/porter/requested-user-porter.js");
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const request = await RequestedUserPorter.findByIdAndUpdate(
      id,
      { status: "rejected", rejectionReason },
      { new: true }
    );
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });
    return res.status(200).json({ success: true, message: "Request rejected", data: request });
  } catch (err) {
    console.error("Error rejecting team member request:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// --- Cash Refund Approval (from cancellation routes) ---
import CancellationLog from "../../models/CancellationLog.js";

adminRouter.post("/:cancellationId/approve-refund", ...adminAuth, async (req, res) => {
  try {
    const { cancellationId } = req.params;
    const cancellation = await CancellationLog.findById(cancellationId);
    if (!cancellation) {
      return res.status(404).json({ success: false, message: "Cancellation record not found" });
    }
    cancellation.refundStatus = "processed";
    cancellation.approvedBy = req.user.id;
    cancellation.approvedAt = new Date();
    await cancellation.save();
    res.status(200).json({ success: true, message: "Cash refund approved", data: cancellation });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error approving refund", error: error.message });
  }
});

adminRouter.post("/:cancellationId/reject-refund", ...adminAuth, async (req, res) => {
  try {
    const { cancellationId } = req.params;
    const { rejectionReason } = req.body;
    const cancellation = await CancellationLog.findById(cancellationId);
    if (!cancellation) {
      return res.status(404).json({ success: false, message: "Cancellation record not found" });
    }
    cancellation.refundStatus = "failed";
    cancellation.approvedBy = req.user.id;
    cancellation.rejectionReason = rejectionReason || "Admin rejected";
    cancellation.approvedAt = new Date();
    await cancellation.save();
    res.status(200).json({ success: true, message: "Cash refund rejected", data: cancellation });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error rejecting refund", error: error.message });
  }
});

export default adminRouter;
