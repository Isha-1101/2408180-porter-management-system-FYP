import { MapPinned, Users } from "lucide-react";

const navItems = [
  {
    label: "Porter Booking",
    to: "/dashboard/booking",
    icon: <MapPinned className="w-5 h-5" />,
  },
  {
    label: "Porters",
    to: "/dashboard/porters",
    icon: <Users className="w-5 h-5" />,
  },
];

export default navItems;
