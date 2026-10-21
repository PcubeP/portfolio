import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { Chapter } from '@/components/shared/Chapter'
import { GlitchText } from '@/components/shared/GlitchText'
import { profile } from '@/content'
import { useExperience } from '@/context/ExperienceContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { EGGS } from '@/components/easter-eggs/registry'
import { ParticleField } from '@/components/shared/ParticleField'
import { Magnetic } from '@/components/shared/Magnetic'

/** Opening identity scene — the 60-second surface layer of the whole site. */
export function IdentityChapter() {
  const reduced = useReducedMotion()
  const { discover } = useExperience()
  const ref = useRef<HTMLElement | null>(null)
  const [frag, setFrag] = useState(0)
  const [glyphClicks, setGlyphClicks] = useState(0)

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -120])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  // rotate the fragment word
  useEffect(() => {
    if (reduced) return
    const t = setInterval(() => setFrag((f) => (f + 1) % profile.fragments.length), 1800)
    return () => clearInterval(t)
  }, [reduced])

  const onGlyph = () => {
    const next = glyphClicks + 1
    setGlyphClicks(next)
    if (next === 5) {
      const def = EGGS.find((e) => e.id === 'glyph')
      if (def) discover(def.id, def.label)
    }
  }

  return (
    <Chapter id="identity" label="Identity" ref={ref} className="relative overflow-hidden">
      {/* Mouse-reactive ambient glow — tracks smoothed pointer CSS vars, zero JS */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: [
            'radial-gradient(ellipse 70% 50% at calc(50% + var(--pxn,0) * 22%) calc(50% + var(--pyn,0) * 16%), rgb(var(--accent)/0.10) 0%, transparent 65%)',
            'radial-gradient(ellipse 40% 30% at 80% 20%, rgb(var(--accent)/0.06) 0%, transparent 50%)',
          ].join(', '),
        } as React.CSSProperties}
      />
      {/* interactive constellation — reacts to and repels from the cursor */}
      <ParticleField className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-90" />

      {/* ambient technical grid, drifts with the pointer */}
      <div
        aria-hidden="true"
        className="parallax pointer-events-none absolute inset-0 z-0 opacity-[0.3]"
        style={{
          ['--par' as string]: '18px',
          backgroundImage:
            'linear-gradient(rgb(var(--line)/0.5) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--line)/0.5) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(circle at 50% 40%, black, transparent 78%)',
        } as React.CSSProperties}
      />

      <motion.div style={{ y, opacity }} className="wrap relative z-10">
        <div className="flex items-center gap-4">
          <span className="eyebrow">01 / Identity</span>
          <span className="h-px flex-1 bg-line" />
          <Magnetic strength={0.5}>
            <button
              onClick={onGlyph}
              aria-label="System glyph"
              data-cursor-label="?"
              className="group grid h-9 w-9 place-items-center border border-line transition-colors hover:border-accent"
            >
              <svg viewBox="0 0 32 32" className="h-4 w-4">
                <path d="M8 22 L8 10 L16 16 L24 10 L24 22" fill="none" stroke="rgb(var(--accent))" strokeWidth="2.5" strokeLinecap="square" />
              </svg>
            </button>
          </Magnetic>
        </div>

        <p className="mt-8 font-mono text-sm text-dim">
          <span className="text-accent">›</span> {profile.role}
        </p>

        <h1
          className="parallax mt-2 font-display text-colossal font-bold leading-[0.82] tracking-tight"
          style={{ ['--par' as string]: '-10px' } as React.CSSProperties}
        >
          <GlitchText text={profile.name} />
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-display text-xl md:text-2xl">
          <span className="text-dim">I am a</span>
          <span className="relative inline-grid min-w-[9ch]">
            {profile.fragments.map((f, i) => (
              <motion.span
                key={f}
                className="col-start-1 row-start-1 font-semibold text-accent"
                animate={{ opacity: i === frag ? 1 : 0, y: i === frag ? 0 : 6 }}
                transition={{ duration: 0.4 }}
                aria-hidden={i !== frag}
              >
                {f}
              </motion.span>
            ))}
          </span>
        </div>

        <p className="mt-8 max-w-xl font-serif text-lg leading-relaxed text-fg/90">
          {profile.statement}
        </p>

        {/* surface-layer quick facts — skimmable in seconds */}
        <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
          {[
            { k: 'role', v: profile.role },
            { k: 'based in', v: profile.location },
            { k: 'status', v: profile.status },
            { k: 'open to', v: profile.availableForWork ? 'new signals' : 'closed' },
          ].map((f) => (
            <div key={f.k} className="bg-surface p-3">
              <dt className="font-mono text-[0.6rem] uppercase tracking-widest2 text-faint">{f.k}</dt>
              <dd className="mt-1 font-mono text-xs text-fg ph">{f.v}</dd>
            </div>
          ))}
        </dl>
      </motion.div>

      {/* scroll cue */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-2 font-mono text-[0.6rem] tracking-widest2 text-faint"
        animate={reduced ? {} : { y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        SCROLL TO DESCEND
        <span className="h-8 w-px bg-gradient-to-b from-accent to-transparent" />
      </motion.div>
    </Chapter>
  )
}
