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
                {!(data?.porterPhoto instanceof File) ? null : (
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
            <Label className="text-sm font-medium">Porter Type *</Label>
            <Select
              value={data?.porterType}
              onValueChange={(value) =>
                onChange("basicInfo", "porterType", value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select porter type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Porter Type</SelectLabel>
                  <SelectItem value="individual">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Individual</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="team_member">
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <span>Team Member</span>
                    </div>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInfo;
