import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useTransform } from 'motion/react'
import { PinnedStage, useSectionScroll, CRT } from '@/motion'
import { useExperience } from '@/context/ExperienceContext'
import { MatrixChannel } from './MatrixChannel'
import { ReelChannel } from './ReelChannel'
import { MusicChannel } from './MusicChannel'
import { cn } from '@/lib/cn'

interface Channel {
  id: string
  label: string
  accent: string
  render: () => JSX.Element
}

const CHANNELS: Channel[] = [
  { id: '01', label: 'THE MATRIX', accent: '0 255 65', render: () => <MatrixChannel /> },
  { id: '02', label: 'THE LION KING', accent: '245 197 66', render: () => <ReelChannel /> },
  { id: '03', label: 'LINKIN PARK', accent: '255 91 46', render: () => <MusicChannel tone="loud" /> },
  { id: '04', label: 'LO-FI', accent: '54 224 208', render: () => <MusicChannel tone="calm" /> },
]

/**
 * POP CULTURE — a CRT you tune. Scroll collapses the room down into the tube
 * and powers it on (all scrubbed by `cp`); once lit, it's a real television:
 * four channels, switched by the 01–04 buttons, ↑/↓ to surf, or number keys.
 * Every switch does a CRT roll + static burst. Music channels keep the global
 * audio gate — nothing ever autoplays. Reduced motion → the four channels as a
 * plain static stack, no pin, no power-on.
 */
export function PopCultureChapter() {
  const ref = useRef<HTMLDivElement>(null)
  const { progress: cp, reduced } = useSectionScroll(ref)
  const { setAccent } = useExperience()

  const [active, setActive] = useState(0)
  const [switching, setSwitching] = useState(false)
  const [inView, setInView] = useState(false)

  const change = (next: number) => {
    const i = (next + CHANNELS.length) % CHANNELS.length
    if (i === active) return
    setSwitching(true)
    setActive(i)
    setAccent(CHANNELS[i].accent)
    window.setTimeout(() => setSwitching(false), 360)
  }

  // Accent for the first channel on entry.
  useEffect(() => {
    if (inView) setAccent(CHANNELS[active].accent)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])

  // Keyboard tuning — only while the CRT is on screen.
  useEffect(() => {
    if (!inView) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); change(active + 1) }
      else if (e.key === 'ArrowUp') { e.preventDefault(); change(active - 1) }
      else if (/^[1-4]$/.test(e.key)) { e.preventDefault(); change(Number(e.key) - 1) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, active])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // --- power-on choreography (scrubbed) ---
  const bezelScale = useTransform(cp, [0, 0.5], [1.14, 1])
  const panelsX = useTransform(cp, [0, 0.5], [1, 0]) // side blinds retract
  const coverOpacity = useTransform(cp, [0.42, 0.6], [1, 0]) // black tube fades to reveal
  const flashScaleY = useTransform(cp, [0.5, 0.55, 0.62], [0, 1, 0]) // power-on line
  const screenOpacity = useTransform(cp, [0.6, 0.74], [0, 1])
  const scanOpacity = useTransform(cp, [0, 0.5], [0.15, 0.6])

  const tuner = (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {CHANNELS.map((c, i) => (
        <button
          key={c.id}
          onClick={() => change(i)}
          aria-pressed={i === active}
          className={cn(
            'border px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-widest transition-colors',
            i === active
              ? 'border-accent bg-accent/15 text-accent'
              : 'border-line/50 text-dim hover:border-line hover:text-fg'
          )}
        >
          {c.id} · {c.label}
        </button>
      ))}
      <span className="ml-2 font-mono text-[0.55rem] text-faint">↑/↓ or 1–4 to tune</span>
    </div>
  )

  // ---------- Reduced motion: plain static stack ----------
  if (reduced) {
    return (
      <section id="popculture" aria-label="Pop Culture" className="bg-ink px-[clamp(1.25rem,5vw,6rem)] py-24">
        <p className="font-mono text-xs uppercase tracking-widest2 text-accent">06 · Pop Culture</p>
        <h2 className="mt-3 font-display text-giant font-bold leading-[0.9]">On the tube.</h2>
        <div className="mt-8 flex flex-col gap-8">
          {CHANNELS.map((c) => (
            <div key={c.id} className="crt-screen relative h-[70svh] overflow-hidden border border-line">
              {c.render()}
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section id="popculture" aria-label="Pop Culture">
      <PinnedStage
        ref={ref}
        reduced={false}
        distance="220vh"
        ariaLabel="Pop Culture"
        stageClassName="flex items-center justify-center bg-black px-[clamp(1rem,4vw,4rem)]"
      >
      {/* retracting side blinds */}
      <motion.div className="absolute inset-y-0 left-0 z-30 w-1/2 origin-left bg-black" style={{ scaleX: panelsX }} />
      <motion.div className="absolute inset-y-0 right-0 z-30 w-1/2 origin-right bg-black" style={{ scaleX: panelsX }} />

      {/* the set */}
      <motion.div
        className="crt-screen relative aspect-[4/3] w-full max-w-5xl overflow-hidden"
        style={{ scale: bezelScale }}
      >
        {/* live screen */}
        <motion.div className="absolute inset-0" style={{ opacity: screenOpacity }}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={active}
              className="absolute inset-0"
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={CRT}
            >
              {CHANNELS[active].render()}
            </motion.div>
          </AnimatePresence>

          {/* static burst on switch */}
          {switching && (
            <div
              className="pointer-events-none absolute inset-0 z-20 mix-blend-screen opacity-70"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")",
              }}
            />
          )}
        </motion.div>

        {/* scanlines + curvature vignette */}
        <motion.div className="crt-scanlines pointer-events-none absolute inset-0 z-30" style={{ opacity: scanOpacity }} />
        <div className="crt-vignette pointer-events-none absolute inset-0 z-30" />

        {/* black tube cover fading to reveal the picture */}
        <motion.div className="pointer-events-none absolute inset-0 z-40 bg-black" style={{ opacity: coverOpacity }} />
        {/* power-on flash line */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-1/2 z-50 h-[3px] -translate-y-1/2 bg-white"
          style={{ scaleY: flashScaleY, boxShadow: '0 0 40px 8px rgb(255 255 255/0.9)' }}
        />
      </motion.div>

        <div className="absolute bottom-[max(1rem,4vh)] left-1/2 z-40 -translate-x-1/2">
          <motion.div style={{ opacity: screenOpacity }}>{tuner}</motion.div>
        </div>
      </PinnedStage>
    </section>
  )
}
