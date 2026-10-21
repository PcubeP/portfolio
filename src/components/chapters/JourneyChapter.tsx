import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Chapter } from '@/components/shared/Chapter'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { Reveal } from '@/components/shared/Reveal'
import { journey, resume, type TimelineEntry } from '@/content'
import { cn } from '@/lib/cn'
import { themes } from '@/lib/themes'

const KIND_LABEL: Record<TimelineEntry['kind'], string> = {
  experience: 'WORK',
  education: 'STUDY',
  milestone: 'MARK',
}

/** DISCOVER — the journey as an unfolding, expandable timeline (the resume, retold). */
export function JourneyChapter() {
  const [open, setOpen] = useState<string | null>(journey[0]?.id ?? null)

  return (
    <Chapter id="journey" label="Journey" theme={themes.blueprint}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 opacity-[0.5]"
        style={{ backgroundImage: 'linear-gradient(rgb(var(--line)/0.25) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--line)/0.25) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="wrap relative z-10">
        <SectionHeading index="02" eyebrow="Discover · the journey" title="How I got here." />

        <ol className="relative border-l border-line pl-6 md:pl-10">
          {journey.map((e, i) => {
            const isOpen = open === e.id
            return (
              <li key={e.id} className="relative pb-8 last:pb-0">
                {/* node */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute -left-[7px] top-1.5 h-3 w-3 border transition-colors md:-left-[11px]',
                    isOpen ? 'border-accent bg-accent' : 'border-faint bg-ink'
                  )}
                />
                <Reveal delay={i * 0.04}>
                  <button
                    onClick={() => setOpen(isOpen ? null : e.id)}
                    aria-expanded={isOpen}
                    className="group w-full text-left"
                  >
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="font-mono text-[0.6rem] tracking-widest2 text-accent">
                        {KIND_LABEL[e.kind]}
                      </span>
                      <span className="font-mono text-xs text-faint ph">{e.period}</span>
                    </div>
                    <h3 className="mt-1 font-display text-xl font-semibold text-fg transition-colors group-hover:text-accent md:text-2xl ph">
                      {e.title}
                    </h3>
                    <p className="font-mono text-xs text-dim ph">
                      {e.org}
                      {e.location ? ` · ${e.location}` : ''}
                    </p>
                    <p className="mt-2 max-w-2xl text-sm text-fg/80">{e.summary}</p>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && e.detail && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <ul className="mt-3 space-y-1.5 border-l border-line/60 pl-4">
                          {e.detail.map((d, j) => (
                            <li key={j} className="flex gap-2 text-sm text-fg/75">
                              <span className="text-accent">—</span>
                              <span className="ph">{d}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {e.tags && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {e.tags.map((t) => (
                        <span key={t} className="border border-line px-2 py-0.5 font-mono text-[0.6rem] text-dim ph">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </Reveal>
              </li>
            )
          })}
        </ol>

        {/* resume access — the traditional format stays available */}
        <Reveal className="mt-10 flex flex-wrap items-center gap-4 border-t border-line pt-6">
          <a
            href={resume.pdfUrl ?? undefined}
            aria-disabled={!resume.pdfUrl}
            onClick={(ev) => { if (!resume.pdfUrl) ev.preventDefault() }}
            download={resume.pdfUrl ? true : undefined}
            className={cn(
              'inline-flex items-center gap-2 border px-5 py-2.5 font-mono text-xs uppercase tracking-widest2 transition-colors',
              resume.pdfUrl
                ? 'border-accent text-fg hover:bg-accent hover:text-ink'
                : 'cursor-not-allowed border-line text-faint'
            )}
          >
            ↓ {resume.pdfUrl ? 'Download résumé (PDF)' : 'Résumé — [[ add /resume.pdf ]]'}
          </a>
          <span className="font-mono text-[0.65rem] text-faint">
            last updated <span className="ph">{resume.updated}</span>
          </span>
        </Reveal>
      </div>
    </Chapter>
  )
}
