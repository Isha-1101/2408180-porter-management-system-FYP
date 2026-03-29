/**
 * @file TeamBookingTracking.jsx
 * @description User-side page that tracks the live status of a team porter booking.
 *
 * Flow stages displayed:
 *   SEARCHING → WAITING_TEAM_LEAD → TEAM_LEAD_SELECTING
 *   → WAITING_PORTER_RESPONSE → CONFIRMED → COMPLETED
 *
 * Real-time updates via:
 *   • React Query polling every 10 s (useGetBookingById)
 *   • SSE "booking-status-update" events
 *
 * The page also allows the user to cancel while the booking is still
 * in a cancellable state (uses existing useCancelBooking hook).
 */

import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  MapPin,
  Navigation,
  Package,
  Users,
  XCircle,
  CalendarDays,
  Truck,
  MessageSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BackButton } from "../../../components/common/BackButton";
import { AddressLine } from "../../../components/common/AddressLine";
import {
  useGetBookingById,
  useCancelBooking,
} from "../../../apis/hooks/porterBookingsHooks";
import { createSSEConnection } from "../../../utils/sse";
import { useAuthStore } from "@/store/auth.store";
import ChatBox from "@/components/chat/ChatBox";

// ─── Status step definitions (order matters) ─────────────────────────────────
const TEAM_BOOKING_STEPS = [
  {
    key: "SEARCHING",
    label: "Searching",
    description: "Looking for available teams near you",
  },
  {
    key: "WAITING_TEAM_LEAD",
    label: "Notifying Team Leads",
    description: "Waiting for a team lead to accept",
  },
  {
    key: "TEAM_LEAD_SELECTING",
    label: "Team Lead Selecting",
    description: "Team lead is selecting members",
  },
  {
    key: "WAITING_PORTER_RESPONSE",
    label: "Waiting for Porters",
    description: "Team members are confirming availability",
  },
  {
    key: "CONFIRMED",
    label: "Confirmed",
    description: "Team confirmed and on their way",
  },
  {
    key: "COMPLETED",
    label: "Completed",
    description: "Booking completed successfully",
  },
];

/** Statuses where cancellation is still permitted */
const CANCELLABLE_STATUSES = [
  "SEARCHING",
  "WAITING_TEAM_LEAD",
  "TEAM_LEAD_SELECTING",
];

// ─── Helper: determine the active step index ─────────────────────────────────
const getActiveStepIndex = (status) =>
  TEAM_BOOKING_STEPS.findIndex((s) => s.key === status);

// ─── Badge colour map ─────────────────────────────────────────────────────────
const STATUS_BADGE = {
  SEARCHING: "bg-blue-100 text-blue-700 border-blue-200",
  WAITING_TEAM_LEAD: "bg-yellow-100 text-yellow-700 border-yellow-200",
  TEAM_LEAD_SELECTING: "bg-purple-100 text-purple-700 border-purple-200",
  WAITING_PORTER_RESPONSE: "bg-orange-100 text-orange-700 border-orange-200",
  CONFIRMED: "bg-green-100 text-green-700 border-green-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
};

// ─────────────────────────────────────────────────────────────────────────────

