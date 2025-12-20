import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import { swaggerSpec, swaggerUiMiddleware } from "./config/swaggerConfig.js";
// Routers
import authRouter from "./src/routes/authRoutes.js";
import porterRouter from "./src/routes/porterRoutes.js";
import locationRouter from "./src/routes/locationRoutes.js";

dotenv.config({
  path: new URL("./.env", import.meta.url),
});

console.log("Environment:", process.env.NODE_ENV || "development");
connectDB();

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      process.env.API_URL,
      process.env.CLIENT_URL_DEV,
      process.env.CLIENT_URL_PROD,
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/core-api/auth", authRouter);
app.use("/core-api/porters", porterRouter);
app.use("/core-api/location", locationRouter);

app.get("/", (req, res) => {
  res.send(`
      <div
  style="
  padding:0;
  margin:0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background-color: #1E548E;
    color: white;
    font-family: Arial, sans-serif;
  "
>
  <h1 style="font-size: 3rem; margin-bottom: 0.5rem;">
    Porter Management System
  </h1>

  <p style="font-size: 1.2rem; opacity: 0.8;">
    This is porter management backend
  </p>

  <a href="/core-api/docs" style="margin-top: 1rem; padding: 0.5rem 1rem; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;" href="/core-api/docs">Swagger</a>
</div>
    `);
});
// Swagger
app.use(
  "/core-api/docs",
  swaggerUiMiddleware.serve,
  swaggerUiMiddleware.setup(swaggerSpec)
);

export default app;
