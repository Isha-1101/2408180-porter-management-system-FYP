import AdminGuard from "../guards/AdminGuard";
import AdminDashboardOverview from "../pages/dashboard/admin/AdminDashboardOverview";
import UserManagement from "../pages/dashboard/admin/UserManagement";
import PorterRegistrations from "../pages/dashboard/admin/PorterRegistrations";
import PorterManagement from "../pages/dashboard/admin/PorterManagement";
import AdminBookingsMonitor from "../pages/dashboard/admin/AdminBookingsMonitor";
import AdminCancellationsMonitor from "../pages/dashboard/admin/AdminCancellationsMonitor";
import AdminPaymentsMonitor from "../pages/dashboard/admin/AdminPaymentsMonitor";
import AdminPorterPerformance from "../pages/dashboard/admin/AdminPorterPerformance";
import AdminActivityFeed from "../pages/dashboard/admin/AdminActivityFeed";
import AdminAnalytics from "../pages/dashboard/admin/AdminAnalytics";

const adminRoutes = [
  {
    path: "admin",
    element: <AdminGuard />,
    children: [
      {
        index: true,
        element: <AdminDashboardOverview />,
      },
      {
        path: "users",
        element: <UserManagement />,
      },
      {
        path: "registrations",
        element: <PorterRegistrations />,
      },
      {
        path: "porters",
        element: <PorterManagement />,
      },
      {
        path: "bookings",
        element: <AdminBookingsMonitor />,
      },
      {
        path: "cancellations",
        element: <AdminCancellationsMonitor />,
      },
      {
        path: "payments",
        element: <AdminPaymentsMonitor />,
      },
      {
        path: "porter-performance",
        element: <AdminPorterPerformance />,
      },
      {
        path: "activity",
        element: <AdminActivityFeed />,
      },
      {
        path: "analytics",
        element: <AdminAnalytics />,
      },
    ],
  },
];

export default adminRoutes;
