import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/appStore.js";
import { useAuthStore } from "../store/authStore.js";
import AnimatedButton from "./AnimatedButton.jsx";

const linkClass = ({ isActive }) =>
  `rounded-full px-3 py-1 text-sm transition ${
    isActive
      ? "bg-white/20 text-white"
      : "text-brand-muted hover:text-brand-ink"
  }`;

function Navbar() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const addToast = useAppStore((state) => state.addToast);

  const onLogout = async () => {
    await logout();
    addToast("success", "Signed out");
    navigate("/");
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-black/20 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-4 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-3 font-display text-xl font-semibold tracking-[0.08em] text-white"
        >
          <img
            src="/logo.jpg"
            alt="VidVortex logo"
            className="h-9 w-9 rounded-xl border border-white/20 object-cover shadow-cyan"
          />
          <span>VidVortex</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <NavLink to="/" className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/upload" className={linkClass}>
            Upload
          </NavLink>
          <NavLink to="/profile" className={linkClass}>
            Profile
          </NavLink>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="max-w-[150px] truncate text-sm text-brand-muted">
                {user.username}
              </span>
              <AnimatedButton onClick={onLogout}>Logout</AnimatedButton>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-3 py-1 text-sm text-brand-muted transition hover:text-white"
              >
                Login
              </Link>
              <AnimatedButton onClick={() => navigate("/register")}>
                Create Account
              </AnimatedButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
