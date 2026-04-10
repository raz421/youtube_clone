import { Link } from "react-router-dom";
import { useAppStore } from "../store/appStore.js";
import { useAuthStore } from "../store/authStore.js";

const moods = ["All", "Focus", "Learn", "Relax"];

function Sidebar() {
  const activeMood = useAppStore((state) => state.activeMood);
  const setActiveMood = useAppStore((state) => state.setActiveMood);
  const user = useAuthStore((state) => state.user);

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
            className={`w-full rounded-2xl border px-4 py-2 text-left text-sm transition ${
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
          <Link
            to="/settings"
            className="block w-full rounded-2xl border border-white/10 bg-brand-surface px-4 py-2 text-sm text-brand-muted transition hover:border-brand-accent/60 hover:text-white"
          >
            Settings
          </Link>
        </div>
      ) : null}
    </aside>
  );
}

export default Sidebar;
