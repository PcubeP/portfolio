import { useEffect, useRef } from 'react'

/**
 * Scroll → normalized target `t` (0..1), written to a ref every scroll/resize.
 * The camera rig reads `.current` inside its `useFrame` loop and does all the
 * smoothing/inertia there — so scrolling never triggers a React re-render and
 * the two rAF loops (Motion vs r3f) never fight.
 */
export function useScrollProgress() {
  const targetT = useRef(0)
  useEffect(() => {
    let max = 1
    const measure = () => {
      max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    }
    const onScroll = () => {
      targetT.current = Math.min(1, Math.max(0, window.scrollY / max))
    }
    const onResize = () => {
      measure()
      onScroll()
    }
    measure()
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])
  return targetT
}
