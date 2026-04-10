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
  Play,
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
    data: booking,
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
  const currentBooking = booking || initialBooking;
  const currentStatus = currentBooking?.status || "PENDING_MEMBER_RESPONSE";
  const memberResponses = currentBooking?.memberResponses || [];
  const requiredMembers = currentBooking?.teamSize || 1;

  const acceptedCount = memberResponses.filter(
    (m) => m.response === "ACCEPTED"
  ).length;
  const declinedCount = memberResponses.filter(
    (m) => m.response === "DECLINED"
  ).length;
  const pendingCount = memberResponses.filter(
    (m) => m.response === "PENDING"
  ).length;

  const quorumReached = acceptedCount >= requiredMembers;
  const awaitingOwnerConfirmation = currentStatus === "AWAITING_OWNER_CONFIRMATION";
  const canConfirm = quorumReached && awaitingOwnerConfirmation;
  const canCancel = ["PENDING_MEMBER_RESPONSE", "AWAITING_OWNER_CONFIRMATION"].includes(currentStatus);
  const canComplete = currentStatus === "IN_PROGRESS";

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
      navigate("/dashboard/porters");
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
  return (
    <div className="container mx-auto p-4 md:p-6 min-h-[calc(100vh-4rem)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <BackButton />
        <div>
          <h1 className="text-xl font-bold">Team Booking — Monitor Responses</h1>
          <p className="text-sm text-gray-500">
            Track your team members&apos; responses and confirm once quorum is reached.
          </p>
        </div>
        <Badge variant="outline" className="ml-auto text-xs px-3 py-1 rounded-full">
          {currentStatus.replace(/_/g, " ")}
        </Badge>
        <Badge variant="outline" className="text-xs">
          #{String(bookingId).slice(-6).toUpperCase()}
        </Badge>
        <Button variant="outline" size="icon" onClick={() => refetchBooking()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Booking summary + progress counters */}
        <div className="lg:col-span-1 space-y-4">
          {/* Booking Details */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {currentBooking?.pickup && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Pickup</p>
                  <AddressLine location={currentBooking.pickup} dot="green" />
                </div>
              )}
              {currentBooking?.drop && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Drop-off</p>
                  <AddressLine location={currentBooking.drop} dot="red" />
                </div>
              )}
              <Separator />
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="flex justify-between col-span-2 sm:col-span-1">
                  <span className="text-gray-500">Weight</span>
                  <span className="font-semibold">{currentBooking?.weightKg} kg</span>
                </div>
                <div className="flex justify-between col-span-2 sm:col-span-1">
                  <span className="text-gray-500">Team Size</span>
                  <span className="font-semibold">{requiredMembers}</span>
                </div>
                {currentBooking?.purpose_of_booking && (
                  <div className="flex justify-between col-span-2">
                    <span className="text-gray-500">Purpose</span>
                    <span className="font-semibold capitalize">
                      {currentBooking.purpose_of_booking === "delivery" ? "📦" : "🚚"}{" "}
                      {currentBooking.purpose_of_booking}
                    </span>
                  </div>
                )}
                {currentBooking?.bookingDate && (
                  <div className="flex justify-between col-span-2 sm:col-span-1">
                    <span className="text-gray-500">Date</span>
                    <span className="font-semibold">
                      {new Date(currentBooking.bookingDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {currentBooking?.bookingTime && (
                  <div className="flex justify-between col-span-2 sm:col-span-1">
                    <span className="text-gray-500">Time</span>
                    <span className="font-semibold">{currentBooking.bookingTime}</span>
                  </div>
                )}
                {currentBooking?.hasVehicle && currentBooking?.vehicleType && (
                  <div className="flex justify-between col-span-2">
                    <span className="text-gray-500">Vehicle</span>
                    <span className="font-semibold capitalize">
                      {currentBooking.vehicleType}
                      {currentBooking.numberOfVehicles
                        ? ` ×${currentBooking.numberOfVehicles}`
                        : ""}
                    </span>
                  </div>
                )}
                {currentBooking?.noOfFloors > 0 && (
                  <div className="flex justify-between col-span-2 sm:col-span-1">
                    <span className="text-gray-500">Floors</span>
                    <span className="font-semibold">{currentBooking.noOfFloors}</span>
                  </div>
                )}
                {currentBooking?.no_of_trips > 0 && (
                  <div className="flex justify-between col-span-2 sm:col-span-1">
                    <span className="text-gray-500">Trips</span>
                    <span className="font-semibold">{currentBooking.no_of_trips}</span>
                  </div>
                )}
              </div>
              {currentBooking?.hasLift && (
                <p className="text-xs text-green-700 bg-green-50 px-2 py-1.5 rounded border border-green-100">
                  ✓ Elevator / lift available at pickup
                </p>
              )}
              {currentBooking?.requirements && (
                <div className="bg-gray-50 p-2 rounded-lg text-xs text-gray-600 border">
                  <span className="font-medium">Requirements: </span>
                  {currentBooking.requirements}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Response Counters */}
          <Card>
            <CardContent className="pt-4 space-y-3">
              <p className="text-sm font-semibold text-gray-700 mb-2">Response Summary</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                  <p className="text-2xl font-bold text-green-700">{acceptedCount}</p>
                  <p className="text-xs text-green-600 mt-1">Accepted</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
                  <p className="text-2xl font-bold text-yellow-700">{pendingCount}</p>
                  <p className="text-xs text-yellow-600 mt-1">Waiting</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                  <p className="text-2xl font-bold text-red-700">{declinedCount}</p>
                  <p className="text-xs text-red-600 mt-1">Declined</p>
                </div>
              </div>
              <div className="bg-primary/5 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-primary">
                  {acceptedCount} / {requiredMembers}
                </p>
                <p className="text-xs text-gray-500 mt-1">Accepted out of required</p>
              </div>
              {quorumReached && (
                <p className="text-xs text-green-700 font-medium text-center bg-green-50 p-2 rounded-lg">
                  ✓ Quorum reached — ready to confirm!
                </p>
              )}
              {!quorumReached && currentStatus === "PENDING_MEMBER_RESPONSE" && (
                <p className="text-xs text-gray-500 text-center">
                  Need {Math.max(0, requiredMembers - acceptedCount)} more acceptance(s)
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Member response list + actions */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Team Members ({memberResponses.length})
              </CardTitle>
              <CardDescription>
                Live updates via Socket.IO + polling every 10 seconds.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {memberResponses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 space-y-2">
                  <Users className="w-10 h-10 opacity-30" />
                  <p className="font-medium text-sm">Waiting for team member responses…</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {memberResponses.map((entry, idx) => {
                    const status = entry.response || "PENDING";
                    const display = MEMBER_STATUS_DISPLAY[status] || MEMBER_STATUS_DISPLAY.PENDING;
                    const Icon = display.icon;
                    const porter = entry.porterId;
                    const name =
                      porter?.userId?.name ||
                      `Porter #${String(porter?._id || idx).slice(-4).toUpperCase()}`;
                    const phone = porter?.userId?.phone;

                    return (
                      <div
                        key={entry._id || idx}
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 transition-all"
                      >
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                          {phone && <p className="text-xs text-gray-500">{phone}</p>}
                          {entry.respondedAt && status !== "PENDING" && (
                            <p className="text-xs text-gray-400">
                              {new Date(entry.respondedAt).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={`flex items-center gap-1 text-xs ${display.className}`}
                        >
                          <Icon className="w-3 h-3" />
                          {display.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>

            {/* Action footer */}
            <CardFooter className="border-t pt-4 flex-col gap-3">
              {/* PENDING_MEMBER_RESPONSE: waiting for quorum, can cancel */}
              {currentStatus === "PENDING_MEMBER_RESPONSE" && (
                <div className="flex gap-2 w-full">
                  <Button
                    className="flex-1 h-11 font-semibold bg-red-600 hover:bg-red-700"
                    disabled={cancelling}
                    onClick={handleCancel}
                  >
                    {cancelling ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Ban className="w-4 h-4 mr-2" />
                    )}
                    {cancelling ? "Cancelling…" : "Cancel Booking"}
                  </Button>
                  {bookingId && (
                    <Button
                      onClick={() => setIsChatOpen(!isChatOpen)}
                      className="h-11 w-11 px-0 shrink-0"
                      title="Chat with user"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              )}

              {/* AWAITING_OWNER_CONFIRMATION: quorum reached, can confirm or cancel */}
              {currentStatus === "AWAITING_OWNER_CONFIRMATION" && (
                <div className="flex gap-2 w-full">
                  <Button
                    className="flex-1 h-11 font-semibold"
                    disabled={confirming}
                    onClick={handleConfirm}
                  >
                    {confirming ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    {confirming ? "Confirming…" : "Confirm Booking"}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 font-semibold text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={cancelling}
                    onClick={handleCancel}
                  >
                    {cancelling ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Ban className="w-4 h-4 mr-2" />
                    )}
                    Cancel
                  </Button>
                  {bookingId && (
                    <Button
                      onClick={() => setIsChatOpen(!isChatOpen)}
                      className="h-11 w-11 px-0 shrink-0"
                      title="Chat with user"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              )}

              {/* CONFIRMED: waiting for work to start */}
              {currentStatus === "CONFIRMED" && (
                <div className="flex gap-2 w-full">
                  <Button
                    className="flex-1 h-11 font-semibold bg-green-600 hover:bg-green-700"
                    disabled={starting}
                    onClick={handleStart}
                  >
                    {starting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    {starting ? "Starting…" : "Start Job"}
                  </Button>
                  <Button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className="h-11 w-11 px-0 shrink-0"
                    title="Chat with user"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </Button>
                </div>
              )}

              {/* IN_PROGRESS: show completion button */}
              {currentStatus === "IN_PROGRESS" && (
                <div className="flex gap-2 w-full">
                  <Button
                    className="flex-1 h-11 font-semibold bg-green-600 hover:bg-green-700"
                    disabled={completing}
                    onClick={handleComplete}
                  >
                    {completing ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    {completing ? "Completing…" : "Mark as Complete"}
                  </Button>
                  <Button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className="h-11 w-11 px-0 shrink-0"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </Button>
                </div>
              )}

              {/* COMPLETED state */}
              {currentStatus === "COMPLETED" && (
                <div className="w-full text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="font-semibold text-green-700">Booking Completed!</p>
                  <Button className="w-full" onClick={() => navigate("/dashboard/porters")}>
                    Back to Dashboard
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Floating Chat Box */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
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
