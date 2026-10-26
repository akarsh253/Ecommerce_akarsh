import { Navigate, useLocation } from "react-router";
import { useAuth } from "../context/hooks.js";

export default function ProtectedRoute({ adminOnly = false, children }) {
  const { token, isAdmin } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
}
