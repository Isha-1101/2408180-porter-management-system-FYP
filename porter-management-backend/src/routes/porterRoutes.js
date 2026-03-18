import express from "express";
import {
  getAllPortersDetails,
  getPorterDetailsById,
  getPorterDetailsByUserId,
  togglePorterStatus,
} from "../controllers/porterController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/roleMiddleware.js";
import { createBookingAndNotifyPorters } from "../controllers/book-porter/porter-booking-controller.js";

const PorterRouter = express.Router();

//get all porters
PorterRouter.get("/", authenticate, getAllPortersDetails);

//get porter by user id
PorterRouter.get(
  "/by-user",
  authenticate,
  authorizeRole("porter"),
  getPorterDetailsByUserId,
);

//get porter by id
PorterRouter.get(
  "by-id/:id",
  authenticate,
  authorizeRole("porter"),
  getPorterDetailsById,
);

//porter bookings
PorterRouter.post(
  "/porter-booking",
  authenticate,
  authorizeRole("user"),
  createBookingAndNotifyPorters,
);

PorterRouter.put(
  "/status",
  authenticate,
  authorizeRole("porter"),
  togglePorterStatus,
);

export default PorterRouter;
