import React, { useEffect, useState, useCallback } from "react";
import {
  getAllUsers,
  banUser,
  unbanUser,
  deleteUser,
} from "@/apis/services/adminService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Search,
  RefreshCw,
  Users,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";

const ROLE_BADGE = {
  user: "bg-blue-100 text-blue-800 border-blue-200",
  porter: "bg-emerald-100 text-emerald-800 border-emerald-200",
  admin: "bg-purple-100 text-purple-800 border-purple-200",
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Ban Modal
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [banLoading, setBanLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [banReason, setBanReason] = useState("");

  // Detail Sheet
  const [detailUser, setDetailUser] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Action loading states
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const fetchUsers = useCallback(
    async (currentPage = 1) => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllUsers({
          searchText: debouncedSearch || undefined,
          role: filterRole || undefined,
          page: currentPage,
          limit: 10,
        });
        if (response.data.success) {
          setUsers(response.data.data || []);
          setPagination(
            response.data.pagination || { total: 0, pages: 1 }
          );
        } else {
          // 204 No Content case
          setUsers([]);
        }
      } catch (err) {
        // 204 returns empty, treat gracefully
        if (err.response?.status === 204) {
          setUsers([]);
          setPagination({ total: 0, pages: 1 });
        } else {
          console.error("Failed to fetch users:", err);
          setError("Failed to load users. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, filterRole]
  );

  useEffect(() => {
    setPage(1);
    fetchUsers(1);
  }, [debouncedSearch, filterRole]);

  const handleBanToggle = (user) => {
    if (user.isBanned) {
      handleUnban(user._id);
    } else {
      setSelectedUser(user);
      setIsBanModalOpen(true);
    }
  };

  const handleBanSubmit = async () => {
    if (!banReason.trim()) return;
    setBanLoading(true);
    try {
      await banUser(selectedUser._id, {
        userStatus: true,
        remarks: banReason,
      });
      setIsBanModalOpen(false);
      setBanReason("");
      setSelectedUser(null);
      fetchUsers(page);
    } catch (err) {
      console.error("Failed to ban user:", err);
      alert(err.response?.data?.message || "Failed to ban user.");
    } finally {
      setBanLoading(false);
    }
  };

  const handleUnban = async (id) => {
    setActionLoadingId(id + "-unban");
    try {
      await unbanUser(id, { remarks: "Unbanned by admin" });
      fetchUsers(page);
    } catch (err) {
      console.error("Failed to unban user:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to soft-delete this user?")) return;
    setActionLoadingId(id + "-delete");
    try {
      await deleteUser(id, { isDeleted: true });
      fetchUsers(page);
    } catch (err) {
      console.error("Failed to delete user:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            User Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage system users, roles, and account status.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchUsers(page)}
          disabled={loading}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
        <select
          className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="porter">Porter</option>
          <option value="admin">Admin</option>
        </select>
        {pagination.total > 0 && (
          <span className="text-sm text-gray-500">
            {pagination.total} user{pagination.total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Phone</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="text-right font-semibold pr-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16">
                  <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No users found.</p>
                  {debouncedSearch && (
                    <p className="text-gray-400 text-sm mt-1">
                      Try a different search term.
                    </p>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-900">
                    {user.name}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {user.email || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {user.phone}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`capitalize ${ROLE_BADGE[user.role] || "bg-gray-100 text-gray-700 border-gray-200"}`}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.isDeleted ? (
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        Deleted
                      </Badge>
                    ) : user.isBanned ? (
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                        Banned
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setDetailUser(user);
                          setIsDetailOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!user.isDeleted && (
                        <Button
                          variant={user.isBanned ? "outline" : "secondary"}
                          size="sm"
                          className={`h-8 px-3 text-xs ${
                            user.isBanned
                              ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                              : "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200"
                          }`}
                          onClick={() => handleBanToggle(user)}
                          disabled={actionLoadingId === user._id + "-unban"}
                        >
                          {actionLoadingId === user._id + "-unban" ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : user.isBanned ? (
                            "Unban"
                          ) : (
                            "Ban"
                          )}
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-8 px-3 text-xs"
                        onClick={() => handleDelete(user._id)}
                        disabled={
                          user.isDeleted ||
                          actionLoadingId === user._id + "-delete"
                        }
                      >
                        {actionLoadingId === user._id + "-delete" ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          "Delete"
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page} of {pagination.pages} ({pagination.total} total)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newPage = page - 1;
                setPage(newPage);
                fetchUsers(newPage);
              }}
              disabled={page <= 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newPage = page + 1;
                setPage(newPage);
                fetchUsers(newPage);
              }}
              disabled={page >= pagination.pages || loading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Ban Modal */}
      <Dialog open={isBanModalOpen} onOpenChange={setIsBanModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              You are about to ban{" "}
              <span className="font-semibold">{selectedUser?.name}</span>. They
              will no longer be able to log in until unbanned.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ban-reason">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ban-reason"
                placeholder="e.g. Fraudulent activity, repeated violations..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setIsBanModalOpen(false);
                setBanReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBanSubmit}
              disabled={!banReason.trim() || banLoading}
            >
              {banLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>User Details</SheetTitle>
            <SheetDescription>
              Account profile for {detailUser?.name}
            </SheetDescription>
          </SheetHeader>
          {detailUser && (
            <div className="mt-6 space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
                  {detailUser.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-lg">{detailUser.name}</p>
                  <Badge
                    className={`capitalize text-xs ${ROLE_BADGE[detailUser.role] || ""}`}
                  >
                    {detailUser.role}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Phone
                  </p>
                  <p className="text-sm font-medium mt-1">{detailUser.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Email
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {detailUser.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Account Status
                  </p>
                  <div className="mt-1">
                    {detailUser.isDeleted ? (
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        Deleted
                      </Badge>
                    ) : detailUser.isBanned ? (
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                        Banned
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
                {detailUser.isBanned && detailUser.remarks && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                      Ban Reason
                    </p>
                    <p className="text-sm mt-1 text-orange-700 bg-orange-50 p-2 rounded">
                      {detailUser.remarks}
                    </p>
                  </div>
                )}
                {detailUser.createdAt && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                      Joined
                    </p>
                    <p className="text-sm mt-1">
                      {new Date(detailUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              {/* Actions in detail */}
              {!detailUser.isDeleted && (
                <div className="border-t pt-4 flex gap-3">
                  <Button
                    variant="outline"
                    className={`flex-1 ${
                      detailUser.isBanned
                        ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                        : "border-orange-300 text-orange-700 hover:bg-orange-50"
                    }`}
                    onClick={() => {
                      handleBanToggle(detailUser);
                      setIsDetailOpen(false);
                    }}
                  >
                    {detailUser.isBanned ? "Unban User" : "Ban User"}
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      handleDelete(detailUser._id);
                      setIsDetailOpen(false);
                    }}
                  >
                    Delete User
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default UserManagement;
