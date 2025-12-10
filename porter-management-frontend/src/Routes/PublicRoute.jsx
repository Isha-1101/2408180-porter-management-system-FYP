// Routes/PublicRoute.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import LandingPage from "../pages/LandingPage.jsx";
import Register from "../pages/Register.jsx";

const PublicRoute = () => {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default PublicRoute;
