import { useAppStore } from "../store/appStore.js";

const moods = ["All", "Focus", "Learn", "Relax"];

function Sidebar() {
  const activeMood = useAppStore((state) => state.activeMood);
  const setActiveMood = useAppStore((state) => state.setActiveMood);

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
                ? "border-brand-accent bg-brand-accent/20 text-white shadow-cyan"
                : "border-white/10 bg-white/5 text-brand-muted hover:text-white"
            }`}
          >
            {mood}
          </button>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;
