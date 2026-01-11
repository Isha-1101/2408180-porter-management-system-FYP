import { Navigate } from "react-router";
const PorterRegisterGuard = ({ children }) => {
  const useAuth = () => {
    return {
      activeRole: "porter",
      proterVerified: false,
    };
  };
  const { activeRole, proterVerified } = useAuth();

  if (activeRole !== "porter") {
    return <Navigate to="/dashboard" replace />;
  }

  if (proterVerified) {
    return <Navigate to="/dashboard/porters" replace />;
  }
  return children;
};

export default PorterRegisterGuard;
