// guards/PorterPendingGuard.jsx
import { Navigate } from "react-router";

const PorterPendingGuard = ({ chidren }) => {
  const useAuth = () => {
    // Mock implementation of authentication and porter profile
    return {
      activeRole: "porter", // Change this value to test different scenarios
      porterVerified: false, // Change status to true or false to test other scenarios
    };
  };
  const { activeRole, porterVerified } = useAuth();

  if (activeRole !== "porter") {
    return <Navigate to="/dashboard" replace />;
  }

  if (!porterVerified) {
    return <Navigate to="/dashboard/porters/register" replace />;
  }

  if (porterVerified) {
    return <Navigate to="/dashboard/porters" replace />;
  }

  return chidren;
};

export default PorterPendingGuard;
