import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { UserPlus, Mail, Phone, User, Loader2, Trash2, Users, CheckCircle } from "lucide-react";
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
} from "../../../apis/hooks/porterTeamHooks";
import { usePorter } from "../../../hooks/porter/use-porter";

const TeamCreation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("members");

  const { porter } = usePorter();

  const { mutateAsync: requestPorterUserRegistration, isPending: isRequestPorterUserRegistrationLoading } = useRequestPorterUserRegistration();
  const { mutateAsync: removeTeamMember, isPending: isRemovingMember } = useRemoveTeamMember();

  const { data: teamDashboard, isFetching: teamDashboardFetching } = useGetTeamDashboard();
  const { data: requestedPorterData, isFetching: requestedPorterFetching } = useGetAllRequestedPorterByTeam(porter?.teamId);
  const { data: porterByTeamData, isFetching: porterByTeamFetching } = useGetPorterByTeam(porter?.teamId);

  const members = teamDashboard?.members || [];
  const requestedPorter = requestedPorterData?.data?.data || [];

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

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
      toast.error(error?.response?.data?.message || "Failed to add team member. Please try again.");
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

  const isLoading = teamDashboardFetching || requestedPorterFetching;

  return (
    <div className="w-full min-h-screen p-8 bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-4">
          <Button
            className={`gap-2 font-medium px-6 py-2.5 ${activeTab === "members" ? "bg-primary hover:bg-primary/90 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
            onClick={() => setActiveTab("members")}
          >
            <Users className="h-5 w-5" />
            Team Members
            {members.length > 0 && (
              <Badge variant="secondary" className="ml-1">{members.length}</Badge>
            )}
          </Button>
          <Button
            className={`gap-2 font-medium px-6 py-2.5 ${activeTab === "requests" ? "bg-primary hover:bg-primary/90 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
            onClick={() => setActiveTab("requests")}
          >
            <UserPlus className="h-5 w-5" />
            Pending Requests
            {requestedPorter.length > 0 && (
              <Badge variant="secondary" className="ml-1">{requestedPorter.length}</Badge>
            )}
          </Button>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-white font-medium px-6 py-2.5">
              <UserPlus className="h-5 w-5" />
              +Add Team Member
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-125">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Add Team Member</DialogTitle>
              <DialogDescription>Fill in the details to add a new member to your team.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4 text-primary" />
                  Username
                </Label>
                <Input
                  id="username"
                  placeholder="Enter username"
                  {...register("username", { required: "Username is required" })}
                  className="w-full"
                />
                {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="h-4 w-4 text-primary" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@gmail.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" },
                  })}
                  className="w-full"
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
                  <Phone className="h-4 w-4 text-primary" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  placeholder="9888888881"
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: { value: /^[0-9]{10}$/, message: "Phone number must be 10 digits" },
                  })}
                  className="w-full"
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isRequestPorterUserRegistrationLoading || isSubmitting} className="bg-primary hover:bg-primary/90">
                  {isRequestPorterUserRegistrationLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Member
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-md">
        <CardHeader className="bg-white border-b">
          <CardTitle className="text-xl font-semibold">
            {activeTab === "members" ? "Team Members" : "Pending Registration Requests"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
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
                    <TableHead className="text-right font-semibold">Actions</TableHead>
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
                  <TableCell colSpan={activeTab === "members" ? 7 : 5} className="text-center py-12">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                  </TableCell>
                </TableRow>
              ) : activeTab === "members" ? (
                members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="h-16 w-16 text-gray-300" />
                        <p className="text-lg font-medium">No team members yet</p>
                        <p className="text-sm">Click "+Add Team Member" button to add your first member</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member) => (
                    <TableRow key={member._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium capitalize">{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell>
                        <Badge className={member.role === "owner" ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-600"}>
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={member.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                          {member.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(member.joinedAt).toLocaleDateString()}</TableCell>
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
                  ))
                )
              ) : requestedPorter.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <CheckCircle className="h-16 w-16 text-gray-300" />
                      <p className="text-lg font-medium">No pending requests</p>
                      <p className="text-sm">All registration requests have been processed</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                requestedPorter.map((request) => (
                  <TableRow key={request._id} className="hover:bg-gray-50">
                    <TableCell className="font-medium capitalize">
                      {request.userName || request.porterId?.userId?.name}
                    </TableCell>
                    <TableCell>{request.email || request.porterId?.userId?.email}</TableCell>
                    <TableCell>{request.phone || request.porterId?.userId?.phone}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamCreation;
