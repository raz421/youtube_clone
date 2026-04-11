import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SkeletonCard from "../components/SkeletonCard.jsx";
import VideoCard from "../components/VideoCard.jsx";
import { api, extractResponseData } from "../lib/api.js";
import { useAppStore } from "../store/appStore.js";

gsap.registerPlugin(ScrollTrigger);

function Home() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const gridRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRouletteRunning, setIsRouletteRunning] = useState(false);
  const [roulettePick, setRoulettePick] = useState(null);

  const videos = useAppStore((state) => state.videos);
  const setVideos = useAppStore((state) => state.setVideos);
  const setRecommendations = useAppStore((state) => state.setRecommendations);
  const activeMood = useAppStore((state) => state.activeMood);
  const adaptiveGlow = useAppStore((state) => state.adaptiveGlow);
  const setAdaptiveGlow = useAppStore((state) => state.setAdaptiveGlow);
  const addToast = useAppStore((state) => state.addToast);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const [videosRes, recommendationRes] = await Promise.all([
          api.get("/videos"),
          api.get("/recommendations"),
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

  const filteredVideos = useMemo(() => {
    if (activeMood === "All") {
      return videos;
    }

    return videos.filter(
      (video) =>
        String(video.mood || "").toLowerCase() === activeMood.toLowerCase()
    );
  }, [activeMood, videos]);

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

  return (
    <div className="space-y-10" style={{ "--adaptive-glow": adaptiveGlow }}>
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
            className="mt-4 inline-flex rounded-full border border-brand-base/70 bg-brand-base/22 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-base/35 disabled:cursor-not-allowed disabled:opacity-60 md:mt-0"
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
              <div className="inline-flex rounded-full border border-brand-accent/50 px-4 py-1 text-xs text-brand-accent">
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
          <h2 className="font-display text-2xl text-white">Trending Picks</h2>
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
            : filteredVideos.map((video) => (
                <VideoCard
                  key={video.id || video._id}
                  video={video}
                  onThemeChange={setAdaptiveGlow}
                />
              ))}
        </div>

        {!loading && !filteredVideos.length ? (
          <div className="glass-panel mt-6 p-8 text-center text-brand-muted">
            No videos match this mood yet.
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
