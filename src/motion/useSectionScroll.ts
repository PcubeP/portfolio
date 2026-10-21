import { type RefObject } from 'react'
import { useScroll, useSpring, type MotionValue } from 'motion/react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { SMOOTH } from './springs'

/** A pair of scroll-offset edge specs, e.g. ['start start', 'end end']. */
export type ScrollOffset = [string, string]

interface Options {
  /** useScroll offset. Default spans a pinned section's full sticky travel. */
  offset?: ScrollOffset
  /** spring-smooth the raw scroll progress (default true) */
  smooth?: boolean
}

/**
 * MOTION SYSTEM · useSectionScroll
 * --------------------------------
 * The core scroll primitive every flagship experience is built on. Wraps
 * `useScroll` for a target element and pipes its 0..1 progress through a spring
 * so fast scrolling produces fluid motion instead of jitter. Returns both the
 * smoothed `progress` and the `raw` value, plus the reduced-motion flag so
 * callers can render a static scene instead of scrubbing.
 *
 * Usage for a pinned stage: give a TALL outer wrapper as `target` (with a
 * `position: sticky` child) and the default offset — progress is 0 when the
 * pin engages and 1 when it releases.
 */
export function useSectionScroll(
  ref: RefObject<HTMLElement | null>,
  { offset = ['start start', 'end end'], smooth = true }: Options = {}
): { progress: MotionValue<number>; raw: MotionValue<number>; reduced: boolean } {
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset as never,
  })
  // Under reduced motion, skip smoothing (zero-duration) so nothing animates on
  // its own; callers branch on `reduced` to render the static fallback.
  const progress = useSpring(scrollYProgress, smooth && !reduced ? SMOOTH : { duration: 0 })
  return { progress, raw: scrollYProgress, reduced }
}
