import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, extractResponseData } from "../lib/api.js";
import { useAppStore } from "../store/appStore.js";
import { useAuthStore } from "../store/authStore.js";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const resolveMediaUrl = (value) => {
  if (!value || typeof value !== "string") {
    return "";
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const normalized = value.replace(/\\/g, "/");

  if (normalized.startsWith("/")) {
    return `${API_BASE_URL}${normalized}`;
  }

  if (
    normalized.startsWith("temp/") ||
    normalized.startsWith("public/temp/") ||
    normalized.includes("/public/temp/")
  ) {
    const fileName = normalized.split("/").pop();
    return `${API_BASE_URL}/temp/${encodeURIComponent(fileName || "")}`;
  }

  return normalized;
};

function Profile() {
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalMinutes: 0,
    completionRate: 0,
    totalSessions: 0,
    watchedVideoCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [deletingVideoId, setDeletingVideoId] = useState("");

  const watchAnalytics = useAppStore((state) => state.watchAnalytics);
  const watchHistory = useAppStore((state) => state.watchHistory);
  const likedVideos = useAppStore((state) => state.likedVideos);
  const watchLater = useAppStore((state) => state.watchLater);
  const removeVideoFromLibrary = useAppStore(
    (state) => state.removeVideoFromLibrary
  );
  const addToast = useAppStore((state) => state.addToast);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    let mounted = true;

    const fetchMyFeed = async () => {
      if (!user?._id) {
        if (mounted) {
          setUploadedVideos([]);
          setLoading(false);
        }
        return;
      }

      if (mounted) {
        setLoading(true);
      }

      try {
        const [videoResponse, analyticsResponse] = await Promise.all([
          api.get(`/api/v1/video/v/allvideos?userId=${user._id}`),
          api.get("/analytics/me"),
        ]);
        if (mounted) {
          const uploadedData = extractResponseData(videoResponse);
          setUploadedVideos(uploadedData?.docs || uploadedData || []);
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
  }, [user?._id]);

  const handleDeleteVideo = async (video) => {
    const videoId = video?.id || video?._id;
    if (!videoId || !user?._id) {
      return;
    }

    const ownerId =
      typeof video?.owner === "object" ? video?.owner?._id : video?.owner;

    if (String(ownerId) !== String(user._id)) {
      addToast("error", "Only the owner can delete this video");
      return;
    }

    const confirmed = window.confirm(
      "Delete this video permanently? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setDeletingVideoId(videoId);

    try {
      await api.delete(`/api/v1/video/v/video-delete/${videoId}`);
      removeVideoFromLibrary(videoId);
      setUploadedVideos((current) =>
        current.filter((item) => (item.id || item._id) !== videoId)
      );
      addToast("success", "Video deleted successfully");
    } catch (_error) {
      addToast("error", "Unable to delete this video");
    } finally {
      setDeletingVideoId("");
    }
  };

  return (
    <section className="space-y-6">
      <div className="glass-panel p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl text-white">
            {user?.role === "admin" ? "Admin Profile" : "Creator Profile"}
          </h1>
          <span className="rounded-full border border-white/15 bg-brand-surface px-3 py-1 text-xs uppercase tracking-[0.18em] text-brand-muted">
            {user?.role || "user"}
          </span>
        </div>
        <p className="mt-2 text-brand-muted">
          {user?.role === "admin"
            ? "Manage your admin-facing account overview and platform activity."
            : "Track your watch habits and creator momentum."}
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-brand-surface p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">
              Watch Time
            </p>
            <p className="mt-2 font-display text-2xl text-white">
              {analytics.totalMinutes || watchAnalytics.totalMinutes} min
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-brand-surface p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">
              Watch Sessions
            </p>
            <p className="mt-2 font-display text-2xl text-white">
              {analytics.totalSessions || watchAnalytics.streakDays}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-brand-surface p-4">
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
              className="group overflow-hidden rounded-2xl border border-white/10 bg-brand-surface/80 transition-all hover:border-brand-base/40 hover:shadow-[0_16px_34px_rgba(0,0,0,0.32)]"
            >
              <div className="relative h-36 overflow-hidden border-b border-white/10 bg-black/30">
                {video.thumbnail ? (
                  <img
                    src={resolveMediaUrl(video.thumbnail)}
                    alt={`${video.title} thumbnail`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-base/25 via-brand-surface to-black/40 text-xs uppercase tracking-[0.2em] text-brand-muted">
                    No Thumbnail
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              </div>

              <div className="space-y-2 p-4">
                <p className="line-clamp-1 text-sm font-semibold text-white">
                  {video.title}
                </p>
                <p className="text-xs text-brand-muted">
                  {video.views || 0} views
                </p>
                <p className="line-clamp-1 text-xs text-brand-muted">
                  Uploaded by{" "}
                  {video.ownerDetails?.fullname ||
                    video.ownerDetails?.username ||
                    user?.fullname ||
                    user?.username ||
                    "You"}
                </p>

                <div className="pt-1 flex items-center justify-between gap-2">
                  <Link
                    to={`/video/${video.id || video._id}`}
                    className="rounded-full border border-violet-400/70 px-3 py-1 text-xs font-medium text-violet-200 transition hover:border-violet-300 hover:bg-violet-500/15"
                  >
                    Open Video
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDeleteVideo(video)}
                    disabled={deletingVideoId === (video.id || video._id)}
                    className="rounded-full border border-rose-400/60 bg-rose-500/20 px-3 py-1 text-xs text-rose-100 transition hover:bg-rose-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingVideoId === (video.id || video._id)
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="glass-panel p-6">
          <h2 className="font-display text-xl text-white">Watch History</h2>
          <p className="mt-2 text-sm text-brand-muted">
            Recently watched videos.
          </p>
          <div className="mt-4 space-y-3">
            {watchHistory.length ? (
              watchHistory.slice(0, 6).map((video) => (
                <Link
                  key={`history-${video.id || video._id}`}
                  to={`/video/${video.id || video._id}`}
                  className="block rounded-xl border border-white/10 bg-brand-surface p-3 transition hover:border-brand-base/50"
                >
                  <p className="line-clamp-1 text-sm text-white">
                    {video.title}
                  </p>
                  <p className="mt-1 text-xs text-brand-muted">
                    {video.mood || "Focus"}
                  </p>
                </Link>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-white/20 p-3 text-sm text-brand-muted">
                No watch history yet.
              </p>
            )}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="font-display text-xl text-white">Liked Videos</h2>
          <p className="mt-2 text-sm text-brand-muted">
            Videos you liked while signed in.
          </p>
          <div className="mt-4 space-y-3">
            {likedVideos.length ? (
              likedVideos.slice(0, 6).map((video) => (
                <Link
                  key={`liked-${video.id || video._id}`}
                  to={`/video/${video.id || video._id}`}
                  className="block rounded-xl border border-white/10 bg-brand-surface p-3 transition hover:border-brand-base/50"
                >
                  <p className="line-clamp-1 text-sm text-white">
                    {video.title}
                  </p>
                  <p className="mt-1 text-xs text-brand-muted">
                    {video.views || 0} views
                  </p>
                </Link>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-white/20 p-3 text-sm text-brand-muted">
                No liked videos yet.
              </p>
            )}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="font-display text-xl text-white">Watch Later</h2>
          <p className="mt-2 text-sm text-brand-muted">
            Queue videos for your next session.
          </p>
          <div className="mt-4 space-y-3">
            {watchLater.length ? (
              watchLater.slice(0, 6).map((video) => (
                <Link
                  key={`later-${video.id || video._id}`}
                  to={`/video/${video.id || video._id}`}
                  className="block rounded-xl border border-white/10 bg-brand-surface p-3 transition hover:border-brand-base/50"
                >
                  <p className="line-clamp-1 text-sm text-white">
                    {video.title}
                  </p>
                  <p className="mt-1 text-xs text-brand-muted">
                    {video.mood || "Focus"}
                  </p>
                </Link>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-white/20 p-3 text-sm text-brand-muted">
                No watch later videos.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Profile;
