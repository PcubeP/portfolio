import { useEffect, useRef } from 'react'

const TRAIL_COUNT = 10
const FINE = '(pointer: fine)'
const REDUCED = '(prefers-reduced-motion: reduce)'

/**
 * VelocityTrail — N trailing dots that follow the cursor.
 * Each dot lags further behind; distance between frames stretches them
 * (scaleX) giving a "speed smear" feel. mix-blend-mode:difference means
 * they invert whatever's beneath — same trick as CustomCursor.
 */
export function VelocityTrail() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!matchMedia(FINE).matches) return
    if (matchMedia(REDUCED).matches) return

    const container = containerRef.current
    if (!container) return

    // Grab the pre-rendered dot divs
    const dots = Array.from(container.children) as HTMLDivElement[]

    // Ring buffer of cursor positions
    const buf = Array.from({ length: TRAIL_COUNT + 4 }, () => ({ x: -200, y: -200 }))
    let bufHead = 0
    let cx = -200, cy = -200  // current cursor
    let raf = 0

    const onMove = (e: PointerEvent) => { cx = e.clientX; cy = e.clientY }
    window.addEventListener('pointermove', onMove, { passive: true })

    const tick = () => {
      // Push current cursor to buffer head
      buf[bufHead] = { x: cx, y: cy }
      bufHead = (bufHead + 1) % buf.length

      dots.forEach((dot, i) => {
        // Each dot reads from further back in the buffer
        const lag = i + 1
        const idx = (bufHead - lag + buf.length) % buf.length
        const prev = (bufHead - lag - 1 + buf.length) % buf.length
        const { x, y } = buf[idx]
        const { x: px, y: py } = buf[prev]

        // Velocity = distance to previous sample
        const dx = x - px
        const dy = y - py
        const vel = Math.sqrt(dx * dx + dy * dy)
        const stretch = 1 + Math.min(vel * 0.06, 2.5)
        const angle = vel > 1 ? Math.atan2(dy, dx) * (180 / Math.PI) : 0
        const opacity = (1 - i / TRAIL_COUNT) * 0.55

        dot.style.transform =
          `translate3d(calc(${x}px - 50%), calc(${y}px - 50%), 0)` +
          ` rotate(${angle}deg) scaleX(${stretch})`
        dot.style.opacity = String(opacity)
      })

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  // Pre-render dots as a fixed container; visibility guarded by CSS
  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[103] hidden [@media_(pointer:fine)]:block"
    >
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => {
        const size = Math.round(7 - i * 0.45)
        return (
          <div
            key={i}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: size,
              height: size,
              borderRadius: '50%',
              background: 'rgb(var(--accent))',
              mixBlendMode: 'difference',
              willChange: 'transform, opacity',
              transition: 'opacity 60ms linear',
              pointerEvents: 'none',
            }}
          />
        )
      })}
    </div>
  )
}
