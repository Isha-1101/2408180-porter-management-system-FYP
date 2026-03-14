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
  return axiosInstance.post(`/admin/approve-porter-registration/${registrationId}`);
};

export const rejectRegistration = (registrationId, data) => {
  return axiosInstance.post(`/admin/registrations/${registrationId}/reject`, data);
};

export const getAllPorters = (params) => {
  return axiosInstance.get("/porters", { params });
};

export const getAdminStats = () => {
  return axiosInstance.get("/admin/stats");
};
