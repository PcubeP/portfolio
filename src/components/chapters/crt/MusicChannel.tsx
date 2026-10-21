import { LoudStrip, CalmStrip } from '@/components/chapters/FrequencyChapter'
import { interests } from '@/content'
import { useExperience } from '@/context/ExperienceContext'

/**
 * CHANNELS 03 / 04 — the frequency, on the tube. Reuses the exact LoudStrip /
 * CalmStrip from the Frequency world. The `audioOn` gate is preserved end to
 * end: embeds NEVER autoplay, not even on a channel change — the visitor must
 * activate the signal here just as on the Frequency page.
 */
export function MusicChannel({ tone }: { tone: 'loud' | 'calm' }) {
  const { audioOn, toggleAudio } = useExperience()
  const band = interests.music.find((m) => m.kind?.toLowerCase() === 'band')
  const mood = interests.music.find((m) => m.kind?.toLowerCase() !== 'band')
  const item = tone === 'loud' ? band : mood

  if (!item) return null

  return (
    <div className="relative h-full w-full overflow-y-auto bg-ink scrollbar-none">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-line/40 bg-ink/80 px-4 py-2 backdrop-blur">
        <span className="font-mono text-[0.6rem] uppercase tracking-widest2 text-accent">
          CH {tone === 'loud' ? '03 · Linkin Park' : '04 · Lo-fi'}
        </span>
        <button
          onClick={toggleAudio}
          aria-pressed={audioOn}
          className="border border-accent px-3 py-1 font-mono text-[0.6rem] uppercase tracking-widest text-fg transition-colors hover:bg-accent hover:text-ink"
        >
          {audioOn ? '❚❚ signal live' : '▶ activate signal'}
        </button>
      </div>
      {tone === 'loud' ? <LoudStrip item={item} live={audioOn} /> : <CalmStrip item={item} live={audioOn} />}
      <p className="px-4 py-2 font-mono text-[0.55rem] text-faint">nothing plays until you say so · no autoplay</p>
    </div>
  )
}
