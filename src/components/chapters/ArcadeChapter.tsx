import { Chapter } from '@/components/shared/Chapter'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { Reveal } from '@/components/shared/Reveal'
import { Meter } from '@/components/shared/Meter'
import { interests, profile } from '@/content'
import { EGGS } from '@/components/easter-eggs/registry'
import { useExperience } from '@/context/ExperienceContext'
import { cn } from '@/lib/cn'
import { themes } from '@/lib/themes'

const RARITY: Record<string, string> = {
  common: 'text-dim border-line',
  rare: 'text-accent border-accent/50',
  legendary: 'text-accent border-accent',
}

/** EXPERIENCE · Gaming world — a player HUD, not a hobby footnote. */
export function ArcadeChapter() {
  const { discovered } = useExperience()
  const foundEggs = EGGS.filter((e) => discovered.includes(e.id)).length

  return (
    <Chapter id="arcade" label="Arcade" theme={themes.arcade}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgb(0 0 0/0.55) 100%)' }} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 opacity-30"
        style={{ backgroundImage: 'repeating-linear-gradient(to bottom, rgb(var(--accent)/0.08) 0 2px, transparent 2px 4px)' }} />
      <div className="wrap relative z-10">
        <SectionHeading index="05" eyebrow="Experience · the arcade" title="Player one." />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          {/* player card */}
          <Reveal>
            <div className="block-brutal h-full p-5">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center border border-accent bg-ink font-display text-2xl font-bold text-accent">
                  P1
                </div>
                <div>
                  <p className="font-mono text-[0.6rem] uppercase tracking-widest2 text-faint">player</p>
                  <p className="font-display text-xl font-bold ph">{profile.name}</p>
                  <p className="font-mono text-xs text-dim">class · explorer</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="font-mono text-[0.6rem] text-faint">LVL</p>
                  <p className="font-display text-3xl font-bold text-accent">∞</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <Meter value={72} label="curiosity" />
                <Meter value={64} label="focus" />
                <Meter value={88} label="persistence" />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-px border border-line bg-line">
                {[
                  { k: 'games logged', v: String(interests.games.length) },
                  { k: 'secrets found', v: `${foundEggs}/${EGGS.length}` },
                  { k: 'runtime', v: '∞ hrs' },
                ].map((s) => (
                  <div key={s.k} className="bg-surface p-2 text-center">
                    <p className="font-display text-lg font-bold text-fg">{s.v}</p>
                    <p className="font-mono text-[0.55rem] uppercase text-faint">{s.k}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* library */}
          <Reveal delay={0.08}>
            <div className="block-brutal h-full p-5">
              <p className="mb-3 font-mono text-[0.65rem] uppercase tracking-widest2 text-accent">library</p>
              <ul className="space-y-3">
                {interests.games.map((g) => (
                  <li key={g.title} className="border-b border-line/60 pb-3 last:border-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-display font-semibold ph">{g.title}</span>
                      <span className="font-mono text-[0.6rem] text-faint ph">
                        {g.platform} · {g.genre}
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <Meter value={g.affinity ?? 50} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        {/* achievements + secret slots */}
        <Reveal className="mt-5">
          <p className="mb-3 font-mono text-[0.65rem] uppercase tracking-widest2 text-accent">achievements</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {interests.achievements.map((a) => (
              <div
                key={a.id}
                className={cn(
                  'flex items-center gap-3 border bg-surface p-3',
                  a.unlocked ? RARITY[a.rarity ?? 'common'] : 'border-line opacity-50'
                )}
              >
                <span aria-hidden="true" className="text-lg">{a.unlocked ? '★' : '🔒'}</span>
                <div>
                  <p className="font-display text-sm font-semibold text-fg ph">{a.label}</p>
                  <p className="font-mono text-[0.6rem] text-dim ph">{a.detail}</p>
                </div>
              </div>
            ))}

            {/* easter-egg slots — hints without spoilers */}
            {EGGS.map((e) => {
              const found = discovered.includes(e.id)
              return (
                <div
                  key={e.id}
                  className={cn(
                    'flex items-center gap-3 border bg-surface p-3 transition-colors',
                    found ? 'border-accent text-accent' : 'border-dashed border-line opacity-60'
                  )}
                >
                  <span aria-hidden="true" className="text-lg">{found ? '◆' : '◇'}</span>
                  <div>
                    <p className="font-display text-sm font-semibold">
                      {found ? e.label : 'SECRET'}
                    </p>
                    <p className="font-mono text-[0.6rem] text-dim">{e.hint}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </Reveal>
      </div>
    </Chapter>
  )
}
