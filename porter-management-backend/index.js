import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import app from "./app.js";
import Porters from "./src/models/porter/Porters.js";
import LocationLog from "./src/models/LocationLogs.js";
import Message from "./src/models/Message.js";
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
    const { porterId, lat, lng } = data;
    // console.log("Received location:", { porterId, lat, lng });

    try {
      // Get porter details to find teamId
      const porter = await Porters.findById(porterId);

      if (!porter) {
        console.error("❌ Porter not found:", porterId);
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

  // --- Real-Time Chat for Bookings ---

  // Client joins a specific chat room defined by the booking ID
  socket.on("join-chat", (bookingId) => {
    const roomName = `chat_${bookingId}`;
    socket.join(roomName);
    console.log(`Socket ${socket.id} joined room ${roomName}`);
  });

  // Client sends a message to the room
  socket.on("send-message", async (data) => {
    const { bookingId, senderId, senderModel, text } = data;

    try {
      // Create and save message to the database
      const newMessage = await Message.create({
        bookingId,
        senderId,
        senderModel,
        text,
      });

      const roomName = `chat_${bookingId}`;

      // Broadcast the message to all clients in the room
      io.to(roomName).emit("receive-message", newMessage);
      console.log(
        `Message sent to room ${roomName} from ${senderModel} ${senderId}`,
      );
    } catch (error) {
      console.error("Error saving/sending message:", error);
      // Optional: Emit an error back to the sender
      socket.emit("message-error", { error: "Failed to send message" });
    }
  });

  // Typing indicator
  socket.on("typing-start", (data) => {
    const { bookingId, userId, userName } = data;
    const roomName = `chat_${bookingId}`;
    
    // Broadcast to all others in the room (not sender)
    socket.to(roomName).emit("user-typing", {
      userId,
      userName,
      isTyping: true,
    });
    console.log(`${userName} is typing in ${roomName}`);
  });

  socket.on("typing-stop", (data) => {
    const { bookingId, userId, userName } = data;
    const roomName = `chat_${bookingId}`;
    
    socket.to(roomName).emit("user-typing", {
      userId,
      userName,
      isTyping: false,
    });
  });

  // Message read receipt
  socket.on("message-read", (data) => {
    const { messageId, bookingId, readerId, readerName } = data;
    const roomName = `chat_${bookingId}`;
    
    // Broadcast read receipt to all in room
    io.to(roomName).emit("message-read-receipt", {
      messageId,
      readBy: {
        id: readerId,
        name: readerName,
      },
      readAt: new Date(),
    });
    console.log(`Message ${messageId} read by ${readerName}`);
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
