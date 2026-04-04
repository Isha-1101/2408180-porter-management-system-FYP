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
import adminRouter from "./src/routes/admin/adminRoutes.js";
import bookingRouter from "./src/routes/bookingRoutes.js";
import FareCalculatorRouter from "./src/routes/fare-calculator/farecalculator.routes.js";
import sseRouter from "./src/routes/sseRoutes.js";
import ratingRouter from "./src/routes/rating.routes.js";
import chatRouter from "./src/routes/chatRoutes.js";
import paymentRouter from "./src/routes/paymentRoutes.js";
import cancellationRouter from "./src/routes/cancellationRoutes.js";
import helmet from "helmet";
import morgan from "morgan";
dotenv.config({
  path: new URL("./.env", import.meta.url),
});

connectDB();
const app = express();

// Middleware
app.use(helmet
  ());
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
app.use(morgan("dev"))
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
app.use("/core-api/bookings/sse", sseRouter);
app.use("/core-api/fare-calculator", FareCalculatorRouter);
app.use("/core-api/ratings", ratingRouter);
app.use("/core-api/chat", chatRouter);
app.use("/core-api/payments", paymentRouter);
app.use("/core-api/cancellations", cancellationRouter);

app.get("/", (req, res) => {
  res.send("Porter Management Backend API (ISHA)");
});
export default app;
