// Routes/MainRoute.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "../components/layout/Layout";

const MainRoute = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    {/* Public routes without layout */}
                    <Route path="/*" element={<PublicRoute />} />

                    {/* Protected routes with layout */}
                    <Route path="/dashboard/*" element={<ProtectedRoute />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default MainRoute;
