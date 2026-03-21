/**
 * @file TeamLeadConfirmBooking.jsx
 * @description Porter dashboard page where a team lead:
 *   1. Sees live acceptance statuses of the selected team members.
 *   2. Once enough members accepted → confirms the booking.
 *   3. After confirmed → marks booking as completed.
 *
 * Receives via React Router state:
 *   { bookingId, selectedPorterIds, requiredMembers, booking }
 *
 * Polls GET /api/bookings/:id every 10 s to get fresh porter statuses.
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
} from "../../../apis/hooks/porterTeamHooks";
import { createSSEConnection } from "../../../utils/sse";
import { useAuthStore } from "@/store/auth.store";

// ─── Status badge helpers ─────────────────────────────────────────────────────

/** Map per-porter selection status to display props */
const PORTER_STATUS_DISPLAY = {
  PENDING: {
    label: "Waiting",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
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
    selectedPorterIds = [],
    requiredMembers = 1,
  } = location.state || {};

  const sseRef = useRef(null);

  // ── React Query ────────────────────────────────────────────────────────────
  const {
    data: booking,
    isLoading,
    refetch,
  } = useGetBookingById(bookingId);

  const { mutateAsync: confirmBooking, isPending: confirming } =
    useTeamLeadConfirmBooking();
  const { mutateAsync: completeTeamBooking, isPending: completing } =
    useCompleteTeamBooking();

  // ── SSE — listen for porter response events ────────────────────────────────
  useEffect(() => {
    if (!bookingId || !token) return;

    sseRef.current = createSSEConnection(
      "/bookings/sse/porter",
      {
        // Team lead gets notified when a porter responds
        "porter-responded": () => refetch(),
        "booking-status-update": (data) => {
          if (String(data.bookingId) === String(bookingId)) refetch();
        },
      },
      token,
    );

    return () => sseRef.current?.close();
  }, [bookingId, token, refetch]);

  // ── Guard: missing state ───────────────────────────────────────────────────
  if (!bookingId) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <XCircle className="w-12 h-12 text-red-400" />
        <p className="text-gray-500 font-medium">Invalid page state.</p>
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard/porters")}
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-gray-500">Loading booking…</p>
        </div>
      </div>
    );
  }

  // ── Derive porter statuses from TeamBookingSelection (populated on booking) ──
  // The GET /api/bookings/:id response includes the full booking doc.
  // We read `booking.assignedPorters` after confirmation, or the selection
  // doc might not be directly on the booking — so we display based on what
  // the API returns and fall back to selected IDs with pending status.
  const currentStatus = booking?.status || "WAITING_PORTER_RESPONSE";

  // Build a display list from selectedPorterIds; try to match with
  // assignedPorters data from the confirmed booking if available
  const assignedPorters = booking?.assignedPorters || [];

  /**
   * Build per-porter display rows.
   * We merge selectedPorterIds with the assignedPorters array (post-confirm).
   */
  const porterRows = selectedPorterIds.map((porterId) => {
    const assigned = assignedPorters.find(
      (p) => String(p.porterId) === String(porterId),
    );
    // Before confirmation the API won't expose per-member status on this
    // endpoint, so we show PENDING for all while waiting.
    const status =
      currentStatus === "WAITING_PORTER_RESPONSE"
        ? "PENDING"
        : assigned
          ? "ACCEPTED"
          : "PENDING";
    return { porterId, status };
  });

  const acceptedCount = porterRows.filter((p) => p.status === "ACCEPTED").length;
  const canConfirm =
    currentStatus === "WAITING_PORTER_RESPONSE" && acceptedCount >= requiredMembers;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    try {
      await confirmBooking(bookingId);
      refetch();
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
          <h1 className="text-xl font-bold">Team Booking Confirmation</h1>
          <p className="text-sm text-gray-500">
            Waiting for porters to respond
          </p>
        </div>
        <Badge
          variant="outline"
          className="ml-auto text-xs px-3 py-1 rounded-full"
        >
          {currentStatus.replace(/_/g, " ")}
        </Badge>
        <Badge variant="outline" className="text-xs">
          #{String(bookingId).slice(-6).toUpperCase()}
        </Badge>
        {/* Manual refresh */}
        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Booking summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {booking?.pickup && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Pickup</p>
                  <AddressLine location={booking.pickup} dot="green" />
                </div>
              )}
              {booking?.drop && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Drop-off</p>
                  <AddressLine location={booking.drop} dot="red" />
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-500">Weight</span>
                <span className="font-semibold">{booking?.weightKg} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Required Porters</span>
                <span className="font-semibold">{requiredMembers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Accepted So Far</span>
                <span className={`font-semibold ${acceptedCount >= requiredMembers ? "text-green-600" : "text-orange-500"}`}>
                  {acceptedCount} / {requiredMembers}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Porter response list */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Selected Porters ({selectedPorterIds.length})
              </CardTitle>
              <CardDescription>
                Auto-refreshes via SSE when a porter responds.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {porterRows.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  No porters selected.
                </p>
              ) : (
                <div className="space-y-3">
                  {porterRows.map(({ porterId, status }) => {
                    const display =
                      PORTER_STATUS_DISPLAY[status] ||
                      PORTER_STATUS_DISPLAY.PENDING;
                    const Icon = display.icon;
                    return (
                      <div
                        key={porterId}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50"
                      >
                        {/* Avatar placeholder */}
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          P
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            Porter #{String(porterId).slice(-6).toUpperCase()}
                          </p>
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
              {/* WAITING_PORTER_RESPONSE: confirm once enough accepted */}
              {currentStatus === "WAITING_PORTER_RESPONSE" && (
                <Button
                  className="w-full h-11 font-semibold"
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
                      ? "Confirm Team Booking"
                      : `Waiting for ${requiredMembers - acceptedCount} more response${requiredMembers - acceptedCount !== 1 ? "s" : ""}…`}
                </Button>
              )}

              {/* CONFIRMED: show completion button */}
              {currentStatus === "CONFIRMED" && (
                <Button
                  className="w-full h-11 font-semibold bg-green-600 hover:bg-green-700"
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
              )}

              {/* COMPLETED state */}
              {currentStatus === "COMPLETED" && (
                <div className="w-full text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="font-semibold text-green-700">
                    Booking Completed!
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => navigate("/dashboard/porters")}
                  >
                    Back to Dashboard
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeamLeadConfirmBooking;
