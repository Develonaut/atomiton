import { Navigate } from "@atomiton/router";

export default function DebugRedirect() {
  return <Navigate to="/debug/nodes" replace />;
}
