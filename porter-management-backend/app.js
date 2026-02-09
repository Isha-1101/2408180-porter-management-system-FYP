import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Routers
import authRouter from "./src/routes/authRoutes.js";
import porterRouter from "./src/routes/porterRoutes.js";
import porterRegistrationRouter from "./src/routes/porterRegistration.routes.js";
import locationRouter from "./src/routes/locationRoutes.js";
import connectDB from "./src/config/db.js";
import { multerErrorHandler } from "./src/middlewares/multerErrorHandler.js";
import aiRouter from "./src/routes/aiRoutes.js";
import teamRouter from "./src/routes/team/teamRoutes.js";
import adminRouter from "./src/routes/admin/adminApproved.js";
import bookingRouter from "./src/routes/bookingRoutes.js";

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
  }),
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
app.use("/core-api/admin", adminRouter);
app.use("/core-api/bookings", bookingRouter);

app.get("/", (req, res) => {
  res.send("Porter Management Backend API (ISHA)");
})
export default app;
