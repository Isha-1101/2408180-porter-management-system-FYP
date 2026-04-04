import {
  MapPinned,
  LayoutDashboard,
  UserCheck,
  ClipboardCheck,
  Truck,
  History,
  Home,
  Users,
  UserCog,
  BarChart3,
  ListChecks,
  DollarSign,
  Ban,
  Activity,
  TrendingUp,
  ClipboardList,
} from "lucide-react";
import { usePorter } from "../../../../hooks/porter/use-porter";

const getNavItems = (role) => {
  const { porter } = usePorter();
  const isPorterATeamOwner = porter?.porterType === "team";

  const userItems = [
    {
      label: "Book a Porter",
      to: "/dashboard/booking",
      icon: <MapPinned className="w-5 h-5" />,
      end: false,
    },
    {
      label: "My Orders",
      to: "/dashboard/orders",
      icon: <History className="w-5 h-5" />,
      end: true,
    },
  ];

  const porterItems = [
    {
      label: "Dashboard",
      to: "/dashboard/porters",
      icon: <Home className="w-5 h-5" />,
      end: true,
    },
    {
      label: "Analytics",
      to: "/dashboard/porters/analytics",
      icon: <BarChart3 className="w-5 h-5" />,
      end: true,
    },
    {
      label: "Booking History",
      to: "/dashboard/porters/booking-history",
      icon: <ListChecks className="w-5 h-5" />,
      end: true,
    },
    {
      label: "Porter Registration",
      to: "/dashboard/porters/register",
      icon: <ClipboardCheck className="w-5 h-5" />,
      end: true,
    },
    {
      label: "My Profile",
      to: "/dashboard/porters/profile",
      icon: <UserCog className="w-5 h-5" />,
      end: true,
    },
    isPorterATeamOwner && {
      label: "My Team",
      to: "/dashboard/porters/team",
      icon: <Users className="w-5 h-5" />,
      end: true,
    },
  ];

  const adminItems = [
    {
      label: "Overview",
      to: "/dashboard/admin",
      icon: <LayoutDashboard className="w-5 h-5" />,
      end: true,
    },
    {
      label: "Analytics",
      to: "/dashboard/admin/analytics",
      icon: <TrendingUp className="w-5 h-5" />,
      end: true,
    },
    {
      label: "Live Activity",
      to: "/dashboard/admin/activity",
      icon: <Activity className="w-5 h-5" />,
      end: true,
    },
    {
      label: "Bookings",
      to: "/dashboard/admin/bookings",
      icon: <ClipboardList className="w-5 h-5" />,
      end: true,
    },
    {
      label: "Cancellations",
      to: "/dashboard/admin/cancellations",
      icon: <Ban className="w-5 h-5" />,
      end: true,
    },
    {
      label: "Payments",
      to: "/dashboard/admin/payments",
      icon: <DollarSign className="w-5 h-5" />,
      end: true,
    },
    {
      label: "Porter Performance",
      to: "/dashboard/admin/porter-performance",
      icon: <Truck className="w-5 h-5" />,
      end: true,
    },
    {
      label: "User Management",
      to: "/dashboard/admin/users",
      icon: <UserCheck className="w-5 h-5" />,
      end: true,
    },
    {
      label: "Porter Registrations",
      to: "/dashboard/admin/registrations",
      icon: <ClipboardCheck className="w-5 h-5" />,
      end: true,
    },
    {
      label: "Porter Management",
      to: "/dashboard/admin/porters",
      icon: <Users className="w-5 h-5" />,
      end: true,
    },
  ];

  if (role === "admin") return adminItems;
  if (role === "porter") return porterItems.filter(Boolean);
  return userItems;
};

export default getNavItems;
