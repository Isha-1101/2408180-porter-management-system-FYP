import DashboardHome from "../pages/dashboard/DashboardHome";
import PorterBooking from "../pages/dashboard/user/PorterBooking/index";
import Orders from "../pages/dashboard/user/Orders";
import Settings from "../pages/dashboard/user/Settings";
import UserProfile from "../pages/dashboard/user/UserProfile";
import BookingConfirmation from "../pages/dashboard/user/BookingConfirmation";
import BookingTracking from "../pages/dashboard/user/BookingTracking";
import TeamBookingTracking from "../pages/dashboard/user/TeamBookingTracking";
import PaymentSuccess from "../pages/dashboard/user/PaymentSuccess";
import PaymentFailure from "../pages/dashboard/user/PaymentFailure";
import { EsewaPaymentRedirect } from "../components/payment/EsewaPaymentRedirect";

// User routes configuration array for useRoutes
const userRoutes = [
  {
    index: true,
    element: <PorterBooking />,
  },
  {
    path: "orders",
    element: <Orders />,
  },
  {
    path: "profile",
    element: <UserProfile />,
  },
  {
    path: "booking/confirmation",
    element: <BookingConfirmation />,
  },
  {
    path: "booking/tracking",
    element: <BookingTracking />,
  },
  // Team porter booking status tracker — live stage stepper + SSE updates
  {
    path: "booking/team-tracking",
    element: <TeamBookingTracking />,
  },
  // Support direct navigation from Orders with bookingId in URL
  {
    path: "booking/team-tracking/:bookingId",
    element: <TeamBookingTracking />,
  },
  {
    path: "booking/tracking/:bookingId",
    element: <BookingTracking />,
  },
  {
    path: "payment/success",
    element: <PaymentSuccess />,
  },
  {
    path: "payment/failure",
    element: <PaymentFailure />,
  },
  {
    path: "payment/esewa-redirect",
    element: <EsewaPaymentRedirect />,
  },
  {
    path: "settings",
    element: <Settings />,
  },
];

export default userRoutes;
