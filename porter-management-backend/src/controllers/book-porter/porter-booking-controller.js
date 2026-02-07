import mongoose from "mongoose";
import PorterBooking from "../../models/PorterBooking.js";
import Porters from "../../models/porter/Porters.js";
import BookintgPorterRequest from "../../models/BookintgPorterRequest.js";

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
