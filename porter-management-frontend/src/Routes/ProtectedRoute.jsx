import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const isLoggedIn = localStorage.getItem("access_token");
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
