import PorterBooking from "../../models/PorterBooking.js";
import Porters from "../../models/porter/Porters.js";

/**
 * Get porter analytics dashboard data
 * GET /api/porters/analytics
 * @access Private (Porter)
 */
export const getPorterAnalytics = async (req, res) => {
  try {
    const porterId = req.user.porterId;

    if (!porterId) {
      return res.status(400).json({
        success: false,
        message: "Porter ID not found",
      });
    }

    // Get all bookings where this porter was assigned
    const allBookings = await PorterBooking.find({
      assignedPorterId: porterId,
    }).sort({ createdAt: -1 });

    const totalBookings = allBookings.length;
    const completedBookings = allBookings.filter(
      (b) => b.status === "COMPLETED"
    ).length;
    const cancelledBookings = allBookings.filter(
      (b) => b.status === "CANCELLED"
    ).length;
    const inProgressBookings = allBookings.filter(
      (b) => b.status === "IN_PROGRESS"
    ).length;
    const confirmedBookings = allBookings.filter(
      (b) => b.status === "CONFIRMED"
    ).length;

    const totalEarnings = allBookings
      .filter((b) => b.status === "COMPLETED")
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const completionRate =
      totalBookings > 0 ? ((completedBookings / totalBookings) * 100).toFixed(1) : 0;

    // Monthly earnings (last 6 months)
    const now = new Date();
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthBookings = allBookings.filter(
        (b) =>
          b.status === "COMPLETED" &&
          b.createdAt >= month &&
          b.createdAt < nextMonth
      );
      const monthEarnings = monthBookings.reduce(
        (sum, b) => sum + (b.totalPrice || 0), 0
      );
      monthlyData.push({
        month: month.toLocaleString("default", { month: "short" }),
        bookings: monthBookings.length,
        earnings: monthEarnings,
      });
    }

    // Weekly bookings (last 7 days)
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
      const dayBookings = allBookings.filter(
        (b) => b.createdAt >= dayStart && b.createdAt < dayEnd
      );
      weeklyData.push({
        day: day.toLocaleString("default", { weekday: "short" }),
        bookings: dayBookings.length,
      });
    }

    // Status distribution
    const statusDistribution = {
      COMPLETED: completedBookings,
      CANCELLED: cancelledBookings,
      IN_PROGRESS: inProgressBookings,
      CONFIRMED: confirmedBookings,
      WAITING_PORTER: allBookings.filter((b) => b.status === "WAITING_PORTER").length,
    };

    // Payment method breakdown
    const paymentMethodBreakdown = {
      cash: allBookings.filter((b) => b.paymentMethod === "cash").length,
      digital: allBookings.filter((b) => b.paymentMethod === "digital").length,
      pending: allBookings.filter((b) => !b.paymentMethod).length,
    };

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalBookings,
          completedBookings,
          cancelledBookings,
          inProgressBookings,
          confirmedBookings,
          totalEarnings,
          completionRate,
        },
        monthlyData,
        weeklyData,
        statusDistribution,
        paymentMethodBreakdown,
      },
    });
  } catch (error) {
    console.error("Error fetching porter analytics:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: error.message,
    });
  }
};

/**
 * Get porter booking history
 * GET /api/porters/bookings/history
 * @access Private (Porter)
 */
export const getPorterBookingHistory = async (req, res) => {
  try {
    const porterId = req.user.porterId;
    const { status, page = 1, limit = 20 } = req.query;

    if (!porterId) {
      return res.status(400).json({
        success: false,
        message: "Porter ID not found",
      });
    }

    const query = { assignedPorterId: porterId };
    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await PorterBooking.find(query)
      .populate("userId", "name phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PorterBooking.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching porter booking history:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch booking history",
      error: error.message,
    });
  }
};
