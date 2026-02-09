import React, { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import "leaflet/dist/leaflet.css";
import {
  Navigation,
  Package,
  Clock,
  Truck,
  Filter,
  Star,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { usePorter } from "../../../hooks/porter/use-porter";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Badge } from "../../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { ScrollArea } from "../../../components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Recenter } from "../../../utils/helper";
import { userIcon } from "../../../utils/lefleticons";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const socket = io(SOCKET_URL);

// Mock data for booking requests
const mockBookingRequests = [
  {
    id: "REQ001",
    userId: "USR245",
    userName: "John Smith",
    pickup: { lat: 27.7172, lng: 85.324, address: "New Road, Kathmandu" },
    drop: { lat: 27.69, lng: 85.342, address: "Kalimati, Kathmandu" },
    weight: 15,
    vehicleType: "BIKE",
    distance: 2.5,
    fare: 450,
    status: "PENDING",
    createdAt: "2024-01-15T10:30:00",
    expiresIn: 300,
    priority: "HIGH",
    acceptedBy: null,
  },
  {
    id: "REQ002",
    userId: "USR312",
    userName: "Sarah Johnson",
    pickup: { lat: 27.71, lng: 85.31, address: "Thamel, Kathmandu" },
    drop: { lat: 27.72, lng: 85.35, address: "Boudha, Kathmandu" },
    weight: 8,
    vehicleType: "BIKE",
    distance: 4.2,
    fare: 380,
    status: "PENDING",
    createdAt: "2024-01-15T10:32:00",
    expiresIn: 240,
    priority: "MEDIUM",
    acceptedBy: null,
  },
  {
    id: "REQ003",
    userId: "USR489",
    userName: "Robert Chen",
    pickup: { lat: 27.6905, lng: 85.335, address: "Patan Durbar Square" },
    drop: { lat: 27.7, lng: 85.32, address: "Kupondole, Kathmandu" },
    weight: 25,
    vehicleType: "CAR",
    distance: 3.1,
    fare: 620,
    status: "ACCEPTED",
    createdAt: "2024-01-15T10:25:00",
    expiresIn: 180,
    priority: "LOW",
    acceptedBy: "PORTER002",
  },
  {
    id: "REQ004",
    userId: "USR567",
    userName: "Maria Garcia",
    pickup: { lat: 27.705, lng: 85.315, address: "Durbarmarg, Kathmandu" },
    drop: { lat: 27.695, lng: 85.305, address: "Lazimpat, Kathmandu" },
    weight: 5,
    vehicleType: "BIKE",
    distance: 1.8,
    fare: 320,
    status: "PENDING",
    createdAt: "2024-01-15T10:35:00",
    expiresIn: 280,
    priority: "HIGH",
    acceptedBy: null,
  },
];

const priorityColors = {
  HIGH: "bg-red-100 text-red-800 border-red-200",
  MEDIUM: "bg-amber-100 text-amber-800 border-amber-200",
  LOW: "bg-green-100 text-green-800 border-green-200",
};

