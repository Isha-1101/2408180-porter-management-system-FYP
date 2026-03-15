import axiosInstance from "../axiosInstance";

// Submit a rating for a porter on a completed booking
export const submitRating = (data) => {
  return axiosInstance.post("/ratings", data);
};

// Get average rating + review list for a specific porter
export const getPorterRating = (porterId) => {
  return axiosInstance.get(`/ratings/porter/${porterId}`);
};

// Check if a booking has already been rated by the current user
export const getBookingRating = (bookingId) => {
  return axiosInstance.get(`/ratings/booking/${bookingId}`);
};
