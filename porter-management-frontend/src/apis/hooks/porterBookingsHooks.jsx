import { useMutation } from "@tanstack/react-query";
import {
  createPorterBookingService,
  searchNearByPorterService,
} from "../services/porterBookingsService.js";
import { toast } from "react-hot-toast";
export const useSearchNearByPorter = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await searchNearByPorterService(payload);
      return response;
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Registration failed");
    },
  });
};

export const usecreatePorterBooking = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await createPorterBookingService(payload);
      return response;
    },
    onSuccess: (response) => {
      toast.success(response?.data?.message);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Registration failed");
    },
  });
};
