import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../../../components/common/PageHeader";
import PageLayout from "../../../components/common/PageLayout";

const PorterRegister = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    photo: "",
    phone: "",
    address: "",
    porterType: "",
    porterLicenseNumber: "",
    porterLicenseDocument: "",
    vehicleNumber: "",
    vehicleCategory: "",
    capacity: "",
  });

  const totalSteps = 4;

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    toast.success("Form submitted successfully!");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Porter Information</h3>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={(e) => updateFormData("fullName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo">Photo</Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  updateFormData("photo", e.target.files?.[0]?.name || "")
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => updateFormData("phone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Enter address"
                value={formData.address}
                onChange={(e) => updateFormData("address", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="porterType">Porter Type</Label>
              <Select
                value={formData.porterType}
                className="w-full"
                onValueChange={(value) => updateFormData("porterType", value)}
              >
                <SelectTrigger id="porterType">
                  <SelectValue placeholder="Select porter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual Porter</SelectItem>
                  <SelectItem value="team_member">Team Porter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">License Information</h3>
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">Porter License Number</Label>
              <Input
                id="licenseNumber"
                placeholder="Enter license number"
                value={formData.porterLicenseNumber}
                onChange={(e) =>
                  updateFormData("porterLicenseNumber", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licenseDocument">Porter License Document</Label>
              <Input
                id="licenseDocument"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  updateFormData(
                    "porterLicenseDocument",
                    e.target.files?.[0]?.name || ""
                  )
                }
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Vehicle Types</h3>
            <div className="space-y-2">
              <Label htmlFor="vehicleNumber">Vehicle Number</Label>
              <Input
                id="vehicleNumber"
                placeholder="Enter vehicle number"
                value={formData.vehicleNumber}
                onChange={(e) =>
                  updateFormData("vehicleNumber", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleCategory">Vehicle Category</Label>
              <Select
                value={formData.vehicleCategory}
                onValueChange={(value) =>
                  updateFormData("vehicleCategory", value)
                }
              >
                <SelectTrigger id="vehicleCategory">
                  <SelectValue placeholder="Select vehicle category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bike">Bike</SelectItem>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                placeholder="Enter capacity (e.g., 500 kg)"
                value={formData.capacity}
                onChange={(e) => updateFormData("capacity", e.target.value)}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">
              Preview All Inserted Data
            </h3>
            <div className="bg-slate-50 p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Full Name:</span>
                <span>{formData.fullName || "N/A"}</span>
                <span className="font-medium">Photo:</span>
                <span>{formData.photo || "N/A"}</span>
                <span className="font-medium">Phone:</span>
                <span>{formData.phone || "N/A"}</span>
                <span className="font-medium">Address:</span>
                <span>{formData.address || "N/A"}</span>
                <span className="font-medium">Porter Type:</span>
                <span>{formData.porterType || "N/A"}</span>
                <span className="font-medium">License Number:</span>
                <span>{formData.porterLicenseNumber || "N/A"}</span>
                <span className="font-medium">License Document:</span>
                <span>{formData.porterLicenseDocument || "N/A"}</span>
                <span className="font-medium">Vehicle Number:</span>
                <span>{formData.vehicleNumber || "N/A"}</span>
                <span className="font-medium">Vehicle Category:</span>
                <span>{formData.vehicleCategory || "N/A"}</span>
                <span className="font-medium">Capacity:</span>
                <span>{formData.capacity || "N/A"}</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PageLayout
      className="max-h-screen space-y-4"
      title="Porter Registration Form"
      description="Register as a porter"
    >
      <Card className="min-w-full">
        <CardHeader>
          <CardDescription>
            Step {currentStep} of {totalSteps}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`flex-1 h-2 mx-1 rounded ${
                    step <= currentStep ? "bg-primary" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Porter Info</span>
              <span>License</span>
              <span>Vehicle</span>
              <span>Review</span>
            </div>
          </div>

          {/* Form Content */}
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep < totalSteps ? (
              <Button onClick={nextStep}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                <Check className="w-4 h-4 mr-2" />
                Submit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default PorterRegister;
