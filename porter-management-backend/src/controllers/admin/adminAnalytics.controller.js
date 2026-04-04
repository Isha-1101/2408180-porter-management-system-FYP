import PorterBooking from "../../models/PorterBooking.js";
import Payment from "../../models/Payment.js";
import User from "../../models/User.js";
import Porters from "../../models/porter/Porters.js";
import PorterRegistration from "../../models/porter/porter-registration.js";
import CancellationLog from "../../models/CancellationLog.js";
import LocationLog from "../../models/LocationLogs.js";
import Message from "../../models/Message.js";

export const getComprehensiveAdminStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const safeCount = async (model, query = {}, label = "") => {
      try {
        return await model.countDocuments(query);
      } catch (e) {
        console.error(`safeCount error [${label}]:`, e.message);
        return 0;
      }
    };

    const safeAggregate = async (model, pipeline, label = "") => {
      try {
        return await model.aggregate(pipeline);
      } catch (e) {
        console.error(`safeAggregate error [${label}]:`, e.message);
        return [];
      }
    };

    const [
      totalUsers,
      activeUsers,
      bannedUsers,
      deletedUsers,
      totalPorters,
      activePorters,
      busyPorters,
      offlinePorters,
      pendingRegistrations,
      totalBookings,
      activeBookings,
      completedBookings,
      cancelledBookings,
      waitingBookings,
      totalRevenue,
      todayRevenue,
      pendingPayments,
      verifiedPayments,
      failedPayments,
      todayCancellations,
      totalCancellations,
      todayMessages,
    ] = await Promise.all([
      safeCount(User, { isDeleted: false }, "totalUsers"),
      safeCount(User, { isDeleted: false, isBanned: false }, "activeUsers"),
      safeCount(User, { isBanned: true }, "bannedUsers"),
      safeCount(User, { isDeleted: true }, "deletedUsers"),
      safeCount(Porters, {}, "totalPorters"),
      safeCount(Porters, { status: "active", currentStatus: "online" }, "activePorters"),
      safeCount(Porters, { status: "active", currentStatus: "busy" }, "busyPorters"),
      safeCount(Porters, { currentStatus: "offline" }, "offlinePorters"),
      safeCount(PorterRegistration, { status: "submitted" }, "pendingRegistrations"),
      safeCount(PorterBooking, {}, "totalBookings"),
      safeCount(PorterBooking, { status: { $in: ["CONFIRMED", "IN_PROGRESS", "ASSIGNED"] } }, "activeBookings"),
      safeCount(PorterBooking, { status: "COMPLETED" }, "completedBookings"),
      safeCount(PorterBooking, { status: "CANCELLED" }, "cancelledBookings"),
      safeCount(PorterBooking, { status: { $in: ["WAITING_PORTER", "SEARCHING", "WAITING_TEAM_LEAD"] } }, "waitingBookings"),
      safeAggregate(Payment, [
        { $match: { status: { $in: ["confirmed", "verified"] } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ], "totalRevenue"),
      safeAggregate(Payment, [
        { $match: { status: { $in: ["confirmed", "verified"] }, createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ], "todayRevenue"),
      safeCount(Payment, { status: "pending" }, "pendingPayments"),
      safeCount(Payment, { status: "verified" }, "verifiedPayments"),
      safeCount(Payment, { status: "failed" }, "failedPayments"),
      safeCount(CancellationLog, { createdAt: { $gte: today } }, "todayCancellations"),
      safeCount(CancellationLog, {}, "totalCancellations"),
      safeCount(Message, { createdAt: { $gte: today } }, "todayMessages"),
    ]);

    const bookingsThisWeek = await safeCount(PorterBooking, { createdAt: { $gte: weekAgo } }, "bookingsThisWeek");
    const newUsersThisWeek = await safeCount(User, { createdAt: { $gte: weekAgo }, isDeleted: false }, "newUsersThisWeek");

    const resData = {
      users: {
        total: totalUsers,
        active: activeUsers,
        banned: bannedUsers,
        deleted: deletedUsers,
        newThisWeek: newUsersThisWeek,
      },
      porters: {
        total: totalPorters,
        online: activePorters,
        busy: busyPorters,
        offline: offlinePorters,
        pendingRegistrations,
      },
      bookings: {
        total: totalBookings,
        active: activeBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
        waiting: waitingBookings,
        thisWeek: bookingsThisWeek,
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        today: todayRevenue[0]?.total || 0,
        pending: pendingPayments,
        verified: verifiedPayments,
        failed: failedPayments,
      },
      cancellations: {
        total: totalCancellations,
        today: todayCancellations,
      },
      activity: {
        messagesToday: todayMessages,
      },
    };

    res.status(200).json({
      success: true,
      data: resData,
    });
  } catch (error) {
    console.error("Error fetching comprehensive admin stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getBookingTrends = async (req, res) => {
  try {
    const { period = "7d" } = req.query;
    const now = new Date();
    let startDate;
    let groupFormat;

    switch (period) {
      case "24h":
        startDate = new Date(now - 24 * 60 * 60 * 1000);
        groupFormat = { $dateToString: { format: "%H:00", date: "$createdAt" } };
        break;
      case "7d":
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      case "30d":
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      default:
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    }

    const bookingTrends = await PorterBooking.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: groupFormat, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const revenueTrends = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ["confirmed", "verified"] },
        },
      },
      { $group: { _id: groupFormat, revenue: { $sum: "$amount" } } },
      { $sort: { _id: 1 } },
    ]);

    const cancellationTrends = await CancellationLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: groupFormat, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        bookings: bookingTrends,
        revenue: revenueTrends,
        cancellations: cancellationTrends,
      },
    });
  } catch (error) {
    console.error("Error fetching booking trends:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getBookingStatusDistribution = async (req, res) => {
  try {
    const distribution = await PorterBooking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const bookingTypeDistribution = await PorterBooking.aggregate([
      { $group: { _id: "$bookingType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const paymentMethodDistribution = await Payment.aggregate([
      { $group: { _id: "$method", count: { $sum: 1 }, totalAmount: { $sum: "$amount" } } },
      { $sort: { count: -1 } },
    ]);

    const vehicleTypeDistribution = await PorterBooking.aggregate([
      { $match: { vehicleType: { $ne: null } } },
      { $group: { _id: "$vehicleType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        status: distribution,
        bookingType: bookingTypeDistribution,
        paymentMethod: paymentMethodDistribution,
        vehicleType: vehicleTypeDistribution,
      },
    });
  } catch (error) {
    console.error("Error fetching distribution data:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
