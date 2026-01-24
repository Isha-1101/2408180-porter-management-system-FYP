import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {
  swaggerSpec,
  swaggerUiMiddleware,
} from "./src/config/swaggerConfig.js";
// Routers
import authRouter from "./src/routes/authRoutes.js";
import porterRouter from "./src/routes/porterRoutes.js";
import porterRegistrationRouter from "./src/routes/porterRegistration.routes.js";
import locationRouter from "./src/routes/locationRoutes.js";
import connectDB from "./src/config/db.js";
import { multerErrorHandler } from "./src/middlewares/multerErrorHandler.js";
import aiRouter from "./src/routes/aiRoutes.js";
import teamRouter from "./src/routes/team/teamRoutes.js";

dotenv.config({
  path: new URL("./.env", import.meta.url),
});

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
app.use(multerErrorHandler);

// API Routes
app.use("/core-api/auth", authRouter);
app.use("/core-api/porters", porterRouter);
app.use("/core-api/porter-registration", porterRegistrationRouter);
app.use("/core-api/location", locationRouter);
app.use("/core-api/ask-questions", aiRouter);
app.use("/core-api/team-porters", teamRouter);

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
