import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  requestPorterUserRegistration,
  getRequestedPorterByTeam,
  getPorterByTeam,
  getTeamDashboard,
  getTeamBookingHistory,
  getTeamPendingBookings,
  getTeamQuorumReachedBookings,
  searchIndividualPorters,
  invitePorterToTeam,
  respondToTeamInvitation,
  getPendingTeamJoinRequests,
  getMyPendingInvitations,
  getInvitationHistory,
  removeTeamMember,
  browseAvailableTeams,
  createTeamBookingService,
  getTeamBookingStatusService,
  teamOwnerReviewBookingService,
  teamOwnerConfirmBookingService,
  teamOwnerCancelBookingService,
  completeTeamBookingService,
  startTeamBookingService,
  teamMemberRespondService,
  userStartTeamBookingService,
} from "../services/teamBookingService";

// ─────────────────────────────────────────────────────────────────────────────
// TEAM MANAGEMENT HOOKS
// ─────────────────────────────────────────────────────────────────────────────

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

export const useGetAllRequestedPorterByTeam = (teamId) =>
  useQuery({
    queryKey: ["requestedPorterByTeam", teamId],
    queryFn: async () => {
      const response = await getRequestedPorterByTeam(teamId);
      return response;
    },
    enabled: !!teamId,
  });

export const useGetPorterByTeam = (teamId) =>
  useQuery({
    queryKey: ["porterByTeam", teamId],
    queryFn: async () => {
      const response = await getPorterByTeam(teamId);
      return response;
    },
    enabled: !!teamId,
  });

export const useGetTeamDashboard = () =>
  useQuery({
    queryKey: ["team-dashboard"],
    queryFn: async () => {
      const response = await getTeamDashboard();
      return response?.data?.data;
    },
  });

export const useGetTeamBookingHistory = (status) =>
  useQuery({
    queryKey: ["team-booking-history", status],
    queryFn: async () => {
      const response = await getTeamBookingHistory(status);
      return response?.data?.data;
    },
  });

export const useGetTeamPendingBookings = () =>
  useQuery({
    queryKey: ["team-pending-bookings"],
    queryFn: async () => {
      const response = await getTeamPendingBookings();
      return response?.data?.data;
    },
  });

export const useGetTeamQuorumReachedBookings = () =>
  useQuery({
    queryKey: ["team-quorum-reached-bookings"],
    queryFn: async () => {
      const response = await getTeamQuorumReachedBookings();
      return response?.data?.data;
    },
  });

// ─────────────────────────────────────────────────────────────────────────────
// TEAM JOIN REQUEST HOOKS (US-005)
// ─────────────────────────────────────────────────────────────────────────────

export const useSearchIndividualPorters = (query, enabled = true) =>
  useQuery({
    queryKey: ["search-individual-porters", query],
    queryFn: async () => {
      const response = await searchIndividualPorters(query);
      return response?.data?.data;
    },
    enabled: enabled && (!!query?.name || !!query?.phone),
  });

export const useInvitePorterToTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (porterId) => {
      const response = await invitePorterToTeam(porterId);
      return response?.data;
    },
    onSuccess: () => {
      toast.success("Invitation sent to porter!");
      queryClient.invalidateQueries({ queryKey: ["search-individual-porters"] });
      queryClient.invalidateQueries({ queryKey: ["join-requests"] });
      queryClient.invalidateQueries({ queryKey: ["invitation-history"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to send invitation",
      );
    },
  });
};

export const useRespondToTeamInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ requestId, action, reason }) => {
      const response = await respondToTeamInvitation(requestId, action, reason);
      return response?.data;
    },
    onSuccess: (_, { action }) => {
      toast.success(
        action === "ACCEPTED"
          ? "Invitation accepted! Awaiting admin approval."
          : "Invitation declined."
      );
      queryClient.invalidateQueries({ queryKey: ["my-invitations"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to respond to invitation",
      );
    },
  });
};

export const useGetPendingTeamJoinRequests = () =>
  useQuery({
    queryKey: ["join-requests"],
    queryFn: async () => {
      const response = await getPendingTeamJoinRequests();
      return response?.data?.data;
    },
  });

