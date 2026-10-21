import { useEffect, useState } from 'react'
import { chapters } from '@/content'

/**
 * Tracks which chapter is currently centred in the viewport using
 * IntersectionObserver (efficient, no scroll spam). Returns the active id and
 * overall scroll progress 0..1.
 */
export function useActiveChapter() {
  const [activeId, setActiveId] = useState(chapters[0].id)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const sections = chapters
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => !!el)

    const io = new IntersectionObserver(
      (entries) => {
        // Pick the most-visible intersecting section.
        let best: { id: string; ratio: number } | null = null
        for (const e of entries) {
          if (e.isIntersecting && (!best || e.intersectionRatio > best.ratio)) {
            best = { id: e.target.id, ratio: e.intersectionRatio }
          }
        }
        if (best) setActiveId(best.id)
      },
      { threshold: [0.15, 0.3, 0.5, 0.7], rootMargin: '-20% 0px -20% 0px' }
    )
    sections.forEach((s) => io.observe(s))

    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return { activeId, progress }
}
