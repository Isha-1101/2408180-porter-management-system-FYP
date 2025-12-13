import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import { swaggerSpec, swaggerUiMiddleware } from "./config/swaggerConfig.js";

// Routers
import authRouter from "./routes/authRoutes.js";
import porterRouter from "./routes/porterRoutes.js";
import locationRouter from "./routes/locationRoutes.js";

dotenv.config({
  path: new URL("./.env", import.meta.url),
});
connectDB();

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5000",
      process.env.API_URL,
      process.env.CLIENT_URL,
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/core-api/auth", authRouter);
app.use("/core-api/porter", porterRouter);
app.use("/core-api/location", locationRouter);

// Swagger
app.use(
  "/core-api/docs",
  swaggerUiMiddleware.serve,
  swaggerUiMiddleware.setup(swaggerSpec)
);

export default app;
