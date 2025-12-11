// models/porterRating.model.js
import mongoose from "mongoose";

const porterReviewSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "porter_bookings",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    porterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "porters",
      required: true,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    comment: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const PorterRating = mongoose.model("porter_reviews", porterReviewSchema);

export default PorterRating;
