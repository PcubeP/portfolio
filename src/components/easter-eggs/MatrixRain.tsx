import { useEffect, useRef } from 'react'

/**
 * Canvas "digital rain". Mounted only while active, auto-fades. GPU-light:
 * single 2D canvas, capped column count, throttled frame rate.
 *
 * `contained` renders it as an `absolute inset-0` layer that fills its
 * positioned parent (e.g. a CRT bezel) instead of the fixed full-screen
 * overlay, and hides the "exit the construct" button — used by the Pop-Culture
 * CRT's Matrix channel, where the rain is the channel itself, not an easter egg.
 */
export function MatrixRain({
  onDone,
  duration = 6000,
  contained = false,
}: {
  onDone: () => void
  duration?: number
  contained?: boolean
}) {
  const ref = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const box = () => (contained ? canvas.parentElement!.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight })
    let w = (canvas.width = box().width)
    let h = (canvas.height = box().height)
    const font = 16
    let cols = Math.floor(w / font)
    let drops = new Array(cols).fill(0).map(() => Math.random() * -50)
    const chars = 'アイウエオカキクケコ01<>[]{}=+*#$'.split('')

    const onResize = () => {
      w = canvas.width = box().width
      h = canvas.height = box().height
      cols = Math.floor(w / font)
      drops = new Array(cols).fill(0).map(() => Math.random() * -50)
    }
    window.addEventListener('resize', onResize)

    let raf = 0
    let last = 0
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw)
      if (t - last < 45) return
      last = t
      ctx.fillStyle = 'rgba(8,9,12,0.12)'
      ctx.fillRect(0, 0, w, h)
      ctx.font = `${font}px monospace`
      for (let i = 0; i < drops.length; i++) {
        const c = chars[Math.floor(Math.random() * chars.length)]
        const x = i * font
        const y = drops[i] * font
        ctx.fillStyle = Math.random() > 0.92 ? `rgb(${accent})` : 'rgba(120,255,180,0.55)'
        ctx.fillText(c, x, y)
        if (y > h && Math.random() > 0.975) drops[i] = 0
        drops[i]++
      }
    }
    raf = requestAnimationFrame(draw)

    // In contained mode the rain lives for the life of the channel — no timer,
    // but pause the loop while scrolled off-screen (gotcha: canvases must stop).
    const timer = contained ? 0 : window.setTimeout(onDone, duration)
    let io: IntersectionObserver | undefined
    if (contained) {
      io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            if (!raf) { last = 0; raf = requestAnimationFrame(draw) }
          } else if (raf) {
            cancelAnimationFrame(raf)
            raf = 0
          }
        },
        { threshold: 0 }
      )
      io.observe(canvas)
    }
    return () => {
      io?.disconnect()
      cancelAnimationFrame(raf)
      if (timer) clearTimeout(timer)
      window.removeEventListener('resize', onResize)
    }
  }, [onDone, duration, contained])

  if (contained) {
    return (
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <canvas ref={ref} className="h-full w-full" />
      </div>
    )
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[118] animate-[blink_0.001s]" aria-hidden="true">
      <canvas ref={ref} className="h-full w-full" />
      <button
        className="pointer-events-auto fixed bottom-6 left-1/2 -translate-x-1/2 border border-accent bg-ink/80 px-4 py-2 font-mono text-[0.7rem] text-accent"
        onClick={onDone}
      >
        exit the construct
      </button>
    </div>
  )
}
