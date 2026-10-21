import { motion } from 'motion/react'
import { themes, themeStyle } from '@/lib/themes'
import type { AutoItem } from '@/content'

const KIND_LABEL: Record<AutoItem['kind'], string> = {
  dream: 'DREAM BUILD',
  icon: 'ALL-TIME ICON',
  category: 'OBSESSION',
}

export function AutoScene({ items }: { items: AutoItem[] }) {
  return (
    <div
      style={themeStyle(themes.garage)}
      className="relative isolate min-h-[100svh] overflow-hidden bg-ink"
    >
      {/* Carbon fibre texture overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, rgb(var(--chrome)/0.6) 0 1px, transparent 1px 12px), ' +
            'repeating-linear-gradient(-45deg, rgb(var(--chrome)/0.3) 0 1px, transparent 1px 12px)',
          backgroundSize: '12px 12px',
        }}
      />

      {/* Speed lines */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          aria-hidden="true"
          className="pointer-events-none absolute h-px"
          style={{
            top: `${15 + i * 10}%`,
            left: 0,
            right: 0,
            background: `rgb(var(--accent)/${0.04 + i * 0.01})`,
          }}
          animate={{ scaleX: [0.6, 1, 0.6], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.25, ease: 'easeInOut' }}
        />
      ))}

      {/* Neon underglow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48"
        style={{
          background: 'linear-gradient(to top, rgb(var(--accent)/0.06), transparent)',
        }}
      />

      <div className="wrap relative z-10 py-24">
        <div className="mb-12 flex items-baseline gap-4 border-b pb-4" style={{ borderColor: 'rgb(var(--line)/0.5)' }}>
          <span className="font-mono text-sm" style={{ color: 'rgb(var(--accent))' }}>AUTOS</span>
          <span className="eyebrow" style={{ color: 'rgb(var(--dim))' }}>hobbies · the garage</span>
          <span className="ml-auto font-mono text-[0.65rem]" style={{ color: 'rgb(var(--faint))' }}>// engine room</span>
        </div>

        <h3
          className="font-display text-giant font-bold leading-[0.85] tracking-tight"
          style={{ color: 'rgb(var(--accent))', textShadow: '0 0 40px rgb(var(--accent)/0.25)' }}
        >
          THE GARAGE.
        </h3>
        <p className="mt-4 max-w-lg font-serif text-xl" style={{ color: 'rgb(var(--fg)/0.85)' }}>
          Machines that move faster than thought, engineered to the millimetre. Obsession in metal and carbon.
        </p>

        {/* Tachometer RPM bar */}
        <div className="mt-8 flex items-center gap-3">
          <span className="font-mono text-[0.6rem] uppercase" style={{ color: 'rgb(var(--faint))' }}>RPM</span>
          <div className="h-1 flex-1 overflow-hidden" style={{ background: 'rgb(var(--raised))' }}>
            <motion.div
              className="h-full"
              style={{ background: 'linear-gradient(90deg, rgb(var(--accent)), rgb(var(--chrome)))' }}
              initial={{ width: '0%' }}
              whileInView={{ width: '78%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            />
          </div>
          <span className="font-mono text-sm font-bold" style={{ color: 'rgb(var(--accent))' }}>7800</span>
        </div>

        {/* Car cards */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="group relative border p-5"
              style={{
                borderColor: 'rgb(var(--accent)/0.3)',
                background: 'rgb(var(--surface)/0.6)',
                boxShadow: '0 0 0 0 rgb(var(--accent)/0)',
              }}
              whileHover={{ boxShadow: '0 0 24px rgb(var(--accent)/0.12)' }}
            >
              <div className="flex items-start justify-between">
                <span
                  className="border px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-widest"
                  style={{ borderColor: 'rgb(var(--accent)/0.4)', color: 'rgb(var(--accent))' }}
                >
                  {KIND_LABEL[item.kind]}
                </span>
              </div>
              <h4 className="mt-3 font-display text-2xl font-bold ph" style={{ color: 'rgb(var(--fg))' }}>
                {item.name}
              </h4>
              <p className="mt-2 text-sm leading-relaxed ph" style={{ color: 'rgb(var(--dim))' }}>
                {item.note}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
