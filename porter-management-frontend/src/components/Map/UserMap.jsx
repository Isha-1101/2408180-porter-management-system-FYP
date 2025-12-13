// import React, { useEffect, useMemo, useState } from "react";
// import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
// import L from "leaflet";
// import { io } from "socket.io-client";
// import { getDistanceKm } from "../../utils/haversine";
// import { fetchRouteCoords } from "../../utils/osrm";
// import RouteLayer from "./RouteLayer";

// const socket = io("http://localhost:5000");

// const userIcon = new L.Icon({
//   iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
// });
// const porterIcon = new L.Icon({
//   iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//   iconSize: [22, 36],
//   iconAnchor: [11, 36],
// });

// function Recenter({ pos }) {
//   const map = useMap();
//   useEffect(() => {
//     if (pos) map.setView(pos, 14);
//   }, [pos]);
//   return null;
// }

// export default function UserMap({ className = "", showSidebar = true }) {
//   const [userPos, setUserPos] = useState(null);
//   const [porters, setPorters] = useState({}); // object from socket
//   const [radiusKm, setRadiusKm] = useState(3);
//   const [selectedPorter, setSelectedPorter] = useState(null);
//   const [routeCoords, setRouteCoords] = useState([]);
//   console.log(routeCoords, userPos, "usermap");
//   useEffect(() => {
//     // Ask browser for user location
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (p) => {
//           setUserPos([p.coords.latitude, p.coords.longitude]);
//         },
//         (err) => console.error(err),
//         { enableHighAccuracy: true }
//       );
//     }
//     socket.on("all-porter-locations", (data) => {
//       console.log(data,"emited-porter-data")
//       setPorters(data);
//     });
//     return () => socket.off("all-porter-locations");
//   }, []);

//   const nearby = useMemo(() => {
//     if (!userPos) return [];
//     const arr = Object.keys(porters).map((id) => {
//       const { lat, lng, teamId, timestamp } = porters[id];
//       const distance = getDistanceKm(userPos[0], userPos[1], lat, lng);
//       console.log(distance, "distance");
//       return { id, lat, lng, teamId, timestamp, distance };
//     });
//     arr.sort((a, b) => a.distance - b.distance);
//     return arr.filter((p) => p.distance <= radiusKm);
//   }, [porters, userPos, radiusKm]);
//   console.log(porters, "porters");
//   console.log(userPos, "userPos");
//   console.log(nearby, "nearBy proter");

//   const handleClickPorter = async (porter) => {
//     console.log(porter, "porter");
//     setSelectedPorter(porter);
//     const coords = await fetchRouteCoords(
//       userPos[0],
//       userPos[1],
//       porter.lat,
//       porter.lng
//     );
//     setRouteCoords(coords);
//   };

//   return (
//     <div
//       className={`grid ${
//         showSidebar ? "grid-cols-1 lg:grid-cols-[320px_1fr]" : "grid-cols-1"
//       } gap-3 h-full ${className}`}
//     >
//       {showSidebar && (
//         <div className="bg-white/80 rounded-xl border border-gray-100 p-3 overflow-auto">
//           <div className="font-semibold text-gray-900">Nearby Porters</div>
//           <div className="mt-3">
//             <label className="text-sm text-gray-600">Radius (km)</label>
//             <input
//               type="number"
//               value={radiusKm}
//               onChange={(e) => setRadiusKm(Number(e.target.value))}
//               className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//             />
//           </div>

//           <div className="mt-4 space-y-2">
//             {nearby?.map((p) => (
//               <button
//                 key={p.id}
//                 onClick={() => handleClickPorter(p)}
//                 className="w-full text-left rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-gray-50 transition px-3 py-2 cursor-pointer"
//               >
//                 <div className="font-medium text-gray-900">{p.id}</div>
//                 <div className="text-xs text-gray-600">
//                   {p.distance.toFixed(2)} km away
//                   thisfoisdfsldjflskdjflsdkfsdlflsdflsdjflsldf
//                 </div>
//               </button>
//             ))}
//             {userPos && nearby.length === 0 && (
//               <div className="text-sm text-gray-600">
//                 No porters found within {radiusKm} km.
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       <div className="rounded-xl overflow-hidden border border-gray-100 h-full min-h-[260px]">
//         <MapContainer
//           center={userPos || [27.7, 85.3]}
//           zoom={13}
//           style={{ height: "100%", width: "100%" }}
//         >
//           <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//           {userPos && (
//             <Marker position={userPos} icon={userIcon}>
//               <Popup>You are here</Popup>
//             </Marker>
//           )}
//           {nearby.map((p) => (
//             <Marker
//               key={p.id}
//               position={[p.lat, p.lng]}
//               icon={porterIcon}
//               eventHandlers={{ click: () => handleClickPorter(p) }}
//             >
//               <Popup>
//                 <div>
//                   <div>Porter: {p.id}</div>
//                   <div>Distance: {p.distance.toFixed(2)} km</div>
//                   <button
//                     onClick={() => handleClickPorter(p)}
//                     className="mt-2 rounded-md bg-primary text-white px-3 py-1.5 text-sm cursor-pointer"
//                   >
//                     Show Route
//                   </button>
//                 </div>
//               </Popup>
//             </Marker>
//           ))}
//           <RouteLayer positions={routeCoords} />
//           <Recenter
//             pos={
//               selectedPorter
//                 ? [selectedPorter.lat, selectedPorter.lng]
//                 : userPos
//             }
//           />
//         </MapContainer>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { io } from "socket.io-client";
import { getDistanceKm } from "../../utils/haversine";
import { fetchRouteCoords } from "../../utils/osrm";
import RouteLayer from "./RouteLayer";

// Use environment variable or ensure correct URL
const SOCKET_URL = "http://localhost:5000";
const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Fix for Leaflet icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "leaflet/dist/images/marker-icon-2x.png",
  iconUrl: "leaflet/dist/images/marker-icon.png",
  shadowUrl: "leaflet/dist/images/marker-shadow.png",
});

const userIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const porterIcon = new L.Icon({
  iconUrl:
    "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function Recenter({ pos }) {
  const map = useMap();
  useEffect(() => {
    if (pos) map.setView(pos, 14);
  }, [pos]);
  return null;
}

export default function UserMap({ className = "", showSidebar = true }) {
  const [userPos, setUserPos] = useState([27.7172, 85.324]); // Default to Kathmandu
  const [porters, setPorters] = useState({}); // object from socket
  const [radiusKm, setRadiusKm] = useState(10); // Increased default radius
  const [selectedPorter, setSelectedPorter] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    console.log("Socket connecting to:", SOCKET_URL);

    // Ask browser for user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          const newPos = [p.coords.latitude, p.coords.longitude];
          setUserPos(newPos);
          console.log("User position:", newPos);
        },
        (err) => {
          console.error("Geolocation error:", err);
          // Keep default Kathmandu position
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }

    // Socket connection events
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setSocketConnected(true);

      // Request initial porter locations
      socket.emit("get-porter-locations");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setSocketConnected(false);
    });

    socket.on("all-porter-locations", (data) => {
      console.log(
        "Received porter locations:",
        Object.keys(data).length,
        "porters"
      );
      console.log("Porter data sample:", data);
      setPorters(data);
    });

    socket.on("porter-location-update", (data) => {
      console.log("Single porter update:", data);
      setPorters((prev) => ({
        ...prev,
        [data.porterId]: {
          lat: data.lat,
          lng: data.lng,
          teamId: data.teamId,
          timestamp: Date.now(),
        },
      }));
    });

    // Cleanup
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("all-porter-locations");
      socket.off("porter-location-update");
    };
  }, []);

  const nearby = useMemo(() => {
    if (!userPos) return [];

    const arr = Object.entries(porters).map(([id, porter]) => {
      const { lat, lng, teamId, timestamp } = porter;
      const distance = getDistanceKm(userPos[0], userPos[1], lat, lng);
      return {
        id,
        lat,
        lng,
        teamId,
        timestamp,
        distance,
      };
    });

    console.log(
      "All porters distances:",
      arr.map((p) => ({ id: p.id, distance: p.distance }))
    );

    // Sort by distance
    arr.sort((a, b) => a.distance - b.distance);

    // Filter by radius
    const filtered = arr.filter((p) => p.distance <= radiusKm);
    console.log(`Nearby porters within ${radiusKm}km:`, filtered.length);

    return filtered;
  }, [porters, userPos, radiusKm]);

  const handleClickPorter = async (porter) => {
    console.log("Selected porter:", porter);
    setSelectedPorter(porter);

    if (userPos) {
      try {
        const coords = await fetchRouteCoords(
          userPos[0],
          userPos[1],
          porter.lat,
          porter.lng
        );
        console.log("Route coordinates:", coords);
        setRouteCoords(coords);
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    }
  };

  // Simulate test porters for debugging
  const addTestPorters = () => {
    const testPorters = {
      "porter-1": {
        lat: 27.72,
        lng: 85.33,
        teamId: "team-1",
        timestamp: Date.now(),
      },
      "porter-2": {
        lat: 27.715,
        lng: 85.32,
        teamId: "team-1",
        timestamp: Date.now(),
      },
      "porter-3": {
        lat: 27.71,
        lng: 85.315,
        teamId: "team-2",
        timestamp: Date.now(),
      },
    };
    setPorters(testPorters);
  };

  return (
    <div
      className={`grid ${
        showSidebar ? "grid-cols-1 lg:grid-cols-[320px_1fr]" : "grid-cols-1"
      } gap-3 h-full ${className}`}
    >
      {showSidebar && (
        <div className="bg-white/80 rounded-xl border border-gray-100 p-3 overflow-auto">
          <div className="flex justify-between items-center mb-3">
            <div className="font-semibold text-gray-900">Nearby Porters</div>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  socketConnected ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-xs text-gray-500">
                {socketConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>

          <div className="mb-3">
            <button
              onClick={addTestPorters}
              className="w-full bg-blue-100 text-blue-700 rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-200 transition"
            >
              Add Test Porters
            </button>
          </div>

          <div className="mt-3">
            <label className="text-sm text-gray-600">Search Radius (km)</label>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="range"
                min="1"
                max="50"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-700">
                {radiusKm}km
              </span>
            </div>
            <input
              type="number"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Math.max(1, Number(e.target.value)))}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="mt-4 space-y-2">
            <div className="text-sm text-gray-500">
              Found {nearby.length} porters within {radiusKm}km
            </div>

            {nearby.length > 0 ? (
              nearby.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleClickPorter(p)}
                  className={`w-full text-left rounded-xl border transition px-3 py-2 cursor-pointer ${
                    selectedPorter?.id === p.id
                      ? "border-primary bg-blue-50"
                      : "border-gray-100 hover:border-primary/30 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-gray-900">{p.id}</div>
                    <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                      {p.distance.toFixed(1)} km
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Team: {p.teamId || "Unassigned"}
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-4">
                <div className="text-gray-400 mb-2">No porters found</div>
                <div className="text-sm text-gray-500">
                  {userPos
                    ? `No porters within ${radiusKm}km of your location.`
                    : "Waiting for your location..."}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              Debug Info:
              <div>
                User Pos:{" "}
                {userPos
                  ? `${userPos[0].toFixed(4)}, ${userPos[1].toFixed(4)}`
                  : "Unknown"}
              </div>
              <div>Total Porters: {Object.keys(porters).length}</div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl overflow-hidden border border-gray-100 h-full min-h-[400px]">
        <MapContainer
          center={userPos}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          whenCreated={(map) => {
            console.log("Map created");
            map.on("click", (e) => {
              console.log("Map clicked at:", e.latlng);
            });
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {userPos && (
            <Marker position={userPos} icon={userIcon}>
              <Popup>
                <div className="font-medium">Your Location</div>
                <div className="text-sm text-gray-600">
                  Lat: {userPos[0].toFixed(4)}
                  <br />
                  Lng: {userPos[1].toFixed(4)}
                </div>
              </Popup>
            </Marker>
          )}

          {nearby.map((p) => (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={porterIcon}
              eventHandlers={{
                click: () => {
                  console.log("Porter marker clicked:", p.id);
                  handleClickPorter(p);
                },
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <div className="font-bold text-gray-900">{p.id}</div>
                  <div className="text-sm text-gray-600 mb-2">
                    Distance: {p.distance.toFixed(2)} km
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    Last updated: {new Date(p.timestamp).toLocaleTimeString()}
                  </div>
                  <button
                    onClick={() => handleClickPorter(p)}
                    className="w-full rounded-md bg-primary text-white px-3 py-2 text-sm font-medium hover:bg-primary/90 transition cursor-pointer"
                  >
                    Show Route to Porter
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          <RouteLayer positions={routeCoords} />
          <Recenter
            pos={
              selectedPorter
                ? [selectedPorter.lat, selectedPorter.lng]
                : userPos
            }
          />
        </MapContainer>
      </div>
    </div>
  );
}
