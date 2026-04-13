import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, extractResponseData } from "../lib/api.js";
import { endpoints } from "../lib/endpoints.js";
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

const formatRelativeTime = (value) => {
  if (!value) {
    return "Just now";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
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
  const [tweetDraft, setTweetDraft] = useState("");
  const [tweetBusy, setTweetBusy] = useState(false);
  const [tweets, setTweets] = useState([]);

  const watchAnalytics = useAppStore((state) => state.watchAnalytics);
  const watchHistory = useAppStore((state) => state.watchHistory);
  const likedVideos = useAppStore((state) => state.likedVideos);
  const watchLater = useAppStore((state) => state.watchLater);
  const removeVideoFromLibrary = useAppStore(
    (state) => state.removeVideoFromLibrary
  );
  const addToast = useAppStore((state) => state.addToast);
  const user = useAuthStore((state) => state.user);

  const completionValue = Math.max(
    0,
    Math.min(
      100,
      analytics.completionRate || watchAnalytics.completionRate || 0
    )
  );
  const profileName = user?.fullname || user?.username || "Creator";
  const activityScore = Math.max(
    15,
    Math.min(
      99,
      Math.round(
        completionValue * 0.5 +
          Math.min(
            (analytics.totalMinutes || watchAnalytics.totalMinutes || 0) / 4,
            30
          ) +
          Math.min(
            (analytics.totalSessions || watchAnalytics.streakDays || 0) * 2,
            25
          )
      )
    )
  );

  const recentTweets = useMemo(() => tweets.slice(0, 8), [tweets]);
  const spotlightVideo = uploadedVideos[0] || null;
  const galleryVideos = uploadedVideos.slice(0, 8);
  const completionSweep = Math.max(4, completionValue);
  const topStats = [
    {
      label: "Watch Time",
      value: `${analytics.totalMinutes || watchAnalytics.totalMinutes}m`,
    },
    {
      label: "Sessions",
      value: analytics.totalSessions || watchAnalytics.streakDays,
    },
    {
      label: "Completion",
      value: `${completionValue}%`,
    },
    {
      label: "Explored",
      value: analytics.watchedVideoCount,
    },
  ];

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
          api.get(endpoints.video.allMine(user._id)),
          api.get(endpoints.public.analyticsMe),
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

  useEffect(() => {
    let mounted = true;

    const fetchTweets = async () => {
      if (!user?._id) {
        if (mounted) {
          setTweets([]);
        }
        return;
      }

      try {
        const response = await api.get(endpoints.tweet.all);
        const tweetData = extractResponseData(response) || [];
        if (mounted) {
          setTweets(
            tweetData
              .filter((tweet) => String(tweet.owner) === String(user._id))
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
          );
        }
      } catch (_error) {
        if (mounted) {
          setTweets([]);
        }
      }
    };

    fetchTweets();

    return () => {
      mounted = false;
    };
  }, [user?._id]);

  const handleTweetCreate = async (event) => {
    event.preventDefault();

    if (!tweetDraft.trim()) {
      addToast("error", "Tweet content is required");
      return;
    }

    setTweetBusy(true);
    try {
      const response = await api.post(endpoints.tweet.create, {
        content: tweetDraft.trim(),
      });
      const createdTweet = extractResponseData(response);
      setTweets((current) => [createdTweet, ...(current || [])]);
      setTweetDraft("");
      addToast("success", "Tweet posted");
    } catch (_error) {
      addToast("error", "Unable to post tweet right now");
    } finally {
      setTweetBusy(false);
    }
  };

  const handleTweetDelete = async (tweetId) => {
    if (!tweetId) {
      return;
    }

    try {
      await api.delete(endpoints.tweet.delete(tweetId));
      setTweets((current) => current.filter((tweet) => tweet._id !== tweetId));
      addToast("success", "Tweet deleted");
    } catch (_error) {
      addToast("error", "Unable to delete tweet right now");
    }
  };

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
      await api.delete(endpoints.video.delete(videoId));
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
    <section className="space-y-8" style={{ "--adaptive-glow": "#9D4EDD" }}>
      <section className="glass-panel-strong relative overflow-hidden p-8 shadow-[0_0_70px_var(--adaptive-glow)]">
        <div className="ambient-drift absolute right-0 top-0 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="ambient-drift absolute -left-8 bottom-0 h-40 w-40 rounded-full bg-brand-base/20 blur-3xl" />

        <p className="text-sm uppercase tracking-[0.35em] text-brand-accent">
          Creator Console
        </p>

        <div className="mt-4 flex items-center gap-4">
          <img
            src={user?.avatar || "/logo.jpg"}
            alt="Profile avatar"
            className="h-16 w-16 rounded-2xl border border-white/20 object-cover"
          />
          <div>
            <h1 className="font-display text-3xl text-white md:text-5xl">
              {profileName}
            </h1>
            <p className="mt-1 text-sm text-brand-muted">
              @{user?.username || "creator"} · {user?.role || "user"}
            </p>
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-brand-muted">
          This is your control center: performance signal, content velocity, and
          audience pulse in one focused space.
        </p>

        <div className="mt-6 rounded-2xl border border-brand-base/35 bg-gradient-to-r from-brand-base/14 via-brand-base/7 to-transparent p-4 md:flex md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-brand-accent">
              Status
            </p>
            <h3 className="mt-1 font-display text-xl text-white">
              Activity Score
            </h3>
            <p className="mt-1 text-sm text-brand-muted">
              Momentum is {completionValue >= 65 ? "strong" : "warming up"}.
              Keep posting and engaging.
            </p>
          </div>

          <div className="mt-4 inline-flex rounded-full border border-purple-400/70 bg-purple-700 px-6 py-2.5 text-sm font-semibold text-white md:mt-0">
            Score {activityScore}
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-brand-surface p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">
              Uploaded
            </p>
            <p className="mt-2 font-display text-2xl text-white">
              {uploadedVideos.length}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-brand-surface p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">
              Audience Notes
            </p>
            <p className="mt-2 font-display text-2xl text-white">
              {tweets.length}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-brand-surface p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">
              Completion Sweep
            </p>
            <p className="mt-2 font-display text-2xl text-white">
              {completionValue}%
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {topStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-brand-surface p-3"
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted">
                {stat.label}
              </p>
              <p className="mt-1 font-display text-xl text-white">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        <div className="glass-panel p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl text-white">
                Creator Vault
              </h2>
              <p className="mt-1 text-sm text-brand-muted">
                Your content gallery with quick control actions.
              </p>
            </div>
            <span className="rounded-full border border-white/15 bg-brand-surface px-3 py-1 text-xs text-brand-muted">
              {uploadedVideos.length} assets
            </span>
          </div>

          {spotlightVideo ? (
            <div className="group relative overflow-hidden rounded-2xl border border-white/15 bg-black/30">
              <img
                src={resolveMediaUrl(spotlightVideo.thumbnail)}
                alt={`${spotlightVideo.title} spotlight`}
                className="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">
                  Spotlight
                </p>
                <p className="mt-1 line-clamp-1 font-display text-2xl text-white">
                  {spotlightVideo.title}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Link
                    to={`/video/${spotlightVideo.id || spotlightVideo._id}`}
                    className="vv-button-secondary rounded-full px-4 py-1.5 text-xs"
                  >
                    Open Spotlight
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDeleteVideo(spotlightVideo)}
                    disabled={
                      deletingVideoId ===
                      (spotlightVideo.id || spotlightVideo._id)
                    }
                    className="vv-button-danger rounded-full px-4 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingVideoId ===
                    (spotlightVideo.id || spotlightVideo._id)
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {loading ? (
            <div className="mt-4 h-24 animate-pulse rounded-2xl bg-white/10" />
          ) : null}

          {!loading && !galleryVideos.length ? (
            <div className="mt-4 rounded-2xl border border-dashed border-white/20 p-4 text-sm text-brand-muted">
              You have not uploaded videos yet.
            </div>
          ) : null}

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {galleryVideos.map((video) => (
              <div
                key={video.id || video._id}
                className="rounded-2xl border border-white/10 bg-brand-surface/80 p-3 transition hover:border-brand-base/45"
              >
                <p className="line-clamp-1 text-sm font-semibold text-white">
                  {video.title}
                </p>
                <p className="mt-1 text-xs text-brand-muted">
                  {video.views || 0} views
                </p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <Link
                    to={`/video/${video.id || video._id}`}
                    className="vv-button-secondary rounded-full px-3 py-1 text-xs"
                  >
                    Open
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDeleteVideo(video)}
                    disabled={deletingVideoId === (video.id || video._id)}
                    className="vv-button-danger rounded-full px-3 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingVideoId === (video.id || video._id)
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6">
            <h3 className="font-display text-xl text-white">
              Playback Shelves
            </h3>
            <p className="mt-1 text-sm text-brand-muted">
              Jump back into your queues.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">
                  History · {watchHistory.length}
                </p>
                <div className="mt-2 space-y-2">
                  {watchHistory.slice(0, 3).map((video) => (
                    <Link
                      key={`history-${video.id || video._id}`}
                      to={`/video/${video.id || video._id}`}
                      className="block rounded-xl border border-white/10 bg-brand-surface px-3 py-2 text-sm text-white transition hover:border-brand-base/50"
                    >
                      {video.title}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">
                  Liked · {likedVideos.length}
                </p>
                <div className="mt-2 space-y-2">
                  {likedVideos.slice(0, 3).map((video) => (
                    <Link
                      key={`liked-${video.id || video._id}`}
                      to={`/video/${video.id || video._id}`}
                      className="block rounded-xl border border-white/10 bg-brand-surface px-3 py-2 text-sm text-white transition hover:border-brand-base/50"
                    >
                      {video.title}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">
                  Watch Later · {watchLater.length}
                </p>
                <div className="mt-2 space-y-2">
                  {watchLater.slice(0, 3).map((video) => (
                    <Link
                      key={`later-${video.id || video._id}`}
                      to={`/video/${video.id || video._id}`}
                      className="block rounded-xl border border-white/10 bg-brand-surface px-3 py-2 text-sm text-white transition hover:border-brand-base/50"
                    >
                      {video.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6">
            <h3 className="font-display text-xl text-white">Quick Broadcast</h3>
            <p className="mt-1 text-sm text-brand-muted">
              Drop short notes for your audience.
            </p>
            <form className="mt-4 space-y-3" onSubmit={handleTweetCreate}>
              <input
                type="text"
                value={tweetDraft}
                onChange={(event) => setTweetDraft(event.target.value)}
                placeholder="Share a creator update..."
                className="vv-input"
              />
              <button
                type="submit"
                disabled={tweetBusy}
                className="vv-button-primary w-full px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {tweetBusy ? "Posting..." : "Post"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="glass-panel-strong p-6 md:p-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl text-white">
            Audience Timeline
          </h2>
          <span className="rounded-full border border-white/15 bg-brand-surface px-3 py-1 text-xs text-brand-muted">
            {tweets.length} notes
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {recentTweets.length ? (
            recentTweets.map((tweet) => (
              <div
                key={tweet._id}
                className="rounded-2xl border border-white/10 bg-brand-surface p-4"
              >
                <p className="text-sm text-white">{tweet.content}</p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-brand-muted">
                    {formatRelativeTime(tweet.createdAt)}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleTweetDelete(tweet._id)}
                    className="vv-button-danger rounded-full px-3 py-1 text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-white/20 p-4 text-sm text-brand-muted md:col-span-2 xl:col-span-3">
              No updates yet. Post your first creator note.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default Profile;
