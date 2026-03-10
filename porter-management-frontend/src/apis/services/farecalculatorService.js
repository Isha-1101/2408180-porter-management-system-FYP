import axiosInstance from "../axiosInstance";

export const calculateFare = (fareCalculatorData) => {
  return axiosInstance.get("/fare-calculator", {
    params: {
      no_of_floor: fareCalculatorData.no_of_floor,
      has_lift: fareCalculatorData.has_lift,
      no_of_trips: fareCalculatorData.no_of_trips,
      weightKg: fareCalculatorData.weightKg,
      has_vehicle:
        fareCalculatorData.has_vehicle || fareCalculatorData.hasVehicle,
    },
  });
};
