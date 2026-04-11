import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/appStore.js";
import { useAuthStore } from "../store/authStore.js";

const moods = ["All", "Focus", "Learn", "Relax"];

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeMood = useAppStore((state) => state.activeMood);
  const setActiveMood = useAppStore((state) => state.setActiveMood);
  const activeLibraryView = useAppStore((state) => state.activeLibraryView);
  const setActiveLibraryView = useAppStore(
    (state) => state.setActiveLibraryView
  );
  const watchHistoryCount = useAppStore((state) => state.watchHistory.length);
  const watchLaterCount = useAppStore((state) => state.watchLater.length);
  const downloadedCount = useAppStore((state) => state.downloadedVideos.length);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  const libraryItems = [
    { key: "all", label: "All Videos" },
    { key: "history", label: "History", count: watchHistoryCount },
    { key: "watchLater", label: "Watch Later", count: watchLaterCount },
    { key: "downloads", label: "Downloads", count: downloadedCount },
  ];

  const handleLibrarySectionOpen = (section) => {
    setActiveMood("All");
    setActiveLibraryView(section);
    navigate("/");
  };

  return (
    <aside className="glass-panel-strong hidden h-fit p-5 lg:block">
      <h2 className="font-display text-lg text-white">Mood Channels</h2>
      <p className="mt-1 text-sm text-brand-muted">
        Choose your vibe instead of generic tags.
      </p>

      <div className="mt-6 space-y-3">
        {moods.map((mood) => (
          <button
            key={mood}
            type="button"
            onClick={() => setActiveMood(mood)}
            className={`sidebar-btn w-full rounded-2xl border px-4 py-2 text-left text-sm transition ${
              activeMood === mood
                ? "border-brand-base bg-brand-base/20 text-white shadow-glow"
                : "border-white/10 bg-brand-surface text-brand-muted hover:text-white"
            }`}
          >
            {mood}
          </button>
        ))}
      </div>

      {user ? (
        <div className="mt-7 border-t border-white/10 pt-4">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-brand-muted">
            Account
          </p>
          <div className="mb-3 space-y-2">
            {libraryItems.map((item) => {
              const isLibraryActive =
                location.pathname === "/" && activeLibraryView === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleLibrarySectionOpen(item.key)}
                  className={`sidebar-btn flex w-full items-center justify-between rounded-2xl border px-4 py-2 text-sm transition ${
                    isLibraryActive
                      ? "border-brand-base bg-brand-base/20 text-white shadow-glow"
                      : "border-white/10 bg-brand-surface text-brand-muted hover:text-white"
                  }`}
                >
                  <span>{item.label}</span>
                  {typeof item.count === "number" ? (
                    <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px]">
                      {item.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          <NavLink
            to="/settings"
            className={({ isActive, isPending }) =>
              `block w-full rounded-2xl border px-4 py-2 text-sm transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-base/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0a12] ${
                isActive || isPending
                  ? "border-brand-base bg-brand-base/20 text-white shadow-glow"
                  : "border-white/10 bg-brand-surface text-brand-muted hover:border-brand-base/70 hover:bg-brand-base/12 hover:text-white focus-visible:border-brand-base/70"
              }`
            }
          >
            Settings
          </NavLink>
          {isAdmin ? (
            <NavLink
              to="/admin"
              className={({ isActive, isPending }) =>
                `mt-2 block w-full rounded-2xl border px-4 py-2 text-sm transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-base/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0a12] ${
                  isActive || isPending
                    ? "border-brand-base bg-brand-base/20 text-white shadow-glow"
                    : "border-white/10 bg-brand-surface text-brand-muted hover:border-brand-base/70 hover:bg-brand-base/12 hover:text-white focus-visible:border-brand-base/70"
                }`
              }
            >
              Admin Dashboard
            </NavLink>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}

export default Sidebar;
