import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { reverseGeocode } from "../../utils/reverseGeocode";

/**
 * Displays a pickup/dropoff location as a human-readable address.
 * - If `location.address` is already set it renders instantly.
 * - Otherwise it reverse-geocodes `location.lat / location.lng` via Nominatim.
 *
 * Props:
 *   location  — { lat, lng, address? }
 *   dot       — "green" | "red" | false  (default false — no dot)
 *   className — extra classes for the wrapper <div>
 */
export function AddressLine({ location, dot = false, className = "" }) {
  const [display, setDisplay] = useState(location?.address || null);

  useEffect(() => {
    if (display) return;
    if (!location?.lat || !location?.lng) {
      setDisplay("Unknown location");
      return;
    }
    reverseGeocode(location.lat, location.lng).then(setDisplay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.lat, location?.lng]);

  const dotColor =
    dot === "green" ? "bg-green-500" : dot === "red" ? "bg-red-500" : null;

  return (
    <div className={`flex items-start gap-2 ${className}`}>
      {dotColor && (
        <div className={`w-2 h-2 ${dotColor} rounded-full mt-1.5 shrink-0`} />
      )}
      <div className="min-w-0">
        {display === null ? (
          <span className="inline-flex items-center gap-1 text-gray-400 text-xs">
            <Loader2 className="h-3 w-3 animate-spin" />
            Resolving…
          </span>
        ) : (
          <span className="text-sm font-medium line-clamp-2">{display}</span>
        )}
      </div>
    </div>
  );
}
