import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Player from "../components/Player.jsx";
import VideoCard from "../components/VideoCard.jsx";
import { api, extractResponseData } from "../lib/api.js";
import { useAppStore } from "../store/appStore.js";
import { useAuthStore } from "../store/authStore.js";

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
  }, [id, setRecommendations, updateWatchAnalytics]);

  const timelineMoments = useMemo(() => video?.watchMoments || [], [video]);

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
      await api.post("/comment", {
        videoId: id,
        content: commentDraft,
      });
      setVideo((current) => ({
        ...current,
        comments: [
          {
            _id: Math.random().toString(36).slice(2),
            content: commentDraft,
            createdAt: new Date().toISOString(),
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
                <p className="text-sm text-brand-ink">{comment.content}</p>
                <p className="mt-1 text-xs text-brand-muted">
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
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

