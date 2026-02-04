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
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Logo from "../components/common/Logo";
import { useAuthStore } from "../store/auth.store";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  // Load sidebar state from localStorage or default to true
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const navItems = [
    // {
    //   label: "Dashboard",
    //   to: "/dashboard",
    //   icon: <LayoutDashboard className="w-5 h-5" />,
    //   end: true,
    // },
    {
      label: "Porter Booking",
      to: "/dashboard/booking",
      icon: <MapPinned className="w-5 h-5" />,
    },
    // {
    //   label: "Orders",
    //   to: "/dashboard/orders",
    //   icon: <ClipboardList className="w-5 h-5" />,
    // },
    {
      label: "Porters",
      to: "/dashboard/porters",
      icon: <Users className="w-5 h-5" />,
    },
    // {
    //   label: "Settings",
    //   to: "/dashboard/settings",
    //   icon: <Settings className="w-5 h-5" />,
    // },
  ];

  // Persist sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {/* Desktop Sidebar Toggle */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex p-2 rounded-lg text-primary hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isSidebarOpen ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>

            {/* Logo */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors"
            >
              <Logo isColored containerClassName="h-20 w-20" />
              <span className="hidden sm:inline font-bold text-primary">
                DOKO Namlo
              </span>
            </button>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
              <Bell className="w-5 h-5 text-primary" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
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
                <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
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
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </button>
                    <button
                      onClick={() => navigate("/dashboard/settings")}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                  </div>

                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
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
          className={`hidden lg:block bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "w-64" : "w-0 overflow-hidden"
          }`}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10   bg-primary rounded-xl flex items-center justify-center shrink-0">
                <Logo />
              </div>
              <div>
                <div className="font-bold text-primary whitespace-nowrap">
                  DOKO Namlo
                </div>
                <div className="text-xs text-gray-500 whitespace-nowrap">
                  Dashboard
                </div>
              </div>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary  text-white shadow-md shadow-primary/20"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`
                  }
                >
                  <div className="shrink-0">{item.icon}</div>
                  <span className="whitespace-nowrap">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 z-40 lg:hidden transform transition-transform duration-300 shadow-xl">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    <Logo />
                  </div>
                  <div>
                    <div className="font-bold text-primary">DOKO Namlo</div>
                    <div className="text-xs text-gray-500">Dashboard</div>
                  </div>
                </div>

                <nav className="space-y-2">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? "bg-primary text-white shadow-md shadow-primary/20"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`
                      }
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div>{item.icon}</div>
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </nav>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="px-4 py-4 rounded-xl bg-linear-to-br from-gray-50 to-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
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
                    <Button
                      onClick={handleLogout}
                      variant="destructive"
                      className="w-full flex items-center justify-center gap-2"
                      size="sm"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "lg:ml-0" : "lg:ml-0"
          }`}
        >
          <div className="">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
