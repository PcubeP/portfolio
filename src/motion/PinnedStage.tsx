import { forwardRef, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * MOTION SYSTEM · PinnedStage
 * ---------------------------
 * The scrollytelling skeleton every flagship shares: a TALL outer wrapper whose
 * scroll distance scrubs a `position: sticky` inner stage pinned to the
 * viewport. It is a *structural* wrapper only — the owning scene creates the
 * ref, calls `useSectionScroll(ref)` itself, and drives its own transforms
 * (keeping every `useTransform` a top-level hook). Pass the same `ref` here and
 * the `reduced` flag from `useSectionScroll`.
 *
 * Gotchas baked in (see plan):
 *  - explicit `height` on the outer wrapper — never the `.chapter` class
 *    (its `content-visibility:auto` fights tall pins).
 *  - `overflow-hidden` lives on the sticky *inner* node, never an ancestor of
 *    it (that would break sticky).
 *  - under reduced motion the pin collapses: the outer height is auto and the
 *    stage is a normal `min-h-screen` block, so content simply flows.
 */
export const PinnedStage = forwardRef<
  HTMLDivElement,
  {
    /** total scroll travel of the pin, e.g. '260vh' */
    distance?: string
    /** reduced-motion flag from useSectionScroll — collapses the pin */
    reduced?: boolean
    /** classes for the tall outer wrapper */
    className?: string
    /** classes for the sticky inner stage */
    stageClassName?: string
    /** inline style for the sticky inner stage (theme vars go here) */
    style?: CSSProperties
    ariaLabel?: string
    children: ReactNode
  }
>(function PinnedStage(
  { distance = '240vh', reduced = false, className, stageClassName, style, ariaLabel, children },
  ref
) {
  return (
    <div
      ref={ref}
      aria-label={ariaLabel}
      style={reduced ? undefined : { height: distance }}
      className={className}
    >
      <div
        style={style}
        className={cn(
          'relative isolate overflow-hidden',
          reduced ? 'min-h-[100svh]' : 'sticky top-0 h-[100svh]',
          stageClassName
        )}
      >
        {children}
      </div>
    </div>
  )
})
