import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/appStore.js";
import { useAuthStore } from "../store/authStore.js";
import AnimatedButton from "./AnimatedButton.jsx";

const linkClass = ({ isActive }) =>
  `relative px-4 py-2 text-sm font-medium transition-all duration-300 ${
    isActive ? "text-white" : "text-brand-muted hover:text-brand-ink"
  } ${
    isActive
      ? "after:absolute after:bottom-1 after:left-4 after:h-1 after:w-[calc(100%-2rem)] after:bg-brand-base after:rounded-full"
      : "after:absolute after:bottom-1 after:left-4 after:h-1 after:w-0 after:bg-brand-base after:rounded-full after:transition-all after:duration-300 hover:after:w-[calc(100%-2rem)]"
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
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/5 bg-gradient-to-b from-black/50 via-black/30 to-black/20 backdrop-blur-3xl">
      <div className="mx-auto flex h-18 w-full max-w-[1400px] items-center justify-between px-4 lg:px-8">
        <Link
          to="/"
          className="group flex items-center gap-2.5 transition-opacity duration-300 hover:opacity-80"
        >
          <div className="relative h-10 w-10 rounded-lg border border-brand-base/40 bg-gradient-to-br from-brand-base/20 to-brand-base/5 overflow-hidden shadow-lg shadow-brand-base/10">
            <img
              src="/logo.jpg"
              alt="VidVortex logo"
              className="h-full w-full object-cover"
            />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-white group-hover:text-brand-base transition-colors duration-300">
            VidVortex
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/upload" className={linkClass}>
            Upload
          </NavLink>
          <NavLink to="/profile" className={linkClass}>
            Profile
          </NavLink>
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setOpenMenu((prev) => !prev)}
                className="group flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition-all duration-300 hover:border-brand-base/40 hover:bg-white/10 active:scale-95"
              >
                <div className="relative h-8 w-8 rounded-full border border-brand-base/30 overflow-hidden group-hover:border-brand-base/60 transition-colors duration-300">
                  <img
                    src={user.avatar || "/logo.jpg"}
                    alt="Account avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="max-w-[140px] truncate text-sm font-medium text-brand-muted group-hover:text-brand-ink transition-colors duration-300">
                  {user.username}
                </span>
              </button>

              {openMenu ? (
                <div className="absolute right-0 z-50 mt-3 w-56 rounded-xl border border-white/10 bg-black/60 backdrop-blur-2xl overflow-hidden shadow-2xl shadow-black/50">
                  <div className="space-y-1 p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(false);
                        navigate("/profile");
                      }}
                      className="w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium text-brand-muted transition-all duration-200 hover:bg-white/10 hover:text-white hover:pl-5"
                    >
                      Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(false);
                        navigate("/settings");
                      }}
                      className="w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium text-brand-muted transition-all duration-200 hover:bg-white/10 hover:text-white hover:pl-5"
                    >
                      Settings
                    </button>
                    <div className="my-1 h-px bg-white/5" />
                    <button
                      type="button"
                      onClick={onLogout}
                      className="w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium text-rose-300/80 transition-all duration-200 hover:bg-rose-500/20 hover:text-rose-100 hover:pl-5"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg border border-brand-base/70 bg-brand-base px-4 py-2 text-sm font-semibold text-white shadow-glow transition-all duration-300 hover:bg-brand-base/90 hover:shadow-xl hover:shadow-brand-base/30 active:scale-95"
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
