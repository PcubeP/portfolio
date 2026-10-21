import { motion } from 'motion/react'
import { GlitchText } from './GlitchText'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'

/**
 * A cinematic "match cut" between chapters: a white frame-flash followed by
 * an iris wipe (like a camera aperture) opening onto the next chapter's
 * designation. Plays once, the moment it scrolls into view.
 */
export function ShutterWipe({
  index,
  label,
  className,
}: {
  index: string
  label: string
  className?: string
}) {
  const reduced = useReducedMotion()

  if (reduced) {
    return (
      <div className={cn('wrap flex items-center gap-4 py-6', className)} aria-hidden="true">
        <span className="h-px flex-1 bg-line" />
        <span className="font-mono text-[0.65rem] uppercase tracking-widest2 text-faint">
          {index} — {label}
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden py-10', className)} aria-hidden="true">
      {/* frame flash */}
      <motion.div
        className="pointer-events-none absolute inset-0 bg-fg"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: [0, 0.9, 0] }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.7, times: [0, 0.12, 1], ease: 'easeOut' }}
      />
      {/* iris reveal */}
      <div className="wrap relative flex items-center justify-center">
        <motion.div
          initial={{ clipPath: 'circle(0% at 50% 50%)' }}
          whileInView={{ clipPath: 'circle(75% at 50% 50%)' }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="grid place-items-center"
        >
          <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-widest2 text-dim">
            <span className="h-px w-10 bg-accent" />
            <span className="text-accent">{index}</span>
            <GlitchText text={label} className="text-lg text-fg" decodeOnMount={false} />
            <span className="h-px w-10 bg-accent" />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
