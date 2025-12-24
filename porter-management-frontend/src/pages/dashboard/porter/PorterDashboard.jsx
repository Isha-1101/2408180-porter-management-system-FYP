// import React, { useEffect, useRef, useState } from "react";
// // import { io } from "socket.io-client";

// // const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
// // const socket = io(SOCKET_URL);

// export default function PorterDashboard() {
//   const intervalRef = useRef(null);
//   const [porterId, setPorterId] = useState("");

//   // useEffect(() => {
//   //   // Load porter ID from logged-in user
//   //   const user = JSON.parse(localStorage.getItem("user"));
//   //   if (user) setPorterId(user.id);

//   //   // Start auto-tracking
//   //   startAutoLocation();

//   //   return () => stopAutoLocation();
//   // }, []);

//   // const startAutoLocation = () => {
//   //   intervalRef.current = setInterval(() => {
//   //     if (navigator.geolocation) {
//   //       navigator.geolocation.getCurrentPosition(
//   //         (pos) => {
//   //           const lat = pos.coords.latitude;
//   //           const lng = pos.coords.longitude;

//   //           socket.emit("porter-location", {
//   //             porterId,
//   //             lat,
//   //             lng,
//   //           });
//   //         },
//   //         (err) => console.error("Error getting location:", err),
//   //         { enableHighAccuracy: true }
//   //       );
//   //     }
//   //   }, 10000); // every 10 seconds
//   // };

//   // const stopAutoLocation = () => {
//   //   if (intervalRef.current) clearInterval(intervalRef.current);
//   // };

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Porter Dashboard (Auto Tracking Enabled)</h2>
//       <p>Your location is shared automatically every 5 seconds.</p>
//     </div>
//   );
// }

//Added Code:

import React, { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";

// const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
// const socket = io(SOCKET_URL);

export default function PorterDashboard() {
  const intervalRef = useRef(null);
  const [porterId, setPorterId] = useState("");

  // useEffect(() => {
  //   // Load porter ID from logged-in user
  //   const user = JSON.parse(localStorage.getItem("user"));
  //   if (user) setPorterId(user.id);

  //   // Start auto-tracking
  //   startAutoLocation();

  //   return () => stopAutoLocation();
  // }, []);

  // const startAutoLocation = () => {
  //   intervalRef.current = setInterval(() => {
  //     if (navigator.geolocation) {
  //       navigator.geolocation.getCurrentPosition(
  //         (pos) => {
  //           const lat = pos.coords.latitude;
  //           const lng = pos.coords.longitude;

  //           socket.emit("porter-location", {
  //             porterId,
  //             lat,
  //             lng,
  //           });
  //         },
  //         (err) => console.error("Error getting location:", err),
  //         { enableHighAccuracy: true }
  //       );
  //     }
  //   }, 10000); // every 10 seconds
  // };

  // const stopAutoLocation = () => {
  //   if (intervalRef.current) clearInterval(intervalRef.current);
  // };

  return (
    <div style={{ padding: "24px", background: "#f6f7fb", minHeight: "100vh" }}>
      <h2 style={{ marginBottom: "6px" }}>Porter Dashboard</h2>
      <p style={{ color: "#666", marginBottom: "24px" }}>
        Your location is shared automatically while you are online.
      </p>

      {/* STATUS CARDS */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <StatusCard title="Status" value="Online" />
        <StatusCard title="Today's Jobs" value="3" />
        <StatusCard title="Earnings Today" value="Rs. 1,450" />
        <StatusCard title="Rating" value="4.8 ★" />
      </div>

      {/* CURRENT JOB */}
      <div style={cardStyle}>
        <h3 style={{ marginBottom: "12px" }}>Current Assignment</h3>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <p>
              <strong>Pickup:</strong> New Road, Kathmandu
            </p>
            <p>
              <strong>Drop:</strong> Kalimati
            </p>
            <p>
              <strong>Load Type:</strong> Household Items
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <p>
              <strong>Estimated Pay</strong>
            </p>
            <p style={{ fontSize: "20px", color: "#7c5cc4" }}>Rs. 520</p>
          </div>
        </div>

        <button style={primaryBtn}>Mark as Completed</button>
      </div>

      {/* LOCATION INFO */}
      <div style={{ ...cardStyle, marginTop: "24px" }}>
        <h3>Live Location</h3>
        <p style={{ color: "#666" }}>
          Your GPS location is being updated every few seconds and shared with
          the customer.
        </p>

        <div style={mapPlaceholder}>Live map will appear here</div>
      </div>
    </div>
  );
}

/* ---------- Small UI Components ---------- */

function StatusCard({ title, value }) {
  return (
    <div style={statusCard}>
      <p style={{ color: "#777", fontSize: "14px" }}>{title}</p>
      <h3 style={{ marginTop: "6px" }}>{value}</h3>
    </div>
  );
}

/* ---------- Styles ---------- */

const cardStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
};

const statusCard = {
  flex: 1,
  background: "#fff",
  padding: "16px",
  borderRadius: "12px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
};

const primaryBtn = {
  marginTop: "16px",
  padding: "10px 16px",
  background: "#7c5cc4",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const mapPlaceholder = {
  marginTop: "12px",
  height: "220px",
  borderRadius: "10px",
  background: "#eaeaea",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#888",
};
