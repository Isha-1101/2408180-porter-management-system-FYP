import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Clock,
  CheckCircle2,
  Loader2,
  MapPin,
  Navigation,
  AlertTriangle,
  XCircle,
  PhoneCall,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import PageLayout from "../../../components/common/PageLayout";
import { BackButton } from "../../../components/common/BackButton";
import { AddressLine } from "../../../components/common/AddressLine";
import UserMap from "@/components/Map/UserMap";
import socket from "../../../utils/socket";
import { useCancelBooking } from "../../../apis/hooks/porterBookingsHooks";
import { createSSEConnection } from "../../../utils/sse";
import { useAuthStore } from "@/store/auth.store";

const STATUS_STEPS = [
  { key: "WAITING_PORTER", label: "Searching for porter", icon: Clock },
  { key: "CONFIRMED", label: "Porter accepted", icon: CheckCircle2 },
  { key: "IN_PROGRESS", label: "Pickup in progress", icon: Navigation },
  { key: "COMPLETED", label: "Booking completed", icon: CheckCircle2 },
];

const STATUS_COLORS = {
  WAITING_PORTER: "bg-yellow-100 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-primary/10 text-primary border-primary/20",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
};

const BookingTracking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.access_token);

  const { bookingId, pickup, dropoff, porter, fare } = location.state || {};
  const [status, setStatus] = useState("WAITING_PORTER");
  const [porterLocation, setPorterLocation] = useState(null);
  const [acceptedPorter, setAcceptedPorter] = useState(porter || null);
  const sseRef = useRef(null);

  const { mutateAsync: cancelBooking, isPending: cancelling } =
    useCancelBooking();

  useEffect(() => {
    if (!bookingId) {
      navigate("/dashboard/booking");
      return;
    }

    // Socket events for booking status & porter location
    const onConfirmed = (data) => {
      if (String(data.bookingId) === String(bookingId)) {
        setStatus("CONFIRMED");
        if (data.porter) setAcceptedPorter(data.porter);
      }
    };
    const onInProgress = (data) => {
      if (String(data.bookingId) === String(bookingId))
        setStatus("IN_PROGRESS");
    };
    const onCompleted = (data) => {
      if (String(data.bookingId) === String(bookingId)) {
        setStatus("COMPLETED");
        setTimeout(() => navigate("/dashboard/orders"), 2500);
      }
    };
    const onCancelled = (data) => {
      if (String(data.bookingId) === String(bookingId)) setStatus("CANCELLED");
    };
    const onPorterLoc = (data) => {
      if (String(data.bookingId) === String(bookingId)) {
        setPorterLocation({ lat: data.lat, lng: data.lng });
      }
    };

    socket.on("booking-confirmed", onConfirmed);
    socket.on("booking-in-progress", onInProgress);
    socket.on("booking-completed", onCompleted);
    socket.on("booking-cancelled", onCancelled);
    socket.on("porter-location-update", onPorterLoc);

    // SSE: also listen via server-sent events for resilience
    sseRef.current = createSSEConnection(
      `/bookings/sse/user`,
      {
        "booking-confirmed": (data) => {
          if (String(data.bookingId) === String(bookingId)) {
            setStatus("CONFIRMED");
            if (data.porter) setAcceptedPorter(data.porter);
          }
        },
        "booking-cancelled": (data) => {
          if (String(data.bookingId) === String(bookingId))
            setStatus("CANCELLED");
        },
        "booking-completed": (data) => {
          if (String(data.bookingId) === String(bookingId)) {
            setStatus("COMPLETED");
          }
        },
      },
      token,
    );

    return () => {
      socket.off("booking-confirmed", onConfirmed);
      socket.off("booking-in-progress", onInProgress);
      socket.off("booking-completed", onCompleted);
      socket.off("booking-cancelled", onCancelled);
      socket.off("porter-location-update", onPorterLoc);
      sseRef.current?.close();
    };
  }, [bookingId, navigate, token]);

  const handleCancel = async () => {
    if (!bookingId) return;
    try {
      await cancelBooking(bookingId);
      navigate("/dashboard/booking");
    } catch {
      // error handled in hook
    }
  };

  const currentStep = STATUS_STEPS.findIndex((s) => s.key === status);
  const isCancellable = status === "WAITING_PORTER" || status === "CONFIRMED";

  // Derive fare: prefer prop, fallback calculate from porter base + weight
  const displayFare = fare
    ? `NPR ${fare}`
    : acceptedPorter?.price
      ? `~NPR ${acceptedPorter.price}`
      : "Calculating…";

  return (
    <PageLayout title="Booking Status" description="Track your booking status">
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <BackButton to="/dashboard/booking" label="Back to Booking" />
          <Badge
            className={`ml-auto text-xs px-3 py-1 rounded-full border ${STATUS_COLORS[status] || "bg-gray-100 text-gray-700"}`}
          >
            {status.replace("_", " ")}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* left panel */}
          <div className="lg:col-span-2 h-[320px] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <UserMap
              showSidebar={false}
              pickupLocation={pickup}
              dropoffLocation={dropoff}
              porterLocationOverride={porterLocation}
            />
          </div>

          {/* Right panel */}
          <div className="flex flex-col gap-4">
            {/* Status tracker */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>
                    Booking #{String(bookingId).slice(-6).toUpperCase()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Steps */}
                <div className="space-y-3">
                  {STATUS_STEPS.map((step, i) => {
                    const Icon = step.icon;
                    const done = i <= currentStep;
                    const active = i === currentStep;
                    return (
                      <div key={step.key} className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            done
                              ? "bg-primary text-white"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {active && status === "WAITING_PORTER" ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Icon className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p
                            className={`text-sm font-medium ${done ? "text-gray-900" : "text-gray-400"}`}
                          >
                            {step.label}
                          </p>
                        </div>
                        {done && i < currentStep && (
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                            Done
                          </Badge>
                        )}
                        {active && (
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs animate-pulse">
                            Active
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>

                <Separator />

                {/* Route */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <AddressLine location={pickup} />
                  </div>
                  <div className="flex items-start gap-2">
                    <Navigation className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <AddressLine location={dropoff} />
                  </div>
                </div>

                <Separator />

                {/* Fare */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Estimated Fare</span>
                  <span className="font-bold text-primary">{displayFare}</span>
                </div>

                {/* Porter info if confirmed */}
                {acceptedPorter && status !== "WAITING_PORTER" && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {acceptedPorter.porterName?.charAt(0) || "P"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {acceptedPorter.porterName || "Your Porter"}
                        </p>
                        <p className="text-xs text-gray-500">
                          ★ {acceptedPorter.rating || "4.8"}
                        </p>
                      </div>
                      <button className="p-2 rounded-full bg-white border border-gray-200 shadow-sm">
                        <PhoneCall className="w-4 h-4 text-primary" />
                      </button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              {status === "COMPLETED" && (
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-sm font-semibold text-green-700">
                    Booking completed!
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => navigate("/dashboard/orders")}
                  >
                    View My Orders
                  </Button>
                </div>
              )}

              {status === "CANCELLED" && (
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                    <XCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <p className="text-sm font-semibold text-red-700">
                    Booking was cancelled.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/dashboard/booking")}
                  >
                    Book Again
                  </Button>
                </div>
              )}

              {isCancellable && (
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  disabled={cancelling}
                  onClick={handleCancel}
                >
                  {cancelling ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 mr-2" />
                  )}
                  {cancelling ? "Cancelling…" : "Cancel Booking"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {status === "WAITING_PORTER" && (
          <p className="text-center text-sm text-muted-foreground">
            Searching for a nearby porter… This page updates automatically.
          </p>
        )}
      </div>
    </PageLayout>
  );
};

export default BookingTracking;
