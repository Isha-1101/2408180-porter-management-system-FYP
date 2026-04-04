import CancellationLog from "../../models/CancellationLog.js";
import PorterBooking from "../../models/PorterBooking.js";
import User from "../../models/User.js";
import Porters from "../../models/porter/Porters.js";

export const getAllCancellations = async (req, res) => {
  try {
    const { cancelledBy, page = 1, limit = 20 } = req.query;
    const query = {};

    if (cancelledBy) query.cancelledBy = cancelledBy;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const cancellations = await CancellationLog.find(query)
      .populate({
        path: "bookingId",
        populate: [
          { path: "userId", select: "name email phone" },
          { path: "assignedPorterId", populate: { path: "userId", select: "name phone" } },
        ],
      })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const enriched = cancellations.map((c) => ({
      ...c,
      bookingUserName: c.bookingId?.userId?.name || "Unknown",
      porterName: c.bookingId?.assignedPorterId?.userId?.name || null,
      bookingStatus: c.bookingId?.status || "Unknown",
      bookingTotalPrice: c.bookingId?.totalPrice || 0,
    }));

    const total = await CancellationLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        cancellations: enriched,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching cancellations:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCancellationStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const [
      totalCancellations,
      todayCancellations,
      weekCancellations,
      monthCancellations,
      userCancelled,
      porterCancelled,
      topCancellationReasons,
    ] = await Promise.all([
      CancellationLog.countDocuments(),
      CancellationLog.countDocuments({ createdAt: { $gte: today } }),
      CancellationLog.countDocuments({ createdAt: { $gte: weekAgo } }),
      CancellationLog.countDocuments({ createdAt: { $gte: monthAgo } }),
      CancellationLog.countDocuments({ cancelledBy: "user" }),
      CancellationLog.countDocuments({ cancelledBy: "porter" }),
      CancellationLog.aggregate([
        { $group: { _id: "$reason", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const cancellationRate = await PorterBooking.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] },
          },
        },
      },
    ]);

    const rate = cancellationRate[0]
      ? ((cancellationRate[0].cancelled / cancellationRate[0].total) * 100).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        total: totalCancellations,
        today: todayCancellations,
        thisWeek: weekCancellations,
        thisMonth: monthCancellations,
        byUser: userCancelled,
        byPorter: porterCancelled,
        cancellationRate: `${rate}%`,
        topReasons: topCancellationReasons,
      },
    });
  } catch (error) {
    console.error("Error fetching cancellation stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
