/**
 * @file TeamLeadSelectPorters.jsx
 * @description Porter dashboard page for a team lead to select which team
 *              members will fulfil a team booking.
 *
 * Receives via React Router state:
 *   { booking, availableMembers, requiredMembers }
 *
 * On submission calls POST /api/bookings/team/:id/team-lead/select-porters,
 * then navigates to the confirm-booking page.
 */

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Users,
  CheckSquare,
  Square,
  Weight,
  Loader2,
  UserCheck,
  ArrowRight,
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
import { useTeamLeadSelectPorters } from "../../../apis/hooks/porterTeamHooks";

// ─────────────────────────────────────────────────────────────────────────────

const TeamLeadSelectPorters = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Data passed from PorterDashboard after team lead accepts
  const {
    booking,
    availableMembers = [],
    requiredMembers = 1,
  } = location.state || {};

  // Tracks which porter _ids are checked
  const [selectedIds, setSelectedIds] = useState([]);

  const { mutateAsync: selectPorters, isPending: selecting } =
    useTeamLeadSelectPorters();

  // ── Guard: no state provided ───────────────────────────────────────────────
  if (!booking) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <Users className="w-12 h-12 text-gray-300" />
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

  // ── Toggle porter selection ────────────────────────────────────────────────
  const togglePorter = (porterId) => {
    setSelectedIds((prev) =>
      prev.includes(porterId)
        ? prev.filter((id) => id !== porterId)
        : [...prev, porterId],
    );
  };

  // ── Submit selection to backend ───────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      const result = await selectPorters({
        bookingId: booking._id,
        selectedPorterIds: selectedIds,
      });

      // Navigate to confirm page with booking info
      navigate("/dashboard/porters/team-lead/confirm-booking", {
        state: {
          bookingId: booking._id,
          selectedPorterIds: selectedIds,
          requiredMembers,
          booking: result?.data?.booking || booking,
        },
      });
    } catch {
      /* error toasted by hook */
    }
  };

  const canSubmit = selectedIds.length >= requiredMembers;
  const bookingId = booking._id;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto p-4 md:p-6 min-h-[calc(100vh-4rem)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <BackButton />
        <div>
          <h1 className="text-xl font-bold">Select Team Members</h1>
          <p className="text-sm text-gray-500">
            Select at least{" "}
            <span className="font-semibold text-primary">
              {requiredMembers}
            </span>{" "}
            porters for this job
          </p>
        </div>
        <Badge variant="outline" className="ml-auto text-xs">
          #{String(bookingId).slice(-6).toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Left: Booking summary */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-500 mb-1">Pickup</p>
                <AddressLine location={booking.pickup} dot="green" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Drop-off</p>
                <AddressLine location={booking.drop} dot="red" />
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-500">Total Weight</span>
                <span className="font-semibold">{booking.weightKg} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Team Size Required</span>
                <span className="font-semibold">
                  {requiredMembers} porters
                </span>
              </div>
              {booking.requirements && (
                <div className="bg-gray-50 p-2 rounded text-xs text-gray-600">
                  <p className="font-medium mb-1">Requirements:</p>
                  {booking.requirements}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selection counter */}
          <Card
            className={`border-2 transition-colors ${
              canSubmit ? "border-green-400 bg-green-50" : "border-gray-200"
            }`}
          >
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {selectedIds.length}
                <span className="text-gray-400 text-lg">
                  /{requiredMembers}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {canSubmit
                  ? "✓ Minimum selection reached"
                  : `Select ${requiredMembers - selectedIds.length} more`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right: Available porter list */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" />
                Available Team Members ({availableMembers.length})
              </CardTitle>
              <CardDescription>
                Only online, verified members with sufficient weight capacity
                are shown.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableMembers.length === 0 ? (
                <div className="text-center py-10 text-gray-400 space-y-2">
                  <Users className="w-10 h-10 mx-auto opacity-30" />
                  <p className="font-medium">No available members found</p>
                  <p className="text-xs">
                    All team members may be offline or unavailable.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableMembers.map((member) => {
                    const porterId = member._id;
                    const isSelected = selectedIds.includes(porterId);
                    const name =
                      member.userId?.name ||
                      member.name ||
                      `Porter ${String(porterId).slice(-4)}`;
                    const email = member.userId?.email || "";
                    const phone = member.userId?.phone || "";
                    // Weight each porter can handle for this job
                    const perPorterWeight = Math.ceil(
                      booking.weightKg / requiredMembers,
                    );

                    return (
                      <button
                        key={porterId}
                        type="button"
                        onClick={() => togglePorter(porterId)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox icon */}
                          <div
                            className={`shrink-0 mt-0.5 ${
                              isSelected
                                ? "text-primary"
                                : "text-gray-300"
                            }`}
                          >
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </div>

                          {/* Avatar */}
                          <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {name.charAt(0).toUpperCase()}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-900">
                              {name}
                            </p>
                            {email && (
                              <p className="text-xs text-gray-500 truncate">
                                {email}
                              </p>
                            )}
                            {phone && (
                              <p className="text-xs text-gray-500">{phone}</p>
                            )}
                          </div>

                          {/* Weight capacity */}
                          <div className="shrink-0 text-right">
                            <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                              <Weight className="w-3 h-3" />
                              up to {member.maxWeightKg} kg
                            </p>
                            {member.maxWeightKg >= perPorterWeight ? (
                              <Badge className="text-xs bg-green-100 text-green-700 border-green-200 mt-1">
                                Capable
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-xs text-orange-600 border-orange-200 mt-1"
                              >
                                Low capacity
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>

            {/* Submit footer */}
            <CardFooter className="border-t pt-4">
              <Button
                className="w-full h-11 font-semibold"
                disabled={!canSubmit || selecting}
                onClick={handleSubmit}
              >
                {selecting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2" />
                )}
                {selecting
                  ? "Notifying porters…"
                  : `Select ${selectedIds.length} Porter${selectedIds.length !== 1 ? "s" : ""} & Notify`}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeamLeadSelectPorters;
