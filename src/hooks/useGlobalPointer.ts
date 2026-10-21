import { useEffect } from 'react'

/**
 * One global pointer tracker for the whole site. Writes CSS variables on :root
 * so any element can react to the cursor with zero React re-renders:
 *   --mx / --my   raw viewport pixel position (unitless; use calc(var(--mx)*1px))
 *   --pxn / --pyn smoothed, normalised -1..1 from centre (for gentle parallax)
 * The smoothing runs in a single rAF loop.
 */
export function useGlobalPointer(enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const root = document.documentElement
    let tx = 0, ty = 0, cx = 0, cy = 0
    let raf = 0

    const onMove = (e: PointerEvent) => {
      root.style.setProperty('--mx', String(e.clientX))
      root.style.setProperty('--my', String(e.clientY))
      tx = (e.clientX / window.innerWidth) * 2 - 1
      ty = (e.clientY / window.innerHeight) * 2 - 1
    }
    const tick = () => {
      cx += (tx - cx) * 0.06
      cy += (ty - cy) * 0.06
      root.style.setProperty('--pxn', cx.toFixed(4))
      root.style.setProperty('--pyn', cy.toFixed(4))
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [enabled])
}
