export const fareCalculator = async (req, res) => {
  try {
    const { no_of_floor, has_lift, no_of_trips, weightKg, vehicleType } =
      req.query;
    let breakdown = [];
    let totalCost = 0;

    // Labour cost
    const labourCost = 100;
    breakdown.push({
      title: "Labour Cost",
      amount: labourCost,
    });
    totalCost += labourCost;

    // Floor charge
    const floorCost = no_of_floor * 5;
    breakdown.push({
      title: "Floor Charge",
      amount: floorCost,
    });
    totalCost += floorCost;

    // Trip charge
    const tripCost = no_of_trips * 5;
    breakdown.push({
      title: "Trip Charge",
      amount: tripCost,
    });
    totalCost += tripCost;

    // Weight charge
    let weightCost = 20; // base cost for 5kg

    if (weightKg > 5) {
      const extraWeight = weightKg - 5;
      weightCost += extraWeight * 2;
    }

    breakdown.push({
      title: "Weight Charge",
      amount: weightCost,
    });

    totalCost += weightCost;

    // lift charge
    const liftCost = !has_lift || has_lift === "false" ? 50 : 0;
    breakdown.push({
      title: "Lift Charge",
      amount: liftCost,
    });
    totalCost += liftCost;

    const vehiclePrices = {
      bike: 50,
      car: 100,
      mini_truck: 200,
      truck: 350,
    };

    if (vehicleType && vehiclePrices[vehicleType]) {
      const vehicleCost = vehiclePrices[vehicleType];

      breakdown.push({
        title: "Vehicle Charge",
        amount: vehicleCost,
      });

      totalCost += vehicleCost;
    }

    return res.json({
      breakdown,
      totalCost,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to calculate fare",
    });
  }
};
