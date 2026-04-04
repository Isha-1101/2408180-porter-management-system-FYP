import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Input } from "@/components/ui/input";
import {
  ClipboardList,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  Eye,
  ArrowLeft,
  ArrowRight,
  Loader2,
  MapPin,
  User,
  Truck,
  DollarSign,
  Calendar,
} from "lucide-react";
import {
  getAllAdminBookings,
  getLiveBookings,
  getBookingDetail,
  updateBookingStatus,
} from "@/apis/services/adminService";
import toast from "react-hot-toast";

const statusColors = {
  WAITING_PORTER: "bg-yellow-100 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-purple-100 text-purple-700 border-purple-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
};

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

const AdminBookingsMonitor = () => {
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, cancelled: 0, waiting: 0 });
  const [bookings, setBookings] = useState([]);
  const [liveBookings, setLiveBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [bookingType, setBookingType] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchBookings = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (activeTab !== "all") params.status = activeTab;
      if (search) params.address = search;
      if (bookingType) params.type = bookingType;
      const res = await getAllAdminBookings(params);
      if (res.data.success) {
        setBookings(res.data.data.bookings);
        setTotalPages(res.data.data.pagination?.totalPages || 1);
        setStats(res.data.data.stats || stats);
      }
    } catch (err) {
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchLiveBookings = async () => {
    try {
      const res = await getLiveBookings();
      if (res.data.success) setLiveBookings(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch live bookings");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeTab, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBookings();
  };

  const handleViewDetail = async (id) => {
    setDetailLoading(true);
    setSelectedBooking(null);
    try {
      const res = await getBookingDetail(id);
      if (res.data.success) setSelectedBooking(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch booking details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await updateBookingStatus(id, { status: newStatus });
      if (res.data.success) {
        toast.success("Booking status updated");
        fetchBookings();
        if (selectedBooking?.id === id) handleViewDetail(id);
      }
    } catch (err) {
      toast.error("Failed to update booking status");
    }
  };

  const renderBookingDetail = () => {
    if (detailLoading) {
      return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    if (!selectedBooking) return null;
    const b = selectedBooking;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Booking ID</p>
            <p className="text-lg font-semibold">{b.id}</p>
          </div>
          <Badge className={statusColors[b.status] || "bg-gray-100 text-gray-700"}>
            {b.status?.replace(/_/g, " ")}
          </Badge>
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium">User</p>
              <p className="text-sm text-gray-600">{b.userName || b.userId?.name || "N/A"}</p>
              <p className="text-sm text-gray-500">{b.userPhone || b.userId?.phone || ""}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Truck className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Porter</p>
              <p className="text-sm text-gray-600">{b.porterName || "Unassigned"}</p>
              <p className="text-sm text-gray-500">{b.porterPhone || ""}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium">Pickup</p>
                <p className="text-sm text-gray-600">{b.pickup?.address || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Drop-off</p>
                <p className="text-sm text-gray-600">{b.drop?.address || "N/A"}</p>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Fare</p>
              <p className="text-sm text-gray-600">NPR {b.totalPrice}</p>
              <p className="text-sm text-gray-500">{b.paymentMethod || "N/A"} - {b.paymentStatus || "N/A"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Date</p>
              <p className="text-sm text-gray-600">{new Date(b.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
        {b.status !== "COMPLETED" && b.status !== "CANCELLED" && (
          <div className="flex gap-2">
            {b.status === "WAITING_PORTER" && (
              <Button size="sm" onClick={() => handleStatusUpdate(b.id, "CANCELLED")} variant="destructive">
                Cancel Booking
              </Button>
            )}
            {b.status === "IN_PROGRESS" && (
              <Button size="sm" onClick={() => handleStatusUpdate(b.id, "COMPLETED")}>
                Mark Complete
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings Monitor</h1>
          <p className="text-gray-500 mt-1">Track and manage all platform bookings.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchBookings(true)} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total" value={stats.total} icon={<ClipboardList className="h-5 w-5 text-gray-500" />} color="border-l-gray-500" loading={loading} />
        <StatCard title="Waiting" value={stats.waiting} icon={<Clock className="h-5 w-5 text-yellow-500" />} color="border-l-yellow-500" loading={loading} />
        <StatCard title="Active" value={stats.active} icon={<Loader2 className="h-5 w-5 text-blue-500" />} color="border-l-blue-500" loading={loading} />
        <StatCard title="Completed" value={stats.completed} icon={<CheckCircle className="h-5 w-5 text-green-500" />} color="border-l-green-500" loading={loading} />
        <StatCard title="Cancelled" value={stats.cancelled} icon={<XCircle className="h-5 w-5 text-red-500" />} color="border-l-red-500" loading={loading} />
      </div>

      <Tabs value={activeTab === "live" ? "live" : "all"} onValueChange={(v) => { setActiveTab(v === "live" ? "live" : v); setPage(1); }}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="WAITING_PORTER">Waiting Porter</TabsTrigger>
          <TabsTrigger value="CONFIRMED">Confirmed</TabsTrigger>
          <TabsTrigger value="IN_PROGRESS">In Progress</TabsTrigger>
          <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
          <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
          <TabsTrigger value="live">Live Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Live Active Bookings</CardTitle>
              <Button size="sm" variant="outline" onClick={fetchLiveBookings}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Porter</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fare</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {liveBookings.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No live bookings</TableCell></TableRow>
                  ) : (
                    liveBookings.map((b) => (
                      <TableRow key={b._id} className="cursor-pointer" onClick={() => handleViewDetail(b._id)}>
                        <TableCell className="font-mono text-sm">{String(b._id).slice(-6).toUpperCase()}</TableCell>
                        <TableCell>{b.userName || b.userId?.name || "N/A"}</TableCell>
                        <TableCell>{b.porterName || "Unassigned"}</TableCell>
                        <TableCell><Badge className={statusColors[b.status] || "bg-gray-100"}>{b.status?.replace(/_/g, " ")}</Badge></TableCell>
                        <TableCell>NPR {b.totalPrice}</TableCell>
                        <TableCell className="text-sm text-gray-500">{new Date(b.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell><Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleViewDetail(b._id); }}><Eye className="h-4 w-4" /></Button></TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking List</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="flex-1 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search by address..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                  </div>
                  <select
                    value={bookingType}
                    onChange={(e) => setBookingType(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="individual">Individual</option>
                    <option value="team">Team</option>
                  </select>
                </div>
                <Button type="submit">Search</Button>
              </form>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Porter</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fare</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                  ) : bookings.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No bookings found</TableCell></TableRow>
                  ) : (
                    bookings.map((b) => (
                      <TableRow key={b._id} className="cursor-pointer" onClick={() => handleViewDetail(b._id)}>
                        <TableCell className="font-mono text-sm">{String(b._id).slice(-6).toUpperCase()}</TableCell>
                        <TableCell>{b.userName || b.userId?.name || "N/A"}</TableCell>
                        <TableCell>{b.porterName || "Unassigned"}</TableCell>
                        <TableCell><Badge className={statusColors[b.status] || "bg-gray-100"}>{b.status?.replace(/_/g, " ")}</Badge></TableCell>
                        <TableCell>NPR {b.totalPrice}</TableCell>
                        <TableCell className="text-sm text-gray-500">{new Date(b.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell><Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleViewDetail(b._id); }}><Eye className="h-4 w-4" /></Button></TableCell>
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
        </TabsContent>
      </Tabs>

      <Sheet open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Booking Details</SheetTitle>
            <SheetDescription>View and manage booking information</SheetDescription>
          </SheetHeader>
          {renderBookingDetail()}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminBookingsMonitor;
