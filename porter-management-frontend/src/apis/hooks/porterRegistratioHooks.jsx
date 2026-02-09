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
    queryKey: ["porter-registration-by-user", user?.id],
    queryFn: () => porterRestrationService.getPorterRegistrationByUser(),
    enabled: user?.role === "porter",
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
