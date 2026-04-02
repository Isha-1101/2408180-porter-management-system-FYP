import { Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  Settings,
  LogOut,
  User,
  X,
  Package,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AppSidebar from "./app-sidebar";
import "./sidebar.css";

import { useAuthStore } from "@/store/auth.store";
import useSSENotifications from "@/hooks/useSSENotifications";
import {
  useGetPorterByUser,
  useTogglePorterStatus,
} from "@/apis/hooks/portersHooks";
import { Switch } from "@/components/ui/switch";

const NOTIF_ICONS = {
  "booking-confirmed": <CheckCircle2 className="w-4 h-4 text-green-500" />,
  "booking-cancelled": <AlertCircle className="w-4 h-4 text-red-500" />,
  "booking-completed": <CheckCircle2 className="w-4 h-4 text-blue-500" />,
  "new-booking-request": <Package className="w-4 h-4 text-primary" />,
};

const NOTIF_LABELS = {
  "booking-confirmed": "Porter accepted your booking!",
  "booking-cancelled": "A booking was cancelled.",
  "booking-completed": "Booking marked as completed.",
  "new-booking-request": "New booking request received!",
};

const DashboardLayout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { notifications, unseenCount, markSeen, clearNotification } =
    useSSENotifications();

  const { data: porterInfo, refetch: refetchPorter } = useGetPorterByUser();
  const porterData = porterInfo?.data?.porter;

  const { mutate: toggleStatus, isPending: isToggling } =
    useTogglePorterStatus();

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleToggleStatus = () => {
    toggleStatus(undefined, {
      onSuccess: () => {
        refetchPorter();
      },
    });
  };

  const handleBellClick = () => {
    setNotifOpen((prev) => !prev);
    if (!notifOpen) markSeen();
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-background flex w-full">
        {/* App Sidebar */}
        <AppSidebar />

        {/* Main Content Area */}
        <SidebarInset className="flex-1 min-w-0">
          {/* Top Navbar */}
          <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
              {/* Left Section */}
              <div className="flex items-center gap-3">
                <SidebarTrigger />
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-4">
                {/* Notifications Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={handleBellClick}
                    className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5 text-[#1C5493]" />
                    {unseenCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium animate-pulse">
                        {unseenCount > 9 ? "9+" : unseenCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {notifOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          Notifications
                        </h3>
                        {notifications.length > 0 && (
                          <span className="text-xs text-gray-500">
                            {notifications.length} total
                          </span>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-gray-500">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
                            >
                              <div className="mt-0.5 shrink-0">
                                {NOTIF_ICONS[notif.type] || (
                                  <Bell className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                  {NOTIF_LABELS[notif.type] || notif.type}
                                </p>
                                {notif.data?.bookingId && (
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    #
                                    {String(notif.data.bookingId)
                                      .slice(-6)
                                      .toUpperCase()}
                                  </p>
                                )}
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {new Date(
                                    notif.timestamp,
                                  ).toLocaleTimeString()}
                                </p>
                              </div>
                              <button
                                onClick={() => clearNotification(notif.id)}
                                className="text-gray-300 hover:text-gray-500 shrink-0"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                    <div className="text-sm font-medium text-gray-900 capitalize">
                      {user?.name || "User"}
                    </div>
                    {user?.role === "porter" ? (
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <span
                          className={`text-[10px] font-semibold tracking-wide uppercase ${porterData?.currentStatus === "online" ? "text-green-600" : "text-gray-500"}`}
                        >
                          {porterData?.currentStatus === "online"
                            ? "Online"
                            : "Offline"}
                        </span>
                        <Switch
                          checked={porterData?.currentStatus === "online"}
                          onCheckedChange={handleToggleStatus}
                          disabled={isToggling}
                          size="sm"
                        />
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">
                        {user?.role || "User"}
                      </div>
                    )}
                  </div>

                  <div className="relative group">
                    <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-9 h-9 bg-[#1C5493] rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
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
                          onClick={() =>
                            navigate(
                              user?.role === "porter"
                                ? "/dashboard/porters/profile"
                                : "/dashboard/profile",
                            )
                          }
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
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
