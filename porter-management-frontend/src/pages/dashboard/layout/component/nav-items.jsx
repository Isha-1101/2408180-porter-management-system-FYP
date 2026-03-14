import { MapPinned, Users, LayoutDashboard, UserCheck, ClipboardCheck, Truck } from "lucide-react";

const getNavItems = (role) => {
  const userItems = [
    {
      label: "Dashboard",
      to: "/dashboard/booking",
      icon: <MapPinned className="w-5 h-5" />,
    },
    {
      label: "Porter Dashboard",
      to: "/dashboard/porters",
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: "Team Creation",
      to: "/dashboard/porters/team",
      icon: <Users className="w-5 h-5" />,
    },
  ];

  const adminItems = [
    {
      label: "Admin Dashboard",
      to: "/dashboard/admin",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "User Management",
      to: "/dashboard/admin/users",
      icon: <UserCheck className="w-5 h-5" />,
    },
    {
      label: "Porter Registrations",
      to: "/dashboard/admin/registrations",
      icon: <ClipboardCheck className="w-5 h-5" />,
    },
    {
      label: "Porter Management",
      to: "/dashboard/admin/porters",
      icon: <Truck className="w-5 h-5" />,
    },
  ];

  if (role === "admin") {
    return [...adminItems, ...userItems];
  }

  return userItems;
};

export default getNavItems;
