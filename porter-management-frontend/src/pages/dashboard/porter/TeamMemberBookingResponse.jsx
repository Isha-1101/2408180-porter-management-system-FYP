/**
 * @file TeamMemberBookingResponse.jsx
 * @description Page for team members to respond to forwarded booking requests
 */

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Users,
  MapPin,
  Package,
  CalendarDays,
  Truck,
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
import { useTeamMemberRespond } from "../../../apis/hooks/porterTeamHooks";
import socket from "../../../utils/socket";
import { usePorter } from "../../../hooks/porter/use-porter";

const TeamMemberBookingResponse = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { porter } = usePorter();

  const { bookingId, booking: initialBooking } = location.state || {};

  const [booking, setBooking] = useState(initialBooking);
  const [isResponding, setIsResponding] = useState(false);

  const { mutateAsync: respondToBooking } = useTeamMemberRespond();

  useEffect(() => {
    if (porter?._id) {
      socket.emit("join-porter-room", porter._id);
    }
  }, [porter?._id]);

  useEffect(() => {
    const handleBookingUpdate = (data) => {
      if (String(data.bookingId) === String(bookingId)) {
        setBooking((prev) => ({ ...prev, status: data.status }));
      }
    };

    socket.on("team-booking-started", handleBookingUpdate);
    socket.on("team-booking-cancelled", handleBookingUpdate);

    return () => {
      socket.off("team-booking-started", handleBookingUpdate);
      socket.off("team-booking-cancelled", handleBookingUpdate);
    };
  }, [bookingId]);

  const handleAccept = async () => {
    setIsResponding(true);
    try {
      await respondToBooking({ bookingId, response: "ACCEPTED" });
      navigate("/dashboard/porters");
    } catch {
      setIsResponding(false);
    }
  };

  const handleDecline = async () => {
    setIsResponding(true);
    try {
      await respondToBooking({ bookingId, response: "DECLINED" });
      navigate("/dashboard/porters");
    } catch {
      setIsResponding(false);
    }
  };

  if (!bookingId || !booking) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <XCircle className="w-12 h-12 text-red-400" />
        <p className="text-gray-500 font-medium">
          Invalid page state. No booking details provided.
        </p>
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard/porters")}
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 min-h-[calc(100vh-4rem)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <BackButton />
        <div>
          <h1 className="text-xl font-bold">Team Booking Invitation</h1>
          <p className="text-sm text-gray-500">
            A job has been forwarded to you by your team lead
          </p>
        </div>
        <Badge
          variant="outline"
          className="ml-auto bg-yellow-100 text-yellow-700 border-yellow-200"
        >
          <Clock className="w-3 h-3 mr-1" />
          Pending Your Response
        </Badge>
      </div>

      {/* Booking Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Booking Details
          </CardTitle>
          <CardDescription>
            Please review the job details before responding
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Locations */}
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-green-500" />
                Pickup Location
              </p>
              <AddressLine location={booking.pickup} dot="green" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-500" />
                Drop-off Location
              </p>
              <AddressLine location={booking.drop} dot="red" />
            </div>
          </div>

          <Separator />

          {/* Job Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {booking.weightKg && (
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Weight:</span>
                <span className="font-semibold">{booking.weightKg} kg</span>
              </div>
            )}
            {booking.teamSize && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Team Size:</span>
                <span className="font-semibold">
                  {booking.teamSize} porters
                </span>
              </div>
            )}
            {booking.bookingDate && (
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold">
                  {new Date(booking.bookingDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {booking.bookingTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Time:</span>
                <span className="font-semibold">{booking.bookingTime}</span>
              </div>
            )}
            {booking.hasVehicle && booking.vehicleType && (
              <div className="flex items-center gap-2 col-span-2">
                <Truck className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Vehicle:</span>
                <span className="font-semibold capitalize">
                  {booking.vehicleType}
                </span>
              </div>
            )}
          </div>

          {booking.workDescription && (
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
              <p className="text-xs text-gray-500 mb-1">Work Description</p>
              <p className="text-sm text-gray-700">{booking.workDescription}</p>
            </div>
          )}

          {booking.teamLeadName && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <p className="text-xs text-gray-500 mb-1">
                Forwarded by Team Lead
              </p>
              <p className="text-sm font-semibold text-gray-700">
                {booking.teamLeadName}
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t pt-4 flex-col gap-3">
          <p className="text-sm text-gray-600 text-center">
            Would you like to accept this team booking?
          </p>
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1 h-12 text-red-600 hover:text-red-700 hover:bg-red-50"
              disabled={isResponding}
              onClick={handleDecline}
            >
              {isResponding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Decline
                </>
              )}
            </Button>
            <Button
              className="flex-1 h-12 bg-green-600 hover:bg-green-700"
              disabled={isResponding}
              onClick={handleAccept}
            >
              {isResponding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Accept
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TeamMemberBookingResponse;
