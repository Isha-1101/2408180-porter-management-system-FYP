import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  MessageSquare,
  Package,
  Truck,
  DollarSign,
  CheckCircle2,
  XCircle,
  Loader2,
  Navigation,
  MapPin,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import UserMap from "@/components/Map/UserMap";
import { BackButton } from "../../../components/common/BackButton";
import { AddressLine } from "../../../components/common/AddressLine";
import {
  useCompleteBooking,
  useRejectPorterBooking,
} from "../../../apis/hooks/porterBookingsHooks";
import socket from "../../../utils/socket";

const normalize = (b) => ({
  id: b._id || b.id || "N/A",
  bookingId: b._id || b.id,
  userName:
    b.userName ||
    (typeof b.userId === "object" ? b.userId?.name : null) ||
    "Customer",
  userPhone: (typeof b.userId === "object" ? b.userId?.phone : null) || null,
  pickup: b.pickup || { address: "—", lat: 27.7172, lng: 85.324 },
  drop: b.drop || b.dropoff || { address: "—", lat: 27.69, lng: 85.342 },
  weight: b.weight ?? b.weightKg ?? 0,
  vehicleType: b.vehicleType || "N/A",
  distance: b.distance ?? b.distanceKm ?? 0,
  fare: b.fare ?? b.totalFare ?? 0,
  status: b.status || "CONFIRMED",
});

const AcceptedBookingDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const raw = location.state?.booking;
  const booking = normalize(raw || {});

  const [currentStatus, setCurrentStatus] = useState(booking.status);
  const [porterLocation, setPorterLocation] = useState(null);

  const { mutateAsync: completeBooking, isPending: completing } =
    useCompleteBooking();
  const { mutateAsync: cancelRequest, isPending: cancelling } =
    useRejectPorterBooking();

  // Emit porter-location every 5s once journey starts
  const intervalRef = useRef(null);
  const startEmittingLocation = () => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          setPorterLocation({ lat, lng });
          socket.emit("porter-location-update", {
            bookingId: booking.bookingId,
            lat,
            lng,
          });
        });
      }
    }, 5000);
  };

  useEffect(() => {
    const onCancelled = (data) => {
      if (String(data.bookingId) === String(booking.bookingId)) {
        setCurrentStatus("CANCELLED");
        clearInterval(intervalRef.current);
      }
    };
    socket.on("booking-cancelled", onCancelled);
    return () => {
      socket.off("booking-cancelled", onCancelled);
      clearInterval(intervalRef.current);
    };
  }, [booking.bookingId]);

  const handleStartJourney = () => {
    setCurrentStatus("IN_PROGRESS");
    startEmittingLocation();
    socket.emit("booking-in-progress", { bookingId: booking.bookingId });
  };

  const handleCompleteJourney = async () => {
    try {
      await completeBooking(booking.bookingId);
      setCurrentStatus("COMPLETED");
      clearInterval(intervalRef.current);
    } catch {
      // handled in hook
    }
  };

  const handleCancelRequest = async () => {
    try {
      await cancelRequest(booking.bookingId);
      navigate("/dashboard/porters");
    } catch {
      // handled in hook
    }
  };

  const statusBadgeClass = {
    CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
    IN_PROGRESS: "bg-yellow-100 text-yellow-700 border-yellow-200",
    COMPLETED: "bg-green-100 text-green-700 border-green-200",
    CANCELLED: "bg-red-100 text-red-700 border-red-200",
  };

  const estTime = Math.round((booking.distance || 0) * 10);

  return (
    <div className="container mx-auto p-4 md:p-6 min-h-[calc(100vh-4rem)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <BackButton />
        <h1 className="text-xl font-bold">Accepted Booking</h1>
        <Badge
          variant="outline"
          className={`ml-auto text-xs px-3 py-1 rounded-full border ${statusBadgeClass[currentStatus] || "bg-gray-100 text-gray-600"}`}
        >
          {currentStatus.replace("_", " ")}
        </Badge>
        <Badge variant="outline" className="text-xs">
          #{String(booking.id).slice(-6).toUpperCase()}
        </Badge>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Map */}
        <div className="lg:col-span-2 min-h-[350px] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <UserMap
            showSidebar={false}
            pickupLocation={booking.pickup}
            dropoffLocation={booking.drop}
            porterLocationOverride={porterLocation}
          />
        </div>

        {/* Details sidebar */}
        <div className="flex flex-col gap-3 overflow-y-auto">
          {/* Customer */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Customer Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {booking.userName?.charAt(0) ?? "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{booking.userName}</h3>
                  {booking.userPhone && (
                    <p className="text-xs text-gray-500">{booking.userPhone}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {booking.userPhone && (
                    <a
                      href={`tel:${booking.userPhone}`}
                      className="p-2 rounded-full border border-gray-200 hover:bg-gray-50"
                    >
                      <Phone className="h-4 w-4 text-primary" />
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Journey */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Journey</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-green-500" /> Pickup
                  </p>
                  <AddressLine location={booking.pickup} dot="green" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-red-500" /> Drop-off
                  </p>
                  <AddressLine location={booking.drop} dot="red" />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Distance</p>
                  <p className="font-semibold">{booking.distance} km</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Est. Time</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {estTime} min
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipment & Fare */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" /> Shipment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Vehicle</span>
                </div>
                <span className="text-sm font-bold">{booking.vehicleType}</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Weight</span>
                </div>
                <span className="text-sm font-bold">{booking.weight} kg</span>
              </div>
              <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg border border-green-100">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">
                    Total Fare
                  </span>
                </div>
                <span className="text-base font-bold text-green-700">
                  NPR {booking.fare || "TBD"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2 mt-auto pb-2">
            {currentStatus === "CONFIRMED" && (
              <>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 h-11 font-semibold"
                  onClick={handleStartJourney}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Start Journey
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50 h-10"
                  disabled={cancelling}
                  onClick={handleCancelRequest}
                >
                  {cancelling ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  {cancelling ? "Cancelling…" : "Cancel Request"}
                </Button>
              </>
            )}

            {currentStatus === "IN_PROGRESS" && (
              <Button
                className="w-full bg-primary hover:bg-primary/90 h-11 font-semibold"
                disabled={completing}
                onClick={handleCompleteJourney}
              >
                {completing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                {completing ? "Completing…" : "Mark as Completed"}
              </Button>
            )}

            {currentStatus === "COMPLETED" && (
              <div className="text-center py-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <p className="font-semibold text-green-700">
                  Journey Completed!
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Fare collected: NPR {booking.fare}
                </p>
                <Button
                  className="mt-3 w-full"
                  onClick={() => navigate("/dashboard/porters")}
                >
                  Back to Dashboard
                </Button>
              </div>
            )}

            {currentStatus === "CANCELLED" && (
              <div className="text-center py-3">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
                <p className="font-semibold text-red-700">Booking Cancelled</p>
                <Button
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={() => navigate("/dashboard/porters")}
                >
                  Back to Dashboard
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptedBookingDetails;
