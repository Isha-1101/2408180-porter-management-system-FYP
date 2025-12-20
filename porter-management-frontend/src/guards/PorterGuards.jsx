import { Navigate, Outlet } from "react-router";

const PorterGuards = () => {
  const useAuth = () => {
    // Mock implementation of authentication and porter profile
    return {
      activeRole: "porter", // Change this value to test different scenarios
      // porterProfile: { status: "approved" }, // Change status to "pending" or null to test other scenarios
    };
  };
  const { activeRole, porterProfile } = useAuth();

  // 1Not switched to porter
  if (activeRole !== "porter") {
    return <Navigate to="/dashboard" replace />;
  }

  // Not registered
  if (!porterProfile || porterProfile.status === "rejected") {
    return <Navigate to="/dashboard/porters/register" replace />;
  }

  // Registered but not approved
  if (porterProfile.status === "pending") {
    return <Navigate to="/dashboard/porters/pending" replace />;
  }

  // Approved porter
  return <Outlet />;
};

export default PorterGuards;
