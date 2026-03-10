/**
 * Server-Sent Events (SSE) utility
 * Manages persistent SSE connections to the backend for real-time push notifications.
 * Unlike Socket.IO sockets, SSE is one-directional: server → client.
 */

const BASE_URL = import.meta.env.API_URL || "http://localhost:5000/core-api";

/**
 * Creates and manages an SSE connection.
 *
 * @param {string} endpoint - The SSE endpoint path (e.g. '/bookings/sse/user')
 * @param {object} handlers - { [eventName]: callbackFn } plus optional onError/onOpen
 * @param {string} token - Bearer token for auth (appended as query param)
 * @returns {{ close: () => void }} cleanup handle
 */
export function createSSEConnection(endpoint, handlers = {}, token = "") {
  const url = new URL(`${BASE_URL}${endpoint}`);
  if (token) url.searchParams.set("token", token);

  const es = new EventSource(url.toString(), { withCredentials: false });

  // Named events
  Object.entries(handlers).forEach(([event, cb]) => {
    if (event === "onError" || event === "onOpen" || event === "message")
      return;
    es.addEventListener(event, (e) => {
      try {
        const data = JSON.parse(e.data);
        cb(data);
      } catch {
        cb(e.data);
      }
    });
  });

  // Generic message fallback
  if (handlers.message) {
    es.onmessage = (e) => {
      try {
        handlers.message(JSON.parse(e.data));
      } catch {
        handlers.message(e.data);
      }
    };
  }

  es.onerror = (err) => {
    if (handlers.onError) handlers.onError(err);
  };

  es.onopen = () => {
    if (handlers.onOpen) handlers.onOpen();
  };

  return {
    close: () => es.close(),
    readyState: () => es.readyState,
  };
}

export default createSSEConnection;
