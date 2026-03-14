import React, { useEffect, useState } from "react";
import { getAdminStats } from "../../../apis/services/adminService";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Users, Truck, FileText, ClipboardList } from "lucide-react";

const AdminDashboardOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPorters: 0,
    pendingRegistrations: 0,
    activeBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getAdminStats();
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <Users className="h-6 w-6 text-blue-500" />,
      description: "Active system users",
    },
    {
      title: "Total Porters",
      value: stats.totalPorters,
      icon: <Truck className="h-6 w-6 text-green-500" />,
      description: "Verified active porters",
    },
    {
      title: "Pending Registrations",
      value: stats.pendingRegistrations,
      icon: <FileText className="h-6 w-6 text-yellow-500" />,
      description: "Awaiting approval",
    },
    {
      title: "Active Bookings",
      value: stats.activeBookings,
      icon: <ClipboardList className="h-6 w-6 text-purple-500" />,
      description: "Current ongoing trips",
    },
  ];

  if (loading) {
    return <div className="p-8">Loading stats...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Overview</h1>
        <p className="text-muted-foreground">Monitor system activity and metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Welcome to the Porter Management System Admin Panel. Use the sidebar to manage users, registrations, and porters.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardOverview;
