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
import { PaymentMethodSelector } from "@/components/PaymentMethodSelector";
import socket from "../../../utils/socket";
import {
  useCancelBooking,
  useGetBookingById,
} from "../../../apis/hooks/porterBookingsHooks";
import { createSSEConnection } from "../../../utils/sse";
import { useAuthStore } from "@/store/auth.store";
import ChatBox from "@/components/chat/ChatBox";
import toast from "react-hot-toast";

// Status step definitions
const STATUS_STEPS = [
  { key: "WAITING_PORTER", label: "Waiting for porter", icon: Clock },
  { key: "CONFIRMED",      label: "Porter accepted",       icon: CheckCircle2 },
  { key: "IN_PROGRESS",    label: "Pickup in progress",    icon: Navigation },
  { key: "COMPLETED",      label: "Booking completed",     icon: CheckCircle2 },
];

const STATUS_COLORS = {
  WAITING_PORTER: "bg-[#FEF3E0] text-[#E5A03D] border-[#FDB64E]",
  CONFIRMED:      "bg-[#C5E2B6] text-[#0C4C40] border-[#8DC976]",
  IN_PROGRESS:    "bg-[#E8F5E8] text-[#0C4C40] border-[#C5E2B6]",
  COMPLETED:      "bg-[#C5E2B6] text-[#0C4C40] border-[#8DC976]",
  CANCELLED:      "bg-red-100 text-red-700 border-red-200",
};


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
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const sseRef = useRef(null);

  const { mutateAsync: cancelBooking, isPending: cancelling } = useCancelBooking();

  const resolvedStatus =
    liveStatus || fetchedBooking?.status || "WAITING_PORTER";

  // Redirect guard
  useEffect(() => {
    if (!bookingId) navigate("/dashboard");
  }, [bookingId, navigate]);

  // Socket + SSE listeners
  useEffect(() => {
    if (!bookingId) return;

    const match = (data) => String(data.bookingId) === String(bookingId);

    const onConfirmed  = (data) => { if (match(data)) { setLiveStatus("CONFIRMED");  if (data.porter) setAcceptedPorter(data.porter); } };
    const onInProgress = (data) => { if (match(data)) setLiveStatus("IN_PROGRESS"); };
    const onCompleted  = (data) => {
      if (match(data)) {
        setLiveStatus("COMPLETED");
        setShowPaymentMethod(true);
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
            if (data.status === "COMPLETED") {
              setShowPaymentMethod(true);
            }
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

  // Handlers
  const handleCancel = async () => {
    if (!bookingId) return;
    try {
      await cancelBooking(bookingId);
      navigate("/dashboard/orders");
    } catch { /* toasted by hook */ }
  };

  const handlePaymentMethodSelect = async (paymentMethod) => {
    if (!bookingId) return;
    
    setIsSubmittingPayment(true);
    try {
      const response = await fetch(`/api/bookings/individual/${bookingId}/update-payment-method`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${useAuthStore.getState().access_token}`,
        },
        body: JSON.stringify({ paymentMethod }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update payment method");
      }

      const data = await response.json();
      toast.success("Payment method saved! Redirecting to orders...");
      
      setTimeout(() => {
        navigate("/dashboard/orders");
      }, 1500);
    } catch (error) {
      console.error("Error updating payment method:", error);
      toast.error(error.message || "Failed to save payment method");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Loading state (only when accessed via URL param without router state)
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

  // Derived values
  const currentStep  = STATUS_STEPS.findIndex((s) => s.key === resolvedStatus);
  const isCancellable =
    resolvedStatus === "WAITING_PORTER" || resolvedStatus === "CONFIRMED";

  const displayFare = fare
    ? `NPR ${fare}`
    : acceptedPorter?.price
      ? `~NPR ${acceptedPorter.price}`
      : "Calculating…";

  // Render
  return (
    <PageLayout title="Booking Status">
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4">
        {/* Header row */}
        <div className="flex items-center gap-3 flex-wrap">
          <BackButton onClick={() => navigate(-1)} label="Back to Orders" />
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
                            done ? "bg-[#0C4C40] text-white" : "bg-gray-100 text-gray-400"
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
                          <Badge className="bg-[#C5E2B6] text-[#0C4C40] border-[#8DC976] text-xs">Done</Badge>
                        )}
                        {active && (
                          <Badge className="bg-[#C5E2B6] text-[#0C4C40] border-[#8DC976] text-xs">Active</Badge>
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
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <AddressLine location={pickup} />
                      </div>
                    )}
                    {dropoff && (
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <AddressLine location={dropoff} />
                      </div>
                    )}
                    <Separator />
                  </div>
                )}

                {/* Fare */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Estimated Fare</span>
                  <span className="font-bold text-[#0C4C40]">
                    NPR {fetchedBooking?.totalPrice || fare || acceptedPorter?.price || 0}
                  </span>
                </div>

                {/* Porter card (when confirmed) */}
                {acceptedPorter && resolvedStatus !== "WAITING_PORTER" && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-3 bg-[#F5FBF2] p-3 rounded-lg border border-[#C5E2B6]">
                      <div className="w-10 h-10 rounded-full bg-[#C5E2B6] flex items-center justify-center text-[#0C4C40] font-bold">
                        {acceptedPorter.porterName?.charAt(0) || "P"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-[#0C4C40]">
                          {acceptedPorter.porterName || "Your Porter"}
                        </p>
                        <p className="text-xs text-gray-500">
                          ★ {acceptedPorter.rating || "4.8"}
                        </p>
                      </div>
                      <button className="p-2 rounded-full bg-white border border-[#C5E2B6] shadow-sm hover:bg-[#F5FBF2]">
                        <PhoneCall className="w-4 h-4 text-[#0C4C40]" />
                      </button>
                      <button
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        className="p-2 rounded-full bg-[#0C4C40] text-white border border-[#0C4C40] shadow-sm hover:bg-[#8DC976]"
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
              {resolvedStatus === "COMPLETED" && !showPaymentMethod && (
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-[#C5E2B6] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6 text-[#0C4C40]" />
                  </div>
                  <p className="text-sm font-semibold text-[#0C4C40]">Booking completed!</p>
                </div>
              )}

              {resolvedStatus === "COMPLETED" && showPaymentMethod && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 text-center mb-4">
                    Please select your payment method to complete the booking.
                  </p>
                  <PaymentMethodSelector
                    amount={fetchedBooking?.totalPrice || fare || acceptedPorter?.price || 0}
                    onMethodSelect={handlePaymentMethodSelect}
                    isLoading={isSubmittingPayment}
                    disabled={isSubmittingPayment}
                  />
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
