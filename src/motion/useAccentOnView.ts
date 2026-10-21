import { useEffect, type RefObject } from 'react'
import { useExperience } from '@/context/ExperienceContext'

/**
 * MOTION SYSTEM · useAccentOnView
 * -------------------------------
 * Shifts the global chrome accent (`--accent`) to `rgb` when `ref` crosses the
 * viewport centre. Needed because a single chapter id (Arena, Pop Culture) now
 * contains several themed sub-worlds, and the accent should still travel with
 * them. Center-thresholded so it doesn't thrash against App's per-chapter
 * effect on fast scroll. Not gated by reduced motion — it's a colour swap, not
 * animation.
 */
export function useAccentOnView(ref: RefObject<HTMLElement | null>, rgb: string) {
  const { setAccent } = useExperience()
  useEffect(() => {
    const el = ref.current
    if (!el || !rgb) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setAccent(rgb)
        }
      },
      // fire when the element occupies the middle band of the viewport
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rgb, setAccent])
}
