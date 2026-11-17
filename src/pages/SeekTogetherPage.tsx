import { Navigate } from "react-router-dom";

export function SeekTogetherPage() {
  return <Navigate to="/onboarding?mode=seek-together" replace />;
}
