/**
 * @file TeamOwnerDashboard.jsx
 * @description Dedicated dashboard for porter team owners (role="owner").
 *
 * Shows incoming team booking requests (status=PENDING_TEAM_REVIEW).
 * Receives real-time notifications via Socket.io ("team-booking-request").
 *
 * Team owner can:
 *   - Forward to Team → notifies all team members, status → PENDING_MEMBER_RESPONSE
 *   - Decline → status → DECLINED, user notified
 *   - View "My Schedule" tab for upcoming bookings
 *   - View "My Team" tab for member management
 */

import React, { useEffect, useRef, useState } from "react";
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
  Truck,
  Route,
  Layers,
  Calendar,
  Send,
  Play,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  Ban,
} from "lucide-react";
import { usePorter } from "../../../hooks/porter/use-porter";
import { useGetPorterBookings } from "../../../apis/hooks/porterBookingsHooks";
import {
  useTeamOwnerReviewBooking,
  useGetTeamDashboard,
  useGetTeamPendingBookings,
  useGetTeamQuorumReachedBookings,
  useStartTeamBooking,
  useGetTeamBookingHistory,
  useTeamOwnerConfirmBooking,
  useTeamOwnerCancelBooking,
} from "../../../apis/hooks/porterTeamHooks";
import socket from "../../../utils/socket";
import { createSSEConnection } from "../../../utils/sse";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "react-hot-toast";
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

const PURPOSE_LABEL = {
  transportation: { emoji: "🚚", label: "Transportation" },
  delivery: { emoji: "📦", label: "Delivery" },
};

