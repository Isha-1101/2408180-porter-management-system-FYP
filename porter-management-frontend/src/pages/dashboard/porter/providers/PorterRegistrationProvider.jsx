import {
  useEffect,
  useState,
  useCallback,
  useContext,
  createContext,
} from "react";
import { porterRetgistrationHooks } from "@/apis/hooks/porterRegistratioHooks.jsx";
export const PorterRegistrationContext = createContext(null);

export const PorterRegistrationProvider = ({ children }) => {
  const [registrationId, setRegistrationId] = useState(null);

  const [formData, setFormData] = useState({
    basicInfo: {
      fullName: "",
      phone: "",
      address: "",
      porterType: "",
      porterPhoto: null,
      identityType: "",
      identityNumber: "",
      identityCardImageFront: null,
      identityCardImageBack: null,
    },
    vehicle: {
      vehicleNumber: "",
      vehicleCategory: "",
      capacity: "",
      hasVehicle: true,
    },
    documents: {
      licenseNumber: "",
      porterLicenseDocument: null,
    },
  });

  const [steps, setSteps] = useState({
    basicInfo: { isCompleted: false },
    vehicle: { isCompleted: false },
    documents: { isCompleted: false },
  });

  const [getPorterInfo, setGetPorterInfo] = useState(null);
  /* =======================
     API Hooks
  ======================= */
  const { mutateAsync: startRegistration } =
    porterRetgistrationHooks.useRegstrationStartMutation();

  const { mutateAsync: fetchRegistration } =
    porterRetgistrationHooks.useGetPorterRegistredInformationMutation();


  /* ========================
     Actions
  ======================= */

  const initRegistration = useCallback(async () => {
    const res = await startRegistration();
    setRegistrationId(res?.data?.registrationId);
    return res?.data?.registrationId;
  }, [startRegistration]);

  const updateField = useCallback((section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  }, []);

  const completeStep = useCallback((stepName) => {
    setSteps((prev) => ({
      ...prev,
      [stepName]: { isCompleted: true },
    }));
  }, []);

  /* =======================
     Load Existing Data
  ======================= */
  useEffect(() => {
    if (!registrationId) return;

    const load = async () => {
      const res = await fetchRegistration(registrationId);
      const payload = res?.data;
      if (!payload) return;

      setSteps(payload?.registration?.steps ?? steps);

      setFormData({
        basicInfo: {
          fullName: payload?.basicInfo?.fullName ?? "",
          phone: payload?.basicInfo?.phone ?? "",
          address: payload?.basicInfo?.address ?? "",
          porterType: payload?.basicInfo?.porterType ?? "",
          porterPhoto: payload?.basicInfo?.porterPhoto ?? null,
          identityType: payload?.basicInfo?.identityType ?? "",
          identityNumber: payload?.basicInfo?.identityNumber ?? "",
          identityCardImageFront: payload?.basicInfo?.identityCardImageFront ?? null,
          identityCardImageBack: payload?.basicInfo?.identityCardImageBack ?? null,
        },
        vehicle: {
          vehicleNumber: payload?.vehicle?.vehicleNumber ?? "",
          vehicleCategory: payload?.vehicle?.vehicleCategory ?? "",
          capacity: payload?.vehicle?.capacity ?? "",
          hasVehicle: payload?.vehicle?.hasVehicle ?? true,
        },
        documents: {
          licenseNumber: payload?.documents?.licenseNumber ?? "",
          porterLicenseDocument:
            payload?.documents?.porterLicenseDocument ?? null,
        },
      });
    };

    load();
  }, [registrationId, fetchRegistration]);

  return (
    <PorterRegistrationContext.Provider
      value={{
        registrationId,
        setRegistrationId,
        initRegistration,
        formData,
        setFormData,
        updateField,
        steps,
        registrationSteps: steps,
        setRegistrationSteps: setSteps,
        completeStep,
      }}
    >
      {children}
    </PorterRegistrationContext.Provider>
  );
};

export const usePorterRegistration = () => {
  const context = useContext(PorterRegistrationContext);

  if (!context) {
    throw new Error(
      "usePorterRegistration must be used inside PorterRegistrationProvider"
    );
  }

  return context;
};
