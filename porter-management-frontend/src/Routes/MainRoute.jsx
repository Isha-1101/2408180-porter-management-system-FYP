// Routes/MainRoute.jsx
import { useEffect } from "react";
import {
  BrowserRouter,
  useRoutes,
  useLocation,
} from "react-router-dom";
import PublicRoute from "./PublicRoute";
import Layout from "../components/Layout";
import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../pages/dashboard/layout";
import userRoutes from "./UserRoutes";
import porterRoutes from "./PorterRoutes";
import adminRoutes from "./AdminRoutes";

// Scroll to top on route change
const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname, location.search]);

  return null;
};

// Route configuration combined from all separate route files
const routeConfig = [
  {
    path: "/dashboard",
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          ...userRoutes,
          ...porterRoutes,
          ...adminRoutes,
        ],
      },
    ],
  },
  {
    element: <Layout />,
    children: [
      {
        path: "/*",
        element: <PublicRoute />,
      },
    ],
  },
];

// Routes component that uses useRoutes
const AppRoutes = () => {
  const element = useRoutes(routeConfig);
  return element;
};

const MainRoute = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
    </BrowserRouter>
  );
};

export default MainRoute;
