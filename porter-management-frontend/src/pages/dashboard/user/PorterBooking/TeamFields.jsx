import { UserPlus, Weight, Search, CalendarDays, Clock, Route, Layers } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * All team-specific booking fields: size, weight, purpose, floors, lift, trips, requirements, date/time.
 */
const TeamFields = ({
  teamSize, onTeamSizeChange,
  weight, onWeightChange,
  purpose, onPurposeChange,
  numberOfFloors, onNumberOfFloorsChange,
  hasLift, onHasLiftToggle,
  numberOfTrips, onNumberOfTripsChange,
  requirements, onRequirementsChange,
  bookingDate, onBookingDateChange,
  bookingTime, onBookingTimeChange,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
    {/* Team Size */}
    <div className="md:col-span-6 space-y-2">
      <Label htmlFor="teamSize" className="text-sm font-medium flex items-center gap-2 text-gray-700">
        <UserPlus className="w-4 h-4 text-primary" />
        Number of Porters <span className="text-red-500">*</span>
      </Label>
      <div className="relative">
        <Input
          id="teamSize"
          type="number"
          placeholder="Ex: 3"
          value={teamSize}
          min="1"
          onChange={(e) => {
            const val = e.target.value;
            if (val === "" || parseFloat(val) >= 1) onTeamSizeChange(val);
          }}
          className="pl-9"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <UserPlus className="w-4 h-4" />
        </div>
      </div>
    </div>

    {/* Weight */}
    <div className="md:col-span-6 space-y-2">
      <Label htmlFor="weight-team" className="text-sm font-medium flex items-center gap-2 text-gray-700">
        <Weight className="w-4 h-4 text-primary" />
        Weight (kg) <span className="text-red-500">*</span>
      </Label>
      <div className="relative">
        <Input
          id="weight-team"
          type="number"
          placeholder="Min 5kg"
          value={weight}
          min="5"
          onChange={(e) => {
            const val = e.target.value;
            if (val === "" || parseFloat(val) >= 0) onWeightChange(val);
          }}
          className="pl-9 pr-12"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <Weight className="w-4 h-4" />
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium pointer-events-none bg-gray-100 px-2 py-1 rounded">
          kg
        </div>
      </div>
    </div>

    {/* Purpose */}
    <div className="md:col-span-12 space-y-2">
      <Label htmlFor="purpose-team" className="text-sm font-medium text-gray-700">
        Purpose of Booking <span className="text-red-500">*</span>
      </Label>
      <Select id="purpose-team" value={purpose} onValueChange={onPurposeChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select purpose" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="transportation">Transportation (Moving / House Shift)</SelectItem>
          <SelectItem value="delivery">Delivery</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Floors + Lift (transportation only) */}
    {purpose === "transportation" && (
      <>
        <div className="md:col-span-6 space-y-2">
          <label htmlFor="floors-team" className="text-sm font-medium flex items-center gap-2 text-gray-700">
            <Layers className="w-4 h-4 text-primary" />
            Number of Floors
          </label>
          <div className="relative">
            <input
              id="floors-team"
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

        <div className="md:col-span-6 space-y-2 h-[68px] flex flex-col justify-end">
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

    {/* Trips */}
    {purpose && (
      <div className="md:col-span-6 space-y-2">
        <label htmlFor="numberOfTrips-team" className="text-sm font-medium flex items-center gap-2 text-gray-700">
          <Route className="w-4 h-4 text-primary" />
          Number of Trips
        </label>
        <div className="relative">
          <input
            id="numberOfTrips-team"
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
    )}

    {/* Special Requirements */}
    <div className="md:col-span-12 space-y-2">
      <Label htmlFor="requirements" className="text-sm font-medium flex items-center gap-2 text-gray-700">
        <Search className="w-4 h-4 text-primary" />
        Special Requirements
      </Label>
      <textarea
        id="requirements"
        placeholder="Describe your specific requirements (e.g., heavy lifting, specialized equipment needed)..."
        value={requirements}
        onChange={(e) => onRequirementsChange(e.target.value)}
        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>

    {/* Date */}
    <div className="md:col-span-6 space-y-2">
      <Label htmlFor="bookingDate" className="text-sm font-medium flex items-center gap-2 text-gray-700">
        <CalendarDays className="w-4 h-4 text-primary" />
        Booking Date <span className="text-red-500">*</span>
      </Label>
      <Input
        id="bookingDate"
        type="date"
        value={bookingDate}
        min={new Date().toISOString().split("T")[0]}
        onChange={(e) => onBookingDateChange(e.target.value)}
        className="w-full"
      />
    </div>

    {/* Time */}
    <div className="md:col-span-6 space-y-2">
      <Label htmlFor="bookingTime" className="text-sm font-medium flex items-center gap-2 text-gray-700">
        <Clock className="w-4 h-4 text-primary" />
        Booking Time
      </Label>
      <Input
        id="bookingTime"
        type="time"
        value={bookingTime}
        onChange={(e) => onBookingTimeChange(e.target.value)}
        className="w-full"
      />
    </div>
  </div>
);

export default TeamFields;