const STATUS_BADGE = {
  PENDING_MEMBER_RESPONSE: "bg-yellow-100 text-yellow-700 border-yellow-200",
  AWAITING_OWNER_CONFIRMATION: "bg-blue-100 text-blue-700 border-blue-200",
  CONFIRMED: "bg-green-100 text-green-700 border-green-200",
  IN_PROGRESS: "bg-indigo-100 text-indigo-700 border-indigo-200",
  COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  DECLINED: "bg-red-100 text-red-700 border-red-200",
  CANCELLED: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function TeamOwnerDashboard() {
  const { porter, isLoading: porterLoading } = usePorter();
  const navigate = useNavigate();
  const sseRef = useRef(null);

  const token = useAuthStore((s) => s.access_token);
  const [liveRequests, setLiveRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("requests");

  const {
    data: apiData,
    isLoading: bookingsLoading,
    refetch,
  } = useGetPorterBookings();

  const { data: teamDashboard } = useGetTeamDashboard();
  const {
    data: pendingBookings,
    refetch: refetchPendingBookings,
  } = useGetTeamPendingBookings();

  // Fetch active/upcoming team bookings for the schedule tab
  const { data: teamBookingHistoryRaw, isLoading: scheduleLoading } = useGetTeamBookingHistory();

  const { mutateAsync: teamOwnerReview, isPending: reviewing } =
    useTeamOwnerReviewBooking();

  const { mutateAsync: startTeamBooking, isPending: startingJob } =
    useStartTeamBooking();

  const { mutateAsync: confirmBooking, isPending: confirming } = useTeamOwnerConfirmBooking();
  const { mutateAsync: cancelBooking, isPending: cancelling } = useTeamOwnerCancelBooking();

  const {
    data: quorumReachedBookings,
    refetch: refetchQuorumBookings,
  } = useGetTeamQuorumReachedBookings();

  const apiRequests = apiData?.pendingRequests || [];

  // Active team bookings for schedule tab — filter server-side history to active statuses
  const ACTIVE_TEAM_STATUSES = [
    "PENDING_MEMBER_RESPONSE",
    "AWAITING_OWNER_CONFIRMATION",
    "CONFIRMED",
    "IN_PROGRESS",
  ];
  const upcomingTeamBookings = (teamBookingHistoryRaw || []).filter((b) =>
    ACTIVE_TEAM_STATUSES.includes(b.status)
  );

  // Build the requests list:
  //  1. Start from API-sourced pending bookings (survives refresh)
  //  2. Merge in any live socket requests not yet in the API list
  //     (in-flight notifications that arrived before the API caught up)
  const apiPendingBookings = Array.isArray(pendingBookings) ? pendingBookings : [];
  const apiQuorumBookings = Array.isArray(quorumReachedBookings) ? quorumReachedBookings : [];

  const teamLeadRequests = [
    // API bookings formatted as request objects
    ...apiPendingBookings.map((b) => ({
      _id: b._id,
      bookingId: b._id,
      booking: b,
      pickup: b.pickup,
      drop: b.drop,
      weightKg: b.weightKg,
      portersRequired: b.teamSize,
      workDescription: b.workDescription,
      bookingDate: b.bookingDate,
      bookingTime: b.bookingTime,
      hasVehicle: b.hasVehicle,
      vehicleType: b.vehicleType,
      customerName: b.userId?.name,
      _isLive: false,
    })),
    // Live socket requests not yet reflected in API (deduped)
    ...liveRequests.filter(
      (lr) =>
        !apiPendingBookings.some(
          (b) => String(b._id) === String(lr.bookingId)
        )
    ),
  ];

  useEffect(() => {
    if (porter?._id) {
      socket.emit("join-porter-room", porter._id);
    }
  }, [porter?._id]);

  useEffect(() => {
    const onTeamBookingRequest = (data) => {
      setLiveRequests((prev) => {
        const exists = prev.some(
          (r) => r.bookingId === data.bookingId?.toString(),
        );
        if (exists) return prev;
        return [{ ...data, _isLive: true }, ...prev];
      });
      refetch();
    };

    socket.on("team-booking-request", onTeamBookingRequest);

    // SSE: Listen for invitation responses (accepted/declined) from porters
    sseRef.current = createSSEConnection(
      "/bookings/sse/porter",
      {
        "invitation-response": (data) => {
          // data: { requestId, action, porterId, porterName, reason }
          const { action, porterName } = data;
          if (action === "ACCEPTED") {
            toast.success(`${porterName} has accepted your team invitation!`, {
              duration: 5000,
              icon: "✅",
            });
          } else {
            toast.error(`${porterName} declined your team invitation.`, {
              duration: 5000,
              icon: "❌",
            });
          }
          // Refresh team data
          refetch();
          refetchPendingBookings();
          refetchQuorumBookings();
        },
      },
      token,
    );

    socket.on("team-quorum-reached", (data) => {
      toast.success(`Quorum reached for booking #${String(data.bookingId).slice(-6).toUpperCase()}!`, {
        duration: 6000,
        icon: "✅",
      });
      refetchQuorumBookings();
    });

    return () => {
      socket.off("team-booking-request", onTeamBookingRequest);
      socket.off("team-quorum-reached");
      sseRef.current?.close();
    };
  }, [refetch, refetchPendingBookings, refetchQuorumBookings, token]);

  const handleForward = async (bookingId) => {
    try {
      await teamOwnerReview({ bookingId, action: "forward" });
      setLiveRequests((prev) => prev.filter((r) => String(r.bookingId) !== String(bookingId)));
      refetch();
      refetchPendingBookings();
    } catch {
      /* toasted by hook */
    }
  };

  const handleDecline = async (bookingId) => {
    try {
      await teamOwnerReview({ bookingId, action: "decline" });
      setLiveRequests((prev) => prev.filter((r) => String(r.bookingId) !== String(bookingId)));
      refetch();
      refetchPendingBookings();
      refetchQuorumBookings();
    } catch {
      /* toasted by hook */
    }
  };

  const handleQuorumAccept = async (bookingId) => {
    try {
      await confirmBooking(bookingId);
      refetch();
      refetchQuorumBookings();
    } catch {
      /* toasted by hook */
    }
  };

  const handleQuorumCancel = async (bookingId) => {
    try {
      await cancelBooking(bookingId);
      refetchQuorumBookings();
    } catch {
      /* toasted by hook */
    }
  };

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
            Manage booking requests, team members, and schedule.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { refetch(); refetchPendingBookings(); refetchQuorumBookings(); }}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${bookingsLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats banner */}
      {teamDashboard && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-3 px-4 flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                {String(teamDashboard.team?._id || "T").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {porter?.user?.name || "Team Owner"}
                </p>
                <p className="text-xs text-gray-500">Team Owner</p>
              </div>
            </div>
            <Separator orientation="vertical" className="h-8 hidden sm:block" />
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-lg font-bold text-primary">{teamDashboard.stats.totalMembers}</p>
                <p className="text-xs text-gray-500">Members</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-blue-600">{teamDashboard.stats.activeJobs}</p>
                <p className="text-xs text-gray-500">Active Jobs</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">{teamDashboard.stats.completedJobs}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-700 border-green-200 ml-auto">
              Online
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Tab bar */}
      <div className="flex bg-gray-100 p-1 rounded-lg w-full max-w-md">
        <button
          onClick={() => setActiveTab("requests")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-semibold transition-all ${
            activeTab === "requests"
              ? "bg-white text-primary shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Bell className="w-4 h-4" />
          Requests
          {(teamLeadRequests.length > 0 || apiQuorumBookings.length > 0) && (
            <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              {teamLeadRequests.length + apiQuorumBookings.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("schedule")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-semibold transition-all ${
            activeTab === "schedule"
              ? "bg-white text-primary shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Calendar className="w-4 h-4" />
          My Schedule
          {upcomingTeamBookings.length > 0 && (
            <span className="ml-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {upcomingTeamBookings.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("team")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-semibold transition-all ${
            activeTab === "team"
              ? "bg-white text-primary shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Users className="w-4 h-4" />
          My Team
          {teamDashboard?.members?.length > 0 && (
            <span className="ml-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {teamDashboard.members.length}
            </span>
          )}
        </button>
      </div>

      {/* ── REQUESTS TAB ── */}
      {activeTab === "requests" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Booking Requests
                {teamLeadRequests.length > 0 && (
                  <Badge variant="destructive" className="animate-pulse">
                    {teamLeadRequests.length} pending
                  </Badge>
                )}
              </CardTitle>
            </div>
            <CardDescription>
              Review incoming booking requests. Forward to your team or decline. Bookings where quorum is reached will appear here for your confirmation.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ScrollArea className="h-[calc(100vh-28rem)] min-h-[300px] pr-2">
              {bookingsLoading && teamLeadRequests.length === 0 && apiQuorumBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                  <p className="text-gray-500">Loading requests…</p>
                </div>
              ) : teamLeadRequests.length === 0 && apiQuorumBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    No pending requests
                  </p>
                  <p className="text-xs text-gray-500">
                    New booking requests will appear here in real time.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {teamLeadRequests.map((request) => {
                    const isLive = request._isLive;
                    const bookingId = isLive
                      ? request.bookingId
                      : request.bookingId?._id || request._id;
                    // For live requests: data is at the top level (e.g. request.pickup).
                    // For API-sourced requests mapped in teamLeadRequests: pickup/drop etc.
                    // are also hoisted to the top level (request.pickup), but bookingId is
                    // just an ID string. Fall back gracefully for both shapes.
                    const pickup =
                      request.pickup ?? request.bookingId?.pickup;
                    const drop =
                      request.drop ?? request.bookingId?.drop;
                    const weightKg =
                      request.weightKg ?? request.weight ?? request.bookingId?.weightKg;
                    const portersRequired =
                      request.portersRequired ?? request.bookingId?.teamSize;
                    const workDescription =
                      request.workDescription ?? request.bookingId?.workDescription;
                    const bookingDate =
                      request.bookingDate ?? request.bookingId?.bookingDate;
                    const bookingTime =
                      request.bookingTime ?? request.bookingId?.bookingTime;
                    const hasVehicle =
                      request.hasVehicle ?? request.bookingId?.hasVehicle;
                    const vehicleType =
                      request.vehicleType ?? request.bookingId?.vehicleType;

                    return (
                      <Card
                        key={bookingId || request._id}
                        className="border-l-4 border-l-primary hover:shadow-md transition-all"
                      >
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              {isLive && (
                                <Badge className="bg-red-100 text-red-700 border-red-200 text-xs animate-pulse">
                                  Live
                                </Badge>
                              )}
                              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                                <Users className="w-3 h-3 mr-1" />
                                Team Booking
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-xs font-mono"
                              >
                                #{String(bookingId).slice(-6).toUpperCase()}
                              </Badge>
                            </div>
                            {request.distanceKm != null && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <MapPin className="h-3 w-3" />
                                {Number(request.distanceKm).toFixed(1)} km away
                              </div>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="p-4 pt-2 space-y-3">
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

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                            {weightKg && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <Package className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                <span>{weightKg} kg</span>
                              </div>
                            )}
                            {portersRequired && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <Users className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                <span>{portersRequired} porters needed</span>
                              </div>
                            )}
                            {bookingDate && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <CalendarDays className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                <span>
                                  {new Date(bookingDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            {bookingTime && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                <span>{bookingTime}</span>
                              </div>
                            )}
                            {hasVehicle && vehicleType && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <Truck className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                <span className="capitalize">
                                  {vehicleType}
                                </span>
                              </div>
                            )}
                          </div>

                          {workDescription && (
                            <div className="bg-purple-50 rounded-lg p-2 text-xs text-gray-600 border border-purple-100">
                              <span className="font-medium">Work: </span>
                              {workDescription}
                            </div>
                          )}
                        </CardContent>

                        <CardFooter className="p-4 pt-0">
                          <div className="flex gap-2 w-full justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-28"
                              disabled={reviewing}
                              onClick={() => handleDecline(bookingId)}
                            >
                              {reviewing ? (
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
                              disabled={reviewing}
                              onClick={() => handleForward(bookingId)}
                            >
                              {reviewing ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <Send className="mr-1 h-3 w-3" />
                                  Forward to Team
                                </>
                              )}
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    );
                  })}

                  {apiQuorumBookings.length > 0 && (
                    <>
                      <div className="border-t pt-4">
                        <div className="flex items-center gap-2 mb-4">
                          <AlertCircle className="w-5 h-5 text-green-600" />
                          <h3 className="font-semibold text-gray-800">Quorum Reached</h3>
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            {apiQuorumBookings.length} booking{apiQuorumBookings.length > 1 ? "s" : ""} ready
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">
                          All team members have confirmed. Review the accepted porters and confirm or cancel each booking.
                        </p>
                      </div>

                      {apiQuorumBookings.map((booking) => {
                        const bookingId = booking._id;
                        const acceptedPorters = (booking.memberResponses || []).filter(
                          (m) => m.response === "ACCEPTED"
                        );
                        const declinedPorters = (booking.memberResponses || []).filter(
                          (m) => m.response === "DECLINED"
                        );

                        return (
                          <Card
                            key={bookingId}
                            className="border-l-4 border-l-green-500 hover:shadow-md transition-all"
                          >
                            <CardHeader className="p-4 pb-2">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                                    <ThumbsUp className="w-3 h-3 mr-1" />
                                    Quorum Reached
                                  </Badge>
                                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                                    <Users className="w-3 h-3 mr-1" />
                                    Team Booking
                                  </Badge>
                                  <Badge variant="outline" className="text-xs font-mono">
                                    #{String(bookingId).slice(-6).toUpperCase()}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <CalendarDays className="h-3 w-3" />
                                  {booking.bookingDate
                                    ? new Date(booking.bookingDate).toLocaleDateString()
                                    : "No date"}
                                  {booking.bookingTime && ` @ ${booking.bookingTime}`}
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent className="p-4 pt-2 space-y-3">
                              {booking.userId?.name && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-gray-500">Customer:</span>
                                  <span className="font-medium text-gray-700">{booking.userId.name}</span>
                                  {booking.userId.phone && (
                                    <span className="text-gray-400">{booking.userId.phone}</span>
                                  )}
                                </div>
                              )}

                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Pickup</p>
                                  <AddressLine location={booking.pickup} dot="green" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Drop-off</p>
                                  <AddressLine location={booking.drop} dot="red" />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                                {booking.weightKg && (
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <Package className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                    <span>{booking.weightKg} kg</span>
                                  </div>
                                )}
                                {booking.teamSize && (
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <Users className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                    <span>{booking.teamSize} porters needed</span>
                                  </div>
                                )}
                                {booking.hasVehicle && booking.vehicleType && (
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <Truck className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                    <span className="capitalize">{booking.vehicleType}</span>
                                  </div>
                                )}
                              </div>

                              {booking.workDescription && (
                                <div className="bg-purple-50 rounded-lg p-2 text-xs text-gray-600 border border-purple-100">
                                  <span className="font-medium">Work: </span>
                                  {booking.workDescription}
                                </div>
                              )}

                              <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                  <p className="text-sm font-semibold text-green-700">
                                    {acceptedPorters.length} Porter{acceptedPorters.length > 1 ? "s" : ""} Ready to Work
                                  </p>
                                </div>
                                {acceptedPorters.length > 0 ? (
                                  <div className="space-y-2">
                                    {acceptedPorters.map((member, idx) => {
                                      const porter = member.porterId;
                                      const name =
                                        porter?.userId?.name ||
                                        `Porter #${String(porter?._id || idx).slice(-4).toUpperCase()}`;
                                      return (
                                        <div key={member._id || idx} className="flex items-center gap-2 bg-white rounded-lg p-2 border border-green-100">
                                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">
                                            {name.charAt(0).toUpperCase()}
                                          </div>
                                          <div className="flex-1">
                                            <p className="text-xs font-medium text-gray-800">{name}</p>
                                            {porter?.userId?.phone && (
                                              <p className="text-xs text-gray-400">{porter.userId.phone}</p>
                                            )}
                                          </div>
                                          <ThumbsUp className="w-4 h-4 text-green-600" />
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-500">No accepted porters</p>
                                )}

                                {declinedPorters.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-green-100">
                                    <p className="text-xs text-gray-500 mb-1">
                                      Declined by {declinedPorters.length} member{declinedPorters.length > 1 ? "s" : ""}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </CardContent>

                            <CardFooter className="p-4 pt-0">
                              <div className="flex gap-2 w-full justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-28 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  disabled={cancelling}
                                  onClick={() => handleQuorumCancel(bookingId)}
                                >
                                  {cancelling ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <>
                                      <Ban className="mr-1 h-3 w-3" />
                                      Cancel
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  disabled={confirming}
                                  onClick={() => handleQuorumAccept(bookingId)}
                                >
                                  {confirming ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle2 className="mr-1 h-3 w-3" />
                                      Accept
                                    </>
                                  )}
                                </Button>
                              </div>
                            </CardFooter>
                          </Card>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* ── SCHEDULE TAB ── */}
      {activeTab === "schedule" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              My Upcoming Bookings
            </CardTitle>
            <CardDescription>
              Bookings your team has committed to, sorted by date.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-28rem)] min-h-[300px] pr-2">
              {bookingsLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                  <p className="text-gray-500">Loading schedule…</p>
                </div>
              ) : upcomingTeamBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">No upcoming bookings</p>
                  <p className="text-xs text-gray-500">
                    Bookings you confirm will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingTeamBookings.map((booking) => {
                    const statusClass =
                      STATUS_BADGE[booking.status] ||
                      "bg-gray-100 text-gray-600";
                    return (
                      <Card
                        key={booking._id}
                        className="border-l-4 border-l-blue-400 hover:shadow-md transition-all"
                      >
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                variant="outline"
                                className={`text-xs ${statusClass}`}
                              >
                                {booking.status.replace(/_/g, " ")}
                              </Badge>
                              <Badge variant="outline" className="text-xs font-mono">
                                #{String(booking._id).slice(-6).toUpperCase()}
                              </Badge>
                            </div>
                            {booking.bookingDate && (
                              <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {new Date(booking.bookingDate).toLocaleDateString(
                                  undefined,
                                  { weekday: "short", month: "short", day: "numeric" },
                                )}
                                {booking.bookingTime && (
                                  <span className="ml-1 text-gray-500 font-normal">
                                    @ {booking.bookingTime}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="p-4 pt-2 space-y-3">
                          {booking.userId?.name && (
                            <p className="text-xs text-gray-500">
                              Customer:{" "}
                              <span className="font-medium text-gray-700">
                                {booking.userId.name}
                              </span>
                              {booking.userId.phone && (
                                <span className="ml-2">{booking.userId.phone}</span>
                              )}
                            </p>
                          )}

                          <div className="space-y-1">
                            <AddressLine location={booking.pickup} dot="green" />
                            <AddressLine location={booking.drop} dot="red" />
                          </div>

                          <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                            {booking.teamSize && (
                              <div className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5 text-gray-400" />
                                {booking.teamSize} porters
                              </div>
                            )}
                            {booking.weightKg && (
                              <div className="flex items-center gap-1">
                                <Package className="h-3.5 w-3.5 text-gray-400" />
                                {booking.weightKg} kg
                              </div>
                            )}
                            {booking.hasVehicle && booking.vehicleType && (
                              <div className="flex items-center gap-1 capitalize">
                                <Truck className="h-3.5 w-3.5 text-gray-400" />
                                {booking.vehicleType}
                              </div>
                            )}
                          </div>

                          {booking.workDescription && (
                            <div className="bg-gray-50 rounded p-2 text-xs text-gray-600 border">
                              <span className="font-medium">Work: </span>
                              {booking.workDescription}
                            </div>
                          )}
                        </CardContent>

                        <CardFooter className="p-4 pt-0">
                          <div className="flex gap-2 w-full justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  "/dashboard/porters/team-lead/confirm-booking",
                                  { state: { bookingId: booking._id, booking } },
                                )
                              }
                            >
                              View Details
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
      )}

      {/* ── MY TEAM TAB ── */}
      {activeTab === "team" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  My Team Members
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Current team members with their contact info and join date.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => navigate("/dashboard/porters/team")}
                className="bg-primary hover:bg-primary/90 gap-2"
              >
                <Send className="h-4 w-4" />
                Manage Team &amp; Invite
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-28rem)] min-h-[300px] pr-2">
              {!teamDashboard?.members || teamDashboard.members.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">No team members yet</p>
                  <p className="text-xs text-gray-500">
                    Use the "Manage Team &amp; Invite" button above to recruit individual porters.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate("/dashboard/porters/team")}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Invite Porters
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {teamDashboard.members.map((member) => (
                    <Card key={member._id} className="hover:shadow-md transition-all">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {member.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right text-xs text-gray-500">
                            <p>Joined: {new Date(member.joinedAt).toLocaleDateString()}</p>
                            <Badge className={`mt-1 ${member.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                              {member.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
