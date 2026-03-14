import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../../.env") });

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.DATABASE_URL;
    if (!mongoUri) {
      throw new Error("DATABASE_URL is not defined in .env file");
    }
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    const adminEmail = "admin@admin.com";
    const adminPhone = "admin";
    
    // Check if admin already exists by email or phone
    const adminExists = await User.findOne({ $or: [{ email: adminEmail }, { phone: adminPhone }] });
    
    const hashedPassword = await bcrypt.hash("admin", 10);

    if (adminExists) {
      console.log("Admin user already exists. Updating credentials...");
      adminExists.password = hashedPassword;
      adminExists.role = "admin";
      adminExists.phone = adminPhone;
      adminExists.name = "Admin";
      await adminExists.save();
      console.log("Admin user updated successfully.");
    } else {
      await User.create({
        name: "Admin",
        email: adminEmail,
        phone: adminPhone,
        password: hashedPassword,
        role: "admin",
        isActive: true,
      });
      console.log("Admin user created successfully with phone 'admin' and password 'admin'");
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
