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
import PorterBooking from "../pages/dashboard/user/PorterBooking";
import Orders from "../pages/dashboard/user/Orders";
import Settings from "../pages/dashboard/user/Settings";
import BookingConfirmation from "../pages/dashboard/user/BookingConfirmation";
import Payment from "../pages/dashboard/user/Payment";
import { PorterRegistrationProvider } from "../pages/dashboard/porter/providers/PorterRegistrationProvider";
import DashboardLayout from "../pages/dashboard/layout";

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
            <Route
              path="booking/confirmation"
              element={<BookingConfirmation />}
            />
            <Route path="booking/payment" element={<Payment />} />
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
                {/* </Route> */}
              </Route>
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
