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
              <div className="w-12 h-12 rounded-full bg-[#C5E2B6] flex items-center justify-center text-[#0C4C40] font-bold text-lg shadow-md overflow-hidden">
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
                <h3 className="font-bold text-[#0C4C40] text-base">
                  {porter.porterName || "Porter"}
                </h3>
              </div>

              {/* Distance */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" style={{ color: '#C5E2B6' }} />
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
              <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-50 text-gray-700 border border-gray-200">
                Experience: {porter.experienceYears}+
              </span>
            )}
            <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-3 h-3 ${
                      porter.averageRating && star <= Math.round(porter.averageRating)
                        ? 'fill-amber-500'
                        : 'fill-gray-300'
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                ))}
              </span>
              <span>
                {porter.averageRating ? porter.averageRating.toFixed(1) : '0.0'}
              </span>
            </span>
          </div>

          <Button
            className="w-full rounded-xl font-semibold shadow-sm hover:shadow-md transition-all"
            onClick={() => onBook && onBook(porter)}
          >
            Book Porter
          </Button>
        </div>
      ))}
    </div>
  );
};

export default AvailablePorter;
