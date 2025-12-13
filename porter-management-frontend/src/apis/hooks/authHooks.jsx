import toast from "react-hot-toast";
import { login, register } from "../services/authService.js";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useLogin = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await login(payload);
      return response;
    },
    onSuccess: (response) => {
      toast.success(response?.data?.message);
      localStorage.setItem("access_token", response?.data?.data?.access_token);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Login failed");
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await register(payload);
      return response;
    },
    onSuccess: (response) => {
      toast.success(response?.data?.message);
      localStorage.setItem("access_token", response?.data?.data?.access_token);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Registration failed");
    },
  });
};
