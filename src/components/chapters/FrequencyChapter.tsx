import { motion } from 'motion/react'
import { Media } from '@/components/shared/Media'
import { Chapter } from '@/components/shared/Chapter'
import { interests, type MusicItem } from '@/content'
import { useExperience } from '@/context/ExperienceContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { themes, themeStyle, type Theme } from '@/lib/themes'
import { seeded } from '@/lib/prng'
import { cn } from '@/lib/cn'

/** A channel is "loud" (bands) or "calm" (moods/genres) — each gets a look. */
function toneOf(m: MusicItem): 'loud' | 'calm' {
  return m.kind?.toLowerCase() === 'band' ? 'loud' : 'calm'
}

/** EXPERIENCE · Music world — two frequencies. Loud and quiet. Never autoplays. */
export function FrequencyChapter({ embedded: _embedded = false }: { embedded?: boolean }) {
  const { audioOn, toggleAudio } = useExperience()

  return (
    <Chapter id="frequency" label="Frequency" full bare theme={themes.loud}>
      {/* intro band */}
      <div className="border-b border-line px-[clamp(1.25rem,5vw,6rem)] py-16">
        <div className="flex items-baseline gap-4 border-b border-line pb-4">
          <span className="font-mono text-sm text-accent">07</span>
          <span className="eyebrow">Experience · the frequency</span>
          <span className="ml-auto font-mono text-[0.65rem] text-faint">// two signals</span>
        </div>
        <h2 className="mt-6 font-display text-giant font-bold leading-[0.9]">The soundtrack.</h2>
        <button
          onClick={toggleAudio}
          aria-pressed={audioOn}
          className="mt-6 inline-flex items-center gap-3 border border-accent px-6 py-3 font-display text-sm font-semibold uppercase tracking-widest2 text-fg transition-colors hover:bg-accent hover:text-ink"
        >
          <span aria-hidden="true">{audioOn ? '❚❚' : '▶'}</span>
          {audioOn ? 'signal live' : 'activate signal'}
        </button>
        <p className="mt-2 font-mono text-[0.65rem] text-faint">
          nothing plays until you say so · sources drop in later
        </p>
      </div>

      {interests.music.map((m) =>
        toneOf(m) === 'loud' ? (
          <LoudStrip key={m.artist} item={m} live={audioOn} />
        ) : (
          <CalmStrip key={m.artist} item={m} live={audioOn} />
        )
      )}
    </Chapter>
  )
}

const loudBars = Array.from({ length: 40 }, (_, i) => 0.15 + seeded(i + 3)() * 0.85)

export function LoudStrip({ item, live }: { item: MusicItem; live: boolean }) {
  const reduced = useReducedMotion()
  return (
    <Strip theme={themes.loud} tag="LOUD">
      {/* jagged aggressive waveform */}
      <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center gap-[2px] px-6 opacity-40">
        {loudBars.map((h, i) => (
          <motion.span
            key={i}
            className="w-full max-w-[8px] flex-1 bg-accent"
            style={{ height: `${h * 90}%` }}
            animate={live && !reduced ? { scaleY: [h, 0.2, h * 1.1, 0.3, h] } : { scaleY: 1 }}
            transition={{ duration: 0.3 + (i % 4) * 0.08, repeat: live && !reduced ? Infinity : 0 }}
          />
        ))}
      </div>
      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:gap-10">
        <div className="flex-1">
          <p className="font-mono text-xs uppercase tracking-widest2 text-accent">signal 01 · full volume</p>
          <h3
            className="mt-2 font-display text-[clamp(2.5rem,10vw,7rem)] font-bold uppercase leading-[0.85] tracking-tight text-fg ph"
            style={reduced ? {} : { textShadow: '3px 0 rgb(var(--accent)/0.8), -3px 0 rgb(0 180 220/0.6)' }}
          >
            {item.artist}
          </h3>
          <p className="mt-3 max-w-md font-serif text-xl text-fg/90 ph">{item.note}</p>
        </div>
        {item.media && (
          <div className="w-full max-w-sm shrink-0 md:w-80">
            <Media media={item.media} ratio="16 / 9" />
            <p className="mt-1 font-mono text-[0.6rem] text-faint">▶ click to play · no autoplay</p>
          </div>
        )}
      </div>
    </Strip>
  )
}

export function CalmStrip({ item, live }: { item: MusicItem; live: boolean }) {
  const reduced = useReducedMotion()
  return (
    <Strip theme={themes.lofi} tag="CALM">
      {/* gentle sine + drifting rain */}
      <svg aria-hidden="true" viewBox="0 0 400 100" preserveAspectRatio="none" className="absolute inset-x-0 bottom-6 h-24 w-full opacity-50">
        <motion.path
          d="M0 50 Q 50 20 100 50 T 200 50 T 300 50 T 400 50"
          fill="none"
          stroke="rgb(var(--accent))"
          strokeWidth="2"
          animate={live && !reduced ? { x: [0, -100, 0] } : {}}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
      {!reduced &&
        [0, 1, 2, 3, 4, 5].map((i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            className="absolute h-6 w-px bg-accent/40"
            style={{ left: `${10 + i * 15}%`, top: '-10%' }}
            animate={{ y: ['0vh', '80vh'], opacity: [0, 0.6, 0] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.7, ease: 'linear' }}
          />
        ))}
      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:gap-10">
        <div className="flex-1">
          <p className="font-mono text-xs uppercase tracking-widest2 text-accent">signal 02 · low & slow</p>
          <h3 className="mt-2 font-serif text-[clamp(2.5rem,10vw,7rem)] font-normal leading-[0.9] tracking-tight text-fg ph">
            {item.artist}
          </h3>
          <p className="mt-3 max-w-md font-serif text-xl text-fg/90 ph">{item.note}</p>
        </div>
        {item.media && (
          <div className="w-full max-w-sm shrink-0 md:w-80">
            <Media media={item.media} ratio="16 / 9" />
            <p className="mt-1 font-mono text-[0.6rem] text-faint">▶ click to play · no autoplay</p>
          </div>
        )}
      </div>
    </Strip>
  )
}

function Strip({ theme, tag, children }: { theme: Theme; tag: string; children: React.ReactNode }) {
  return (
    <div
      style={themeStyle(theme)}
      className={cn(
        'relative isolate flex min-h-[70svh] flex-col justify-center overflow-hidden border-b border-line bg-ink px-[clamp(1.25rem,5vw,6rem)] py-20'
      )}
    >
      <span className="absolute right-4 top-4 font-mono text-[0.6rem] uppercase tracking-widest2 text-faint">{tag}</span>
      {children}
    </div>
  )
}
