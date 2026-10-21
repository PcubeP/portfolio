import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { easing } from 'maath'
import * as THREE from 'three'
import {
  posCurve,
  positionAt,
  lookAt as lookAtT,
  worldMidT,
  worldIdAt,
} from '@/world/spline'
import {
  FLIGHT_SPRING,
  WATER_SPRING,
  makeSpring,
  springStep,
  bankRoll,
  angleDelta,
} from '@/world/droneDynamics'
import { worldFx, resetWorldFx, ramp } from '@/world/worldFx'
import { ARENA_BEATS, CRT_BEATS } from '@/world/spline'

/**
 * A look-target override any world can write into to steer the camera's gaze
 * (e.g. the tennis ball chase). `weight` 0 = follow the spline, 1 = fully at
 * `target`. Worlds set it in their own frame loop; the rig blends and decays it.
 */
export const lookOverride = {
  target: new THREE.Vector3(),
  weight: 0,
}

function readPointer(axis: '--pxn' | '--pyn'): number {
  const raw = document.documentElement.style.getPropertyValue(axis)
  const n = parseFloat(raw)
  return Number.isFinite(n) ? n : 0
}

/**
 * CameraRig — turns scroll into a flown camera.
 *
 * Full motion: spring-integrate the scroll parameter (momentum + overshoot),
 * sample the position + look curves, exponentially damp the camera toward them
 * (position leads, gaze lags → "head turns after body"), bank into turns, and
 * add a few degrees of pointer-driven look-around.
 *
 * Reduced motion: no springs, no damping — snap to the nearest world's hero
 * framing on scroll, render on demand only.
 */
export function CameraRig({
  targetT,
  reduced,
}: {
  targetT: React.MutableRefObject<number>
  reduced: boolean
}) {
  const camera = useThree((s) => s.camera)
  const invalidate = useThree((s) => s.invalidate)

  const spring = useMemo(() => makeSpring(targetT.current), [targetT])
  const lookPos = useRef(new THREE.Vector3())
  const roll = useRef(0)
  const prevHeading = useRef<number | null>(null)
  const initialized = useRef(false)

  // temps (never allocate in the frame loop)
  const tmpPos = useMemo(() => new THREE.Vector3(), [])
  const tmpLook = useMemo(() => new THREE.Vector3(), [])
  const tmpTan = useMemo(() => new THREE.Vector3(), [])

  // Reduced motion renders on demand — nudge a frame whenever scroll moves.
  useEffect(() => {
    if (!reduced) return
    const onScroll = () => invalidate()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [reduced, invalidate])

  // FX bus is frame-loop state — start clean on (re)mount, e.g. StrictMode.
  useEffect(() => resetWorldFx, [])

  // Dev-only: expose the live FX bus + camera so the screenshot harness can log
  // the real settled flight parameter / world-space position at each stop.
  useEffect(() => {
    if (import.meta.env.DEV) {
      ;(window as unknown as { __fx?: typeof worldFx; __cam?: THREE.Camera }).__fx = worldFx
      ;(window as unknown as { __fx?: typeof worldFx; __cam?: THREE.Camera }).__cam = camera
    }
  }, [camera])

  useFrame((_, dt) => {
    if (reduced) {
      // Snap to the nearest world's hero framing — a still diorama.
      const id = worldIdAt(targetT.current)
      const mid = worldMidT(id)
      worldFx.t = mid // exactly one world at reveal factor 1 → clean static diorama
      positionAt(mid, tmpPos)
      lookAtT(mid, tmpLook)
      camera.position.copy(tmpPos)
      camera.up.set(0, 1, 0)
      camera.lookAt(tmpLook)
      return
    }

    // 1. momentum on the path parameter itself
    const cfg = worldIdAt(spring.value) === 'arena' ? WATER_SPRING : FLIGHT_SPRING
    const t = springStep(spring, targetT.current, dt, cfg)
    worldFx.t = t // publish the flown parameter for the proximity reveal

    // drive the screen-space effect scalars from where we are on the flight
    worldFx.time += dt
    worldFx.submergence =
      ramp(t, ARENA_BEATS.poolDive - 0.02, ARENA_BEATS.underwater) *
      (1 - ramp(t, ARENA_BEATS.breach - 0.03, ARENA_BEATS.breach + 0.01))
    worldFx.droplets =
      ramp(t, ARENA_BEATS.breach - 0.015, ARENA_BEATS.breach + 0.005) *
      (1 - ramp(t, ARENA_BEATS.breach + 0.01, ARENA_BEATS.breach + 0.05))
    worldFx.crtEntry =
      ramp(t, CRT_BEATS.approach + 0.03, CRT_BEATS.screenEntry) *
      (1 - ramp(t, 0.86, 0.89))

    // 2. sample the two curves
    positionAt(t, tmpPos)
    lookAtT(t, tmpLook)

    if (!initialized.current) {
      camera.position.copy(tmpPos)
      lookPos.current.copy(tmpLook)
      initialized.current = true
    }

    // 3. damp camera toward position (lead) and gaze toward look (lag)
    easing.damp3(camera.position, tmpPos, 0.22, dt)
    easing.damp3(lookPos.current, tmpLook, 0.34, dt)

    // blend in any world look-override (e.g. ball chase), then decay it
    if (lookOverride.weight > 0.001) {
      lookPos.current.lerp(lookOverride.target, Math.min(1, lookOverride.weight))
      lookOverride.weight *= 0.9
    }

    // 4. banking from horizontal heading change
    posCurve.getTangentAt(Math.max(0, Math.min(1, t)), tmpTan)
    const heading = Math.atan2(tmpTan.x, tmpTan.z)
    let targetRoll = 0
    if (prevHeading.current !== null && dt > 0) {
      const dHeading = angleDelta(prevHeading.current, heading) / dt
      targetRoll = bankRoll(dHeading * 0.016)
    }
    prevHeading.current = heading
    easing.damp(roll, 'current', targetRoll, 0.3, dt)

    // 5. orient: look, roll into the turn, then a little pointer look-around
    camera.up.set(0, 1, 0)
    camera.lookAt(lookPos.current)
    camera.rotateZ(roll.current)
    camera.rotateY(readPointer('--pxn') * 0.05)
    camera.rotateX(-readPointer('--pyn') * 0.04)
  })

  return null
}
