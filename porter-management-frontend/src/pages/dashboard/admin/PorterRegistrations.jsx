import React, { useEffect, useState, useCallback } from "react";
import {
  getAllPorterRegistrations,
  approveRegistration,
  rejectRegistration,
  getAllTeamMemberRequests,
  approveTeamMemberRequest,
  rejectTeamMemberRequest
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
import { getCloudinaryUrl } from "@/utils/helper";

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
        const [regResponse, teamReqResponse] = await Promise.all([
          getAllPorterRegistrations({
            status: statusFilter,
            page,
            limit: 10,
          }),
          getAllTeamMemberRequests({
            status: statusFilter,
            page,
            limit: 10,
          }),
        ]);

        let combined = [];
        let returnedPagination = { total: 0, page: 1, pages: 1 };

        if (regResponse.data?.success) {
          const normalRegs = (regResponse.data.data || []).map((r) => ({
            ...r,
            requestCategory: "registration",
          }));
          combined = [...combined, ...normalRegs];
          returnedPagination = regResponse.data.pagination || returnedPagination;
        }

        if (teamReqResponse.data?.success) {
          const teamRegs = (teamReqResponse.data.data || []).map((r) => ({
            ...r,
            registrationId: "TREQ-" + r._id.substring(0, 6).toUpperCase(),
            userId: {
              name: r.userName || "N/A",
              phone: r.phone || "",
              email: r.email || "",
            },
            registrationType: "Team Member Request",
            role: "porter",
            requestCategory: "team_member_addition",
            submittedBy: r.teamId?.ownerId?.name || "Unknown Team",
            status: r.status === "pending" ? "submitted" : r.status,
          }));
          combined = [...combined, ...teamRegs];
        }

        // Sort combined to show newest first
        combined.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        setRegistrations(combined);
        setPagination(returnedPagination);
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

  const handleApprove = async (reg) => {
    setApproveLoadingId(reg.registrationId);
    try {
      if (reg.requestCategory === "team_member_addition") {
        await approveTeamMemberRequest(reg._id);
      } else {
        await approveRegistration(reg.registrationId);
      }
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
      if (selectedReg.requestCategory === "team_member_addition") {
        await rejectTeamMemberRequest(selectedReg._id, { rejectionReason });
      } else {
        await rejectRegistration(selectedReg.registrationId, { rejectionReason });
      }
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
                  <TableRow
                    key={reg._id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => openDetail(reg)}
                  >
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
                        {reg.requestCategory === "team_member_addition" && (
                          <p className="text-xs text-blue-600 mt-0.5">
                            Added by: {reg.submittedBy}
                          </p>
                        )}
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
                    <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {reg.status === "submitted" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3"
                              onClick={() => handleApprove(reg)}
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
      </Dialog>      {/* Detail Dialog - centered */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-4xl lg:max-w-6xl w-full max-h-[92vh] overflow-y-auto p-6 md:p-8">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-bold">
              Applicant Registration Details
            </DialogTitle>
          </DialogHeader>

          {detailReg && (
            <div className="space-y-6 py-2">

              {/* ── Applicant Overview ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/70 border border-slate-100 rounded-xl p-5 shadow-xs">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Applicant</p>
                  <p className="text-sm font-semibold text-slate-800">{detailReg.userId?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Email</p>
                  <p className="text-sm text-slate-650 break-all">{detailReg.userId?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Phone</p>
                  <p className="text-sm text-slate-650">{detailReg.userId?.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Status</p>
                  <Badge className={`capitalize flex items-center gap-1.5 w-fit mt-0.5 px-2.5 py-0.5 border ${STATUS_BADGE[detailReg.status]}`}>
                    {STATUS_ICON[detailReg.status]}
                    {detailReg.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Type</p>
                  <p className="text-sm capitalize text-slate-650">{detailReg.registrationType || "—"}</p>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Submitted</p>
                  <p className="text-sm text-slate-650">{new Date(detailReg.updatedAt).toLocaleString()}</p>
                </div>
                {detailReg.rejectionReason && (
                  <div className="col-span-4 bg-red-50/70 border border-red-200 rounded-lg p-3.5 mt-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-red-500 mb-1">Rejection Reason</p>
                    <p className="text-sm text-red-700">{detailReg.rejectionReason}</p>
                  </div>
                )}
              </div>

              {detailReg.basicInfo && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Details */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* ── Basic Info ── */}
                    <div className="space-y-3.5">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Basic Info</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="bg-slate-50/40 hover:bg-white rounded-xl border border-slate-100 p-3.5 transition-all shadow-xs">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Full Name</p>
                          <p className="text-sm font-semibold text-slate-800">{detailReg.basicInfo.fullName}</p>
                        </div>
                        <div className="bg-slate-50/40 hover:bg-white rounded-xl border border-slate-100 p-3.5 transition-all shadow-xs">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Phone</p>
                          <p className="text-sm font-semibold text-slate-800">{detailReg.basicInfo.phone}</p>
                        </div>
                        <div className="sm:col-span-2 bg-slate-50/40 hover:bg-white rounded-xl border border-slate-100 p-3.5 transition-all shadow-xs">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Address</p>
                          <p className="text-sm font-semibold text-slate-800">{detailReg.basicInfo.address}</p>
                        </div>
                        <div className="bg-slate-50/40 hover:bg-white rounded-xl border border-slate-100 p-3.5 transition-all shadow-xs">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Identity Type</p>
                          <p className="text-sm font-semibold text-slate-800">
                            {detailReg.basicInfo.identityType === "verification_id"
                              ? "Verification ID"
                              : detailReg.basicInfo.identityType?.replace("_", " ")}
                          </p>
                        </div>
                        <div className="bg-slate-50/40 hover:bg-white rounded-xl border border-slate-100 p-3.5 transition-all shadow-xs">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Identity Number</p>
                          <p className="text-sm font-semibold text-slate-800">{detailReg.basicInfo.identityNumber}</p>
                        </div>
                      </div>
                    </div>

                    {/* ── Vehicle Info ── */}
                    {detailReg.vehicle && (
                      <div className="space-y-3.5 pt-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Vehicle Info</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div className="bg-slate-50/40 hover:bg-white rounded-xl border border-slate-100 p-3.5 transition-all shadow-xs">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Has Vehicle</p>
                            <p className="text-sm font-semibold text-slate-800">{detailReg.vehicle.hasVehicle ? "Yes" : "No"}</p>
                          </div>
                          {detailReg.vehicle.hasVehicle && (
                            <>
                              <div className="bg-slate-50/40 hover:bg-white rounded-xl border border-slate-100 p-3.5 transition-all shadow-xs">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Category</p>
                                <p className="text-sm font-semibold capitalize text-slate-800">{detailReg.vehicle.vehicleCategory}</p>
                              </div>
                              <div className="bg-slate-50/40 hover:bg-white rounded-xl border border-slate-100 p-3.5 transition-all shadow-xs">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Number</p>
                                <p className="text-sm font-semibold text-slate-800">{detailReg.vehicle.vehicleNumber}</p>
                              </div>
                              {detailReg.vehicle.capacity && (
                                <div className="bg-slate-50/40 hover:bg-white rounded-xl border border-slate-100 p-3.5 transition-all shadow-xs">
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Capacity</p>
                                  <p className="text-sm font-semibold text-slate-800">{detailReg.vehicle.capacity}</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Documents */}
                  <div className="lg:col-span-5 space-y-6 lg:border-l lg:pl-8 border-slate-100">
                    <div className="space-y-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Uploaded Documents</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                        {detailReg.basicInfo.porterPhoto && (
                          <div className="bg-slate-50/30 border border-slate-100 rounded-2xl p-3.5 shadow-xs hover:shadow-sm transition-all">
                            <p className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Porter Photo</p>
                            <a href={getCloudinaryUrl(detailReg.basicInfo.porterPhoto)} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-slate-200/60 shadow-xs">
                              <img
                                src={getCloudinaryUrl(detailReg.basicInfo.porterPhoto)}
                                alt="Porter"
                                className="w-full h-40 object-cover hover:scale-[1.03] transition duration-305"
                              />
                            </a>
                          </div>
                        )}
                        {detailReg.basicInfo.registrationIdDocument?.flatMap((doc, idx) => [
                          doc.identityCardImageFront && (
                            <div key={`front-${idx}`} className="bg-slate-50/30 border border-slate-100 rounded-2xl p-3.5 shadow-xs hover:shadow-sm transition-all">
                              <p className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wide">ID Front</p>
                              <a href={getCloudinaryUrl(doc.identityCardImageFront)} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-slate-200/60 shadow-xs">
                                <img
                                  src={getCloudinaryUrl(doc.identityCardImageFront)}
                                  alt="ID Front"
                                  className="w-full h-40 object-cover hover:scale-[1.03] transition duration-305"
                                />
                              </a>
                            </div>
                          ),
                          doc.identityCardImageBack && (
                            <div key={`back-${idx}`} className="bg-slate-50/30 border border-slate-100 rounded-2xl p-3.5 shadow-xs hover:shadow-sm transition-all">
                              <p className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wide">ID Back</p>
                              <a href={getCloudinaryUrl(doc.identityCardImageBack)} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-slate-200/60 shadow-xs">
                                <img
                                  src={getCloudinaryUrl(doc.identityCardImageBack)}
                                  alt="ID Back"
                                  className="w-full h-40 object-cover hover:scale-[1.03] transition duration-305"
                                />
                              </a>
                            </div>
                          ),
                        ].filter(Boolean))}
                        {detailReg.documents?.porterLicenseDocument && (
                          <div className="bg-slate-50/30 border border-slate-100 rounded-2xl p-3.5 shadow-xs hover:shadow-sm transition-all">
                            <p className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wide">
                              License
                              {detailReg.documents.licenseNumber && (
                                <span className="font-normal text-slate-400 normal-case ml-1.5">#{detailReg.documents.licenseNumber}</span>
                              )}
                            </p>
                            <a href={getCloudinaryUrl(detailReg.documents.porterLicenseDocument)} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-slate-200/60 shadow-xs">
                              <img
                                src={getCloudinaryUrl(detailReg.documents.porterLicenseDocument)}
                                alt="License"
                                className="w-full h-40 object-cover hover:scale-[1.03] transition duration-305"
                              />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Actions ── */}
              {detailReg.status === "submitted" && (
                <DialogFooter className="border-t pt-5 flex flex-row gap-4 w-full">
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-6 text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center"
                    onClick={() => {
                      handleApprove(detailReg);
                      setIsDetailOpen(false);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 py-6 text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center"
                    onClick={() => {
                      setSelectedReg(detailReg);
                      setIsDetailOpen(false);
                      setIsRejectModalOpen(true);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PorterRegistrations;
