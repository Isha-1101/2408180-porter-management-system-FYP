import axiosInstance from "../axiosInstance";

export const getAllUsers = (params) => {
  return axiosInstance.get("/auth/get-users", { params });
};

export const banUser = (id, data) => {
  return axiosInstance.put(`/auth/banned-user/${id}`, data);
};

export const unbanUser = (id, data) => {
  return axiosInstance.put(`/auth/unbanned-user/${id}`, data);
};

export const deleteUser = (id, data) => {
  return axiosInstance.put(`/auth/delete-user/${id}`, data);
};

export const getAllPorterRegistrations = (params) => {
  return axiosInstance.get("/admin/registrations", { params });
};

export const approveRegistration = (registrationId) => {
  return axiosInstance.post(`/porter-registration/${registrationId}/approve`);
};

export const rejectRegistration = (registrationId, data) => {
  return axiosInstance.post(
    `/porter-registration/${registrationId}/reject`,
    data,
  );
};

export const getAllTeamMemberRequests = (params) => {
  return axiosInstance.get("/admin/team-member-requests", { params });
};

export const approveTeamMemberRequest = (requestId) => {
  return axiosInstance.post(`/admin/approve-porter-registration/${requestId}`);
};

export const rejectTeamMemberRequest = (requestId, data) => {
  return axiosInstance.post(`/admin/team-member-requests/${requestId}/reject`, data);
};

export const getAllPorters = (params) => {
  return axiosInstance.get("/porters", { params });
};

export const getAdminStats = () => {
  return axiosInstance.get("/admin/stats");
};

export const getComprehensiveStats = () => {
  return axiosInstance.get("/admin/analytics/comprehensive");
};

export const getBookingTrends = (params) => {
  return axiosInstance.get("/admin/analytics/trends", { params });
};

export const getBookingDistribution = () => {
  return axiosInstance.get("/admin/analytics/distribution");
};

export const getAllAdminBookings = (params) => {
  return axiosInstance.get("/admin/bookings", { params });
};

export const getLiveBookings = () => {
  return axiosInstance.get("/admin/bookings/live");
};

export const getBookingDetail = (id) => {
  return axiosInstance.get(`/admin/bookings/${id}`);
};

export const updateBookingStatus = (id, data) => {
  return axiosInstance.put(`/admin/bookings/${id}/status`, data);
};

export const getAllCancellations = (params) => {
  return axiosInstance.get("/admin/cancellations", { params });
};

export const getCancellationStats = () => {
  return axiosInstance.get("/admin/cancellations/stats");
};

export const getAllPayments = (params) => {
  return axiosInstance.get("/admin/payments", { params });
};

export const getRevenueStats = () => {
  return axiosInstance.get("/admin/payments/revenue");
};

export const verifyPayment = (id) => {
  return axiosInstance.put(`/admin/payments/${id}/verify`);
};

export const getPorterPerformance = (params) => {
  return axiosInstance.get("/admin/porters/performance", { params });
};

export const getPorterStats = () => {
  return axiosInstance.get("/admin/porters/stats");
};

export const getPorterDetail = (id) => {
  return axiosInstance.get(`/admin/porters/${id}/detail`);
};

export const getActivityFeed = (params) => {
  return axiosInstance.get("/admin/activity-feed", { params });
};

export const getSystemHealth = () => {
  return axiosInstance.get("/admin/system-health");
};
