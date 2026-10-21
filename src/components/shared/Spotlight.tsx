/**
 * Site-wide cursor glow. A single fixed layer that follows --mx/--my and tints
 * with the current chapter accent. Pure CSS var driven — no JS per frame.
 * Sits above content but pointer-events none and low opacity so text stays
 * readable; adds the sense that the whole site reacts to the cursor.
 */
export function Spotlight() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[104] hidden md:block"
      style={{
        mixBlendMode: 'screen',
        background:
          'radial-gradient(520px circle at calc(var(--mx, -400) * 1px) calc(var(--my, -400) * 1px), rgb(var(--accent) / 0.10), transparent 45%)',
      }}
    />
  )
}
