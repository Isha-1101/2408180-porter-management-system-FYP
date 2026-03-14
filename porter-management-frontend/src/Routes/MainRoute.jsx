// // Routes/MainRoute.jsx
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import PublicRoute from "./PublicRoute";
// // import ProtectedRoute from "./ProtectedRoute";
// import Layout from "../components/Layout";

// const MainRoute = () => {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route element={<Layout />}>
//           {/* Public routes without layout */}
//           <Route path="/*" element={<PublicRoute />} />

//           {/* Protected routes with layout */}
//           {/* <Route path="/dashboard/*" element={<ProtectedRoute />} /> */}
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   );
// };

// export default MainRoute;

// Routes/MainRoute.jsx
import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useLocation,
} from "react-router-dom";
import PublicRoute from "./PublicRoute";
import Layout from "../components/Layout";
import ProtectedRoute from "./ProtectedRoute";

import DashboardHome from "../pages/dashboard/DashboardHome";

// this wlll for porter specific routes
import PorterRegister from "../pages/dashboard/porter/PorterRegister";
import PorterGuards from "../guards/PorterGuards";
import PorterPending from "../pages/dashboard/porter/PorterPending";
import PorterRegisterGuard from "../guards/PorterRegisterGuard";
import PorterPendingGuard from "../guards/PorterPendingGuard";
import PorterDashboard from "../pages/dashboard/porter/PorterDashboard";
import AcceptedBookingDetails from "../pages/dashboard/porter/AcceptedBookingDetails";
import PorterProfile from "../pages/dashboard/porter/PorterProfile";
import TeamCreation from "../pages/dashboard/team/TeamCreation";
import PorterBooking from "../pages/dashboard/user/PorterBooking";
import Orders from "../pages/dashboard/user/Orders";
import Settings from "../pages/dashboard/user/Settings";
import UserProfile from "../pages/dashboard/user/UserProfile";
import BookingConfirmation from "../pages/dashboard/user/BookingConfirmation";
import BookingTracking from "../pages/dashboard/user/BookingTracking";
import Payment from "../pages/dashboard/user/Payment";
import BookingSuccess from "../pages/dashboard/user/BookingSuccess";
import { PorterRegistrationProvider } from "../pages/dashboard/porter/providers/PorterRegistrationProvider";
import DashboardLayout from "../pages/dashboard/layout";

// Admin pages
import AdminDashboardOverview from "../pages/dashboard/admin/AdminDashboardOverview";
import UserManagement from "../pages/dashboard/admin/UserManagement";
import PorterRegistrations from "../pages/dashboard/admin/PorterRegistrations";
import PorterManagement from "../pages/dashboard/admin/PorterManagement";

// Import pages that should NOT use Layout

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname, location.search]);

  return null;
};

const MainRoute = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Protected dashboard routes (NO public Layout/Navbar) */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="orders" element={<Orders />} />
            <Route path="booking" element={<PorterBooking />} />
            <Route path="profile" element={<UserProfile />} />
            <Route
              path="booking/confirmation"
              element={<BookingConfirmation />}
            />
            <Route path="booking/tracking" element={<BookingTracking />} />
            <Route path="booking/payment" element={<Payment />} />
            <Route path="booking/success" element={<BookingSuccess />} />
            <Route path="settings" element={<Settings />} />

            {/* Porter routes */}
            <Route path="porters">
              <Route
                element={
                  <PorterRegistrationProvider>
                    <Outlet />
                  </PorterRegistrationProvider>
                }
              >
                <Route
                  path="register"
                  element={
                    <PorterRegisterGuard>
                      <PorterRegister />
                    </PorterRegisterGuard>
                  }
                />
                <Route
                  path="pending"
                  element={
                    <PorterPendingGuard>
                      <PorterPending />
                    </PorterPendingGuard>
                  }
                />

                {/* <Route element={<PorterGuards />}> */}
                <Route index element={<PorterDashboard />} />
                <Route
                  path="accepted-booking"
                  element={<AcceptedBookingDetails />}
                />
                <Route path="team" element={<TeamCreation />} />
                <Route path="profile" element={<PorterProfile />} />
                {/* </Route> */}
              </Route>
            </Route>

            {/* Admin routes */}
            <Route path="admin">
              <Route index element={<AdminDashboardOverview />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="registrations" element={<PorterRegistrations />} />
              <Route path="porters" element={<PorterManagement />} />
            </Route>
          </Route>
        </Route>

        {/* Public routes WITH Layout */}
        <Route element={<Layout />}>
          <Route path="/*" element={<PublicRoute />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default MainRoute;
