import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useMemo, useRef, useState } from "react";
import SkeletonCard from "../components/SkeletonCard.jsx";
import VideoCard from "../components/VideoCard.jsx";
import { api, extractResponseData } from "../lib/api.js";
import { useAppStore } from "../store/appStore.js";

gsap.registerPlugin(ScrollTrigger);

function Home() {
  const heroRef = useRef(null);
  const gridRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      } catch (requestError) {
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
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">
              Smart Preview
            </p>
            <p className="mt-2 text-sm text-brand-ink">
              Instant hover autoplay with adaptive glow.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">
              AI Summary
            </p>
            <p className="mt-2 text-sm text-brand-ink">
              Quickly grasp each video before diving in.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
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
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-brand-muted"
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
