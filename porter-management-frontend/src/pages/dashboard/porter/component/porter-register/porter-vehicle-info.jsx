import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Truck, Package, Hash, Tag, Weight, CheckCircle, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const validate = (data) => {
  if (data?.hasVehicle === false) {
    return { vehicleCategory: "", capacity: "" };
  }
  return {
    vehicleCategory: !data?.vehicleCategory ? "Select your vehicle category" : "",
    capacity: data?.capacity 
      ? (!/^\d+(\.\d+)?$/.test(data.capacity) || Number(data.capacity) <= 0
        ? "Enter a valid positive number"
        : "")
      : "" // Optional field, if provided must be > 0 and digits
  };
};

export const isVehicleInfoValid = (data) => {
  if (data?.hasVehicle === false) return true;
  if (data?.hasVehicle === undefined || data?.hasVehicle === null) return false;
  const errors = validate(data);
  return Object.values(errors).every((e) => e === "");
};

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

const VehicleInfo = ({ data, onChange }) => {
  const [touched, setTouched] = useState({
    vehicleCategory: false,
    capacity: false,
  });

  const errors = validate(data);

  const touch = (field) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const vehicleCategories = [
    { value: "bike", label: "Bike" },
    { value: "truck", label: "Truck" },
    { value: "van", label: "Van" },
    { value: "mini-truck", label: "Mini Truck" },
  ];

  const handleHasVehicleChange = (value) => {
    onChange("vehicle", "hasVehicle", value);
    if (!value) {
      onChange("vehicle", "vehicleCategory", "");
      onChange("vehicle", "capacity", "");
    }
  };

  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Vehicle Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Do you have a vehicle? */}
        <div className="space-y-3">
          <Label className="text-base font-medium">
            Do you have a vehicle? *
          </Label>
          <div className="flex gap-4">
            <div
              onClick={() => handleHasVehicleChange(true)}
              className={`
                flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-center gap-2
                ${
                  data?.hasVehicle === true
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-muted hover:border-primary/50"
                }
              `}
            >
              <Car className="h-5 w-5" />
              <span className="font-semibold">Yes, I have a vehicle</span>
            </div>
            <div
              onClick={() => handleHasVehicleChange(false)}
              className={`
                flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-center gap-2
                ${
                  data?.hasVehicle === false
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-muted hover:border-primary/50"
                }
              `}
            >
              <Weight className="h-5 w-5" />
              <span className="font-semibold">No, I'm a walker</span>
            </div>
          </div>
        </div>

        {data?.hasVehicle && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Vehicle Category */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Vehicle Category *
              </Label>
              <Select
                value={data?.vehicleCategory || ""}
                onValueChange={(value) => {
                  touch("vehicleCategory");
                  onChange("vehicle", "vehicleCategory", value);
                }}
              >
                <SelectTrigger className={`w-full transition-colors ${fieldClass(touched.vehicleCategory, errors.vehicleCategory, data?.vehicleCategory)}`}>
                  <SelectValue placeholder="Select your vehicle category" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <span>{category.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldMsg touched={touched.vehicleCategory} error={errors.vehicleCategory} value={data?.vehicleCategory} />
            </div>



            {/* Capacity Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="capacity" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Vehicle Capacity (kg)
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="capacity"
                      type="text"
                      value={data?.capacity || ""}
                      onChange={(e) => {
                        touch("capacity");
                        const val = e.target.value.replace(/[^\d.]/g, ""); // Only digits/dots
                        onChange("vehicle", "capacity", val);
                      }}
                      onBlur={() => touch("capacity")}
                      placeholder="Enter your vehicle capacity (e.g., 500)"
                      className={`pl-9 transition-colors ${fieldClass(touched.capacity, errors.capacity, data?.capacity)}`}
                    />
                    <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <FieldMsg touched={touched.capacity} error={errors.capacity} value={data?.capacity} />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VehicleInfo;
