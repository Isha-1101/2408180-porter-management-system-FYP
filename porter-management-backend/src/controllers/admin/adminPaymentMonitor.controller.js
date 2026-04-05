import Payment from "../../models/Payment.js";
import PorterBooking from "../../models/PorterBooking.js";
import User from "../../models/User.js";

export const getAllPayments = async (req, res) => {
  try {
    const { status, method, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (method) query.method = method;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payments = await Payment.find(query)
      .populate("userId", "name email phone")
      .populate("bookingId", "status totalPrice pickup drop")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const enriched = payments.map((p) => ({
      ...p,
      userName: p.userId?.name || "Unknown",
      userPhone: p.userId?.phone || null,
      bookingStatus: p.bookingId?.status || "Unknown",
      bookingTotalPrice: p.bookingId?.totalPrice || 0,
      pickupAddress: p.bookingId?.pickup?.address || null,
      dropAddress: p.bookingId?.drop?.address || null,
    }));

    const total = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        payments: enriched,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getRevenueStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const [
      totalRevenue,
      todayRevenue,
      weekRevenue,
      monthRevenue,
      cashRevenue,
      digitalRevenue,
      pendingRevenue,
      failedRevenue,
      paymentStatusBreakdown,
      paymentMethodBreakdown,
    ] = await Promise.all([
      Payment.aggregate([
        { $match: { status: { $in: ["confirmed", "verified"] } } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Payment.aggregate([
        {
          $match: { status: { $in: ["confirmed", "verified"] }, createdAt: { $gte: today } },
        },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Payment.aggregate([
        {
          $match: { status: { $in: ["confirmed", "verified"] }, createdAt: { $gte: weekAgo } },
        },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Payment.aggregate([
        {
          $match: { status: { $in: ["confirmed", "verified"] }, createdAt: { $gte: monthAgo } },
        },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Payment.aggregate([
        { $match: { method: "cash", status: { $in: ["confirmed", "verified"] } } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Payment.aggregate([
        { $match: { method: "digital", status: { $in: ["confirmed", "verified"] } } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Payment.aggregate([
        { $match: { status: "pending" } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Payment.aggregate([
        { $match: { status: "failed" } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Payment.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 }, totalAmount: { $sum: "$amount" } } },
      ]),
      Payment.aggregate([
        { $group: { _id: "$method", count: { $sum: 1 }, totalAmount: { $sum: "$amount" } } },
      ]),
    ]);

    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: { $in: ["confirmed", "verified"] } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: totalRevenue[0]?.total || 0,
        totalTransactions: totalRevenue[0]?.count || 0,
        todayRevenue: todayRevenue[0]?.total || 0,
        todayTransactions: todayRevenue[0]?.count || 0,
        thisWeek: weekRevenue[0]?.total || 0,
        thisMonth: monthRevenue[0]?.total || 0,
        cash: cashRevenue[0]?.total || 0,
        cashCount: cashRevenue[0]?.count || 0,
        digital: digitalRevenue[0]?.total || 0,
        digitalCount: digitalRevenue[0]?.count || 0,
        pending: pendingRevenue[0]?.total || 0,
        pendingCount: pendingRevenue[0]?.count || 0,
        failed: failedRevenue[0]?.total || 0,
        failedCount: failedRevenue[0]?.count || 0,
        statusBreakdown: paymentStatusBreakdown,
        methodBreakdown: paymentMethodBreakdown,
        monthly: monthlyRevenue,
      },
    });
  } catch (error) {
    console.error("Error fetching revenue stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByIdAndUpdate(
      id,
      { status: "verified", verifiedAt: new Date(), verifiedBy: req.user.id },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
