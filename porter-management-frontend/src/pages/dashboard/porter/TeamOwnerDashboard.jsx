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
 *   - View "My Schedule" tab to see upcoming bookings already committed to.
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
  Truck,
  Route,
  Layers,
  Calendar,
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

const PURPOSE_LABEL = {
  transportation: { emoji: "🚚", label: "Transportation" },
  delivery: { emoji: "📦", label: "Delivery" },
};

const STATUS_BADGE = {
  WAITING_PORTER_RESPONSE: "bg-yellow-100 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-green-100 text-green-700 border-green-200",
  IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
};

// ─────────────────────────────────────────────────────────────────────────────

export default function TeamOwnerDashboard() {
  const { porter, isLoading: porterLoading } = usePorter();
  const token = useAuthStore((s) => s.access_token);
  const navigate = useNavigate();
  const sseRef = useRef(null);

  const [liveRequests, setLiveRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("requests"); // "requests" | "schedule"

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
  const upcomingTeamBookings = apiData?.upcomingTeamBookings || [];

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
            Manage pre-booking requests and your upcoming schedule.
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

      {/* Tab bar */}
      <div className="flex bg-gray-100 p-1 rounded-lg w-full max-w-sm">
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
          {teamLeadRequests.length > 0 && (
            <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              {teamLeadRequests.length}
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
      </div>

      {/* ── REQUESTS TAB ── */}
      {activeTab === "requests" && (
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
            <ScrollArea className="h-[calc(100vh-28rem)] min-h-[300px] pr-2">
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
                      ? request.weight ?? request.weightKg
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
                    const hasVehicle = isLive
                      ? request.hasVehicle
                      : request.bookingId?.hasVehicle;
                    const vehicleType = isLive
                      ? request.vehicleType
                      : request.bookingId?.vehicleType;
                    const numberOfVehicles = isLive
                      ? request.numberOfVehicles
                      : request.bookingId?.numberOfVehicles;
                    const purpose = isLive
                      ? request.purpose_of_booking
                      : request.bookingId?.purpose_of_booking;
                    const noOfFloors = isLive
                      ? request.noOfFloors
                      : request.bookingId?.noOfFloors;
                    const hasLift = isLive
                      ? request.hasLift
                      : request.bookingId?.hasLift;
                    const no_of_trips = isLive
                      ? request.no_of_trips
                      : request.bookingId?.no_of_trips;
                    const distanceKm = request.distanceKm;
                    const purposeInfo = PURPOSE_LABEL[purpose];

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
                                  🔴 Live
                                </Badge>
                              )}
                              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                                <Users className="w-3 h-3 mr-1" />
                                Pre-Booking
                              </Badge>
                              {purposeInfo && (
                                <Badge variant="outline" className="text-xs">
                                  {purposeInfo.emoji} {purposeInfo.label}
                                </Badge>
                              )}
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

                          {/* Details grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                            {weightKg && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <Package className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                <span>{weightKg} kg</span>
                              </div>
                            )}
                            {teamSize && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <Users className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                <span>{teamSize} workers needed</span>
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
                                  {numberOfVehicles ? ` ×${numberOfVehicles}` : ""}
                                </span>
                              </div>
                            )}
                            {noOfFloors > 0 && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <Layers className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                <span>{noOfFloors} floor(s)</span>
                              </div>
                            )}
                            {no_of_trips > 0 && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <Route className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                <span>{no_of_trips} trip(s)</span>
                              </div>
                            )}
                          </div>

                          {/* Lift badge */}
                          {hasLift && (
                            <p className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded border border-green-100 inline-block">
                              ✓ Elevator / lift available
                            </p>
                          )}

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
                              disabled={accepting || rejecting}
                              onClick={() => handleAccept(bookingId)}
                            >
                              {accepting ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Accept &amp; Notify Team
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
              Bookings your team has committed to, sorted by date. Check this before accepting new requests to avoid conflicts.
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
                    Bookings you accept will appear here, sorted by date.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingTeamBookings.map((booking) => {
                    const purposeInfo = PURPOSE_LABEL[booking.purpose_of_booking];
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
                              {purposeInfo && (
                                <Badge variant="outline" className="text-xs">
                                  {purposeInfo.emoji} {purposeInfo.label}
                                </Badge>
                              )}
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
                          {/* Customer info */}
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

                          {/* Pickup / drop */}
                          <div className="space-y-1">
                            <AddressLine location={booking.pickup} dot="green" />
                            <AddressLine location={booking.drop} dot="red" />
                          </div>

                          {/* Meta */}
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
                                {booking.numberOfVehicles
                                  ? ` ×${booking.numberOfVehicles}`
                                  : ""}
                              </div>
                            )}
                          </div>

                          {booking.requirements && (
                            <div className="bg-gray-50 rounded p-2 text-xs text-gray-600 border">
                              <span className="font-medium">Requirements: </span>
                              {booking.requirements}
                            </div>
                          )}
                        </CardContent>

                        <CardFooter className="p-4 pt-0">
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
    </div>
  );
}
