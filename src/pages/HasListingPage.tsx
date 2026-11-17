import { Navigate } from "react-router-dom";

export function HasListingPage() {
  return <Navigate to="/onboarding?mode=has-listing" replace />;
}
