import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Truck,
  FileText,
  ClipboardList,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  DollarSign,
  MessageSquare,
  Activity,
  Ban,
} from "lucide-react";
import { getComprehensiveStats, getSystemHealth } from "@/apis/services/adminService";
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
        </div>
      </CardContent>
    </Card>
  );
};

const AdminDashboardOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, healthRes] = await Promise.all([
        getComprehensiveStats(),
        getSystemHealth(),
      ]);
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (healthRes.data.success) setHealth(healthRes.data.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
      setError("Failed to load statistics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!stats) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <RefreshCw className="w-10 h-10 animate-spin text-primary mx-auto" />
            <p className="text-gray-500">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
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
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm">{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchData}
            className="ml-auto text-red-700 hover:bg-red-100"
          >
            Retry
          </Button>
        </div>
      )}

      {health?.alerts?.length > 0 && (
        <div className="space-y-2">
          {health.alerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                alert.severity === "critical"
                  ? "bg-red-50 border-red-200 text-red-700"
                  : alert.severity === "medium"
                  ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                  : "bg-blue-50 border-blue-200 text-blue-700"
              }`}
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="text-sm">{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Total Users"
          value={stats.users?.total || 0}
          icon={<Users className="h-5 w-5 text-blue-500" />}
          description={`${stats.users?.newThisWeek || 0} new this week`}
          color="border-l-blue-500"
          to="/dashboard/admin/users"
        />
        <StatCard
          title="Online Porters"
          value={stats.porters?.online || 0}
          icon={<Truck className="h-5 w-5 text-emerald-500" />}
          description={`${stats.porters?.busy || 0} busy, ${stats.porters?.offline || 0} offline`}
          color="border-l-emerald-500"
          to="/dashboard/admin/porters"
        />
        <StatCard
          title="Active Bookings"
          value={stats.bookings?.active || 0}
          icon={<ClipboardList className="h-5 w-5 text-purple-500" />}
          description={`${stats.bookings?.completed || 0} completed, ${stats.bookings?.cancelled || 0} cancelled`}
          color="border-l-purple-500"
          to="/dashboard/admin/bookings"
        />
        <StatCard
          title="Today Revenue"
          value={`NPR ${stats.revenue?.today || 0}`}
          icon={<DollarSign className="h-5 w-5 text-green-500" />}
          description={`Total: NPR ${stats.revenue?.total || 0}`}
          color="border-l-green-500"
          to="/dashboard/admin/payments"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Pending Registrations"
          value={stats.porters?.pendingRegistrations || 0}
          icon={<FileText className="h-5 w-5 text-amber-500" />}
          description="Awaiting approval"
          color="border-l-amber-500"
          to="/dashboard/admin/registrations"
        />
        <StatCard
          title="Cancellations Today"
          value={stats.cancellations?.today || 0}
          icon={<Ban className="h-5 w-5 text-red-500" />}
          description={`Total: ${stats.cancellations?.total || 0}`}
          color="border-l-red-500"
          to="/dashboard/admin/cancellations"
        />
        <StatCard
          title="Pending Payments"
          value={stats.revenue?.pending || 0}
          icon={<DollarSign className="h-5 w-5 text-orange-500" />}
          description={`${stats.revenue?.failed || 0} failed`}
          color="border-l-orange-500"
          to="/dashboard/admin/payments"
        />
        <StatCard
          title="Messages Today"
          value={stats.activity?.messagesToday || 0}
          icon={<MessageSquare className="h-5 w-5 text-cyan-500" />}
          description="User-porter chats"
          color="border-l-cyan-500"
        />
      </div>

      <Tabs defaultValue="quick-actions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="quick-actions">Quick Actions</TabsTrigger>
          <TabsTrigger value="system-status">System Status</TabsTrigger>
        </TabsList>

        <TabsContent value="quick-actions">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 h-12"
                onClick={() => navigate("/dashboard/admin/registrations")}
              >
                <FileText className="h-4 w-4 text-amber-500" />
                <div className="text-left">
                  <div className="text-sm font-medium">Review Registrations</div>
                  {stats.porters?.pendingRegistrations > 0 && (
                    <div className="text-xs text-amber-600">
                      {stats.porters.pendingRegistrations} pending
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
                onClick={() => navigate("/dashboard/admin/bookings")}
              >
                <ClipboardList className="h-4 w-4 text-purple-500" />
                <div className="text-left">
                  <div className="text-sm font-medium">Monitor Bookings</div>
                  <div className="text-xs text-gray-500">
                    {stats.bookings?.active || 0} active
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 h-12"
                onClick={() => navigate("/dashboard/admin/payments")}
              >
                <DollarSign className="h-4 w-4 text-green-500" />
                <div className="text-left">
                  <div className="text-sm font-medium">Revenue & Payments</div>
                  <div className="text-xs text-gray-500">
                    {stats.revenue?.pending || 0} pending
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system-status">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Platform Status</span>
                    <Badge className={health?.status === "healthy" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-yellow-100 text-yellow-700 border-yellow-200"}>
                      {health?.status === "healthy" ? "Healthy" : "Degraded"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Users</span>
                    <span className="font-semibold">{stats.users?.active || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Online Porters</span>
                    <span className="font-semibold">{stats.porters?.online || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Busy Porters</span>
                    <span className="font-semibold">{stats.porters?.busy || 0}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Bookings</span>
                    <span className="font-semibold">{stats.bookings?.active || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pending Payments</span>
                    <span className="font-semibold">{stats.revenue?.pending || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pending Registrations</span>
                    <span className="font-semibold">{stats.porters?.pendingRegistrations || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Banned Users</span>
                    <span className="font-semibold">{stats.users?.banned || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboardOverview;
