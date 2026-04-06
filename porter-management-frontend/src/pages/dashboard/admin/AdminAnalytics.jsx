import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bar, Line, Doughnut, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js/auto";
import { TrendingUp, RefreshCw, Loader2 } from "lucide-react";
import {
  getBookingTrends,
  getBookingDistribution,
  getRevenueStats,
  getCancellationStats,
} from "@/apis/services/adminService";
import toast from "react-hot-toast";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
    },
  },
};

const lineOptions = {
  ...chartOptions,
  scales: {
    y: {
      beginAtZero: true,
    },
  },
  elements: {
    line: {
      tension: 0.3,
    },
  },
};

const AdminAnalytics = () => {
  const [bookingTrends, setBookingTrends] = useState([]);
  const [revenueTrends, setRevenueTrends] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [typeDistribution, setTypeDistribution] = useState([]);
  const [paymentMethodBreakdown, setPaymentMethodBreakdown] = useState([]);
  const [vehicleDistribution, setVehicleDistribution] = useState([]);
  const [cancellationTrends, setCancellationTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState("7d");

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [trendsRes, distributionRes, revenueRes, cancellationRes] =
        await Promise.all([
          getBookingTrends({ period }),
          getBookingDistribution(),
          getRevenueStats(),
          getCancellationStats(),
        ]);

      if (trendsRes?.data.success) {
        setBookingTrends(trendsRes?.data.data.bookingTrends || []);
        setCancellationTrends(trendsRes?.data.data.cancellationTrends || []);
      }
      if (distributionRes?.data.success) {
        const dist = distributionRes?.data.data;
        const toArray = (obj) =>
          obj && typeof obj === "object" && !Array.isArray(obj)
            ? Object.entries(obj).map(([key, value]) => ({ _id: key, count: value }))
            : Array.isArray(obj)
              ? obj
              : [];
        setStatusDistribution(toArray(dist?.status));
        setTypeDistribution(toArray(dist?.type));
        setPaymentMethodBreakdown(toArray(dist?.paymentMethod));
        setVehicleDistribution(toArray(dist?.vehicleType));
      }
      if (revenueRes?.data.success) {
        setRevenueTrends(revenueRes?.data.data.monthly || []);
      }
      if (cancellationRes?.data.success) {
        if (!cancellationTrends.length) {
          setCancellationTrends(cancellationRes?.data.data.trends || []);
        }
      }
    } catch (err) {
      toast.error("Failed to fetch analytics data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  const bookingTrendChartData = {
    labels: bookingTrends?.map((t) => t.label || t.date),
    datasets: [
      {
        label: "Bookings",
        data: bookingTrends?.map((t) => t.count || t.total),
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
      },
    ],
  };

  const revenueTrendChartData = {
    labels: revenueTrends?.map((t) => t.month || t.label),
    datasets: [
      {
        label: "Revenue (NPR)",
        data: revenueTrends?.map((t) => t.amount || t.revenue),
        backgroundColor: "rgba(16, 185, 129, 0.6)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 1,
      },
    ],
  };

  const statusDistChartData = {
    labels: statusDistribution?.map((s) => s._id || "Unknown"),
    datasets: [
      {
        data: statusDistribution?.map((s) => s.count),
        backgroundColor: [
          "rgba(251, 191, 36, 0.7)",
          "rgba(59, 130, 246, 0.7)",
          "rgba(168, 85, 247, 0.7)",
          "rgba(34, 197, 94, 0.7)",
          "rgba(239, 68, 68, 0.7)",
        ],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const typeDistChartData = {
    labels: typeDistribution?.map((t) => t._id || "Unknown"),
    datasets: [
      {
        data: typeDistribution?.map((t) => t.count),
        backgroundColor: ["rgba(59, 130, 246, 0.7)", "rgba(168, 85, 247, 0.7)"],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const paymentMethodChartData = {
    labels: paymentMethodBreakdown?.map((p) => p._id || "Unknown"),
    datasets: [
      {
        data: paymentMethodBreakdown?.map((p) => p.count),
        backgroundColor: ["rgba(34, 197, 94, 0.7)", "rgba(59, 130, 246, 0.7)"],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const vehicleDistChartData = {
    labels: vehicleDistribution?.map((v) => v._id || "Unknown"),
    datasets: [
      {
        label: "Count",
        data: vehicleDistribution?.map((v) => v.count),
        backgroundColor: [
          "rgba(59, 130, 246, 0.6)",
          "rgba(168, 85, 247, 0.6)",
          "rgba(34, 197, 94, 0.6)",
          "rgba(251, 191, 36, 0.6)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const cancellationTrendChartData = {
    labels: cancellationTrends?.map((t) => t.label || t.date),
    datasets: [
      {
        label: "Cancellations",
        data: cancellationTrends?.map((t) => t.count || t.total),
        borderColor: "rgba(239, 68, 68, 1)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
      },
    ],
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 flex justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Comprehensive platform analytics and insights.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {["24h", "7d", "30d"].map((p) => (
              <Button
                key={p}
                variant={period === p ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod(p)}
              >
                {p}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Booking Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <Line data={bookingTrendChartData} options={lineOptions} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <Bar data={revenueTrendChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex justify-center">
              <div className="w-64">
                <Doughnut data={statusDistChartData} options={chartOptions} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex justify-center">
              <div className="w-64">
                <Pie data={typeDistChartData} options={chartOptions} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex justify-center">
              <div className="w-64">
                <Doughnut
                  data={paymentMethodChartData}
                  options={chartOptions}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <Bar data={vehicleDistChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cancellation Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <Line data={cancellationTrendChartData} options={lineOptions} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
