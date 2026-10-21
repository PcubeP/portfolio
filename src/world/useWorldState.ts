import { useEffect, useState } from 'react'
import { worldIdAt, WORLDS } from '@/world/spline'

export interface WorldState {
  /** normalized scroll progress along the whole flight, 0..1 */
  t: number
  /** id of the world currently containing the camera */
  activeId: string
}

/**
 * Reactive scroll state for the DOM chrome (nav, progress bar, HUD). Throttled
 * to one update per animation frame and only re-renders when `t` moves enough
 * or the active world changes. This is the DOM-side counterpart to
 * `useScrollProgress` (which feeds the WebGL frame loop without re-rendering).
 */
export function useWorldState(): WorldState {
  const [state, setState] = useState<WorldState>(() => ({ t: 0, activeId: WORLDS[0].id }))

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const t = Math.min(1, Math.max(0, window.scrollY / max))
      const activeId = worldIdAt(t)
      setState((prev) =>
        Math.abs(prev.t - t) < 0.001 && prev.activeId === activeId ? prev : { t, activeId }
      )
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return state
}
