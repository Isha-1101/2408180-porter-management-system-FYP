import { MapPin, User, Weight } from "lucide-react";
import { Button } from "../../../components/ui/button.jsx";
import { getCloudinaryUrl } from "../../../utils/helper.js";

const AvailablePorter = ({ availablePorters, onBook, isLoadingPorter }) => {
  if (!availablePorters || isLoadingPorter || availablePorters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-900 mb-1">
          No porters available
        </p>
        <p className="text-sm text-gray-500">
          Try adjusting your filters or expanding the radius
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {availablePorters.map((porter) => (
        <div
          key={porter.id}
          className="group relative rounded-2xl border border-gray-200 hover:border-primary/40 hover:shadow-lg transition-all duration-300 p-5 bg-white"
        >
          {/* Porter Info */}
          <div className="flex items-start gap-4 mb-4">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shadow-md overflow-hidden">
                {porter.photo ? (
                  <img
                    src={getCloudinaryUrl(porter.photo)}
                    alt={porter.porterName || "Porter"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {porter.porterName?.charAt(0)?.toUpperCase() || "P"}
                  </span>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-bold text-secondary text-base">
                  {porter.porterName || "Porter"}
                </h3>
              </div>

              {/* Distance */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>
                  {porter.distanceMeters
                    ? `${Math.round(porter.distanceMeters)} m away`
                    : "Distance unknown"}
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {porter.experienceYears != null && (
              <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                {porter.experienceYears} yrs experience
              </span>
            )}
            {porter.maxWeightKg != null && (
              <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 inline-flex items-center gap-1">
                <Weight className="w-3 h-3" />
                Up to {porter.maxWeightKg} kg
              </span>
            )}
            {porter.porterType && (
              <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 capitalize">
                {porter.porterType}
              </span>
            )}
          </div>

          <Button
            className="w-full rounded-xl font-semibold shadow-sm hover:shadow-md transition-all"
            onClick={() => onBook && onBook(porter)}
          >
            Book This Porter
          </Button>
        </div>
      ))}
    </div>
  );
};

export default AvailablePorter;
