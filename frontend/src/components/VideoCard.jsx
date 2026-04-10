import gsap from "gsap";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { extractAccentFromImage } from "../utils/extractAccent.js";

function VideoCard({ video, onThemeChange }) {
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const handleEnter = async () => {
    setHovered(true);
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        y: -8,
        scale: 1.02,
        duration: 0.24,
        ease: "power2.out",
      });
    }

    if (video.thumbnail && onThemeChange) {
      const color = await extractAccentFromImage(video.thumbnail);
      onThemeChange(color);
    }
  };

  const handleLeave = () => {
    setHovered(false);
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        y: 0,
        scale: 1,
        duration: 0.24,
        ease: "power2.out",
      });
    }
  };

  return (
    <Link
      to={`/video/${video.id || video._id}`}
      ref={cardRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="glass-panel block overflow-hidden border-white/20 transition-colors hover:border-brand-accent/50"
    >
      <div className="relative aspect-video bg-black">
        {hovered ? (
          <video
            src={video.videoFile}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
            poster={video.thumbnail}
          />
        ) : (
          <img
            src={video.thumbnail}
            alt={video.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300"
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
      </div>

      <div className="space-y-2 p-4">
        <h3 className="line-clamp-1 font-display text-base text-white">
          {video.title}
        </h3>
        <p className="line-clamp-2 text-sm text-brand-muted">
          {video.description}
        </p>
        <div className="flex items-center justify-between text-xs text-brand-muted">
          <span>{video.mood || "Focus"}</span>
          <span>{video.views || 0} views</span>
        </div>
      </div>
    </Link>
  );
}

export default VideoCard;
