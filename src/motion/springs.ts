/**
 * MOTION SYSTEM · springs
 * -----------------------
 * Named spring configs, one per physical metaphor, so every world moves with a
 * consistent — but object-appropriate — feel. A ball is not water; a card is not
 * a CRT. Import these instead of hand-tuning stiffness/damping per component.
 *
 * Shape matches Motion's `Transition` spring options.
 */
/**
 * Numeric spring config. Motion auto-selects a spring whenever stiffness/
 * damping are present, so these objects work both as a `useSpring` config
 * (SpringOptions) and as a `Transition` in `animate`/`whileInView` props — no
 * explicit `type: 'spring'` needed.
 */
export interface Spring {
  stiffness: number
  damping: number
  mass: number
}

/** Heavy, fluid, slow settle — water, submersion, buoyancy. */
export const WATER: Spring = { stiffness: 42, damping: 22, mass: 1.3 }

/** Snappy with a touch of overshoot — a struck, bouncing ball. */
export const BALL: Spring = { stiffness: 320, damping: 18, mass: 0.7 }

/** Crisp UI reveals — cards, panels, content settling in. */
export const CARD: Spring = { stiffness: 200, damping: 26, mass: 0.5 }

/** Hard, fast snap — CRT channel changes, electronic switching. */
export const CRT: Spring = { stiffness: 520, damping: 30, mass: 0.4 }

/** Default scroll-progress smoothing — takes the jitter off raw scroll. */
export const SMOOTH: Spring = { stiffness: 100, damping: 30, mass: 0.5 }

export const SPRING = { WATER, BALL, CARD, CRT, SMOOTH } as const
