/**
 * @file PorterInvitations.jsx
 * @description Page for individual porters to view and respond to pending team invitations.
 *
 * Flow (Section 2 of API docs - US-005):
 *   Team owner invites an individual porter → porter sees it here → accept / decline
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Bell,
  ArrowLeft,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  useGetMyPendingInvitations,
  useRespondToTeamInvitation,
} from "../../../apis/hooks/porterTeamHooks";

const PorterInvitations = () => {
  const navigate = useNavigate();

  const {
    data: invitations,
    isLoading,
    refetch,
  } = useGetMyPendingInvitations();

  const { mutateAsync: respond, isPending: responding } =
    useRespondToTeamInvitation();

  const handleRespond = async (requestId, action) => {
    try {
      await respond({ requestId, action });
      refetch();
    } catch {
      /* toasted by hook */
    }
  };

  const invitationList = Array.isArray(invitations) ? invitations : [];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard/porters")}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Team Invitations
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Pending invitations to join a porter team.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <Loader2
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-3">
        <Shield className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-700">
          When you <span className="font-semibold">accept</span> an invitation
          your account will be linked to that team. You'll still need admin
          approval before you can accept team bookings.
        </p>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-gray-500">Loading invitations…</p>
        </div>
      ) : invitationList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
            <Bell className="w-10 h-10 text-gray-300" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-700">
              No pending invitations
            </p>
            <p className="text-sm text-gray-500 mt-1">
              You'll see team invitations here once a team owner invites you.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/porters")}
          >
            Back to Dashboard
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {invitationList.map((inv) => {
            const teamOwnerName =
              inv.teamId?.ownerId?.name ||
              inv.invitedBy?.name ||
              "Team Owner";
            const teamMemberCount = inv.teamId?.noOfMember ?? "—";
            const receivedAt = inv.createdAt
              ? new Date(inv.createdAt).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : null;

            return (
              <Card
                key={inv._id}
                className="border-l-4 border-l-primary hover:shadow-md transition-all"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {teamOwnerName.charAt(0).toUpperCase()}
                      </div>
                      Team Invitation from{" "}
                      <span className="text-primary">{teamOwnerName}</span>
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      Pending Response
                    </Badge>
                  </div>
                  <CardDescription className="mt-1">
                    You have been invited to join this team as a member.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 pb-2">
                  <Separator className="mb-3" />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4 text-gray-400 shrink-0" />
                      <span>{teamMemberCount} current members</span>
                    </div>
                    {receivedAt && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                        <span>Received {receivedAt}</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="pt-2 border-t flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    disabled={responding}
                    onClick={() => handleRespond(inv._id, "DECLINED")}
                  >
                    {responding ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Decline
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={responding}
                    onClick={() => handleRespond(inv._id, "ACCEPTED")}
                  >
                    {responding ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Accept
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PorterInvitations;
