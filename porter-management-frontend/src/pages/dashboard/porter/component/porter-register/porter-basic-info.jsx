import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, MapPin, Camera, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { getCloudinaryUrl } from "@/utils/helper";

// ── Validation rules (same as Sign Up page) ──────────────────────────────────
const validate = (data) => ({
  fullName: !data?.fullName
    ? "Only letters allowed, minimum 2 characters"
    : /^[a-zA-Z]+(?: [a-zA-Z]+)*$/.test(data.fullName) && data.fullName.trim().length >= 2
    ? ""
    : "Only letters allowed, minimum 2 characters",

  phone: !data?.phone
    ? "Enter a valid 10-digit phone number"
    : /^(98|97)\d{8}$/.test(data.phone)
    ? ""
    : "Enter a valid 10-digit phone number",

  address: !data?.address || data.address.trim().length < 5
    ? "Enter a valid address"
    : "",

  identityType: !data?.identityType
    ? "Please select an ID type"
    : "",

  identityNumber: !data?.identityNumber
    ? "Enter a valid ID number"
    : /^[a-zA-Z0-9]+$/.test(data.identityNumber)
    ? ""
    : "Enter a valid ID number",

  porterPhoto: !data?.porterPhoto
    ? "Please upload a valid photo"
    : data.porterPhoto instanceof File
    ? /\.(jpg|jpeg|png|gif)$/i.test(data.porterPhoto.name)
      ? ""
      : "Please upload a valid photo"
    : "",                          // already-saved string URL → ok

  identityCardImageFront: !data?.identityCardImageFront
    ? "Please upload required ID images"
    : data.identityCardImageFront instanceof File
    ? /\.(jpg|jpeg|png)$/i.test(data.identityCardImageFront.name)
      ? ""
      : "Please upload required ID images"
    : "",

  identityCardImageBack: !data?.identityCardImageBack
    ? "Please upload required ID images"
    : data.identityCardImageBack instanceof File
    ? /\.(jpg|jpeg|png)$/i.test(data.identityCardImageBack.name)
      ? ""
      : "Please upload required ID images"
    : "",
});

export const isPersonalInfoValid = (data) =>
  Object.values(validate(data)).every((e) => e === "");

// ── Helper: field border class ────────────────────────────────────────────────
const fieldClass = (touched, error, value) => {
  if (!touched) return "border-gray-300 focus:border-primary focus:ring-primary";
  if (error)    return "border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/30";
  return "border-gray-300 focus:border-primary focus:ring-primary";
};

// ── FieldMsg: shows error or success icon underneath ─────────────────────────
const FieldMsg = ({ touched, error, value }) => {
  if (!touched) return null;
  if (error)
    return (
      <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
        <AlertCircle className="h-3 w-3 shrink-0" />
        {error}
      </p>
    );
  return null;
};

