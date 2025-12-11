import axiosInstance from "../axiosInstance";

export const login = (payload) => {
  return axiosInstance.post("/auth/login", payload);
};

export const register = (payload) => {
  return axiosInstance.post("/auth/register", payload);
};
