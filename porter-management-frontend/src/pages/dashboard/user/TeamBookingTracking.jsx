/**
 * @file TeamBookingTracking.jsx
 * @description User-side page that tracks the live status of a team porter booking.
 *
 * Flow stages displayed:
 *   PENDING_TEAM_REVIEW → PENDING_MEMBER_RESPONSE → AWAITING_OWNER_CONFIRMATION
 *   → CONFIRMED → IN_PROGRESS → COMPLETED → CLOSED
 *
 * Real-time updates via:
 *   • React Query polling every 10 s (useGetTeamBookingStatus)
 *   • Socket.io events: team-booking-declined, team-booking-confirmed, team-booking-completed, team-booking-cancelled
 */

import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  MapPin,
  Package,
  Users,
  XCircle,
  CalendarDays,
  Truck,
  MessageSquare,
  Send,
  Hourglass,
  CheckSquare,
  CreditCard,
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
import { useGetTeamBookingStatus } from "../../../apis/hooks/porterTeamHooks";
import socket from "../../../utils/socket";
import { useAuthStore } from "@/store/auth.store";
import ChatBox from "@/components/chat/ChatBox";

const TEAM_BOOKING_STEPS = [
  {
    key: "PENDING_TEAM_REVIEW",
    label: "Pending Review",
    description: "Waiting for a team to review your request",
    icon: Hourglass,
  },
  {
    key: "PENDING_MEMBER_RESPONSE",
    label: "Team Responding",
    description: "Team members are confirming their availability",
    icon: Users,
  },
  {
    key: "AWAITING_OWNER_CONFIRMATION",
    label: "Awaiting Owner",
    description: "Enough members accepted, waiting for team owner confirmation",
    icon: Clock,
  },
  {
    key: "CONFIRMED",
    label: "Confirmed",
    description: "Your team has been confirmed",
    icon: CheckSquare,
  },
  {
    key: "IN_PROGRESS",
    label: "In Progress",
    description: "The team is on their way",
    icon: Truck,
  },
  {
    key: "COMPLETED",
    label: "Completed",
    description: "Job completed — please proceed with payment",
    icon: CheckCircle2,
  },
  {
    key: "CLOSED",
    label: "Closed",
    description: "Booking closed — payment confirmed",
    icon: CreditCard,
  },
];

const CANCELLABLE_STATUSES = [
  "PENDING_TEAM_REVIEW",
  "PENDING_MEMBER_RESPONSE",
];

const getActiveStepIndex = (status) =>
  TEAM_BOOKING_STEPS.findIndex((s) => s.key === status);

const STATUS_BADGE = {
  PENDING_TEAM_REVIEW: "bg-yellow-100 text-yellow-700 border-yellow-200",
  PENDING_MEMBER_RESPONSE: "bg-orange-100 text-orange-700 border-orange-200",
  AWAITING_OWNER_CONFIRMATION: "bg-blue-100 text-blue-700 border-blue-200",
  CONFIRMED: "bg-green-100 text-green-700 border-green-200",
  IN_PROGRESS: "bg-indigo-100 text-indigo-700 border-indigo-200",
  COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  CLOSED: "bg-gray-100 text-gray-700 border-gray-200",
  DECLINED: "bg-red-100 text-red-700 border-red-200",
  CANCELLED: "bg-gray-200 text-gray-600 border-gray-300",
};

