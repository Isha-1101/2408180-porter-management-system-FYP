import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";
import Porter from "../models/Porters.js";
import LocationLog from "../models/LocationLogs.js";
import PorterBooking from "../models/PorterBooking.js";
import PorterRating from "../models/PortersReview.js";
import PorterTeam from "../models/PorterTeams.js";
import connectDB from "../config/db.js";

dotenv.config();
const destroyData = async () => {
  try {
    await User.deleteMany({});
    await Porter.deleteMany({});
    await LocationLog.deleteMany({});
    await PorterBooking.deleteMany({});
    await PorterRating.deleteMany({});
    await PorterTeam.deleteMany({});
    console.log("All collections cleared successfully.");
    process.exit();
  } catch (error) {
    console.error("Error clearing collections:", error);
    process.exit(1);
  }
};

const insertData = async () => {
  try {
    // -----------------------------------------------------------------
    // 1️⃣ Users
    // -----------------------------------------------------------------
    const users = await User.insertMany([
      {
        name: "John Doe",
        email: "john@example.com",
        password: "hashedpassword123",
        role: "user",
      },
      {
        name: "Porter Leader",
        email: "leader@example.com",
        password: "hashedpassword123",
        role: "user",
      },
      {
        name: "Individual Porter",
        email: "porter@example.com",
        password: "hashedpassword123",
        role: "user",
      },
      {
        name: "Isha Admin",
        email: "adminisha@example.com",
        password: "admin123",
        role: "admin",
      },
    ]);

    const user1 = users[0];
    const teamLeaderUser = users[1];
    const individualPorterUser = users[2];

    // -----------------------------------------------------------------
    // 2️⃣ Porter Team
    // -----------------------------------------------------------------
    const porterTeam = await PorterTeam.create({
      teamLeaderId: teamLeaderUser._id,
      teamName: "Mountain Movers",
      teamSize: 3,
      phone: "9800001111",
      isAvailable: true,
      latitude: 27.7172,
      longitude: 85.324,
    });

    // -----------------------------------------------------------------
    // 3️⃣ Porters (individual + team members)
    // -----------------------------------------------------------------
    const porters = await Porter.insertMany([
      {
        userId: individualPorterUser._id,
        teamId: null,
        fullName: "Hari Thapa",
        phone: "9801112222",
        address: "Kathmandu",
        porterType: "individual",
        experienceYears: 3,
        isAvailable: true,
        latitude: 27.7,
        longitude: 85.33,
      },
      {
        userId: teamLeaderUser._id,
        teamId: porterTeam._id,
        fullName: "Team Leader",
        phone: "9801234567",
        address: "Lalitpur",
        porterType: "team_member",
        experienceYears: 5,
        isAvailable: true,
        latitude: 27.695,
        longitude: 85.31,
      },
    ]);

    const individualPorter = porters[0];
    const teamMemberPorter = porters[1];

    // -----------------------------------------------------------------
    // 4️⃣ Booking (individual + team-based)
    // -----------------------------------------------------------------
    const bookings = await PorterBooking.insertMany([
      {
        userId: user1._id,
        porterId: individualPorter._id,
        teamId: null,
        numberOfPorters: 1,
        pickupLocation: "Thamel",
        dropLocation: "Boudha",
        pickupLat: 27.715,
        pickupLng: 85.313,
        status: "completed",
      },
      {
        userId: user1._id,
        porterId: null,
        teamId: porterTeam._id,
        numberOfPorters: 3,
        pickupLocation: "Patan",
        dropLocation: "Bhaktapur",
        pickupLat: 27.67,
        pickupLng: 85.32,
        status: "accepted",
      },
    ]);

    const bookingIndividual = bookings[0];
    const bookingTeam = bookings[1];

    // -----------------------------------------------------------------
    // 5️⃣ Ratings
    // -----------------------------------------------------------------
    await PorterRating.insertMany([
      {
        bookingId: bookingIndividual._id,
        userId: user1._id,
        porterId: individualPorter._id,
        rating: 5,
        comment: "Amazing service! Very reliable.",
      },
      {
        bookingId: bookingTeam._id,
        userId: user1._id,
        porterId: teamMemberPorter._id,
        rating: 4,
        comment: "Team was efficient and friendly.",
      },
    ]);

    // -----------------------------------------------------------------
    // 6️⃣ Location Logs
    // -----------------------------------------------------------------
    await LocationLog.insertMany([
      {
        porterId: individualPorter._id,
        teamId: null,
        latitude: 27.715,
        longitude: 85.324,
      },
      {
        porterId: teamMemberPorter._id,
        teamId: porterTeam._id,
        latitude: 27.71,
        longitude: 85.3,
      },
    ]);
    console.log("Sample data inserted successfully.");
    process.exit();
  } catch (error) {
    console.error("Error inserting data:", error);
    process.exit(1);
  }
};

// Run based on argument
const run = async () => {
  await connectDB();

  if (process.argv[2] === "seed") {
    await insertData();
  } else if (process.argv[2] === "destroy") {
    await destroyData();
  } else {
    console.log("Invalid command. Use: node seeder.js seed OR destroy");
    process.exit();
  }
};

run();
