import React, { useEffect, useState } from "react";
import { getAllPorters } from "../../../apis/services/adminService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Eye } from "lucide-react";

const PorterManagement = () => {
  const [porters, setPorters] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPorters = async () => {
    setLoading(true);
    try {
      const response = await getAllPorters();
      if (response.data.success) {
        setPorters(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch porters:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPorters();
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Porter Management</h1>
        <p className="text-muted-foreground">Detailed view and management of all active porters.</p>
      </div>

      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Current Job</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">Loading porters...</TableCell>
              </TableRow>
            ) : porters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">No porters found.</TableCell>
              </TableRow>
            ) : (
              porters.map((porter) => (
                <TableRow key={porter._id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{porter.userId?.name || "N/A"}</p>
                      <p className="text-xs text-muted-foreground">{porter.userId?.phone || ""}</p>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{porter.porterType}</TableCell>
                  <TableCell className="capitalize">{porter.role}</TableCell>
                  <TableCell>
                    <Badge variant={porter.status === "active" ? "success" : "secondary"} className="capitalize">
                      {porter.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {porter.currentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {porter.isVerified ? (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">Verified</Badge>
                    ) : (
                      <Badge variant="outline">Unverified</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
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
    </div>
  );
};

export default PorterManagement;
