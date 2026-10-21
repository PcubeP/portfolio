import { useLayoutEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { worldFx, ramp } from '@/world/worldFx'

/**
 * THE REVEAL SYSTEM — one deterministic-in-t proximity driver (worldFx.t, the
 * flown parameter) plus a per-world consumer. A world is culled (0 draw calls)
 * until the drone approaches, EMERGES out of the fog as it nears, holds while
 * flown through, then is SWALLOWED behind as it passes. Adjacent worlds share
 * their seam so every transition is a crossfade of two co-present worlds along
 * the same continuous spline — the camera path never cuts. This is what gives
 * each stage genuine suspense and keeps distant signage from cluttering the
 * frame ahead.
 */

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

/**
 * Pure reveal factor for a world spanning [a,b] in global t.
 *  - <a-lead : 0 (culled)
 *  - a-lead→a: 0→1 (emerge from haze)
 *  - a→b     : 1 (fully present)
 *  - b→b+trail: 1→0 (swallowed behind)
 */
export function revealAt(
  t: number,
  [a, b]: [number, number],
  lead: number,
  trail: number
): number {
  const emerge = lead > 0 ? ramp(t, a - lead, a) : t >= a ? 1 : 0
  const swallow = trail > 0 ? ramp(t, b, b + trail) : t >= b ? 1 : 0
  return clamp01(Math.min(emerge, 1 - swallow))
}

export interface RevealOpts {
  lead?: number
  trail?: number
  /** keep the group mounted+visible even at factor 0 (for offscreen sims). */
  keepMounted?: boolean
}

type FadeMat = THREE.Material & { opacity: number }

/**
 * Returns a ref to attach to a world's root <group>. Caches its materials +
 * lights once (setting `transparent` up-front so opacity animation never
 * triggers a mid-flight shader recompile) then fades opacity + light intensity
 * together with the reveal factor. Lights are FADED, not snapped, so a culling
 * world never flashes its neighbour. StrictMode-safe (caches reset on cleanup).
 */
export function useReveal(
  range: [number, number],
  { lead = 0.05, trail = 0.045, keepMounted = false }: RevealOpts = {}
) {
  const ref = useRef<THREE.Group>(null)
  const mats = useRef<{ m: FadeMat; base: number }[]>([])
  const lights = useRef<{ l: THREE.Light; base: number }[]>([])
  const applied = useRef(-1)
  const scanned = useRef(false)

  const scan = () => {
    const g = ref.current
    if (!g) return
    const ms: { m: FadeMat; base: number }[] = []
    const ls: { l: THREE.Light; base: number }[] = []
    g.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (mesh.material) {
        const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        for (const raw of list) {
          const m = raw as FadeMat
          m.transparent = true // set ONCE up-front — no mid-flight recompile
          ms.push({ m, base: m.opacity })
        }
      }
      const l = o as THREE.Light
      if (l.isLight) ls.push({ l, base: l.intensity })
    })
    mats.current = ms
    lights.current = ls
  }

  useLayoutEffect(() => {
    scan()
    scanned.current = mats.current.length > 0
    return () => {
      mats.current = []
      lights.current = []
      scanned.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame(() => {
    const g = ref.current
    if (!g) return
    // troika <Text> builds its material async → re-scan once if we came up short.
    if (!scanned.current) {
      scan()
      if (mats.current.length > 0) scanned.current = true
    }
    const f = revealAt(worldFx.t, range, lead, trail)
    if (f === applied.current) return
    applied.current = f
    const vis = keepMounted || f > 0.001
    g.visible = vis
    if (!vis) return
    for (const { m, base } of mats.current) m.opacity = base * f
    for (const { l, base } of lights.current) l.intensity = base * f
  })

  return ref
}

/** Declarative wrapper so WorldCanvas stays readable. */
export function Reveal({
  range,
  opts,
  children,
}: {
  range: [number, number]
  opts?: RevealOpts
  children: React.ReactNode
}) {
  const ref = useReveal(range, opts)
  return <group ref={ref}>{children}</group>
}
