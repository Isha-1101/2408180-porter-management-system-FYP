// Routes/ProtectedRoute.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import AddTransaction from "@/pages/AddTransaction";
import BudgetSettings from "@/pages/BudgetSettings";
import History from "@/pages/History";
import Profile from "@/pages/Profile";

const ProtectedRoute = () => {
    const isLoggedIn = localStorage.getItem("token");
    if (!isLoggedIn) return <Navigate to="/login" replace />;

    return (
        <main className="min-h-screen px-10 py-8">
            <Routes>
                <Route index element={<Dashboard />} />
                <Route path="add" element={<AddTransaction />} />
                <Route path="settings" element={<BudgetSettings />} />
                <Route path="history" element={<History />} />
                <Route path="profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </main>
    );
};

export default ProtectedRoute;
