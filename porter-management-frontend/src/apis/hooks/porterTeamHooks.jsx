import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getPorterByTeam,
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
