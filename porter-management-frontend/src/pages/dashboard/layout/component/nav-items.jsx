import { MapPinned, Users } from "lucide-react";

const navItems = [
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

export default navItems;
