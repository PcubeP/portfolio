import * as THREE from 'three'

/**
 * WORLD FX BUS — a tiny mutable bridge between the camera rig (which knows where
 * the drone is along the flight) and the screen-space postprocessing effects
 * (which need scalar "how submerged / how far into the screen are we" drivers).
 *
 * Using a module singleton rather than React state keeps this entirely inside
 * the frame loop: the rig writes these each frame, the effect components read
 * them into shader uniforms — no re-renders, no prop threading through <Canvas>.
 * Reset on teardown so a StrictMode remount starts clean.
 */
export const worldFx = {
  /** 0 above water → 1 fully underwater (drives DiveEffect refraction/darkening). */
  submergence: 0,
  /** 0 outside → 1 inside the CRT (drives CRTEffect scanlines/curvature/noise). */
  crtEntry: 0,
  /** transient lens droplets after breaching the pool surface, decays to 0. */
  droplets: 0,
  /** seconds, advanced by the rig so effects animate without their own clock. */
  time: 0,
  /** the SMOOTHED flown path parameter (springStep result), 0..1. Drives the
   *  proximity reveal so worlds cull/emerge/swallow with the actual drone and
   *  re-hide correctly when scrubbing scroll backward. */
  t: 0,
}

export function resetWorldFx() {
  worldFx.submergence = 0
  worldFx.crtEntry = 0
  worldFx.droplets = 0
  worldFx.time = 0
  worldFx.t = 0
}

/** Smoothstep ramp helper for building the scalar drivers from `t`. */
export function ramp(x: number, a: number, b: number): number {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}
