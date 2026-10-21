import { useRef, type ReactNode } from 'react'
import { motion, useSpring, useMotionTemplate } from 'motion/react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'

/**
 * 3D tilt — the element leans toward the cursor with perspective, plus a
 * pointer-tracked sheen. Disabled under reduced motion.
 */
export function Tilt({
  children,
  className,
  max = 10,
  sheen = true,
}: {
  children: ReactNode
  className?: string
  max?: number
  sheen?: boolean
}) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const rx = useSpring(0, { stiffness: 180, damping: 14 })
  const ry = useSpring(0, { stiffness: 180, damping: 14 })
  const gx = useSpring(50, { stiffness: 180, damping: 20 })
  const gy = useSpring(50, { stiffness: 180, damping: 20 })
  const sheenBg = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgb(var(--accent)/0.25), transparent 55%)`

  if (reduced) return <div className={className}>{children}</div>

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    ry.set(px * max)
    rx.set(-py * max)
    gx.set((px + 0.5) * 100)
    gy.set((py + 0.5) * 100)
  }
  const reset = () => {
    rx.set(0)
    ry.set(0)
    gx.set(50)
    gy.set(50)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900, transformStyle: 'preserve-3d' }}
      className={cn('relative', className)}
    >
      {children}
      {sheen && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: sheenBg, mixBlendMode: 'soft-light' }}
        />
      )}
    </motion.div>
  )
}
