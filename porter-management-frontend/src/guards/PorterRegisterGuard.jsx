import { Navigate } from "react-router";
import { useAuthStore } from "../store/auth.store";
import { usePorter } from "../hooks/porter/use-porter";
import { memo } from "react";
import UiLoader from "../components/common/UiLoader";

/**
 * PorterRegisterGuard - Guards the registration page
 *
 * Only allows access if:
 * - User is authenticated with "porter" role
 * - No registration exists yet, OR
 * - Registration is in "draft" or "in_progress" status
 *
 * Redirects away if:
 * - Not authenticated → login
 * - Not porter role → dashboard
 * - Registration submitted → pending page
 * - Registration approved → porter dashboard
 */
const PorterRegisterGuard = memo(({ children }) => {
  const {
    porter,
    porterRegistrationData,
    isRegistrationLoading,
    isRegistrationFetching,
  } = usePorter();

  const { user } = useAuthStore();

  // Show loader while checking
  if (isRegistrationLoading || isRegistrationFetching) {
    return <UiLoader />;
  }

  // No user logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Not a porter role
  if (user?.role !== "porter") {
    return <Navigate to="/dashboard" replace />;
  }

  const registration = porterRegistrationData;
  const registrationStatus = registration[0]?.status;
  const hasPorterProfile = !!porter;

  // Registration submitted → go to pending
  if (registrationStatus === "submitted") {
    return <Navigate to="/dashboard/porters/pending" replace />;
  }

  // Registration approved → go to porter dashboard
  if (registrationStatus === "approved") {
    if (hasPorterProfile) {
      return <Navigate to="/dashboard/porters" replace />;
    }
    // Approved but no profile yet → still show pending
    return <Navigate to="/dashboard/porters/pending" replace />;
  }

  // Allow access if:
  // - No registration yet (!registration)
  // - Registration in draft/in_progress (can continue filling)
  const canAccessRegister =
    !registration ||
    registrationStatus === "draft" ||
    registrationStatus === "in_progress";

  if (!canAccessRegister) {
    return <Navigate to="/dashboard/porters/register" replace />;
  }

  return children;
});

PorterRegisterGuard.displayName = "PorterRegisterGuard";

export default PorterRegisterGuard;
