import PorterBooking from "../../models/PorterBooking.js";
import CancellationLog from "../../models/CancellationLog.js";
import Payment from "../../models/Payment.js";
import PorterRegistration from "../../models/porter/porter-registration.js";
import User from "../../models/User.js";
import Porters from "../../models/porter/Porters.js";

export const getRecentActivity = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const [
      recentBookings,
      recentCancellations,
      recentPayments,
      recentRegistrations,
      recentUsers,
      recentPorters,
    ] = await Promise.all([
      PorterBooking.find()
        .populate("userId", "name")
        .populate({ path: "assignedPorterId", populate: { path: "userId", select: "name" } })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .lean(),
      CancellationLog.find()
        .populate("userId", "name")
        .populate({
          path: "bookingId",
          populate: { path: "userId", select: "name" },
        })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .lean(),
      Payment.find()
        .populate("userId", "name")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .lean(),
      PorterRegistration.find()
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .lean(),
      User.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select("name email role createdAt")
        .lean(),
      Porters.find()
        .populate("userId", "name")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .lean(),
    ]);

    const activityFeed = [];

    recentBookings.forEach((b) => {
      activityFeed.push({
        _id: `booking-${b._id}`,
        type: "booking",
        action: `New booking created`,
        status: b.status,
        userName: b.userId?.name || "Unknown",
        porterName: b.assignedPorterId?.userId?.name || null,
        details: `Booking #${String(b._id).slice(-6).toUpperCase()} - ${b.status}`,
        timestamp: b.createdAt,
        metadata: { bookingId: b._id, status: b.status },
      });
    });

    recentCancellations.forEach((c) => {
      activityFeed.push({
        _id: `cancel-${c._id}`,
        type: "cancellation",
        action: `Booking cancelled`,
        status: "CANCELLED",
        userName: c.userId?.name || "Unknown",
        porterName: c.bookingId?.userId?.name || null,
        details: `Cancelled by ${c.cancelledBy}: ${c.reason}`,
        timestamp: c.createdAt,
        metadata: { reason: c.reason, cancelledBy: c.cancelledBy },
      });
    });

    recentPayments.forEach((p) => {
      activityFeed.push({
        _id: `payment-${p._id}`,
        type: "payment",
        action: `Payment ${p.status}`,
        status: p.status,
        userName: p.userId?.name || "Unknown",
        details: `NPR ${p.amount} via ${p.method} - ${p.status}`,
        timestamp: p.createdAt,
        metadata: { amount: p.amount, method: p.method, status: p.status },
      });
    });

    recentRegistrations.forEach((r) => {
      activityFeed.push({
        _id: `registration-${r._id}`,
        type: "registration",
        action: `Porter registration ${r.status}`,
        status: r.status,
        userName: r.userId?.name || "Unknown",
        details: `Registration ${r.status} - ${r.userId?.email || ""}`,
        timestamp: r.createdAt,
        metadata: { registrationStatus: r.status },
      });
    });

    recentUsers.forEach((u) => {
      activityFeed.push({
        _id: `user-${u._id}`,
        type: "user",
        action: `New ${u.role} registered`,
        status: "active",
        userName: u.name,
        details: `New ${u.role}: ${u.email}`,
        timestamp: u.createdAt,
        metadata: { role: u.role },
      });
    });

    recentPorters.forEach((p) => {
      activityFeed.push({
        _id: `porter-${p._id}`,
        type: "porter",
        action: `Porter ${p.status}`,
        status: p.status,
        userName: p.userId?.name || "Unknown",
        details: `Porter registered - ${p.porterType} - ${p.status}`,
        timestamp: p.createdAt,
        metadata: { porterType: p.porterType, porterStatus: p.status },
      });
    });

    activityFeed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
      success: true,
      data: {
        activities: activityFeed.slice(0, parseInt(limit)),
        count: activityFeed.length,
      },
    });
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getSystemHealth = async (req, res) => {
  try {
    const [
      totalUsers,
      activePorters,
      activeBookings,
      pendingPayments,
      pendingRegistrations,
    ] = await Promise.all([
      User.countDocuments({ isDeleted: false, isBanned: false }),
      Porters.countDocuments({ status: "active", currentStatus: { $in: ["online", "busy"] } }),
      PorterBooking.countDocuments({
        status: { $in: ["CONFIRMED", "IN_PROGRESS", "ASSIGNED"] },
      }),
      Payment.countDocuments({ status: "pending" }),
      PorterRegistration.countDocuments({ status: "submitted" }),
    ]);

    const alerts = [];

    if (pendingPayments > 10) {
      alerts.push({
        type: "warning",
        message: `${pendingPayments} payments pending verification`,
        severity: "medium",
      });
    }

    if (pendingRegistrations > 5) {
      alerts.push({
        type: "info",
        message: `${pendingRegistrations} porter registrations awaiting approval`,
        severity: "low",
      });
    }

    if (activeBookings > 50) {
      alerts.push({
        type: "info",
        message: `High booking volume: ${activeBookings} active bookings`,
        severity: "low",
      });
    }

    if (activePorters < 3) {
      alerts.push({
        type: "critical",
        message: `Low porter availability: only ${activePorters} online`,
        severity: "high",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        health: {
          totalUsers,
          activePorters,
          activeBookings,
          pendingPayments,
          pendingRegistrations,
        },
        alerts,
        status: alerts.some((a) => a.severity === "critical") ? "degraded" : "healthy",
      },
    });
  } catch (error) {
    console.error("Error checking system health:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
