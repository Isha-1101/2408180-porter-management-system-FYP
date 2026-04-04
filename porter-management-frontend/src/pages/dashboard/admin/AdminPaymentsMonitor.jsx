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
  DollarSign,
  TrendingUp,
  Clock,
  XCircle,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle,
  Wallet,
  CreditCard,
} from "lucide-react";
import { getAllPayments, getRevenueStats, verifyPayment } from "@/apis/services/adminService";
import toast from "react-hot-toast";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js/auto";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

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

const AdminPaymentsMonitor = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ total: 0, today: 0, pending: 0, failed: 0, cash: 0, digital: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [monthlyData, setMonthlyData] = useState([]);
  const [paymentStatusData, setPaymentStatusData] = useState({});

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (methodFilter) params.method = methodFilter;
      const [paymentsRes, revenueRes] = await Promise.all([
        getAllPayments(params),
        getRevenueStats(),
      ]);
      if (paymentsRes.data.success) {
        setPayments(paymentsRes.data.data.payments);
        setTotalPages(paymentsRes.data.data.pagination?.totalPages || 1);
      }
      if (revenueRes.data.success) {
        const data = revenueRes.data.data;
        setStats({
          total: data.totalRevenue || 0,
          today: data.todayRevenue || 0,
          pending: data.pending || 0,
          failed: data.failed || 0,
          cash: data.cash || 0,
          digital: data.digital || 0,
        });
        setMonthlyData(data.monthly || []);
        setPaymentStatusData(data.statusBreakdown || {});
      }
    } catch (err) {
      toast.error("Failed to fetch payment data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, methodFilter, page]);

  const handleVerifyPayment = async (id) => {
    try {
      const res = await verifyPayment(id);
      if (res.data.success) {
        toast.success("Payment verified successfully");
        fetchData(true);
      }
    } catch (err) {
      toast.error("Failed to verify payment");
    }
  };

  const monthlyChartData = {
    labels: monthlyData.map(m => m.month),
    datasets: [
      {
        label: "Revenue (NPR)",
        data: monthlyData.map(m => m.amount),
        backgroundColor: "rgba(59, 130, 246, 0.6)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  const statusChartData = {
    labels: Object.keys(paymentStatusData),
    datasets: [
      {
        data: Object.values(paymentStatusData),
        backgroundColor: [
          "rgba(34, 197, 94, 0.6)",
          "rgba(251, 191, 36, 0.6)",
          "rgba(239, 68, 68, 0.6)",
        ],
        borderColor: [
          "rgba(34, 197, 94, 1)",
          "rgba(251, 191, 36, 1)",
          "rgba(239, 68, 68, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const statusColors = {
    COMPLETED: "bg-green-100 text-green-700 border-green-200",
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
    FAILED: "bg-red-100 text-red-700 border-red-200",
    REFUNDED: "bg-blue-100 text-blue-700 border-blue-200",
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments Monitor</h1>
          <p className="text-gray-500 mt-1">Track revenue and payment transactions.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchData(true)} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`NPR ${stats.total}`} icon={<DollarSign className="h-5 w-5 text-green-500" />} color="border-l-green-500" loading={loading} />
        <StatCard title="Today" value={`NPR ${stats.today}`} icon={<TrendingUp className="h-5 w-5 text-blue-500" />} color="border-l-blue-500" loading={loading} />
        <StatCard title="Pending" value={stats.pending} icon={<Clock className="h-5 w-5 text-yellow-500" />} color="border-l-yellow-500" loading={loading} />
        <StatCard title="Failed" value={stats.failed} icon={<XCircle className="h-5 w-5 text-red-500" />} color="border-l-red-500" loading={loading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No revenue data available</p>
            ) : (
              <Bar data={monthlyChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(paymentStatusData).length === 0 ? (
              <p className="text-center text-gray-500 py-8">No data available</p>
            ) : (
              <div className="flex justify-center">
                <div className="w-64">
                  <Pie data={statusChartData} options={{ responsive: true }} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Wallet className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Cash Payments</p>
                <p className="text-xl font-bold">NPR {stats.cash}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <CreditCard className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Digital Payments</p>
                <p className="text-xl font-bold">NPR {stats.digital}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
            <select
              value={methodFilter}
              onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Methods</option>
              <option value="cash">Cash</option>
              <option value="digital">Digital</option>
            </select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : payments.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No payments found</TableCell></TableRow>
              ) : (
                payments.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell className="font-mono text-sm">{String(p._id).slice(-8).toUpperCase()}</TableCell>
                    <TableCell>{p.userName || p.userId?.name || "N/A"}</TableCell>
                    <TableCell className="font-medium">NPR {p.amount}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{p.method}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[p.status] || "bg-gray-100"}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {p.status === "pending" && (
                        <Button size="sm" variant="outline" onClick={() => handleVerifyPayment(p._id)}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verify
                        </Button>
                      )}
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
    </div>
  );
};

export default AdminPaymentsMonitor;
