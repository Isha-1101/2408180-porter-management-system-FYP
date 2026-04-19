import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { porterRegistrationService } from "../services/porterRegistration";
import { useAuthStore } from "../../store/auth.store";

const useRegstrationStartMutation = () => {
  return useMutation({
    mutationFn: (registrationType) =>
      porterRegistrationService.porterRegistrationStart(registrationType),
  });
};

const useSavePorterBasicInfoMutation = () => {
  return useMutation({
    mutationFn: ({ registrationId, data }) => {
      console.log(data);
      return porterRegistrationService.savePorterBasicInfo(registrationId, data);
    },
  });
};

const useSavePorterVehicleInfoMutation = () => {
  return useMutation({
    mutationFn: ({ registrationId, data }) => {
      console.log(data);
      return porterRegistrationService.savePorterVehicleInfo(
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
      return porterRegistrationService.savePorterDocumentsInfo(
        registrationId,
        data,
      );
    },
  });
};

const useGetPorterRegistredInformationMutation = () => {
  return useMutation({
    mutationFn: (registrationId) =>
      porterRegistrationService.getPorterRegistredInformation(registrationId),
  });
};

const useSubmitPorterRegistrationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (registrationId) => {
      return porterRegistrationService.submitPorterRegistration(registrationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["porter-registration-by-user"] });
    },
  });
};

const usegetPorterRegistrationByUser = () => {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ["porter-registration-by-user", user?.id],
    queryFn: () => porterRegistrationService.getPorterRegistrationByUser(),
    enabled: user?.role === "porter",
  });
};

const useUpdatePorterContactMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ phone, address }) =>
      porterRegistrationService.updatePorterContact({ phone, address }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["porterByUser"] });
    },
  });
};

export const porterRegistrationHooks = {
  useRegstrationStartMutation,
  useSavePorterBasicInfoMutation,
  useSavePorterVehicleInfoMutation,
  useSavePorterDocumentsInfoMutation,
  useGetPorterRegistredInformationMutation,
  useSubmitPorterRegistrationMutation,
  usegetPorterRegistrationByUser,
  useUpdatePorterContactMutation,
};
