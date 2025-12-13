import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all (adjust later if needed)
  },
});

// In-memory store for porter locations
let porterLocations = {};

// Socket handlers
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("porter-location", (data) => {
    const { porterId, lat, lng, teamId } = data;

    console.log("Received:", porterId, lat, lng, teamId);

    // if (!porterId) {
    //   console.log("❌ ERROR: PorterId missing");
    //   return;
    // }

    // Save location in memory
    porterLocations[porterId] = {
      lat,
      lng,
      teamId: teamId || null,
      timestamp: Date.now(),
    };

    // Send updated list to all users
    io.emit("all-porter-locations", porterLocations);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 porter_management_server running at ${PORT}`);
});
