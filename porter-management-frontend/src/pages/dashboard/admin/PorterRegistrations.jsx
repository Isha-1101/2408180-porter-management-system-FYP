import React, { useEffect, useState } from "react";
import {
  getAllPorterRegistrations,
  approveRegistration,
  rejectRegistration,
} from "../../../apis/services/adminService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Eye } from "lucide-react";

const PorterRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("submitted");

  // Rejection Modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const response = await getAllPorterRegistrations({ status: statusFilter });
      if (response.data.success) {
        setRegistrations(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [statusFilter]);

  const handleApprove = async (regId) => {
    if (window.confirm("Approve this porter registration?")) {
      try {
        const response = await approveRegistration(regId);
        if (response.data.success) {
          fetchRegistrations();
        }
      } catch (error) {
        console.error("Failed to approve registration:", error);
        alert(error.response?.data?.message || "Approval failed");
      }
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason) return;
    try {
      const response = await rejectRegistration(selectedReg.registrationId, {
        rejectionReason,
      });
      if (response.data.success) {
        setIsRejectModalOpen(false);
        setRejectionReason("");
        fetchRegistrations();
      }
    } catch (error) {
      console.error("Failed to reject registration:", error);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Porter Registrations</h1>
        <p className="text-muted-foreground">Review and approve or reject porter applications.</p>
      </div>

      <Tabs defaultValue="submitted" onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="submitted">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
        </TabsList>

        <div className="mt-6 border rounded-lg bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reg ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Loading registrations...</TableCell>
                </TableRow>
              ) : registrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">No registrations found.</TableCell>
                </TableRow>
              ) : (
                registrations.map((reg) => (
                  <TableRow key={reg._id}>
                    <TableCell className="font-mono text-xs">{reg.registrationId}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{reg.userId?.name || "N/A"}</p>
                        <p className="text-xs text-muted-foreground">{reg.userId?.email || ""}</p>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{reg.registrationType}</TableCell>
                    <TableCell className="capitalize">{reg.role}</TableCell>
                    <TableCell>{new Date(reg.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={
                        reg.status === "approved" ? "success" : 
                        reg.status === "rejected" ? "destructive" : 
                        reg.status === "submitted" ? "default" : "secondary"
                      } className="capitalize">
                        {reg.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {reg.status === "submitted" && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleApprove(reg.registrationId)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedReg(reg);
                              setIsRejectModalOpen(true);
                            }}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Tabs>

      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Registration: {selectedReg?.registrationId}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Reason for rejection</Label>
              <Input
                id="reject-reason"
                placeholder="Enter reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRejectSubmit} disabled={!rejectionReason}>Reject Application</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PorterRegistrations;
