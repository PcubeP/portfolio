import { AnimatePresence, motion } from 'motion/react'
import { useExperience } from '@/context/ExperienceContext'
import { cn } from '@/lib/cn'

/** Personality/system toasts — top-centre, self-dismissing, screen-reader live. */
export function SystemMessages() {
  const { messages, dismiss } = useExperience()
  return (
    <div
      className="pointer-events-none fixed left-1/2 top-3 z-[115] flex w-[min(440px,90vw)] -translate-x-1/2 flex-col gap-2"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence>
        {messages.map((m) => (
          <motion.button
            key={m.id}
            layout
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            onClick={() => dismiss(m.id)}
            className={cn(
              'pointer-events-auto flex items-center gap-2 border bg-surface/90 px-3 py-2 text-left font-mono text-[0.7rem] backdrop-blur-md',
              m.tone === 'egg' ? 'border-accent text-accent' : 'border-line text-dim'
            )}
          >
            <span aria-hidden="true">{m.tone === 'egg' ? '★' : '›'}</span>
            <span className="text-fg">{m.text}</span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  )
}
