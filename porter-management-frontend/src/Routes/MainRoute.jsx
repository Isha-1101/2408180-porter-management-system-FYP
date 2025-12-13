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
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import PublicRoute from "./PublicRoute";
import Layout from "../components/Layout";
import ProtectedRoute from "./ProtectedRoute";

import DashboardLayout from "../pages/dashboard/DashboardLayout";
import DashboardHome from "../pages/dashboard/DashboardHome";
import Orders from "../pages/dashboard/Orders";
import Porters from "../pages/dashboard/Porters";
import Settings from "../pages/dashboard/Settings";

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
            <Route path="porters" element={<Porters />} />
            <Route path="settings" element={<Settings />} />
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
