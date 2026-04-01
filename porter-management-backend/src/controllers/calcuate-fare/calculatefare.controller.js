// ── Constants ────────────────────────────────────────────────────────────────

/** Max weight each vehicle type can carry (kg) */
export const VEHICLE_MAX_WEIGHT = {
  bike: 200,
  van: 500,
  "mini-truck": 800,
  truck: 2000,
};

/** Fixed price per vehicle type (Rs.) */
export const VEHICLE_PRICES = {
  bike: 50,
  van: 100,
  "mini-truck": 350,
  truck: 350,
};

const BASE_FARE_WEIGHT = 20;   // Rs. for first 5 kg
const BASE_FARE_DISTANCE = 30; // Rs. for first 5 km
const EXTRA_KM_RATE = 10;      // Rs. per km beyond 5 km
const EXTRA_KG_RATE = 2;       // Rs. per kg beyond 5 kg
const LABOUR_COST = 100;       // Rs. base labour
const FLOOR_RATE = 5;          // Rs. per floor
const TRIP_RATE = 5;           // Rs. per trip
const NO_LIFT_SURCHARGE = 50;  // Rs. added when no lift

// ─────────────────────────────────────────────────────────────────────────────

export const fareCalculator = async (req, res) => {
  try {
    const { no_of_floor, has_lift, no_of_trips, weightKg, vehicleType, distanceKm } = req.query;

    const floors    = Number(no_of_floor) || 0;
    const trips     = Number(no_of_trips) || 1;
    const weight    = Number(weightKg)    || 5;
    const distance  = Number(distanceKm)  || 0;
    const liftAvail = has_lift === "true";

    let breakdown = [];
    let totalCost = 0;

    // ── If vehicle booking: only vehicle charge + distance charge ────────────
    if (vehicleType && VEHICLE_PRICES[vehicleType] !== undefined) {
      // Vehicle charge (fixed)
      const vehicleCost = VEHICLE_PRICES[vehicleType];
      breakdown.push({ title: `Vehicle Charge (${vehicleType})`, amount: vehicleCost });
      totalCost += vehicleCost;

      // Distance charge
      const distanceCost = distance <= 5
        ? BASE_FARE_DISTANCE
        : BASE_FARE_DISTANCE + Math.ceil(distance - 5) * EXTRA_KM_RATE;
      breakdown.push({ title: "Distance Charge", amount: distanceCost });
      totalCost += distanceCost;

      return res.json({ breakdown, totalCost });
    }

    // ── Individual (no vehicle): full breakdown ──────────────────────────────

    // Labour
    breakdown.push({ title: "Labour Cost", amount: LABOUR_COST });
    totalCost += LABOUR_COST;

    // Weight charge
    const weightCost = weight <= 5
      ? BASE_FARE_WEIGHT
      : BASE_FARE_WEIGHT + Math.ceil(weight - 5) * EXTRA_KG_RATE;
    breakdown.push({ title: "Weight Charge", amount: weightCost });
    totalCost += weightCost;

    // Distance charge
    const distanceCost = distance <= 5
      ? BASE_FARE_DISTANCE
      : BASE_FARE_DISTANCE + Math.ceil(distance - 5) * EXTRA_KM_RATE;
    breakdown.push({ title: "Distance Charge", amount: distanceCost });
    totalCost += distanceCost;

    // Floor charge
    if (floors > 0) {
      const floorCost = floors * FLOOR_RATE;
      breakdown.push({ title: "Floor Charge", amount: floorCost });
      totalCost += floorCost;
    }

    // Trip charge
    if (trips > 1) {
      const tripCost = (trips - 1) * TRIP_RATE;
      breakdown.push({ title: "Trip Charge", amount: tripCost });
      totalCost += tripCost;
    }

    // No-lift surcharge
    if (floors > 0 && !liftAvail) {
      breakdown.push({ title: "No Lift Surcharge", amount: NO_LIFT_SURCHARGE });
      totalCost += NO_LIFT_SURCHARGE;
    }

    return res.json({ breakdown, totalCost });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to calculate fare" });
  }
};
