import { UserPlus, Weight, CalendarDays, Clock, Route } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const TeamFields = ({
  portersRequired, onPortersRequiredChange,
  weight, onWeightChange,
  workDescription, onWorkDescriptionChange,
  bookingDate, onBookingDateChange,
  bookingTime, onBookingTimeChange,
  requirements, onRequirementsChange,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
    {/* Number of Porters Required */}
    <div className="md:col-span-6 space-y-2">
      <Label htmlFor="portersRequired" className="text-sm font-medium flex items-center gap-2 text-gray-700">
        <UserPlus className="w-4 h-4" style={{ color: '#0C4C40' }} />
        Number of Porters Required <span className="text-red-500">*</span>
      </Label>
      <div className="relative">
        <Input
          id="portersRequired"
          type="number"
          placeholder="Ex: 3"
          value={portersRequired}
          min="1"
          onChange={(e) => {
            const val = e.target.value;
            if (val === "" || parseFloat(val) >= 1) onPortersRequiredChange(val);
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
        <Weight className="w-4 h-4" style={{ color: '#0C4C40' }} />
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

    {/* Work Description */}
    <div className="md:col-span-12 space-y-2">
      <Label htmlFor="workDescription" className="text-sm font-medium flex items-center gap-2 text-gray-700">
        <Route className="w-4 h-4" style={{ color: '#0C4C40' }} />
        Work Description <span className="text-red-500">*</span>
      </Label>
      <textarea
        id="workDescription"
        placeholder="Describe the work to be done (e.g., move furniture from 2nd floor to truck)..."
        value={workDescription}
        onChange={(e) => onWorkDescriptionChange(e.target.value)}
        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
    </div>

    {/* Special Requirements */}
    <div className="md:col-span-12 space-y-2">
      <Label htmlFor="requirements" className="text-sm font-medium flex items-center gap-2 text-gray-700">
        Special Requirements
      </Label>
      <textarea
        id="requirements"
        placeholder="Describe your specific requirements..."
        value={requirements}
        onChange={(e) => onRequirementsChange(e.target.value)}
        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
    </div>

    {/* Date */}
    <div className="md:col-span-6 space-y-2">
      <Label htmlFor="bookingDate" className="text-sm font-medium flex items-center gap-2 text-gray-700">
        <CalendarDays className="w-4 h-4" style={{ color: '#0C4C40' }} />
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
        <Clock className="w-4 h-4" style={{ color: '#0C4C40' }} />
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
