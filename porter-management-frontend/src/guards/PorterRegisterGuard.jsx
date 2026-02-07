import { Navigate } from "react-router";
import { useAuthStore } from "../store/auth.store";
import { usePorter } from "../hooks/porter/use-porter";
import { memo } from "react";
import { Loader2 } from "lucide-react";
import UiLoader from "../components/common/UiLoader";

const PorterRegisterGuard = memo(({ children }) => {
  const {
    porterRegistrationData,
    isRegistrationLoading,
    isRegistrationFetching,
  } = usePorter();
  const { user } = useAuthStore();

  // Show nothing while loading
  if (isRegistrationLoading || isRegistrationFetching) {
    return <UiLoader />;
  }

  // No user logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user?.role !== "porter") {
    return <Navigate to="/dashboard" replace />;
  }

  // waiting for admin approval
  if (
    porterRegistrationData &&
    porterRegistrationData[0]?.status === "submitted"
  ) {
    return <Navigate to="/dashboard/porters/pending" replace />;
  }
  // If already registered(approved), redirect to porters dashboard
  if (
    porterRegistrationData &&
    porterRegistrationData[0]?.status === "approved"
  ) {
    return <Navigate to="/dashboard/porters" replace />;
  }

  return children;
});

PorterRegisterGuard.displayName = "PorterRegisterGuard";

export default PorterRegisterGuard;
