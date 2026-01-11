import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Truck, Package, Hash, Tag, Weight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const VehicleInfo = ({ data, onChange }) => {
  const vehicleCategories = [
    { value: "motorcycle", label: "Motorcycle", icon: "🏍️" },
    { value: "car", label: "Car", icon: "🚗" },
    { value: "pickup", label: "Pickup Truck", icon: "🛻" },
    { value: "van", label: "Van", icon: "🚐" },
    { value: "truck", label: "Truck", icon: "🚚" },
    { value: "three_wheeler", label: "Three-Wheeler", icon: "🛺" },
  ];
  
  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Vehicle Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Vehicle Number */}
        <div className="space-y-2">
          <Label htmlFor="vehicleNumber" className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Vehicle Registration Number *
          </Label>
          <div className="relative">
            <Input
              id="vehicleNumber"
              value={data?.vehicleNumber || ""}
              onChange={(e) =>
                onChange(
                  "vehicle",
                  "vehicleNumber",
                  e.target.value.toUpperCase()
                )
              }
              placeholder="ABC-1234 or KA-01-AB-1234"
              className="pl-9 font-mono tracking-wider"
            />
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground">
            Enter your vehicle's official registration number
          </p>
        </div>

        {/* Vehicle Category */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Vehicle Category *
          </Label>
          <Select
            value={data?.vehicleCategory}
            onValueChange={(value) =>
              onChange("vehicle", "vehicleCategory", value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select vehicle category" />
            </SelectTrigger>
            <SelectContent>
              {vehicleCategories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category.icon}</span>
                    <span>{category.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Select the type of vehicle you use for deliveries
          </p>
        </div>

        {/* Capacity Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="capacity" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              VehicleCapacity
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="capacity"
                  type="number"
                  value={data?.capacity || ""}
                  onChange={(e) =>
                    onChange("vehicle", "capacity", e.target.value)
                  }
                  placeholder="e.g. 500"
                  className="pl-9"
                  min="0"
                  step="0.1"
                />
                <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleInfo;
