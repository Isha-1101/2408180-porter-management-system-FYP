/**
 * @file TeamOwnerDashboard.jsx
 * @description Dedicated dashboard for porter team owners (role="owner").
 *
 * Shows incoming team pre-booking requests (status=WAITING_TEAM_LEAD).
 * Receives real-time notifications via SSE ("new-booking-request") and socket.
 *
 * Team owner can:
 *   - Accept → auto-notifies ALL team workers, navigates to TeamLeadConfirmBooking.
 *   - Reject → marks their request as rejected.
 */

import React, { useEffect, useRef, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Users,
  Package,
  Clock,
  CalendarDays,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
  MapPin,
} from "lucide-react";
import { usePorter } from "../../../hooks/porter/use-porter";
import { useGetPorterBookings } from "../../../apis/hooks/porterBookingsHooks";
import {
  useTeamLeadAcceptBooking,
  useTeamLeadRejectBooking,
} from "../../../apis/hooks/porterTeamHooks";
import socket from "../../../utils/socket";
import { createSSEConnection } from "../../../utils/sse";
import { useAuthStore } from "@/store/auth.store";
import { AddressLine } from "../../../components/common/AddressLine";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// ─────────────────────────────────────────────────────────────────────────────

export default function TeamOwnerDashboard() {
  const { porter, isLoading: porterLoading } = usePorter();
  const token = useAuthStore((s) => s.access_token);
  const navigate = useNavigate();
  const sseRef = useRef(null);

  const [liveRequests, setLiveRequests] = useState([]);

  // ── API data ────────────────────────────────────────────────────────────────
  const {
    data: apiData,
    isLoading: bookingsLoading,
    refetch,
  } = useGetPorterBookings();

  // ── Mutations ────────────────────────────────────────────────────────────────
  const { mutateAsync: teamLeadAccept, isPending: accepting } =
    useTeamLeadAcceptBooking();
  const { mutateAsync: teamLeadReject, isPending: rejecting } =
    useTeamLeadRejectBooking();

  // Merge live socket requests with API pending requests
  const apiRequests = apiData?.pendingRequests || [];
  const teamLeadRequests = [
    ...liveRequests.filter(
      (lr) => !apiRequests.some((ar) => ar.bookingId?._id === lr.bookingId),
    ),
    ...apiRequests.filter(
      (r) => r.notificationType === "TEAM_LEAD" || r.isTeamLead === true,
    ),
  ];

  // ── Socket location reporting ─────────────────────────────────────────────
  useEffect(() => {
    if (porter?._id) {
      socket.emit("join-porter-room", porter._id);
    }
  }, [porter?._id]);

  // ── SSE + Socket listening ─────────────────────────────────────────────────
  useEffect(() => {
    const onBookingRequest = (data) => {
      if (data.notificationType !== "TEAM_LEAD" && !data.isTeamLead) return;
      setLiveRequests((prev) => {
        const exists = prev.some(
          (r) => r.bookingId === data.bookingId?.toString(),
        );
        if (exists) return prev;
        return [{ ...data, _isLive: true }, ...prev];
      });
      refetch();
    };

    socket.on("booking-request", onBookingRequest);

    sseRef.current = createSSEConnection(
      "/bookings/sse/porter",
      {
        "new-booking-request": (data) => {
          if (data.notificationType !== "TEAM_LEAD" && !data.isTeamLead) return;
          setLiveRequests((prev) => {
            const exists = prev.some(
              (r) => r.bookingId === String(data.bookingId),
            );
            if (exists) return prev;
            return [{ ...data, _isLive: true, _sse: true }, ...prev];
          });
          refetch();
        },
      },
      token,
    );

    return () => {
      socket.off("booking-request", onBookingRequest);
      sseRef.current?.close();
    };
  }, [refetch, token]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAccept = async (bookingId) => {
    try {
      const res = await teamLeadAccept(bookingId);
      const bookingData = res?.data?.booking;
      const requiredMembers =
        res?.data?.requiredMembers || bookingData?.teamSize || 1;
      navigate("/dashboard/porters/team-lead/confirm-booking", {
        state: {
          bookingId: bookingData?._id || bookingId,
          requiredMembers,
          booking: bookingData,
        },
      });
    } catch {
      /* toasted by hook */
    }
  };

  const handleReject = async (bookingId) => {
    try {
      await teamLeadReject(bookingId);
      setLiveRequests((prev) => prev.filter((r) => r.bookingId !== bookingId));
      refetch();
    } catch {
      /* toasted by hook */
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (porterLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-3">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-gray-600">Loading Team Owner Dashboard…</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Team Owner Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            You are viewing pre-booking requests for your team.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${bookingsLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Team info banner */}
      {porter && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-3 px-4 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                {String(porter?.user?.name || "T")
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {porter?.user?.name || "Team Owner"}
                </p>
                <p className="text-xs text-gray-500">Team Owner</p>
              </div>
            </div>
            <Separator orientation="vertical" className="h-8 hidden sm:block" />
            <div className="text-xs text-gray-600">
              <span className="font-medium">Team ID:</span>{" "}
              <span className="font-mono">
                #{String(porter?.teamId).slice(-6).toUpperCase()}
              </span>
            </div>
            <Badge className="bg-green-100 text-green-700 border-green-200 ml-auto">
              Online
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Booking requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Pre-Booking Requests
              {teamLeadRequests.length > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {teamLeadRequests.length} pending
                </Badge>
              )}
            </CardTitle>
          </div>
          <CardDescription>
            Accept a request to auto-notify all your team workers.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-[calc(100vh-26rem)] min-h-[300px] pr-2">
            {bookingsLoading && teamLeadRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                <p className="text-gray-500">Loading requests…</p>
              </div>
            ) : teamLeadRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900">
                  No pending requests
                </p>
                <p className="text-xs text-gray-500">
                  New pre-booking requests for your team will appear here in
                  real time.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {teamLeadRequests.map((request) => {
                  const isLive = request._isLive;
                  const bookingId = isLive
                    ? request.bookingId
                    : request.bookingId?._id || request._id;
                  const pickup = isLive
                    ? request.pickup
                    : request.bookingId?.pickup;
                  const drop = isLive ? request.drop : request.bookingId?.drop;
                  const weightKg = isLive
                    ? request.weightKg
                    : request.bookingId?.weightKg;
                  const teamSize = isLive
                    ? request.teamSize
                    : request.bookingId?.teamSize;
                  const requirements = isLive
                    ? request.requirements
                    : request.bookingId?.requirements;
                  const bookingDate = isLive
                    ? request.bookingDate
                    : request.bookingId?.bookingDate;
                  const bookingTime = isLive
                    ? request.bookingTime
                    : request.bookingId?.bookingTime;
                  const distanceKm = request.distanceKm;

                  return (
                    <Card
                      key={bookingId || request._id}
                      className="border-l-4 border-l-purple-500 hover:shadow-md transition-all"
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {isLive && (
                              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                                🔴 Live
                              </Badge>
                            )}
                            <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                              <Users className="w-3 h-3 mr-1" />
                              Pre-Booking Request
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-xs font-mono"
                            >
                              #{String(bookingId).slice(-6).toUpperCase()}
                            </Badge>
                          </div>
                          {distanceKm != null && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="h-3 w-3" />
                              {Number(distanceKm).toFixed(1)} km away
                            </div>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="p-4 pt-2 space-y-3">
                        {/* Locations */}
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Pickup</p>
                            <AddressLine location={pickup} dot="green" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Drop-off
                            </p>
                            <AddressLine location={drop} dot="red" />
                          </div>
                        </div>

                        {/* Details row */}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          {weightKg && (
                            <div className="flex items-center gap-1">
                              <Package className="h-4 w-4 text-gray-400" />
                              <span>{weightKg} kg</span>
                            </div>
                          )}
                          {teamSize && (
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span>{teamSize} workers needed</span>
                            </div>
                          )}
                          {bookingDate && (
                            <div className="flex items-center gap-1">
                              <CalendarDays className="h-4 w-4 text-gray-400" />
                              <span>
                                {new Date(bookingDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {bookingTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span>{bookingTime}</span>
                            </div>
                          )}
                        </div>

                        {requirements && (
                          <div className="bg-purple-50 rounded-lg p-2 text-xs text-gray-600 border border-purple-100">
                            <span className="font-medium">Requirements: </span>
                            {requirements}
                          </div>
                        )}
                      </CardContent>

                      <CardFooter className="p-4 pt-0">
                        <div className="flex gap-2 w-full justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-28"
                            disabled={rejecting || accepting}
                            onClick={() => handleReject(bookingId)}
                          >
                            {rejecting ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <XCircle className="mr-1 h-3 w-3" />
                                Decline
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            className="w-40 bg-purple-600 hover:bg-purple-700"
                            disabled={accepting || rejecting}
                            onClick={() => handleAccept(bookingId)}
                          >
                            {accepting ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Accept & Notify Team
                              </>
                            )}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
