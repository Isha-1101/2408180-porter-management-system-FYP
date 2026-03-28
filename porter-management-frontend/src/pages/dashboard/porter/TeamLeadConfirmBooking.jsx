/**
 * @file TeamLeadConfirmBooking.jsx
 * @description Porter dashboard page where a team owner monitors live
 *              accept/reject responses from their auto-notified team workers
 *              and confirms the booking once enough have accepted.
 *
 * Receives via React Router state:
 *   { bookingId, requiredMembers, booking }
 *
 * Polls GET /api/bookings/team/:id/selection every 8 s (via useGetTeamBookingSelection).
 * Also receives SSE "porter-responded" events for instant updates.
 * Calls POST /api/bookings/team/:id/team-lead/confirm on confirmation.
 * Calls POST /api/bookings/team/:id/complete on completion.
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
import { useGetBookingById } from "../../../apis/hooks/porterBookingsHooks";
import {
  useTeamLeadConfirmBooking,
  useCompleteTeamBooking,
  useGetTeamBookingSelection,
} from "../../../apis/hooks/porterTeamHooks";
import { createSSEConnection } from "../../../utils/sse";
import { useAuthStore } from "@/store/auth.store";
import ChatBox from "@/components/chat/ChatBox";

// ─── Status display for each team member ─────────────────────────────────────

const PORTER_STATUS_DISPLAY = {
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
  REJECTED: {
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

  const {
    bookingId,
    requiredMembers: initialRequired = 1,
    booking: initialBooking,
  } = location.state || {};

  const [isChatOpen, setIsChatOpen] = useState(false);
  const sseRef = useRef(null);

  // ── React Query ────────────────────────────────────────────────────────────
  const { data: booking, isLoading: bookingLoading } = useGetBookingById(bookingId);

  const {
    data: selectionData,
    isLoading: selectionLoading,
    refetch: refetchSelection,
  } = useGetTeamBookingSelection(bookingId);

  const { mutateAsync: confirmBooking, isPending: confirming } = useTeamLeadConfirmBooking();
  const { mutateAsync: completeTeamBooking, isPending: completing } = useCompleteTeamBooking();

  // ── SSE — get instant updates when a porter responds ──────────────────────
  useEffect(() => {
    if (!bookingId || !token) return;

    sseRef.current = createSSEConnection(
      "/bookings/sse/porter",
      {
        "porter-responded": () => refetchSelection(),
        "booking-status-update": (data) => {
          if (String(data.bookingId) === String(bookingId)) refetchSelection();
        },
      },
      token,
    );

    return () => sseRef.current?.close();
  }, [bookingId, token, refetchSelection]);

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

  if (selectionLoading || bookingLoading) {
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
  const currentStatus = currentBooking?.status || "WAITING_PORTER_RESPONSE";
  const requiredMembers = selectionData?.requiredMembers || initialRequired;
  const acceptedCount = selectionData?.acceptedCount ?? 0;
  const rejectedCount = selectionData?.rejectedCount ?? 0;
  const pendingCount = selectionData?.pendingCount ?? 0;
  const canConfirm = selectionData?.canConfirm ?? false;
  const selectedPorters = selectionData?.selection?.selectedPorters || [];

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    try {
      await confirmBooking(bookingId);
      refetchSelection();
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

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto p-4 md:p-6 min-h-[calc(100vh-4rem)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <BackButton />
        <div>
          <h1 className="text-xl font-bold">Team Booking — Awaiting Responses</h1>
          <p className="text-sm text-gray-500">
            Workers have been automatically notified. Monitor their responses below.
          </p>
        </div>
        <Badge variant="outline" className="ml-auto text-xs px-3 py-1 rounded-full">
          {currentStatus.replace(/_/g, " ")}
        </Badge>
        <Badge variant="outline" className="text-xs">
          #{String(bookingId).slice(-6).toUpperCase()}
        </Badge>
        <Button variant="outline" size="icon" onClick={() => refetchSelection()}>
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
              <div className="flex justify-between">
                <span className="text-gray-500">Weight</span>
                <span className="font-semibold">{currentBooking?.weightKg} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Required Members</span>
                <span className="font-semibold">{requiredMembers}</span>
              </div>
              {currentBooking?.bookingDate && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-semibold">
                    {new Date(currentBooking.bookingDate).toLocaleDateString()}
                  </span>
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
                  <p className="text-xs text-yellow-600 mt-1">Pending</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                  <p className="text-2xl font-bold text-red-700">{rejectedCount}</p>
                  <p className="text-xs text-red-600 mt-1">Declined</p>
                </div>
              </div>
              {canConfirm && (
                <p className="text-xs text-green-700 font-medium text-center bg-green-50 p-2 rounded-lg">
                  ✓ Enough members accepted — ready to confirm!
                </p>
              )}
              {!canConfirm && currentStatus === "WAITING_PORTER_RESPONSE" && (
                <p className="text-xs text-gray-500 text-center">
                  Need {Math.max(0, requiredMembers - acceptedCount)} more acceptance(s)
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Porter response list + action */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Team Members ({selectedPorters.length})
              </CardTitle>
              <CardDescription>
                Live updates via SSE + polling every 8 seconds.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {selectedPorters.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 space-y-2">
                  <Users className="w-10 h-10 opacity-30" />
                  <p className="font-medium text-sm">Loading team responses…</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedPorters.map((entry, idx) => {
                    const porter = entry.porterId;
                    const status = entry.status || "PENDING";
                    const display = PORTER_STATUS_DISPLAY[status] || PORTER_STATUS_DISPLAY.PENDING;
                    const Icon = display.icon;
                    const name =
                      porter?.userId?.name ||
                      `Porter #${String(porter?._id || porter).slice(-4).toUpperCase()}`;
                    const phone = porter?.userId?.phone;

                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 transition-all"
                      >
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                          {phone && <p className="text-xs text-gray-500">{phone}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          {porter?.maxWeightKg && (
                            <span className="text-xs text-gray-400">
                              up to {porter.maxWeightKg} kg
                            </span>
                          )}
                          <Badge
                            variant="outline"
                            className={`flex items-center gap-1 text-xs ${display.className}`}
                          >
                            <Icon className="w-3 h-3" />
                            {display.label}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>

            {/* Action footer */}
            <CardFooter className="border-t pt-4 flex-col gap-3">
              {/* WAITING_PORTER_RESPONSE: confirm once enough accepted */}
              {currentStatus === "WAITING_PORTER_RESPONSE" && (
                <div className="flex gap-2 w-full">
                  <Button
                    className="flex-1 h-11 font-semibold"
                    disabled={!canConfirm || confirming}
                    onClick={handleConfirm}
                  >
                    {confirming ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    {confirming
                      ? "Confirming…"
                      : canConfirm
                        ? "Confirm Booking"
                        : `Need ${Math.max(0, requiredMembers - acceptedCount)} more acceptance(s)`}
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

              {/* CONFIRMED: show completion button */}
              {currentStatus === "CONFIRMED" && (
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
                    {completing ? "Completing…" : "Mark as Completed"}
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
