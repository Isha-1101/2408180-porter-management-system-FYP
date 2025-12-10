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
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicRoute from "./PublicRoute";
import Layout from "../components/Layout";

// Import pages that should NOT use Layout
import Login from "../pages/Login";
import Register from "../pages/Register";

const MainRoute = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes WITHOUT Layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes WITH Layout */}
        <Route element={<Layout />}>
          <Route path="/*" element={<PublicRoute />} />
          {/* Add protected routes if needed */}
          {/* <Route path="/dashboard/*" element={<ProtectedRoute />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default MainRoute;
