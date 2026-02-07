import { Navigate } from "react-router";
import { useAuthStore } from "../store/auth.store";
import { usePorter } from "../hooks/porter/use-porter";
import { memo } from "react";
import { Loader2 } from "lucide-react";
import UiLoader from "../components/common/UiLoader";

const PorterRegisterGuard = memo(({ children }) => {
  const {porterRegistrationData, isRegistrationLoading, isRegistrationFetching } = usePorter();
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

  // If already registered, redirect to porters dashboard
  if (porterRegistrationData && ( porterRegistrationData[0]?.status === "completed" || porterRegistrationData[0]?.status === "pending" || porterRegistrationData[0]?.status === "submitted")) {
    return <Navigate to="/dashboard/porters" replace />;
  }

  return children;
});

PorterRegisterGuard.displayName = "PorterRegisterGuard";

export default PorterRegisterGuard;
