import { Outlet, useNavigate } from "react-router-dom";
import { Bell, Settings, LogOut, User } from "lucide-react";
import { useState } from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../../../components/ui/sidebar";
import AppSidebar from "./app-sidebar";
import "./sidebar.css";
import Logo from "../../../components/common/Logo";
import { useAuthStore } from "../../../store/auth.store";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-gray-50 flex w-full">
        {/* App Sidebar */}
        <AppSidebar />

        {/* Main Content Area */}
        <SidebarInset className="flex-1">
          {/* Top Navbar */}
          <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
              {/* Left Section */}
              <div className="flex items-center gap-3">
                <SidebarTrigger />

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
                        <div className="text-sm text-gray-500">
                          {user?.email}
                        </div>
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
          </header>

          {/* Main Content */}
          <main className="p-0">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
