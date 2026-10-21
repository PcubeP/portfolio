import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Chapter } from '@/components/shared/Chapter'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { Reveal } from '@/components/shared/Reveal'
import { Media } from '@/components/shared/Media'
import { Meter } from '@/components/shared/Meter'
import { projects, skills } from '@/content'
import { cn } from '@/lib/cn'
import { themes, themeStyle } from '@/lib/themes'

/* ── Matrix rain columns ──────────────────────────────────── */
const MATRIX_CHARS = '01アイウエオカキクケコ><{}[]=+-*/&|^~;:.,0110'
function charSeq(len: number, offset: number): string {
  return Array.from({ length: len }, (_, i) =>
    MATRIX_CHARS[(i * 7 + offset * 13) % MATRIX_CHARS.length]
  ).join(' ')
}

const COLUMNS = Array.from({ length: 22 }, (_, i) => ({
  left: `${(i * 4.7) % 100}%`,
  dur: 6 + ((i * 137) % 7),
  delay: -((i * 211) % 10),
  opacity: 0.04 + (i % 5) * 0.015,
  chars: charSeq(26, i),
}))

function MatrixRain() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {COLUMNS.map((col, i) => (
        <div
          key={i}
          className="absolute font-mono text-[0.45rem] leading-[2.4] tracking-[0.12em]"
          style={{
            left: col.left,
            top: '-100%',
            color: 'rgb(0 255 65)',
            opacity: col.opacity,
            whiteSpace: 'nowrap',
            writingMode: 'horizontal-tb',
            animation: `matrix-fall ${col.dur}s linear ${col.delay}s infinite`,
          }}
        >
          {col.chars.split(' ').map((c, j) => (
            <div key={j} style={{ opacity: j === 0 ? 1 : 0.4 + Math.random() * 0.4 }}>
              {c}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

/* ── Status badge ─────────────────────────────────────────── */
const STATUS_GLYPH: Record<string, string> = {
  live: '● ONLINE',
  'in-progress': '◑ ACTIVE',
  archived: '○ STORED',
  concept: '◌ CONCEPT',
}

/** CREATIONS — cyberpunk command centre. */
export function CreationsChapter() {
  const [selected, setSelected] = useState(projects[0]?.id)
  const active = projects.find((p) => p.id === selected) ?? projects[0]

  return (
    <Chapter id="creations" label="Creations" theme={themes.matrix}>
      {/* Matrix rain */}
      <MatrixRain />

      {/* Scanline overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgb(0 255 65) 0px, rgb(0 255 65) 1px, transparent 1px, transparent 4px)',
        }}
      />

      {/* Corner glyphs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-6 top-6 z-0 hidden font-mono text-[0.6rem] leading-relaxed text-accent/40 md:block"
      >
        {['> BOOT system.exe', '> INIT kernel...', '> LOAD creations.sh', '> STATUS: OPERATIONAL'].map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>

      <div className="wrap relative z-10">
        <SectionHeading index="03" eyebrow="Explore · the command centre" title="Things I've built." />

        {/* ── File system terminal ── */}
        <Reveal>
          <div
            className="block-brutal relative overflow-hidden"
            style={themeStyle(themes.matrix)}
          >
            {/* Terminal title bar */}
            <div
              className="flex items-center gap-2 border-b px-3 py-2"
              style={{ borderColor: 'rgb(var(--line))', background: 'rgb(var(--raised))' }}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'rgb(var(--faint))' }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'rgb(var(--faint))' }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'rgb(var(--accent))' }} />
              <span className="ml-2 font-mono text-[0.65rem]" style={{ color: 'rgb(var(--dim))' }}>
                root@system:~/creations — {projects.length} modules
              </span>
              <span className="ml-auto font-mono text-[0.55rem]" style={{ color: 'rgb(var(--accent))' }}>
                SYS READY ●
              </span>
            </div>

            <div
              className="grid gap-px md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]"
              style={{ background: 'rgb(var(--line))' }}
            >
              {/* Module index */}
              <ul
                className="p-2 font-mono text-sm"
                style={{ background: 'rgb(var(--surface))' }}
              >
                <li className="px-2 py-1 text-[0.65rem]" style={{ color: 'rgb(var(--faint))' }}>
                  $ ls ./modules --all
                </li>
                {projects.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => setSelected(p.id)}
                      aria-current={p.id === selected}
                      data-cursor-label="execute"
                      className={cn(
                        'flex w-full items-center gap-2 px-2 py-2 text-left transition-all duration-200',
                        p.id === selected
                          ? 'bg-accent/15 text-accent'
                          : 'text-dim hover:text-fg hover:bg-raised/50'
                      )}
                      style={
                        p.id === selected
                          ? { boxShadow: 'inset 2px 0 0 rgb(var(--accent))' }
                          : undefined
                      }
                    >
                      <span aria-hidden="true" style={{ color: 'rgb(var(--accent))' }}>
                        {p.id === selected ? '▶' : '·'}
                      </span>
                      <span className="truncate ph">{p.name}</span>
                      {p.featured && (
                        <span
                          className="ml-auto border px-1 text-[0.5rem] font-mono uppercase tracking-widest"
                          style={{ borderColor: 'rgb(var(--accent)/0.5)', color: 'rgb(var(--accent))' }}
                        >
                          ★
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>

              {/* Module detail */}
              <div className="p-5" style={{ background: 'rgb(var(--surface))' }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22 }}
                  >
                    {/* Header row */}
                    <div className="flex items-center justify-between font-mono text-[0.65rem]">
                      <span style={{ color: 'rgb(var(--faint))' }}>
                        {'>'} LOAD {active.name}.mod
                      </span>
                      <span
                        className="border px-2 py-0.5 text-[0.55rem]"
                        style={{ borderColor: 'rgb(var(--accent)/0.4)', color: 'rgb(var(--accent))' }}
                      >
                        {active.status ? (STATUS_GLYPH[active.status] ?? active.status) : 'UNKNOWN'}
                      </span>
                    </div>

                    <h3
                      className="mt-3 font-display text-2xl font-bold ph"
                      style={{
                        color: 'rgb(var(--fg))',
                        textShadow: '0 0 20px rgb(var(--accent)/0.35)',
                      }}
                    >
                      {active.name}
                    </h3>
                    <p className="mt-1 font-mono text-xs ph" style={{ color: 'rgb(var(--accent))' }}>
                      {active.blurb}
                    </p>

                    {active.media && <Media media={active.media} className="mt-4" ratio="16 / 9" />}

                    <p className="mt-4 text-sm leading-relaxed ph" style={{ color: 'rgb(var(--fg)/0.75)' }}>
                      {active.description}
                    </p>

                    {/* Stack chips */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {active.stack.map((s) => (
                        <span
                          key={s}
                          className="border px-2 py-0.5 font-mono text-[0.6rem]"
                          style={{ borderColor: 'rgb(var(--line))', color: 'rgb(var(--dim))' }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* Links */}
                    {active.links && (
                      <div className="mt-4 flex flex-wrap gap-3">
                        {active.links.map((l) => (
                          <a
                            key={l.label}
                            href={l.url}
                            className="font-mono text-xs underline-offset-4 hover:underline ph"
                            style={{ color: 'rgb(var(--accent))' }}
                          >
                            {'→'} EXECUTE [{l.label}]
                          </a>
                        ))}
                      </div>
                    )}

                    <div
                      className="mt-4 border-t pt-3 font-mono text-[0.6rem]"
                      style={{ borderColor: 'rgb(var(--line))', color: 'rgb(var(--faint))' }}
                    >
                      {'>'} PROCESS COMPLETE_ <span className="animate-pulse">█</span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── System capabilities ── */}
        <Reveal delay={0.1} className="mt-12">
          <div
            className="mb-5 flex items-center gap-3 border-b pb-3"
            style={{ borderColor: 'rgb(var(--line))' }}
          >
            <span className="font-mono text-[0.65rem] uppercase tracking-widest" style={{ color: 'rgb(var(--accent))' }}>
              {'>'} SYSTEM CAPABILITIES
            </span>
            <div className="h-px flex-1" style={{ background: 'rgb(var(--line))' }} />
            <span className="font-mono text-[0.55rem]" style={{ color: 'rgb(var(--faint))' }}>
              CORE MODULES LOADED
            </span>
          </div>
        </Reveal>

        <div className="mt-2 grid gap-8 md:grid-cols-3">
          {skills.map((g, i) => (
            <Reveal key={g.label} delay={i * 0.08}>
              <h4
                className="mb-3 font-mono text-[0.65rem] uppercase tracking-widest"
                style={{ color: 'rgb(var(--accent))' }}
              >
                {'['} {g.label} {']'}
              </h4>
              <div className="space-y-3">
                {g.items.map((it) => (
                  <Meter key={it.name} value={it.level ?? 50} label={it.name} />
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Chapter>
  )
}
