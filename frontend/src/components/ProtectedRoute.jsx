import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import AdvancedLoader from "./AdvancedLoader.jsx";

function ProtectedRoute({ children, allowedRoles = ["user", "admin"] }) {
  const location = useLocation();
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const user = useAuthStore((state) => state.user);

  if (isAuthLoading) {
    return (
      <AdvancedLoader
        compact
        title="Checking Access"
        subtitle="Validating your secure route"
      />
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles.length && !allowedRoles.includes(user.role || "user")) {
    return (
      <div className="glass-panel p-8 text-center">
        <p className="font-display text-2xl text-white">Access restricted</p>
        <p className="mt-2 text-sm text-brand-muted">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
