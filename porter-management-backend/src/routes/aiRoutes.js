import express from "express";
const aiRouter = express.Router();
import { authenticate } from "../middlewares/authMiddleware.js";
import { porterChat } from "../controllers/Ai/porterChat.js";
aiRouter.post("/porter-management/chat", authenticate, porterChat);

export default aiRouter;
