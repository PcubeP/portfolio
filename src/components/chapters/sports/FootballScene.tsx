import { motion } from 'motion/react'
import type { Sport } from '@/content'
import { themes, themeStyle } from '@/lib/themes'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { CountUp } from '@/components/shared/CountUp'

/** FOOTBALL — FC Barcelona. Blaugrana stripes, a pitch, an animated pass map. */
export function FootballScene({ sport }: { sport?: Sport }) {
  const reduced = useReducedMotion()

  return (
    <div
      style={themeStyle(themes.barca)}
      className="relative isolate flex min-h-[92svh] flex-col justify-center overflow-hidden bg-ink px-[clamp(1.25rem,5vw,6rem)] py-24"
    >
      {/* blaugrana vertical stripes (the shirt) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, rgb(var(--blau)) 0 8%, rgb(var(--grana)) 8% 16%)',
          opacity: 0.22,
        }}
      />
      {/* senyera stripe accent (top) */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-2"
        style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgb(var(--gold)) 0 24px, rgb(var(--grana)) 24px 36px)' }}
      />

      {/* pitch + pass map */}
      <svg
        aria-hidden="true"
        viewBox="0 0 400 260"
        preserveAspectRatio="xMidYMid meet"
        className="absolute right-2 top-1/2 hidden h-[78%] -translate-y-1/2 opacity-95 md:block"
      >
        <g fill="none" stroke="rgb(var(--gold)/0.5)" strokeWidth="1.5">
          <rect x="20" y="20" width="360" height="220" />
          <line x1="200" y1="20" x2="200" y2="240" />
          <circle cx="200" cy="130" r="34" />
          <rect x="20" y="80" width="42" height="100" />
          <rect x="338" y="80" width="42" height="100" />
        </g>
        {/* tiki-taka pass map */}
        {(() => {
          const pts = [
            [70, 200], [130, 150], [110, 90], [190, 120], [250, 80], [300, 140], [345, 110],
          ]
          return (
            <>
              {pts.slice(0, -1).map((p, i) => {
                const n = pts[i + 1]
                return (
                  <motion.line
                    key={i}
                    x1={p[0]} y1={p[1]} x2={n[0]} y2={n[1]}
                    stroke="rgb(var(--gold))"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    initial={{ pathLength: reduced ? 1 : 0, opacity: reduced ? 1 : 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : i * 0.35 }}
                  />
                )
              })}
              {pts.map((p, i) => (
                <circle key={`n${i}`} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 6 : 4} fill="rgb(var(--gold))" />
              ))}
            </>
          )
        })()}
      </svg>

      {/* content */}
      <div className="relative z-10 max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-widest2 text-gold">
          04 · Arena / <span className="text-fg">Football</span> · Més que un club
        </p>

        <div className="flex flex-wrap items-end gap-4">
          <h3 className="mt-3 font-display text-[clamp(3rem,13vw,10rem)] font-bold leading-[0.82] tracking-tight text-fg">
            FÚT<span className="text-gold">BOL</span>
          </h3>
          <span aria-hidden="true" className="mb-4 font-display text-[clamp(3rem,10vw,7rem)] font-bold leading-none text-grana">
            10
          </span>
        </div>

        <p className="mt-4 max-w-lg font-serif text-xl text-fg/90">{sport?.note}</p>

        <div className="mt-8 flex flex-wrap items-stretch gap-4">
          {sport?.figure && (
            <div className="flex items-stretch gap-0 border-l-2 border-gold bg-ink/40 backdrop-blur-sm">
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
                <p className="font-mono text-[0.6rem] uppercase tracking-widest2 text-gold/80">the maestro</p>
                <p className="font-display text-2xl font-bold text-fg">{sport.figure.name}</p>
                <p className="max-w-xs text-sm text-fg/85">{sport.figure.note}</p>
                {sport.figure.media?.caption && (
                  <p className="mt-1 font-mono text-[0.55rem] text-gold/60">{sport.figure.media.caption}</p>
                )}
              </div>
            </div>
          )}
          {sport?.stats && (
            <dl className="flex flex-wrap gap-3">
              {sport.stats.map((s) => (
                <div key={s.label} className="border border-gold/40 bg-ink/30 px-4 py-3 backdrop-blur-sm">
                  <dt className="font-mono text-[0.55rem] uppercase tracking-widest2 text-gold/80">{s.label}</dt>
                  <dd className="font-mono text-sm text-fg"><CountUp value={s.value} /></dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <p className="mt-8 font-serif text-lg italic text-gold">"Més que un club."</p>
      </div>
    </div>
  )
}
