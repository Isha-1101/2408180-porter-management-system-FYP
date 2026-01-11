import { Navigate } from "react-router";

const PorterPendingGuard = ({ chidren }) => {
  const useAuth = () => {
    // TODO: Replace with actual authentication hook
    return {
      activeRole: "porter",
      porterVerified: false,
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
