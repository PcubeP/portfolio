import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Signage } from '@/world/components/Signage'
import { usePBR } from '@/world/materials/usePBR'
import { interests } from '@/content'

/**
 * TENNIS (arena) — a real clay court the drone banks over: graded clay surface,
 * proud white lines, a sagging net between posts, long warm shadows, and a ball
 * running genuine physics (gravity, restitution bounce, squash-on-impact, spin).
 * A courtside scoreboard glows with Nadal's record. The ball loop is time-based
 * and self-contained; the chase-cam blend is layered on in the deepen pass.
 *
 * Court centre ≈ (18,0,-66), matching the camera's tennis beat on the spline;
 * kept clear of the garage room that follows it down the flight.
 */
const CX = 18
const CZ = -66
const COURT_W = 11 // x
const COURT_L = 20 // z
const G = 9.8

const tennis = interests.sports.find((s) => s.name === 'Tennis')

function TennisBall() {
  const ref = useRef<THREE.Mesh>(null)
  // simple ballistic state, reset on a fixed period
  const state = useRef({ y: 4, vy: 0, x: CX - 3, z: CZ - 6, vx: 2.2, vz: 3.1 })

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 30)
    const s = state.current
    s.vy -= G * dt
    s.y += s.vy * dt
    s.x += s.vx * dt
    s.z += s.vz * dt

    // bounce off the clay
    let squash = 1
    if (s.y < 0.12) {
      s.y = 0.12
      s.vy = Math.abs(s.vy) * 0.72
      squash = 0.6
    }
    // keep it on the court — reflect off the baselines/sidelines
    if (s.x < CX - COURT_W / 2 || s.x > CX + COURT_W / 2) s.vx *= -1
    if (s.z < CZ - COURT_L / 2 || s.z > CZ + COURT_L / 2) s.vz *= -1

    const ball = ref.current
    if (ball) {
      ball.position.set(s.x, s.y, s.z)
      // squash on impact, recover in the air
      const sq = THREE.MathUtils.lerp(ball.scale.y, squash < 1 ? 0.7 : 1, 0.4)
      ball.scale.set(1 + (1 - sq) * 0.5, sq, 1 + (1 - sq) * 0.5)
      ball.rotation.x += s.vz * dt * 2
      ball.rotation.z -= s.vx * dt * 2
    }
  })

  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[0.13, 16, 16]} />
      <meshStandardMaterial color="#d4f542" roughness={0.85} />
    </mesh>
  )
}

export function Tennis({ accent, reduced }: { accent: THREE.Color; reduced: boolean }) {
  const mobile = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches,
    []
  )
  const lowFi = reduced || mobile

  // Real red-clay court surface + brushed-metal net posts / scoreboard housing.
  const clay = usePBR('clay', { repeat: [3, 5], diffuseOnly: lowFi })
  const metal = usePBR('metal', { repeat: [1, 3], diffuseOnly: lowFi })
  const board = usePBR('metal', { repeat: [3, 1], diffuseOnly: lowFi })

  // white line strips laid slightly proud of the clay
  const lines = useMemo(() => {
    const w = COURT_W / 2
    const l = COURT_L / 2
    const segs: [number, number, number, number][] = [
      // [x, z, sizeX, sizeZ]
      [CX, CZ - l, COURT_W, 0.12], // far baseline
      [CX, CZ + l, COURT_W, 0.12], // near baseline
      [CX - w, CZ, 0.12, COURT_L], // left sideline
      [CX + w, CZ, 0.12, COURT_L], // right sideline
      [CX, CZ, COURT_W, 0.1], // centre / service hint
    ]
    return segs
  }, [])

  const stats = tennis?.stats ?? []

  return (
    <group>
      {/* clay surface — real drag-broomed clay PBR, warmed toward tournament terre battue */}
      <mesh position={[CX, 0, CZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[COURT_W + 6, COURT_L + 6]} />
        <meshStandardMaterial {...clay} color="#c1592a" roughness={1} metalness={0} envMapIntensity={0.4} />
      </mesh>

      {/* proud white lines */}
      {lines.map((s, i) => (
        <mesh key={i} position={[s[0], 0.02, s[1]]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[s[2], s[3]]} />
          <meshStandardMaterial color="#f4f4ee" roughness={0.7} />
        </mesh>
      ))}

      {/* net + posts across the middle (along x) */}
      <mesh position={[CX, 0.5, CZ]}>
        <boxGeometry args={[COURT_W + 1, 1, 0.04]} />
        <meshStandardMaterial color="#0d0d0f" transparent opacity={0.55} roughness={0.9} />
      </mesh>
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[CX + sd * (COURT_W / 2 + 0.5), 0.55, CZ]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 1.1, 12]} />
          <meshStandardMaterial {...metal} color="#9a9aa0" roughness={0.4} metalness={0.9} envMapIntensity={1} />
        </mesh>
      ))}

      <TennisBall />

      {/* low warm sun → long shadows */}
      <directionalLight
        position={[CX - 20, 14, CZ + 8]}
        intensity={2.6}
        color="#ffd9a0"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* courtside scoreboard */}
      <group position={[CX, 3.4, CZ - COURT_L / 2 - 1]}>
        <mesh>
          <boxGeometry args={[9, 3, 0.4]} />
          <meshStandardMaterial {...board} color="#141418" roughness={0.5} metalness={0.7} envMapIntensity={0.8} />
        </mesh>
        <Signage position={[0, 0.85, 0.25]} size={0.7} color="#f5f5f0">
          {tennis?.figure?.name ?? 'RAFAEL NADAL'}
        </Signage>
        {stats.map((s, i) => (
          <Signage
            key={s.label}
            position={[-3 + i * 3, -0.35, 0.25]}
            size={0.85}
            color={`#${accent.getHexString()}`}
            emissive
          >
            {s.value}
          </Signage>
        ))}
      </group>
    </group>
  )
}
