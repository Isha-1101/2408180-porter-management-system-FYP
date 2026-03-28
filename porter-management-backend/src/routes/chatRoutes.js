import express from "express";
import { getChatHistory } from "../controllers/chatController.js";

const router = express.Router();

router.get("/:bookingId", getChatHistory);

export default router;
