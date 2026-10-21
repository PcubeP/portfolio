/**
 * MOTION SYSTEM · easing + durations
 * ----------------------------------
 * The signature out-ease `[0.16, 1, 0.3, 1]` was already used ad-hoc across the
 * codebase (Reveal, ShutterWipe, CinematicFrame); it lives here now as the one
 * source of truth. `GRAVITY` accelerates into the floor for falling objects.
 */
import { cubicBezier } from 'motion/react'

/** The house out-ease — decisive, slightly overshooting deceleration. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const

/** Symmetric ease for travel that starts and ends at rest. */
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const

/** Accelerate-into-floor, for a falling / dropping object. */
export const GRAVITY = cubicBezier(0.4, 0, 1, 1)

/** Ease-out-back-ish for a launched object leaving the floor. */
export const LAUNCH = cubicBezier(0, 0, 0.3, 1)

export const DURATION = { fast: 0.25, base: 0.7, slow: 1.6 } as const
