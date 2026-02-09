import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../store/auth.store";
import { usePorter } from "../hooks/porter/use-porter";
import { memo } from "react";
import UiLoader from "../components/common/UiLoader";

const PorterGuards = memo(() => {
  const {
    porter,
    isLoading,
    porterRegistrationData,
    isRegistrationLoading,
    isError,
    isRegistrationError,
  } = usePorter();
  
  const { user } = useAuthStore();

  // No user logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Not switched to porter
  if (user.role !== "porter") {
    return <Navigate to="/dashboard" replace />;
  }

  // Show loader only when queries are enabled AND loading
  // When user.role === "porter", queries are enabled, so we check loading states
  if (isLoading || isRegistrationLoading) {
    return <UiLoader />;
  }

  // If there's an error fetching porter data or registration data, redirect to register
  // This handles the case where the API fails or returns an error
  if (isError && isRegistrationError) {
    return <Navigate to="/dashboard/porters/register" replace />;
  }

  // Not registered - check if porter is null/undefined AND registration data is empty
  if (
    !porter &&
    (!porterRegistrationData || porterRegistrationData?.length === 0)
  ) {
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
