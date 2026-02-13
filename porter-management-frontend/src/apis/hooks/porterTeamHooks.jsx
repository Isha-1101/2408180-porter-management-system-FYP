import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getPorterByTeam,
  getRequestedPorterByTeam,
  requestPorterUserRegistration,
} from "../services/teamSearvice";
export const useRequestPorterUserRegistration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const response = await requestPorterUserRegistration(payload);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["porterByTeam"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Registration failed");
    },
  });
};

export const useGetAllRequestedPorterByTeam = (teamId) => {
  return useQuery({
    queryKey: ["requestedPorterByTeam", teamId],
    queryFn: async () => {
      const response = await getRequestedPorterByTeam(teamId);
      return response;
    },
    enabled: !!teamId,
  });
}

export const useGetPorterByTeam = (teamId) => {
  return useQuery({
    queryKey: ["porterByTeam", teamId],
    queryFn: async () => {
      const response = await getPorterByTeam(teamId);
      return response;
    },
    enabled: !!teamId,
  });
};
