import { useEffect, useRef } from 'react'

/**
 * BubbleField — a shoal of bubbles drifting upward through the water, wobbling
 * as they rise and scattering away from the cursor. Canvas 2D only (no WebGL),
 * count scales with area and is capped. Renders nothing on coarse pointers or
 * under reduced motion, and — unlike the original ParticleField — pauses its
 * rAF loop entirely while scrolled off-screen (IntersectionObserver).
 */
export function BubbleField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduced) return

    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0, h = 0
    const mouse = { x: -9999, y: -9999 }

    type B = { x: number; y: number; r: number; vy: number; drift: number; phase: number }
    let bubbles: B[] = []

    const spawn = (atBottom = false): B => ({
      x: Math.random() * w,
      y: atBottom ? h + Math.random() * 40 : Math.random() * h,
      r: 1.5 + Math.random() * 5,
      vy: 0.25 + Math.random() * 0.7,
      drift: (Math.random() - 0.5) * 0.4,
      phase: Math.random() * Math.PI * 2,
    })

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(70, Math.floor((w * h) / 22000))
      bubbles = Array.from({ length: count }, () => spawn())
    }
    resize()
    window.addEventListener('resize', resize)

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
    }
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999 }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)

    let raf = 0
    let last = 0
    let accent = '54,224,208'
    let accentTick = 0

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame)
      if (t - last < 33) return // ~30fps
      last = t
      if (accentTick++ % 30 === 0) {
        const v = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
        if (v) accent = v.replace(/\s+/g, ',')
      }
      ctx.clearRect(0, 0, w, h)

      for (const b of bubbles) {
        b.phase += 0.03
        b.y -= b.vy
        b.x += b.drift + Math.sin(b.phase) * 0.4
        // scatter from cursor
        const dx = b.x - mouse.x
        const dy = b.y - mouse.y
        const d2 = dx * dx + dy * dy
        if (d2 < 14000) {
          const f = (14000 - d2) / 14000
          const d = Math.sqrt(d2) || 1
          b.x += (dx / d) * f * 2.4
          b.y += (dy / d) * f * 2.4
        }
        // respawn from the bottom once risen past the top
        if (b.y + b.r < -4) Object.assign(b, spawn(true))

        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${accent},0.5)`
        ctx.lineWidth = 1
        ctx.stroke()
        // highlight
        ctx.beginPath()
        ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, Math.max(0.5, b.r * 0.28), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${accent},0.35)`
        ctx.fill()
      }
    }

    // Only run while on-screen.
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!raf) { last = 0; raf = requestAnimationFrame(frame) }
        } else if (raf) {
          cancelAnimationFrame(raf)
          raf = 0
        }
      },
      { threshold: 0 }
    )
    io.observe(canvas)

    return () => {
      io.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
