import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

/**
 * AdminGuard - Restricts access to admin-only routes.
 * Redirects non-admin users to the dashboard home.
 */
const AdminGuard = () => {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default AdminGuard;