const TeamBookingTracking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId: paramId } = useParams();
  const token = useAuthStore((s) => s.access_token);
  const userId = useAuthStore((s) => s.user?._id || s.user?.id);

  const bookingIdFromState = location.state?.bookingId;
  const bookingId = paramId || bookingIdFromState;

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState(null);

  const { data: bookingData, isLoading } = useGetBookingById(bookingId);
  const { data: teamStatusData } = useGetTeamBookingStatus(bookingId);
  const { mutateAsync: cancelBooking, isPending: cancelling } = useCancelBooking();

  const booking = bookingData || null;
  const currentStatus = localStatus || booking?.status || "PENDING_TEAM_REVIEW";
  const activeStep = getActiveStepIndex(currentStatus);
  const isCancellable = CANCELLABLE_STATUSES.includes(currentStatus);

  // Join the user's own socket room (backend emits to user:${userId})
  useEffect(() => {
    if (userId) {
      socket.emit("join-user-room", userId);
    }
  }, [userId]);

  useEffect(() => {
    const onDeclined = (data) => {
      if (String(data.bookingId) === String(bookingId)) {
        setLocalStatus("DECLINED");
      }
    };
    const onConfirmed = (data) => {
      if (String(data.bookingId) === String(bookingId)) {
        setLocalStatus("CONFIRMED");
      }
    };
    const onStarted = (data) => {
      if (String(data.bookingId) === String(bookingId)) {
        setLocalStatus("IN_PROGRESS");
      }
    };
    const onCompleted = (data) => {
      if (String(data.bookingId) === String(bookingId)) {
        setLocalStatus("COMPLETED");
      }
    };
    const onCancelled = (data) => {
      if (String(data.bookingId) === String(bookingId)) {
        setLocalStatus("CANCELLED");
      }
    };

    socket.on("team-booking-declined", onDeclined);
    socket.on("team-booking-confirmed", onConfirmed);
    socket.on("team-booking-started", onStarted);
    socket.on("team-booking-completed", onCompleted);
    socket.on("team-booking-cancelled", onCancelled);

    return () => {
      socket.off("team-booking-declined", onDeclined);
      socket.off("team-booking-confirmed", onConfirmed);
      socket.off("team-booking-started", onStarted);
      socket.off("team-booking-completed", onCompleted);
      socket.off("team-booking-cancelled", onCancelled);
    };
  }, [bookingId]);

  const handleCancel = async () => {
    try {
      await cancelBooking(bookingId);
      setLocalStatus("CANCELLED");
    } catch {
      /* toasted by hook */
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-gray-500">Loading booking details…</p>
        </div>
      </div>
    );
  }

  if (!booking && !bookingId) {
    return (
      <div className="container mx-auto p-6">
        <BackButton />
        <Card className="mt-4">
          <CardContent className="py-16 text-center">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">No booking found</h2>
            <p className="text-sm text-gray-500 mt-2">Please check your booking link.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const memberStats = teamStatusData?.memberStats;
  const assignedPorters = teamStatusData?.booking?.assignedPorters || booking?.assignedPorters || [];

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-3xl">
      <BackButton />

      {/* Status header */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Team Booking Tracking</CardTitle>
            <Badge className={STATUS_BADGE[currentStatus] || "bg-gray-100 text-gray-600"}>
              {currentStatus.replace(/_/g, " ")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress stepper */}
          <div className="relative">
            {TEAM_BOOKING_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = activeStep > index;
              const isActive = activeStep === index;
              const isFuture = activeStep < index;

              return (
                <div key={step.key} className="flex items-start gap-3 mb-4 last:mb-0">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isActive
                          ? "bg-primary text-white animate-pulse"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    {index < TEAM_BOOKING_STEPS.length - 1 && (
                      <div
                        className={`w-0.5 h-8 ${
                          isCompleted ? "bg-green-500" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                  <div className="pt-1">
                    <p
                      className={`text-sm font-medium ${
                        isFuture ? "text-gray-400" : "text-gray-900"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Member response stats (if available) */}
      {memberStats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Response Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{memberStats.acceptedCount}</p>
                <p className="text-xs text-gray-500">Accepted</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{memberStats.pendingCount}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{memberStats.declinedCount}</p>
                <p className="text-xs text-gray-500">Declined</p>
              </div>
            </div>
            <p className="text-sm text-center mt-3 text-gray-600">
              {memberStats.acceptedCount} / {memberStats.requiredCount} required
              {memberStats.quorumReached && (
                <span className="ml-2 text-green-600 font-medium">✓ Quorum reached!</span>
              )}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Booking details */}
      {booking && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Pickup</p>
              <AddressLine location={booking.pickup} dot="green" />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Drop-off</p>
              <AddressLine location={booking.drop} dot="red" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {booking.weightKg && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span>{booking.weightKg} kg</span>
                </div>
              )}
              {booking.teamSize && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{booking.teamSize} porters</span>
                </div>
              )}
              {booking.bookingDate && (
                <div className="flex items-center gap-2 text-gray-600">
                  <CalendarDays className="w-4 h-4 text-gray-400" />
                  <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                </div>
              )}
              {booking.hasVehicle && booking.vehicleType && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Truck className="w-4 h-4 text-gray-400" />
                  <span className="capitalize">{booking.vehicleType}</span>
                </div>
              )}
            </div>

            {booking.workDescription && (
              <div className="bg-gray-50 rounded p-3 text-sm text-gray-600 border">
                <span className="font-medium">Work: </span>
                {booking.workDescription}
              </div>
            )}

            {/* Assigned porters (after confirmation) */}
            {assignedPorters.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Assigned Porters:</p>
                <div className="flex flex-wrap gap-2">
                  {assignedPorters.map((ap, i) => (
                    <Badge key={ap.porterId?._id || i} variant="outline" className="text-xs">
                      {ap.porterId?.userId?.name || `Porter ${i + 1}`}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        {isCancellable && (
          <Button
            variant="destructive"
            disabled={cancelling}
            onClick={handleCancel}
          >
            {cancelling ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <XCircle className="w-4 h-4 mr-2" />
            )}
            Cancel Booking
          </Button>
        )}
        {currentStatus === "COMPLETED" && (
          <Button onClick={() => navigate("/dashboard/bookings/payment", { state: { bookingId } })}>
            <CreditCard className="w-4 h-4 mr-2" />
            Proceed to Payment
          </Button>
        )}
        <Button variant="outline" onClick={() => setIsChatOpen(true)}>
          <MessageSquare className="w-4 h-4 mr-2" />
          Chat
        </Button>
      </div>

      {/* Chat */}
      {isChatOpen && bookingId && (
        <ChatBox
          bookingId={bookingId}
          userId={booking?.userId?._id}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
};

export default TeamBookingTracking;
