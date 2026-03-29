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

  // Items for porters (their own dashboard)
  const porterItems = [
    {
      label: "Dashboard",
      to: "/dashboard/porters",
      icon: <Home className="w-5 h-5" />,
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

  // Items for admins only
  const adminItems = [
    {
      label: "Overview",
      to: "/dashboard/admin",
      icon: <LayoutDashboard className="w-5 h-5" />,
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
      icon: <Truck className="w-5 h-5" />,
      end: true,
    },
  ];

  if (role === "admin") return adminItems;
  if (role === "porter") return porterItems;
  return userItems;
};

export default getNavItems;
