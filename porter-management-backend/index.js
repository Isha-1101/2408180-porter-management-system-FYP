import express from "express";
import dotenv from "dotenv";
import cors from "cors";
//config
import connectDB from "./config/db.js";
import { swaggerSpec, swaggerUiMiddleware } from "./config/swaggerConfig.js";
//router imports
import authRouter from "./routes/authRoutes.js";

dotenv.config();
const app = express(); // creation of the server
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
connectDB();

//apis routes
app.use("/core-api/auth", authRouter);

//swagger routes
app.use(
  "/core-api/docs",
  swaggerUiMiddleware.serve,
  swaggerUiMiddleware.setup(swaggerSpec)
);

//default route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Porter_management_server is running",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`porter_management_server is running at ${PORT}`);
});
