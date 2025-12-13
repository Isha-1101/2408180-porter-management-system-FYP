import express from "express";
import {
  createPorter,
  getAllPortersDetails,
} from "../controllers/porterController.js";

const PorterRouter = express.Router();
PorterRouter.post("/", createPorter);
PorterRouter.get("/", getAllPortersDetails);

export default PorterRouter;
