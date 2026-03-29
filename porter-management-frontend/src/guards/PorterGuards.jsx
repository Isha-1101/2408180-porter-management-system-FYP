import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../store/auth.store";
import { usePorter } from "../hooks/porter/use-porter";
import { memo } from "react";
import UiLoader from "../components/common/UiLoader";

/**
 * PorterGuards - Main guard for porter dashboard routes
 *
 * Flow:
 * 1. User must be authenticated and have role "porter"
 * 2. Check if porter has completed registration:
 *    - No registration data → redirect to /dashboard/porters/register
 *    - Registration status "draft" or "in_progress" → redirect to register
 *    - Registration status "submitted" → redirect to /dashboard/porters/pending
 *    - Registration status "approved" AND porter profile exists → allow access
 * 3. Approved porters can access dashboard and related routes
 */
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

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Not a porter role
  if (user.role !== "porter") {
    return <Navigate to="/dashboard" replace />;
  }

  // Show loader while checking registration status
  if (isLoading || isRegistrationLoading) {
    return <UiLoader />;
  }

  // Determine registration status
  const registration = porterRegistrationData;
  const registrationStatus = registration?.status;
  const hasPorterProfile = !!porter;

  // Case 1: No registration at all → must register first
  if (!registration || isRegistrationError) {
    return <Navigate to="/dashboard/porters/register" replace />;
  }

  // Case 2: Registration in progress but not submitted → continue registration
  if (registrationStatus === "draft" || registrationStatus === "in_progress") {
    return <Navigate to="/dashboard/porters/register" replace />;
  }

  // Case 3: Registration submitted, waiting for admin approval → show pending
  if (registrationStatus === "submitted") {
    return <Navigate to="/dashboard/porters/pending" replace />;
  }

  // Case 4: Registration approved but no porter profile yet (rare edge case)
  // This could happen if admin approved but profile creation is pending
  if (registrationStatus === "approved" && !hasPorterProfile) {
    return <Navigate to="/dashboard/porters/pending" replace />;
  }

  // Case 5: Fully approved porter with profile → allow access to dashboard
  if (registrationStatus === "approved" && hasPorterProfile) {
    // Check if porter account is active
    if (porter.status === "banned" || porter.status === "inactive") {
      return <Navigate to="/dashboard" replace />;
    }
    return <Outlet />;
  }

  // Default: unknown state → redirect to register
  return <Navigate to="/dashboard/porters/register" replace />;
});

PorterGuards.displayName = "PorterGuards";

export default PorterGuards;
