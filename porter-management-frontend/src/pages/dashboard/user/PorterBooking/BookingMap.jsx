import { MapPin } from "lucide-react";
import UserMap from "@/components/Map/UserMap";

const BookingMap = ({ selectingMapFor, onMapClick, pickup, dropoff, onCancelSelect }) => (
  <div className="relative w-full h-[400px] md:h-[350px] not-only:overflow-hidden shadow-sm">
    {selectingMapFor && (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-1000 bg-[#F5FBF2] px-4 py-2 rounded-full shadow-md font-medium text-sm text-[#0C4C40] flex items-center gap-2 border border-[#C5E2B6]">
        <MapPin className="w-4 h-4" />
        Click on the map to set {selectingMapFor === "pickup" ? "Pickup" : "Dropoff"} location
        <button onClick={onCancelSelect} className="ml-2 text-gray-400 hover:text-[#0C4C40]">
          &times;
        </button>
      </div>
    )}
    <UserMap
      showSidebar={false}
      onMapClick={onMapClick}
      pickupLocation={pickup}
      dropoffLocation={dropoff}
      className={selectingMapFor ? "cursor-crosshair" : ""}
    />
  </div>
);

export default BookingMap;
