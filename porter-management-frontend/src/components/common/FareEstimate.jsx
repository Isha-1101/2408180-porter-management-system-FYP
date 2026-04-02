import {
  Calculator,
  ChevronUp,
  ChevronDown,
  Layers,
  Weight,
  Truck,
  Route,
} from "lucide-react";
import { useFareCalculator } from "../../apis/hooks/fareHooks";
import { useState, useEffect, useMemo } from "react";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
const getIconForTitle = (title) => {
  const t = title.toLowerCase();
  if (t.includes("floor"))
    return <Layers className="w-3.5 h-3.5 text-orange-400" />;
  if (t.includes("weight"))
    return <Weight className="w-3.5 h-3.5 text-orange-400" />;
  if (t.includes("vehicle"))
    return <Truck className="w-3.5 h-3.5 text-orange-400" />;
  if (t.includes("trip"))
    return <Route className="w-3.5 h-3.5 text-orange-400" />;
  if (t.includes("lift"))
    return <ChevronUp className="w-3.5 h-3.5 text-orange-400" />;
  return <Calculator className="w-3.5 h-3.5 text-orange-400" />;
};

const FareEstimateBreakdown = ({
  numberOfFloors,
  hasLift,
  numberOfTrips,
  weight,
  hasVehicle,
  vehicleType,
  distanceKm,
  showFareBreakdown,
  setShowFareBreakdown,
  setTotalPrice,
}) => {
  const payload = useMemo(
    () => ({
      no_of_floor: numberOfFloors || 0,
      has_lift: hasLift || false,
      no_of_trips: numberOfTrips || 1,
      weightKg: weight || 5,
      vehicleType: hasVehicle && vehicleType ? vehicleType : undefined,
      distanceKm: distanceKm || 0,
    }),
    [numberOfFloors, hasLift, numberOfTrips, weight, hasVehicle, vehicleType, distanceKm],
  );

  const debouncedPayload = useDebounce(payload, 500);

  const shouldCallApi = true; // Always call API if rendered (parent decides when to render)

  const { data: fareEstimate, isFetching } = useFareCalculator(
    debouncedPayload,
    {
      enabled: shouldCallApi,
    },
  );

  useEffect(() => {
    if (fareEstimate?.totalCost !== undefined) {
      setTotalPrice(fareEstimate.totalCost);
    }
  }, [fareEstimate?.totalCost, setTotalPrice]);

  if (!fareEstimate) return null;

  return (
    <div className="rounded-xl border border-orange-200 overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setShowFareBreakdown((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-linear-to-r from-[#D35400] to-[#E67E22] text-white"
        disabled={isFetching}
      >
        <span className="flex items-center gap-2 font-semibold text-sm">
          <Calculator className="w-4 h-4" />
          {isFetching ? "Calculating Fare..." : "Estimated Fare"}
        </span>

        <span className="flex items-center gap-2">
          {!isFetching && (
            <span className="font-bold text-base">
              Rs. {fareEstimate?.totalCost ?? 0}
            </span>
          )}

          {showFareBreakdown ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </span>
      </button>

      {/* Breakdown */}
      {showFareBreakdown && !isFetching && fareEstimate?.breakdown && (
        <div className="bg-orange-50/60 divide-y divide-orange-100">
          {fareEstimate.breakdown.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-2.5 text-sm"
            >
              <div className="flex items-center gap-2 text-gray-600">
                {getIconForTitle(item.title)}
                <span>{item.title}</span>
              </div>
              <span className="font-semibold text-gray-800">
                Rs. {item.amount}
              </span>
            </div>
          ))}

          {/* Total */}
          <div className="flex items-center justify-between px-4 py-3 bg-orange-100/70">
            <span className="font-bold text-gray-800 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-[#D35400]" />
              Estimated Total
            </span>

            <span className="font-bold text-lg text-[#D35400]">
              Rs. {fareEstimate?.totalCost ?? 0}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FareEstimateBreakdown;
