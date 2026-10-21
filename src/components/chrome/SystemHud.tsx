import { chapters, profile } from '@/content'

/**
 * Ambient "you are here" chrome pinned to the bottom-left. Always answers:
 * where am I, and how far through. Hidden from screen readers (decorative;
 * the nav is the real landmark).
 */
export function SystemHud({ activeId, progress }: { activeId: string; progress: number }) {
  const active = chapters.find((c) => c.id === activeId) ?? chapters[0]
  const pct = Math.round(progress * 100)
  return (
    <div
      aria-hidden="true"
      className="fixed bottom-4 left-4 z-[90] hidden select-none font-mono text-[0.6rem] leading-relaxed text-faint md:block"
    >
      <div className="flex items-center gap-2">
        <span className="inline-block h-1.5 w-1.5 animate-blink bg-accent" />
        <span className="text-dim">{profile.status}</span>
      </div>
      <div>
        SECTOR <span className="text-accent">{active.index}</span> / {active.label}
      </div>
      <div>DEPTH {String(pct).padStart(3, '0')}%</div>
      <div>{profile.coordinates}</div>
    </div>
  )
}
