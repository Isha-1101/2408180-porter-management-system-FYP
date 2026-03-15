import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Truck,
  FileText,
  ClipboardList,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { getAdminStats } from "@/apis/services/adminService";
import { useNavigate } from "react-router-dom";

const StatCard = ({ title, value, icon, description, to, color, loading }) => {
  const navigate = useNavigate();
  return (
    <Card
      className={`hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 ${color}`}
      onClick={() => to && navigate(to)}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
        ) : (
          <div className="text-3xl font-bold text-gray-900">{value}</div>
        )}
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">{description}</p>
          {to && (
            <ArrowRight className="h-3 w-3 text-gray-400 group-hover:text-primary" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const AdminDashboardOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPorters: 0,
    pendingRegistrations: 0,
    activeBookings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminStats();
      if (response.data.success) {
        setStats(response.data.data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Failed to fetch admin stats:", err);
      setError("Failed to load statistics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <Users className="h-5 w-5 text-blue-500" />,
      description: "Registered system users",
      color: "border-l-blue-500",
      to: "/dashboard/admin/users",
    },
    {
      title: "Active Porters",
      value: stats.totalPorters,
      icon: <Truck className="h-5 w-5 text-emerald-500" />,
      description: "Verified active porters",
      color: "border-l-emerald-500",
      to: "/dashboard/admin/porters",
    },
    {
      title: "Pending Registrations",
      value: stats.pendingRegistrations,
      icon: <FileText className="h-5 w-5 text-amber-500" />,
      description: "Awaiting admin approval",
      color: "border-l-amber-500",
      to: "/dashboard/admin/registrations",
    },
    {
      title: "Active Bookings",
      value: stats.activeBookings,
      icon: <ClipboardList className="h-5 w-5 text-purple-500" />,
      description: "Confirmed, in-progress, assigned",
      color: "border-l-purple-500",
      to: null,
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Admin Overview
          </h1>
          <p className="text-gray-500 mt-1">
            Monitor system activity and platform metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm">{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchStats}
            className="ml-auto text-red-700 hover:bg-red-100"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} loading={loading} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-12"
              onClick={() => navigate("/dashboard/admin/registrations")}
            >
              <FileText className="h-4 w-4 text-amber-500" />
              <div className="text-left">
                <div className="text-sm font-medium">Review Registrations</div>
                {stats.pendingRegistrations > 0 && (
                  <div className="text-xs text-amber-600">
                    {stats.pendingRegistrations} pending
                  </div>
                )}
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-12"
              onClick={() => navigate("/dashboard/admin/users")}
            >
              <Users className="h-4 w-4 text-blue-500" />
              <div className="text-left">
                <div className="text-sm font-medium">Manage Users</div>
                <div className="text-xs text-gray-500">Ban • Unban • Delete</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-12"
              onClick={() => navigate("/dashboard/admin/porters")}
            >
              <Truck className="h-4 w-4 text-emerald-500" />
              <div className="text-left">
                <div className="text-sm font-medium">Manage Porters</div>
                <div className="text-xs text-gray-500">View all active porters</div>
              </div>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Platform</span>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                Operational
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Booking System</span>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Notifications</span>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                Live (SSE)
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardOverview;
