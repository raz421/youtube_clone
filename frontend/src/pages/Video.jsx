import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Player from "../components/Player.jsx";
import VideoCard from "../components/VideoCard.jsx";
import { api, extractResponseData } from "../lib/api.js";
import { useAppStore } from "../store/appStore.js";
import { useAuthStore } from "../store/authStore.js";

const getCommentOwnerName = (comment) => {
  const owner = comment?.owner;

  if (owner?.fullname) {
    return owner.fullname;
  }

  if (owner?.username) {
    return owner.username;
  }

  return "Anonymous";
};

const formatCommentTimestamp = (value) => {
  if (!value) {
    return "Just now";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return date.toLocaleString();
};

function Video() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentDraft, setCommentDraft] = useState("");
  const [error, setError] = useState("");

  const recommendations = useAppStore((state) => state.recommendations);
  const setRecommendations = useAppStore((state) => state.setRecommendations);
  const updateWatchAnalytics = useAppStore(
    (state) => state.updateWatchAnalytics
  );
  const trackWatchHistory = useAppStore((state) => state.trackWatchHistory);
  const toggleWatchLater = useAppStore((state) => state.toggleWatchLater);
  const toggleLikedVideo = useAppStore((state) => state.toggleLikedVideo);
  const toggleDislikedVideo = useAppStore((state) => state.toggleDislikedVideo);
  const toggleLikedComment = useAppStore((state) => state.toggleLikedComment);
  const addDownloadedVideo = useAppStore((state) => state.addDownloadedVideo);
  const removeVideoFromLibrary = useAppStore(
    (state) => state.removeVideoFromLibrary
  );
  const likedVideos = useAppStore((state) => state.likedVideos);
  const watchLater = useAppStore((state) => state.watchLater);
  const dislikedVideos = useAppStore((state) => state.dislikedVideos);
  const likedComments = useAppStore((state) => state.likedComments);
  const setAdaptiveGlow = useAppStore((state) => state.setAdaptiveGlow);
  const addToast = useAppStore((state) => state.addToast);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const [videoRes, recRes] = await Promise.all([
          api.get(`/videos/${id}`),
          api.get("/recommendations"),
        ]);

        if (!mounted) {
          return;
        }

        const videoData = extractResponseData(videoRes);
        setVideo(videoData);
        trackWatchHistory(videoData);
        setRecommendations(extractResponseData(recRes) || []);
        updateWatchAnalytics(
          Math.max(5, Math.round((videoData?.duration || 300) / 60))
        );
      } catch (requestError) {
        if (mounted) {
          setError("Unable to load this video.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [id, setRecommendations, trackWatchHistory, updateWatchAnalytics]);

  const timelineMoments = useMemo(() => video?.watchMoments || [], [video]);
  const currentVideoId = video?.id || video?._id;

  const isLiked = useMemo(
    () => likedVideos.some((item) => (item.id || item._id) === currentVideoId),
    [likedVideos, currentVideoId]
  );

  const isInWatchLater = useMemo(
    () => watchLater.some((item) => (item.id || item._id) === currentVideoId),
    [watchLater, currentVideoId]
  );

  const isDisliked = useMemo(
    () =>
      dislikedVideos.some((item) => (item.id || item._id) === currentVideoId),
    [dislikedVideos, currentVideoId]
  );

  const isOwner = useMemo(() => {
    const ownerId =
      typeof video?.owner === "object" ? video?.owner?._id : video?.owner;

    if (!ownerId || !user?._id) {
      return false;
    }

    return String(ownerId) === String(user._id);
  }, [video, user]);

  useEffect(() => {
    if (!video?.id && !video?._id) {
      return;
    }

    if (!user) {
      return;
    }

    const videoId = video.id || video._id;
    let watchedSeconds = 0;
    const ticker = setInterval(async () => {
      watchedSeconds += 10;

      try {
        await api.post("/analytics/watch", {
          videoId,
          currentSecond: watchedSeconds,
          durationWatched: 10,
          completed: video.duration ? watchedSeconds >= video.duration : false,
        });
      } catch (error) {
        // Silent tracking failures should not interrupt playback UX.
      }
    }, 10000);

    return () => clearInterval(ticker);
  }, [video, user]);

  const handleCommentSubmit = async (event) => {
    event.preventDefault();

    if (!commentDraft.trim()) {
      return;
    }

    if (!user) {
      addToast("error", "Please login to comment");
      navigate("/login", { state: { from: `/video/${id}` } });
      return;
    }

    try {
      const response = await api.post("/comment", {
        videoId: id,
        content: commentDraft,
      });

      const createdComment = extractResponseData(response);
      setVideo((current) => ({
        ...current,
        comments: [
          createdComment || {
            _id: Math.random().toString(36).slice(2),
            content: commentDraft,
            createdAt: new Date().toISOString(),
            owner: {
              _id: user?._id,
              username: user?.username || "",
              fullname: user?.fullname || "",
              avatar: user?.avatar || "",
            },
          },
          ...(current?.comments || []),
        ],
      }));
      setCommentDraft("");
      addToast("success", "Comment posted");
    } catch (requestError) {
      addToast("error", "Sign in required to comment");
    }
  };

  const requireAuthAction = () => {
    if (user) {
      return true;
    }

    addToast("error", "Please sign in first");
    navigate("/login", { state: { from: `/video/${id}` } });
    return false;
  };

  const handleVideoLikeToggle = async () => {
    if (!requireAuthAction() || !currentVideoId) {
      return;
    }

    try {
      await api.get(`/api/v1/like/l/toggleVideoLike/${currentVideoId}`);
    } catch (_error) {
      // Keep local toggle even if network call fails due to inconsistent API availability.
    }

    toggleLikedVideo(video);
    addToast("success", isLiked ? "Removed from liked videos" : "Video liked");
  };

  const handleVideoDislikeToggle = () => {
    if (!requireAuthAction() || !currentVideoId) {
      return;
    }

    toggleDislikedVideo(video);
    addToast("success", isDisliked ? "Removed dislike" : "Video disliked");
  };

  const handleWatchLaterToggle = () => {
    if (!requireAuthAction() || !currentVideoId) {
      return;
    }

    toggleWatchLater(video);
    addToast(
      "success",
      isInWatchLater ? "Removed from watch later" : "Saved to watch later"
    );
  };

  const handleCommentLikeToggle = async (commentId) => {
    if (!requireAuthAction() || !commentId) {
      return;
    }

    try {
      await api.get(`/api/v1/like/l/toggleCommentLike/${commentId}`);
    } catch (_error) {
      // Fallback to local state if API fails.
    }

    toggleLikedComment(commentId);
  };

  const handleDownloadVideo = () => {
    if (!video?.videoFile) {
      addToast("error", "Video file is not available for download");
      return;
    }

    addDownloadedVideo(video);
    addToast("success", "Saved in VidVortex downloads");
  };

  const handleDeleteVideo = async () => {
    if (!requireAuthAction() || !currentVideoId) {
      return;
    }

    if (!isOwner) {
      addToast("error", "Only the owner can delete this video");
      return;
    }

    const confirmed = window.confirm(
      "Delete this video permanently? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/api/v1/video/v/video-delete/${currentVideoId}`);
      removeVideoFromLibrary(currentVideoId);
      addToast("success", "Video deleted successfully");
      navigate("/");
    } catch (_error) {
      addToast("error", "Unable to delete this video");
    }
  };

  if (loading) {
    return <div className="glass-panel h-72 animate-pulse" />;
  }

  if (error || !video) {
    return (
      <div className="glass-panel p-8 text-rose-200">
        {error || "Video not found."}
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
      <section className="space-y-6">
        <Player video={video} />

        <div className="glass-panel p-6">
          <h1 className="font-display text-2xl text-white">{video.title}</h1>
          <p className="mt-2 text-sm text-brand-muted">{video.views} views</p>
          <p className="mt-4 text-brand-muted">{video.description}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleVideoLikeToggle}
              className={`rounded-full border px-4 py-1.5 text-xs transition ${
                isLiked
                  ? "border-brand-base bg-brand-base/25 text-white"
                  : "border-white/15 bg-brand-surface text-brand-muted hover:text-white"
              }`}
            >
              {isLiked ? "Liked" : "Like Video"}
            </button>
            <button
              type="button"
              onClick={handleVideoDislikeToggle}
              className={`rounded-full border px-4 py-1.5 text-xs transition ${
                isDisliked
                  ? "border-rose-400/60 bg-rose-500/20 text-rose-200"
                  : "border-white/15 bg-brand-surface text-brand-muted hover:text-white"
              }`}
            >
              {isDisliked ? "Disliked" : "Dislike Video"}
            </button>
            <button
              type="button"
              onClick={handleWatchLaterToggle}
              className={`rounded-full border px-4 py-1.5 text-xs transition ${
                isInWatchLater
                  ? "border-brand-accent/60 bg-brand-accent/15 text-brand-accent"
                  : "border-white/15 bg-brand-surface text-brand-muted hover:text-white"
              }`}
            >
              {isInWatchLater ? "Saved" : "Watch Later"}
            </button>
            <button
              type="button"
              onClick={handleDownloadVideo}
              className="rounded-full border border-cyan-300/45 bg-cyan-400/15 px-4 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-400/25"
            >
              Download Video
            </button>
            {isOwner ? (
              <button
                type="button"
                onClick={handleDeleteVideo}
                className="rounded-full border border-rose-400/55 bg-rose-500/20 px-4 py-1.5 text-xs text-rose-100 transition hover:bg-rose-500/30"
              >
                Delete Video
              </button>
            ) : null}
          </div>

          <div className="mt-6 rounded-2xl border border-brand-accent/30 bg-brand-accent/10 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-brand-accent">
              AI Summary
            </p>
            <p className="mt-2 text-sm text-brand-ink">{video.aiSummary}</p>
          </div>

          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.22em] text-brand-muted">
              Smart Timeline
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {timelineMoments.map((moment) => (
                <div
                  key={`${moment.time}-${moment.label}`}
                  className="rounded-2xl border border-white/10 bg-brand-surface p-3"
                >
                  <p className="text-sm text-white">{moment.time}</p>
                  <p className="text-xs text-brand-muted">{moment.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="font-display text-xl text-white">Comments</h2>

          <form className="mt-4 flex gap-2" onSubmit={handleCommentSubmit}>
            <input
              type="text"
              value={commentDraft}
              onChange={(event) => setCommentDraft(event.target.value)}
              placeholder="Drop your perspective..."
              className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-2 text-sm text-white outline-none ring-brand-accent focus:ring"
            />
            <button className="rounded-xl bg-brand-base px-4 py-2 text-sm text-white">
              Send
            </button>
          </form>

          <div className="mt-4 space-y-3">
            {(video.comments || []).map((comment) => (
              <div
                key={comment._id}
                className="rounded-xl border border-white/10 bg-brand-surface p-3"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-accent">
                  {getCommentOwnerName(comment)}
                </p>
                <p className="text-sm text-brand-ink">{comment.content}</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs text-brand-muted">
                    {formatCommentTimestamp(comment.createdAt)}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCommentLikeToggle(comment._id)}
                    className={`rounded-full border px-3 py-1 text-[11px] transition ${
                      likedComments.includes(comment._id)
                        ? "border-brand-base/70 bg-brand-base/25 text-white"
                        : "border-white/15 text-brand-muted hover:text-white"
                    }`}
                  >
                    {likedComments.includes(comment._id)
                      ? "Liked"
                      : "Like Comment"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!video.comments?.length ? (
            <div className="mt-4 rounded-xl border border-dashed border-white/20 p-4 text-sm text-brand-muted">
              Be the first to comment on this video.
            </div>
          ) : null}
        </div>
      </section>

      <aside className="space-y-4">
        <h2 className="font-display text-lg text-white">Suggested</h2>
        {recommendations.map((item) => (
          <VideoCard
            key={item.id || item._id}
            video={item}
            onThemeChange={setAdaptiveGlow}
          />
        ))}
      </aside>
    </div>
  );
}

export default Video;
