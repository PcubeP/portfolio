import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { chapters } from '@/content'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/** Elapsed session time as a film-style HH:MM:SS:FF timecode, ticking at ~12fps. */
function useTimecode() {
  const [tc, setTc] = useState('00:00:00:00')
  useEffect(() => {
    const start = performance.now()
    const id = window.setInterval(() => {
      const ms = performance.now() - start
      const totalSec = Math.floor(ms / 1000)
      const h = String(Math.floor(totalSec / 3600)).padStart(2, '0')
      const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0')
      const s = String(totalSec % 60).padStart(2, '0')
      const f = String(Math.floor((ms % 1000) / (1000 / 24))).padStart(2, '0')
      setTc(`${h}:${m}:${s}:${f}`)
    }, 83)
    return () => window.clearInterval(id)
  }, [])
  return tc
}

/**
 * Permanent anamorphic letterbox bars + lens vignette — the whole site reads
 * like it's being projected, not rendered. Corner readouts (REC, chapter,
 * running timecode) reinforce the "director's monitor" feel. Purely
 * decorative: aria-hidden and pointer-events-none throughout.
 */
export function CinematicFrame({ activeId }: { activeId: string }) {
  const reduced = useReducedMotion()
  const tc = useTimecode()
  const active = chapters.find((c) => c.id === activeId) ?? chapters[0]

  const barTransition = {
    duration: reduced ? 0 : 1.6,
    ease: [0.16, 1, 0.3, 1] as const,
    delay: reduced ? 0 : 0.2,
  }

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[104]">
      <div className="lens-vignette absolute inset-0" />

      <motion.div
        initial={{ height: 0 }}
        animate={{ height: 'clamp(16px, 2.6vh, 30px)' }}
        transition={barTransition}
        className="cine-bar cine-bar-top overflow-hidden"
      >
        <div className="hidden h-full items-center justify-between px-4 font-mono text-[0.6rem] tracking-widest2 text-faint sm:flex">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[rgb(214,44,58)]" />
            REC · CH.{active.index}
          </span>
          <span>2.39:1</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ height: 0 }}
        animate={{ height: 'clamp(16px, 2.6vh, 30px)' }}
        transition={barTransition}
        className="cine-bar cine-bar-bottom overflow-hidden"
      >
        <div className="hidden h-full items-center justify-between px-4 font-mono text-[0.6rem] tracking-widest2 text-faint sm:flex">
          <span>{active.label}</span>
          <span className="text-accent">{tc}</span>
        </div>
      </motion.div>
    </div>
  )
}
