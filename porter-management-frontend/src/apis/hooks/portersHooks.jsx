import { useMutation, useQuery } from "@tanstack/react-query";
import { porterService } from "../services/porterService";

export const useCreateNewPorter = () => {
  return useMutation({
    mutationFn: async (porterPayload) => {
      const response = await porterService.createNewPorter(porterPayload);
      return response;
    },
  });
};

export const useGetPorters = () => {
  return useQuery({
    queryKey: ["porters"],
    queryFn: () => porterService.getPorters(),
  });
};

export const useGetPorterById = (id) => {
  return useQuery({
    queryKey: ["porter", id],
    queryFn: () => porterService.getPorterById(id),
  });
};

export const useGetPorterByUserId = () => {
  return useQuery({
    queryKey: ["porterByUser"],
    queryFn: () => porterService.getPorterByUserId(),
  });
};
//vehicle details
export const useCreateVechicleDetais = () => {
  return useMutation({
    mutationFn: async (porterId, vehiclePayload) => {
      const response = await porterService.saveVehicleDetailsPorter(
        porterId,
        vehiclePayload
      );
      return response;
    },
  });
};

export const useGetVehicleTypes = () => {
  return useQuery({
    queryKey: ["vehicleTypes"],
    queryFn: () => porterService.getVehicleTypesOfPorter(),
  });
};

//document details
export const useCreateDocumentDetails = () => {
   return useMutation({
    mutationFn: async ({ porterId, documentPayload }) => {
      return await porterService.saveDocumentOfPorter(
        porterId,
        documentPayload
      );
    },
  });
};

export const useGetDocuments = () => {
  return useQuery({
    queryKey: ["documents"],
    queryFn: () => porterService.getSavedDocumentsOfPorter(),
  });
};
