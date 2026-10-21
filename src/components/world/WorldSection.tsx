import type { ReactNode } from 'react'

/**
 * WorldSection — the DOM counterpart to a 3D world. Three jobs:
 *  1. its height contributes the scroll distance that maps to this world's slice
 *     of the flight (heights are proportional to each world's spline t-range, so
 *     scroll position ↔ camera position stays linear);
 *  2. it is the semantic landmark (<section aria-labelledby>) for a11y/SEO and
 *     the nav's scroll target (id = chapter id);
 *  3. it carries the readable long-form copy — visually `.world-copy` (sr-only)
 *     in the full motion experience, revealed as prose under prefers-reduced-motion.
 */
export function WorldSection({
  id,
  index,
  label,
  heightVh,
  children,
}: {
  id: string
  index: string
  label: string
  heightVh: number
  children?: ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-h`}
      className="world-section"
      style={{ minHeight: `${heightVh}vh` }}
    >
      <div className="world-copy">
        <p className="eyebrow">{index} · {label}</p>
        <h2 id={`${id}-h`} className="font-display text-3xl font-semibold text-fg">
          {label}
        </h2>
        {children}
      </div>
    </section>
  )
}
