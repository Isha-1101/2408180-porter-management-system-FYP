import { MapPin, Navigation, Crosshair } from "lucide-react";
import { Label } from "@/components/ui/label";
import LocationAutocomplete from "@/components/common/LocationAutocomplete";

const LocationInputs = ({ pickup, dropoff, selectingMapFor, onPickupChange, onDropoffChange, onSelectMapFor, onSetCurrentLocation }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* From */}
    <div className="space-y-2">
      <Label htmlFor="from-location" className="text-sm font-medium flex items-center gap-2 text-gray-700">
        <MapPin className="w-4 h-4" style={{ color: '#0C4C40' }} />
        From
      </Label>
      <div className="relative">
        <LocationAutocomplete
          id="from-location"
          placeholder="Pickup location"
          value={pickup}
          onChange={onPickupChange}
          icon={MapPin}
          className="pl-9 pr-16"
          inputRightButtons={
            <>
              <div className="absolute right-8 top-1/2 -translate-y-1/2">
                <button
                  type="button"
                  onClick={() => onSelectMapFor(selectingMapFor === "pickup" ? null : "pickup")}
                  className={`p-1.5 rounded-full transition-colors ${selectingMapFor === "pickup" ? "bg-[#0C4C40] text-white" : "hover:bg-[#C5E2B6] text-gray-500 hover:text-[#0C4C40]"}`}
                  title="Select from map"
                >
                  <MapPin className="w-4 h-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={onSetCurrentLocation}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-[#C5E2B6] rounded-full text-gray-500 hover:text-[#0C4C40] transition-colors"
                title="Use current location"
              >
                <Crosshair className="w-4 h-4" />
              </button>
            </>
          }
        />
      </div>
    </div>

    {/* To */}
    <div className="space-y-2">
      <Label htmlFor="to-location" className="text-sm font-medium flex items-center gap-2 text-gray-700">
        <Navigation className="w-4 h-4" style={{ color: '#0C4C40' }} />
        To
      </Label>
      <div className="relative">
        <LocationAutocomplete
          id="to-location"
          placeholder="Destination"
          value={dropoff}
          onChange={onDropoffChange}
          icon={Navigation}
          className="pl-9 pr-10"
          inputRightButtons={
            <button
              type="button"
              onClick={() => onSelectMapFor(selectingMapFor === "dropoff" ? null : "dropoff")}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${selectingMapFor === "dropoff" ? "bg-[#0C4C40] text-white" : "hover:bg-[#C5E2B6] text-gray-500 hover:text-[#0C4C40]"}`}
              title="Select from map"
            >
              <MapPin className="w-4 h-4" />
            </button>
          }
        />
      </div>
    </div>
  </div>
);

export default LocationInputs;
