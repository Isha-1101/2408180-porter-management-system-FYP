import { Navigate } from "react-router";
import { usePorter } from "../hooks/porter/use-porter";
import { useAuthStore } from "../store/auth.store";
import { memo } from "react";
import UiLoader from "../components/common/UiLoader";

/**
 * PorterPendingGuard - Guards the pending/waiting page
 *
 * Shows pending page when:
 * - Registration status is "submitted" (waiting for admin approval)
 * - Registration approved but porter profile not yet created (edge case)
 *
 * Redirects away if:
 * - Not authenticated → login
 * - Not porter role → dashboard
 * - No registration → register page
 * - Registration draft/in_progress → continue registration
 * - Fully approved with profile → porter dashboard
 */
const PorterPendingGuard = memo(({ children }) => {
  const {
    porter,
    porterRegistrationData,
    isRegistrationFetching,
    isRegistrationLoading,
    isRegistrationError,
  } = usePorter();
  const { user } = useAuthStore();

  // Show loader while checking
  if (isRegistrationFetching || isRegistrationLoading) {
    return <UiLoader />;
  }

  // Not authenticated
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

  // No registration or error → go register
  if (!registration || isRegistrationError) {
    return <Navigate to="/dashboard/porters/register" replace />;
  }

  // Registration in progress → go continue registration
  if (registrationStatus === "draft" || registrationStatus === "in_progress") {
    return <Navigate to="/dashboard/porters/register" replace />;
  }

  // Fully approved with profile → go to dashboard
  if (registrationStatus === "approved" && hasPorterProfile) {
    return <Navigate to="/dashboard/porters" replace />;
  }

  // Show pending for:
  // - "submitted" status (waiting approval)
  // - "approved" but no profile yet (admin approved, profile creation pending)
  const canAccessPending =
    registrationStatus === "submitted" ||
    (registrationStatus === "approved" && !hasPorterProfile);

  if (!canAccessPending) {
    // Unknown state → default to register
    return <Navigate to="/dashboard/porters/register" replace />;
  }

  return children;
});

PorterPendingGuard.displayName = "PorterPendingGuard";

export default PorterPendingGuard;
