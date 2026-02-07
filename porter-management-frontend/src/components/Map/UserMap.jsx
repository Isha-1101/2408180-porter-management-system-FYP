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
import {
  MapPin,
  Navigation,
  Users,
  Loader2,
  Maximize2,
  Minimize2,
  Locate,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Recenter } from "../../utils/helper";

// Use environment variable or ensure correct URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
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


const UserMap = ({ className = "", showSidebar = true }) => {
  const [userPos, setUserPos] = useState([27.7172, 85.324]); // Default to Kathmandu
  const [porters, setPorters] = useState({}); // object from socket
  const [radiusKm, setRadiusKm] = useState(10); // Increased default radius
  const [selectedPorter, setSelectedPorter] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Location inputs
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");

  useEffect(() => {
    // Ask browser for user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          const newPos = [p.coords.latitude, p.coords.longitude];
          setUserPos(newPos);
          setLoadingLocation(false);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setLoadingLocation(false);
          // Keep default Kathmandu position
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setLoadingLocation(false);
    }

    // Socket connection events
    socket.on("connect", () => {
      setSocketConnected(true);
      // Request initial porter locations
      socket.emit("get-porter-locations");
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.on("all-porter-locations", (data) => {
      setPorters(data);
      console.log(data);
    });

    socket.on("porter-location-update", (data) => {
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

    // Sort by distance
    arr.sort((a, b) => a.distance - b.distance);

    // Filter by radius
    const filtered = arr.filter((p) => p.distance <= radiusKm);

    return filtered;
  }, [porters, userPos, radiusKm]);
  const handleClickPorter = async (porter) => {
    setSelectedPorter(porter);

    if (userPos) {
      try {
        const coords = await fetchRouteCoords(
          userPos[0],
          userPos[1],
          porter.lat,
          porter.lng,
        );
        setRouteCoords(coords);
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    }
  };

  const handleGetCurrentLocation = () => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          const newPos = [p.coords.latitude, p.coords.longitude];
          setUserPos(newPos);
          setFromLocation(`${newPos[0].toFixed(4)}, ${newPos[1].toFixed(4)}`);
          setLoadingLocation(false);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    }
  };

  return (
    <div
      className={`grid ${
        showSidebar && !isMapExpanded
          ? "grid-cols-1 lg:grid-cols-[280px_1fr]"
          : "grid-cols-1"
      } gap-4 h-full ${className}`}
    >
      {showSidebar && !isMapExpanded && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 bg-linear-to-r from-primary/5 to-blue-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-gray-900">Route Planning</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 rounded-full ${
                    socketConnected ? "bg-green-500" : "bg-red-500"
                  } animate-pulse`}
                ></div>
                <span className="text-xs text-gray-600">
                  {socketConnected ? "Live" : "Offline"}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-600">
              {nearby.length} porter{nearby.length !== 1 ? "s" : ""} within{" "}
              {radiusKm}km
            </p>
          </div>

          {/* Location Controls */}
          <div className="p-4 border-b border-gray-200 space-y-3">
            <div>
              <Label
                htmlFor="from-location"
                className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-primary" />
                From Location
              </Label>
              <div className="flex gap-2">
                <Input
                  id="from-location"
                  type="text"
                  placeholder="Enter pickup location"
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  className="flex-1"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleGetCurrentLocation}
                  title="Use current location"
                >
                  <Locate className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label
                htmlFor="to-location"
                className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2"
              >
                <Navigation className="w-4 h-4 text-primary" />
                To Location
              </Label>
              <Input
                id="to-location"
                type="text"
                placeholder="Enter destination"
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Radius Control */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Search Radius
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="50"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg min-w-[70px] justify-center">
                <span className="text-sm font-bold text-gray-900">
                  {radiusKm}
                </span>
                <span className="text-xs text-gray-500">km</span>
              </div>
            </div>
          </div>

          {/* Porter List */}
          <div className="flex-1 overflow-y-auto p-4">
            {loadingLocation ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                <p className="text-sm text-gray-600">
                  Getting your location...
                </p>
              </div>
            ) : nearby.length > 0 ? (
              <div className="space-y-2">
                {nearby.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleClickPorter(p)}
                    className={`w-full text-left rounded-xl border transition-all duration-200 p-3 ${
                      selectedPorter?.id === p.id
                        ? "border-primary bg-blue-50 shadow-sm"
                        : "border-gray-200 hover:border-primary/40 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-gray-900 text-sm">
                        {p.id}
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        <Navigation className="w-3 h-3" />
                        <span className="text-xs font-medium">
                          {p.distance.toFixed(1)}km
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">
                      Team: {p.teamId || "Unassigned"}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <MapPin className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  No porters nearby
                </p>
                <p className="text-xs text-gray-500">
                  {userPos
                    ? `Try increasing the search radius`
                    : "Waiting for location..."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="relative overflow-hidden border border-gray-200 shadow-sm h-full min-h-[400px]">
        {/* Map Expansion Toggle */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            size="icon"
            variant="secondary"
            onClick={() => setIsMapExpanded(!isMapExpanded)}
            className="shadow-lg bg-white hover:bg-gray-100"
            title={isMapExpanded ? "Show sidebar" : "Expand map"}
          >
            {isMapExpanded ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        </div>

        <MapContainer
          center={userPos}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
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
                  handleClickPorter(p);
                },
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <div className="font-bold text-gray-900 mb-1">{p.id}</div>
                  <div className="text-sm text-gray-600 mb-2">
                    Distance: {p.distance.toFixed(2)} km
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    Team: {p.teamId || "Unassigned"}
                  </div>
                  <button
                    onClick={() => handleClickPorter(p)}
                    className="w-full rounded-md lg bg-primary text-white px-3 py-2 text-sm font-medium hover:bg-primary/90 transition cursor-pointer"
                  >
                    Show Route
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
};

export default UserMap;
