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
      </div>

      <div className="space-y-6">
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
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8">
              {/* Profile Photo */}
              <div className="shrink-0 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm">
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
                <p className="text-xs text-muted-foreground mt-2">Profile Photo</p>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 flex-1 w-full">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium text-base">{data.basicInfo?.fullName || "Not provided"}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="font-medium text-base">{data.basicInfo?.phone || "Not provided"}</p>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium text-base">{data.basicInfo?.address || "Not provided"}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Registration ID Type</p>
                  <p className="font-medium text-base capitalize">{data.basicInfo?.identityType?.replace("_", " ") || "Not provided"}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Registration ID Number</p>
                  <p className="font-medium text-base">{data.basicInfo?.identityNumber || "Not provided"}</p>
                </div>
              </div>
            </div>

            {/* ID Card Photos */}
            {(data.basicInfo?.identityCardImageFront || data.basicInfo?.identityCardImageBack) && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3 text-muted-foreground">Identity Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.basicInfo?.identityCardImageFront && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Front Side</p>
                      <div className="h-40 border rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
                        <img
                          src={getCloudinaryUrl(data.basicInfo?.identityCardImageFront)}
                          alt="ID Front"
                          className="h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                  {data.basicInfo?.identityCardImageBack && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Back Side</p>
                      <div className="h-40 border rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
                        <img
                          src={getCloudinaryUrl(data.basicInfo?.identityCardImageBack)}
                          alt="ID Back"
                          className="h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
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
            {data.vehicle?.hasVehicle ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Hash className="h-4 w-4" />
                      Vehicle Number
                    </p>
                    <p className="font-medium text-lg font-mono">
                      {data.vehicle?.vehicleNumber || "Not provided"}
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
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-dashed text-muted-foreground">
                <div className="p-2 bg-gray-200 rounded-full">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Registered as Walker</p>
                  <p className="text-xs">No vehicle details provided</p>
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
                  {/* View Logic could go here */}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Finalize Registration Section - Moved from sidebar */}
      <Card className="border-t-4 border-t-primary">
        <CardContent className="p-6">
          <div className="space-y-4">
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

            <Button
              className="w-full gap-2 py-6 text-lg"
              size="lg"
              onClick={onSave}
              disabled={isLoading}
            >
              <Save className="h-5 w-5" />
              {isLoading ? "Processing..." : "Submit Registration"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewPage;
