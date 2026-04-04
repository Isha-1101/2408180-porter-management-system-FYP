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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Users,
  Wifi,
  Loader2,
  WifiOff,
  CheckCircle,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Eye,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Truck,
} from "lucide-react";
import { getPorterPerformance, getPorterStats, getPorterDetail } from "@/apis/services/adminService";
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

const AdminPorterPerformance = () => {
  const [porters, setPorters] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [stats, setStats] = useState({ total: 0, online: 0, busy: 0, offline: 0, verified: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPorter, setSelectedPorter] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const [performanceRes, statsRes] = await Promise.all([
        getPorterPerformance(params),
        getPorterStats(),
      ]);
      if (performanceRes.data.success) {
        setPorters(performanceRes.data.data.porters);
        setTopPerformers(performanceRes.data.data.topPerformers || []);
        setTotalPages(performanceRes.data.data.pagination?.totalPages || 1);
      }
      if (statsRes.data.success) {
        const data = statsRes.data.data;
        setStats({
          total: data.total || 0,
          online: data.online || 0,
          busy: data.busy || 0,
          offline: data.offline || 0,
          verified: data.verified || 0,
        });
      }
    } catch (err) {
      toast.error("Failed to fetch porter data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, page]);

  const handleViewDetail = async (id) => {
    setDetailLoading(true);
    setSelectedPorter(null);
    try {
      const res = await getPorterDetail(id);
      if (res.data.success) setSelectedPorter(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch porter details");
    } finally {
      setDetailLoading(false);
    }
  };

  const statusColors = {
    online: "bg-green-100 text-green-700 border-green-200",
    busy: "bg-blue-100 text-blue-700 border-blue-200",
    offline: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const renderPorterDetail = () => {
    if (detailLoading) {
      return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    if (!selectedPorter) return null;
    const p = selectedPorter;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
            <Truck className="h-8 w-8 text-gray-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{p.name}</h3>
            <Badge className={statusColors[p.status] || "bg-gray-100"}>{p.status}</Badge>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{p.phone || "N/A"}</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{p.email || "N/A"}</span>
          </div>
          <div className="flex items-center gap-3">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">{p.rating?.toFixed(1) || "N/A"} rating</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm">Joined {new Date(p.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-gray-500">Completed</p>
            <p className="text-lg font-bold text-green-700">{p.completedBookings || 0}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-xs text-gray-500">Cancelled</p>
            <p className="text-lg font-bold text-red-700">{p.cancelledBookings || 0}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-500">Earnings</p>
            <p className="text-lg font-bold text-blue-700">NPR {p.totalEarnings || 0}</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-gray-500">Vehicle</p>
            <p className="text-lg font-bold text-purple-700 capitalize">{p.vehicleType || "N/A"}</p>
          </div>
        </div>

        {p.recentLocations && p.recentLocations.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Recent Locations
            </h4>
            <div className="space-y-2">
              {p.recentLocations.map((loc, i) => (
                <div key={i} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                  {loc}
                </div>
              ))}
            </div>
          </div>
        )}

        {p.reviews && p.reviews.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Recent Reviews
            </h4>
            <div className="space-y-2">
              {p.reviews.slice(0, 5).map((review, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className={`h-3 w-3 ${idx < (review.rating || 0) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">{review.comment || "No comment"}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Porter Performance</h1>
          <p className="text-gray-500 mt-1">Analytics and performance metrics for porters.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchData(true)} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total" value={stats.total} icon={<Users className="h-5 w-5 text-gray-500" />} color="border-l-gray-500" loading={loading} />
        <StatCard title="Online" value={stats.online} icon={<Wifi className="h-5 w-5 text-green-500" />} color="border-l-green-500" loading={loading} />
        <StatCard title="Busy" value={stats.busy} icon={<Loader2 className="h-5 w-5 text-blue-500" />} color="border-l-blue-500" loading={loading} />
        <StatCard title="Offline" value={stats.offline} icon={<WifiOff className="h-5 w-5 text-red-500" />} color="border-l-red-500" loading={loading} />
        <StatCard title="Verified" value={stats.verified} icon={<CheckCircle className="h-5 w-5 text-purple-500" />} color="border-l-purple-500" loading={loading} />
      </div>

      {topPerformers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topPerformers.slice(0, 3).map((p, index) => (
                <div key={p.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 text-yellow-700 font-bold text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-gray-500">{p.completedBookings} completed</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">NPR {p.totalEarnings}</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-sm">{p.rating?.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Porter Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="online">Online</option>
              <option value="busy">Busy</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Cancelled</TableHead>
                <TableHead>Earnings</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : porters.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-500">No porters found</TableCell></TableRow>
              ) : (
                porters.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell className="font-medium">{p.userName || p.userId?.name || "N/A"}</TableCell>
                    <TableCell className="capitalize">{p.porterType}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[p.currentStatus] || "bg-gray-100"}>{p.currentStatus}</Badge>
                    </TableCell>
                    <TableCell>{p.completedBookings || 0}</TableCell>
                    <TableCell>{p.cancelledBookings || 0}</TableCell>
                    <TableCell>NPR {p.totalEarnings || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{p.averageRating || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => handleViewDetail(p._id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
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

      <Sheet open={!!selectedPorter} onOpenChange={(open) => !open && setSelectedPorter(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Porter Details</SheetTitle>
            <SheetDescription>Full profile and performance overview</SheetDescription>
          </SheetHeader>
          {renderPorterDetail()}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminPorterPerformance;
