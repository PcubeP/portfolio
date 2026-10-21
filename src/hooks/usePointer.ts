import { useEffect, useRef } from 'react'

/**
 * Smoothed pointer position as a ref (no re-renders). Values are normalised
 * -1..1 from centre. Use inside rAF loops or CSS var writers.
 */
export function usePointer() {
  const pos = useRef({ x: 0, y: 0, tx: 0, ty: 0 })
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pos.current.tx = (e.clientX / window.innerWidth) * 2 - 1
      pos.current.ty = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    let raf = 0
    const tick = () => {
      pos.current.x += (pos.current.tx - pos.current.x) * 0.08
      pos.current.y += (pos.current.ty - pos.current.y) * 0.08
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])
  return pos
}
