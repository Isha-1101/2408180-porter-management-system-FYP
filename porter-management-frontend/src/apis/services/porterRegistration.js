import axiosInstance from "../axiosInstance";

const porterRegistrationStart = (registrationType) => {
  return axiosInstance.post("/porter-registration/start", {
    registrationType,
  });
};

const savePorterBasicInfo = (registrationId, data) => {
  return axiosInstance.put(
    `/porter-registration/${registrationId}/basic-info`,
    data,
  );
};
const savePorterVehicleInfo = (
  registrationId,
  { vehicleNumber, vehicleCategory, capacity, hasVehicle },
) => {
  return axiosInstance.put(`/porter-registration/${registrationId}/vehicle`, {
    vehicleNumber,
    vehicleCategory,
    capacity,
    hasVehicle,
  });
};

const savePorterDocumentsInfo = (registrationId, data) => {
  return axiosInstance.put(
    `/porter-registration/${registrationId}/documents`,
    data,
  );
};

const getPorterRegistredInformation = (registrationId) => {
  return axiosInstance.get(`/porter-registration/${registrationId}`);
};
const submitPorterRegistration = (registrationId) => {
  return axiosInstance.post(`/porter-registration/${registrationId}/submit`);
};

//get registration status by logged in user if user is porter
const getPorterRegistrationByUser = () => {
  return axiosInstance.get(`/porter-registration/user`);
};
export const porterRestrationService = {
  porterRegistrationStart,
  savePorterBasicInfo,
  savePorterVehicleInfo,
  savePorterDocumentsInfo,
  getPorterRegistredInformation,
  submitPorterRegistration,
  getPorterRegistrationByUser,
};