// ── UploadBox: dashed upload area with validation colour ──────────────────────
const UploadBox = ({ touched, error, value, children }) => {
  const border = !touched
    ? "border-gray-300"
    : error
    ? "border-red-400 bg-red-50/20"
    : "border-gray-300 hover:border-primary";

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center min-h-[150px] relative overflow-hidden group hover:border-primary transition-colors ${border}`}
    >
      {children}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const PersonalInfo = ({ data, onChange }) => {
  const [touched, setTouched] = useState({
    fullName: false,
    phone: false,
    address: false,
    identityType: false,
    identityNumber: false,
    porterPhoto: false,
    identityCardImageFront: false,
    identityCardImageBack: false,
  });

  const errors = validate(data);

  const touch = (field) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleTextChange = (field, value) => {
    touch(field);
    onChange("basicInfo", field, value);
  };

  // ── Photo preview URL ─────────────────────────────────────────────────────
  const porterPhotoUrl =
    data?.porterPhoto instanceof Blob
      ? URL.createObjectURL(data.porterPhoto)
      : typeof data?.porterPhoto === "string"
      ? data.porterPhoto
      : null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    touch("porterPhoto");
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

        {/* ── Photo Upload ───────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div
              className={`w-32 h-32 rounded-full overflow-hidden border-4 shadow-md transition-colors ${
                touched.porterPhoto && errors.porterPhoto
                  ? "border-red-300"
                  : "border-gray-100 hover:border-primary"
              }`}
            >
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
                <Input
                  id="photo-upload"
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,image/jpeg,image/png,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Click the camera icon to upload a photo
            </p>
            <p className="text-xs text-muted-foreground">
              Recommended: 500×500 px, JPG, PNG or GIF
            </p>
          </div>

          {touched.porterPhoto && errors.porterPhoto && (
            <p className="flex items-center gap-1 text-xs text-red-500">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {errors.porterPhoto}
            </p>
          )}
        </div>

        {/* ── Form Fields Grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Full Name */}
          <div className="space-y-1">
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name *
            </Label>
            <Input
              id="fullName"
              value={data?.fullName || ""}
              onChange={(e) => handleTextChange("fullName", e.target.value)}
              onBlur={() => touch("fullName")}
              placeholder="Enter full name"
              className={`w-full transition-colors ${fieldClass(
                touched.fullName,
                errors.fullName,
                data?.fullName
              )}`}
            />
            <FieldMsg
              touched={touched.fullName}
              error={errors.fullName}
              value={data?.fullName}
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number *
            </Label>
            <Input
              id="phone"
              value={data?.phone || ""}
              maxLength={10}
              onChange={(e) => {
                // digits only
                const digits = e.target.value.replace(/\D/g, "");
                handleTextChange("phone", digits);
              }}
              onBlur={() => touch("phone")}
              placeholder="98XXXXXXXX"
              className={`w-full transition-colors ${fieldClass(
                touched.phone,
                errors.phone,
                data?.phone
              )}`}
            />
            <FieldMsg
              touched={touched.phone}
              error={errors.phone}
              value={data?.phone}
            />
          </div>

          {/* Address */}
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address *
            </Label>
            <Input
              id="address"
              value={data?.address || ""}
              onChange={(e) => handleTextChange("address", e.target.value)}
              onBlur={() => touch("address")}
              placeholder="Enter full address"
              className={`w-full transition-colors ${fieldClass(
                touched.address,
                errors.address,
                data?.address
              )}`}
            />
            <FieldMsg
              touched={touched.address}
              error={errors.address}
              value={data?.address}
            />
          </div>

          {/* Registration ID Type */}
          <div className="space-y-1">
            <Label htmlFor="identityType" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Registration ID Type *
            </Label>
            <Select
              value={data?.identityType || ""}
              onValueChange={(value) => {
                touch("identityType");
                onChange("basicInfo", "identityType", value);
              }}
            >
              <SelectTrigger
                className={`transition-colors ${fieldClass(
                  touched.identityType,
                  errors.identityType,
                  data?.identityType
                )}`}
              >
                <SelectValue placeholder="Select ID Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="citizenship">Citizenship</SelectItem>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="national_id">National ID</SelectItem>
                <SelectItem value="driving_license">Driving License</SelectItem>
              </SelectContent>
            </Select>
            <FieldMsg
              touched={touched.identityType}
              error={errors.identityType}
              value={data?.identityType}
            />
          </div>

          {/* Registration ID Number */}
          <div className="space-y-1">
            <Label htmlFor="identityNumber" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Registration ID Number *
            </Label>
            <Input
              id="identityNumber"
              value={data?.identityNumber || ""}
              onChange={(e) => {
                // alphanumeric only
                const val = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                handleTextChange("identityNumber", val);
              }}
              onBlur={() => touch("identityNumber")}
              placeholder="Enter ID number"
              className={`w-full transition-colors ${fieldClass(
                touched.identityNumber,
                errors.identityNumber,
                data?.identityNumber
              )}`}
            />
            <FieldMsg
              touched={touched.identityNumber}
              error={errors.identityNumber}
              value={data?.identityNumber}
            />
          </div>

          {/* ID Card Front */}
          <div className="space-y-1">
            <Label className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              ID Card Front *
            </Label>
            <Label
              htmlFor="id-card-front"
              className="cursor-pointer block"
              onClick={() => touch("identityCardImageFront")}
            >
              <UploadBox
                touched={touched.identityCardImageFront}
                error={errors.identityCardImageFront}
                value={data?.identityCardImageFront}
              >
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
                    <span className="text-xs">Upload Front (JPG, PNG)</span>
                  </div>
                )}
              </UploadBox>
            </Label>
            <Input
              id="id-card-front"
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                touch("identityCardImageFront");
                if (file) onChange("basicInfo", "identityCardImageFront", file);
              }}
              className="hidden"
            />
            <FieldMsg
              touched={touched.identityCardImageFront}
              error={errors.identityCardImageFront}
              value={data?.identityCardImageFront}
            />
          </div>

          {/* ID Card Back */}
          <div className="space-y-1">
            <Label className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              ID Card Back *
            </Label>
            <Label
              htmlFor="id-card-back"
              className="cursor-pointer block"
              onClick={() => touch("identityCardImageBack")}
            >
              <UploadBox
                touched={touched.identityCardImageBack}
                error={errors.identityCardImageBack}
                value={data?.identityCardImageBack}
              >
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
                    <span className="text-xs">Upload Back (JPG, PNG)</span>
                  </div>
                )}
              </UploadBox>
            </Label>
            <Input
              id="id-card-back"
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                touch("identityCardImageBack");
                if (file) onChange("basicInfo", "identityCardImageBack", file);
              }}
              className="hidden"
            />
            <FieldMsg
              touched={touched.identityCardImageBack}
              error={errors.identityCardImageBack}
              value={data?.identityCardImageBack}
            />
          </div>

        </div>

        {/* ── Disclaimer ────────────────────────────────────────────────── */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 mt-2">
          <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 leading-snug">
            <span className="font-semibold">Important:</span>{" "}
            You must register with the same{" "}
            <span className="font-medium">full name</span> and{" "}
            <span className="font-medium">phone number</span> used during account
            creation.
          </p>
        </div>

      </CardContent>
    </Card>
  );
};

export default PersonalInfo;
