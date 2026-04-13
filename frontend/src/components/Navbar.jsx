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
  const isAdmin = user?.role === "admin";
  const logout = useAuthStore((state) => state.logout);
  const addToast = useAppStore((state) => state.addToast);
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  const accountMenuItems = [
    {
      label: "Profile",
      onClick: () => {
        setOpenMenu(false);
        navigate("/profile");
      },
    },
    {
      label: "Settings",
      onClick: () => {
        setOpenMenu(false);
        navigate("/settings");
      },
    },
    ...(isAdmin
      ? [
          {
            label: "Admin Dashboard",
            onClick: () => {
              setOpenMenu(false);
              navigate("/admin");
            },
          },
        ]
      : []),
  ];

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
                className="navbar-btn group flex items-center gap-2.5 rounded-xl border border-white/10 bg-[rgba(14,14,20,0.92)] px-3.5 py-2.5 shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition-all duration-300 hover:border-brand-base/40 hover:bg-[rgba(18,18,26,0.98)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-base/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06070f] active:scale-[0.98]"
              >
                <div className="relative h-8 w-8 overflow-hidden rounded-full border border-brand-base/55 shadow-[0_0_0_2px_rgba(18,12,30,0.95)] transition-colors duration-300 group-hover:border-brand-base/80">
                  <img
                    src={user.avatar || "/logo.jpg"}
                    alt="Account avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="max-w-[140px] truncate text-sm font-semibold tracking-[0.01em] text-white/90 transition-colors duration-300 group-hover:text-white">
                  {user.username}
                </span>
                {isAdmin ? (
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                    Admin
                  </span>
                ) : null}
              </button>

              {openMenu ? (
                <div className="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-white/10 bg-[rgba(9,10,16,0.96)] shadow-[0_24px_60px_rgba(0,0,0,0.55)] ring-1 ring-white/5 backdrop-blur-2xl">
                  <div className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full border border-brand-base/50 shadow-[0_0_0_3px_rgba(255,255,255,0.03)]">
                        <img
                          src={user.avatar || "/logo.jpg"}
                          alt="Account avatar"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">
                          {user.username}
                        </p>
                        <p className="text-xs text-brand-muted">
                          {isAdmin ? "Administrator access" : "Member account"}
                        </p>
                      </div>
                      {isAdmin ? (
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                          Admin
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="p-2">
                    <div className="space-y-1">
                      {accountMenuItems.map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={item.onClick}
                          className="navbar-btn vv-button-secondary group flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-white/72 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-base/35"
                        >
                          <span>{item.label}</span>
                          <span className="text-xs text-white/25 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white/55">
                            →
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="my-2 h-px bg-white/8" />

                    <button
                      type="button"
                      onClick={onLogout}
                      className="navbar-btn vv-button-danger flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/30"
                    >
                      <span>Logout</span>
                      <span className="text-xs text-rose-200/55">⟶</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="vv-button-primary px-4 py-2 text-sm font-semibold"
              >
                Login
              </Link>
              <AnimatedButton
                className="navbar-btn"
                onClick={() => navigate("/register")}
              >
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
