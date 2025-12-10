import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
