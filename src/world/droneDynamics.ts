/**
 * DRONE DYNAMICS — the physics that make the camera feel flown, not scripted.
 *
 * Two layers combine in the rig:
 *   1. `springStep` integrates the scroll parameter `t` with momentum — genuine
 *      acceleration, deceleration and a touch of overshoot easing into rest.
 *   2. exponential damping of the actual position/look toward the sampled point
 *      (see maath `damp3` in the rig) adds the trailing lag.
 * On top of that, `bankRoll` tilts the camera into horizontal turns.
 *
 * Spring configs echo the shapes in `@/motion/springs` but are tuned for a
 * scalar path parameter rather than a UI value — slightly under-damped so the
 * drone overshoots a hair and settles, never bouncy enough to nauseate.
 */

export interface SpringScalar {
  value: number
  velocity: number
}

export interface SpringConfig {
  stiffness: number
  damping: number
  mass: number
}

/** Gentle overshoot (damping ratio ≈ 0.9) — the default flight feel. */
export const FLIGHT_SPRING: SpringConfig = { stiffness: 45, damping: 12, mass: 1 }

/** Heavier, slower settle for the underwater leg. */
export const WATER_SPRING: SpringConfig = { stiffness: 26, damping: 11, mass: 1.3 }

export function makeSpring(initial = 0): SpringScalar {
  return { value: initial, velocity: 0 }
}

/**
 * Semi-implicit Euler spring step toward `target`. Mutates and returns `s.value`.
 * `dt` is clamped so a dropped frame can't launch the camera.
 */
export function springStep(
  s: SpringScalar,
  target: number,
  dt: number,
  cfg: SpringConfig
): number {
  const h = Math.min(dt, 1 / 30)
  const force = -cfg.stiffness * (s.value - target)
  const damping = -cfg.damping * s.velocity
  const accel = (force + damping) / cfg.mass
  s.velocity += accel * h
  s.value += s.velocity * h
  return s.value
}

const TWO_PI = Math.PI * 2

/** Shortest signed angular difference a→b, in (-π, π]. */
export function angleDelta(a: number, b: number): number {
  let d = (b - a) % TWO_PI
  if (d > Math.PI) d -= TWO_PI
  if (d < -Math.PI) d += TWO_PI
  return d
}

/**
 * Roll (bank) to apply given how fast the camera's horizontal heading is
 * turning. Positive turn → bank into it. Result is clamped and meant to be
 * damped by the caller so it eases in and out of turns.
 */
export function bankRoll(headingDelta: number, gain = 6, maxRad = 0.22): number {
  const roll = -headingDelta * gain
  return Math.max(-maxRad, Math.min(maxRad, roll))
}