export default function PorterDashboard() {
  const { porter, isLoading } = usePorter();
  const [bookingRequests, setBookingRequests] = useState(mockBookingRequests);
  const [selectedRequest, setSelectedRequest] = useState(
    mockBookingRequests[0],
  );
  const [newRequestsCount, setNewRequestsCount] = useState(0);
  const [filter, setFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("distance");

  const [porterLocation, setPorterLocation] = useState([27.7172, 85.324]);

  // WebSocket connection
  const intervalRef = useRef(null);

  // useEffect(() => {
  //   if (porter?._id) {
  //     startAutoLocation(porter._id);
  //   }

  //   return () => stopAutoLocation();
  // }, [porter?._id]);

  // const startAutoLocation = (id) => {
  //   if (!id) return;
  //   intervalRef.current = setInterval(() => {
  //     if (navigator.geolocation) {
  //       navigator.geolocation.getCurrentPosition(
  //         (pos) => {
  //           const lat = pos.coords.latitude;
  //           const lng = pos.coords.longitude;
  //           setPorterLocation([lat, lng]);

  //           console.log("📍 Sending location:", { porterId: id, lat, lng });
  //           socket.emit("porter-location", {
  //             porterId: id,
  //             lat,
  //             lng,
  //           });
  //         },
  //         (err) => console.error("Error getting location:", err),
  //         { enableHighAccuracy: true },
  //       );
  //     }
  //   }, 5000); // every 5 seconds
  // };

  // const stopAutoLocation = () => {
  //   if (intervalRef.current) clearInterval(intervalRef.current);
  // };

  const handleAcceptRequest = (requestId) => {
    console.log("Accepting request:", requestId);
    setBookingRequests(
      bookingRequests.map((req) =>
        req.id === requestId
          ? { ...req, acceptedBy: "PORTER001", status: "ACCEPTED" }
          : req,
      ),
    );
    setCurrentJob(bookingRequests.find((req) => req.id === requestId) || null);
  };

  const handleRejectRequest = (requestId) => {
    console.log("Rejecting request:", requestId);
    setBookingRequests(bookingRequests.filter((req) => req.id !== requestId));
  };

  const filteredAndSortedRequests = bookingRequests
    .filter((req) => {
      if (filter === "ALL") return true;
      if (filter === "PENDING")
        return req.status === "PENDING" && !req.acceptedBy;
      if (filter === "ACCEPTED") return req.status === "ACCEPTED";
      if (filter === "BIKE") return req.vehicleType === "BIKE";
      if (filter === "CAR") return req.vehicleType === "CAR";
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "distance") return a.distance - b.distance;
      if (sortBy === "fare") return b.fare - a.fare;
      if (sortBy === "priority") {
        const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return 0;
    });

  const pendingRequests = bookingRequests.filter(
    (req) => req.status === "PENDING" && !req.acceptedBy,
  ).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Porter Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 border border-red-400 relative">
      <div className="col-start-1 sticky top-0 h-full">
        <MapContainer
          center={porterLocation}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {porterLocation && (
            <Marker position={porterLocation} icon={userIcon}>
              <Popup>Your Location</Popup>
            </Marker>
          )}
          <Recenter pos={porterLocation} />
        </MapContainer>
      </div>

      {/* Right Column - Booking Requests */}
      <Card className="h-full col-start-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Booking Requests</span>
              {newRequestsCount > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {newRequestsCount} new
                </Badge>
              )}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilter("ALL")}>
                  All Requests
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("PENDING")}>
                  Pending Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("ACCEPTED")}>
                  Accepted
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Vehicle Type</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setFilter("BIKE")}>
                  Bike
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("CAR")}>
                  Car
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("TRUCK")}>
                  Truck
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription>
            {pendingRequests} requests waiting • Updated just now
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Nearest First</SelectItem>
                  <SelectItem value="fare">Highest Fare</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {filteredAndSortedRequests.map((request) => (
                  <Card
                    key={request.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedRequest?.id === request.id
                        ? "border-primary ring-2 ring-primary/20"
                        : ""
                    } ${request.status === "ACCEPTED" ? "opacity-70" : ""}`}
                    onClick={() => setSelectedRequest(request)}
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">#{request.id}</Badge>
                          <Badge className={priorityColors[request.priority]}>
                            {request.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center text-amber-600 text-sm">
                          <Clock className="h-3 w-3 mr-1" />
                          {Math.floor(request.expiresIn / 60)}:
                          {String(request.expiresIn % 60).padStart(2, "0")}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {request.userName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {request.userName}
                              </p>
                              <div className="flex items-center">
                                <Star className="h-3 w-3 text-amber-500 mr-1" />
                                <span className="text-xs text-gray-500">
                                  4.8
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">
                              Rs. {request.fare}
                            </p>
                            <p className="text-xs text-gray-500">
                              Estimated fare
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                            <div>
                              <p className="text-xs text-gray-500">Pickup</p>
                              <p className="text-sm font-medium">
                                {request.pickup.address}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-primary rounded-full mt-1.5"></div>
                            <div>
                              <p className="text-xs text-gray-500">Drop</p>
                              <p className="text-sm font-medium">
                                {request.drop.address}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Package className="h-4 w-4 text-gray-400" />
                              <span>{request.weight} kg</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Truck className="h-4 w-4 text-gray-400" />
                              <span>{request.vehicleType}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Navigation className="h-4 w-4 text-gray-400" />
                              <span>{request.distance} km</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      {request.status === "PENDING" && !request.acceptedBy ? (
                        <div className="flex space-x-2 w-full">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRejectRequest(request.id);
                            }}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                          <Button
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcceptRequest(request.id);
                            }}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Accept
                          </Button>
                        </div>
                      ) : (
                        <div className="w-full">
                          <Badge
                            variant="secondary"
                            className="w-full justify-center"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {request.acceptedBy === "PORTER001"
                              ? "Accepted by you"
                              : "Accepted by another porter"}
                          </Badge>
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
