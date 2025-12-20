// guards/PorterRegisterGuard.jsx
import { Navigate } from "react-router";

const PorterRegisterGuard = ({ children }) => {
  const useAuth = () => {
    // Mock implementation of authentication and porter profile
    return {
      activeRole: "porter", // Change this value to test different scenarios
      proterVerified: false, // Change status to true or false to test other scenarios
    };
  };
  const { activeRole, proterVerified } = useAuth();

  // Must switch to porter first
  if (activeRole !== "porter") {
    return <Navigate to="/dashboard" replace />;
  }

  // Already registered → no need to register again
  if (proterVerified) {
    return <Navigate to="/dashboard/porters" replace />;
  }
  return children;
};

export default PorterRegisterGuard;
