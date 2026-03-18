import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Role-based redirect: when accessing /dashboard directly, redirect based on role
  if (location.pathname === "/dashboard") {
    if (user?.role === "porter") {
      return <Navigate to="/dashboard/porters" replace />;
    }
    if (user?.role === "admin") {
      return <Navigate to="/dashboard/admin" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
