import { useEffect, useState } from "react";
import { api, extractResponseData } from "../lib/api.js";
import { useAppStore } from "../store/appStore.js";

function Profile() {
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalMinutes: 0,
    completionRate: 0,
    totalSessions: 0,
    watchedVideoCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const watchAnalytics = useAppStore((state) => state.watchAnalytics);

  useEffect(() => {
    let mounted = true;

    const fetchMyFeed = async () => {
      try {
        const [videoResponse, analyticsResponse] = await Promise.all([
          api.get("/videos"),
          api.get("/analytics/me"),
        ]);
        if (mounted) {
          setUploadedVideos(extractResponseData(videoResponse) || []);
          setAnalytics(
            extractResponseData(analyticsResponse) || {
              totalMinutes: 0,
              completionRate: 0,
              totalSessions: 0,
              watchedVideoCount: 0,
            }
          );
        }
      } catch (error) {
        if (mounted) {
          setUploadedVideos([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchMyFeed();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="space-y-6">
      <div className="glass-panel p-6">
        <h1 className="font-display text-3xl text-white">Creator Profile</h1>
        <p className="mt-2 text-brand-muted">
          Track your watch habits and creator momentum.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">
              Watch Time
            </p>
            <p className="mt-2 font-display text-2xl text-white">
              {analytics.totalMinutes || watchAnalytics.totalMinutes} min
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">
              Watch Sessions
            </p>
            <p className="mt-2 font-display text-2xl text-white">
              {analytics.totalSessions || watchAnalytics.streakDays}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">
              Completion
            </p>
            <p className="mt-2 font-display text-2xl text-white">
              {analytics.completionRate || watchAnalytics.completionRate}%
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm text-brand-muted">
          Videos explored: {analytics.watchedVideoCount}
        </p>
      </div>

      <div className="glass-panel p-6">
        <h2 className="font-display text-xl text-white">
          Your Uploaded Videos
        </h2>

        {loading ? (
          <div className="mt-4 h-24 animate-pulse rounded-xl bg-white/10" />
        ) : null}

        {!loading && uploadedVideos.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-white/20 p-4 text-sm text-brand-muted">
            You have not uploaded videos yet.
          </div>
        ) : null}

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {uploadedVideos.slice(0, 8).map((video) => (
            <div
              key={video.id || video._id}
              className="rounded-2xl border border-white/10 bg-white/5 p-3"
            >
              <p className="line-clamp-1 text-sm text-white">{video.title}</p>
              <p className="mt-1 text-xs text-brand-muted">
                {video.views} views
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Profile;