const TeamBookingTracking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId: paramBookingId } = useParams();
  const token = useAuthStore((s) => s.access_token);

  // bookingId is passed via navigation state OR URL param (from Orders page)
  const bookingId = location.state?.bookingId || paramBookingId;

  // Local status override (updated via SSE before next poll)
  const [liveStatus, setLiveStatus] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const sseRef = useRef(null);

  // ── Data fetching (polls every 10 s) ───────────────────────────────────────
  const {
    data: bookingData,
    isLoading,
    isError,
    refetch,
  } = useGetBookingById(bookingId);
  const booking = bookingData?.booking;
  console.log(booking);
  const { mutateAsync: cancelBooking, isPending: cancelling } =
    useCancelBooking();

  // Merge polled status with any SSE-pushed update
  const currentStatus = liveStatus || booking?.status || "SEARCHING";
  const activeStepIdx = getActiveStepIndex(currentStatus);
  const isCancellable = CANCELLABLE_STATUSES.includes(currentStatus);

  // ── SSE — listen for real-time status updates ──────────────────────────────
  useEffect(() => {
    if (!bookingId || !token) return;

    sseRef.current = createSSEConnection(
      "/bookings/sse/user",
      {
        "booking-status-update": (data) => {
          // Only handle events for our booking
          if (String(data.bookingId) === String(bookingId)) {
            setLiveStatus(data.status);
            refetch();
          }
        },
      },
      token,
    );

    return () => {
      sseRef.current?.close();
    };
  }, [bookingId, token, refetch]);

  // ── Redirect if no bookingId provided ─────────────────────────────────────
  if (!bookingId) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <XCircle className="w-12 h-12 text-red-400" />
        <p className="text-gray-600 font-medium">No booking found.</p>
        <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
      </div>
    );
  }

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-gray-500">Loading booking details…</p>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (isError || !booking) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <XCircle className="w-12 h-12 text-red-400" />
        <p className="text-gray-600 font-medium">
          Could not load booking details. Please try again.
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  // ── Cancel handler ─────────────────────────────────────────────────────────
  const handleCancel = async () => {
    try {
      await cancelBooking(bookingId);
      navigate("/dashboard");
    } catch {
      /* error toasted by hook */
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto p-4 md:p-6 min-h-[calc(100vh-4rem)] flex flex-col gap-4">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <BackButton />
        <h1 className="text-xl font-bold">Team Booking Tracking</h1>
        <Badge
          variant="outline"
          className={`ml-auto text-xs px-3 py-1 rounded-full border ${
            STATUS_BADGE[currentStatus] || "bg-gray-100 text-gray-600"
          }`}
        >
          {currentStatus.replace(/_/g, " ")}
        </Badge>
        <Badge variant="outline" className="text-xs">
          #{String(bookingId).slice(-6).toUpperCase()}
        </Badge>
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Progress stepper */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Booking Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentStatus === "CANCELLED" ? (
                /* Cancelled state: full-width */
                <div className="text-center py-6 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                    <XCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <p className="font-semibold text-red-700">
                    Booking Cancelled
                  </p>
                  {booking.cancellationReason && (
                    <p className="text-xs text-gray-500">
                      {booking.cancellationReason}
                    </p>
                  )}
                </div>
              ) : (
                <ol className="relative ml-2 space-y-4">
                  {TEAM_BOOKING_STEPS.map((step, idx) => {
                    const done = idx < activeStepIdx;
                    const active = idx === activeStepIdx;
                    return (
                      <li key={step.key} className="flex items-start gap-3">
                        {/* Step icon */}
                        <div
                          className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                            done
                              ? "bg-primary border-primary text-white"
                              : active
                                ? "border-primary bg-primary/10 text-primary animate-pulse"
                                : "border-gray-200 bg-gray-50 text-gray-300"
                          }`}
                        >
                          {done ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : active ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Circle className="w-3 h-3" />
                          )}
                        </div>
                        {/* Step text */}
                        <div className="pt-0.5">
                          <p
                            className={`text-sm font-medium ${
                              done || active ? "text-gray-900" : "text-gray-400"
                            }`}
                          >
                            {step.label}
                          </p>
                          <p className="text-xs text-gray-500">
                            {step.description}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Booking details + actions */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Journey card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Journey Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-green-500" />
                    Pickup
                  </p>
                  <span className="text-sm font-medium line-clamp-2">
                    {booking.pickup.address}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-red-500" />
                    Drop-off
                  </p>
                  <span className="text-sm font-medium line-clamp-2">
                    {booking.drop.address}
                  </span>
                </div>
              </div>
              <Separator />
              {/* Booking meta */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Team Size</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Users className="w-3 h-3 text-primary" />
                    {booking.teamSize} porters
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Weight</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Package className="w-3 h-3 text-primary" />
                    {booking.weightKg} kg
                  </p>
                </div>
                {booking.purpose_of_booking && (
                  <div>
                    <p className="text-gray-500 text-xs">Purpose</p>
                    <p className="font-semibold capitalize flex items-center gap-1">
                      {booking.purpose_of_booking === "delivery" ? "📦" : "🚚"}{" "}
                      {booking.purpose_of_booking}
                    </p>
                  </div>
                )}
                {booking.bookingDate && (
                  <div>
                    <p className="text-gray-500 text-xs">Date</p>
                    <p className="font-semibold flex items-center gap-1">
                      <CalendarDays className="w-3 h-3 text-primary" />
                      {new Date(booking.bookingDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {booking.bookingTime && (
                  <div>
                    <p className="text-gray-500 text-xs">Time</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-primary" />
                      {booking.bookingTime}
                    </p>
                  </div>
                )}
                {booking.hasVehicle && booking.vehicleType && (
                  <div>
                    <p className="text-gray-500 text-xs">Vehicle</p>
                    <p className="font-semibold flex items-center gap-1 capitalize">
                      <Truck className="w-3 h-3 text-primary" />
                      {booking.vehicleType}
                      {booking.numberOfVehicles ? ` ×${booking.numberOfVehicles}` : ""}
                    </p>
                  </div>
                )}
                {booking.noOfFloors != null && booking.noOfFloors > 0 && (
                  <div>
                    <p className="text-gray-500 text-xs">Floors</p>
                    <p className="font-semibold">{booking.noOfFloors} floor(s)</p>
                  </div>
                )}
                {booking.no_of_trips != null && booking.no_of_trips > 0 && (
                  <div>
                    <p className="text-gray-500 text-xs">Trips</p>
                    <p className="font-semibold">{booking.no_of_trips} trip(s)</p>
                  </div>
                )}
              </div>
              {/* Has lift badge */}
              {booking.hasLift && (
                <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                  ✓ Elevator / Lift available at pickup
                </div>
              )}
              {booking.requirements && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Special Requirements</p>
                  <p className="text-sm text-gray-700">
                    {booking.requirements}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>


          {/* Confirmed team info (shown once CONFIRMED) */}
          {currentStatus === "CONFIRMED" &&
            booking.assignedPorters?.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Assigned Team ({booking.assignedPorters.length} porters)
                    </div>
                    <button
                      onClick={() => setIsChatOpen(!isChatOpen)}
                      className="p-2 rounded-full bg-primary text-white shadow-sm hover:bg-primary/90 flex items-center justify-center transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-700 font-medium">
                    ✓ Your team has been confirmed and is on their way!
                  </p>
                </CardContent>
              </Card>
            )}

          {/* Completed state */}
          {currentStatus === "COMPLETED" && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6 text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7 text-green-600" />
                </div>
                <p className="font-bold text-green-800 text-lg">
                  Booking Completed!
                </p>
                <p className="text-sm text-green-700">
                  Thank you for using our service.
                </p>
                <Button
                  className="mt-3 w-full max-w-xs"
                  onClick={() => navigate("/dashboard/orders")}
                >
                  View Order History
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Cancel button (only while cancellable) */}
          {isCancellable && (
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 self-start"
              disabled={cancelling}
              onClick={handleCancel}
            >
              {cancelling ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              {cancelling ? "Cancelling…" : "Cancel Booking"}
            </Button>
          )}
        </div>
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
    </div>
  );
};

export default TeamBookingTracking;
