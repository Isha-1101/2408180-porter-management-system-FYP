import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../store/auth.store";
import { usePorter } from "../hooks/porter/use-porter";
import { memo } from "react";
import UiLoader from "../components/common/UiLoader";

const PorterGuards = memo(() => {
  const {
    porter,
    isLoading,
    isFetching,
    porterRegistrationData,
    isRegistrationLoading,
    isRegistrationFetching,
  } = usePorter();
  console.log("🚀 ~ isRegistrationFetching:", porterRegistrationData?.[0]?.status);
  const { user } = useAuthStore();

  // Show nothing while loading, but don't redirect
  if (isLoading || isFetching || isRegistrationFetching || isRegistrationLoading) {
    return <UiLoader />;
  }

  // No user logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Not switched to porter
  if (user.role !== "porter") {
    return <Navigate to="/dashboard" replace />;
  }

  // Not registered
  if (
    !porter && porterRegistrationData?.length === 0)
   {
    return <Navigate to="/dashboard/porters/register" replace />;
  }

  // Registered but not approved
  if (porterRegistrationData?.[0]?.status === "submitted") {
    return <Navigate to="/dashboard/porters/pending" replace />;
  }

  // Approved porter
  return <Outlet />;
});

PorterGuards.displayName = "PorterGuards";

export default PorterGuards;
