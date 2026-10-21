/** Thin top progress bar showing how far through the journey the visitor is. */
export function ScrollProgress({ progress }: { progress: number }) {
  return (
    <div
      className="fixed inset-x-0 top-0 z-[100] h-[2px] bg-transparent"
      role="progressbar"
      aria-label="Journey progress"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-accent transition-[width] duration-150 ease-out"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  )
}
