import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";

function ProtectedRoute({ children }) {
  const location = useLocation();
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const user = useAuthStore((state) => state.user);

  if (isAuthLoading) {
    return <div className="glass-panel h-44 animate-pulse" />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}

export default ProtectedRoute;
