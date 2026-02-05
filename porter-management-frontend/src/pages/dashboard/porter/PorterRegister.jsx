import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PersonalInfo from "./component/porter-register/porter-basic-info.jsx";
import VehicleInfo from "./component/porter-register/porter-vehicle-info.jsx";
import DocumentInfo from "./component/porter-register/porter-document-info.jsx";
import SidebarSteps from "./component/porter-register/side-bar-steps";
import ReviewPage from "./component/porter-register/porter-review-page.jsx";
import { porterRetgistrationHooks } from "@/apis/hooks/porterRegistratioHooks.jsx";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { usePorterRegistration } from "./providers/PorterRegistrationProvider.jsx";
import RegistrationTypeSelection from "./component/porter-register/registration-type-selection.jsx";

const PorterRegister = () => {
  const navigate = useNavigate();
  const {
    registrationId,
    setRegistrationId,
    formData,
    setFormData,
    registrationSteps,
    setRegistrationSteps,
  } = usePorterRegistration();

  const [step, setStep] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  //getting registrationId when page loads
  const { mutateAsync: startRegistration } =
    porterRetgistrationHooks.useRegstrationStartMutation();
  useEffect(() => {
    const initRegistration = async () => {
      try {
        const res = await startRegistration();
        setRegistrationId(res?.data?.registrationId);
      } catch (err) {
        console.error("Registration start failed", err);
      }
    };
    initRegistration();
  }, [startRegistration]);

  //mutation for registration
  const { mutateAsync: savePersonalInfo, isPending: isSavingPersonalInfo } =
    porterRetgistrationHooks.useSavePorterBasicInfoMutation();

  // const handleSaveStep1 = async () => {
  const handleSaveStep1 = async () => {
    setRegistrationSteps((prev) => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, isCompleted: true },
    }));
  };

  const { mutateAsync: saveVehicleInfo, isPending: isSavingVehicleInfo } =
    porterRetgistrationHooks.useSavePorterVehicleInfoMutation();

  //   const handleSaveStep2 = async () => {
  const handleSaveStep2 = async () => {
    setRegistrationSteps((prev) => ({
      ...prev,
      vehicle: { ...prev.vehicle, isCompleted: true },
    }));
  };

  const { mutateAsync: saveDocumentInfo, isPending: isSavingDocumentInfo } =
    porterRetgistrationHooks.useSavePorterDocumentsInfoMutation();

  const handleSaveStep3 = async () => {
    setRegistrationSteps((prev) => ({
      ...prev,
      documents: { ...prev.documents, isCompleted: true },
    }));
  };
  // const handleSaveStep3 = async () => {
  //   const payload = new FormData();
  //   payload.append("licenseNumber", formData.documents.licenseNumber);

  //   if (formData.documents.porterLicenseDocument instanceof File) {
  //     payload.append(
  //       "porterLicenseDocument",
  //       formData.documents.porterLicenseDocument
  //     );
  //   }

  //   await saveDocumentInfo({ registrationId, data: payload });
  //   setRegistrationSteps((prev) => ({
  //     ...prev,
  //     documents: { ...prev.documents, isCompleted: true },
  //   }));
  // };


  const { mutateAsync: submitPorterRegistration, isPending: isSubmitting } = porterRetgistrationHooks.useSubmitPorterRegistrationMutation();
  const handleFinalSavePorterInformation = async () => {
    try {
      await submitPorterRegistration(registrationId);
      navigate("/dashboard/porter");
    } catch (error) {
      console.error("Final save porter information failed", error);
    }
  };

  const handleNextStep = async () => {
    try {
      if (step === 2) {
        await handleSaveStep1();
      }

      if (step === 3) {
        await handleSaveStep2();
      }

      if (step === 4) {
        await handleSaveStep3();
      }

      setStep((prev) => prev + 1);
    } catch (error) {
      console.error("Step save failed", error);
      toast.error("Please complete the step before continuing");
    }
  };

  return (
    <div
      className="p-4 lg:p-8 min-h-screen bg-gray-50/50"
    >
      <div className="max-w-7xl mx-auto flex gap-3 relative">
        {/* Sidebar */}
        <SidebarSteps
          step={step}
          setStep={setStep}
          registrationSteps={registrationSteps}
          isOpen={isSidebarOpen}
          toggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Sidebar Toggle Button (When Closed) */}
        {!isSidebarOpen && (
          <Button
            variant="outline"
            size="icon"
            className="absolute -left-10 top-0 z-10 bg-white shadow-sm border-gray-200 hover:bg-gray-50 h-8 w-8"
            onClick={() => setIsSidebarOpen(true)}
            title="Expand Sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        {/* Main Form */}
        {isSavingDocumentInfo || isSavingVehicleInfo || isSavingPersonalInfo ? (
          <div className="flex-1">
            <Card>
              <CardContent>
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">
                      Please wait until save...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="flex-1">
            <CardContent>
              {step === 1 && (
                <RegistrationTypeSelection
                  selectedType={formData?.basicInfo?.porterType}
                  onSelect={(type) => {
                    handleChange("basicInfo", "porterType", type);
                  }}
                />
              )}
              {step === 2 && (
                <PersonalInfo
                  data={formData?.basicInfo}
                  onChange={handleChange}
                />
              )}
              {step === 3 && (
                <VehicleInfo data={formData?.vehicle} onChange={handleChange} />
              )}
              {step === 4 && (
                <DocumentInfo
                  data={formData?.documents}
                  onChange={handleChange}
                />
              )}
              {step === 5 && (
                <ReviewPage
                  data={formData}
                  onEdit={setStep}
                  onSave={handleFinalSavePorterInformation}
                  registrationId={registrationId}
                  isLoading={isSubmitting}
                />
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  disabled={step === 1}
                  onClick={() => setStep(step - 1)}
                >
                  <ChevronLeft size={16} /> Previous
                </Button>



                <Button disabled={step === 5 || (step === 1 && !formData?.basicInfo?.porterType)} onClick={handleNextStep}>
                  Next <ChevronRight size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  );
};

export default PorterRegister;
