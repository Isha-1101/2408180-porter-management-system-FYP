import { Outlet } from "react-router-dom";
import PorterRegister from "../pages/dashboard/porter/PorterRegister";
import PorterGuards from "../guards/PorterGuards";
import PorterPending from "../pages/dashboard/porter/PorterPending";
import PorterRegisterGuard from "../guards/PorterRegisterGuard";
import PorterPendingGuard from "../guards/PorterPendingGuard";
import PorterDashboard from "../pages/dashboard/porter/PorterDashboard";
import AcceptedBookingDetails from "../pages/dashboard/porter/AcceptedBookingDetails";
import PorterProfile from "../pages/dashboard/porter/PorterProfile";
import TeamCreation from "../pages/dashboard/team/TeamCreation";
import TeamLeadSelectPorters from "../pages/dashboard/porter/TeamLeadSelectPorters";
import TeamLeadConfirmBooking from "../pages/dashboard/porter/TeamLeadConfirmBooking";
import { PorterRegistrationProvider } from "../pages/dashboard/porter/providers/PorterRegistrationProvider";
import PorterTeamGuard from "../guards/PorterTeamGuard";

// Wrapper component with provider
const PorterProviderWrapper = () => (
  <PorterRegistrationProvider>
    <Outlet />
  </PorterRegistrationProvider>
);

const porterRoutes = [
  {
    path: "porters",
    element: <PorterProviderWrapper />,
    children: [
      {
        path: "register",
        element: (
          // <PorterRegisterGuard>
          <PorterRegister />
          // </PorterRegisterGuard>
        ),
      },
      {
        path: "pending",
        element: (
          // <PorterPendingGuard>
          <PorterPending />
          // </PorterPendingGuard>
        ),
      },
      {
        // element: <PorterGuards />,
        children: [
          {
            index: true,
            element: <PorterDashboard />,
          },
          {
            path: "accepted-booking",
            element: <AcceptedBookingDetails />,
          },
          {
            path: "team",
            element: (
              <PorterTeamGuard>
                <TeamCreation />
              </PorterTeamGuard>
            ),
          },
          {
            path: "profile",
            element: <PorterProfile />,
          },

          // ── Team lead flow ──────────────────────────────────────────────
          // Step 1: select porters after accepting a team booking
          {
            path: "team-lead/select-porters",
            element: <TeamLeadSelectPorters />,
          },
          // Step 2: monitor member responses and confirm/complete the booking
          {
            path: "team-lead/confirm-booking",
            element: <TeamLeadConfirmBooking />,
          },
        ],
      },
    ],
  },
];

export default porterRoutes;
