import { motion, useInView } from 'motion/react'
import { useRef } from 'react'
import { Chapter } from '@/components/shared/Chapter'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { Reveal } from '@/components/shared/Reveal'
import { MediaGallery } from '@/components/shared/MediaGallery'
import { social, gallery, profile, interests } from '@/content'
import { cn } from '@/lib/cn'
import { Magnetic } from '@/components/shared/Magnetic'

/** Animated SVG network — lines draw themselves, nodes pulse. */
function NetworkLines() {
  const ref = useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })

  const lines = Array.from({ length: 14 }, (_, i) => ({
    x1: (i * 137) % 800, y1: (i * 211) % 600,
    x2: (i * 311) % 800, y2: (i * 97)  % 600,
  }))
  const nodes = lines.map((l) => ({ cx: l.x1, cy: l.y1 }))

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 opacity-50">
      <svg ref={ref} viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        {lines.map((l, i) => {
          const len = Math.hypot(l.x2 - l.x1, l.y2 - l.y1)
          return (
            <motion.line
              key={i}
              x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke="rgb(var(--accent)/0.3)"
              strokeWidth="1"
              strokeDasharray={len}
              strokeDashoffset={len}
              animate={inView ? { strokeDashoffset: 0 } : { strokeDashoffset: len }}
              transition={{ duration: 1.2, delay: i * 0.08, ease: 'easeInOut' }}
            />
          )
        })}
        {nodes.map((n, i) => (
          <motion.circle
            key={'n' + i}
            cx={n.cx} cy={n.cy} r="2.5"
            fill="rgb(var(--accent)/0.6)"
            animate={inView ? { scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6] } : { scale: 1 }}
            transition={{ duration: 2.5, delay: i * 0.15 + 1.0, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </svg>
    </div>
  )
}

/** Film reel strip icon — pure CSS */
function ReelStrip() {
  return (
    <div className="relative flex h-14 items-center gap-1" aria-hidden="true">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="relative h-12 w-8 shrink-0 overflow-hidden border"
          style={{ borderColor: 'rgb(var(--accent)/0.3)', background: 'rgb(var(--raised))' }}
        >
          <div className="absolute inset-x-0 top-1 flex justify-between px-1">
            <div className="h-1.5 w-1.5" style={{ background: 'rgb(var(--surface))' }} />
            <div className="h-1.5 w-1.5" style={{ background: 'rgb(var(--surface))' }} />
          </div>
          <div className="absolute inset-x-0 bottom-1 flex justify-between px-1">
            <div className="h-1.5 w-1.5" style={{ background: 'rgb(var(--surface))' }} />
            <div className="h-1.5 w-1.5" style={{ background: 'rgb(var(--surface))' }} />
          </div>
          <div
            className="absolute inset-x-2 inset-y-4"
            style={{ background: `rgb(var(--accent)/${0.04 + (i % 3) * 0.04})` }}
          />
        </div>
      ))}
      {/* scroll glow */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-16"
        style={{ background: 'linear-gradient(to right, transparent, rgb(var(--ink)))' }}
      />
    </div>
  )
}

