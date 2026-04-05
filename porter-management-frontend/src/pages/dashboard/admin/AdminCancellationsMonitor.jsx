import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Ban,
  Clock,
  UserX,
  Truck,
  Percent,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { getAllCancellations, getCancellationStats } from "@/apis/services/adminService";
import toast from "react-hot-toast";

const StatCard = ({ title, value, icon, color, loading }) => (
  <Card className={`border-l-4 ${color}`}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
      ) : (
        <div className="text-3xl font-bold text-gray-900">{value}</div>
      )}
    </CardContent>
  </Card>
);

const AdminCancellationsMonitor = () => {
  const [cancellations, setCancellations] = useState([]);
  const [stats, setStats] = useState({ total: 0, today: 0, byUser: 0, byPorter: 0, rate: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelledBy, setCancelledBy] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [topReasons, setTopReasons] = useState([]);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (cancelledBy) params.cancelledBy = cancelledBy;
      const [cancellationsRes, statsRes] = await Promise.all([
        getAllCancellations(params),
        getCancellationStats(),
      ]);
      if (cancellationsRes.data.success) {
        setCancellations(cancellationsRes.data.data.cancellations);
        setTotalPages(cancellationsRes.data.data.pagination?.totalPages || 1);
      }
      if (statsRes.data.success) {
        const data = statsRes.data.data;
        setStats({
          total: data.total || 0,
          today: data.today || 0,
          byUser: data.byUser || 0,
          byPorter: data.byPorter || 0,
          rate: parseFloat(data.cancellationRate) || 0,
        });
        setTopReasons(data.topReasons || []);
      }
    } catch (err) {
      toast.error("Failed to fetch cancellation data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [cancelledBy, page]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cancellations Monitor</h1>
          <p className="text-gray-500 mt-1">Track and analyze booking cancellations.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchData(true)} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total" value={stats.total} icon={<Ban className="h-5 w-5 text-red-500" />} color="border-l-red-500" loading={loading} />
        <StatCard title="Today" value={stats.today} icon={<Clock className="h-5 w-5 text-orange-500" />} color="border-l-orange-500" loading={loading} />
        <StatCard title="By User" value={stats.byUser} icon={<UserX className="h-5 w-5 text-blue-500" />} color="border-l-blue-500" loading={loading} />
        <StatCard title="By Porter" value={stats.byPorter} icon={<Truck className="h-5 w-5 text-purple-500" />} color="border-l-purple-500" loading={loading} />
        <StatCard title="Cancel Rate" value={`${stats.rate}%`} icon={<Percent className="h-5 w-5 text-green-500" />} color="border-l-green-500" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Cancellation Records</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <select
                  value={cancelledBy}
                  onChange={(e) => { setCancelledBy(e.target.value); setPage(1); }}
                  className="border rounded-md px-3 py-2 text-sm"
                >
                  <option value="">All</option>
                  <option value="user">By User</option>
                  <option value="porter">By Porter</option>
                </select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Porter</TableHead>
                    <TableHead>Cancelled By</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                  ) : cancellations.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No cancellations found</TableCell></TableRow>
                  ) : (
                    cancellations.map((c) => (
                      <TableRow key={c._id}>
                        <TableCell className="font-mono text-sm">{String(c.bookingId?._id || c.bookingId || "").slice(-6).toUpperCase()}</TableCell>
                        <TableCell>{c.bookingUserName || c.userId?.name || "N/A"}</TableCell>
                        <TableCell>{c.porterName || "N/A"}</TableCell>
                        <TableCell>
                          <Badge className={c.cancelledBy === "user" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}>
                            {c.cancelledBy}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={c.reason}>{c.reason || "N/A"}</TableCell>
                        <TableCell className="text-sm text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Top Cancellation Reasons
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topReasons.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No data available</p>
              ) : (
                <div className="space-y-3">
                  {topReasons.map((reason, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm">{reason._id || "No reason"}</span>
                      </div>
                      <Badge variant="secondary">{reason.count}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminCancellationsMonitor;
