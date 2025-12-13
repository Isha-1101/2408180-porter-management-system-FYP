// import { NavLink, Outlet, useNavigate } from "react-router-dom";
// import {
//   MapPinned,
//   ClipboardList,
//   Users,
//   Settings,
//   LogOut,
//   LayoutDashboard,
//   User,
// } from "lucide-react";
// import Logo from "../../components/common/Logo";
// import { useAuthStore } from "../../store/auth.store";

// const DashboardLayout = () => {
//   const navigate = useNavigate();
//   const logout = useAuthStore((state) => state.logout);
//   const user = useAuthStore((state) => state.user);
//   const navItems = [
//     {
//       label: "Porter Booking",
//       to: "/dashboard",
//       icon: <MapPinned className="w-5 h-5" />,
//       end: true,
//     },
//     {
//       label: "Orders",
//       to: "/dashboard/orders",
//       icon: <ClipboardList className="w-5 h-5" />,
//     },
//     {
//       label: "Porters",
//       to: "/dashboard/porters",
//       icon: <Users className="w-5 h-5" />,
//     },
//     {
//       label: "Settings",
//       to: "/dashboard/settings",
//       icon: <Settings className="w-5 h-5" />,
//     },
//   ];

//   const linkBase =
//     "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition";

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] min-h-screen">
//         <aside className="bg-white border-r border-gray-200 px-4 py-5">
//           <div className="flex items-center gap-3 px-2">
//             <Logo />
//             <div>
//               <div className="font-bold text-primary">DOKO Namlo</div>
//               <div className="text-xs text-secondary">Dashboard</div>
//             </div>
//           </div>

//           <nav className="mt-6 space-y-1">
//             {navItems.map((item) => (
//               <NavLink
//                 key={item.to}
//                 to={item.to}
//                 end={item.end}
//                 className={({ isActive }) =>
//                   `${linkBase} ${
//                     isActive
//                       ? "bg-primary text-white"
//                       : "text-gray-700 hover:bg-gray-100"
//                   }`
//                 }
//               >
//                 {item.icon}
//                 <span>{item.label}</span>
//               </NavLink>
//             ))}
//             <div className="flex gap-3">
//               <User size={18} className="text-primary font-bold" />
//               <p className="capitalize text-secondary">{user.name}</p>
//             </div>
//           </nav>

//           <div className="mt-8 pt-6 border-t border-gray-200">
//             <button
//               onClick={logout}
//               className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition px-3 py-2.5 text-sm font-semibold cursor-pointer"
//             >
//               <LogOut className="w-4 h-4" />
//               Logout
//             </button>
//           </div>
//         </aside>

//         <main className="px-4 sm:px-6 lg:px-8 py-6">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// };

// export default DashboardLayout;

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  MapPinned,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  LayoutDashboard,
  User,
  Bell,
  Search,
  Menu,
  X,
  Home,
} from "lucide-react";
import Logo from "../../components/common/Logo";
import { useAuthStore } from "../../store/auth.store";
import { useState, useEffect } from "react";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3); // Example count

  const navItems = [
    {
      label: "Dashboard",
      to: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      end: true,
    },
    {
      label: "Porter Booking",
      to: "/dashboard/booking",
      icon: <MapPinned className="w-5 h-5" />,
    },
    {
      label: "Orders",
      to: "/dashboard/orders",
      icon: <ClipboardList className="w-5 h-5" />,
    },
    {
      label: "Porters",
      to: "/dashboard/porters",
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: "Settings",
      to: "/dashboard/settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const linkBase =
    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition";

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Mobile Menu Button & Logo */}
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 mr-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={() => navigate("/")}
              className="hidden lg:flex items-center gap-2 text-gray-700 hover:text-primary transition-colors mr-6"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Home</span>
            </button>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:block relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings, porters..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
              />
            </div>
          </div>

          {/* Right Section: User Info & Actions */}
          <div className="flex items-center gap-4">
            {/* Search Bar - Mobile */}
            <div className="lg:hidden relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-40 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600">
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-gray-900 capitalize">
                  {user?.name || "User"}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.role || "User"}
                </div>
              </div>

              <div className="relative group">
                <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="font-medium text-gray-900 capitalize">
                      {user?.name}
                    </div>
                    <div className="text-sm text-gray-500">{user?.email}</div>
                  </div>

                  <div className="py-2">
                    <button
                      onClick={() => navigate("/dashboard/profile")}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </button>
                    <button
                      onClick={() => navigate("/dashboard/settings")}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                  </div>

                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside
          className={`hidden lg:block bg-white border-r border-gray-200 w-64 min-h-[calc(100vh-4rem)] transition-all duration-300 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center">
                <Logo />
              </div>
              <div>
                <div className="font-bold text-primary">DOKO Namlo</div>
                <div className="text-xs text-secondary">Dashboard</div>
              </div>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `${linkBase} ${
                      isActive
                        ? "bg-primary text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`
                  }
                >
                  <div>{item.icon}</div>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Sidebar Toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="absolute -right-3 top-1/2 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className={`w-4 h-4 text-gray-500 transform transition-transform ${
                  isSidebarOpen ? "rotate-180" : ""
                }`}
              >
                &lt;
              </div>
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 z-40 lg:hidden transform transition-transform duration-300">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center">
                    <Logo />
                  </div>
                  <div>
                    <div className="font-bold text-primary">DOKO Namlo</div>
                    <div className="text-xs text-secondary">Dashboard</div>
                  </div>
                </div>

                <nav className="space-y-2">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `${linkBase} ${
                          isActive
                            ? "bg-primary text-white shadow-sm"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`
                      }
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div
                        className={`${
                          isActive ? "text-white" : "text-gray-500"
                        }`}
                      >
                        {item.icon}
                      </div>
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </nav>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="px-3 py-4 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {user?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user?.role}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition px-3 py-2 text-sm font-semibold cursor-pointer mt-4"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main
          className={`flex-1 px-4 sm:px-6 lg:px-8 py-6 ${
            !isSidebarOpen ? "lg:ml-0" : ""
          }`}
        >
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb (Optional) */}
            <div className="mb-6">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-3">
                  <li className="inline-flex items-center">
                    <NavLink
                      to="/dashboard"
                      className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </NavLink>
                  </li>
                </ol>
              </nav>
            </div>

            {/* Page Title */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.name?.split(" ")[0] || "User"}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                Here's what's happening with your porter bookings today.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {
                  label: "Active Bookings",
                  value: "12",
                  change: "+2",
                  icon: "📦",
                },
                {
                  label: "Available Porters",
                  value: "48",
                  change: "+5",
                  icon: "👷",
                },
                {
                  label: "Pending Orders",
                  value: "3",
                  change: "-1",
                  icon: "⏱️",
                },
                {
                  label: "Total Revenue",
                  value: "₹24,580",
                  change: "+12%",
                  icon: "💰",
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl">{stat.icon}</span>
                    <span
                      className={`text-sm font-medium px-2 py-1 rounded-full ${
                        stat.change.startsWith("+")
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
