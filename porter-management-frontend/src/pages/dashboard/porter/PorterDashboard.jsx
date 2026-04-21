import React, { useEffect, useRef, useCallback, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import {
  Navigation,
  Package,
  Clock,
  Truck,
  Filter,
  CheckCircle,
  RefreshCw,
  Loader2,
  Bell,
  Users,
  CalendarDays,
  Layers,
  Mail,
} from "lucide-react";
import { usePorter } from "../../../hooks/porter/use-porter";
import {
  useGetPorterBookings,
  useAcceptPorterBooking,
  useRejectPorterBooking,
} from "../../../apis/hooks/porterBookingsHooks";
import {
  useTeamMemberRespond,
  useGetMyPendingInvitations,
  useRespondToTeamInvitation,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Badge } from "../../../components/ui/badge";
import { ScrollArea } from "../../../components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { toast } from "react-hot-toast";

export default function PorterDashboard() {
  const { porter, isLoading: porterLoading } = usePorter();
  const token = useAuthStore((s) => s.access_token);
  const navigate = useNavigate();

  // Live socket-pushed requests (merged on top of API data)
  const [liveRequests, setLiveRequests] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("distance");
  const [porterLocation, setPorterLocation] = useState(null);
  const [inviteModalData, setInviteModalData] = useState(null);

  const intervalRef = useRef(null);
  const sseRef = useRef(null);

  // Team invitations (for individual porters who have been invited to a team)
  const { data: pendingInvitations, refetch: refetchInvitations } = useGetMyPendingInvitations();
  const invitationCount = Array.isArray(pendingInvitations)
    ? pendingInvitations.length
    : 0;

  // Real API data
  const {
    data: apiData,
    isLoading: bookingsLoading,
    refetch,
  } = useGetPorterBookings();

  // ── Individual booking mutations ────────────────────────────────────────────
  const { mutateAsync: acceptBooking, isPending: accepting } =
    useAcceptPorterBooking();
  const { mutateAsync: rejectBooking, isPending: rejecting } =
    useRejectPorterBooking();

  const { mutateAsync: teamMemberRespond, isPending: teamMemberResponding } =
    useTeamMemberRespond();

  const { mutateAsync: respondToInvite, isPending: invitationResponding } =
    useRespondToTeamInvitation();

  // Derive request list = pending requests from API + live socket requests merged
  const apiRequests = apiData?.pendingRequests || [];

  // Merge live socket requests with the API ones (avoid duplicates by bookingId)
  const allRequests = [
    ...liveRequests.filter(
      (lr) => !apiRequests.some((ar) => ar.bookingId?._id === lr.bookingId),
    ),
    ...apiRequests,
  ];

  // ── Auto location for porter-location socket
  const stopAutoLocation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const startAutoLocation = useCallback((id) => {
    if (!id) return;
    stopAutoLocation();

    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser");
      alert("Your browser doesn't support location services");
      return;
    }

    const requestLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setPorterLocation([lat, lng]);

          if (socket.connected) {
            console.log("Emitting porter-location:", {
              porterId: id,
              lat,
              lng,
            });
            socket.emit("porter-location", { porterId: id, lat, lng });
          } else {
            console.warn("Socket not connected");
          }

          //Start interval only after permission is granted
          intervalRef.current = setInterval(() => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setPorterLocation([lat, lng]);

                if (socket.connected) {
                  socket.emit("porter-location", { porterId: id, lat, lng });
                }
              },
              (err) => {
                console.error("Location update error:", err);
              },
              {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
              },
            );
          }, 5000);
        },
        (err) => {
          switch (err.code) {
            case err.PERMISSION_DENIED:
              alert(
                "Location permission denied. Please enable location access in your browser settings.",
              );
              break;
            case err.POSITION_UNAVAILABLE:
              alert("Location information is unavailable.");
              break;
            case err.TIMEOUT:
              alert("Location request timed out.");
              break;
            default:
              alert("An unknown error occurred while getting location.");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    };
    requestLocation();
  }, []);

  useEffect(() => {
    if (porter?._id) {
      startAutoLocation(porter?._id);
      // Join porter's own room to receive targeted booking-request events
      socket.emit("join-porter-room", porter?._id);
    }
    return () => stopAutoLocation();
  }, [porter, startAutoLocation]);

  // ── Listen for live booking requests via socket
  useEffect(() => {
    const onBookingRequest = (data) => {
      setLiveRequests((prev) => {
        const exists = prev.some(
          (r) => r.bookingId === data.bookingId?.toString(),
        );
        if (exists) return prev;
        return [{ ...data, _isLive: true }, ...prev];
      });
      // Also refetch to sync with DB state
      refetch();
    };

    // Handler for team booking forwarded to team members
    const onTeamBookingForwarded = (data) => {
      setLiveRequests((prev) => {
        const exists = prev.some(
          (r) => r.bookingId === data.bookingId?.toString(),
        );
        if (exists) return prev;
        return [{ ...data, _isLive: true, bookingType: "team" }, ...prev];
      });
      refetch();
    };

    socket.on("booking-request", onBookingRequest);
    socket.on("team-booking-forwarded", onTeamBookingForwarded);

    // SSE: also receive new booking requests server-pushed
    sseRef.current = createSSEConnection(
      "/bookings/sse/porter",
      {
        "new-booking-request": (data) => {
          setLiveRequests((prev) => {
            const exists = prev.some(
              (r) => r.bookingId === String(data.bookingId),
            );
            if (exists) return prev;
            return [{ ...data, _isLive: true, _sse: true }, ...prev];
          });
          refetch();
        },
        "team-invitation": (data) => {
          // data: { requestId, teamId, invitedBy, message }
          setInviteModalData(data);
          refetchInvitations();
          toast.success("New Team Invitation received!");
        },
      },
      token,
    );

    return () => {
      socket.off("booking-request", onBookingRequest);
      socket.off("team-booking-forwarded", onTeamBookingForwarded);
      sseRef.current?.close();
    };
  }, [refetch, token]);

  // ── Early returns (MUST be after all hooks) ─────────────────────────────────
  if (porterLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-3" />
          <p className="text-gray-600">Loading Porter Dashboard…</p>
        </div>
      </div>
    );
  }
  if (porter?.role === "owner") {
    return <Navigate to="/dashboard/porters/team-owner" replace />;
  }

  // ── Individual: Accept handler ──────────────────────────────────────────────
  const handleAcceptRequest = async (bookingId, requestData) => {
    try {
      const res = await acceptBooking(bookingId);
      const booking = res?.data?.booking || res?.booking;
      navigate("/dashboard/porters/accepted-booking", {
        state: {
          booking: booking || {
            _id: bookingId,
            pickup: requestData.pickup,
            drop: requestData.drop,
            userName: requestData.userName || "Customer",
            weightKg: requestData.weightKg,
            vehicleType: requestData.vehicleType || "N/A",
            distanceKm: requestData.distanceKm,
            fare: requestData.fare || 0,
          },
        },
      });
    } catch (err) {
      // error toasted by hook
    }
  };

  // ── Individual: Reject handler ──────────────────────────────────────────────
  const handleRejectRequest = async (bookingId) => {
    try {
      await rejectBooking(bookingId);
      setLiveRequests((prev) => prev.filter((r) => r.bookingId !== bookingId));
    } catch (err) {
      // handled by hook
    }
  };

  // ── Team Member: Respond to forwarded booking ──────────────────────────────
  const handleTeamMemberRespond = async (bookingId, response) => {
    try {
      await teamMemberRespond({ bookingId, response });
      setLiveRequests((prev) => prev.filter((r) => r.bookingId !== bookingId));
    } catch (err) {
      // handled by hook
    }
  };

  const filteredRequests = allRequests
    .filter((req) => {
      if (filter === "ALL") return true;
      if (filter === "PENDING") return req.status === "PENDING";
      if (filter === "BIKE")
        return (
          req.bookingId?.vehicleType === "BIKE" || req.vehicleType === "BIKE"
        );
      if (filter === "CAR")
        return (
          req.bookingId?.vehicleType === "CAR" || req.vehicleType === "CAR"
        );
      return true;
    })
    .sort((a, b) => {
      const distA = a.distanceKm ?? a.bookingId?.distanceKm ?? 999;
      const distB = b.distanceKm ?? b.bookingId?.distanceKm ?? 999;
      if (sortBy === "distance") return distA - distB;
      return 0;
    });

  const pendingCount = filteredRequests.length;

  if (porterLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-3" />
          <p className="text-gray-600">Loading Porter Dashboard…</p>
        </div>
      </div>
    );
  }

  const handleInvitationResponse = async (action) => {
    if (!inviteModalData?.requestId) return;
    try {
      await respondToInvite({
        requestId: inviteModalData.requestId,
        action,
      });
      setInviteModalData(null);
      refetchInvitations();
    } catch (err) {
      // error handled by hook toast
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-4">
      {/* Real-time Team Invitation Modal */}
      <Dialog
        open={!!inviteModalData}
        onOpenChange={(open) => !open && setInviteModalData(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Team Invitation
            </DialogTitle>
            <DialogDescription>
              {inviteModalData?.message ||
                "A team owner has invited you to join their porter team."}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3 border border-blue-100">
            <Mail className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-800">
                You've been recruited!
              </p>
              <p className="text-xs text-blue-600 mt-0.5">
                Accepting this will link your account to the team. You can view
                full details in the Invitations page.
              </p>
            </div>
          </div>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => handleInvitationResponse("DECLINED")}
              disabled={invitationResponding}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Decline
            </Button>
            <Button
              onClick={() => handleInvitationResponse("ACCEPTED")}
              disabled={invitationResponding}
              className="bg-green-600 hover:bg-green-700"
            >
              {invitationResponding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Accept & Join"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Invitation Banner — shown only for individual porters with pending invitations */}
      {invitationCount > 0 && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800">
                You have {invitationCount} pending team invitation{invitationCount > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-blue-600">
                A team owner has invited you to join their team.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/dashboard/porters/invitations")}
            className="shrink-0 text-xs font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View &amp; Respond
          </button>
        </div>
      )}

      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Booking Requests</span>
              {pendingCount > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {pendingCount} pending
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                title="Refresh"
              >
                <RefreshCw
                  className={`h-4 w-4 ${bookingsLoading ? "animate-spin" : ""}`}
                />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilter("ALL")}>
                    All Requests
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("PENDING")}>
                    Pending Only
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Vehicle Type</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setFilter("BIKE")}>
                    Bike
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("CAR")}>
                    Car
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <CardDescription>
            {pendingCount} requests waiting • Auto-refreshes every 15s
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Nearest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="h-[500px] pr-4">
              {bookingsLoading && allRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                  <p className="text-gray-500">Loading requests…</p>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    No pending requests
                  </p>
                  <p className="text-xs text-gray-500">
                    New booking requests will appear here in real time.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((request) => {
                    // ── Normalise fields across API and live-socket formats ──────
                    const isLive = request._isLive;
                    const bookingId = isLive
                      ? request.bookingId
                      : request.bookingId?._id || request._id;
                    const pickup = isLive
                      ? request.pickup
                      : request.bookingId?.pickup;
                    const drop = isLive
                      ? request.drop
                      : request.bookingId?.drop;
                    const weightKg = isLive
                      ? request.weightKg
                      : request.bookingId?.weightKg;
                    const vehicleType = isLive
                      ? request.vehicleType
                      : request.bookingId?.vehicleType;
                    const distanceKm = request.distanceKm;

                    // ── Detect booking type & notification type ──────────────────
                    const bookingType =
                      request.bookingId?.bookingType || request.bookingType;
                    const notificationType = request.notificationType;
                    const isTeamLeadRequest =
                      bookingType === "team" &&
                      (notificationType === "TEAM_LEAD" ||
                        request.isTeamLead === true);
                    const isTeamMemberRequest =
                      bookingType === "team" && !isTeamLeadRequest;

                    // Extra team fields
                    const teamSize =
                      request.bookingId?.teamSize || request.teamSize;
                    const requirements =
                      request.bookingId?.requirements || request.requirements;
                    const bookingDate =
                      request.bookingId?.bookingDate || request.bookingDate;

                    // Porter's own porterId (for team member respond)
                    const currentPorterId = porter?._id;

                    return (
                      <Card
                        key={bookingId || request._id}
                        className={`transition-all hover:shadow-md border-l-4 ${
                          isTeamLeadRequest
                            ? "border-l-purple-500"
                            : isTeamMemberRequest
                              ? "border-l-blue-500"
                              : isLive
                                ? "border-l-primary"
                                : "border-l-gray-200"
                        }`}
                      >
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 flex-wrap gap-1">
                              {/* Live indicator */}
                              {isLive && (
                                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                                  🔴 Live
                                </Badge>
                              )}
                              {/* Team Lead badge */}
                              {isTeamLeadRequest && (
                                <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                                  <Users className="w-3 h-3 mr-1" />
                                  Team Lead Request
                                </Badge>
                              )}
                              {/* Team Member badge */}
                              {isTeamMemberRequest && (
                                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                                  <Users className="w-3 h-3 mr-1" />
                                  Team Member Invite
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                #{String(bookingId).slice(-6).toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Navigation className="h-3 w-3" />
                              <span>
                                {distanceKm?.toFixed(1) || "?"} km away
                              </span>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="p-4 pt-2">
                          <div className="space-y-3">
                            {/* Pickup / Drop */}
                            <div className="space-y-2">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">
                                  Pickup
                                </p>
                                <AddressLine location={pickup} dot="green" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">
                                  Drop
                                </p>
                                <AddressLine location={drop} dot="red" />
                              </div>
                            </div>

                            {/* Common detail row */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-600">
                              {weightKg && (
                                <div className="flex items-center gap-1">
                                  <Package className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                  <span>{weightKg} kg</span>
                                </div>
                              )}
                              {vehicleType && (
                                <div className="flex items-center gap-1 capitalize">
                                  <Truck className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                  <span>{vehicleType}</span>
                                </div>
                              )}
                              {/* Team-specific: team size */}
                              {(isTeamLeadRequest || isTeamMemberRequest) &&
                                teamSize && (
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                    <span>{teamSize} porters needed</span>
                                  </div>
                                )}
                              {/* Team-specific: booking date */}
                              {(isTeamLeadRequest || isTeamMemberRequest) &&
                                bookingDate && (
                                  <div className="flex items-center gap-1">
                                    <CalendarDays className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                    <span>
                                      {new Date(
                                        bookingDate,
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              {/* Team-specific: booking time */}
                              {(isTeamLeadRequest || isTeamMemberRequest) &&
                                (request.bookingId?.bookingTime || request.bookingTime) && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                    <span>
                                      {request.bookingId?.bookingTime || request.bookingTime}
                                    </span>
                                  </div>
                                )}
                              {/* Purpose of booking */}
                              {(isTeamLeadRequest || isTeamMemberRequest) &&
                                (request.bookingId?.purpose_of_booking || request.purpose_of_booking) && (
                                  <div className="flex items-center gap-1">
                                    <span>
                                      {(request.bookingId?.purpose_of_booking || request.purpose_of_booking) === "delivery"
                                        ? "📦 Delivery"
                                        : "🚚 Transportation"}
                                    </span>
                                  </div>
                                )}
                              {/* Floors */}
                              {(isTeamLeadRequest || isTeamMemberRequest) &&
                                (request.bookingId?.noOfFloors || request.noOfFloors) > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Layers className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                    <span>
                                      {request.bookingId?.noOfFloors || request.noOfFloors} floor(s)
                                    </span>
                                  </div>
                                )}
                            </div>

                            {/* Lift badge */}
                            {(isTeamLeadRequest || isTeamMemberRequest) &&
                              (request.bookingId?.hasLift || request.hasLift) && (
                                <p className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded border border-green-100 inline-block">
                                  ✓ Elevator / lift available
                                </p>
                              )}

                            {/* Team requirements note */}
                            {requirements && (
                              <p className="text-xs text-gray-500 bg-gray-50 rounded p-2 mt-1">
                                <span className="font-medium">
                                  Requirements:{" "}
                                </span>
                                {requirements}
                              </p>
                            )}
                          </div>
                        </CardContent>


                        {/* ── Action buttons (differ by request type) ─── */}
                        <CardFooter className="p-4 pt-0">
                          <div className="flex space-x-2 w-full justify-end">

                            {/* ── Team Member actions ── */}
                            {isTeamMemberRequest && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-28"
                                  disabled={teamMemberResponding}
                                  onClick={() =>
                                    handleTeamMemberRespond(
                                      bookingId,
                                      "DECLINED",
                                    )
                                  }
                                >
                                  {teamMemberResponding ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    "Decline"
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  className="w-28 bg-primary hover:bg-primary/80"
                                  disabled={teamMemberResponding}
                                  onClick={() =>
                                    handleTeamMemberRespond(
                                      bookingId,
                                      "ACCEPTED",
                                    )
                                  }
                                >
                                  {teamMemberResponding ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle className="mr-1 h-3 w-3" />
                                      Accept
                                    </>
                                  )}
                                </Button>
                              </>
                            )}

                            {/* ── Individual porter actions (default) ── */}
                            {!isTeamLeadRequest && !isTeamMemberRequest && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-28"
                                  disabled={rejecting || accepting}
                                  onClick={() => handleRejectRequest(bookingId)}
                                >
                                  {rejecting ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    "Decline"
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  className="w-28 bg-green-600 hover:bg-green-700"
                                  disabled={accepting || rejecting}
                                  onClick={() =>
                                    handleAcceptRequest(bookingId, {
                                      pickup,
                                      drop,
                                      weightKg,
                                      vehicleType,
                                      distanceKm,
                                    })
                                  }
                                >
                                  {accepting ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle className="mr-1 h-3 w-3" />
                                      Accept
                                    </>
                                  )}
                                </Button>
                              </>
                            )}
                          </div>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
