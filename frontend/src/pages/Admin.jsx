import { useEffect, useState } from "react";
import { api, extractResponseData } from "../lib/api.js";
import { endpoints } from "../lib/endpoints.js";

function StatCard({ label, value, tone = "text-white" }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-brand-surface p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">
        {label}
      </p>
      <p className={`mt-2 font-display text-3xl ${tone}`}>{value}</p>
    </div>
  );
}

function Admin() {
  const [loading, setLoading] = useState(true);
  const [promotingUserId, setPromotingUserId] = useState("");
  const [overview, setOverview] = useState({
    totals: {
      users: 0,
      videos: 0,
      playlists: 0,
      comments: 0,
      likes: 0,
    },
    recentUsers: [],
    recentVideos: [],
  });

  useEffect(() => {
    let mounted = true;

    const fetchOverview = async () => {
      setLoading(true);

      try {
        const response = await api.get(endpoints.admin.overview);
        if (!mounted) {
          return;
        }

        setOverview(
          extractResponseData(response) || {
            totals: {
              users: 0,
              videos: 0,
              playlists: 0,
              comments: 0,
              likes: 0,
            },
            recentUsers: [],
            recentVideos: [],
          }
        );
      } catch (_error) {
        if (mounted) {
          setOverview({
            totals: {
              users: 0,
              videos: 0,
              playlists: 0,
              comments: 0,
              likes: 0,
            },
            recentUsers: [],
            recentVideos: [],
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchOverview();

    return () => {
      mounted = false;
    };
  }, []);

  const handlePromoteUser = async (userId) => {
    if (!userId) {
      return;
    }

    setPromotingUserId(userId);

    try {
      await api.patch(endpoints.admin.promote(userId));
      setOverview((current) => ({
        ...current,
        recentUsers: (current?.recentUsers || []).map((item) =>
          item._id === userId ? { ...item, role: "admin" } : item
        ),
      }));
    } catch (_error) {
      // Keep UI stable and allow manual refresh by navigation.
    } finally {
      setPromotingUserId("");
    }
  };

  return (
    <section className="space-y-6">
      <div className="glass-panel p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-brand-accent">
          Admin Console
        </p>
        <h1 className="mt-3 font-display text-3xl text-white">
          Platform Overview
        </h1>
        <p className="mt-2 text-sm text-brand-muted">
          Monitor users, content, and engagement from one place.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Users" value={overview.totals.users} />
        <StatCard label="Videos" value={overview.totals.videos} />
        <StatCard label="Playlists" value={overview.totals.playlists} />
        <StatCard label="Comments" value={overview.totals.comments} />
        <StatCard label="Likes" value={overview.totals.likes} />
      </div>

      {loading ? (
        <div className="glass-panel p-6 text-sm text-brand-muted">
          Loading admin overview...
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="glass-panel p-6">
          <h2 className="font-display text-xl text-white">Recent Users</h2>
          <div className="mt-4 space-y-3">
            {overview.recentUsers.length ? (
              overview.recentUsers.map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl border border-white/10 bg-brand-surface p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-white">{item.username}</p>
                      <p className="mt-1 text-xs text-brand-muted">
                        {item.fullname} · {item.role || "user"}
                      </p>
                    </div>
                    {item.role !== "admin" ? (
                      <button
                        type="button"
                        onClick={() => handlePromoteUser(item._id)}
                        disabled={promotingUserId === item._id}
                        className="vv-button-primary px-3 py-1 text-[11px] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {promotingUserId === item._id
                          ? "Promoting..."
                          : "Promote"}
                      </button>
                    ) : (
                      <span className="rounded-full border border-brand-accent/35 bg-brand-accent/10 px-3 py-1 text-[11px] text-brand-accent">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-white/20 p-3 text-sm text-brand-muted">
                No recent users available.
              </p>
            )}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="font-display text-xl text-white">Recent Videos</h2>
          <div className="mt-4 space-y-3">
            {overview.recentVideos.length ? (
              overview.recentVideos.map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl border border-white/10 bg-brand-surface p-3"
                >
                  <p className="text-sm text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-brand-muted">
                    {item.views || 0} views ·{" "}
                    {item.isPublished ? "Published" : "Draft"}
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-white/20 p-3 text-sm text-brand-muted">
                No recent videos available.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Admin;
