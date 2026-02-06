import Porters from "../../../models/porter/Porters";

export const findPorters = async (req, res) => {
  try {
    const { pickupLat, pickupLng, vehicleCategory } = req.query;

    const porters = await Porters.find({
      canAcceptBooking: true,
      isVerified: true,
      status: "active",
    });
  } catch (error) {}
};
export const porterBooking = async (req, res) => {
  try {
    const {
      porterId,
      teamId,
      numberOfPorters,
      pickupLocation,
      dropLocation,
      pickupLat,
      pickupLng,
      bookingDate,
    } = req.body;
  } catch (error) {}
};