/** PC build spec table */
function PCCard({ build }: { build: { name: string; note?: string; specs?: { component: string; value: string }[] } }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="border bg-surface"
      style={{ borderColor: 'rgb(var(--line))' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: 'rgb(var(--line))', background: 'rgb(var(--raised))' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: 'rgb(var(--accent))' }}
          />
          <span className="font-mono text-sm font-bold text-accent">{build.name}</span>
        </div>
        <span className="font-mono text-[0.55rem] uppercase tracking-widest text-faint">
          handbuilt
        </span>
      </div>

      {/* Note */}
      <p className="border-b px-4 py-2 font-mono text-[0.65rem] text-dim ph" style={{ borderColor: 'rgb(var(--line))' }}>
        {build.note}
      </p>

      {/* Spec table */}
      <div className="divide-y" style={{ borderColor: 'rgb(var(--line))' }}>
        {(build.specs ?? []).map((row) => (
          <div key={row.component} className="flex items-center justify-between px-4 py-2">
            <span className="font-mono text-[0.6rem] uppercase tracking-widest text-faint">
              {row.component}
            </span>
            <span className="font-mono text-xs text-fg ph">{row.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

/** CONNECT — the network. */
export function ConnectChapter() {
  const { pcBuilds, videography } = interests

  return (
    <Chapter id="connect" label="Connect">
      <NetworkLines />
      <div className="wrap relative z-10">
        <SectionHeading index="06" eyebrow="Connect · the network" title="Find the signal." />

        {/* memory wall */}
        <Reveal className="mb-10">
          <p className="mb-3 font-mono text-[0.65rem] uppercase tracking-widest2 text-accent">fragments</p>
          <MediaGallery items={gallery} />
        </Reveal>

        {/* ── Videography section ── */}
        <Reveal className="mb-12">
          <div className="border" style={{ borderColor: 'rgb(var(--accent)/0.25)' }}>
            {/* Film strip header */}
            <div
              className="border-b px-5 py-4"
              style={{ borderColor: 'rgb(var(--accent)/0.25)', background: 'rgb(var(--raised)/0.5)' }}
            >
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm text-accent">// LENS.log</span>
                <span className="eyebrow">videography · the viewfinder</span>
              </div>
              <ReelStrip />
            </div>

            <div className="px-5 py-6">
              <h3 className="font-display text-3xl font-bold leading-tight">
                Every frame is a<br />
                <span className="text-accent">decision.</span>
              </h3>
              <p className="mt-3 max-w-xl font-serif text-lg leading-relaxed text-fg/80 ph">
                {videography.note}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-dim">
                A constant fascination with light, motion, and the story that a single shot can carry.
                The lens sees what the eye overlooks — every angle, every cut, a conscious choice.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {['cinematography', 'colour grading', 'storytelling', 'framing', 'motion'].map((tag) => (
                  <span
                    key={tag}
                    className="border px-3 py-1 font-mono text-[0.6rem] uppercase tracking-wider text-dim"
                    style={{ borderColor: 'rgb(var(--accent)/0.3)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-3 border-t pt-4" style={{ borderColor: 'rgb(var(--line))' }}>
                <span
                  className="grid h-10 w-10 place-items-center border font-mono text-sm"
                  style={{ borderColor: 'rgb(var(--accent)/0.5)', color: 'rgb(var(--accent))' }}
                  aria-hidden="true"
                >
                  IG
                </span>
                <div>
                  <p className="font-display font-semibold text-fg">Instagram</p>
                  <p className="font-mono text-xs text-dim ph">[[ @your.handle — link coming soon ]]</p>
                </div>
                <span className="ml-auto border px-2 py-0.5 font-mono text-[0.6rem] text-faint" style={{ borderColor: 'rgb(var(--line))' }}>
                  offline
                </span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── PC builds ── */}
        <Reveal className="mb-12">
          <div className="mb-4 flex items-center gap-3">
            <p className="font-mono text-[0.65rem] uppercase tracking-widest2 text-accent">
              handbuilt machines
            </p>
            <div className="h-px flex-1 bg-line" />
            <span className="font-mono text-[0.55rem] text-faint">{pcBuilds.length} rigs</span>
          </div>
          <p className="mb-6 max-w-xl text-sm leading-relaxed text-dim">
            Every component chosen, every cable routed. Two machines built from scratch — not bought, not pre-built.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {pcBuilds.map((build) => (
              <PCCard key={build.name} build={build} />
            ))}
          </div>
        </Reveal>

        {/* ── Social network ── */}
        <Reveal>
          <p className="mb-4 font-mono text-[0.65rem] uppercase tracking-widest2 text-accent">nodes</p>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {social.map((s) => {
              const active = !!s.url
              const Tag = active ? 'a' : 'div'
              return (
                <li key={s.id}>
                  <Magnetic strength={active ? 0.3 : 0} className="block">
                    <Tag
                      data-cursor-label={active ? 'connect' : undefined}
                      {...(active ? { href: s.url, target: '_blank', rel: 'noreferrer' } : {})}
                      className={cn(
                        'group flex items-center gap-4 border bg-surface p-4 transition-colors',
                        active
                          ? 'border-line hover:border-accent hover:bg-raised'
                          : 'cursor-default border-dashed border-line'
                      )}
                      aria-disabled={!active}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          'grid h-10 w-10 shrink-0 place-items-center border font-mono text-sm',
                          active ? 'border-accent text-accent' : 'border-line text-faint'
                        )}
                      >
                        {s.platform.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="font-display font-semibold text-fg">{s.platform}</p>
                        <p className="truncate font-mono text-xs text-dim ph">{s.handle}</p>
                      </div>
                      <span
                        className={cn(
                          'ml-auto font-mono text-[0.6rem] uppercase',
                          active ? 'text-accent' : 'text-faint'
                        )}
                      >
                        {active ? '↗ open' : 'offline'}
                      </span>
                    </Tag>
                  </Magnetic>
                </li>
              )
            })}
          </ul>
          <p className="mt-4 font-mono text-[0.65rem] text-faint">
            offline nodes are awaiting real links — no URLs invented. based in{' '}
            <span className="ph">{profile.location}</span>.
          </p>
        </Reveal>
      </div>
    </Chapter>
  )
}
