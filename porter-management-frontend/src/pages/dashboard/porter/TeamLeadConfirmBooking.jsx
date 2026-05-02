/**
 * @file TeamLeadConfirmBooking.jsx
 * @description Porter dashboard page where a team owner monitors member responses
 *              after forwarding a booking, and confirms once quorum is reached.
 *
 * Receives via React Router state:
 *   { bookingId, booking }
 *
 * Polls GET /api/bookings/team/:id every 10 s (via useGetTeamBookingStatus).
 * Listens for Socket.IO events: "team-member-responded", "team-quorum-reached".
 * Actions: confirm booking, cancel booking, mark as complete.
 */

import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Users,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  MessageSquare,
  Ban,
  Navigation,
  Play,
  User,
  Phone,
  Package,
  Truck,
  CalendarDays,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BackButton } from "../../../components/common/BackButton";
import { AddressLine } from "../../../components/common/AddressLine";
import {
  useGetTeamBookingStatus,
  useTeamOwnerConfirmBooking,
  useTeamOwnerCancelBooking,
  useCompleteTeamBooking,
  useStartTeamBooking,
} from "../../../apis/hooks/porterTeamHooks";
import socket from "../../../utils/socket";
import { useAuthStore } from "@/store/auth.store";
import ChatBox from "@/components/chat/ChatBox";
import UserMap from "@/components/Map/UserMap";

// ─── Status display for each team member ─────────────────────────────────────

const MEMBER_STATUS_DISPLAY = {
  PENDING: {
    label: "Waiting",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200 animate-pulse",
    icon: Clock,
  },
  ACCEPTED: {
    label: "Accepted",
    className: "bg-green-100 text-green-700 border-green-200",
    icon: ThumbsUp,
  },
  DECLINED: {
    label: "Declined",
    className: "bg-red-100 text-red-700 border-red-200",
    icon: ThumbsDown,
  },
};

// ─────────────────────────────────────────────────────────────────────────────

const TeamLeadConfirmBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.access_token);

  const { bookingId, booking: initialBooking } = location.state || {};

  const [isChatOpen, setIsChatOpen] = useState(false);
  const socketRef = useRef(null);

  // ── React Query ────────────────────────────────────────────────────────────
  const {
    data: bookingData,
    isLoading: bookingLoading,
    refetch: refetchBooking,
  } = useGetTeamBookingStatus(bookingId);

  const { mutateAsync: confirmBooking, isPending: confirming } = useTeamOwnerConfirmBooking();
  const { mutateAsync: cancelBooking, isPending: cancelling } = useTeamOwnerCancelBooking();
  const { mutateAsync: completeTeamBooking, isPending: completing } = useCompleteTeamBooking();
  const { mutateAsync: startTeamBooking, isPending: starting } = useStartTeamBooking();

  // ── Socket.IO — instant updates when a member responds or quorum is reached ─
  useEffect(() => {
    if (!bookingId || !token) return;

    socketRef.current = socket;

    socketRef.current.on("team-member-responded", (data) => {
      if (String(data.bookingId) === String(bookingId)) {
        refetchBooking();
      }
    });

    socketRef.current.on("team-quorum-reached", (data) => {
      if (String(data.bookingId) === String(bookingId)) {
        refetchBooking();
      }
    });

    return () => {
      socketRef.current?.off("team-member-responded");
      socketRef.current?.off("team-quorum-reached");
    };
  }, [bookingId, token, refetchBooking]);

  // ── Guard ──────────────────────────────────────────────────────────────────
  if (!bookingId) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <XCircle className="w-12 h-12 text-red-400" />
        <p className="text-gray-500 font-medium">Invalid page state. No booking ID provided.</p>
        <Button variant="outline" onClick={() => navigate("/dashboard/porters")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (bookingLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-gray-500">Loading team responses…</p>
        </div>
      </div>
    );
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const currentBooking = bookingData?.booking || initialBooking;
  const currentStatus = currentBooking?.status || "PENDING_MEMBER_RESPONSE";
  const memberResponses = currentBooking?.memberResponses || [];
  const requiredMembers = currentBooking?.teamSize || 1;

  const acceptedCount = memberResponses.filter(
    (m) => m.response === "ACCEPTED"
  ).length;
  const quorumReached = acceptedCount >= requiredMembers;
  const awaitingOwnerConfirmation = currentStatus === "AWAITING_OWNER_CONFIRMATION";
  const canConfirm = quorumReached && awaitingOwnerConfirmation;
  const canCancel = ["PENDING_MEMBER_RESPONSE", "AWAITING_OWNER_CONFIRMATION"].includes(currentStatus);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    try {
      await confirmBooking(bookingId);
      refetchBooking();
    } catch {
      /* toasted by hook */
    }
  };

  const handleCancel = async () => {
    try {
      await cancelBooking(bookingId);
      navigate("/dashboard/porters");
    } catch {
      /* toasted by hook */
    }
  };

  const handleComplete = async () => {
    try {
      await completeTeamBooking(bookingId);
      refetchBooking();
    } catch {
      /* toasted by hook */
    }
  };

  const handleStart = async () => {
    try {
      await startTeamBooking(bookingId);
      refetchBooking();
    } catch {
      /* toasted by hook */
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  const statusBadgeClass = {
    PENDING_MEMBER_RESPONSE: "bg-yellow-100 text-yellow-700 border-yellow-200",
    AWAITING_OWNER_CONFIRMATION: "bg-blue-100 text-blue-700 border-blue-200",
    CONFIRMED: "bg-green-100 text-green-700 border-green-200",
    IN_PROGRESS: "bg-purple-100 text-purple-700 border-purple-200",
    COMPLETED: "bg-green-100 text-green-700 border-green-200",
  };

  return (
    <div className="container mx-auto p-4 md:p-6 flex flex-col gap-4 min-h-[calc(100vh-4rem)]">
  
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <BackButton />
        <h1 className="text-xl font-bold">Team Booking</h1>
  
        <Badge
          variant="outline"
          className={`ml-auto text-xs px-3 py-1 rounded-full border ${
            statusBadgeClass[currentStatus] || "bg-gray-100 text-gray-600"
          }`}
        >
          {currentStatus.replace(/_/g, " ")}
        </Badge>
  
        <Badge variant="outline" className="text-xs">
          #{String(bookingId).slice(-6).toUpperCase()}
        </Badge>
  
        <Button variant="outline" size="icon" onClick={() => refetchBooking()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
  
      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
  
        {/* LEFT SIDE */}
        <div className="flex flex-col gap-4">
  
          {/* Booking Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Booking Info
              </CardTitle>
            </CardHeader>
  
            <CardContent className="space-y-4 text-sm">
              {/* Customer */}
              {currentBooking?.userId && (
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                    {currentBooking.userId.name?.charAt(0) ?? "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{currentBooking.userId.name}</p>
                    {currentBooking.userId.phone && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3" />
                        {currentBooking.userId.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Locations */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-green-500" /> Pickup
                  </p>
                  <AddressLine location={currentBooking.pickup} dot="green" />
                </div>
    
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-red-500 rotate-180" /> Drop-off
                  </p>
                  <AddressLine location={currentBooking.drop} dot="red" />
                </div>
              </div>
  
              <Separator />
  
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {/* Weight & Size */}
                <div>
                  <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                    <Package className="h-3 w-3" /> Weight
                  </p>
                  <p className="font-semibold">{currentBooking.weightKg || currentBooking.weight || "—"} kg</p>
                </div>
  
                <div>
                  <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                    <Users className="h-3 w-3" /> Team Size
                  </p>
                  <p className="font-semibold">{requiredMembers} porters</p>
                </div>

                {/* Vehicle */}
                {currentBooking.hasVehicle && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                      <Truck className="h-3 w-3" /> Vehicle
                    </p>
                    <p className="font-semibold capitalize">{currentBooking.vehicleType || "Yes"}</p>
                  </div>
                )}

                {/* Distance/Time */}
                {currentBooking.distance && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                      <Navigation className="h-3 w-3" /> Distance
                    </p>
                    <p className="font-semibold">{currentBooking.distance} km</p>
                  </div>
                )}

                {/* Date/Time */}
                {currentBooking.bookingDate && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" /> Schedule
                    </p>
                    <p className="font-semibold">
                      {new Date(currentBooking.bookingDate).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                      {currentBooking.bookingTime ? ` @ ${currentBooking.bookingTime}` : ""}
                    </p>
                  </div>
                )}

                {/* Fare */}
                {currentBooking.fare && (
                  <div className="col-span-2 bg-green-50 p-2 rounded-lg border border-green-100 flex items-center justify-between mt-1">
                    <span className="text-xs font-semibold text-green-800 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" /> Total Fare
                    </span>
                    <span className="font-bold text-green-700">NPR {currentBooking.fare}</span>
                  </div>
                )}
              </div>
  
              {currentBooking.requirements && (
                <div className="bg-orange-50/50 p-3 rounded-lg text-xs border border-orange-100 mt-2">
                  <span className="font-semibold text-orange-800 block mb-1">Special Requirements:</span>
                  <span className="text-gray-700">{currentBooking.requirements}</span>
                </div>
              )}
            </CardContent>
          </Card>
  

        </div>
  
        {/* RIGHT SIDE */}
        <div className="lg:col-span-2 flex flex-col">
  
          {/* Map Area */}
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardContent className="flex-1 p-0 min-h-[400px]">
              <UserMap
                showSidebar={false}
                pickupLocation={currentBooking?.pickup}
                dropoffLocation={currentBooking?.drop}
              />
            </CardContent>
  
            {/* ACTIONS */}
            <CardFooter className="border-t pt-4 flex flex-col gap-2">
  
              {/* Confirm */}
              {canConfirm && (
                <Button
                  className="w-full h-11 font-semibold"
                  onClick={handleConfirm}
                  disabled={confirming}
                >
                  {confirming ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2" />}
                  Confirm Booking
                </Button>
              )}
  
              {/* Action Buttons: Start and Complete */}
              {(currentStatus === "CONFIRMED" || currentStatus === "IN_PROGRESS") && (
                <div className="flex flex-col gap-2 w-full">
                  <Button
                    className={`w-full ${currentStatus === "IN_PROGRESS" ? "bg-gray-100 text-gray-500 hover:bg-gray-100 border border-gray-200" : "bg-green-600 hover:bg-green-700"}`}
                    onClick={handleStart}
                    disabled={starting || currentStatus === "IN_PROGRESS"}
                    variant={currentStatus === "IN_PROGRESS" ? "outline" : "default"}
                  >
                    {starting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {currentStatus === "IN_PROGRESS" ? "Work Started" : "Start Work"}
                  </Button>

                  <Button
                    className={`w-full ${currentStatus === "CONFIRMED" ? "bg-gray-100 text-gray-500 hover:bg-gray-100 border border-gray-200" : "bg-green-600 hover:bg-green-700"}`}
                    onClick={handleComplete}
                    disabled={completing || currentStatus === "CONFIRMED"}
                    variant={currentStatus === "CONFIRMED" ? "outline" : "default"}
                  >
                    {completing ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                    Complete Work
                  </Button>
                </div>
              )}
  
              {/* Cancel */}
              {canCancel && (
                <Button
                  variant="outline"
                  className="w-full text-red-600"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Ban className="w-4 h-4 mr-2" />}
                  Cancel Booking
                </Button>
              )}

              {/* Completed State Info */}
              {currentStatus === "COMPLETED" && (
                <div className="bg-green-50 text-green-800 p-3 rounded-lg border border-green-200 text-center text-sm">
                  <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-green-600" />
                  <p className="font-semibold">Work Completed</p>
                  <p className="text-xs text-green-700 mt-1">Waiting for customer to process payment.</p>
                </div>
              )}
  
              {/* Chat */}
              <Button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="w-full"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </Button>
  
            </CardFooter>
          </Card>
        </div>
      </div>
  
      {/* Chat */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6">
          <ChatBox
            bookingId={bookingId}
            currentUserModel="PorterTeam"
            onClose={() => setIsChatOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default TeamLeadConfirmBooking;
