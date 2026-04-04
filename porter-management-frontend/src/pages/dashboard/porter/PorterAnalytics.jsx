import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  TrendingUp,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  BarChart3,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageLayout from "../../../components/common/PageLayout";
import { useGetPorterAnalytics } from "../../../apis/hooks/portersHooks";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const STAT_CARDS = [
  {
    key: "totalBookings",
    label: "Total Bookings",
    icon: Package,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    key: "completedBookings",
    label: "Completed",
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    key: "cancelledBookings",
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    key: "inProgressBookings",
    label: "In Progress",
    icon: Clock,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
  {
    key: "totalEarnings",
    label: "Total Earnings",
    icon: DollarSign,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    prefix: "NPR ",
  },
  {
    key: "completionRate",
    label: "Completion Rate",
    icon: TrendingUp,
    color: "text-purple-600",
    bg: "bg-purple-50",
    suffix: "%",
  },
];

const STATUS_COLORS = {
  COMPLETED: "#10b981",
  CANCELLED: "#ef4444",
  IN_PROGRESS: "#f59e0b",
  CONFIRMED: "#3b82f6",
  WAITING_PORTER: "#8b5cf6",
};

const PorterAnalytics = () => {
  const navigate = useNavigate();
  const [chartView, setChartView] = useState("monthly");

  const { data, isLoading } = useGetPorterAnalytics();

  if (isLoading) {
    return (
      <PageLayout title="Analytics" description="Your booking performance">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
            <p className="text-gray-500">Loading analytics...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  const summary = data?.summary || {};
  const monthlyData = data?.monthlyData || [];
  const weeklyData = data?.weeklyData || [];
  const statusDist = data?.statusDistribution || {};
  const paymentBreakdown = data?.paymentMethodBreakdown || {};

  const monthlyChartData = {
    labels: monthlyData.map((d) => d.month),
    datasets: [
      {
        label: "Earnings (NPR)",
        data: monthlyData.map((d) => d.earnings),
        backgroundColor: "rgba(12, 76, 64, 0.7)",
        borderColor: "#0C4C40",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const weeklyChartData = {
    labels: weeklyData.map((d) => d.day),
    datasets: [
      {
        label: "Bookings",
        data: weeklyData.map((d) => d.bookings),
        borderColor: "#0C4C40",
        backgroundColor: "rgba(12, 76, 64, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#0C4C40",
        pointRadius: 4,
      },
    ],
  };

  const statusChartData = {
    labels: Object.keys(statusDist).map((k) => k.replace("_", " ")),
    datasets: [
      {
        data: Object.values(statusDist),
        backgroundColor: Object.keys(statusDist).map(
          (k) => STATUS_COLORS[k] || "#94a3b8"
        ),
        borderWidth: 0,
      },
    ],
  };

  return (
    <PageLayout title="Analytics" description="Your booking performance">
      <div className="space-y-6 max-w-6xl mx-auto p-4">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {STAT_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.key} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {card.prefix || ""}
                    {summary[card.key] ?? 0}
                    {card.suffix || ""}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{card.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Earnings / Bookings Chart */}
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  {chartView === "monthly" ? "Monthly Earnings" : "Weekly Bookings"}
                </CardTitle>
                <Tabs value={chartView} onValueChange={setChartView}>
                  <TabsList className="h-8">
                    <TabsTrigger value="monthly" className="text-xs">Monthly</TabsTrigger>
                    <TabsTrigger value="weekly" className="text-xs">Weekly</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {chartView === "monthly" ? (
                <Bar
                  data={monthlyChartData}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { beginAtZero: true, grid: { color: "#f1f5f9" } },
                      x: { grid: { display: false } },
                    },
                  }}
                />
              ) : (
                <Line
                  data={weeklyChartData}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: "#f1f5f9" } },
                      x: { grid: { display: false } },
                    },
                  }}
                />
              )}
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Booking Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="w-48 h-48">
                <Doughnut
                  data={statusChartData}
                  options={{
                    responsive: true,
                    cutout: "65%",
                    plugins: {
                      legend: { position: "bottom", labels: { boxWidth: 12, padding: 12, font: { size: 11 } } },
                    },
                  }}
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {Object.entries(statusDist).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[key] || "#94a3b8" }}
                    />
                    <span className="text-gray-600 capitalize">{key.replace("_", " ").toLowerCase()}</span>
                    <Badge variant="outline" className="ml-auto text-xs">{val}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Method Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {[
                { key: "cash", label: "Cash", color: "bg-green-100 text-green-700" },
                { key: "digital", label: "Digital", color: "bg-blue-100 text-blue-700" },
                { key: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-700" },
              ].map((item) => (
                <div key={item.key} className={`rounded-lg p-4 text-center ${item.color}`}>
                  <p className="text-2xl font-bold">{paymentBreakdown[item.key] || 0}</p>
                  <p className="text-sm mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default PorterAnalytics;
