import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getDistanceKm } from "../../utils/haversine";
import { fetchRouteCoords } from "../../utils/osrm";
import RouteLayer from "./RouteLayer";
import { Recenter } from "./Recenter";
import { MapPin, Navigation, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "../ui/button";
import socket from "../../utils/socket";

// Fix Leaflet default icon paths (Vite breaks these)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Colored SVG-pin icons
const makeColorIcon = (color) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

const PICKUP_ICON = makeColorIcon("green");
const DROPOFF_ICON = makeColorIcon("red");
const PORTER_ICON = makeColorIcon("orange");
const LIVE_PORTER_ICON = makeColorIcon("violet");

function MapEvents({ onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) onMapClick(e.latlng);
    },
  });
  return null;
}

const UserMap = ({
  className = "",
  showSidebar = true,
  onMapClick,
  pickupLocation,
  dropoffLocation,
  porterLocationOverride, // { lat, lng } — live porter position from parent
}) => {
  const [userPos, setUserPos] = useState([27.7172, 85.324]); // Default: Kathmandu
  const [porters, setPorters] = useState({});
  const [radiusKm, setRadiusKm] = useState(10);
  const [selectedPorterId, setSelectedPorterId] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [socketConnected, setSocketConnected] = useState(socket.connected);
  // Ref to track if route fetch is in-flight so we don't spam OSRM on every porters update
  const routeFetchRef = useRef(false);

  // ── Geolocation ──
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (p) => setUserPos([p.coords.latitude, p.coords.longitude]),
      (err) => console.error("Geolocation error:", err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // ── Socket listeners ──
  useEffect(() => {
    const onConnect = () => {
      setSocketConnected(true);
      // Bug #1 fix: was "connection" — must be "connect"
      // Bug #2 fix: request initial snapshot on (re)connect
      socket.emit("get-porter-locations");
    };

    const onDisconnect = () => setSocketConnected(false);

    // Full snapshot: replace entire porters map
    const onAllPorterLocations = (data) => {
      setPorters(data);
    };

    // Bug #3 fix: backend now emits "porter-location-update" — do an incremental merge
    const onPorterLocationUpdate = (data) => {
      setPorters((prev) => ({
        ...prev,
        [data.porterId]: {
          lat: data.lat,
          lng: data.lng,
          teamId: data.teamId || null,
          updatedAt: data.updatedAt,
        },
      }));
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("all-porter-locations", onAllPorterLocations);
    socket.on("porter-location-update", onPorterLocationUpdate);

    // If socket is already connected when this component mounts, request immediately
    if (socket.connected) {
      socket.emit("get-porter-locations");
      setSocketConnected(true);
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("all-porter-locations", onAllPorterLocations);
      socket.off("porter-location-update", onPorterLocationUpdate);
    };
  }, []);

  // ── Nearby porters (derived from socket data + user position + radius) ──
  const nearby = useMemo(() => {
    if (!userPos) return [];
    const arr = Object.entries(porters).map(([id, porter]) => ({
      id,
      lat: porter.lat,
      lng: porter.lng,
      teamId: porter.teamId,
      updatedAt: porter.updatedAt,
      distance: getDistanceKm(userPos[0], userPos[1], porter.lat, porter.lng),
    }));
    arr.sort((a, b) => a.distance - b.distance);
    return arr.filter((p) => p.distance <= radiusKm);
  }, [porters, userPos, radiusKm]);

  // ── Route: re-fetch whenever the selected porter moves or user moves ──
  useEffect(() => {
    if (!selectedPorterId || !userPos) return;
    const porter = porters[selectedPorterId];
    if (!porter) return;

    const updateRoute = async () => {
      if (routeFetchRef.current) return;
      routeFetchRef.current = true;
      try {
        const coords = await fetchRouteCoords(
          userPos[0],
          userPos[1],
          porter.lat,
          porter.lng,
        );
        setRouteCoords(coords);
      } catch (err) {
        console.error("Route fetch error:", err);
      } finally {
        routeFetchRef.current = false;
      }
    };

    updateRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedPorterId,
    userPos,
    porters[selectedPorterId]?.lat,
    porters[selectedPorterId]?.lng,
  ]);

  // ── Static route: pickup → dropoff (used in AcceptedBookingDetails / porter view) ──
  useEffect(() => {
    if (selectedPorterId) return; // porter route takes priority
    const hasPickup = pickupLocation?.lat && pickupLocation?.lng;
    const hasDrop = dropoffLocation?.lat && dropoffLocation?.lng;
    if (!hasPickup || !hasDrop) return;

    const fetchStaticRoute = async () => {
      if (routeFetchRef.current) return;
      routeFetchRef.current = true;
      try {
        const coords = await fetchRouteCoords(
          pickupLocation.lat,
          pickupLocation.lng,
          dropoffLocation.lat,
          dropoffLocation.lng,
        );
        setRouteCoords(coords);
      } catch (err) {
        console.error("Static route fetch error:", err);
      } finally {
        routeFetchRef.current = false;
      }
    };

    fetchStaticRoute();
     
  }, [
    selectedPorterId,
    pickupLocation?.lat,
    pickupLocation?.lng,
    dropoffLocation?.lat,
    dropoffLocation?.lng,
  ]);

  const handleClickPorter = (porter) => setSelectedPorterId(porter.id);

  // ── Recenter logic: selected porter → pickup → dropoff → user ──
  const recenterPos =
    selectedPorterId && porters[selectedPorterId]
      ? [porters[selectedPorterId].lat, porters[selectedPorterId].lng]
      : pickupLocation?.lat && pickupLocation?.lng
        ? [pickupLocation.lat, pickupLocation.lng]
        : dropoffLocation?.lat && dropoffLocation?.lng
          ? [dropoffLocation.lat, dropoffLocation.lng]
          : userPos;

  return (
    <div
      className={`grid ${
        showSidebar && !isMapExpanded
          ? "grid-cols-1 lg:grid-cols-[280px_1fr]"
          : "grid-cols-1"
      } gap-4 h-full ${className}`}
    >
      {/* Sidebar — only shown in full UserMap mode */}
      {showSidebar && !isMapExpanded && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-linear-to-r from-primary/5 to-blue-50">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-gray-900">Nearby Porters</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 rounded-full ${
                    socketConnected ? "bg-green-500" : "bg-red-500"
                  } animate-pulse`}
                />
                <span className="text-xs text-gray-500">
                  {socketConnected ? "Live" : "Offline"}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {nearby.length} porter{nearby.length !== 1 ? "s" : ""} within{" "}
              {radiusKm} km
            </p>
          </div>

          {/* Radius slider */}
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

          {/* Porter list */}
          <div className="flex-1 overflow-y-auto p-4">
            {nearby.length > 0 ? (
              <div className="space-y-2">
                {nearby.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleClickPorter(p)}
                    className={`w-full text-left rounded-xl border transition-all duration-200 p-3 ${
                      selectedPorterId === p.id
                        ? "border-primary bg-blue-50 shadow-sm"
                        : "border-gray-200 hover:border-primary/40 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="font-semibold text-gray-900 text-sm truncate max-w-[130px]">
                        {p.id}
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        <Navigation className="w-3 h-3" />
                        <span className="text-xs font-medium">
                          {p.distance.toFixed(1)} km
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
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
                  {socketConnected
                    ? "Try increasing the search radius"
                    : "Connecting to live tracker…"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="relative overflow-hidden border border-gray-200 shadow-sm h-full min-h-[400px]">
        {showSidebar && (
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
        )}

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

          {/* Map click handler (used in booking form) */}
          {onMapClick && <MapEvents onMapClick={onMapClick} />}

          {/* Pickup marker (green) */}
          {pickupLocation?.lat && pickupLocation?.lng && (
            <Marker
              position={[pickupLocation.lat, pickupLocation.lng]}
              icon={PICKUP_ICON}
            >
              <Popup>
                <div className="font-medium">📍 Pickup</div>
                <div className="text-xs text-gray-600 mt-0.5">
                  {pickupLocation.address || ""}
                </div>
              </Popup>
            </Marker>
          )}

          {/* Dropoff marker (red) */}
          {dropoffLocation?.lat && dropoffLocation?.lng && (
            <Marker
              position={[dropoffLocation.lat, dropoffLocation.lng]}
              icon={DROPOFF_ICON}
            >
              <Popup>
                <div className="font-medium">🏁 Dropoff</div>
                <div className="text-xs text-gray-600 mt-0.5">
                  {dropoffLocation.address || ""}
                </div>
              </Popup>
            </Marker>
          )}

          {/* Nearby porter markers (from live socket) */}
          {nearby.map((p) => (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={PORTER_ICON}
              eventHandlers={{ click: () => handleClickPorter(p) }}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <div className="font-bold text-gray-900 mb-1 text-sm">
                    {p.id}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    {p.distance.toFixed(2)} km away
                  </div>
                  <div className="text-xs text-gray-400 mb-3">
                    Team: {p.teamId || "Unassigned"}
                  </div>
                  <button
                    onClick={() => handleClickPorter(p)}
                    className="w-full rounded-md bg-primary text-white px-3 py-2 text-sm font-medium hover:bg-primary/90 transition cursor-pointer"
                  >
                    Show Route
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Live Override Porter Marker (from parent tracking) */}
          {porterLocationOverride?.lat && porterLocationOverride?.lng && (
            <Marker
              position={[
                porterLocationOverride.lat,
                porterLocationOverride.lng,
              ]}
              icon={LIVE_PORTER_ICON}
            >
              <Popup>
                <div className="font-medium text-violet-700">Live Porter</div>
              </Popup>
            </Marker>
          )}

          {/* Route polyline from user to selected porter */}
          <RouteLayer positions={routeCoords} />

          {/* Auto-pan camera */}
          <Recenter pos={recenterPos} />
        </MapContainer>
      </div>
    </div>
  );
};

export default UserMap;
