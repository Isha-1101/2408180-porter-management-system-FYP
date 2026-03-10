import { useEffect, useRef, useState, useCallback } from "react";
import { createSSEConnection } from "../utils/sse";
import { useAuthStore } from "../store/auth.store";

/**
 * useSSENotifications
 * Connects to the backend SSE stream for the current user or porter.
 * Returns { notifications, unseenCount, markSeen }
 *
 * The backend should emit events like:
 *   - "booking-confirmed"  (for users)
 *   - "booking-cancelled"  (for both)
 *   - "new-booking-request" (for porters via SSE)
 *   - "booking-completed"   (for users)
 *
 * Falls back gracefully if the SSE endpoint is not available.
 */
export function useSSENotifications() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.access_token);
  const [notifications, setNotifications] = useState([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const connRef = useRef(null);

  const addNotification = useCallback((type, data) => {
    const notif = {
      id: Date.now() + Math.random(),
      type,
      data,
      timestamp: new Date(),
      seen: false,
    };
    setNotifications((prev) => [notif, ...prev].slice(0, 50));
    setUnseenCount((c) => c + 1);
  }, []);

  useEffect(() => {
    if (!user || !token) return;

    const isPorter = user.role === "porter";
    const endpoint = isPorter ? "/bookings/sse/porter" : "/bookings/sse/user";

    const handlers = {
      onOpen: () => console.log("[SSE] Connected:", endpoint),
      onError: () => {}, // suppress noisy errors on reconnect
    };

    // Events for users
    if (!isPorter) {
      handlers["booking-confirmed"] = (data) =>
        addNotification("booking-confirmed", data);
      handlers["booking-cancelled"] = (data) =>
        addNotification("booking-cancelled", data);
      handlers["booking-completed"] = (data) =>
        addNotification("booking-completed", data);
    }

    // Events for porters
    if (isPorter) {
      handlers["new-booking-request"] = (data) =>
        addNotification("new-booking-request", data);
      handlers["booking-cancelled"] = (data) =>
        addNotification("booking-cancelled", data);
    }

    // Generic fallback message
    handlers.message = (data) => {
      if (data?.type) addNotification(data.type, data);
    };

    connRef.current = createSSEConnection(endpoint, handlers, token);

    return () => {
      connRef.current?.close();
      connRef.current = null;
    };
  }, [user, token, addNotification]);

  const markSeen = useCallback(() => setUnseenCount(0), []);

  const clearNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notifications, unseenCount, markSeen, clearNotification };
}

export default useSSENotifications;
