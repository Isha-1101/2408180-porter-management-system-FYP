import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  MapPinned,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import Logo from "../../components/common/Logo";

const DashboardLayout = () => {
  const navigate = useNavigate();

  const navItems = [
    {
      label: "Porter Booking",
      to: "/dashboard",
      icon: <MapPinned className="w-5 h-5" />,
      end: true,
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] min-h-screen">
        <aside className="bg-white border-r border-gray-200 px-4 py-5">
          <div className="flex items-center gap-3 px-2">
            <Logo />
            <div>
              <div className="font-bold text-gray-900">DOKO Namlo</div>
              <div className="text-xs text-gray-500">Dashboard</div>
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `${linkBase} ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                localStorage.clear();
                navigate("/", { replace: true });
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition px-3 py-2.5 text-sm font-semibold cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </aside>

        <main className="px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
