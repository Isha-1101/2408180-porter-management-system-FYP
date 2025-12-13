import express from "express";
import { logLocation } from "../controllers/LocationController.js";
const locationRouter = express.Router();
locationRouter.post("/log", logLocation);
export default locationRouter;
