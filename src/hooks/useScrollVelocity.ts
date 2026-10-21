import { useEffect } from 'react'

/**
 * Tracks scroll speed and writes CSS vars straight to the root — no React
 * re-renders — so the whole stage can react like film stock under time
 * pressure:
 *   --scroll-blur   0..7   (px of blur, spikes on fast scroll, decays at rest)
 *   --scroll-scale  1..1.02  (a subtle punch-in while moving)
 * Disabled entirely under reduced motion.
 */
export function useScrollVelocity(enabled = true) {
  useEffect(() => {
    if (!enabled) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const root = document.documentElement
    let lastY = window.scrollY
    let velocity = 0
    let raf = 0

    const tick = () => {
      const y = window.scrollY
      const delta = Math.abs(y - lastY)
      lastY = y
      // Fast attack, slow decay — a whip-pan that eases back to sharp.
      velocity += (delta - velocity) * 0.35
      velocity *= 0.94
      const blur = Math.min(7, velocity * 0.35)
      const scale = 1 + Math.min(0.02, velocity * 0.001)
      root.style.setProperty('--scroll-blur', blur.toFixed(2))
      root.style.setProperty('--scroll-scale', scale.toFixed(4))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      root.style.setProperty('--scroll-blur', '0')
      root.style.setProperty('--scroll-scale', '1')
    }
  }, [enabled])
}
