/**
 * WorldLoader — the DOM fallback shown while the ~700 KB three.js chunk and the
 * first world stream in. Deliberately tiny (no 3D), styled to match the intro so
 * the handoff from IntroSequence → world reads as one continuous boot.
 */
export function WorldLoader() {
  return (
    <div
      className="fixed inset-0 z-[2] flex items-center justify-center bg-ink"
      role="status"
      aria-label="Loading the world"
    >
      <div className="flex flex-col items-center gap-4 font-mono text-[0.65rem] uppercase tracking-widest2 text-dim">
        <span className="inline-block h-1.5 w-1.5 animate-blink bg-accent" />
        <span>building the world…</span>
      </div>
    </div>
  )
}
