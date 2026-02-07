import { Navigate } from "react-router";
import { usePorter } from "../hooks/porter/use-porter";
import { useAuthStore } from "../store/auth.store";
import { memo } from "react";
import UiLoader from "../components/common/UiLoader";

const PorterPendingGuard = memo(({ children }) => {
  const {
    porterRegistrationData,
    isRegistrationFetching,
    isRegistrationLoading,
    isRegistrationError,
  } = usePorter();
  const { user } = useAuthStore();

  // Show nothing while loading
  if (isRegistrationFetching || isRegistrationLoading) {
    return <UiLoader />;
  }

  // No user logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user?.role !== "porter") {
    return <Navigate to="/dashboard" replace />;
  }

  if (isRegistrationError) {
    return <Navigate to="/dashboard/porters/register" replace />;
  }

  if (
    !porterRegistrationData ||
    porterRegistrationData[0]?.status !== "submitted"
  ) {
    return <Navigate to="/dashboard/porters/register" replace />;
  }

  // // Only show pending page if status is pending
  // if (porterRegistrationData.status !== "pending") {
  //   return <Navigate to="/dashboard/porters" replace />;
  // }

  return children;
});

PorterPendingGuard.displayName = "PorterPendingGuard";

export default PorterPendingGuard;
