import { useEffect, useState, type RefObject } from 'react'
import { motion, useTransform } from 'motion/react'
import { useSectionScroll } from '@/motion'

/**
 * MorphBall — the single object that ties the Arena together. It arrives from
 * the pool as a rising bubble, becomes a bouncing tennis ball across the clay,
 * then rolls out as a football. ONE always-mounted element, scroll-driven by
 * the whole Arena's progress `g` (not `layoutId`, which can't be scrubbed).
 *
 * Placement gotcha: `<main class="time-distortion">` has `transform: scale()`,
 * so a `fixed` element inside it would resolve against that transformed box,
 * not the viewport. This therefore renders in App's chrome group, a sibling of
 * `<main>`, where `position: fixed` means the viewport. Because each Arena
 * scene is pinned (sticky, filling the viewport) while it is on screen, a
 * viewport-fixed ball lines up with whichever scene is currently pinned.
 *
 * Motion-safe: only transform + opacity animate. Reduced motion → renders
 * nothing (each scene stands on its own).
 */

// g breakpoints and the ball's path through them (fractions of viewport).
const G_X = [0, 0.3, 0.36, 0.63, 0.69, 1]
const X_FRAC = [0.2, 0.24, 0.16, 0.8, 0.82, 0.5]

const G_Y = [0, 0.3, 0.36, 0.42, 0.47, 0.52, 0.56, 0.6, 0.63, 0.69, 1]
// bubble rises (.75→.30), tennis bounces (floor .80, decaying apexes), football rolls (~.74)
const Y_FRAC = [0.75, 0.3, 0.3, 0.8, 0.46, 0.8, 0.6, 0.8, 0.74, 0.74, 0.74]

const G_S = [0, 0.3, 0.36, 0.63, 0.69, 1]
const SIZE = [1.3, 1.3, 1.0, 1.0, 1.7, 1.7]

export function MorphBall({ targetRef }: { targetRef: RefObject<HTMLElement | null> }) {
  const { progress: g, reduced } = useSectionScroll(targetRef)

  const [vp, setVp] = useState(() => ({
    w: typeof window === 'undefined' ? 1280 : window.innerWidth,
    h: typeof window === 'undefined' ? 800 : window.innerHeight,
  }))
  useEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Position in px (rebuilt on resize via vp state so the arrays stay current).
  const x = useTransform(g, G_X, X_FRAC.map((f) => f * vp.w))
  const yN = useTransform(g, G_Y, Y_FRAC) // fraction of height (for shadow math)
  const y = useTransform(yN, (f) => f * vp.h)

  const sx = useTransform(g, G_S, SIZE)
  const sy = useTransform(g, G_S, SIZE)
  const rotate = useTransform(g, [0.63, 1], [0, 540])

  // Cross-fade the three appearances over the handoff windows.
  const bubbleOpacity = useTransform(g, [0, 0.3, 0.36], [1, 1, 0])
  const tennisOpacity = useTransform(g, [0.3, 0.36, 0.63, 0.69], [0, 1, 1, 0])
  const ballOpacity = useTransform(g, [0.63, 0.69, 1], [0, 1, 1])

  // Ground shadow tracks x, tightens/darkens as the ball nears the floor.
  const shadowX = x
  const shadowOpacity = useTransform(yN, [0.3, 0.8], [0.06, 0.34])
  const shadowScale = useTransform(yN, [0.3, 0.8], [0.5, 1])

  // Hide the whole object unless the Arena is actually on screen — `useScroll`
  // clamps `g` to 0/1 outside the target, which would otherwise park the ball
  // in view on every other section.
  const shellOpacity = useTransform(g, [0, 0.02, 0.985, 1], [0, 1, 1, 0])

  if (reduced) return null

  const BASE = 44 // px, before per-phase scale

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[7] overflow-hidden"
      style={{ opacity: shellOpacity }}
    >
      {/* ground shadow */}
      <motion.div
        className="absolute rounded-[50%] bg-black/50 blur-md"
        style={{
          width: BASE * 1.6,
          height: BASE * 0.5,
          top: vp.h * 0.8,
          left: 0,
          x: shadowX,
          translateX: '-50%',
          scale: shadowScale,
          opacity: shadowOpacity,
        }}
      />

      {/* the ball */}
      <motion.div
        className="absolute"
        style={{
          width: BASE,
          height: BASE,
          top: 0,
          left: 0,
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
          scaleX: sx,
          scaleY: sy,
          rotate,
        }}
      >
        {/* bubble */}
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{
            opacity: bubbleOpacity,
            background:
              'radial-gradient(circle at 35% 30%, rgb(226 246 252/0.85), rgb(54 224 208/0.28) 55%, transparent 72%)',
            border: '1px solid rgb(54 224 208/0.6)',
            boxShadow: '0 0 18px rgb(54 224 208/0.5)',
          }}
        />
        {/* tennis ball */}
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{
            opacity: tennisOpacity,
            background: 'radial-gradient(circle at 35% 30%, #eaff6b, #c6e42b 70%)',
            boxShadow: '0 0 12px rgb(198 228 43/0.55)',
          }}
        >
          <span
            className="absolute inset-0 rounded-full"
            style={{
              border: '1.5px solid rgb(255 255 255/0.85)',
              clipPath: 'ellipse(120% 42% at 50% -8%)',
            }}
          />
        </motion.span>
        {/* football */}
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{
            opacity: ballOpacity,
            background:
              'radial-gradient(circle at 35% 30%, #ffffff, #d6d6d6 78%), radial-gradient(circle at 62% 60%, #111 0 14%, transparent 15%), radial-gradient(circle at 30% 68%, #111 0 10%, transparent 11%)',
            boxShadow: 'inset 0 -4px 8px rgb(0 0 0/0.35)',
          }}
        />
      </motion.div>
    </motion.div>
  )
}
