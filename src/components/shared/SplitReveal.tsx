import { motion, useInView } from 'motion/react'
import { useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'

/**
 * SplitReveal — splits text by words, each word rises from below its own
 * overflow:hidden clip, staggered. Much more cinematic than a single fade-in.
 * Collapses to a plain span under prefers-reduced-motion.
 */
export function SplitReveal({
  text,
  className,
  wordClassName,
  stagger = 0.05,
  delay = 0,
  once = true,
}: {
  text: string
  className?: string
  wordClassName?: string
  stagger?: number
  delay?: number
  once?: boolean
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()
  const inView = useInView(ref, { once, amount: 0.4 })

  if (reduced) {
    return <span className={className}>{text}</span>
  }

  const words = text.split(' ')

  return (
    <span ref={ref} className={cn('inline', className)} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden leading-[1.15]"
          aria-hidden="true"
        >
          <motion.span
            className={cn('inline-block', wordClassName)}
            initial={{ y: '105%', opacity: 0 }}
            animate={inView ? { y: '0%', opacity: 1 } : { y: '105%', opacity: 0 }}
            transition={{
              duration: 0.65,
              delay: delay + i * stagger,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && '\u00a0'}
        </span>
      ))}
    </span>
  )
}
