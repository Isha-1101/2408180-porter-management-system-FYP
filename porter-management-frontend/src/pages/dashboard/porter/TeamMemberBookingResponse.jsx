/**
 * @file TeamMemberBookingResponse.jsx
 * @description Page for team members (individual porters in a team) to
 *              receive and respond to booking notifications forwarded by
 *              their team owner.
 *
 * Flow:
 *   1. Team owner forwards a booking → member gets Socket.io notification
 *   2. Member sees booking details here
 *   3. Member can Accept or Decline
 *   4. System tracks running count of acceptances vs required
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Users,
  Package,
  MapPin,
  CalendarDays,
  Truck,
  Bell,
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
import { BackButton } from "../../../components/common/BackButton";
import { AddressLine } from "../../../components/common/AddressLine";
import { useGetBookingById } from "../../../apis/hooks/porterBookingsHooks";
import { useTeamMemberRespond, useGetMyPendingInvitations } from "../../../apis/hooks/porterTeamHooks";
import socket from "../../../utils/socket";
import { usePorter } from "../../../hooks/porter/use-porter";

const STATUS_DISPLAY = {
  PENDING: {
    label: "Awaiting Response",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200 animate-pulse",
    icon: Clock,
  },
  ACCEPTED: {
    label: "Accepted",
    className: "bg-green-100 text-green-700 border-green-200",
    icon: CheckCircle2,
  },
  DECLINED: {
    label: "Declined",
    className: "bg-red-100 text-red-700 border-red-200",
    icon: XCircle,
  },
};

export default function TeamMemberBookingResponse() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const { porter } = usePorter();
  const { data: booking, isLoading } = useGetBookingById(bookingId);
  const { mutateAsync: respond, isPending: responding } = useTeamMemberRespond();
  const { data: myInvitations } = useGetMyPendingInvitations();

  const [hasResponded, setHasResponded] = useState(false);
  const [myResponse, setMyResponse] = useState(null);

  useEffect(() => {
    if (porter?._id) {
      socket.emit("join-porter-room", porter._id);
    }
  }, [porter?._id]);

  useEffect(() => {
    if (!booking || !porter?._id) return;

    const memberResp = booking.memberResponses?.find(
      (r) => r.porterId === porter._id || r.porterId?._id === porter._id,
    );

    if (memberResp && memberResp.response !== "PENDING") {
      setHasResponded(true);
      setMyResponse(memberResp.response);
    }
  }, [booking, porter?._id]);

  const handleRespond = async (response) => {
    try {
      await respond({ bookingId, response });
      setHasResponded(true);
      setMyResponse(response);
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

  if (!booking) {
    return (
      <div className="container mx-auto p-6">
        <BackButton />
        <Card className="mt-4">
          <CardContent className="py-16 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">No booking found</h2>
            <p className="text-sm text-gray-500 mt-2">
              The booking may have been cancelled or is no longer available.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = myResponse ? STATUS_DISPLAY[myResponse] : STATUS_DISPLAY.PENDING;
  const StatusIcon = statusInfo.icon;

  const memberStats = booking.memberResponses || [];
  const acceptedCount = memberStats.filter((r) => r.response === "ACCEPTED").length;
  const requiredCount = booking.teamSize;

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-2xl">
      <BackButton />

      {/* Header */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Team Booking Request</CardTitle>
            <Badge className={statusInfo.className}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
          <CardDescription>
            Your team lead has forwarded this booking for your response.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Booking details */}
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
                <span>{booking.teamSize} porters needed</span>
              </div>
            )}
            {booking.bookingDate && (
              <div className="flex items-center gap-2 text-gray-600">
                <CalendarDays className="w-4 h-4 text-gray-400" />
                <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
              </div>
            )}
            {booking.bookingTime && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{booking.bookingTime}</span>
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
        </CardContent>
      </Card>

      {/* Team response progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Response Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{acceptedCount}</p>
              <p className="text-xs text-gray-500">Accepted</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {memberStats.filter((r) => r.response === "PENDING").length}
              </p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {memberStats.filter((r) => r.response === "DECLINED").length}
              </p>
              <p className="text-xs text-gray-500">Declined</p>
            </div>
          </div>
          <p className="text-sm text-center mt-3 text-gray-600">
            {acceptedCount} / {requiredCount} required
          </p>
        </CardContent>
      </Card>

      {/* Response actions */}
      {!hasResponded && booking.status === "PENDING_MEMBER_RESPONSE" && (
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            size="lg"
            disabled={responding}
            onClick={() => handleRespond("DECLINED")}
          >
            {responding ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <XCircle className="w-4 h-4 mr-2" />
            )}
            Decline
          </Button>
          <Button
            size="lg"
            disabled={responding}
            onClick={() => handleRespond("ACCEPTED")}
          >
            {responding ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            Accept
          </Button>
        </div>
      )}

      {hasResponded && (
        <Card className={myResponse === "ACCEPTED" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <CardContent className="py-6 text-center">
            {myResponse === "ACCEPTED" ? (
              <>
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-lg font-semibold text-green-700">You've accepted this booking</p>
                <p className="text-sm text-green-600 mt-1">
                  The team lead will confirm once enough members have accepted.
                </p>
              </>
            ) : (
              <>
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p className="text-lg font-semibold text-red-700">You've declined this booking</p>
                <p className="text-sm text-red-600 mt-1">
                  The team lead has been notified.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
