// Routes/PublicRoute.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "../pages/LandingPage.jsx";
import Login from "../pages/authPages/Login.jsx";
import Register from "../pages/authPages/Register.jsx";
import ChangeTemporaryPassword from "../pages/authPages/ChangeTemporaryPassword.jsx";
import { useAuthStore } from "../store/auth.store.js";
import { useLocation } from "react-router-dom";

const PublicRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (isAuthenticated && location.pathname !== "/change-temporary-password") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/change-temporary-password" element={<ChangeTemporaryPassword />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default PublicRoute;
