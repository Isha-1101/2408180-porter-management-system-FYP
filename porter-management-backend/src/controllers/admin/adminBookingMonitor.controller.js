import PorterBooking from "../../models/PorterBooking.js";
import User from "../../models/User.js";
import Porters from "../../models/porter/Porters.js";

export const getAllBookings = async (req, res) => {
  try {
    const { status, bookingType, page = 1, limit = 20, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (bookingType) query.bookingType = bookingType;
    if (search) {
      query.$or = [
        { "pickup.address": { $regex: search, $options: "i" } },
        { "drop.address": { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await PorterBooking.find(query)
      .populate("userId", "name email phone")
      .populate("assignedPorterId", "userId currentStatus")
      .populate({
        path: "assignedPorterId",
        populate: { path: "userId", select: "name phone" },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const enrichedBookings = bookings.map((b) => ({
      ...b,
      userName: b.userId?.name || "Unknown",
      userPhone: b.userId?.phone || null,
      porterName: b.assignedPorterId?.userId?.name || null,
      porterPhone: b.assignedPorterId?.userId?.phone || null,
      porterCurrentStatus: b.assignedPorterId?.currentStatus || null,
    }));

    const total = await PorterBooking.countDocuments(query);

    const [totalBookings, activeBookings, completedBookings, cancelledBookings, waitingBookings] = await Promise.all([
      PorterBooking.countDocuments(),
      PorterBooking.countDocuments({ status: { $in: ["CONFIRMED", "IN_PROGRESS", "ASSIGNED"] } }),
      PorterBooking.countDocuments({ status: "COMPLETED" }),
      PorterBooking.countDocuments({ status: "CANCELLED" }),
      PorterBooking.countDocuments({ status: { $in: ["WAITING_PORTER", "SEARCHING", "WAITING_TEAM_LEAD"] } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        bookings: enrichedBookings,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
        stats: {
          total: totalBookings,
          active: activeBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
          waiting: waitingBookings,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getBookingDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await PorterBooking.findById(id)
      .populate("userId", "name email phone")
      .populate({
        path: "assignedPorterId",
        populate: { path: "userId", select: "name phone email" },
      })
      .lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Error fetching booking detail:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "SEARCHING", "WAITING_PORTER", "WAITING_TEAM_LEAD",
      "TEAM_LEAD_SELECTING", "WAITING_PORTER_CONFIRMATION",
      "WAITING_PORTER_RESPONSE", "TEAM_LEAD_CONFIRMING",
      "CONFIRMED", "IN_PROGRESS", "ASSIGNED", "CANCELLED", "COMPLETED",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const booking = await PorterBooking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking status updated",
      data: booking,
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getLiveBookings = async (req, res) => {
  try {
    const liveBookings = await PorterBooking.find({
      status: { $in: ["WAITING_PORTER", "CONFIRMED", "IN_PROGRESS", "ASSIGNED", "SEARCHING", "WAITING_TEAM_LEAD"] },
    })
      .populate("userId", "name phone")
      .populate({
        path: "assignedPorterId",
        populate: { path: "userId", select: "name phone" },
      })
      .sort({ createdAt: -1 })
      .lean();

    const enriched = liveBookings.map((b) => ({
      ...b,
      userName: b.userId?.name || "Unknown",
      porterName: b.assignedPorterId?.userId?.name || null,
    }));

    res.status(200).json({
      success: true,
      data: enriched,
      count: enriched.length,
    });
  } catch (error) {
    console.error("Error fetching live bookings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
