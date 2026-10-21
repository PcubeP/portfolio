import { useRef } from 'react'
import { motion, useTransform } from 'motion/react'
import type { Sport } from '@/content'
import { themes, themeStyle } from '@/lib/themes'
import { CountUp } from '@/components/shared/CountUp'
import { PinnedStage, useSectionScroll, useAccentOnView, EASE_OUT } from '@/motion'

/**
 * TENNIS — Roland-Garros clay. The court *constructs itself* as you scroll
 * (SVG `pathLength` scrubbed by progress), the net rises, and the content is
 * served in at the end. The bouncing ball is not rendered here — it is the
 * shared, persistent MorphBall (see arena/MorphBall.tsx) that arrives from the
 * pool as a bubble, becomes a tennis ball across this scene, and rolls out as a
 * football. This scene owns the court + floor the ball bounces on. Reduced
 * motion → a fully-drawn static court with a parked ball, no pin.
 */
export function TennisScene({ sport }: { sport?: Sport }) {
  const ref = useRef<HTMLDivElement>(null)
  const { progress: p, reduced } = useSectionScroll(ref)
  useAccentOnView(ref, '245 197 66')

  // court lines draw on as the ball travels in; net rises; content serves in
  const outer = useTransform(p, [0.05, 0.3], [0, 1])
  const service = useTransform(p, [0.2, 0.45], [0, 1])
  const centre = useTransform(p, [0.35, 0.55], [0, 1])
  const netRise = useTransform(p, [0.4, 0.6], [0, 1])
  const netScaleY = useTransform(netRise, [0, 1], [0, 1])
  const clayOpacity = useTransform(p, [0, 0.25], [0.3, 0.7])

  const contentOpacity = useTransform(p, [0.66, 0.9], [0, 1])
  const contentY = useTransform(p, [0.66, 0.95], [48, 0])

  const content = (
    <div className="relative z-20 max-w-3xl">
      <p className="font-mono text-xs uppercase tracking-widest2 text-accent">
        04 · Arena / <span className="text-fg">Tennis</span> · Terre Battue
      </p>
      <h3 className="mt-3 font-display text-[clamp(3rem,13vw,10rem)] font-bold leading-[0.85] tracking-tight text-fg">
        TEN<span className="text-ball">NIS</span>
      </h3>
      <p className="mt-4 max-w-lg font-serif text-xl text-fg/90">{sport?.note}</p>

      <div aria-hidden="true" className="mt-6 flex gap-2 font-mono text-lg text-fg">
        {['6-4', '4-6', '6-3', '7-5'].map((s) => (
          <span key={s} className="border border-line px-3 py-1">{s}</span>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-stretch gap-4">
        {sport?.figure && (
          <div className="flex items-stretch gap-0 border-l-2 border-ball bg-ink/30">
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
              <p className="font-mono text-[0.6rem] uppercase tracking-widest2 text-dim">the standard</p>
              <p className="font-display text-2xl font-bold text-fg">{sport.figure.name}</p>
              <p className="max-w-xs text-sm text-fg/85">{sport.figure.note}</p>
              {sport.figure.media?.caption && (
                <p className="mt-1 font-mono text-[0.55rem] text-faint">{sport.figure.media.caption}</p>
              )}
            </div>
          </div>
        )}
        {sport?.stats && (
          <dl className="flex flex-wrap gap-3">
            {sport.stats.map((s) => (
              <div key={s.label} className="border border-line/60 bg-ink/20 px-4 py-3">
                <dt className="font-mono text-[0.55rem] uppercase tracking-widest2 text-dim">{s.label}</dt>
                <dd className="font-mono text-sm text-fg"><CountUp value={s.value} /></dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  )

  const clay = (
    <>
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          opacity: reduced ? 0.7 : clayOpacity,
          background:
            'radial-gradient(circle at 30% 20%, rgb(var(--raised)), transparent 60%), radial-gradient(circle at 80% 90%, rgb(var(--ink)), transparent 55%), rgb(var(--surface))',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.06] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </>
  )

  // Top-down half court occupying the right of the stage; its baseline sits low
  // in the viewport so the viewport-fixed MorphBall bounces along it.
  const court = (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid meet"
      className="absolute right-0 top-1/2 hidden h-[80%] -translate-y-1/2 opacity-90 md:block"
    >
      <g fill="none" stroke="rgb(var(--line))" strokeWidth="2">
        <motion.rect x="60" y="20" width="280" height="260" pathLength={1} style={{ pathLength: reduced ? 1 : outer }} />
        <motion.rect x="100" y="20" width="200" height="260" pathLength={1} style={{ pathLength: reduced ? 1 : service }} />
        <motion.line x1="100" y1="90" x2="300" y2="90" pathLength={1} style={{ pathLength: reduced ? 1 : service }} />
        <motion.line x1="100" y1="210" x2="300" y2="210" pathLength={1} style={{ pathLength: reduced ? 1 : service }} />
        <motion.line x1="200" y1="90" x2="200" y2="210" pathLength={1} style={{ pathLength: reduced ? 1 : centre }} />
      </g>
      {/* net rises from the centre line */}
      <motion.line
        x1="60"
        y1="150"
        x2="340"
        y2="150"
        stroke="rgb(var(--fg))"
        strokeWidth="3"
        style={{ scaleY: reduced ? 1 : netScaleY, transformOrigin: '200px 150px' }}
      />
      {/* parked ball only for the static (reduced-motion) fallback */}
      {reduced && <circle cx="200" cy="70" r="6" fill="rgb(var(--ball))" />}
    </svg>
  )

  if (reduced) {
    return (
      <PinnedStage
        ref={ref}
        reduced
        ariaLabel="Tennis"
        style={themeStyle(themes.clay)}
        stageClassName="flex items-center bg-ink px-[clamp(1.25rem,5vw,6rem)] py-24"
      >
        {clay}
        {court}
        {content}
      </PinnedStage>
    )
  }

  return (
    <PinnedStage
      ref={ref}
      reduced={false}
      distance="240vh"
      ariaLabel="Tennis"
      style={themeStyle(themes.clay)}
      stageClassName="flex items-center bg-ink px-[clamp(1.25rem,5vw,6rem)]"
    >
      {clay}
      {court}
      <motion.div style={{ opacity: contentOpacity, y: contentY }} transition={{ ease: EASE_OUT }}>
        {content}
      </motion.div>
    </PinnedStage>
  )
}
