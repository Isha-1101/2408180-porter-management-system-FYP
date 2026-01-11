import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, Circle, ChevronRight, List } from "lucide-react";

const steps = [
  "Personal Information",
  "Vehicle Details",
  "Document Details",
  "Review Information",
];

const SidebarSteps = ({ step, setStep, registrationSteps, isOpen, toggle }) => {
  if (!isOpen) return null;

  const isStepUnlocked = (targetStep) => {
    if (targetStep <= 1) return true;
    if (targetStep === 2) return !!registrationSteps?.basicInfo?.completed;
    if (targetStep === 3) return !!registrationSteps?.vehicle?.completed;
    if (targetStep === 4) return !!registrationSteps?.documents?.completed;
    return false;
  };

  const isStepCompleted = (stepNumber) => {
    if (stepNumber === 1) return !!registrationSteps?.basicInfo?.completed;
    if (stepNumber === 2) return !!registrationSteps?.vehicle?.completed;
    if (stepNumber === 3) return !!registrationSteps?.documents?.completed;
    return false;
  };

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
            <div className="flex items-center gap-2">
              <List className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Registration Steps</CardTitle>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={toggle}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Complete all steps to register
          </p>
        </CardHeader>

        <CardContent className="p-6 space-y-2">
          {steps.map((label, index) => {
            const stepNumber = index + 1;
            const isCompleted = isStepCompleted(stepNumber);
            const isCurrent = step === stepNumber;
            const isUnlocked = isStepUnlocked(stepNumber);

            return (
              <div key={label} className="relative">
                <Button
                  variant={isCurrent ? "default" : "ghost"}
                  className={`w-full justify-start h-auto p-3 mb-2 relative z-10 ${
                    isCurrent
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
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isCurrent
                          ? "bg-white text-primary"
                          : isCompleted
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "bg-gray-100 text-gray-400 border border-gray-200"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <span
                          className={`font-semibold text-sm ${
                            isCurrent ? "text-primary" : "text-gray-500"
                          }`}
                        >
                          {stepNumber}
                        </span>
                      )}
                    </div>

                    {/* Step content */}
                    <div className="flex-1 text-left">
                      <span
                        className={`block font-medium ${
                          isCurrent ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {label}
                      </span>
                      <span
                        className={`block text-xs ${
                          isCurrent
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
                {Math.round((step / steps.length) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${(step / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Help text */}
          <div className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Step {step} of {steps.length}
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default SidebarSteps;
