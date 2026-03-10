import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  searchNearByPorterService,
  createIndividualBookingService,
  acceptPorterBookingService,
  rejectPorterBookingService,
  getPorterBookingsService,
  createPorterBookingService,
  cancelBookingService,
  completeBookingService,
  getBookingByIdService,
  getUserBookingsService,
} from "../services/porterBookingsService.js";
import { toast } from "react-hot-toast";

// Search nearby porters (used on the booking form)
export const useSearchNearByPorter = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await searchNearByPorterService(payload);
      return response;
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Search failed");
    },
  });
};

// User confirms and creates an individual booking
export const useCreateIndividualBooking = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await createIndividualBookingService(payload);
      return response;
    },
    onSuccess: () => {
      toast.success("Booking confirmed! Waiting for a porter to accept.");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to create booking");
    },
  });
};

// Porter fetches their pending booking requests (polls every 15s)
export const useGetPorterBookings = () => {
  return useQuery({
    queryKey: ["porter-bookings"],
    queryFn: async () => {
      const response = await getPorterBookingsService();
      return response?.data?.data;
    },
    refetchInterval: 15000, // poll every 15 seconds
    staleTime: 10000,
  });
};

// Porter accepts a booking
export const useAcceptPorterBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId) => {
      const response = await acceptPorterBookingService(bookingId);
      return response?.data;
    },
    onSuccess: () => {
      toast.success("Booking accepted!");
      queryClient.invalidateQueries({ queryKey: ["porter-bookings"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to accept booking");
    },
  });
};

// Porter rejects a booking
export const useRejectPorterBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId) => {
      const response = await rejectPorterBookingService(bookingId);
      return response?.data;
    },
    onSuccess: () => {
      toast.success("Booking declined.");
      queryClient.invalidateQueries({ queryKey: ["porter-bookings"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to reject booking");
    },
  });
};

// Legacy hook kept for team booking flow
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
      toast.error(error?.response?.data?.message || "Booking failed");
    },
  });
};

// User cancels a booking
export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId) => {
      const response = await cancelBookingService(bookingId);
      return response?.data;
    },
    onSuccess: () => {
      toast.success("Booking cancelled.");
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to cancel booking");
    },
  });
};

// Porter completes a booking
export const useCompleteBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId) => {
      const response = await completeBookingService(bookingId);
      return response?.data;
    },
    onSuccess: () => {
      toast.success("Booking completed!");
      queryClient.invalidateQueries({ queryKey: ["porter-bookings"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to complete booking",
      );
    },
  });
};

// Get a single booking by ID
export const useGetBookingById = (bookingId) => {
  return useQuery({
    queryKey: ["booking", bookingId],
    queryFn: async () => {
      const response = await getBookingByIdService(bookingId);
      return response?.data?.data || response?.data;
    },
    enabled: !!bookingId,
    staleTime: 5000,
  });
};

// Get user's bookings
export const useGetUserBookings = () => {
  return useQuery({
    queryKey: ["user-bookings"],
    queryFn: async () => {
      const response = await getUserBookingsService();
      return response?.data?.data || [];
    },
    refetchInterval: 15000,
    staleTime: 10000,
  });
};
