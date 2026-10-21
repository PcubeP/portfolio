import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Signage } from '@/world/components/Signage'
import { usePBR } from '@/world/materials/usePBR'
import { interests } from '@/content'

/**
 * POOL (arena, first hero beat) — the drone skims the water, DIVES through the
 * surface, glides underwater past lane ropes and moving caustics, then breaches
 * out the far end. Geometry is a real tiled basin: floor, four walls, a wave-
 * displaced surface plane, floating lane ropes and rising bubbles. The dive
 * refraction/darkening postprocessing is applied by <DiveEffect> at the canvas
 * level, driven by the camera crossing y=0 — here we build the place itself.
 *
 * Centre of the basin sits at roughly (0,-2.5,-40) in world space, matching the
 * ARENA_BEATS the camera flies through (approach→dive→underwater→breach).
 */
const CX = 0
const CZ = -41
const HALF_X = 7
const HALF_Z = 13
const FLOOR_Y = -5.5
const BUBBLE_COUNT = 180
const LANES = 4

const swimming = interests.sports.find((s) => s.name === 'Swimming')

export function Pool({ accent, reduced }: { accent: THREE.Color; reduced: boolean }) {
  const surfaceRef = useRef<THREE.Mesh>(null)
  const causticRef = useRef<THREE.MeshStandardMaterial>(null)
  const bubblesRef = useRef<THREE.InstancedMesh>(null)
  const ropesRef = useRef<THREE.InstancedMesh>(null)

  const mobile = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches,
    []
  )
  const lowFi = reduced || mobile

  // Real ceramic pool-tile PBR on the basin (floor tiled finer than the walls).
  const floorTile = usePBR('pooltile', { repeat: [4, 7], diffuseOnly: lowFi })
  const wallTile = usePBR('pooltile', { repeat: [4, 2], diffuseOnly: lowFi })

  // Wave surface — a subdivided plane displaced on the CPU each frame (cheap
  // Gerstner sum). Keep a copy of the base positions to displace from.
  const surfaceGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(HALF_X * 2, HALF_Z * 2, 40, 60)
    g.rotateX(-Math.PI / 2)
    g.userData.base = (g.attributes.position.array as Float32Array).slice()
    return g
  }, [])

  // Per-bubble spawn state (x,z, base y, speed, scale).
  const bubbles = useMemo(
    () =>
      Array.from({ length: BUBBLE_COUNT }, (_, i) => ({
        x: CX + (Math.sin(i * 12.9898) * 0.5) * HALF_X * 1.6,
        z: CZ + (Math.cos(i * 78.233) * 0.5) * HALF_Z * 1.6,
        y0: FLOOR_Y + (i / BUBBLE_COUNT) * (HALF_Z * 0),
        phase: (i * 0.137) % 1,
        speed: 0.5 + ((i * 7) % 10) / 10,
        scale: 0.04 + ((i * 3) % 7) / 60,
      })),
    []
  )

  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Fill lane-rope instances once (static floating cylinders along Z).
  useFrame(() => {
    const ropes = ropesRef.current
    if (ropes && !ropes.userData.filled) {
      for (let i = 0; i < LANES; i++) {
        const x = CX - HALF_X + ((i + 1) * (HALF_X * 2)) / (LANES + 1)
        dummy.position.set(x, -0.05, CZ)
        dummy.rotation.set(0, 0, Math.PI / 2)
        dummy.scale.set(0.06, HALF_Z * 2, 0.06)
        dummy.updateMatrix()
        ropes.setMatrixAt(i, dummy.matrix)
      }
      ropes.instanceMatrix.needsUpdate = true
      ropes.userData.filled = true
    }
  })

  useFrame((state) => {
    const t = state.clock.elapsedTime

    // 1. displace the wave surface
    const surf = surfaceRef.current
    if (surf) {
      const pos = surf.geometry.attributes.position
      const base = surf.geometry.userData.base as Float32Array
      for (let i = 0; i < pos.count; i++) {
        const x = base[i * 3]
        const z = base[i * 3 + 2]
        const y =
          Math.sin(x * 0.6 + t * 1.3) * 0.12 +
          Math.sin(z * 0.5 - t * 1.1) * 0.12 +
          Math.sin((x + z) * 0.9 + t * 1.9) * 0.06
        pos.setY(i, y)
      }
      pos.needsUpdate = true
      surf.geometry.computeVertexNormals()
    }

    // 2. scroll the caustic pattern on the floor
    if (causticRef.current) {
      causticRef.current.emissiveIntensity = 0.35 + Math.sin(t * 1.5) * 0.12
    }

    // 3. rise the bubbles, wrapping back to the floor
    const bm = bubblesRef.current
    if (bm) {
      const span = -FLOOR_Y // distance floor→surface
      for (let i = 0; i < BUBBLE_COUNT; i++) {
        const b = bubbles[i]
        const up = ((b.phase + t * b.speed * 0.15) % 1) * span
        dummy.position.set(
          b.x + Math.sin(t * b.speed + i) * 0.08,
          FLOOR_Y + up,
          b.z
        )
        dummy.scale.setScalar(b.scale)
        dummy.updateMatrix()
        bm.setMatrixAt(i, dummy.matrix)
      }
      bm.instanceMatrix.needsUpdate = true
    }
  })

  const stats = swimming?.stats ?? []

  return (
    <group>
      {/* basin floor — real ceramic tile; accent emissive still pulses as caustics */}
      <mesh position={[CX, FLOOR_Y, CZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[HALF_X * 2, HALF_Z * 2]} />
        <meshStandardMaterial
          ref={causticRef}
          {...floorTile}
          color="#7fd6e0"
          emissive={accent}
          emissiveIntensity={0.35}
          roughness={0.45}
          metalness={0.05}
          envMapIntensity={0.6}
        />
      </mesh>

      {/* four basin walls (tiled ceramic) */}
      {([
        [CX, FLOOR_Y / 2, CZ - HALF_Z, HALF_X * 2, -FLOOR_Y, 0.3, 0],
        [CX, FLOOR_Y / 2, CZ + HALF_Z, HALF_X * 2, -FLOOR_Y, 0.3, 0],
        [CX - HALF_X, FLOOR_Y / 2, CZ, 0.3, -FLOOR_Y, HALF_Z * 2, 0],
        [CX + HALF_X, FLOOR_Y / 2, CZ, 0.3, -FLOOR_Y, HALF_Z * 2, 0],
      ] as const).map((w, i) => (
        <mesh key={i} position={[w[0], w[1], w[2]]} receiveShadow>
          <boxGeometry args={[w[3], w[4], w[5]]} />
          <meshStandardMaterial {...wallTile} color="#dff1f4" roughness={0.3} metalness={0.05} envMapIntensity={0.5} />
        </mesh>
      ))}

      {/* wave-displaced water surface */}
      <mesh ref={surfaceRef} geometry={surfaceGeo} position={[CX, 0, CZ]}>
        <meshPhysicalMaterial
          color="#1a7a8c"
          transparent
          opacity={0.72}
          roughness={0.1}
          metalness={0}
          transmission={0.6}
          thickness={2}
          ior={1.33}
        />
      </mesh>

      {/* lane ropes */}
      <instancedMesh ref={ropesRef} args={[undefined, undefined, LANES]}>
        <cylinderGeometry args={[1, 1, 1, 8]} />
        <meshStandardMaterial color="#ff5b2e" roughness={0.6} />
      </instancedMesh>

      {/* rising bubbles */}
      <instancedMesh ref={bubblesRef} args={[undefined, undefined, BUBBLE_COUNT]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial
          color="#dff6ff"
          transparent
          opacity={0.5}
          roughness={0.1}
          metalness={0}
        />
      </instancedMesh>

      {/* underwater god-ray hint */}
      <spotLight
        position={[CX, 6, CZ]}
        target-position={[CX, FLOOR_Y, CZ]}
        angle={0.7}
        penumbra={0.8}
        intensity={120}
        distance={20}
        color="#bff0ff"
      />

      {/* physical signage — discovered underwater */}
      <Signage position={[CX, FLOOR_Y + 2.4, CZ - HALF_Z + 0.4]} size={1.8} color="#eafcff" emissive>
        SWIMMING
      </Signage>
      {stats.map((s, i) => (
        <Signage
          key={s.label}
          position={[CX - 4 + i * 4, FLOOR_Y + 0.8, CZ - HALF_Z + 0.4]}
          size={0.9}
          color={`#${accent.getHexString()}`}
          emissive
        >
          {s.value}
        </Signage>
      ))}
    </group>
  )
}
