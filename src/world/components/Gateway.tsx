import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { posCurve, positionAt } from '@/world/spline'
import { worldFx } from '@/world/worldFx'

/**
 * Gateway — a reusable diegetic veil dropped at a "dry" world seam (one with no
 * literal transition like the pool dive or CRT glass). A thin additive ring the
 * drone flies THROUGH; it flares as it is crossed so the boundary reads as
 * passing from one space into the next rather than a hard cut. Oriented to the
 * flight tangent and positioned on the spline, so it always frames the path.
 */
const FORWARD = new THREE.Vector3(0, 0, 1)

export function Gateway({
  t,
  accent,
  radius = 6,
  reduced = false,
}: {
  t: number
  accent: THREE.Color
  radius?: number
  reduced?: boolean
}) {
  const ref = useRef<THREE.Mesh>(null)

  const { pos, quat } = useMemo(() => {
    const p = positionAt(t).clone()
    const tan = posCurve.getTangentAt(Math.max(0, Math.min(1, t)), new THREE.Vector3())
    const q = new THREE.Quaternion().setFromUnitVectors(FORWARD, tan)
    return { pos: p, quat: q }
  }, [t])

  useFrame(() => {
    const m = ref.current
    if (!m) return
    const f = reduced ? 0 : 1 - Math.min(1, Math.abs(worldFx.t - t) / 0.04)
    m.visible = f > 0.001
    ;(m.material as THREE.MeshBasicMaterial).opacity = f
    const s = 1 + f * 0.4
    m.scale.set(s, s, 1)
  })

  return (
    <mesh ref={ref} position={pos} quaternion={quat} visible={false}>
      <torusGeometry args={[radius, 0.12, 8, 48]} />
      <meshBasicMaterial
        color={accent}
        transparent
        opacity={0}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}
