import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
dotenv.config();

//router imports
import authRouter from "./routes/authRoutes.js";

const app = express(); // creation of the server
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

//routes

app.use("/core-api/auth", authRouter);

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
