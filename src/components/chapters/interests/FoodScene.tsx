import { motion } from 'motion/react'
import { themes, themeStyle } from '@/lib/themes'
import type { FoodItem } from '@/content'

const SPICES = ['🌶', '🧄', '🫚', '🫛', '🌿', '⭐', '🫙', '🍋']

export function FoodScene({ items }: { items: FoodItem[] }) {
  return (
    <div
      style={themeStyle(themes.food)}
      className="relative isolate min-h-[100svh] overflow-hidden bg-ink"
    >
      {/* Ambient floating spice dots */}
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={i}
          aria-hidden="true"
          className="pointer-events-none absolute text-2xl"
          style={{
            left: `${(i * 137 + 20) % 90}%`,
            top: `${(i * 211 + 10) % 90}%`,
            opacity: 0.06 + (i % 4) * 0.025,
          }}
          animate={{ y: [0, -14, 0], rotate: [0, 8, -8, 0] }}
          transition={{ duration: 5 + (i % 4), repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
        >
          {SPICES[i % SPICES.length]}
        </motion.div>
      ))}

      {/* Warm vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, rgb(var(--ink)/0.85) 100%)',
        }}
      />

      <div className="wrap relative z-10 py-24">
        {/* Header */}
        <div className="mb-12 flex items-baseline gap-4 border-b border-line pb-4">
          <span className="font-mono text-sm text-accent">FOOD</span>
          <span className="eyebrow text-dim">hobbies · the table</span>
          <span className="ml-auto font-mono text-[0.65rem] text-faint">// flavour map</span>
        </div>

        <h3
          className="font-display text-giant font-bold leading-[0.85] tracking-tight"
          style={{ color: 'rgb(var(--accent))' }}
        >
          THE TABLE.
        </h3>
        <p className="mt-4 max-w-lg font-serif text-xl" style={{ color: 'rgb(var(--fg)/0.85)' }}>
          Food is geography, memory and curiosity on a plate. Every meal is an edit of the world.
        </p>

        {/* Dish cards */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.55, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="group relative border p-5"
              style={{ borderColor: 'rgb(var(--line)/0.6)', background: 'rgb(var(--surface)/0.7)' }}
            >
              {/* Spice accent corner */}
              <span
                aria-hidden="true"
                className="absolute right-3 top-3 text-xl opacity-25 transition-opacity group-hover:opacity-60"
              >
                {SPICES[i % SPICES.length]}
              </span>
              <p className="font-mono text-[0.55rem] uppercase tracking-widest" style={{ color: 'rgb(var(--faint))' }}>
                {item.cuisine ?? 'world cuisine'}
              </p>
              <h4
                className="mt-1 font-display text-lg font-semibold ph"
                style={{ color: 'rgb(var(--fg))' }}
              >
                {item.name}
              </h4>
              <p className="mt-2 text-sm leading-relaxed ph" style={{ color: 'rgb(var(--dim))' }}>
                {item.note}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Flavour axis */}
        <div className="mt-12 flex flex-wrap gap-3">
          {['sweet', 'spicy', 'umami', 'sour', 'bitter', 'smoky', 'rich', 'fresh'].map((f) => (
            <span
              key={f}
              className="border px-3 py-1 font-mono text-[0.6rem] uppercase tracking-widest"
              style={{ borderColor: 'rgb(var(--accent)/0.35)', color: 'rgb(var(--dim))' }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
