import { query } from "express-validator";

export const fareCalculatorValidator = [
  query("no_of_floor").notEmpty().withMessage("No of floor is required"),
  query("has_lift").notEmpty().withMessage("Has lift is required"),
  query("no_of_trips").notEmpty().withMessage("No of trips is required"),
  query("weightKg").notEmpty().withMessage("Weight is required"),
  //   body("vehicleType").notEmpty().withMessage("Vehicle type is required"),
];
