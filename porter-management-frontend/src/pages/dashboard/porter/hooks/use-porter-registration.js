import { useEffect, useState } from "react";
import { porterRetgistrationHooks } from "../../../../apis/hooks/porterRegistratioHooks";

export const usePorter = () => {
  const [registrationId, setRegistrationId] = useState(null);
  const [formData, setFormData] = useState({
    basicInfo: {
      fullName: "",
      phone: "",
      address: "",
      porterType: "",
      porterPhoto: null,
    },
    vehicle: {
      vehicleNumber: "",
      vehicleCategory: "",
      capacity: "",
    },
    documents: {
      licenseNumber: "",
      porterLicenseDocument: "",
    },
  });

  const [registrationSteps, setRegistrationSteps] = useState({
    basicInfo: {
      isCompleted: false,
    },
    vehicle: {
      isCompleted: false,
    },
    documents: {
      isCompleted: false,
    },
  });

  const [setRegistrationResponse, setRegistrationResponseData] = useState(null);

  const { mutateAsync: getRegistrationData } =
    porterRetgistrationHooks.useGetPorterRegistredInformationMutation();

  useEffect(() => {
    if (registrationId) {
      const result = async () => {
        try {
          const res = await getRegistrationData(registrationId);
          const payload = res?.data;

          if (res?.status === 200 && payload) {
            setRegistrationResponseData(payload);
            if (payload?.registration) {
              setRegistrationSteps((prev) => ({
                ...prev,
                ...payload.registration.steps,
              }));
            }

            setFormData((prev) => ({
              ...prev,
              basicInfo: {
                ...prev.basicInfo,
                fullName: payload?.basicInfo?.fullName ?? "",
                phone: payload?.basicInfo?.phone ?? "",
                address: payload?.basicInfo?.address ?? "",
                porterType: payload?.basicInfo?.porterType ?? "",
                porterPhoto: payload?.basicInfo?.porterPhoto ?? null,
              },
              vehicle: {
                ...prev.vehicle,
                vehicleNumber: payload?.vehicle?.vehicleNumber ?? "",
                vehicleCategory: payload?.vehicle?.vehicleCategory ?? "",
                capacity: payload?.vehicle?.capacity ?? "",
              },
              documents: {
                ...prev.documents,
                licenseNumber: payload?.documents?.licenseNumber ?? "",
                porterLicenseDocument:
                  payload?.documents?.porterLicenseDocument ?? "",
              },
            }));
          }
        } catch (e) {
          console.log(e);
        }
      };
      result();
    }
  }, [registrationId, getRegistrationData]);

  return {
    registrationId,
    setRegistrationId,
    formData,
    setFormData,
    getRegistrationData,
    registrationSteps,
    setRegistrationSteps,
    setRegistrationResponse,
    setRegistrationResponseData,
  };
};
