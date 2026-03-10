import { io } from "socket.io-client";

/**
 * Shared Socket.IO client singleton.
 * Import this instead of calling io() in each component.
 */
const socket = io(import.meta.env.VITE_SOCKET_URL, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  autoConnect: true,
});

export default socket;
