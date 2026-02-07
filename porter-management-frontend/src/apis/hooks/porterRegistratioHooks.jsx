import { useMutation, useQuery } from "@tanstack/react-query";
import { porterRestrationService } from "../services/porterRegistration";
import { useAuthStore } from "../../store/auth.store";
const useRegstrationStartMutation = () => {
  return useMutation({
    mutationFn: (registrationType) =>
      porterRestrationService.porterRegistrationStart(registrationType),
  });
};

const useSavePorterBasicInfoMutation = () => {
  return useMutation({
    mutationFn: ({ registrationId, data }) => {
      console.log(data);
      return porterRestrationService.savePorterBasicInfo(registrationId, data);
    },
  });
};

const useSavePorterVehicleInfoMutation = () => {
  return useMutation({
    mutationFn: ({ registrationId, data }) => {
      console.log(data);
      return porterRestrationService.savePorterVehicleInfo(
        registrationId,
        data,
      );
    },
  });
};

const useSavePorterDocumentsInfoMutation = () => {
  return useMutation({
    mutationFn: ({ registrationId, data }) => {
      console.log(data);
      return porterRestrationService.savePorterDocumentsInfo(
        registrationId,
        data,
      );
    },
  });
};
const useGetPorterRegistredInformationMutation = () => {
  return useMutation({
    mutationFn: (registrationId) =>
      porterRestrationService.getPorterRegistredInformation(registrationId),
  });
};

const useSubmitPorterRegistrationMutation = () => {
  return useMutation({
    mutationFn: (registrationId) => {
      return porterRestrationService.submitPorterRegistration(registrationId);
    },
  });
};

const usegetPorterRegistrationByUser = () => {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ["porter-registration-by-user"],
    queryFn: () => porterRestrationService.getPorterRegistrationByUser(),
    enabled: user?.role === "porter", // Only fetch when user is in porter role
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - cache persists for 10 minutes
    retry: false, // Don't retry on error to prevent repeated API calls
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });
};

export const porterRetgistrationHooks = {
  useRegstrationStartMutation,
  useSavePorterBasicInfoMutation,
  useSavePorterVehicleInfoMutation,
  useSavePorterDocumentsInfoMutation,
  useGetPorterRegistredInformationMutation,
  useSubmitPorterRegistrationMutation,
  usegetPorterRegistrationByUser,
};
