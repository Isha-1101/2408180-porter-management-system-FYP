import { Outlet } from "react-router-dom";
import PorterRegister from "../pages/dashboard/porter/PorterRegister";
import PorterGuards from "../guards/PorterGuards";
import PorterPending from "../pages/dashboard/porter/PorterPending";
import PorterRegisterGuard from "../guards/PorterRegisterGuard";
import PorterPendingGuard from "../guards/PorterPendingGuard";
import PorterDashboard from "../pages/dashboard/porter/PorterDashboard";
import AcceptedBookingDetails from "../pages/dashboard/porter/AcceptedBookingDetails";
import PorterProfile from "../pages/dashboard/porter/PorterProfile";
import PorterAnalytics from "../pages/dashboard/porter/PorterAnalytics";
import PorterBookingHistory from "../pages/dashboard/porter/PorterBookingHistory";
import TeamCreation from "../pages/dashboard/team/TeamCreation";
import TeamOwnerDashboard from "../pages/dashboard/porter/TeamOwnerDashboard";
import TeamLeadSelectPorters from "../pages/dashboard/porter/TeamLeadSelectPorters";
import TeamLeadConfirmBooking from "../pages/dashboard/porter/TeamLeadConfirmBooking";
import TeamMemberBookingResponse from "../pages/dashboard/porter/TeamMemberBookingResponse";
import { PorterRegistrationProvider } from "../pages/dashboard/porter/providers/PorterRegistrationProvider";
import PorterTeamGuard from "../guards/PorterTeamGuard";

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
        element: <PorterRegister />,
      },
      {
        path: "pending",
        element: <PorterPending />,
      },
      {
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
          {
            path: "analytics",
            element: <PorterAnalytics />,
          },
          {
            path: "booking-history",
            element: <PorterBookingHistory />,
          },
          {
            path: "team-owner",
            element: <TeamOwnerDashboard />,
          },
          {
            path: "team-lead/select-porters",
            element: <TeamLeadSelectPorters />,
          },
          {
            path: "team-lead/confirm-booking",
            element: <TeamLeadConfirmBooking />,
          },
          {
            path: "team-member/respond",
            element: <TeamMemberBookingResponse />,
          },
        ],
      },
    ],
  },
];

export default porterRoutes;