export const useGetMyPendingInvitations = () =>
  useQuery({
    queryKey: ["my-invitations"],
    queryFn: async () => {
      const response = await getMyPendingInvitations();
      return response?.data?.data;
    },
  });

export const useGetInvitationHistory = () =>
  useQuery({
    queryKey: ["invitation-history"],
    queryFn: async () => {
      const response = await getInvitationHistory();
      return response?.data?.data; // { accepted: [], declined: [] }
    },
  });

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (porterId) => {
      const response = await removeTeamMember(porterId);
      return response?.data;
    },
    onSuccess: () => {
      toast.success("Member removed from team");
      queryClient.invalidateQueries({ queryKey: ["team-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["porterByTeam"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to remove member",
      );
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// BROWSE TEAMS HOOK (User)
// ─────────────────────────────────────────────────────────────────────────────

export const useBrowseAvailableTeams = (portersRequired) =>
  useQuery({
    queryKey: ["browse-teams", portersRequired],
    queryFn: async () => {
      const response = await browseAvailableTeams(portersRequired);
      return response?.data?.data;
    },
    enabled: !!portersRequired,
  });

// ─────────────────────────────────────────────────────────────────────────────
// TEAM BOOKING — USER SIDE
// ─────────────────────────────────────────────────────────────────────────────

export const useCreateTeamBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const response = await createTeamBookingService(payload);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to create team booking",
      );
    },
  });
};

export const useGetTeamBookingStatus = (bookingId) =>
  useQuery({
    queryKey: ["team-booking-status", bookingId],
    queryFn: async () => {
      const response = await getTeamBookingStatusService(bookingId);
      return response?.data?.data;
    },
    enabled: !!bookingId,
    refetchInterval: 10000,
  });

// ─────────────────────────────────────────────────────────────────────────────
// TEAM BOOKING — TEAM OWNER SIDE
// ─────────────────────────────────────────────────────────────────────────────

export const useTeamOwnerReviewBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, action }) => {
      const response = await teamOwnerReviewBookingService(bookingId, action);
      return response?.data;
    },
    onSuccess: (_, { action }) => {
      toast.success(
        action === "forward"
          ? "Booking forwarded to team members!"
          : "Booking declined."
      );
      queryClient.invalidateQueries({ queryKey: ["porter-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["team-pending-bookings"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to review booking",
      );
    },
  });
};

export const useTeamOwnerConfirmBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId) => {
      const response = await teamOwnerConfirmBookingService(bookingId);
      return response?.data;
    },
    onSuccess: () => {
      toast.success("Booking confirmed successfully!");
      queryClient.invalidateQueries({ queryKey: ["porter-bookings"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to confirm booking",
      );
    },
  });
};

export const useTeamOwnerCancelBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId) => {
      const response = await teamOwnerCancelBookingService(bookingId);
      return response?.data;
    },
    onSuccess: () => {
      toast.success("Booking cancelled");
      queryClient.invalidateQueries({ queryKey: ["porter-bookings"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to cancel booking",
      );
    },
  });
};

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

export const useStartTeamBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId) => {
      const response = await startTeamBookingService(bookingId);
      return response?.data;
    },
    onSuccess: () => {
      toast.success("Team booking started!");
      queryClient.invalidateQueries({ queryKey: ["porter-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["team-booking-status"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to start team booking",
      );
    },
  });
};

export const useUserStartTeamBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId) => {
      const response = await userStartTeamBookingService(bookingId);
      return response?.data;
    },
    onSuccess: () => {
      toast.success("Team journey started!");
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["team-booking-status"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to start team journey",
      );
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// TEAM BOOKING — TEAM MEMBER SIDE
// ─────────────────────────────────────────────────────────────────────────────

export const useTeamMemberRespond = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, response }) => {
      const resp = await teamMemberRespondService(bookingId, response);
      return resp?.data;
    },
    onSuccess: (_, { response }) => {
      toast.success(
        response === "ACCEPTED"
          ? "You've accepted the team booking!"
          : "You've declined the team booking."
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
