import mongoose from "mongoose";
import PorterBooking from "../../models/PorterBooking.js";
import Porters from "../../models/porter/Porters.js";
import BookintgPorterRequest from "../../models/BookintgPorterRequest.js";

export const searchPorters = async (req, res) => {
  //search porter as team and individual
  try {
    const { porterType, pickup, drop, weightKg, vehicleCategory } = req.body;

    if (!porterType || !pickup || !drop || !weightKg || !vehicleCategory) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }
    const porters = await Porters.find({
      status: "active",
      isVerified: true,
      canAcceptBooking: true,
      currentStatus: "online",
    });

    if (porterType === "team") {
      porters.push(
        ...(await Porters.find({
          teamId: { $exists: true },
        })),
      );
    }

    res.status(200).json({
      success: true,
      message: "Porters found successfully",
      data: porters,
    });
  } catch (error) {
    console.error("Error searching for porters:", error);
    res.status(500).json({ success: false, message: "An error occurred." });
  }
};
export const createBookingAndNotifyPorters = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { pickup, drop, weightKg, vehicleCategory } = req.body;

    const userId = req.user.id; // assuming auth middleware

    //Create booking
    const booking = await PorterBooking.create(
      [
        {
          userId,
          pickup,
          drop,
          weightKg,
          status: "SEARCHING",
        },
      ],
      { session },
    );

    const bookingDoc = booking[0];

    // Find eligible porters within 5km
    const porters = await Porters.aggregate([
      // Geo filter (5km)
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [pickup.lng, pickup.lat],
          },
          maxDistance: 5000,
          distanceField: "distanceMeters",
          spherical: true,
          query: {
            status: "active",
            isVerified: true,
            canAcceptBooking: true,
            currentStatus: "online",
            maxWeightKg: { $gte: weightKg },
          },
        },
      },

      // Join with PorterVehicle using registrationId
      {
        $lookup: {
          from: "portervehicles",
          localField: "registrationId",
          foreignField: "registrationId",
          as: "vehicle",
        },
      },

      { $unwind: "$vehicle" },

      // Vehicle filtering logic
      {
        $match:
          vehicleCategory === "NO_VEHICLE"
            ? {
              "vehicle.hasVehicle": false,
            }
            : {
              "vehicle.hasVehicle": true,
              "vehicle.vehicleCategory": vehicleCategory,
            },
      },

      // Sort nearest first
      { $sort: { distanceMeters: 1 } },

      // Limit blast
      { $limit: 5 },
    ]);

    // If no porters found
    if (!porters.length) {
      await session.abortTransaction();
      session.endSession();

      return res.status(404).json({
        success: false,
        message: "No porters available within 5 km",
      });
    }

    // Create porter requests
    const porterRequests = porters.map((porter) => ({
      bookingId: bookingDoc._id,
      porterId: porter._id,
      distanceKm: Number((porter.distanceKm / 1000).toFixed(2)), // meters → km
      status: "PENDING",
    }));

    await BookintgPorterRequest.insertMany(porterRequests, { session });

    // Update booking status
    bookingDoc.status = "WAITING_PORTER";
    await bookingDoc.save({ session });

    await session.commitTransaction();
    session.endSession();

    // TODO: push notification / socket event here

    return res.status(201).json({
      success: true,
      message: "Booking created, searching for nearby porters",
      bookingId: bookingDoc._id,
      portersNotified: porters.length,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create booking",
    });
  }
};

/**
 * Get all bookings for current user
 * GET /api/bookings/user
 */
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, bookingType, page = 1, limit = 10 } = req.query;

    const query = { userId };

    if (status) {
      query.status = status;
    }

    if (bookingType) {
      query.bookingType = bookingType;
    }

    const bookings = await PorterBooking.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("assignedPorterId", "userId")
      .populate("assignedTeamId");

    const total = await PorterBooking.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

/**
 * Get all bookings for current porter
 * GET /api/bookings/porter
 */
export const getPorterBookings = async (req, res) => {
  try {
    const porterId = req.user.porterId;
    const { status, page = 1, limit = 10 } = req.query;

    if (!porterId) {
      return res.status(403).json({
        success: false,
        message: "Porter ID not found",
      });
    }

    // Find bookings where porter is assigned (individual or team)
    const query = {
      $or: [
        { assignedPorterId: porterId },
        { "assignedPorters.porterId": porterId },
      ],
    };

    if (status) {
      query.status = status;
    }

    const bookings = await PorterBooking.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("userId", "name email phone");

    const total = await PorterBooking.countDocuments(query);

    // Also get pending requests for this porter
    const pendingRequests = await BookintgPorterRequest.find({
      porterId,
      status: "PENDING",
    })
      .populate("bookingId")
      .limit(10);

    return res.status(200).json({
      success: true,
      data: {
        bookings,
        pendingRequests,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching porter bookings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

/**
 * Get booking details
 * GET /api/bookings/:id
 */
export const getBookingDetails = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;
    const porterId = req.user.porterId;

    const booking = await PorterBooking.findById(bookingId)
      .populate("userId", "name email phone")
      .populate("assignedPorterId")
      .populate("assignedTeamId")
      .populate("assignedPorters.porterId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check authorization
    const isOwner = booking.userId._id.toString() === userId.toString();
    const isAssignedPorter =
      booking.assignedPorterId?.toString() === porterId?.toString();
    const isTeamMember = booking.assignedPorters?.some(
      (p) => p.porterId._id.toString() === porterId?.toString()
    );

    if (!isOwner && !isAssignedPorter && !isTeamMember && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this booking",
      });
    }

    // Get additional details for team bookings
    let teamSelection = null;
    if (booking.bookingType === "team") {
      teamSelection = await import("../../models/TeamBookingSelection.js").then(
        (m) =>
          m.default.findOne({ bookingId }).populate("selectedPorters.porterId")
      );
    }

    return res.status(200).json({
      success: true,
      data: {
        booking,
        teamSelection,
      },
    });
  } catch (error) {
    console.error("Error fetching booking details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch booking details",
      error: error.message,
    });
  }
};

/**
 * Cancel booking
 * DELETE /api/bookings/:id/cancel
 */
export const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;
    const { reason } = req.body;

    const booking = await PorterBooking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Only owner can cancel
    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this booking",
      });
    }

    // Can only cancel if not completed
    if (booking.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel completed booking",
      });
    }

    // Update booking
    booking.status = "CANCELLED";
    booking.cancelledBy = userId;
    booking.cancellationReason = reason || "Cancelled by user";
    await booking.save();

    // Expire all pending requests
    await BookintgPorterRequest.updateMany(
      {
        bookingId,
        status: "PENDING",
      },
      {
        status: "EXPIRED",
        respondedAt: new Date(),
      }
    );

    // Notify assigned porter if any
    if (booking.assignedPorterId) {
      const porter = await Porters.findById(booking.assignedPorterId).populate(
        "userId"
      );
      if (porter && porter.userId) {
        const { notifyUser } = await import(
          "../../utils/notification-service.js"
        );
        notifyUser(
          porter.userId._id,
          booking,
          "BOOKING_CANCELLED",
          "The booking has been cancelled by the user"
        ).catch((err) => console.error("Notification error:", err));
      }
    }

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: { booking },
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
      error: error.message,
    });
  }
};
