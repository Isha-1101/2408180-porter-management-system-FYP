import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Phone,
  MapPin,
  Car,
  Truck,
  Package,
  FileText,
  IdCard,
  CheckCircle,
  Edit,
  Save,
  ShieldCheck,
  Hash,
} from "lucide-react";
import { getCloudinaryUrl } from "@/utils/helper";

const ReviewPage = ({
  data,
  onEdit,
  onSave,
  isLoading,
  registrationId,
}) => {

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function to get vehicle category label
  const getVehicleCategoryLabel = (value) => {
    const categories = {
      motorcycle: "Motorcycle 🏍️",
      car: "Car 🚗",
      pickup: "Pickup Truck 🛻",
      van: "Van 🚐",
      truck: "Truck 🚚",
      three_wheeler: "Three-Wheeler 🛺",
    };
    return categories[value] || value;
  };

  // Helper function to get porter type label
  const getPorterTypeLabel = (value) => {
    const types = {
      individual: "Individual Porter",
      team_member: "Team Member",
    };
    return types[value] || value;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Review Your Information</h1>
        <p className="text-muted-foreground">
          Please review all your details before submitting. You can edit any
          section if needed.
        </p>
      </div>

      {/* Status Banner */}
      <Card className="bg-linear-to-r from-blue-50 to-indigo-50 border-blue-100">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900">
                Ready for Submission
              </h3>
              <p className="text-blue-700 text-sm">
                All information has been collected. Review and save to complete
                your registration.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Personal Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Personal Information
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(1)}
                  className="gap-2"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                {/* Profile Photo */}
                <div className="shrink-0">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                    {data.basicInfo?.porterPhoto ? (
                      <img
                        src={getCloudinaryUrl(data.basicInfo?.porterPhoto)}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <User className="h-10 w-10 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Personal Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {data.basicInfo?.fullName || "Not provided"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Phone Number
                    </p>
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {data.basicInfo?.phone || "Not provided"}
                    </p>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {data.basicInfo?.address || "Not provided"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Porter Type</p>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 w-fit"
                    >
                      {getPorterTypeLabel(data.basicInfo?.porterType)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Information Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  Vehicle Information
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(2)}
                  className="gap-2"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Vehicle Number
                  </p>
                  <p className="font-medium text-lg font-mono">
                    {data.vehicle?.vehicleNumber || "Not provided"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Vehicle Category
                  </p>
                  <p className="font-medium">
                    {getVehicleCategoryLabel(data.vehicle?.vehicleCategory)}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Load Capacity
                  </p>
                  <p className="font-medium">
                    {data.vehicle?.capacity}{" "}
                    {data.vehicle?.capacityUnit || "kg"}
                  </p>
                </div>
                {data.vehicle?.vehicleModel && (
                  <div className="space-y-1 md:col-span-2">
                    <p className="text-sm text-muted-foreground">Make/Model</p>
                    <p className="font-medium">{data.vehicle.vehicleModel}</p>
                  </div>
                )}
              </div>

              {/* Additional Vehicle Info */}
              {(data.vehicle?.insuranceNumber ||
                data.vehicle?.registrationYear) && (
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-3 text-muted-foreground">
                    Legal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.vehicle?.insuranceNumber && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Insurance Policy No.
                        </p>
                        <p className="font-medium">
                          {data.vehicle.insuranceNumber}
                        </p>
                      </div>
                    )}
                    {data.vehicle?.registrationYear && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Registration Year
                        </p>
                        <p className="font-medium">
                          {data.vehicle.registrationYear}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document Information Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Document Information
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(3)}
                  className="gap-2"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <IdCard className="h-4 w-4" />
                    License Number
                  </p>
                  <p className="font-medium">
                    {data.documents?.licenseNumber || "Not provided"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    License Document
                  </p>
                  {data.documents?.porterLicenseDocument ? (
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Uploaded
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-amber-600 border-amber-200 bg-amber-50"
                    >
                      Not Uploaded
                    </Badge>
                  )}
                </div>
              </div>

              {/* Document Preview */}
              {data.documents?.porterLicenseDocument && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">License Document</p>
                      <p className="text-xs text-muted-foreground">
                        Ready for verification
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs">
                      View
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Summary & Actions */}
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Registration overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Sections Completed
                  </span>
                  <span className="font-medium">3/3</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-full" />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Personal Info</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Vehicle Details</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Document Details</span>
                  {data.document?.porterLicenseDocument ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <span className="text-xs text-amber-600">
                      Review needed
                    </span>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Registration Date
                </p>
                <p className="font-medium">
                  {formatDate(new Date().toISOString())}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Registration ID</p>
                <p className="font-medium font-mono text-sm bg-gray-100 p-2 rounded">
                  {registrationId || "Loading..."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Card */}
          <Card>
            <CardHeader>
              <CardTitle>Finalize Registration</CardTitle>
              <CardDescription>
                Save your information to complete the registration process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1"
                    defaultChecked
                  />
                  <label htmlFor="terms" className="text-sm">
                    I confirm that all information provided is accurate and
                    complete. I agree to the terms of service and privacy
                    policy.
                  </label>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="verification"
                    className="mt-1"
                    defaultChecked
                  />
                  <label htmlFor="verification" className="text-sm">
                    I understand that my documents will be verified within 24-48
                    hours.
                  </label>
                </div>
              </div>

              <Button
                className="w-full gap-2 p-2"
                size="sm"
                onClick={onSave}
                disabled={isLoading}
              >
                <Save className="h-4 w-4 text-sm" />
                {isLoading ? "Saving..." : "Complete Registration"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                You'll receive a confirmation email upon successful registration
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button variant="outline" onClick={() => onEdit(1)} className="gap-2">
          <Edit className="h-4 w-4" />
          Edit All Information
        </Button>

        <div className="flex gap-3">
          <Button onClick={onSave} disabled={isLoading} className="gap-2">
            <Save className="h-4 w-4" />
            {isLoading ? "Processing..." : "Finalize & Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
