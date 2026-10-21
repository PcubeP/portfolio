import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { useExperience } from '@/context/ExperienceContext'
import { interests } from '@/content'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'

/**
 * Persistent audio identity. NEVER autoplays — sound only starts on an explicit
 * user toggle. If a channel has a real `track.src`, it plays; otherwise the UI
 * reflects the channel silently (equaliser still animates as an identity cue).
 */
export function MusicInterface() {
  const { audioOn, toggleAudio, trackIndex, cycleTrack, say } = useExperience()
  const reduced = useReducedMotion()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const channels = interests.music
  const channel = channels[trackIndex % channels.length]
  const src = channel?.track?.src

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    if (audioOn && src) {
      el.volume = 0.5
      el.play().catch(() => {
        say('AUDIO BLOCKED — tap once more to allow', 'info')
      })
    } else {
      el.pause()
    }
  }, [audioOn, src, trackIndex, say])

  return (
    <div className="fixed bottom-4 left-1/2 z-[90] -translate-x-1/2 md:left-auto md:right-4 md:translate-x-0">
      <div className="flex items-center gap-3 border border-line bg-surface/85 px-3 py-2 backdrop-blur-md">
        {/* play / pause */}
        <button
          onClick={() => {
            toggleAudio()
            if (!audioOn && !src) say('SIGNAL: no source loaded yet — this is where the sound lives', 'info')
          }}
          aria-label={audioOn ? 'Pause ambient audio' : 'Play ambient audio'}
          aria-pressed={audioOn}
          className="flex h-7 w-7 items-center justify-center border border-line text-fg transition-colors hover:border-accent hover:text-accent"
        >
          <span aria-hidden="true" className="text-[0.7rem]">{audioOn ? '❚❚' : '▶'}</span>
        </button>

        {/* equaliser */}
        <div aria-hidden="true" className="flex h-5 items-end gap-[2px]">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span
              key={i}
              className={cn('w-[3px]', audioOn ? 'bg-accent' : 'bg-faint')}
              animate={
                audioOn && !reduced
                  ? { height: ['30%', '100%', '45%', '80%', '30%'] }
                  : { height: '30%' }
              }
              transition={{ duration: 0.9 + i * 0.15, repeat: audioOn && !reduced ? Infinity : 0, ease: 'easeInOut' }}
              style={{ height: '30%' }}
            />
          ))}
        </div>

        {/* channel */}
        <div className="min-w-[92px] font-mono text-[0.65rem] leading-tight">
          <div className="text-fg">{channel?.artist ?? 'signal'}</div>
          <div className="text-faint">{audioOn ? (src ? 'now playing' : 'no source · muted') : 'paused'}</div>
        </div>

        {/* next channel */}
        <button
          onClick={cycleTrack}
          aria-label="Next channel"
          className="flex h-7 w-7 items-center justify-center border border-line text-dim transition-colors hover:border-accent hover:text-accent"
        >
          <span aria-hidden="true" className="text-[0.7rem]">⏭</span>
        </button>
      </div>

      {src && <audio ref={audioRef} src={src} loop preload="none" />}
    </div>
  )
}
