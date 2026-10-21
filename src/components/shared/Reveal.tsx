import { motion, type Variants } from 'motion/react'
import { type ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface RevealProps {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  as?: 'div' | 'li' | 'span' | 'section'
  once?: boolean
}

/** Fade + rise into view. Collapses to a plain fade when motion is reduced. */
export function Reveal({ children, delay = 0, y = 28, className, once = true }: RevealProps) {
  const reduced = useReducedMotion()
  const variants: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : y },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0.2 : 0.7, delay: reduced ? 0 : delay, ease: [0.16, 1, 0.3, 1] },
    },
  }
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.25 }}
    >
      {children}
    </motion.div>
  )
}
