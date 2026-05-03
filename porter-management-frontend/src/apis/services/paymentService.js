import axiosInstance from "../axiosInstance";

// Initiate payment (cash or digital)
export const initiatePaymentService = ({ bookingId, paymentMethod }) => {
  return axiosInstance.post("/payments/initiate", {
    bookingId,
    paymentMethod,
  });
};

// Get payment details by booking ID
export const getPaymentByBookingService = (bookingId) => {
  return axiosInstance.get(`/payments/${bookingId}`);
};

// Retry failed eSewa payment
export const retryEsewaPaymentService = (paymentId) => {
  return axiosInstance.post(`/payments/${paymentId}/retry-esewa`);
};

// Get user payment history
export const getUserPaymentHistoryService = (userId, params = {}) => {
  return axiosInstance.get(`/payments/user/${userId}/history`, { params });
};
