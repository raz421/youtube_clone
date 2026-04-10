import { useEffect, useRef, useState } from "react";
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
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!openMenu) {
      return;
    }

    const onPointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [openMenu]);

  const onLogout = async () => {
    await logout();
    addToast("success", "Signed out");
    setOpenMenu(false);
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
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setOpenMenu((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2 py-1 transition hover:bg-white/10"
              >
                <img
                  src={user.avatar || "/logo.jpg"}
                  alt="Account avatar"
                  className="h-8 w-8 rounded-full border border-white/20 object-cover"
                />
                <span className="max-w-[140px] truncate text-sm text-brand-muted">
                  {user.username}
                </span>
              </button>

              {openMenu ? (
                <div className="absolute right-0 z-50 mt-2 w-48 rounded-2xl border border-white/10 bg-[#0f0f16]/95 p-2 backdrop-blur-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(false);
                      navigate("/profile");
                    }}
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm text-brand-muted transition hover:bg-white/10 hover:text-white"
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(false);
                      navigate("/settings");
                    }}
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm text-brand-muted transition hover:bg-white/10 hover:text-white"
                  >
                    Settings
                  </button>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm text-rose-200 transition hover:bg-rose-500/20"
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
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
