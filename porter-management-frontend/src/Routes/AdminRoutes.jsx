import AdminGuard from "../guards/AdminGuard";
import AdminDashboardOverview from "../pages/dashboard/admin/AdminDashboardOverview";
import UserManagement from "../pages/dashboard/admin/UserManagement";
import PorterRegistrations from "../pages/dashboard/admin/PorterRegistrations";
import PorterManagement from "../pages/dashboard/admin/PorterManagement";

// Admin routes configuration array for useRoutes
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
    ],
  },
];

export default adminRoutes;
