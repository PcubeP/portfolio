import { useEffect, useRef } from 'react'

/**
 * Interactive constellation. Drifting nodes connect to nearby neighbours and to
 * the cursor, and gently repel from it — the background literally reacts to the
 * mouse. Canvas 2D only (no WebGL), particle count scales with area and is
 * capped for performance. Renders nothing on coarse pointers / reduced motion.
 */
export function ParticleField({ className }: { className?: string }) {
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

    type P = { x: number; y: number; vx: number; vy: number }
    let parts: P[] = []

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.scale(dpr, dpr)
      const count = Math.min(90, Math.floor((w * h) / 14000))
      parts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
      }))
    }
    resize()
    window.addEventListener('resize', resize)

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
    }
    const onLeave = () => {
      mouse.x = -9999
      mouse.y = -9999
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)

    let raf = 0
    let last = 0
    let accent = '255,91,46'
    let accentTick = 0

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame)
      if (t - last < 33) return // ~30fps
      last = t
      if (accentTick++ % 20 === 0) {
        const v = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
        if (v) accent = v.replace(/\s+/g, ',')
      }
      ctx.clearRect(0, 0, w, h)

      for (const p of parts) {
        // drift
        p.x += p.vx
        p.y += p.vy
        // repel from cursor
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const d2 = dx * dx + dy * dy
        if (d2 < 16000) {
          const f = (16000 - d2) / 16000
          const d = Math.sqrt(d2) || 1
          p.x += (dx / d) * f * 2.2
          p.y += (dy / d) * f * 2.2
        }
        // wrap
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0
      }

      // links
      for (let i = 0; i < parts.length; i++) {
        const a = parts[i]
        for (let j = i + 1; j < parts.length; j++) {
          const b = parts[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 < 13000) {
            ctx.strokeStyle = `rgba(${accent},${(1 - d2 / 13000) * 0.18})`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
        // link to cursor
        const mdx = a.x - mouse.x
        const mdy = a.y - mouse.y
        const md2 = mdx * mdx + mdy * mdy
        if (md2 < 24000) {
          ctx.strokeStyle = `rgba(${accent},${(1 - md2 / 24000) * 0.5})`
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.stroke()
        }
        ctx.fillStyle = `rgba(${accent},0.7)`
        ctx.fillRect(a.x - 1, a.y - 1, 2, 2)
      }
    }
    raf = requestAnimationFrame(frame)

    // Only run while on-screen — cancel the rAF loop when scrolled away.
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
      cancelAnimationFrame(raf)
    }
  }, [])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
