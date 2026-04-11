function AdvancedLoader({
  title = "Loading VidVortex",
  subtitle = "Syncing your stream universe",
  fullscreen = false,
  compact = false,
  className = "",
}) {
  const shellClassName = [
    "vv-loader",
    fullscreen ? "vv-loader-fullscreen" : "vv-loader-inline",
    compact ? "vv-loader-compact" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={shellClassName} role="status" aria-live="polite">
      <div className="vv-loader-orbit" aria-hidden="true">
        <span className="vv-ring vv-ring-one" />
        <span className="vv-ring vv-ring-two" />
        <span className="vv-ring vv-ring-three" />

        <div className="vv-core-pulse" />
        <div className="vv-wave" />

        <div className="vv-eq">
          <span className="vv-eq-bar" />
          <span className="vv-eq-bar" />
          <span className="vv-eq-bar" />
          <span className="vv-eq-bar" />
          <span className="vv-eq-bar" />
          <span className="vv-eq-bar" />
        </div>
      </div>

      <div className="vv-loader-text">
        <p className="vv-loader-title">{title}</p>
        <p className="vv-loader-subtitle">{subtitle}</p>
      </div>
    </section>
  );
}

export default AdvancedLoader;
