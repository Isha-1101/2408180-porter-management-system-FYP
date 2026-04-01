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
      </Dialog>      {/* Detail Dialog - centered */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-bold">
              Applicant Registration Details
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">
              {detailReg?.registrationId}
            </DialogDescription>
          </DialogHeader>

          {detailReg && (
            <div className="space-y-6 py-2">

              {/* ── Applicant Overview ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 rounded-xl p-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Applicant</p>
                  <p className="text-sm font-semibold text-gray-900">{detailReg.userId?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Email</p>
                  <p className="text-sm text-gray-700 break-all">{detailReg.userId?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Phone</p>
                  <p className="text-sm text-gray-700">{detailReg.userId?.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Status</p>
                  <Badge className={`capitalize flex items-center gap-1 w-fit mt-0.5 ${STATUS_BADGE[detailReg.status]}`}>
                    {STATUS_ICON[detailReg.status]}
                    {detailReg.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Type</p>
                  <p className="text-sm capitalize text-gray-700">{detailReg.registrationType || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Role</p>
                  <p className="text-sm capitalize text-gray-700">{detailReg.role || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Submitted</p>
                  <p className="text-sm text-gray-700">{new Date(detailReg.updatedAt).toLocaleString()}</p>
                </div>
                {detailReg.rejectionReason && (
                  <div className="col-span-4 bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-red-400 mb-1">Rejection Reason</p>
                    <p className="text-sm text-red-700">{detailReg.rejectionReason}</p>
                  </div>
                )}
              </div>

              {detailReg.basicInfo && (
                <>
                  {/* ── Basic Info ── */}
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Basic Info</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { label: "Full Name", value: detailReg.basicInfo.fullName },
                        { label: "Phone", value: detailReg.basicInfo.phone },
                        { label: "Address", value: detailReg.basicInfo.address },
                        { label: "Identity Type", value: detailReg.basicInfo.identityType },
                        { label: "Identity Number", value: detailReg.basicInfo.identityNumber },
                        { label: "Experience", value: detailReg.basicInfo.experienceYears ? `${detailReg.basicInfo.experienceYears} yr(s)` : null },
                      ].filter(i => i.value).map((item, idx) => (
                        <div key={idx} className="bg-white rounded-lg border p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">{item.label}</p>
                          <p className="text-sm font-medium text-gray-900">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Vehicle Info ── */}
                  {detailReg.vehicle && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Vehicle Info</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-white rounded-lg border p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Has Vehicle</p>
                          <p className="text-sm font-medium text-gray-900">{detailReg.vehicle.hasVehicle ? "Yes" : "No"}</p>
                        </div>
                        {detailReg.vehicle.hasVehicle && (
                          <>
                            <div className="bg-white rounded-lg border p-3">
                              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Category</p>
                              <p className="text-sm font-medium capitalize text-gray-900">{detailReg.vehicle.vehicleCategory}</p>
                            </div>
                            <div className="bg-white rounded-lg border p-3">
                              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Number</p>
                              <p className="text-sm font-medium text-gray-900">{detailReg.vehicle.vehicleNumber}</p>
                            </div>
                            {detailReg.vehicle.capacity && (
                              <div className="bg-white rounded-lg border p-3">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Capacity</p>
                                <p className="text-sm font-medium text-gray-900">{detailReg.vehicle.capacity}</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Uploaded Documents ── */}
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Uploaded Documents</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {detailReg.basicInfo.porterPhoto && (
                        <div className="flex flex-col items-center gap-2">
                          <p className="text-xs font-semibold text-gray-600 self-start">Porter Photo</p>
                          <a href={detailReg.basicInfo.porterPhoto} target="_blank" rel="noreferrer" className="w-full">
                            <img
                              src={detailReg.basicInfo.porterPhoto}
                              alt="Porter"
                              className="w-full h-36 object-cover rounded-xl border shadow-sm hover:opacity-90 transition"
                            />
                          </a>
                        </div>
                      )}
                      {detailReg.basicInfo.registrationIdDocument?.flatMap((doc, idx) => [
                        doc.identityCardImageFront && (
                          <div key={`front-${idx}`} className="flex flex-col items-center gap-2">
                            <p className="text-xs font-semibold text-gray-600 self-start">ID Front</p>
                            <a href={doc.identityCardImageFront} target="_blank" rel="noreferrer" className="w-full">
                              <img
                                src={doc.identityCardImageFront}
                                alt="ID Front"
                                className="w-full h-36 object-cover rounded-xl border shadow-sm hover:opacity-90 transition"
                              />
                            </a>
                          </div>
                        ),
                        doc.identityCardImageBack && (
                          <div key={`back-${idx}`} className="flex flex-col items-center gap-2">
                            <p className="text-xs font-semibold text-gray-600 self-start">ID Back</p>
                            <a href={doc.identityCardImageBack} target="_blank" rel="noreferrer" className="w-full">
                              <img
                                src={doc.identityCardImageBack}
                                alt="ID Back"
                                className="w-full h-36 object-cover rounded-xl border shadow-sm hover:opacity-90 transition"
                              />
                            </a>
                          </div>
                        ),
                      ].filter(Boolean))}
                      {detailReg.documents?.porterLicenseDocument && (
                        <div className="flex flex-col items-center gap-2">
                          <p className="text-xs font-semibold text-gray-600 self-start">
                            License
                            {detailReg.documents.licenseNumber && (
                              <span className="font-normal text-gray-400 ml-1">#{detailReg.documents.licenseNumber}</span>
                            )}
                          </p>
                          <a href={detailReg.documents.porterLicenseDocument} target="_blank" rel="noreferrer" className="w-full">
                            <img
                              src={detailReg.documents.porterLicenseDocument}
                              alt="License"
                              className="w-full h-36 object-cover rounded-xl border shadow-sm hover:opacity-90 transition"
                            />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* ── Actions ── */}
              {detailReg.status === "submitted" && (
                <DialogFooter className="border-t pt-4 flex gap-3 sm:justify-start">
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      handleApprove(detailReg.registrationId);
                      setIsDetailOpen(false);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
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
