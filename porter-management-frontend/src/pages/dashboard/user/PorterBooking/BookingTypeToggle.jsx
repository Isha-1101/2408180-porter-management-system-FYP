import { User, UserPlus } from "lucide-react";

const BookingTypeToggle = ({ porterType, onChange }) => (
  <div className="flex bg-gray-100 p-1.5 rounded-lg w-full">
    <button
      onClick={() => onChange("individual")}
      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-sm font-bold transition-all ${
        porterType === "individual"
          ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
      }`}
    >
      <User className="w-4 h-4" />
      Individual Porter
    </button>
    <button
      onClick={() => onChange("team")}
      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-sm font-bold transition-all ${
        porterType === "team"
          ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
      }`}
    >
      <UserPlus className="w-4 h-4" />
      Team Porter
    </button>
  </div>
);

export default BookingTypeToggle;
