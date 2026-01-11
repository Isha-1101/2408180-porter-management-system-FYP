import axiosInstance from "../axiosInstance";

const porterRegistrationStart = () => {
  return axiosInstance.post("/porter-registration/start");
};

const savePorterBasicInfo = (registrationId, data) => {
  return axiosInstance.put(
    `/porter-registration/${registrationId}/basic-info`,
    data
  );
};
const savePorterVehicleInfo = (
  registrationId,
  { vehicleNumber, vehicleCategory, capacity }
) => {
  return axiosInstance.put(`/porter-registration/${registrationId}/vehicle`, {
    registrationId,
    vehicleNumber,
    vehicleCategory,
    capacity,
  });
};

const savePorterDocumentsInfo = (
  registrationId,
  data
) => {
  return axiosInstance.put(
    `/porter-registration/${registrationId}/documents`,
    data
  );
};

const getPorterRegistredInformation = (registrationId) => {
  return axiosInstance.get(`/porter-registration/${registrationId}`);
};
const submitPorterRegistration = (registrationId) => {
  return axiosInstance.post(`/porter-registration/${registrationId}/submit`);
};
export const porterRestrationService = {
  porterRegistrationStart,
  savePorterBasicInfo,
  savePorterVehicleInfo,
  savePorterDocumentsInfo,
  getPorterRegistredInformation,
  submitPorterRegistration,
};
