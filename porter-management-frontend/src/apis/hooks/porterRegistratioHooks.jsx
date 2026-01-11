import {  useMutation, useQuery } from "@tanstack/react-query";
import { porterRestrationService } from "../services/porterRegistration";
const useRegstrationStartMutation = () => {
  return useMutation({
    mutationFn: () => porterRestrationService.porterRegistrationStart(),
  });
};

const useSavePorterBasicInfoMutation = () => {
  return useMutation({
    mutationFn: ({registrationId, data}) => {
      console.log(data);
      return porterRestrationService.savePorterBasicInfo(registrationId, data);
    },
  });
};

const useSavePorterVehicleInfoMutation = () => {
  return useMutation({
    mutationFn: ({registrationId, data}) => {
      console.log(data);
      return porterRestrationService.savePorterVehicleInfo(registrationId, data);
    },
  });
};

const useSavePorterDocumentsInfoMutation = () => {
  return useMutation({
    mutationFn: ({registrationId, data}) => {
      console.log(data);
      return porterRestrationService.savePorterDocumentsInfo(registrationId, data);
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

export const porterRetgistrationHooks = {
  useRegstrationStartMutation,
  useSavePorterBasicInfoMutation,
  useSavePorterVehicleInfoMutation,
  useSavePorterDocumentsInfoMutation,
  useGetPorterRegistredInformationMutation,
  useSubmitPorterRegistrationMutation,
};
