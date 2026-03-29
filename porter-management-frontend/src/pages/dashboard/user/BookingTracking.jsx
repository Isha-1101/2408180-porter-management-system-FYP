import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Clock,
  CheckCircle2,
  Loader2,
  MapPin,
  Navigation,
  AlertTriangle,
  XCircle,
  PhoneCall,
  MessageSquare,
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
import {
  useCancelBooking,
  useGetBookingById,
} from "../../../apis/hooks/porterBookingsHooks";
import { createSSEConnection } from "../../../utils/sse";
import { useAuthStore } from "@/store/auth.store";
import ChatBox from "@/components/chat/ChatBox";

// ─── Status step definitions ──────────────────────────────────────────────────
const STATUS_STEPS = [
  { key: "WAITING_PORTER", label: "Searching for porter", icon: Clock },
  { key: "CONFIRMED",      label: "Porter accepted",       icon: CheckCircle2 },
  { key: "IN_PROGRESS",    label: "Pickup in progress",    icon: Navigation },
  { key: "COMPLETED",      label: "Booking completed",     icon: CheckCircle2 },
];

const STATUS_COLORS = {
  WAITING_PORTER: "bg-yellow-100 text-yellow-700 border-yellow-200",
  CONFIRMED:      "bg-blue-100 text-blue-700 border-blue-200",
  IN_PROGRESS:    "bg-primary/10 text-primary border-primary/20",
  COMPLETED:      "bg-green-100 text-green-700 border-green-200",
  CANCELLED:      "bg-red-100 text-red-700 border-red-200",
};

// ─────────────────────────────────────────────────────────────────────────────

