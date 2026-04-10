import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  submitRating as submitRatingService,
  getBookingRating as getBookingRatingService,
  getPorterRating as getPorterRatingService,
} from "../services/ratingService";

/**
 * Submit a rating for a completed booking
 */
export const useSubmitRating = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => submitRatingService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookingRating"] });
      queryClient.invalidateQueries({ queryKey: ["porterRating"] });
    },
    ...options,
  });
};

/**
 * Get rating for a specific booking (check if already rated)
 */
export const useGetBookingRating = (bookingId, options = {}) =>
  useQuery({
    queryKey: ["bookingRating", bookingId],
    queryFn: () => getBookingRatingService(bookingId),
    enabled: !!bookingId,
    ...options,
  });

/**
 * Get all ratings and reviews for a specific porter
 */
export const useGetPorterRating = (porterId, options = {}) =>
  useQuery({
    queryKey: ["porterRating", porterId],
    queryFn: () => getPorterRatingService(porterId),
    enabled: !!porterId,
    ...options,
  });
