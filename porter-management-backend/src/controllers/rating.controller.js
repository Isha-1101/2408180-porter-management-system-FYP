import PorterRating from "../models/PortersReview.js";
import PorterBooking from "../models/PorterBooking.js";
import Porters from "../models/porter/Porters.js";

/**
 * Submit a rating for a porter after a completed booking
 * POST /core-api/ratings
 * @access user
 */
export const submitRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId, porterId, rating, comment } = req.body;

    if (!bookingId || !porterId || !rating) {
      return res.status(400).json({
        success: false,
        message: "bookingId, porterId, and rating are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Verify the booking is COMPLETED and belongs to this user
    const booking = await PorterBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to rate this booking",
      });
    }

    if (booking.status !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "You can only rate completed bookings",
      });
    }

    // Prevent duplicate ratings per booking
    const existingRating = await PorterRating.findOne({ bookingId, userId });
    if (existingRating) {
      return res.status(409).json({
        success: false,
        message: "You have already rated this booking",
      });
    }

    const review = await PorterRating.create({
      bookingId,
      userId,
      porterId,
      rating: Number(rating),
      comment: comment?.trim() || "",
    });

    return res.status(201).json({
      success: true,
      message: "Rating submitted successfully",
      data: review,
    });
  } catch (error) {
    console.error("Error submitting rating:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get average rating + reviews for a porter
 * GET /core-api/ratings/porter/:porterId
 */
export const getPorterRating = async (req, res) => {
  try {
    const { porterId } = req.params;

    const reviews = await PorterRating.find({ porterId })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .limit(20);

    const total = await PorterRating.countDocuments({ porterId });

    const averageRating =
      total > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    // Calculate distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });

    return res.status(200).json({
      success: true,
      data: {
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalRatings: total,
        distribution,
        reviews,
      },
    });
  } catch (error) {
    console.error("Error fetching porter rating:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Check if a booking has already been rated by the current user
 * GET /core-api/ratings/booking/:bookingId
 */
export const getBookingRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;

    const existing = await PorterRating.findOne({ bookingId, userId });

    return res.status(200).json({
      success: true,
      data: {
        rated: !!existing,
        review: existing || null,
      },
    });
  } catch (error) {
    console.error("Error checking booking rating:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
