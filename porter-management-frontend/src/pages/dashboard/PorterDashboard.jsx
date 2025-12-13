import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function PorterDashboard() {
  const intervalRef = useRef(null);
  const [porterId, setPorterId] = useState("");

  useEffect(() => {
    // Load porter ID from logged-in user
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) setPorterId(user.id);

    // Start auto-tracking
    startAutoLocation();

    return () => stopAutoLocation();
  }, []);

  const startAutoLocation = () => {
    intervalRef.current = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            socket.emit("porter-location", {
              porterId,
              lat,
              lng,
            });
          },
          (err) => console.error("Error getting location:", err),
          { enableHighAccuracy: true }
        );
      }
    }, 5000); // every 5 seconds
  };

  const stopAutoLocation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Porter Dashboard (Auto Tracking Enabled)</h2>
      <p>Your location is shared automatically every 5 seconds.</p>
    </div>
  );
}
