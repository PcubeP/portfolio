import * as THREE from 'three'

/**
 * THE JOURNEY — the camera's flight path through the world, and the separate
 * path its gaze follows. Two decoupled Catmull-Rom curves let the drone fly
 * forward while looking sideways / down / at an object.
 *
 * Coordinates are metres, Y up. The camera generally travels along -Z while
 * weaving in X and diving/rising in Y. Each world anchors its geometry by
 * SAMPLING this curve at its own `t`, so environments always sit exactly where
 * the camera flies — the authored points below only shape the path.
 */

// prettier-ignore
const POSITION_POINTS: [number, number, number][] = [
  [  0, 2.6,   52], // identity — down in the lane, looking up the corridor
  [  0,  4,   30], // descend toward journey
  [ -3, 3.5,  16], // journey — timeline corridor
  [ -7, 4.5,   0], // creations — gallery, veered left
  [ -3,  4,  -16], // bank back toward the arena
  [  0, 3.2, -28], // pool — skim above the water
  [  0,-0.4, -37], // POOL DIVE — pierce the surface (water at y≈0)
  [0.5,-3.6, -46], // underwater — glide along the lanes
  [  5, 2.2, -55], // breach — rise out of the pool
  [ 15, 4.5, -66], // tennis — rise over the clay, move laterally
  [ 26, 3.2, -79], // football — roll out onto the pitch
  [ 34, 4.2, -92], // worlds — dioramas
  [ 40, 2.2,-104], // pop culture — approach the television
  [41.6,1.7,-110], // SCREEN ENTRY — into the glass
  [ 44, 1.7,-117], // inside the broadcast — channels
  [ 52, 3.2,-127], // arcade
  [ 60, 2.6,-138], // connect — the desk / terminal
]

// prettier-ignore
const LOOK_POINTS: [number, number, number][] = [
  [  0, 5.2,   30],
  [ -3, 3.5,  16],
  [ -7, 4.5,   0],
  [ -3,  4,  -16],
  [  0, 3.2, -28],
  [  0, -1,  -37], // begin tilting down toward the water
  [  0, -6,  -44], // DOWN, into the water
  [1.5,-3.8, -56], // forward along the lanes
  [ 10,  3,  -60], // up toward the tennis court
  [ 18, 0.8, -70], // DOWN at the court / ball
  [ 30, 2.5, -85],
  [ 37,  3,  -98],
  [41.6,1.7,-111], // at the TV screen centre
  [ 44, 1.7,-117], // into the screen
  [ 48, 1.7,-122],
  [ 56,  3, -132],
  [ 64, 2.4,-143],
]

const toVec = (p: [number, number, number]) => new THREE.Vector3(p[0], p[1], p[2])

/** Camera position path — centripetal Catmull-Rom avoids cusps at sharp turns. */
export const posCurve = new THREE.CatmullRomCurve3(
  POSITION_POINTS.map(toVec),
  false,
  'centripetal',
  0.5
)

/** Look-at target path — decoupled from position for cinematic gaze control. */
export const lookCurve = new THREE.CatmullRomCurve3(
  LOOK_POINTS.map(toVec),
  false,
  'centripetal',
  0.5
)

export interface WorldRange {
  id: string
  /** normalized [start, end] along the flight, 0..1 */
  range: [number, number]
}

/**
 * Each content chapter owns a contiguous slice of the flight. Arena is widest
 * (pool dive → underwater → breach → tennis → football); pop culture spans the
 * CRT approach, the screen entry and the channels.
 */
export const WORLDS: WorldRange[] = [
  { id: 'identity', range: [0.0, 0.09] },
  { id: 'journey', range: [0.09, 0.2] },
  { id: 'creations', range: [0.2, 0.3] },
  { id: 'arena', range: [0.3, 0.6] },
  { id: 'worlds', range: [0.6, 0.69] },
  { id: 'popculture', range: [0.69, 0.86] },
  { id: 'arcade', range: [0.86, 0.93] },
  { id: 'connect', range: [0.93, 1.0] },
]

/** Sub-beat parameters inside the arena, in global `t`. */
export const ARENA_BEATS = {
  poolApproach: 0.31,
  poolDive: 0.37,
  underwater: 0.42,
  breach: 0.47,
  tennis: 0.52,
  football: 0.575,
}

/** Sub-beat parameters inside pop culture, in global `t`. */
export const CRT_BEATS = {
  approach: 0.72,
  screenEntry: 0.79,
  channels: 0.83,
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

/** Which world contains this `t`. */
export function worldIdAt(t: number): string {
  const c = clamp01(t)
  for (const w of WORLDS) {
    if (c >= w.range[0] && c < w.range[1]) return w.id
  }
  return WORLDS[WORLDS.length - 1].id
}

/** Midpoint `t` of a world (used for hero framings + nav jumps). */
export function worldMidT(id: string): number {
  const w = WORLDS.find((x) => x.id === id)
  if (!w) return 0
  return (w.range[0] + w.range[1]) / 2
}

/** A world's [start, end] range in global t (for proximity-gated asset loading). */
export function worldRange(id: string): [number, number] {
  const w = WORLDS.find((x) => x.id === id)
  return w ? w.range : [0, 1]
}

/** 0→1 progress of `t` within a world's own range (clamped). */
export function localProgress(t: number, id: string): number {
  const w = WORLDS.find((x) => x.id === id)
  if (!w) return 0
  const [a, b] = w.range
  return clamp01((t - a) / (b - a))
}

const _pos = new THREE.Vector3()
/** World-space camera position at `t`. Reused temp — clone if you retain it. */
export function positionAt(t: number, out = _pos): THREE.Vector3 {
  return posCurve.getPointAt(clamp01(t), out)
}

const _look = new THREE.Vector3()
/** World-space look target at `t`. Reused temp — clone if you retain it. */
export function lookAt(t: number, out = _look): THREE.Vector3 {
  return lookCurve.getPointAt(clamp01(t), out)
}
