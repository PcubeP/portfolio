import { useRef } from 'react'
import { motion, useTransform } from 'motion/react'
import type { Sport } from '@/content'
import { themes, themeStyle } from '@/lib/themes'
import { CountUp } from '@/components/shared/CountUp'
import { BubbleField } from '@/components/shared/BubbleField'
import { PinnedStage, useSectionScroll, useAccentOnView, WATER } from '@/motion'

/**
 * SWIMMING — a DIVE, not a section. Scroll pins the stage and scrubs the whole
 * descent: the surface sweeps up overhead, the water floods in, everything goes
 * soft and blue as you sink, then the Swimming content is discovered underwater.
 * Everything is scroll-linked (transform/opacity/filter/clip-path only) so it
 * pauses for free when you stop. Collapses to a calm static underwater scene
 * under reduced motion.
 */
export function SwimmingScene({ sport }: { sport?: Sport }) {
  const ref = useRef<HTMLDivElement>(null)
  const { progress: p, reduced } = useSectionScroll(ref)
  useAccentOnView(ref, '54 224 208')

  // --- scroll → transform mappings ---
  const surfaceY = useTransform(p, [0, 0.35], ['0%', '-130%']) // waterline sweeps up past view
  const aqua = useTransform(p, [0.1, 0.4], [0, 0.72]) // blue floods in
  const blurPx = useTransform(p, [0.2, 0.5], [0, 6])
  const contentFilter = useTransform(blurPx, (b) => `blur(${b}px)`)
  const depthScale = useTransform(p, [0.3, 0.7], [1.08, 1]) // sink punch settles
  const stageY = useTransform(p, [0.15, 0.6], [0, -80]) // descent drift
  const caustic = useTransform(p, [0.2, 0.6], [0, 0.9])
  const vignette = useTransform(p, [0.4, 1], [0, 0.55])

  // content "discovered underwater"
  const contentOpacity = useTransform(p, [0.58, 0.82], [0, 1])
  const contentY = useTransform(p, [0.58, 0.9], [50, 0])
  const contentClip = useTransform(
    p,
    [0.55, 0.9],
    ['circle(0% at 50% 42%)', 'circle(150% at 50% 42%)']
  )

  const content = (
    <div className="relative z-20 mx-auto w-full max-w-4xl px-[clamp(1.25rem,5vw,6rem)]">
      <p className="font-mono text-xs uppercase tracking-widest2 text-accent">
        04 · Arena / <span className="text-fg">Swimming</span> · Lane 04
      </p>
      <h3 className="mt-3 font-display text-[clamp(3rem,13vw,10rem)] font-bold leading-[0.85] tracking-tight text-fg">
        SWIM<span className="italic text-accent">MING</span>
      </h3>
      <p className="mt-4 max-w-lg font-serif text-xl text-fg/90">{sport?.note}</p>

      <div className="mt-8 flex flex-wrap items-stretch gap-4">
        {sport?.figure && (
          <div className="flex items-stretch gap-4 border-l-2 border-accent bg-ink/40 backdrop-blur-sm">
            {sport.figure.media?.src && (
              <div className="w-24 shrink-0 overflow-hidden">
                <img
                  src={sport.figure.media.src}
                  alt={sport.figure.media.alt}
                  loading="lazy"
                  className="h-full w-full object-cover object-center"
                />
              </div>
            )}
            <div className="px-4 py-3">
              <p className="font-mono text-[0.6rem] uppercase tracking-widest2 text-dim">the benchmark</p>
              <p className="font-display text-2xl font-bold text-accent">{sport.figure.name}</p>
              <p className="max-w-xs text-sm text-fg/80">{sport.figure.note}</p>
              {sport.figure.media?.caption && (
                <p className="mt-1 font-mono text-[0.55rem] text-faint">{sport.figure.media.caption}</p>
              )}
            </div>
          </div>
        )}
        {sport?.stats && (
          <dl className="flex flex-wrap gap-3">
            {sport.stats.map((s) => (
              <div key={s.label} className="border border-lane/40 bg-ink/30 px-4 py-3 backdrop-blur-sm">
                <dt className="font-mono text-[0.55rem] uppercase tracking-widest2 text-dim">{s.label}</dt>
                <dd className="font-mono text-sm text-fg"><CountUp value={s.value} /></dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <div aria-hidden="true" className="mt-8 flex items-center gap-1 font-mono text-[0.6rem] text-dim">
        {['0m', '25m', '50m', '75m', '100m'].map((d) => (
          <span key={d} className="flex items-center gap-1">
            <span className="h-3 w-px bg-lane/40" />
            {d}
          </span>
        ))}
      </div>
    </div>
  )

  // ---- Reduced motion: a calm, static underwater scene, no pin ----
  if (reduced) {
    return (
      <PinnedStage
        ref={ref}
        reduced
        ariaLabel="Swimming"
        style={themeStyle(themes.pool)}
        stageClassName="flex items-center bg-ink py-24"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-70"
          style={{ background: 'radial-gradient(ellipse at 50% 30%, rgb(var(--raised)), rgb(var(--ink)) 70%)' }}
        />
        {content}
      </PinnedStage>
    )
  }

  return (
    <PinnedStage
      ref={ref}
      reduced={false}
      distance="260vh"
      ariaLabel="Swimming"
      style={themeStyle(themes.pool)}
      stageClassName="flex items-center bg-ink"
    >
      {/* deep-water base gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, rgb(var(--surface)) 0%, rgb(var(--ink)) 85%)' }}
      />

      {/* aqua flood */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          opacity: aqua,
          background:
            'radial-gradient(ellipse 90% 70% at 50% 20%, rgb(var(--accent)/0.28), transparent 60%), linear-gradient(180deg, rgb(var(--raised)/0.6), rgb(var(--ink)))',
        }}
      />

      {/* caustic light blobs — opacity scrubbed, position gently self-animated */}
      <motion.div aria-hidden="true" className="absolute inset-0" style={{ opacity: caustic }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="pointer-events-none absolute rounded-full blur-3xl"
            style={{
              width: 360,
              height: 360,
              background: 'radial-gradient(circle, rgb(var(--accent)/0.22), transparent 70%)',
              left: `${12 + i * 30}%`,
              top: `${8 + i * 22}%`,
            }}
            animate={{ x: [0, 36, -18, 0], y: [0, -22, 14, 0] }}
            transition={{ duration: 13 + i * 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </motion.div>

      {/* rising bubbles that scatter from the cursor (desktop, on-screen only) */}
      <BubbleField className="pointer-events-none absolute inset-0 z-10 h-full w-full" />

      {/* the surface, seen from below — sweeps up past the viewer as you sink */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-10 h-[42svh]"
        style={{ y: surfaceY }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgb(226 246 252/0.9), rgb(var(--accent)/0.25) 55%, transparent)',
          }}
        />
        <svg className="absolute bottom-0 h-16 w-full" preserveAspectRatio="none" viewBox="0 0 400 40">
          <motion.path
            d="M0 20 Q 50 6 100 20 T 200 20 T 300 20 T 400 20 V40 H0 Z"
            fill="rgb(226 246 252/0.5)"
            animate={{ x: [0, -100, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>
      </motion.div>

      {/* depth vignette */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          opacity: vignette,
          background: 'radial-gradient(ellipse 70% 60% at 50% 45%, transparent 40%, rgb(2 18 30/0.95))',
        }}
      />

      {/* content — through-water blur, sink scale, discovered via a circular reveal */}
      <motion.div
        className="absolute inset-0 flex items-center"
        style={{
          y: stageY,
          scale: depthScale,
          filter: contentFilter,
        }}
        transition={WATER}
      >
        <motion.div
          className="w-full"
          style={{
            opacity: contentOpacity,
            y: contentY,
            clipPath: contentClip,
            WebkitClipPath: contentClip,
          }}
        >
          {content}
        </motion.div>
      </motion.div>
    </PinnedStage>
  )
}
