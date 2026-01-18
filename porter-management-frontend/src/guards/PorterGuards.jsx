import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../store/auth.store";
import { usePorter } from "../hooks/porter/use-porter";
import { memo } from "react";
import UiLoader from "../components/common/UiLoader";

const PorterGuards = memo(() => {
  const { porter, isLoading, isFetching } = usePorter();
  const { user } = useAuthStore();

  // Show nothing while loading, but don't redirect
  if (isLoading || isFetching) {
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
  if (!porter) {
    return <Navigate to="/dashboard/porters/register" replace />;
  }

  // Registered but not approved
  if (porter?.status === "pending") {
    return <Navigate to="/dashboard/porters/pending" replace />;
  }

  // Approved porter
  return <Outlet />;
});

PorterGuards.displayName = "PorterGuards";

export default PorterGuards;
