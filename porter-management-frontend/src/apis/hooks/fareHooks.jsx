import { calculateFare } from "../services/farecalculatorService.js";
import { useQuery } from "@tanstack/react-query";

export const useFareCalculator = (fareCalculatorData, options = {}) => {
  return useQuery({
    queryKey: ["fare-calculator", fareCalculatorData],
    queryFn: async () => {
      const response = await calculateFare(fareCalculatorData);
      return response.data; // return response data directly
    },
    ...options,
  });
};
