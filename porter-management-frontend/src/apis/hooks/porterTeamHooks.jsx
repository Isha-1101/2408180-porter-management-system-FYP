/**
 * @file porterTeamHooks.jsx
 * @description React Query hooks for team-porter management and team booking
 *              lifecycle (team lead + team member flows).
 *
 * Pattern: each hook wraps a service function with useMutation / useQuery,
 * providing consistent loading states, error toasts, and cache invalidation.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  // Team management (registration)
  requestPorterUserRegistration,
  getRequestedPorterByTeam,
  getPorterByTeam,
  // Team booking — user side
  createTeamBookingService,
  // Team booking — team lead side
  teamLeadAcceptBookingService,
  teamLeadRejectBookingService,
  teamLeadSelectPortersService,
  teamLeadConfirmBookingService,
  completeTeamBookingService,
  // Team booking — team member side
  teamMemberRespondService,
} from "../services/teamBookingService";

// ─────────────────────────────────────────────────────────────────────────────
// TEAM MANAGEMENT HOOKS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook for a team lead to invite a porter user to join their team.
 * Invalidates the porterByTeam cache on success.
 */
export const useRequestPorterUserRegistration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const response = await requestPorterUserRegistration(payload);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["porterByTeam"] });
      toast.success("Invitation sent successfully!");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to send invitation",
      );
    },
  });
};

/**
 * Query hook to fetch all pending registration requests for a team.
 * @param {string|undefined} teamId
 */
export const useGetAllRequestedPorterByTeam = (teamId) =>
  useQuery({
    queryKey: ["requestedPorterByTeam", teamId],
    queryFn: async () => {
      const response = await getRequestedPorterByTeam(teamId);
      return response;
    },
    enabled: !!teamId,
  });

/**
 * Query hook to fetch all active porters for a team.
 * @param {string|undefined} teamId
 */
export const useGetPorterByTeam = (teamId) =>
  useQuery({
    queryKey: ["porterByTeam", teamId],
    queryFn: async () => {
      const response = await getPorterByTeam(teamId);
      return response;
    },
    enabled: !!teamId,
  });

// ─────────────────────────────────────────────────────────────────────────────
// TEAM BOOKING — USER SIDE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook for a user to create a new team porter booking.
 * On success returns the bookingId so the caller can navigate to
 * the tracking page.
 *
 * @returns {{
 *   mutateAsync: (payload) => Promise<{ bookingId: string, data: object }>,
 *   isPending: boolean
 * }}
 */
export const useCreateTeamBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const response = await createTeamBookingService(payload);
      return response?.data;
    },
    onSuccess: () => {
      // Refresh the user's bookings list
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to create team booking",
      );
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// TEAM BOOKING — TEAM LEAD HOOKS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook for a team lead to accept a booking request.
 * Returns { booking, availableMembers, requiredMembers } for navigation.
 *
 * @returns {import("@tanstack/react-query").UseMutationResult}
 */
export const useTeamLeadAcceptBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId) => {
      const response = await teamLeadAcceptBookingService(bookingId);
      return response?.data;
    },
    onSuccess: () => {
      toast.success("Booking accepted. Please select your team members.");
      queryClient.invalidateQueries({ queryKey: ["porter-bookings"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to accept team booking",
      );
    },
  });
};

/**
 * Hook for a team lead to reject a booking request.
 */
export const useTeamLeadRejectBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId) => {
      const response = await teamLeadRejectBookingService(bookingId);
      return response?.data;
    },
    onSuccess: () => {
      toast.success("Booking request declined.");
      queryClient.invalidateQueries({ queryKey: ["porter-bookings"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to reject team booking",
      );
    },
  });
};

/**
 * Hook for a team lead to submit their selected porter IDs.
 * Invalidates the specific booking query on success.
 *
 * @returns {import("@tanstack/react-query").UseMutationResult}
 *   mutationFn receives { bookingId: string, selectedPorterIds: string[] }
 */
export const useTeamLeadSelectPorters = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, selectedPorterIds }) => {
      const response = await teamLeadSelectPortersService(
        bookingId,
        selectedPorterIds,
      );
      return response?.data;
    },
    onSuccess: (_, { bookingId }) => {
      toast.success("Porters selected. Waiting for their responses.");
      queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to select porters",
      );
    },
  });
};

/**
 * Hook for a team lead to confirm the booking after enough members accepted.
 * Invalidates porter-bookings and the specific booking on success.
 *
 * @returns {import("@tanstack/react-query").UseMutationResult}
 *   mutationFn receives bookingId: string
 */
export const useTeamLeadConfirmBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId) => {
      const response = await teamLeadConfirmBookingService(bookingId);
      return response?.data;
    },
    onSuccess: (_, bookingId) => {
      toast.success("Booking confirmed successfully!");
      queryClient.invalidateQueries({ queryKey: ["porter-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to confirm booking",
      );
    },
  });
};

/**
 * Hook for a team lead to mark the team booking as completed.
 */
export const useCompleteTeamBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId) => {
      const response = await completeTeamBookingService(bookingId);
      return response?.data;
    },
    onSuccess: () => {
      toast.success("Team booking completed!");
      queryClient.invalidateQueries({ queryKey: ["porter-bookings"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to complete team booking",
      );
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// TEAM BOOKING — TEAM MEMBER HOOKS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook for a selected team member to accept or reject a booking invitation.
 *
 * @returns {import("@tanstack/react-query").UseMutationResult}
 *   mutationFn receives { bookingId: string, porterId: string, accepted: boolean }
 */
export const useTeamMemberRespond = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, porterId, accepted }) => {
      const response = await teamMemberRespondService(
        bookingId,
        porterId,
        accepted,
      );
      return response?.data;
    },
    onSuccess: (_, { accepted }) => {
      toast.success(
        accepted
          ? "You've accepted the team booking!"
          : "You've declined the team booking.",
      );
      queryClient.invalidateQueries({ queryKey: ["porter-bookings"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to record your response",
      );
    },
  });
};
