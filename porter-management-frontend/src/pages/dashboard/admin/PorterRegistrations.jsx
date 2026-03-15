import React, { useEffect, useState, useCallback } from "react";
import {
  getAllPorterRegistrations,
  approveRegistration,
  rejectRegistration,
} from "@/apis/services/adminService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";

const STATUS_BADGE = {
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  submitted: "bg-blue-100 text-blue-800 border-blue-200",
  draft: "bg-gray-100 text-gray-700 border-gray-200",
};

const STATUS_ICON = {
  approved: <CheckCircle className="w-3 h-3" />,
  rejected: <XCircle className="w-3 h-3" />,
  submitted: <Clock className="w-3 h-3" />,
  draft: <FileText className="w-3 h-3" />,
};

const PorterRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("submitted");
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  // Rejection Modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [selectedReg, setSelectedReg] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Approve loading
  const [approveLoadingId, setApproveLoadingId] = useState(null);

  // Detail Sheet
  const [detailReg, setDetailReg] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchRegistrations = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllPorterRegistrations({
          status: statusFilter,
          page,
          limit: 10,
        });
        if (response.data.success) {
          setRegistrations(response.data.data || []);
          setPagination(
            response.data.pagination || { total: 0, page: 1, pages: 1 },
          );
        }
      } catch (err) {
        console.error("Failed to fetch registrations:", err);
        setError("Failed to load registrations. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter],
  );

  useEffect(() => {
    fetchRegistrations(1);
  }, [fetchRegistrations]);

  const handleApprove = async (regId) => {
    setApproveLoadingId(regId);
    try {
      await approveRegistration(regId);
      fetchRegistrations(pagination.page);
    } catch (error) {
      console.error("Failed to approve registration:", error);
      alert(
        error.response?.data?.message || "Approval failed. Please try again.",
      );
    } finally {
      setApproveLoadingId(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) return;
    setRejectLoading(true);
    try {
      await rejectRegistration(selectedReg.registrationId, { rejectionReason });
      setIsRejectModalOpen(false);
      setRejectionReason("");
      setSelectedReg(null);
      fetchRegistrations(pagination.page);
    } catch (error) {
      console.error("Failed to reject registration:", error);
      alert(
        error.response?.data?.message || "Rejection failed. Please try again.",
      );
    } finally {
      setRejectLoading(false);
    }
  };

  const openDetail = (reg) => {
    setDetailReg(reg);
    setIsDetailOpen(true);
  };

  const tabs = [
    { value: "submitted", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "draft", label: "Drafts" },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Porter Registrations
          </h1>
          <p className="text-gray-500 mt-1">
            Review and approve or reject porter applications.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchRegistrations(pagination.page)}
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

      {/* Tabs + Table */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="mb-4">
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Reg ID</TableHead>
                <TableHead className="font-semibold">Applicant</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold">Updated</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold pr-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : registrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">
                      No {statusFilter} registrations found.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                registrations.map((reg) => (
                  <TableRow key={reg._id} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-xs text-gray-600">
                      {reg.registrationId}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {reg.userId?.name || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {reg.userId?.email || reg.userId?.phone || ""}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize text-sm">
                      {reg.registrationType || "—"}
                    </TableCell>
                    <TableCell className="capitalize text-sm">
                      {reg.role || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(reg.updatedAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`capitalize flex items-center gap-1 w-fit ${STATUS_BADGE[reg.status] || "bg-gray-100 text-gray-700"}`}
                      >
                        {STATUS_ICON[reg.status]}
                        {reg.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-2">
                        {reg.status === "submitted" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3"
                              onClick={() => handleApprove(reg.registrationId)}
                              disabled={approveLoadingId === reg.registrationId}
                            >
                              {approveLoadingId === reg.registrationId ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : (
                                "Approve"
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 px-3"
                              onClick={() => {
                                setSelectedReg(reg);
                                setIsRejectModalOpen(true);
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openDetail(reg)}
                        >
                          <Eye className="h-4 w-4" />
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
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">
              Showing page {pagination.page} of {pagination.pages} (
              {pagination.total} total)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchRegistrations(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchRegistrations(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages || loading}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Tabs>

      {/* Rejection Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Registration</DialogTitle>
            <DialogDescription>
              Registration ID:{" "}
              <span className="font-mono font-medium">
                {selectedReg?.registrationId}
              </span>{" "}
              by{" "}
              <span className="font-medium">{selectedReg?.userId?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">
                Reason for rejection <span className="text-red-500">*</span>
              </Label>
              <Input
                id="reject-reason"
                placeholder="e.g. Incomplete documents, invalid license..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setIsRejectModalOpen(false);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={!rejectionReason.trim() || rejectLoading}
            >
              {rejectLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Registration Details</SheetTitle>
            <SheetDescription>
              Full details for{" "}
              <span className="font-mono">{detailReg?.registrationId}</span>
            </SheetDescription>
          </SheetHeader>
          {detailReg && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Applicant
                  </p>
                  <p className="text-sm font-semibold mt-1">
                    {detailReg.userId?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Email
                  </p>
                  <p className="text-sm mt-1">
                    {detailReg.userId?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Phone
                  </p>
                  <p className="text-sm mt-1">
                    {detailReg.userId?.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Status
                  </p>
                  <Badge
                    className={`mt-1 capitalize ${STATUS_BADGE[detailReg.status]}`}
                  >
                    {detailReg.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Type
                  </p>
                  <p className="text-sm mt-1 capitalize">
                    {detailReg.registrationType || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Role
                  </p>
                  <p className="text-sm mt-1 capitalize">
                    {detailReg.role || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Submitted
                  </p>
                  <p className="text-sm mt-1">
                    {new Date(detailReg.updatedAt).toLocaleString()}
                  </p>
                </div>
                {detailReg.rejectionReason && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                      Rejection Reason
                    </p>
                    <p className="text-sm mt-1 text-red-600 bg-red-50 p-2 rounded">
                      {detailReg.rejectionReason}
                    </p>
                  </div>
                )}
              </div>

              {/* Porter-specific info */}
              {detailReg.basicInfo && (
                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">
                    Basic Info
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {Object.entries(detailReg.basicInfo)
                      .filter(([, v]) => typeof v !== "object" && v)
                      .map(([k, v]) => (
                        <div key={k}>
                          <span className="text-gray-500 capitalize">
                            {k.replace(/([A-Z])/g, " $1")}:{" "}
                          </span>
                          <span className="font-medium">{String(v)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Actions in detail */}
              {detailReg.status === "submitted" && (
                <div className="border-t pt-4 flex gap-3">
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      handleApprove(detailReg.registrationId);
                      setIsDetailOpen(false);
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      setSelectedReg(detailReg);
                      setIsDetailOpen(false);
                      setIsRejectModalOpen(true);
                    }}
                  >
                    Reject
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

export default PorterRegistrations;
