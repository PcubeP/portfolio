import { motion } from 'motion/react'
import { themes, themeStyle } from '@/lib/themes'
import type { ArtPiece } from '@/content'

const COLORS = [
  'rgb(255 60 200)', 'rgb(80 255 120)', 'rgb(255 200 0)',
  'rgb(0 200 255)', 'rgb(255 80 40)', 'rgb(180 0 255)',
]

export function ArtScene({ pieces }: { pieces: ArtPiece[] }) {
  return (
    <div
      style={themeStyle(themes.street)}
      className="relative isolate min-h-[100svh] overflow-hidden bg-ink"
    >
      {/* Graffiti splatter blobs */}
      {COLORS.map((col, i) => (
        <motion.div
          key={i}
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full blur-3xl"
          style={{
            width: 180 + (i * 60),
            height: 120 + (i * 40),
            left: `${(i * 137 + 5) % 85}%`,
            top: `${(i * 211 + 8) % 85}%`,
            background: col,
            opacity: 0.04 + (i % 3) * 0.01,
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.04, 0.07, 0.04] }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.6, ease: 'easeInOut' }}
        />
      ))}

      {/* Spray drips — CSS clip-path columns */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={`drip-${i}`}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 w-[3px]"
          style={{
            left: `${8 + i * 16}%`,
            background: COLORS[i % COLORS.length],
            opacity: 0.18,
            height: `${22 + (i * 37) % 35}%`,
            borderRadius: '0 0 50% 50%',
          }}
          initial={{ scaleY: 0, originY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}

      <div className="wrap relative z-10 py-24">
        <div className="mb-12 flex items-baseline gap-4 border-b pb-4" style={{ borderColor: 'rgb(var(--line)/0.5)' }}>
          <span className="font-mono text-sm" style={{ color: 'rgb(var(--accent))' }}>ART</span>
          <span className="eyebrow" style={{ color: 'rgb(var(--dim))' }}>hobbies · the wall</span>
          <span className="ml-auto font-mono text-[0.65rem]" style={{ color: 'rgb(var(--faint))' }}>// spray & create</span>
        </div>

        <h3
          className="font-display text-giant font-bold leading-[0.85] tracking-tight"
          style={{
            color: 'rgb(var(--fg))',
            WebkitTextStroke: '2px rgb(var(--accent))',
            textShadow: '4px 4px 0 rgb(var(--spray)/0.4)',
          }}
        >
          THE WALL.
        </h3>
        <p className="mt-4 max-w-lg font-serif text-xl" style={{ color: 'rgb(var(--fg)/0.85)' }}>
          Spray paint. Permanent decisions in seconds. Every piece a negotiation between control and chaos.
        </p>

        {/* Piece cards — portrait gallery style */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {pieces.map((piece, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, rotate: i % 2 === 0 ? -2 : 2, scale: 0.95 }}
              whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative border-2 p-6"
              style={{
                borderColor: COLORS[i % COLORS.length],
                background: 'rgb(var(--surface)/0.5)',
                boxShadow: `0 0 20px ${COLORS[i % COLORS.length].replace('rgb', 'rgba').replace(')', '/0.08)')}`,
              }}
            >
              {/* Spray nozzle icon */}
              <div
                className="mb-4 h-12 w-12 border-2"
                style={{ borderColor: COLORS[i % COLORS.length], background: 'rgb(var(--raised)/0.5)' }}
                aria-hidden="true"
              >
                <div className="flex h-full items-center justify-center text-xl opacity-60">🎨</div>
              </div>
              <span
                className="font-mono text-[0.55rem] uppercase tracking-widest"
                style={{ color: COLORS[i % COLORS.length] }}
              >
                {piece.medium} · artwork
              </span>
              <h4 className="mt-1 font-display text-xl font-bold ph" style={{ color: 'rgb(var(--fg))' }}>
                {piece.title ?? `Piece 0${i + 1}`}
              </h4>
              <p className="mt-2 text-sm leading-relaxed ph" style={{ color: 'rgb(var(--dim))' }}>
                {piece.note}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Medium tag */}
        <div className="mt-8 flex items-center gap-3">
          <span className="font-mono text-[0.6rem] uppercase tracking-widest" style={{ color: 'rgb(var(--faint))' }}>
            medium
          </span>
          <span
            className="border px-3 py-1 font-mono text-[0.65rem] uppercase"
            style={{ borderColor: 'rgb(var(--accent)/0.5)', color: 'rgb(var(--accent))' }}
          >
            spray paint
          </span>
          <span className="font-mono text-[0.6rem]" style={{ color: 'rgb(var(--faint))' }}>
            aerosol · walls · canvas
          </span>
        </div>
      </div>
    </div>
  )
}
