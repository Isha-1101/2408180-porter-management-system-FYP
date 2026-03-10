import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import app from "./app.js";
import Porters from "./src/models/porter/Porters.js";
import LocationLog from "./src/models/LocationLogs.js";
import { setIO } from "./src/utils/socketInstance.js";
dotenv.config({
  path: new URL("./.env", import.meta.url),
});

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL_DEV, process.env.CLIENT_URL_PROD],
    credentials: true,
  },
});

// Make io accessible to controllers via singleton
setIO(io);

// In-memory store for porter locations
let porterLocations = {};

// Socket handlers
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Porter joins their own room so we can send targeted booking-request events
  socket.on("join-porter-room", (porterId) => {
    socket.join(`porter:${porterId}`);
    console.log(`Porter ${porterId} joined room porter:${porterId}`);
  });

  socket.on("porter-location", async (data) => {
    const { lat, lng, porterId } = data;
    console.log("Received location:", { porterId, lat, lng });

    try {
      // Get porter details to find teamId
      const porter = await Porters.findById(porterId);

      if (!porter) {
        return;
      }

      // Update porter location in Porters collection
      await Porters.findByIdAndUpdate(
        porterId,
        {
          location: {
            type: "Point",
            coordinates: [lng, lat],
          },
          lastLocationUpdatedAt: new Date(),
        },
        { new: true },
      );

      // Save location log to LocationLogs collection
      await LocationLog.create({
        porterId,
        teamId: porter.teamId || null,
        latitude: lat,
        longitude: lng,
        timestamp: new Date(),
      });

      // Update in-memory store
      porterLocations[porterId] = {
        porterId,
        lat,
        lng,
        teamId: porter.teamId || null,
        updatedAt: new Date(),
      };

      // Broadcast full snapshot to all connected clients
      io.emit("all-porter-locations", porterLocations);
      // Also emit a targeted incremental update so clients can merge efficiently
      io.emit("porter-location-update", {
        porterId,
        lat,
        lng,
        teamId: porter.teamId || null,
        updatedAt: new Date(),
      });
      console.log("✅ Location saved and broadcasted");
    } catch (error) {
      console.error("Error saving location:", error);
    }
  });

  socket.on("get-porter-locations", () => {
    socket.emit("all-porter-locations", porterLocations);
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
