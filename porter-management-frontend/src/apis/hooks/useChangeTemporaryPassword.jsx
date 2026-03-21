import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axiosInstance from "../axiosInstance";

export const changeTemporaryPasswordService = async (payload) => {
  const response = await axiosInstance.put(
    "/auth/change-temp-password",
    payload,
  );
  return response.data;
};

export const useChangeTemporaryPassword = () => {
  return useMutation({
    mutationFn: changeTemporaryPasswordService,
    onSuccess: (data) => {
      toast.success(data.message || "Password changed successfully!");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to change password.",
      );
    },
  });
};