const BookingTracking = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { bookingId: paramBookingId } = useParams();
  const token     = useAuthStore((s) => s.access_token);

  // bookingId: from router state (fresh flow) OR url param (Orders history)
  const {
    bookingId: stateBookingId,
    pickup:    statePickup,
    dropoff:   stateDropoff,
    porter:    statePorter,
    fare,
  } = location.state || {};

  const bookingId = stateBookingId || paramBookingId;

  // If we arrived via URL param (from Orders), fetch booking data
  const { data: bookingData, isLoading: bookingLoading } =
    useGetBookingById(bookingId);
  const fetchedBooking = bookingData?.booking || bookingData;

  // Resolve pickup/drop: prefer router state (already available), else fetched
  const pickup  = statePickup  || fetchedBooking?.pickup;
  const dropoff = stateDropoff || fetchedBooking?.drop;

  // Real-time status: socket/SSE override → fetched DB status → default
  const [liveStatus,     setLiveStatus]     = useState(null);
  const [porterLocation, setPorterLocation] = useState(null);
  const [acceptedPorter, setAcceptedPorter] = useState(statePorter || null);
  const [isChatOpen,     setIsChatOpen]     = useState(false);
  const sseRef = useRef(null);

  const { mutateAsync: cancelBooking, isPending: cancelling } = useCancelBooking();

  const resolvedStatus =
    liveStatus || fetchedBooking?.status || "WAITING_PORTER";

  // ── Redirect guard ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!bookingId) navigate("/dashboard");
  }, [bookingId, navigate]);

  // ── Socket + SSE listeners ─────────────────────────────────────────────────
  useEffect(() => {
    if (!bookingId) return;

    const match = (data) => String(data.bookingId) === String(bookingId);

    const onConfirmed  = (data) => { if (match(data)) { setLiveStatus("CONFIRMED");  if (data.porter) setAcceptedPorter(data.porter); } };
    const onInProgress = (data) => { if (match(data)) setLiveStatus("IN_PROGRESS"); };
    const onCompleted  = (data) => {
      if (match(data)) {
        setLiveStatus("COMPLETED");
        setTimeout(() => navigate("/dashboard/orders"), 2500);
      }
    };
    const onCancelled  = (data) => { if (match(data)) setLiveStatus("CANCELLED"); };
    const onPorterLoc  = (data) => {
      if (match(data)) setPorterLocation({ lat: data.lat, lng: data.lng });
    };

    socket.on("booking-confirmed",       onConfirmed);
    socket.on("booking-in-progress",     onInProgress);
    socket.on("booking-completed",       onCompleted);
    socket.on("booking-cancelled",       onCancelled);
    socket.on("porter-location-update",  onPorterLoc);

    sseRef.current = createSSEConnection(
      "/bookings/sse/user",
      {
        "booking-confirmed": (data) => { if (match(data)) { setLiveStatus("CONFIRMED"); if (data.porter) setAcceptedPorter(data.porter); } },
        "booking-status-update": (data) => {
          if (match(data)) {
            setLiveStatus(data.status);
            if (data.status === "COMPLETED") setTimeout(() => navigate("/dashboard/orders"), 2500);
          }
        },
        "booking-cancelled": (data) => { if (match(data)) setLiveStatus("CANCELLED"); },
        "booking-completed": (data) => { if (match(data)) setLiveStatus("COMPLETED"); },
      },
      token,
    );

    return () => {
      socket.off("booking-confirmed",      onConfirmed);
      socket.off("booking-in-progress",    onInProgress);
      socket.off("booking-completed",      onCompleted);
      socket.off("booking-cancelled",      onCancelled);
      socket.off("porter-location-update", onPorterLoc);
      sseRef.current?.close();
    };
  }, [bookingId, navigate, token]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!bookingId) return;
    try {
      await cancelBooking(bookingId);
      navigate("/dashboard/orders");
    } catch { /* toasted by hook */ }
  };

  // ── Loading state (only when accessed via URL param without router state) ──
  if (bookingLoading && !statePickup && !fetchedBooking) {
    return (
      <PageLayout title="Booking Status" description="Track your booking status">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
            <p className="text-gray-500">Loading booking details…</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const currentStep  = STATUS_STEPS.findIndex((s) => s.key === resolvedStatus);
  const isCancellable =
    resolvedStatus === "WAITING_PORTER" || resolvedStatus === "CONFIRMED";

  const displayFare = fare
    ? `NPR ${fare}`
    : acceptedPorter?.price
      ? `~NPR ${acceptedPorter.price}`
      : "Calculating…";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageLayout title="Booking Status" description="Track your booking status">
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4">
        {/* Header row */}
        <div className="flex items-center gap-3 flex-wrap">
          <BackButton to="/dashboard/orders" label="Back to Orders" />
          <Badge
            className={`ml-auto text-xs px-3 py-1 rounded-full border ${
              STATUS_COLORS[resolvedStatus] || "bg-gray-100 text-gray-700"
            }`}
          >
            {resolvedStatus.replace(/_/g, " ")}
          </Badge>
          {bookingId && (
            <Badge variant="outline" className="text-xs">
              #{String(bookingId).slice(-6).toUpperCase()}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Map panel */}
          <div className="lg:col-span-2 h-[320px] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <UserMap
              showSidebar={false}
              pickupLocation={pickup}
              dropoffLocation={dropoff}
              porterLocationOverride={porterLocation}
            />
          </div>

          {/* Info + actions panel */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Booking #{String(bookingId || "").slice(-6).toUpperCase()}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Step tracker */}
                <div className="space-y-3">
                  {STATUS_STEPS.map((step, i) => {
                    const Icon  = step.icon;
                    const done  = i <= currentStep;
                    const active = i === currentStep;
                    return (
                      <div key={step.key} className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            done ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {active && resolvedStatus === "WAITING_PORTER" ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Icon className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <p
                          className={`flex-1 text-sm font-medium ${
                            done ? "text-gray-900" : "text-gray-400"
                          }`}
                        >
                          {step.label}
                        </p>
                        {done && i < currentStep && (
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Done</Badge>
                        )}
                        {active && (
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs animate-pulse">Active</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>

                <Separator />

                {/* Route */}
                {(pickup || dropoff) && (
                  <div className="space-y-2 text-sm">
                    {pickup && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <AddressLine location={pickup} />
                      </div>
                    )}
                    {dropoff && (
                      <div className="flex items-start gap-2">
                        <Navigation className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        <AddressLine location={dropoff} />
                      </div>
                    )}
                    <Separator />
                  </div>
                )}

                {/* Fare */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Estimated Fare</span>
                  <span className="font-bold text-primary">{displayFare}</span>
                </div>

                {/* Porter card (when confirmed) */}
                {acceptedPorter && resolvedStatus !== "WAITING_PORTER" && (
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
                      <button
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        className="p-2 rounded-full bg-primary text-white border border-primary shadow-sm hover:bg-primary/90"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Action buttons */}
            <div className="space-y-2">
              {resolvedStatus === "COMPLETED" && (
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-sm font-semibold text-green-700">Booking completed!</p>
                  <Button className="w-full" onClick={() => navigate("/dashboard/orders")}>
                    View My Orders
                  </Button>
                </div>
              )}

              {resolvedStatus === "CANCELLED" && (
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                    <XCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <p className="text-sm font-semibold text-red-700">Booking was cancelled.</p>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard")}>
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

        {resolvedStatus === "WAITING_PORTER" && (
          <p className="text-center text-sm text-muted-foreground">
            Searching for a nearby porter… This page updates automatically.
          </p>
        )}
      </div>

      {/* Floating Chat Box */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
          <ChatBox
            bookingId={bookingId}
            currentUserModel="User"
            onClose={() => setIsChatOpen(false)}
          />
        </div>
      )}
    </PageLayout>
  );
};

export default BookingTracking;
