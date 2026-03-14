import React, { useEffect, useState } from "react";
import { getAllUsers, banUser, unbanUser, deleteUser } from "../../../apis/services/adminService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  
  // Ban Modal State
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [banReason, setBanReason] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers({
        searchText: searchTerm,
        role: filterRole,
      });
      if (response.data.success) {
        setUsers(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, filterRole]);

  const handleBanToggle = (user) => {
    if (user.isBanned) {
      handleUnban(user._id);
    } else {
      setSelectedUser(user);
      setIsBanModalOpen(true);
    }
  };

  const handleBanSubmit = async () => {
    if (!banReason) return;
    try {
      const response = await banUser(selectedUser._id, {
        userStatus: true,
        remarks: banReason,
      });
      if (response.data.success) {
        setIsBanModalOpen(false);
        setBanReason("");
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to ban user:", error);
    }
  };

  const handleUnban = async (id) => {
    try {
      const response = await unbanUser(id, { remarks: "Unbanned by admin" });
      if (response.data.success) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to unban user:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to soft-delete this user?")) {
      try {
        const response = await deleteUser(id, { isDeleted: true });
        if (response.data.success) {
          fetchUsers();
        }
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage system users, roles, and account status.</p>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <select
          className="border rounded p-2"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="porter">Porter</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Loading users...</TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">No users found.</TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    {user.isDeleted ? (
                      <Badge variant="destructive">Deleted</Badge>
                    ) : user.isBanned ? (
                      <Badge variant="secondary">Banned</Badge>
                    ) : (
                      <Badge variant="success" className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant={user.isBanned ? "outline" : "secondary"}
                      size="sm"
                      onClick={() => handleBanToggle(user)}
                    >
                      {user.isBanned ? "Unban" : "Ban"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(user._id)}
                      disabled={user.isDeleted}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isBanModalOpen} onOpenChange={setIsBanModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User: {selectedUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for banning</Label>
              <Input
                id="reason"
                placeholder="Enter reason..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsBanModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleBanSubmit} disabled={!banReason}>Ban User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
