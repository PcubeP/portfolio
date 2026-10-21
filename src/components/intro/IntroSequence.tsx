import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useExperience } from '@/context/ExperienceContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { profile } from '@/content'
import { Magnetic } from '@/components/shared/Magnetic'

const BOOT: { label: string; note: string }[] = [
  { label: 'INITIALISING SYSTEM', note: 'personal.kernel' },
  { label: 'LOADING MEMORIES', note: 'fragments · photos · sound' },
  { label: 'MOUNTING INTERESTS', note: 'tech · sport · play · film · music' },
  { label: 'DECODING EXPERIENCE', note: 'journey.map' },
  { label: 'ESTABLISHING CONNECTION', note: 'handshake · ok' },
]

/**
 * Opening sequence. A short boot ritual, then "CONNECTION ESTABLISHED".
 * A SKIP control is visible from the first frame — the user is never trapped.
 * With reduced motion, the whole thing renders instantly with an ENTER button.
 */
export function IntroSequence() {
  const { entered, enter } = useExperience()
  const reduced = useReducedMotion()
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const scattered = useRef(scatter(profile.fragments))

  useEffect(() => {
    if (reduced) {
      setStep(BOOT.length)
      setDone(true)
      return
    }
    if (step < BOOT.length) {
      const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 500 : 650)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setDone(true), 500)
    return () => clearTimeout(t)
  }, [step, reduced])

  // Allow Enter / Escape / Space to continue at any time.
  useEffect(() => {
    if (entered) return
    const onKey = (e: KeyboardEvent) => {
      if (['Enter', 'Escape', ' '].includes(e.key)) {
        e.preventDefault()
        enter()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [entered, enter])

  return (
    <AnimatePresence>
      {!entered && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-ink"
          exit={{ opacity: 0, transition: { duration: 0.7, ease: [0.7, 0, 0.3, 1] } }}
          role="dialog"
          aria-label="Intro sequence"
          aria-live="polite"
        >
          {/* scattered interest fragments */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {scattered.current.map((f, i) => (
              <motion.span
                key={f.text + i}
                className="absolute font-mono text-[0.7rem] uppercase tracking-widest2 text-faint"
                style={{ left: `${f.x}%`, top: `${f.y}%` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: reduced ? 0.4 : [0, 0.55, 0.2, 0.5] }}
                transition={{ duration: 3, delay: i * 0.15, repeat: reduced ? 0 : Infinity, repeatType: 'reverse' }}
              >
                {f.text}
              </motion.span>
            ))}
          </div>

          {/* corner coordinates / system chrome */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-6 font-mono text-[0.6rem] text-faint">
            <span className="absolute left-0 top-0">SYS://personal-universe</span>
            <span className="absolute right-0 top-0">{profile.coordinates}</span>
            <span className="absolute bottom-0 left-0">v0.1 · prototype</span>
            <span className="absolute bottom-0 right-0">{profile.status}</span>
          </div>

          <div className="relative z-10 w-[min(520px,86vw)]">
            <div className="mb-6 flex items-center justify-between">
              <span className="eyebrow">SYSTEM BOOT</span>
              <button
                onClick={enter}
                className="group flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-widest2 text-dim transition-colors hover:text-fg"
              >
                skip
                <span className="inline-block h-3 w-3 border border-dim transition-colors group-hover:border-accent group-hover:bg-accent" />
              </button>
            </div>

            <ul className="space-y-2.5">
              {BOOT.map((b, i) => {
                const state = i < step ? 'ok' : i === step ? 'run' : 'idle'
                return (
                  <li
                    key={b.label}
                    className="flex items-center gap-3 font-mono text-xs"
                    style={{ opacity: state === 'idle' ? 0.25 : 1, transition: 'opacity 300ms' }}
                  >
                    <span className={state === 'ok' ? 'text-accent' : 'text-dim'}>
                      {state === 'ok' ? '[■]' : state === 'run' ? '[▸]' : '[ ]'}
                    </span>
                    <span className="text-fg">{b.label}</span>
                    <span className="ml-auto text-faint">{b.note}</span>
                  </li>
                )
              })}
            </ul>

            <div className="mt-6 h-px w-full bg-line">
              <motion.div
                className="h-full bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${(step / BOOT.length) * 100}%` }}
                transition={{ ease: 'linear', duration: 0.4 }}
              />
            </div>

            <AnimatePresence>
              {done && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 flex flex-col items-center gap-4"
                >
                  <p className="text-center font-mono text-xs text-accent">
                    CONNECTION ESTABLISHED
                  </p>
                  <Magnetic strength={0.45}>
                    <button
                      onClick={enter}
                      data-cursor-label="enter"
                      className="accent-glow group relative overflow-hidden border border-accent px-8 py-3 font-display text-sm font-semibold uppercase tracking-widest2 text-fg transition-colors hover:bg-accent hover:text-ink"
                    >
                      Enter
                    </button>
                  </Magnetic>
                  <p className="font-mono text-[0.6rem] text-faint">press enter · esc · or click</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function scatter(words: string[]) {
  // deterministic-ish spread around the edges
  return words.map((text, i) => {
    const angle = (i / words.length) * Math.PI * 2
    const r = 32 + (i % 3) * 6
    return {
      text,
      x: 50 + Math.cos(angle) * r,
      y: 50 + Math.sin(angle) * (r * 0.7),
    }
  })
}
