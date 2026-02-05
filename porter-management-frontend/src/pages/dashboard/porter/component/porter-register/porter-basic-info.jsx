import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, MapPin, Camera } from "lucide-react";
import { useEffect } from "react";
import { getCloudinaryUrl } from "@/utils/helper";

const PersonalInfo = ({ data, onChange }) => {
  const porterPhotoUrl =
    data?.porterPhoto instanceof Blob
      ? URL.createObjectURL(data.porterPhoto)
      : typeof data?.porterPhoto === "string"
        ? data.porterPhoto
        : null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange("basicInfo", "porterPhoto", file);
  };

  useEffect(() => {
    return () => {
      if (data?.porterPhoto instanceof Blob && porterPhotoUrl) {
        URL.revokeObjectURL(porterPhotoUrl);
      }
    };
  }, [data?.porterPhoto, porterPhotoUrl]);

  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Photo Upload Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-md">
              {data?.porterPhoto ? (
                <img
                  src={
                    data?.porterPhoto !== null && !(data?.porterPhoto instanceof File)
                      ? getCloudinaryUrl(data.porterPhoto)
                      : porterPhotoUrl
                  }
                  alt="porter"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <div className="absolute bottom-2 right-2">
                <Label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                </Label>
                {(data?.porterPhoto instanceof File) ? null : (
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                )}
              </div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Click the camera icon to upload a photo
            </p>
            <p className="text-xs text-muted-foreground">
              Recommended: 500x500px, JPG, PNG or GIF
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name *
            </Label>
            <Input
              id="fullName"
              value={data?.fullName || ""}
              onChange={(e) =>
                // console.log(e)
                onChange("basicInfo", "fullName", e.target.value)
              }
              placeholder="Enter full name"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number *
            </Label>
            <Input
              id="phone"
              value={data?.phone || ""}
              onChange={(e) =>
                onChange("basicInfo", "phone", e.target.value)
              }
              placeholder="Enter phone number"
              className="w-full"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address *
            </Label>
            <Input
              id="address"
              value={data?.address || ""}
              onChange={(e) =>
                onChange("basicInfo", "address", e.target.value)
              }
              placeholder="Enter full address"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="identityType" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Registration ID Type *
            </Label>
            <Select
              value={data?.identityType || ""}
              onValueChange={(value) => onChange("basicInfo", "identityType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ID Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="citizenship">Citizenship</SelectItem>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="national_id">National ID</SelectItem>
                <SelectItem value="driving_license">Driving License</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="identityNumber" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Registration ID Number *
            </Label>
            <Input
              id="identityNumber"
              value={data?.identityNumber || ""}
              onChange={(e) => onChange("basicInfo", "identityNumber", e.target.value)}
              placeholder="Enter ID number"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              ID Card Front *
            </Label>
            <Label htmlFor="id-card-front" className="cursor-pointer block">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[150px] relative overflow-hidden group hover:border-primary transition-colors">
                {data?.identityCardImageFront ? (
                  <img
                    src={
                      data.identityCardImageFront instanceof File
                        ? URL.createObjectURL(data.identityCardImageFront)
                        : getCloudinaryUrl(data.identityCardImageFront)
                    }
                    alt="Front ID"
                    className="absolute inset-0 w-full h-full object-contain bg-gray-50 p-2"
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <Camera className="h-8 w-8 mb-2" />
                    <span className="text-xs">Upload Front</span>
                  </div>
                )}
              </div>
            </Label>
            <Input
              id="id-card-front"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onChange("basicInfo", "identityCardImageFront", file);
              }}
              className="hidden"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              ID Card Back *
            </Label>
            <Label htmlFor="id-card-back" className="cursor-pointer block">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[150px] relative overflow-hidden group hover:border-primary transition-colors">
                {data?.identityCardImageBack ? (
                  <img
                    src={
                      data.identityCardImageBack instanceof File
                        ? URL.createObjectURL(data.identityCardImageBack)
                        : getCloudinaryUrl(data.identityCardImageBack)
                    }
                    alt="Back ID"
                    className="absolute inset-0 w-full h-full object-contain bg-gray-50 p-2"
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <Camera className="h-8 w-8 mb-2" />
                    <span className="text-xs">Upload Back</span>
                  </div>
                )}
              </div>
            </Label>
            <Input
              id="id-card-back"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onChange("basicInfo", "identityCardImageBack", file);
              }}
              className="hidden"
            />
          </div>


        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInfo;
