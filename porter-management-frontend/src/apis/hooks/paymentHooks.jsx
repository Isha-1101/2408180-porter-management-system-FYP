import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  initiatePaymentService,
  getPaymentByBookingService,
  retryEsewaPaymentService,
  getUserPaymentHistoryService,
} from "../services/paymentService.js";
import { toast } from "react-hot-toast";

// Mutation: Initiate payment (cash or digital)
export const useInitiatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, paymentMethod }) => {
      const response = await initiatePaymentService({ bookingId, paymentMethod });
      return response?.data;
    },
    onSuccess: (data, variables) => {
      if (variables.paymentMethod === "digital") {
        toast.success("Redirecting to eSewa payment...");
      } else {
        toast.success("Cash payment method saved!");
      }
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to initiate payment");
    },
  });
};

// Query: Get payment by booking ID
export const useGetPaymentByBooking = (bookingId) => {
  return useQuery({
    queryKey: ["payment", bookingId],
    queryFn: async () => {
      const response = await getPaymentByBookingService(bookingId);
      return response?.data?.data || response?.data;
    },
    enabled: !!bookingId,
    staleTime: 30000,
  });
};

// Mutation: Retry failed eSewa payment
export const useRetryEsewaPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentId) => {
      const response = await retryEsewaPaymentService(paymentId);
      return response?.data;
    },
    onSuccess: () => {
      toast.success("Retrying payment... Redirecting to eSewa");
      queryClient.invalidateQueries({ queryKey: ["payment"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to retry payment");
    },
  });
};

// Query: Get user payment history
export const useGetUserPaymentHistory = (userId, params = {}) => {
  return useQuery({
    queryKey: ["payment-history", userId, params],
    queryFn: async () => {
      const response = await getUserPaymentHistoryService(userId, params);
      return response?.data?.data || [];
    },
    enabled: !!userId,
    staleTime: 60000,
  });
};
