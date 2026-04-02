import { Truck, Bike, Car, Package2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const VEHICLE_MAX_WEIGHT = {
  bike: 200,
  van: 500,
  "mini-truck": 800,
  truck: 2000,
};

export const VEHICLE_PRICES = {
  bike: 50,
  van: 100,
  "mini-truck": 350,
  truck: 350,
};

const VEHICLE_TYPES = [
  { id: "bike", label: "Bike", icon: Bike },
  { id: "van", label: "Van", icon: Car },
  { id: "mini-truck", label: "Mini Truck", icon: Truck },
  { id: "truck", label: "Truck", icon: Package2 },
];

const VehicleSelector = ({
  hasVehicle,
  onToggle,
  vehicleType,
  onVehicleTypeChange,
  porterType,
  numberOfVehicles,
  onNumberOfVehiclesChange,
}) => (
  <div className="md:col-span-12 space-y-3">
    {/* Toggle */}
    <div className="flex items-center justify-between p-4 bg-[#E8F5E8] rounded-lg border border-[#C5E2B6]">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#C5E2B6]/50 rounded-lg">
          <Truck className="w-5 h-5 text-[#0C4C40]" />
        </div>
        <div>
          <p className="font-medium text-sm text-gray-700">Include Vehicle</p>
          <p className="text-xs text-gray-500">
            Porter with vehicle assistance
          </p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hasVehicle ? "bg-[#0C4C40]" : "bg-gray-300"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hasVehicle ? "translate-x-6" : "translate-x-1"}`}
        />
      </button>
    </div>

    {/* Vehicle type picker */}
    {hasVehicle && (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Select Vehicle Type
        </Label>
        <div className="flex flex-wrap gap-2">
          {VEHICLE_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => onVehicleTypeChange(type.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-2 ${
                vehicleType === type.id
                  ? "bg-[#C5E2B6] text-[#0C4C40] border-[#C5E2B6] font-semibold"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#C5E2B6] hover:bg-[#C5E2B6]/30"
              }`}
            >
              <type.icon className="w-4 h-4" />
              {type.label}
              <span
                className={`text-xs ${vehicleType === type.id ? "text-[#0C4C40]/70" : "text-gray-400"}`}
              >
                up to {VEHICLE_MAX_WEIGHT[type.id]}kg · Rs.
                {VEHICLE_PRICES[type.id]}
              </span>
            </button>
          ))}
        </div>

        {/* Auto-weight info badge */}
        {vehicleType && (
          <p className="text-xs text-[#0C4C40] font-medium bg-[#E8F5E8] border border-[#C5E2B6] rounded-md px-3 py-1.5">
            Weight auto-set to {VEHICLE_MAX_WEIGHT[vehicleType]} kg · Fixed
            vehicle charge: Rs. {VEHICLE_PRICES[vehicleType]}
          </p>
        )}

        {porterType === "team" && (
          <div className="space-y-2 mt-3">
            <Label
              htmlFor="numberOfVehicles"
              className="text-sm font-medium text-gray-700"
            >
              Number of Vehicles
            </Label>
            <Input
              id="numberOfVehicles"
              type="number"
              placeholder="Ex: 2"
              value={numberOfVehicles}
              min="1"
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || parseFloat(val) >= 1)
                  onNumberOfVehiclesChange(val);
              }}
              className="w-full"
            />
          </div>
        )}
      </div>
    )}
  </div>
);

export default VehicleSelector;
