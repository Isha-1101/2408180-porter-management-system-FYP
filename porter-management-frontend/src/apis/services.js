import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/core-api";

/**
 * Payment API Services
 */
export const paymentAPI = {
  // Initiate payment for a booking
  initiatePayment: async (bookingId, paymentMethod) => {
    const response = await axios.post(
      `${API_BASE}/payments/initiate`,
      { bookingId, paymentMethod },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  },

  // Get payment details
  getPaymentByBooking: async (bookingId) => {
    const response = await axios.get(
      `${API_BASE}/payments/${bookingId}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data.data;
  },

  // Retry eSewa payment
  retryEsewaPayment: async (paymentId) => {
    const response = await axios.post(
      `${API_BASE}/payments/${paymentId}/retry-esewa`,
      {},
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  },

  // Get payment history for user
  getUserPaymentHistory: async (userId, page = 1, limit = 10) => {
    const response = await axios.get(
      `${API_BASE}/payments/user/${userId}/history`,
      {
        params: { page, limit },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  },
};

/**
 * Cancellation API Services
 */
export const cancellationAPI = {
  // Cancel a booking
  cancelBooking: async (bookingId, reason) => {
    const response = await axios.post(
      `${API_BASE}/bookings/${bookingId}/cancel`,
      { reason },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  },

  // Get user cancellation history
  getUserCancellationHistory: async (userId, page = 1, limit = 10) => {
    const response = await axios.get(
      `${API_BASE}/bookings/user/${userId}/cancellations`,
      {
        params: { page, limit },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  },

  // Get porter cancellation history
  getPorterCancellationHistory: async (porterId, page = 1, limit = 10) => {
    const response = await axios.get(
      `${API_BASE}/bookings/porter/${porterId}/cancellations`,
      {
        params: { page, limit },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  },

  // Get remaining cancellations for today
  getRemainingCancellations: async () => {
    const response = await axios.get(
      `${API_BASE}/bookings/cancellations/remaining`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data.data;
  },
};

/**
 * Chat API Services
 */
export const chatAPI = {
  // Get chat history
  getChatHistory: async (bookingId, page = 1, limit = 50) => {
    const response = await axios.get(
      `${API_BASE}/chat/${bookingId}`,
      {
        params: { page, limit },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  },

  // Send text message
  sendMessage: async (bookingId, text) => {
    const response = await axios.post(
      `${API_BASE}/chat/${bookingId}/message`,
      { text },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data.data;
  },

  // Upload file and send as message
  uploadFile: async (bookingId, file, caption = "") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("caption", caption);

    const response = await axios.post(
      `${API_BASE}/chat/${bookingId}/upload`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  },

  // Mark message as read
  markMessageAsRead: async (messageId) => {
    const response = await axios.put(
      `${API_BASE}/chat/${messageId}/read`,
      {},
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data.data;
  },

  // Get unread count
  getUnreadCount: async (bookingId) => {
    const response = await axios.get(
      `${API_BASE}/chat/${bookingId}/unread-count`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data.data;
  },

  // Delete message
  deleteMessage: async (messageId) => {
    const response = await axios.delete(
      `${API_BASE}/chat/${messageId}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  },
};

export default {
  paymentAPI,
  cancellationAPI,
  chatAPI,
};
