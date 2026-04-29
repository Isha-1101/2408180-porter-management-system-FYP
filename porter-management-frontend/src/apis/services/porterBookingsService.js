import axiosInstance from "../axiosInstance";

// Search nearby porters
export const searchNearByPorterService = (payload) => {
  return axiosInstance.post(
    `/bookings/search-porters/${payload.bookingType}`,
    payload,
  );
};

// Create individual booking — user confirms and sends to nearby porters
export const createIndividualBookingService = (payload) => {
  return axiosInstance.post("/bookings/individual", payload);
};

// Porter accepts a booking request
export const acceptPorterBookingService = (bookingId) => {
  return axiosInstance.post(`/bookings/individual/${bookingId}/accept`);
};

// Porter rejects a booking request
export const rejectPorterBookingService = (bookingId) => {
  return axiosInstance.post(`/bookings/individual/${bookingId}/reject`);
};

// Porter fetches their pending/active booking requests (dashboard)
export const getPorterBookingsService = (params = {}) => {
  return axiosInstance.get("/bookings/porter", { params });
};

// Porter fetches their full booking history (Booking History page)
export const getPorterBookingHistoryService = (params = {}) => {
  return axiosInstance.get("/bookings/porter/history", { params });
};

// Legacy: create booking with a pre-selected porter (keep for team flow)
export const createPorterBookingService = (payload) => {
  return axiosInstance.post(
    `/bookings/create-booking-with-selected-porter/${payload.bookingType}`,
    payload,
  );
};

// User cancels a booking
export const cancelBookingService = (bookingId) => {
  return axiosInstance.delete(`/bookings/${bookingId}/cancel`);
};

// Porter starts a booking (marks as IN_PROGRESS)
export const startBookingService = (bookingId) => {
  return axiosInstance.post(`/bookings/individual/${bookingId}/start`);
};

// Porter completes a booking (marks as COMPLETED)
export const completeBookingService = (bookingId) => {
  return axiosInstance.post(`/bookings/individual/${bookingId}/complete`);
};

// Get a single booking by its ID
export const getBookingByIdService = (bookingId) => {
  return axiosInstance.get(`/bookings/${bookingId}`);
};

// Get user's bookings list
export const getUserBookingsService = (params = {}) => {
  return axiosInstance.get("/bookings/user", { params });
};

// Porter cancels a booking (with daily limit enforcement)
export const porterCancelBookingService = (bookingId, reason) => {
  return axiosInstance.post(`/cancellations/${bookingId}/cancel`, { reason });
};
