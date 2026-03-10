import express from "express";
import { authenticate } from "../../middlewares/authMiddleware.js";
import { authorizeRole } from "../../middlewares/roleMiddleware.js";
import { fareCalculator } from "../../controllers/calcuate-fare/calculatefare.controller.js";
import { fareCalculatorValidator } from "../../validator/fare-calculator-validator.js";
import { validate } from "../../middlewares/validate.js";

const FareCalculatorRouter = express.Router();

FareCalculatorRouter.get(
  "/",
  authenticate,
  authorizeRole("user"),
  fareCalculatorValidator,
  validate,
  fareCalculator,
);

export default FareCalculatorRouter;
