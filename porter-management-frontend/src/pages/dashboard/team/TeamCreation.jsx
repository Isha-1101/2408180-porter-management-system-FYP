import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { UserPlus, Mail, Phone, User, Loader2, Trash2 } from "lucide-react";
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
import { toast } from "react-hot-toast";

const TeamCreation = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [members, setMembers] = useState([]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const newMember = {
                id: Date.now(),
                name: data.username,
                email: data.email,
                phone: data.phone
            };
            setMembers([...members, newMember]);
            toast.success("Team member added successfully!");
            setIsOpen(false);
            reset();
        } catch (error) {
            console.error("Failed to add member:", error);
            toast.error("Failed to add team member. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (id) => {
        setMembers(members.filter(member => member.id !== id));
        toast.success("Member removed successfully");
    };

    return (
        <div className="w-full min-h-screen p-8 bg-gray-50">
            {/* Header with Button */}
            <div className="flex justify-between items-center mb-8">
                {/* +Add Team Member Button - Top Left */}
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-primary hover:bg-primary/90 text-white font-medium px-6 py-2.5">
                            <UserPlus className="h-5 w-5" />
                            +Add Team Member
                        </Button>
                    </DialogTrigger>

                    {/* Form Dialog */}
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold">Add Team Member</DialogTitle>
                            <DialogDescription>
                                Fill in the details to add a new member to your team.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
                            {/* Username Field */}
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
                                {errors.username && (
                                    <p className="text-sm text-red-500">{errors.username.message}</p>
                                )}
                            </div>

                            {/* Email Field */}
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
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address"
                                        }
                                    })}
                                    className="w-full"
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Phone Field */}
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
                                        pattern: {
                                            value: /^[0-9]{10}$/,
                                            message: "Phone number must be 10 digits"
                                        }
                                    })}
                                    className="w-full"
                                />
                                {errors.phone && (
                                    <p className="text-sm text-red-500">{errors.phone.message}</p>
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
                                    disabled={isLoading}
                                    className="bg-primary hover:bg-primary/90"
                                >
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Add Member
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <h1 className="text-3xl font-bold text-gray-900">Team Creation</h1>
            </div>

            {/* Team Members List */}
            <Card className="shadow-md">
                <CardHeader className="bg-white border-b">
                    <CardTitle className="text-xl font-semibold">
                        Team Members ({members.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-semibold">Name</TableHead>
                                <TableHead className="font-semibold">Email</TableHead>
                                <TableHead className="font-semibold">Phone</TableHead>
                                <TableHead className="text-right font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {members.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-12 text-gray-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <UserPlus className="h-16 w-16 text-gray-300" />
                                            <p className="text-lg font-medium">No team members yet</p>
                                            <p className="text-sm">Click "+Add Team Member" button to add your first member</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                members.map((member) => (
                                    <TableRow key={member.id} className="hover:bg-gray-50">
                                        <TableCell className="font-medium">{member.name}</TableCell>
                                        <TableCell className="text-gray-600">{member.email}</TableCell>
                                        <TableCell className="text-gray-600">{member.phone}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDelete(member.id)}
                                                title="Remove member"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
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
