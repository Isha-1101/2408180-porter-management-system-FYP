import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  RefreshCw,
  Loader2,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  DollarSign,
  UserPlus,
  UserMinus,
  Truck,
  MessageSquare,
  Ban,
} from "lucide-react";
import { getActivityFeed, getSystemHealth } from "@/apis/services/adminService";
import toast from "react-hot-toast";

const typeConfig = {
  booking: {
    icon: Calendar,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    bg: "bg-blue-50",
  },
  cancellation: {
    icon: Ban,
    color: "bg-red-100 text-red-700 border-red-200",
    bg: "bg-red-50",
  },
  payment: {
    icon: DollarSign,
    color: "bg-green-100 text-green-700 border-green-200",
    bg: "bg-green-50",
  },
  registration: {
    icon: UserPlus,
    color: "bg-amber-100 text-amber-700 border-amber-200",
    bg: "bg-amber-50",
  },
  user: {
    icon: UserMinus,
    color: "bg-purple-100 text-purple-700 border-purple-200",
    bg: "bg-purple-50",
  },
  porter: {
    icon: Truck,
    color: "bg-cyan-100 text-cyan-700 border-cyan-200",
    bg: "bg-cyan-50",
  },
};

const AdminActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (typeFilter) params.type = typeFilter;
      const [feedRes, healthRes] = await Promise.all([
        getActivityFeed(params),
        getSystemHealth(),
      ]);
      if (feedRes.data.success) {
        setActivities(feedRes.data.data.activities);
        setTotalPages(feedRes.data.data.pagination?.totalPages || 1);
      }
      if (healthRes.data.success) setHealth(healthRes.data.data);
    } catch (err) {
      toast.error("Failed to fetch activity feed");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [typeFilter, page]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [typeFilter, page]);

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Feed</h1>
          <p className="text-gray-500 mt-1">
            Real-time system activity and events.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">Auto-refresh: 30s</span>
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

      <div className="flex gap-2">
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">All Activities</option>
          <option value="booking">Bookings</option>
          <option value="cancellation">Cancellations</option>
          <option value="payment">Payments</option>
          <option value="registration">Registrations</option>
          <option value="user">Users</option>
          <option value="porter">Porters</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : activities?.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No activities found
            </p>
          ) : (
            <div className="space-y-3">
              {activities?.map((activity, index) => {
                const config = typeConfig[activity.type] || {
                  icon: Activity,
                  color: "bg-gray-100 text-gray-700",
                  bg: "bg-gray-50",
                };
                const Icon = config.icon;
                return (
                  <React.Fragment key={activity.id || index}>
                    <div
                      className={`flex items-start gap-4 p-4 rounded-lg ${config.bg} transition-colors hover:shadow-sm`}
                    >
                      <div className={`p-2 rounded-lg ${config.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge className={config.color}>
                              {activity.type}
                            </Badge>
                            <span className="font-medium text-sm">
                              {activity.title || activity.action}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(activity.createdAt)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {activity.description || activity.details}
                        </p>
                        {activity.user && (
                          <p className="text-xs text-gray-400 mt-1">
                            By:{" "}
                            {typeof activity.user === "string"
                              ? activity.user
                              : activity.user.name || "Unknown"}
                          </p>
                        )}
                      </div>
                    </div>
                    {index < activities.length - 1 && <Separator />}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminActivityFeed;
