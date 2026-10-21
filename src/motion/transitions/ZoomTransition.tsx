import { motion, useTransform, type MotionValue } from 'motion/react'
import { type ReactNode } from 'react'

/**
 * MOTION SYSTEM · ZoomTransition
 * ------------------------------
 * A reusable "camera" move between worlds: as `progress` runs 0→1 the wrapped
 * content pushes toward or away from the viewer with a coordinated blur, so a
 * section recedes like the camera is dollying rather than simply fading. Drop
 * it around any block and feed it a scroll progress MotionValue.
 *
 * `direction`:
 *  - 'in'  — content rushes toward the viewer then settles (enter a world)
 *  - 'out' — content shrinks and blurs away (leave a world)
 */
export function ZoomTransition({
  progress,
  direction = 'in',
  from = 1.12,
  className,
  children,
}: {
  progress: MotionValue<number>
  direction?: 'in' | 'out'
  /** scale the content starts (in) or ends (out) at */
  from?: number
  className?: string
  children: ReactNode
}) {
  const scale = useTransform(
    progress,
    [0, 1],
    direction === 'in' ? [from, 1] : [1, from]
  )
  const blur = useTransform(
    progress,
    [0, 0.5, 1],
    direction === 'in' ? [8, 1, 0] : [0, 1, 8]
  )
  const opacity = useTransform(
    progress,
    [0, 0.15, 0.85, 1],
    direction === 'in' ? [0, 1, 1, 1] : [1, 1, 1, 0]
  )
  const filter = useTransform(blur, (b) => `blur(${b}px)`)

  return (
    <motion.div style={{ scale, filter, opacity }} className={className}>
      {children}
    </motion.div>
  )
}
