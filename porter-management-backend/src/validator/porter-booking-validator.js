import { body } from "express-validator";

export const PorterSearchValidation = [
  body("pickup").notEmpty().withMessage("pickup is required"),
  body("dropoff").notEmpty().withMessage("dropoff is required"),
  body("weightKg")
    .if((value, { req }) => req.body.hasVehicle === false)
    .notEmpty()
    .withMessage("weightKg is required"),
  // body("weightKg").notEmpty().withMessage("weightKg is required"),

  body("hasVehicle")
    .notEmpty()
    .withMessage("hasVehicle is required")
    .isBoolean()
    .withMessage("hasVehicle must be boolean"),

  // If hasVehicle is false
  body("purpose")
    .if((value, { req }) => req.body.hasVehicle === false)
    .notEmpty()
    .withMessage("purpose is required"),

  body("trip")
    .if((value, { req }) => req.body.hasVehicle === false)
    .notEmpty()
    .withMessage("trip is required"),

  body("no_of_floors")
    .if((value, { req }) => {
      return (
        req.body.hasVehicle === false && req.body.purpose === "transportation"
      );
    })
    .notEmpty()
    .withMessage("no_of_floors is required"),

  body("has_lift")
    .if((value, { req }) => {
      return (
        req.body.hasVehicle === false && req.body.purpose === "transportation"
      );
    })
    .notEmpty()
    .withMessage("has_lift is required"),

  // If hasVehicle is true
  body("vehicleType")
    .if((value, { req }) => req.body.hasVehicle === true)
    .notEmpty()
    .withMessage("vehicleType is required"),
];
