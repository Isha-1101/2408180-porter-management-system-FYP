import sseService from "../utils/sse-service.js";

/**
 * Handle SSE connection for Users
 */
export const connectUserSSE = (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Set required headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // If using CORS, could specify origins here, but app-level cors middleware should handle it
  // res.setHeader("Access-Control-Allow-Origin", "*");

  // Flush headers immediately
  res.flushHeaders?.();

  // Register the connection with the SSE service
  sseService.addUserConnection(userId, res);

  // Keep connection open indefinitely
  req.on("close", () => {
    res.end();
  });
};

/**
 * Handle SSE connection for Porters
 */
export const connectPorterSSE = (req, res) => {
  // If authenticate middleware sets req.user.porterId when user is a porter
  const porterId = req.user.porterId;

  if (!porterId) {
    return res.status(403).json({ message: "Forbidden: Porter role required" });
  }

  // Set required headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders?.();

  // Register the connection with the SSE service
  sseService.addPorterConnection(porterId, res);

  req.on("close", () => {
    res.end();
  });
};
