import { Clock, Star, User } from "lucide-react";
import { Button } from "../../../components/ui/button.jsx";

const AvailablePorter = ({ availablePorters }) => {
  return availablePorters && availablePorters.length > 0 ? (
    <div className="p-4 space-y-4">
      {availablePorters?.map((porter) => (
        <div
          key={porter.id}
          className="group relative rounded-2xl border border-gray-200 hover:border-primary/40 hover:shadow-lg transition-all duration-300 p-5 bg-white"
        >
          {/* Porter Info */}
          <div className="flex items-start gap-4 mb-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-md">
                {porter.name.charAt(0)}
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-secondary text-base">
                  {porter.name}
                </h3>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm text-gray-500 font-medium">
                    Estimated
                  </div>
                  <div className="text-md font-semibold text-primary">
                    Rs. {porter.price}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                  <span className="font-semibold text-gray-900">
                    {porter.rating}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{porter.etaMin} min</span>
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
              {porter.completed} trips
            </span>
          </div>

          {/* Book Button */}
          <Button className="w-full rounded-xl font-semibold shadow-sm hover:shadow-md transition-all">
            Book {porter.name.split(" ")[0]}
          </Button>
        </div>
      ))}
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <User className="w-8 h-8 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-900 mb-1">
        No porters available
      </p>
      <p className="text-sm text-gray-500">
        Try adjusting your filters to see more options
      </p>
    </div>
  );
};

export default AvailablePorter;
