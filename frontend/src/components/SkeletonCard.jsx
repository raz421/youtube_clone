function SkeletonCard() {
  return (
    <div className="glass-panel animate-pulse overflow-hidden">
      <div className="aspect-video bg-white/10" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-white/10" />
        <div className="h-3 w-full rounded bg-white/10" />
        <div className="h-3 w-1/3 rounded bg-white/10" />
      </div>
    </div>
  );
}

export default SkeletonCard;
