import { motion } from 'motion/react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'

/** Accent-tinted progress meter used by skills and gaming affinity. */
export function Meter({ value, label, className }: { value: number; label?: string; className?: string }) {
  const reduced = useReducedMotion()
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="mb-1 flex justify-between font-mono text-[0.7rem] text-dim">
          <span>{label}</span>
          <span className="text-faint">{value}</span>
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden bg-raised" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <motion.div
          className="h-full bg-accent"
          initial={{ width: reduced ? `${value}%` : 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: reduced ? 0 : 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  )
}
