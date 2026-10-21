import { useEffect, useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { GlitchText } from '@/components/shared/GlitchText'
import { profile } from '@/content'
import { useExperience } from '@/context/ExperienceContext'
import { EGGS } from '@/components/easter-eggs/registry'

/** THE END OF THE JOURNEY — worlds collapse into one identity. */
export function FinalScene() {
  const ref = useRef<HTMLElement | null>(null)
  const inView = useInView(ref, { amount: 0.6, once: true })
  const { discover } = useExperience()

  useEffect(() => {
    if (inView) {
      const def = EGGS.find((e) => e.id === 'depths')
      if (def) discover(def.id, def.label)
    }
  }, [inView, discover])

  return (
    <section
      ref={ref}
      aria-label="The end of the journey"
      className="relative z-[3] flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 text-center"
    >
      {/* collapsing rings */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center">
        {[0, 1, 2, 3].map((r) => (
          <motion.span
            key={r}
            className="absolute rounded-full border border-line"
            style={{ width: `${(r + 1) * 180}px`, height: `${(r + 1) * 180}px` }}
            animate={inView ? { scale: [1, 0.9, 1], opacity: [0.3, 0.1, 0.3] } : {}}
            transition={{ duration: 5 + r, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <p className="eyebrow">END OF TRANSMISSION</p>
        <p className="mt-6 font-mono text-sm text-dim">all worlds collapse into one</p>
        <h2 className="mt-3 font-display text-giant font-bold leading-none">
          <GlitchText text={profile.name} className="ph" decodeOnMount={false} />
        </h2>

        <p className="mx-auto mt-8 max-w-md font-serif text-2xl leading-snug text-fg/90">
          This is only the current version.
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm text-dim">
          The story keeps compiling. New projects, new games, new frequencies. Come back and watch it change.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#connect"
            className="border border-accent px-6 py-3 font-mono text-xs uppercase tracking-widest2 text-fg transition-colors hover:bg-accent hover:text-ink"
          >
            ↑ connect
          </a>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="border border-line px-6 py-3 font-mono text-xs uppercase tracking-widest2 text-dim transition-colors hover:border-fg hover:text-fg"
          >
            ⟲ restart the journey
          </button>
        </div>

        <p className="mt-12 font-mono text-[0.6rem] text-faint">
          built as an experience · v0.1 prototype · {profile.coordinates}
        </p>
      </div>
    </section>
  )
}
