import { Weight, Route, Layers } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * Purpose + weight + trips + floors + lift fields for individual porter.
 */
const PurposeFields = ({
  purpose,
  onPurposeChange,
  weight,
  onWeightChange,
  numberOfTrips,
  onNumberOfTripsChange,
  numberOfFloors,
  onNumberOfFloorsChange,
  hasLift,
  onHasLiftToggle,
}) => (
  <div className="space-y-4">
    <div className="max-w-full">
      <Label htmlFor="purpose" className="text-sm font-medium text-gray-700 mb-2 block">
        Purpose of Booking
      </Label>
      <Select id="purpose" value={purpose} onValueChange={onPurposeChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select purpose" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="transportation">Transportation</SelectItem>
          <SelectItem value="delivery">Delivery</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {purpose && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        {/* Weight */}
        <div className="space-y-2">
          <Label htmlFor="weight" className="text-sm font-medium flex items-center gap-2 text-gray-700">
            <Weight className="w-4 h-4 text-primary" />
            Weight (kg)
          </Label>
          <div className="relative">
            <Input
              id="weight"
              type="number"
              placeholder="Min 5kg"
              value={weight}
              min="5"
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || parseFloat(val) >= 0) onWeightChange(val);
              }}
              className="pl-9"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <Weight className="w-4 h-4" />
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium pointer-events-none bg-gray-100 px-2 py-1 rounded">
              kg
            </div>
          </div>
        </div>

        {/* Trips */}
        <div className="space-y-2">
          <label htmlFor="numberOfTrips" className="text-sm font-medium flex items-center gap-2 text-gray-700">
            <Route className="w-4 h-4 text-primary" />
            Number of Trips
          </label>
          <div className="relative">
            <input
              id="numberOfTrips"
              type="number"
              placeholder="e.g. 1"
              value={numberOfTrips}
              min="1"
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || parseInt(val) >= 1) onNumberOfTripsChange(val);
              }}
              className="flex h-9 w-full rounded-md border border-input bg-transparent pl-10 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <Route className="w-4 h-4" />
            </div>
          </div>
        </div>

        {purpose === "transportation" && (
          <>
            {/* Floors */}
            <div className="space-y-2">
              <label htmlFor="floors" className="text-sm font-medium flex items-center gap-2 text-gray-700">
                <Layers className="w-4 h-4 text-primary" />
                Number of Floors
              </label>
              <div className="relative">
                <input
                  id="floors"
                  type="number"
                  placeholder="e.g. 4"
                  value={numberOfFloors}
                  min="0"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || parseInt(val) >= 0) onNumberOfFloorsChange(val);
                  }}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent pl-10 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Lift */}
            <div className="space-y-2 h-[68px] flex flex-col justify-end">
              <div className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-medium text-sm text-gray-700">Elevator / Lift available?</p>
                <button
                  onClick={onHasLiftToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hasLift ? "bg-primary" : "bg-gray-300"}`}
                  type="button"
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hasLift ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    )}
  </div>
);

export default PurposeFields;
