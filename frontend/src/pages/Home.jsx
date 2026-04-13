import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SkeletonCard from "../components/SkeletonCard.jsx";
import VideoCard from "../components/VideoCard.jsx";
import { api, extractResponseData } from "../lib/api.js";
import { endpoints } from "../lib/endpoints.js";
import { useAppStore } from "../store/appStore.js";
import { useAuthStore } from "../store/authStore.js";

gsap.registerPlugin(ScrollTrigger);

function Home() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const gridRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [isRouletteRunning, setIsRouletteRunning] = useState(false);
  const [roulettePick, setRoulettePick] = useState(null);

  const videos = useAppStore((state) => state.videos);
  const setVideos = useAppStore((state) => state.setVideos);
  const setRecommendations = useAppStore((state) => state.setRecommendations);
  const activeMood = useAppStore((state) => state.activeMood);
  const activeLibraryView = useAppStore((state) => state.activeLibraryView);
  const watchHistory = useAppStore((state) => state.watchHistory);
  const watchLater = useAppStore((state) => state.watchLater);
  const downloadedVideos = useAppStore((state) => state.downloadedVideos);
  const removeDownloadedVideo = useAppStore(
    (state) => state.removeDownloadedVideo
  );
  const removeVideoFromLibrary = useAppStore(
    (state) => state.removeVideoFromLibrary
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
        const [videosRes, recommendationRes] = await Promise.all([
          api.get(endpoints.public.videos),
          api.get(endpoints.public.recommendations),
        ]);

        if (!mounted) {
          return;
        }

        setVideos(extractResponseData(videosRes) || []);
        setRecommendations(extractResponseData(recommendationRes) || []);
      } catch {
        if (!mounted) {
          return;
        }

        setError("Unable to load videos right now.");
        addToast("error", "Video feed unavailable");
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
  }, [setVideos, setRecommendations, addToast]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      return;
    }

    let mounted = true;
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await api.get(endpoints.public.search, {
          params: { q: searchTerm.trim() },
        });

        if (mounted) {
          setVideos(extractResponseData(response) || []);
          setError("");
        }
      } catch {
        if (mounted) {
          setError("Search is unavailable right now.");
        }
      } finally {
        if (mounted) {
          setSearchLoading(false);
        }
      }
    }, 420);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [searchTerm, setVideos]);

  useEffect(() => {
    if (!heroRef.current) {
      return;
    }

    const heroTitle = heroRef.current.querySelectorAll(".hero-reveal");
    gsap.fromTo(
      heroTitle,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.12, duration: 0.7, ease: "power3.out" }
    );

    if (gridRef.current) {
      gsap.fromTo(
        gridRef.current.children,
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.45,
          ease: "power2.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 82%",
          },
        }
      );
    }
  }, [videos]);

  const sourceVideos = useMemo(() => {
    if (activeLibraryView === "history") {
      return watchHistory;
    }

    if (activeLibraryView === "watchLater") {
      return watchLater;
    }

    if (activeLibraryView === "downloads") {
      return downloadedVideos;
    }

    return videos;
  }, [activeLibraryView, downloadedVideos, videos, watchHistory, watchLater]);

  const filteredVideos = useMemo(() => {
    if (activeMood === "All") {
      return sourceVideos;
    }

    return sourceVideos.filter(
      (video) =>
        String(video.mood || "").toLowerCase() === activeMood.toLowerCase()
    );
  }, [activeMood, sourceVideos]);

  const sectionTitle = useMemo(() => {
    if (activeLibraryView === "history") {
      return "Watch History";
    }

    if (activeLibraryView === "watchLater") {
      return "Watch Later";
    }

    if (activeLibraryView === "downloads") {
      return "Downloaded Videos";
    }

    return "Trending Picks";
  }, [activeLibraryView]);

  const featured = filteredVideos[0];

  const runVibeRoulette = () => {
    const pool = filteredVideos.length ? filteredVideos : videos;

    if (!pool.length) {
      addToast("error", "No videos available for roulette right now");
      return;
    }

    const pick = pool[Math.floor(Math.random() * pool.length)];
    const pickId = pick.id || pick._id;

    if (!pickId) {
      addToast("error", "Unable to open roulette pick");
      return;
    }

    setIsRouletteRunning(true);
    setRoulettePick(pick);

    setTimeout(() => {
      setIsRouletteRunning(false);
      addToast("success", `Roulette Pick: ${pick.title}`);
      navigate(`/video/${pickId}`);
    }, 550);
  };

  const handleRemoveDownloaded = (videoId) => {
    removeDownloadedVideo(videoId);
    addToast("success", "Removed from downloads");
  };

  const handlePermanentDelete = async (video) => {
    const videoId = video?.id || video?._id;
    if (!videoId) {
      return;
    }

    const ownerId =
      typeof video?.owner === "object" ? video?.owner?._id : video?.owner;

    if (!user?._id || String(ownerId) !== String(user._id)) {
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
      await api.delete(`/api/v1/video/v/video-delete/${videoId}`);
      removeVideoFromLibrary(videoId);
      addToast("success", "Video deleted permanently");
    } catch {
      addToast("error", "Unable to delete video right now");
    }
  };

  return (
    <div className="space-y-10" style={{ "--adaptive-glow": "#9D4EDD" }}>
      <section
        ref={heroRef}
        className="glass-panel-strong relative overflow-hidden p-8 shadow-[0_0_70px_var(--adaptive-glow)]"
      >
        <div className="ambient-drift absolute right-0 top-0 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="ambient-drift absolute -left-8 bottom-0 h-40 w-40 rounded-full bg-brand-base/20 blur-3xl" />
        <p className="hero-reveal text-sm uppercase tracking-[0.35em] text-brand-accent">
          Trending Now
        </p>
        <h1 className="hero-reveal mt-3 font-display text-3xl text-white md:text-5xl">
          The Streaming Platform For Every Mood
        </h1>
        <p className="hero-reveal mt-4 max-w-2xl text-brand-muted">
          VidVortex blends cinematic playback, adaptive glow UI, and mood-first
          discovery to make every session feel intentional.
        </p>

        <div className="hero-reveal mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search videos by title or description"
            className="vv-input rounded-2xl"
          />
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="vv-button-primary rounded-2xl px-4 py-3 text-sm font-medium"
          >
            Clear Search
          </button>
        </div>
        {searchLoading ? (
          <p className="hero-reveal mt-2 text-xs uppercase tracking-[0.2em] text-brand-muted">
            Searching your library...
          </p>
        ) : null}

        <div className="hero-reveal mt-6 rounded-2xl border border-brand-base/35 bg-gradient-to-r from-brand-base/14 via-brand-base/7 to-transparent p-4 md:flex md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-brand-accent">
              Standout Mode
            </p>
            <h3 className="mt-1 font-display text-xl text-white">
              Vibe Roulette
            </h3>
            <p className="mt-1 text-sm text-brand-muted">
              Skip endless scrolling. Get one instant, mood-matched surprise
              pick.
            </p>
            {roulettePick ? (
              <p className="mt-2 text-xs text-brand-ink">
                Last pick: {roulettePick.title}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={runVibeRoulette}
            disabled={isRouletteRunning || loading}
            className="vv-button-primary mt-4 inline-flex px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 md:mt-0"
          >
            {isRouletteRunning ? "Spinning..." : "Launch Roulette"}
          </button>
        </div>

        {featured ? (
          <div className="hero-reveal mt-8 grid gap-6 md:grid-cols-[1.2fr_1fr]">
            <img
              src={featured.thumbnail}
              alt={featured.title}
              className="h-56 w-full rounded-2xl object-cover"
            />
            <div className="space-y-3">
              <h2 className="font-display text-2xl text-white">
                {featured.title}
              </h2>
              <p className="line-clamp-4 text-sm text-brand-muted">
                {featured.description}
              </p>
              <div className="inline-flex rounded-full border border-purple-400/70 bg-purple-700 px-4 py-1 text-xs text-white">
                {featured.mood} Mode
              </div>
            </div>
          </div>
        ) : null}

        <div className="hero-reveal mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-brand-surface p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">
              Smart Preview
            </p>
            <p className="mt-2 text-sm text-brand-ink">
              Instant hover autoplay with adaptive glow.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-brand-surface p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">
              AI Summary
            </p>
            <p className="mt-2 text-sm text-brand-ink">
              Quickly grasp each video before diving in.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-brand-surface p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">
              Mood Discovery
            </p>
            <p className="mt-2 text-sm text-brand-ink">
              Focus, Learn, and Relax rails tuned to your vibe.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl text-white">{sectionTitle}</h2>
          <span className="text-sm text-brand-muted">
            {filteredVideos.length} videos
          </span>
        </div>

        {error ? (
          <div className="glass-panel p-8 text-sm text-rose-200">{error}</div>
        ) : null}

        <div ref={gridRef} className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))
            : filteredVideos.map((video) => {
                const videoId = video.id || video._id;
                const ownerId =
                  typeof video.owner === "object"
                    ? video.owner?._id
                    : video.owner;
                const canDeletePermanently =
                  activeLibraryView === "all" &&
                  user?._id &&
                  ownerId &&
                  String(ownerId) === String(user._id);

                return (
                  <div key={videoId} className="space-y-2">
                    <VideoCard video={video} onThemeChange={setAdaptiveGlow} />

                    {activeLibraryView === "downloads" ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveDownloaded(videoId)}
                        className="vv-button-secondary w-full px-3 py-2 text-xs"
                      >
                        Remove From Downloads
                      </button>
                    ) : null}

                    {canDeletePermanently ? (
                      <button
                        type="button"
                        onClick={() => handlePermanentDelete(video)}
                        className="vv-button-danger w-full px-3 py-2 text-xs"
                      >
                        Delete Video Permanently
                      </button>
                    ) : null}
                  </div>
                );
              })}
        </div>

        {!loading && !filteredVideos.length ? (
          <div className="glass-panel mt-6 p-8 text-center text-brand-muted">
            {activeLibraryView === "all"
              ? "No videos match this mood yet."
              : "No videos in this section yet."}
          </div>
        ) : null}
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl text-white">Mood Rows</h2>
        <div className="mb-4 flex flex-wrap gap-2">
          {["Focus", "Learn", "Relax", "Deep Work", "Late Night"].map(
            (chip) => (
              <span
                key={chip}
                className="rounded-full border border-white/15 bg-brand-surface px-3 py-1 text-xs text-brand-muted"
              >
                {chip}
              </span>
            )
          )}
        </div>
        <div className="soft-scroll flex gap-5 overflow-x-auto pb-2">
          {videos.map((video) => (
            <div
              key={`mood-${video.id || video._id}`}
              className="min-w-[280px] max-w-[280px]"
            >
              <VideoCard video={video} onThemeChange={setAdaptiveGlow} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
