import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { usePorterRegistration } from "../../providers/PorterRegistrationProvider.jsx";

const SidebarSteps = ({ step, setStep, registrationSteps, isOpen, toggle }) => {
  const navigate = useNavigate();
  const { formData } = usePorterRegistration();

  if (!isOpen) return null;

  const isWalker = formData?.vehicle?.hasVehicle === false;

  const displayedSteps = [
    { label: "Registration Type", stepNumber: 1 },
    { label: "Personal Information", stepNumber: 2 },
    { label: "Vehicle Details", stepNumber: 3 },
    ...(!isWalker ? [{ label: "Document Details", stepNumber: 4 }] : []),
    { label: "Review Information", stepNumber: 5 },
  ];

  const isStepUnlocked = (targetStepNumber) => {
    if (targetStepNumber <= 1) return true;
    if (targetStepNumber === 2) return true;
    if (targetStepNumber === 3) return !!(registrationSteps?.basicInfo?.completed || registrationSteps?.basicInfo?.isCompleted);
    if (targetStepNumber === 4) {
      return !!(registrationSteps?.vehicle?.completed || registrationSteps?.vehicle?.isCompleted);
    }
    if (targetStepNumber === 5) {
      if (isWalker) {
        return !!(registrationSteps?.vehicle?.completed || registrationSteps?.vehicle?.isCompleted);
      }
      return !!(registrationSteps?.documents?.completed || registrationSteps?.documents?.isCompleted);
    }
    return false;
  };

  const isStepCompleted = (targetStepNumber) => {
    if (targetStepNumber === 1) return true;
    if (targetStepNumber === 2) return !!(registrationSteps?.basicInfo?.completed || registrationSteps?.basicInfo?.isCompleted);
    if (targetStepNumber === 3) return !!(registrationSteps?.vehicle?.completed || registrationSteps?.vehicle?.isCompleted);
    if (targetStepNumber === 4) return !!(registrationSteps?.documents?.completed || registrationSteps?.documents?.isCompleted);
    return false;
  };

  const displayedActiveIndex = displayedSteps.findIndex(item => item.stepNumber === step) + 1;

  return (
    <>
      {/* Mobile overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={toggle}
      />

      <Card className="w-full md:w-80 h-full md:h-auto fixed md:sticky top-0 md:top-6 left-0 md:left-auto z-50 md:z-auto transform md:transform-none transition-transform duration-300 ease-in-out md:shadow-sm border-r-0 md:border-r">
        <CardHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                if (step > 1) {
                  if (step === 5 && isWalker) {
                    setStep(3);
                  } else {
                    setStep(step - 1);
                  }
                } else {
                  navigate(-1);
                }
              }}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-2">
          {displayedSteps.map((item, index) => {
            const stepNumber = item.stepNumber;
            const isCompleted = isStepCompleted(stepNumber);
            const isCurrent = step === stepNumber;
            const isUnlocked = isStepUnlocked(stepNumber);

            return (
              <div key={item.label} className="relative">
                <Button
                  variant={isCurrent ? "default" : "ghost"}
                  className={`w-full justify-start h-auto p-3 mb-2 relative z-10 ${isCurrent
                    ? "bg-primary hover:bg-primary/90 shadow-sm"
                    : isUnlocked
                      ? "hover:bg-gray-50"
                      : "opacity-50 cursor-not-allowed"
                    }`}
                  disabled={!isUnlocked && !isCompleted}
                  onClick={() => {
                    if (!isUnlocked && !isCompleted) return;
                    setStep(stepNumber);
                  }}
                >
                  <div className="flex items-center gap-3 w-full">
                    {/* Step indicator */}
                    <div
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isCurrent
                        ? "bg-white text-primary"
                        : isCompleted
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "bg-gray-100 text-gray-400 border border-gray-200"
                        }`}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5 stroke-[3]" />
                      ) : (
                        <span
                          className={`font-semibold text-sm ${isCurrent ? "text-primary" : "text-gray-500"
                            }`}
                        >
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* Step content */}
                    <div className="flex-1 text-left">
                      <span
                        className={`block font-medium ${isCurrent ? "text-white" : "text-gray-900"
                          }`}
                      >
                        {item.label}
                      </span>
                      <span
                        className={`block text-xs ${isCurrent
                          ? "text-primary-foreground/80"
                          : "text-gray-500"
                          }`}
                      >
                        {isCompleted
                          ? "Completed"
                          : isCurrent
                            ? "In Progress"
                            : isUnlocked
                              ? "Pending"
                              : "Locked"}
                      </span>
                    </div>

                    {/* Current step indicator */}
                    {isCurrent && (
                      <ChevronRight className="h-4 w-4 text-primary-foreground/70" />
                    )}
                  </div>
                </Button>
              </div>
            );
          })}

          {/* Progress indicator */}
          <div className="pt-4 mt-4 border-t">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-primary">
                {Math.round((displayedActiveIndex / displayedSteps.length) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${(displayedActiveIndex / displayedSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Help text */}
          <div className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Step {displayedActiveIndex} of {displayedSteps.length}
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default SidebarSteps;
