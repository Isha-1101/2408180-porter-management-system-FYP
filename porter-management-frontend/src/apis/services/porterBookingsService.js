import axiosInstance from "../axiosInstance";

export const searchNearByPorterService = (payload) => {
  return axiosInstance.post(`/bookings/search-porters/${payload.bookingType}`, {
    pickup: {
      lat: 27.66149059909361,
      lng: 85.40445148786628,
    },
    drop: {
      lat: 27.6614906,
      lng: 85.4044515,
    },
    weightKg: 120,
    hasVehicle: false,
  });
};

export const createPorterBookingService = (payload) => {
  return axiosInstance.post(
    `/bookings/create-booking-with-selected-porter/${payload.bookingType}`,
    {
      porterId: "69873501dd3d90ffce7854f7",
      pickup: {
        lat: 27.66149059909361,
        lng: 85.40445148786628,
      },
      drop: {
        lat: 27.6614906,
        lng: 85.4044515,
      },
      weightKg: 120,
      hasVehicle: false,
    },
  );
};
