import Porters from "../../models/porter/Porters.js";
import PorterBooking from "../../models/PorterBooking.js";
import User from "../../models/User.js";
import LocationLog from "../../models/LocationLogs.js";
import PortersReview from "../../models/PortersReview.js";

export const getAllPorterPerformance = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const porters = await Porters.find(query)
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const porterIds = porters.map((p) => p._id);

    const [completedCounts, cancelledCounts, activeBookings, reviews] = await Promise.all([
      PorterBooking.aggregate([
        { $match: { assignedPorterId: { $in: porterIds }, status: "COMPLETED" } },
        { $group: { _id: "$assignedPorterId", count: { $sum: 1 } } },
      ]),
      PorterBooking.aggregate([
        { $match: { assignedPorterId: { $in: porterIds }, status: "CANCELLED" } },
        { $group: { _id: "$assignedPorterId", count: { $sum: 1 } } },
      ]),
      PorterBooking.aggregate([
        {
          $match: {
            assignedPorterId: { $in: porterIds },
            status: { $in: ["CONFIRMED", "IN_PROGRESS", "ASSIGNED"] },
          },
        },
        { $group: { _id: "$assignedPorterId", count: { $sum: 1 } } },
      ]),
      PortersReview.find({ porterId: { $in: porterIds } }).lean(),
    ]);

    const porterEarnings = await PorterBooking.aggregate([
      { $match: { assignedPorterId: { $in: porterIds }, status: "COMPLETED" } },
      { $group: { _id: "$assignedPorterId", totalEarnings: { $sum: "$totalPrice" } } },
    ]);

    const enriched = porters.map((p) => {
      const completed = completedCounts.find((c) => c._id?.toString() === p._id.toString());
      const cancelled = cancelledCounts.find((c) => c._id?.toString() === p._id.toString());
      const active = activeBookings.find((c) => c._id?.toString() === p._id.toString());
      const earnings = porterEarnings.find((e) => e._id?.toString() === p._id.toString());
      const porterReviews = reviews.filter(
        (r) => r.porterId?.toString() === p._id.toString()
      );
      const avgRating =
        porterReviews.length > 0
          ? (porterReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / porterReviews.length).toFixed(1)
          : "N/A";

      return {
        ...p,
        userName: p.userId?.name || "Unknown",
        userEmail: p.userId?.email || null,
        userPhone: p.userId?.phone || null,
        completedBookings: completed?.count || 0,
        cancelledBookings: cancelled?.count || 0,
        activeBookings: active?.count || 0,
        totalEarnings: earnings?.totalEarnings || 0,
        averageRating: avgRating,
        totalReviews: porterReviews.length,
      };
    });

    const total = await Porters.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        porters: enriched,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching porter performance:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getPorterDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const porter = await Porters.findById(id)
      .populate("userId", "name email phone")
      .lean();

    if (!porter) {
      return res.status(404).json({
        success: false,
        message: "Porter not found",
      });
    }

    const [
      completedBookings,
      cancelledBookings,
      activeBookings,
      totalEarnings,
      reviews,
      recentLocations,
    ] = await Promise.all([
      PorterBooking.find({ assignedPorterId: id, status: "COMPLETED" })
        .populate("userId", "name")
        .sort({ completedAt: -1 })
        .limit(10)
        .lean(),
      PorterBooking.countDocuments({ assignedPorterId: id, status: "CANCELLED" }),
      PorterBooking.countDocuments({
        assignedPorterId: id,
        status: { $in: ["CONFIRMED", "IN_PROGRESS", "ASSIGNED"] },
      }),
      PorterBooking.aggregate([
        { $match: { assignedPorterId: porter._id, status: "COMPLETED" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      PortersReview.find({ porterId: id })
        .populate("userId", "name")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      LocationLog.find({ porterId: id }).sort({ timestamp: -1 }).limit(20).lean(),
    ]);

    const avgRating =
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : "N/A";

    res.status(200).json({
      success: true,
      data: {
        ...porter,
        userName: porter.userId?.name || "Unknown",
        userEmail: porter.userId?.email || null,
        userPhone: porter.userId?.phone || null,
        completedBookings,
        cancelledBookings,
        activeBookings,
        totalEarnings: totalEarnings[0]?.total || 0,
        reviews,
        averageRating: avgRating,
        recentLocations,
      },
    });
  } catch (error) {
    console.error("Error fetching porter detail:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getPorterStats = async (req, res) => {
  try {
    const [
      totalPorters,
      onlinePorters,
      busyPorters,
      offlinePorters,
      activePorters,
      bannedPorters,
      pendingPorters,
      individualPorters,
      teamPorters,
      verifiedPorters,
    ] = await Promise.all([
      Porters.countDocuments(),
      Porters.countDocuments({ currentStatus: "online" }),
      Porters.countDocuments({ currentStatus: "busy" }),
      Porters.countDocuments({ currentStatus: "offline" }),
      Porters.countDocuments({ status: "active" }),
      Porters.countDocuments({ status: "banned" }),
      Porters.countDocuments({ status: "pending" }),
      Porters.countDocuments({ porterType: "individual" }),
      Porters.countDocuments({ porterType: "team" }),
      Porters.countDocuments({ isVerified: true }),
    ]);

    const topPerformers = await PorterBooking.aggregate([
      { $match: { status: "COMPLETED" } },
      { $group: { _id: "$assignedPorterId", count: { $sum: 1 }, earnings: { $sum: "$totalPrice" } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalPorters,
        online: onlinePorters,
        busy: busyPorters,
        offline: offlinePorters,
        active: activePorters,
        banned: bannedPorters,
        pending: pendingPorters,
        individual: individualPorters,
        team: teamPorters,
        verified: verifiedPorters,
        topPerformers,
      },
    });
  } catch (error) {
    console.error("Error fetching porter stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
