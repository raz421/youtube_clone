function Player({ video }) {
  if (!video?.videoFile) {
    return (
      <div className="glass-panel flex h-[360px] items-center justify-center text-brand-muted">
        No playable video found.
      </div>
    );
  }

  return (
    <div className="glass-panel overflow-hidden">
      <video
        src={video.videoFile}
        controls
        className="h-[260px] w-full bg-black object-cover md:h-[480px]"
        poster={video.thumbnail}
      />
    </div>
  );
}

export default Player;
