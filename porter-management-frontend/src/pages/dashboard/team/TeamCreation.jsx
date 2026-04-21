import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  UserPlus,
  Mail,
  Phone,
  User,
  Loader2,
  Trash2,
  Users,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Search,
  Send,
  X,
  Clock,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import {
  useGetAllRequestedPorterByTeam,
  useGetPorterByTeam,
  useGetTeamDashboard,
  useRequestPorterUserRegistration,
  useRemoveTeamMember,
  useSearchIndividualPorters,
  useInvitePorterToTeam,
  useGetPendingTeamJoinRequests,
  useGetInvitationHistory,
} from "../../../apis/hooks/porterTeamHooks";
import { usePorter } from "../../../hooks/porter/use-porter";

const TeamCreation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("members");

  // Invite-porters tab state
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchQuery, setSearchQuery] = useState(null);
  const [invitedIds, setInvitedIds] = useState(new Set());

  const { porter } = usePorter();

  const {
    mutateAsync: requestPorterUserRegistration,
    isPending: isRequestPorterUserRegistrationLoading,
  } = useRequestPorterUserRegistration();
  const { mutateAsync: removeTeamMember, isPending: isRemovingMember } =
    useRemoveTeamMember();
  const { mutateAsync: invitePorter, isPending: isInviting } =
    useInvitePorterToTeam();

  const { data: teamDashboard, isFetching: teamDashboardFetching } =
    useGetTeamDashboard();
  const { data: requestedPorterData, isFetching: requestedPorterFetching } =
    useGetAllRequestedPorterByTeam(porter?.teamId);
  const { data: porterByTeamData, isFetching: porterByTeamFetching } =
    useGetPorterByTeam(porter?.teamId);
  const { data: pendingInvitees, isFetching: pendingInviteesFetching } =
    useGetPendingTeamJoinRequests();
  const { data: invitationHistoryData, isFetching: historyFetching } =
    useGetInvitationHistory();

  // Search individual porters — only fires when searchQuery is explicitly set
  const {
    data: searchResults,
    isLoading: searching,
    isFetching: searchFetching,
  } = useSearchIndividualPorters(searchQuery, !!searchQuery);

  const members = teamDashboard?.members || [];
  const requestedPorter = requestedPorterData?.data?.data || [];
  const searchedPorters = Array.isArray(searchResults) ? searchResults : [];
  const pendingJoinRequests = Array.isArray(pendingInvitees) ? pendingInvitees : [];
  const acceptedInvitations = invitationHistoryData?.accepted || [];
  const declinedInvitations = invitationHistoryData?.declined || [];
  const historyCount = acceptedInvitations.length + declinedInvitations.length;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // ── Legacy: Register new user by email/phone ─────────────────────────────
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const newMember = {
        userName: data.username,
        email: data.email,
        phone: data.phone,
      };
      const response = await requestPorterUserRegistration(newMember);
      if (response.status !== 200 && response.status !== 201) {
        throw new Error("Failed to add team member.");
      }
      toast.success("Team member added successfully!");
      setIsOpen(false);
      reset();
    } catch (error) {
      console.error("Failed to add member:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to add team member. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await removeTeamMember(memberId);
      toast.success("Member removed successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove member");
    }
  };

  // ── Search & Invite (US-005) ──────────────────────────────────────────────
  const handleSearch = () => {
    if (!searchName && !searchPhone) {
      toast.error("Enter a name or phone number to search");
      return;
    }
    const q = {};
    if (searchName) q.name = searchName;
    if (searchPhone) q.phone = searchPhone;
    setSearchQuery(q);
  };

  const handleClearSearch = () => {
    setSearchName("");
    setSearchPhone("");
    setSearchQuery(null);
  };

  const handleInvite = async (porterId) => {
    try {
      await invitePorter(porterId);
      setInvitedIds((prev) => new Set([...prev, porterId]));
    } catch {
      /* toasted by hook */
    }
  };

  const isLoading = teamDashboardFetching || requestedPorterFetching || pendingInviteesFetching || historyFetching;

  return (
    <div className="w-full min-h-screen p-8 bg-gray-50">
      {/* Tab bar + legacy Add button */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div className="flex gap-2 flex-wrap">
          {/* Members tab */}
          <Button
            className={`gap-2 font-medium px-5 py-2.5 ${activeTab === "members" ? "bg-primary hover:bg-primary/90 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
            onClick={() => setActiveTab("members")}
          >
            <Users className="h-5 w-5" />
            Team Members
            {(members.length + pendingJoinRequests.length) > 0 && (
              <Badge variant="secondary" className="ml-1">
                {members.length + pendingJoinRequests.length}
              </Badge>
            )}
          </Button>

          {/* Pending requests tab */}
          {porter?.role === "owner" && (
            <Button
              className={`gap-2 font-medium px-5 py-2.5 ${activeTab === "requests" ? "bg-primary hover:bg-primary/90 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              onClick={() => setActiveTab("requests")}
            >
              <UserPlus className="h-5 w-5" />
              Pending Requests
              {requestedPorter.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {requestedPorter.length}
                </Badge>
              )}
            </Button>
          )}

          {/* NEW: Invite Porters tab */}
          {porter?.role === "owner" && (
            <Button
              className={`gap-2 font-medium px-5 py-2.5 ${activeTab === "invite" ? "bg-primary hover:bg-primary/90 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              onClick={() => setActiveTab("invite")}
            >
              <Send className="h-5 w-5" />
              Invite Porters
            </Button>
          )}

          {/* NEW: Invitation History tab */}
          {porter?.role === "owner" && (
            <Button
              className={`gap-2 font-medium px-5 py-2.5 ${activeTab === "history" ? "bg-primary hover:bg-primary/90 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              onClick={() => setActiveTab("history")}
            >
              <History className="h-5 w-5" />
              Invitation History
              {historyCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {historyCount}
                </Badge>
              )}
            </Button>
          )}
        </div>

        {/* Legacy: Add member via registration — hidden on invite/history tabs */}
        {porter?.role === "owner" && activeTab !== "invite" && activeTab !== "history" && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90 text-white font-medium px-6 py-2.5">
                <UserPlus className="h-5 w-5" />+ Add Team Member
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Invite Existing Porter
                </DialogTitle>
                <DialogDescription>
                  Enter the contact details of a registered porter to send them
                  a team invitation. They will receive a notification to accept
                  or decline.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5 py-4"
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <User className="h-4 w-4 text-primary" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    {...register("username", {
                      required: "Username is required",
                    })}
                  />
                  {errors.username && (
                    <p className="text-sm text-red-500">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Mail className="h-4 w-4 text-primary" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@gmail.com"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Phone className="h-4 w-4 text-primary" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    placeholder="9888888881"
                    {...register("phone", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Phone number must be 10 digits",
                      },
                    })}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <DialogFooter className="pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      isRequestPorterUserRegistrationLoading || isSubmitting
                    }
                    className="bg-primary hover:bg-primary/90"
                  >
                    {(isRequestPorterUserRegistrationLoading ||
                      isSubmitting) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Add Member
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* ── INVITE PORTERS TAB ── */}
      {activeTab === "invite" && (
        <div className="space-y-6">
          {/* Search bar */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Search Individual Porters
              </CardTitle>
              <p className="text-sm text-gray-500">
                Find active individual porters by name or phone and send them a
                team invitation.
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[160px]">
                  <Label className="text-xs text-gray-500 mb-1 block">
                    Name
                  </Label>
                  <Input
                    placeholder="e.g. Ramesh"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <div className="flex-1 min-w-[160px]">
                  <Label className="text-xs text-gray-500 mb-1 block">
                    Phone
                  </Label>
                  <Input
                    placeholder="e.g. 9800000001"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    onClick={handleSearch}
                    disabled={searching || searchFetching}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {searching || searchFetching ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Search
                  </Button>
                  {searchQuery && (
                    <Button
                      variant="outline"
                      onClick={handleClearSearch}
                      title="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search results */}
          {searchQuery && (
            <Card className="shadow-md">
              <CardHeader className="bg-white border-b pb-3">
                <CardTitle className="text-lg font-semibold">
                  {searching || searchFetching
                    ? "Searching…"
                    : `Results (${searchedPorters.length})`}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Phone</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="text-right font-semibold">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searching || searchFetching ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : searchedPorters.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-12 text-gray-500"
                        >
                          <div className="flex flex-col items-center gap-3">
                            <Search className="h-12 w-12 text-gray-300" />
                            <p className="font-medium">No porters found</p>
                            <p className="text-sm">
                              Try a different name or phone number
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      searchedPorters.map((p) => {
                        const porterId = p._id;
                        const alreadyInvited = invitedIds.has(porterId);
                        const alreadyInTeam = !!p.teamId;
                        const nameText = p.userId?.name || "—";
                        const phoneText = p.userId?.phone || "—";

                        return (
                          <TableRow key={porterId} className="hover:bg-gray-50">
                            <TableCell className="font-medium capitalize">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                  {nameText.charAt(0).toUpperCase()}
                                </div>
                                {nameText}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {phoneText}
                            </TableCell>
                            <TableCell>
                              {alreadyInTeam ? (
                                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                  In a Team
                                </Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                  Individual
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {alreadyInvited ? (
                                <Badge
                                  variant="outline"
                                  className="bg-yellow-50 text-yellow-700 border-yellow-200"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Invited
                                </Badge>
                              ) : alreadyInTeam ? (
                                <span className="text-xs text-gray-400">
                                  Not available
                                </span>
                              ) : (
                                <Button
                                  size="sm"
                                  disabled={isInviting}
                                  onClick={() => handleInvite(porterId)}
                                  className="bg-primary hover:bg-primary/90"
                                >
                                  {isInviting ? (
                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                  ) : (
                                    <Send className="h-3 w-3 mr-1" />
                                  )}
                                  Invite
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* No search yet */}
          {!searchQuery && (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4 text-gray-400">
              <Search className="w-14 h-14 opacity-20" />
              <p className="text-sm font-medium">
                Search for a porter above to send an invitation
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── MEMBERS, REQUESTS & HISTORY TABS ── */}
      {activeTab !== "invite" && (
        <Card className="shadow-md">
          <CardHeader className="bg-white border-b flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold">
              {activeTab === "members"
                ? "Team Members"
                : activeTab === "requests"
                  ? "Pending Registration Requests"
                  : "Invitation History"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {activeTab === "history" ? (
              <div className="p-6 space-y-8">
                {/* Accepted section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-green-700 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Accepted Invitations ({acceptedInvitations.length})
                  </h3>
                  {acceptedInvitations.length === 0 ? (
                    <p className="text-sm text-gray-500 italic ml-6">No accepted invitations yet.</p>
                  ) : (
                    <Table>
                      <TableBody>
                        {acceptedInvitations.map((inv) => (
                          <TableRow key={inv._id}>
                            <TableCell className="w-10">
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs">
                                {(inv.porterId?.userId?.name || "P").charAt(0).toUpperCase()}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {inv.porterId?.userId?.name}
                            </TableCell>
                            <TableCell className="text-gray-500">{inv.porterId?.userId?.email}</TableCell>
                            <TableCell className="text-right text-xs text-gray-400">
                              Accepted {new Date(inv.updatedAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>

                {/* Declined section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-red-700 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Declined Invitations ({declinedInvitations.length})
                  </h3>
                  {declinedInvitations.length === 0 ? (
                    <p className="text-sm text-gray-500 italic ml-6">No declined invitations yet.</p>
                  ) : (
                    <Table>
                      <TableBody>
                        {declinedInvitations.map((inv) => (
                          <TableRow key={inv._id}>
                            <TableCell className="w-10">
                              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">
                                {(inv.porterId?.userId?.name || "P").charAt(0).toUpperCase()}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium text-gray-700">
                              {inv.porterId?.userId?.name}
                            </TableCell>
                            <TableCell className="text-gray-500">{inv.porterId?.userId?.email}</TableCell>
                            <TableCell className="text-right text-xs text-gray-400">
                              Declined {new Date(inv.updatedAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {activeTab === "members" ? (
                      <>
                        <TableHead className="font-semibold">Name</TableHead>
                        <TableHead className="font-semibold">Email</TableHead>
                        <TableHead className="font-semibold">Phone</TableHead>
                        <TableHead className="font-semibold">Role</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Joined</TableHead>
                        <TableHead className="text-right font-semibold">
                          Actions
                        </TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead className="font-semibold">Name</TableHead>
                        <TableHead className="font-semibold">Email</TableHead>
                        <TableHead className="font-semibold">Phone</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Requested</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={activeTab === "members" ? 7 : 5}
                        className="text-center py-12"
                      >
                        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : activeTab === "members" ? (
                    members.length === 0 && pendingJoinRequests.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-12 text-gray-500"
                        >
                          <div className="flex flex-col items-center gap-3">
                            <Users className="h-16 w-16 text-gray-300" />
                            <p className="text-lg font-medium">
                              No team members yet
                            </p>
                            <p className="text-sm">
                              Use the &quot;Invite Porters&quot; tab to recruit individual
                              porters
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {/* ── Pending invitees (invited but not yet accepted) ── */}
                        {pendingJoinRequests.map((req) => {
                          const name = req.porterId?.userId?.name || "—";
                          const email = req.porterId?.userId?.email || "—";
                          const phone = req.porterId?.userId?.phone || "—";
                          return (
                            <TableRow
                              key={req._id}
                              className="hover:bg-amber-50 bg-amber-50/40"
                            >
                              <TableCell className="font-medium capitalize">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-sm">
                                    {name.charAt(0).toUpperCase()}
                                  </div>
                                  {name}
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-500 italic">
                                {email}
                              </TableCell>
                              <TableCell className="text-gray-500">
                                {phone}
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-gray-100 text-gray-400">
                                  —
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit">
                                  <Clock className="h-3 w-3" />
                                  Invitation Pending
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-400 text-sm">
                                {new Date(req.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell />
                            </TableRow>
                          );
                        })}

                        {/* ── Accepted members ── */}
                        {members.map((member) => (
                          <TableRow key={member._id} className="hover:bg-gray-50">
                            <TableCell className="font-medium capitalize">
                              {member.name}
                            </TableCell>
                            <TableCell>{member.email}</TableCell>
                            <TableCell>{member.phone}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  member.role === "owner"
                                    ? "bg-primary/10 text-primary"
                                    : "bg-gray-100 text-gray-600"
                                }
                              >
                                {member.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  member.isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }
                              >
                                {member.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(member.joinedAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              {member.role !== "owner" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={isRemovingMember}
                                  onClick={() => handleRemoveMember(member._id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    )
                  ) : requestedPorter.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-12 text-gray-500"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <CheckCircle className="h-16 w-16 text-gray-300" />
                          <p className="text-lg font-medium">
                            No pending requests
                          </p>
                          <p className="text-sm">
                            All registration requests have been processed
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    requestedPorter.map((request) => (
                      <TableRow key={request._id} className="hover:bg-gray-50">
                        <TableCell className="font-medium capitalize">
                          {request.userName || request.porterId?.userId?.name}
                        </TableCell>
                        <TableCell>
                          {request.email || request.porterId?.userId?.email}
                        </TableCell>
                        <TableCell>
                          {request.phone || request.porterId?.userId?.phone}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-orange-100 text-orange-700 border-orange-200"
                          >
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(request.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeamCreation;
