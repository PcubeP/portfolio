import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Signage } from '@/world/components/Signage'
import { Model, NearGate } from '@/world/components/Model'
import { usePBR } from '@/world/materials/usePBR'
import { positionAt, worldRange } from '@/world/spline'
import { worldFx, ramp } from '@/world/worldFx'
import { lookOverride } from '@/world/CameraRig'
import { interests } from '@/content'

/**
 * WORLDS (the garage) — the off-hours world: one enclosed garage/warehouse the
 * drone flies into right after the tennis court. A polished-concrete floor,
 * corrugated-metal walls and a roller-shutter door make it read as a real room
 * (the enclosure also occludes everything beyond, sharpening the reveal). The
 * shell is real CC0 PBR on simple planes; everything *inside* is a real
 * photoscanned CC0 glTF prop (Poly Haven) so the space reads as physical, not
 * primitive: a covered car up on a lift (automobiles), an easel + canvas with a
 * spray-paint tag surrounded by spray cans (artwork), and a barrel stove with
 * live embers (food) — plus tool chest, welding cart, crates and a plant to
 * dress the room. Heavy props mount through <NearGate> so their glTFs only
 * download once the drone approaches this beat.
 *
 * The room centres on the flight's authored `worlds` point (world-space
 * ≈ 34, 4.2, -92 — spline t≈0.6875), deliberately deeper than the world's
 * mid-t so the enclosure sits clear of the tennis court that precedes it and
 * the CRT that follows; the camera enters through the open shutter and banks
 * down over the car.
 */

// room half-extents (X/Z) and height, in metres. Depth kept tight so the front
// wall clears the tennis court's far baseline and the back wall occludes the CRT.
const HX = 16
const HZ = 11
const H = 12

// Authored `worlds` diorama point on the flight (POSITION_POINTS index 11).
const WORLDS_T = 0.6875

// Hero car placement in room-local coords — sat on the camera's gaze sightline
// through the worlds beat so the drone banks down onto it as it flies in.
const CAR_LOCAL: [number, number, number] = [3, 0.5, -5]

const GATE = worldRange('worlds')

export function WorldsDiorama({ accent, reduced }: { accent: THREE.Color; reduced: boolean }) {
  const accentHex = `#${accent.getHexString()}`
  const anchor = useMemo(() => positionAt(WORLDS_T).clone(), [])
  const floorY = anchor.y - 4

  // World-space centre of the car (group is anchored at [anchor.x, floorY, anchor.z]).
  const carGaze = useMemo(
    () =>
      new THREE.Vector3(anchor.x + CAR_LOCAL[0], floorY + CAR_LOCAL[1] + 0.6, anchor.z + CAR_LOCAL[2]),
    [anchor, floorY]
  )

  // Bank the drone's gaze down onto the car through the middle of the beat — the
  // spline look-curve otherwise sweeps past it to the empty back wall.
  useFrame(() => {
    const f = ramp(worldFx.t, 0.6, 0.635) * (1 - ramp(worldFx.t, 0.672, 0.695))
    if (f > 0.001) {
      lookOverride.target.copy(carGaze)
      lookOverride.weight = Math.max(lookOverride.weight, f * 0.6)
    }
  })

  const mobile = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches,
    []
  )
  const lowFi = reduced || mobile

  // Real CC0 PBR surfaces for the shell + the few hand-built pieces (lift/easel).
  const concrete = usePBR('concrete', { repeat: [3, 3], diffuseOnly: lowFi, displacementScale: lowFi ? 0 : 0.08 })
  const corrugated = usePBR('corrugated', { repeat: [5, 2], diffuseOnly: lowFi })
  const roofIron = usePBR('corrugated', { repeat: [6, 6], diffuseOnly: lowFi })
  const shutter = usePBR('shutter', { repeat: [4, 4], diffuseOnly: lowFi })
  const steel = usePBR('metal', { repeat: [1, 1], diffuseOnly: lowFi })
  const wood = usePBR('wood', { repeat: [1, 2], diffuseOnly: lowFi })

  // Real labels pulled from the interests content.
  const car = interests.automobiles.find((a) => a.kind === 'dream') ?? interests.automobiles[0]
  const art = interests.art[0]
  const food = interests.food[0]

  return (
    <group position={[anchor.x, floorY, anchor.z]}>
      {/* ===== SHELL ===== */}
      {/* polished-concrete floor (subdivided so the displacement map adds real relief) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[HX * 2, HZ * 2, 200, 140]} />
        <meshStandardMaterial {...concrete} color="#9a9aa0" roughness={0.55} metalness={0.15} envMapIntensity={0.7} />
      </mesh>

      {/* corrugated side + back walls */}
      {([
        [0, H / 2, -HZ, HX * 2, H, 0.4], // back
        [-HX, H / 2, 0, 0.4, H, HZ * 2], // left
        [HX, H / 2, 0, 0.4, H, HZ * 2], // right
      ] as const).map((w, i) => (
        <mesh key={i} position={[w[0], w[1], w[2]]} receiveShadow>
          <boxGeometry args={[w[3], w[4], w[5]]} />
          <meshStandardMaterial {...corrugated} color="#5c6066" roughness={0.7} metalness={0.5} envMapIntensity={0.6} />
        </mesh>
      ))}

      {/* roller-shutter door across the front (entry) wall, rolled part-open */}
      <mesh position={[0, H / 2 + 1.4, HZ]} receiveShadow>
        <boxGeometry args={[HX * 2, H - 2.8, 0.4]} />
        <meshStandardMaterial {...shutter} color="#8a8d92" roughness={0.5} metalness={0.6} envMapIntensity={0.6} />
      </mesh>

      {/* roof */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]}>
        <planeGeometry args={[HX * 2, HZ * 2]} />
        <meshStandardMaterial {...roofIron} color="#303339" roughness={0.8} metalness={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* Real photoscanned props — only fetched once the drone nears this beat. */}
      <NearGate range={GATE}>
        {/* ===== ZONE 1 — AUTOMOBILES: covered car up on a service lift =====
            Sat on the drone's gaze sightline (CAR_LOCAL) so it lands centre-frame. */}
        {/* low service lift / platform */}
        <mesh position={[CAR_LOCAL[0], 0.2, CAR_LOCAL[2]]} rotation={[0, -0.5, 0]} receiveShadow castShadow>
          <boxGeometry args={[5.2, 0.4, 2.8]} />
          <meshStandardMaterial {...steel} color="#26282d" roughness={0.5} metalness={0.7} envMapIntensity={0.8} />
        </mesh>
        <Model folder="car" position={[CAR_LOCAL[0], 0.4, CAR_LOCAL[2]]} rotation={[0, -0.5, 0]} envMapIntensity={1.3} />
        {/* key light for the car-paint / cover reflections — raked from the front-right */}
        <spotLight
          position={[CAR_LOCAL[0] - 1, 8, CAR_LOCAL[2] + 5]}
          target-position={[CAR_LOCAL[0], 1, CAR_LOCAL[2]]}
          angle={0.7}
          penumbra={0.6}
          intensity={340}
          distance={28}
          color="#fff3dd"
          castShadow
        />
        {/* cool rim light from behind to peel the car off the back wall */}
        <spotLight
          position={[CAR_LOCAL[0] + 4, 6, CAR_LOCAL[2] - 5]}
          target-position={[CAR_LOCAL[0], 1, CAR_LOCAL[2]]}
          angle={0.7}
          penumbra={0.8}
          intensity={140}
          distance={24}
          color="#bcd3ff"
        />

        {/* garage dressing — real tool chest, welding cart, crates, plant */}
        <Model folder="toolchest" position={[-13, 0, -12]} rotation={[0, 0.5, 0]} envMapIntensity={1} />
        <Model folder="weldingcart" position={[7.5, 0, 1]} rotation={[0, -1.2, 0]} envMapIntensity={1} />
        <Model folder="crate" position={[-13.2, 0, -5]} rotation={[0, 0.3, 0]} envMapIntensity={0.9} />
        <Model folder="militarycrate" position={[-12.3, 0.42, -5.3]} rotation={[0, -0.4, 0]} envMapIntensity={0.9} />
        <Model folder="plant" position={[13, 0, 12]} rotation={[0, 0.8, 0]} envMapIntensity={1} />

        {/* hanging shop lamps over the two work zones, each with a real warm bulb
            so the enclosed room is lit from within (the roof blocks the global sun). */}
        <group position={[CAR_LOCAL[0], H - 1.2, CAR_LOCAL[2]]}>
          <Model folder="shoplamp" position={[0, 0, 0]} envMapIntensity={1} />
          <pointLight position={[0, -0.6, 0]} intensity={26} distance={16} decay={2} color="#ffe7bf" />
        </group>
        <group position={[-9, H - 1.2, 4]}>
          <Model folder="shoplamp" position={[0, 0, 0]} envMapIntensity={1} />
          <pointLight position={[0, -0.6, 0]} intensity={18} distance={14} decay={2} color="#ffe7bf" />
        </group>
        {/* soft interior fill so nothing reads as flat unlit geometry in the enclosure */}
        <pointLight position={[0, H - 3, 6]} intensity={12} distance={30} decay={2} color="#dce7ff" />

        {/* ===== ZONE 3 — FOOD: barrel stove with live embers (pushed to the far
            right corner so it dresses the room without crowding the hero car) ===== */}
        <group position={[12, 0, -8]} rotation={[0, -0.9, 0]}>
          <Model folder="stove" position={[0, 0, 0]} envMapIntensity={1} />
          {/* ember glow spilling from the stove mouth */}
          <pointLight position={[0, 0.9, 0.5]} intensity={10} distance={6} color="#ff7a2e" />
        </group>

        {/* ===== ZONE 2 dressing — spray cans at the foot of the easel ===== */}
        <Model folder="spraycans" position={[-8, 0, 5.4]} rotation={[0, 1.1, 0]} envMapIntensity={1} />
      </NearGate>

      {/* automobiles signage — floated above the hero car */}
      <Signage position={[CAR_LOCAL[0], 6.4, CAR_LOCAL[2]]} size={0.7} color="#f5f5f0" font="graffiti">
        THE GARAGE
      </Signage>
      <Signage position={[CAR_LOCAL[0], 5.5, CAR_LOCAL[2]]} size={0.42} color={accentHex} emissive>
        {car.name}
      </Signage>
      <Signage position={[CAR_LOCAL[0], 5.0, CAR_LOCAL[2]]} size={0.3} color="#c9c9cf">
        {car.kind.toUpperCase()}
      </Signage>

      {/* ===== ZONE 2 — ARTWORK: easel + canvas with a spray-paint tag ===== */}
      <group position={[-9, 0, 4]} rotation={[0, 0.7, 0]}>
        {/* easel legs */}
        <mesh position={[-0.6, 1.5, 0.3]} rotation={[0.14, 0, 0.12]} castShadow>
          <boxGeometry args={[0.1, 3, 0.1]} />
          <meshStandardMaterial {...wood} color="#7a5230" roughness={0.7} />
        </mesh>
        <mesh position={[0.6, 1.5, 0.3]} rotation={[0.14, 0, -0.12]} castShadow>
          <boxGeometry args={[0.1, 3, 0.1]} />
          <meshStandardMaterial {...wood} color="#7a5230" roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.5, -0.5]} rotation={[-0.2, 0, 0]} castShadow>
          <boxGeometry args={[0.1, 3, 0.1]} />
          <meshStandardMaterial {...wood} color="#7a5230" roughness={0.7} />
        </mesh>
        {/* canvas */}
        <mesh position={[0, 2.0, 0.34]} rotation={[-0.12, 0, 0]} castShadow>
          <boxGeometry args={[2.0, 1.7, 0.08]} />
          <meshStandardMaterial color="#efe9dc" roughness={0.9} />
        </mesh>
        {/* original abstract spray composition (emissive strokes, no copyrighted art) */}
        <group position={[0, 2.0, 0.4]} rotation={[-0.12, 0, 0]}>
          <mesh position={[-0.3, 0.15, 0]} rotation={[0, 0, 0.5]}>
            <planeGeometry args={[1.3, 0.28]} />
            <meshBasicMaterial color={accentHex} toneMapped={false} />
          </mesh>
          <mesh position={[0.25, -0.1, 0.001]} rotation={[0, 0, -0.35]}>
            <planeGeometry args={[1.0, 0.2]} />
            <meshBasicMaterial color="#37c2ff" toneMapped={false} />
          </mesh>
          <mesh position={[0.1, 0.35, 0.002]}>
            <circleGeometry args={[0.22, 24]} />
            <meshBasicMaterial color="#ff4d8d" toneMapped={false} />
          </mesh>
        </group>
      </group>
      <Signage position={[-9, 4.4, 4]} size={0.9} color={accentHex} font="graffiti" emissive rotation={[0, 0.7, 0]}>
        {art.title ?? 'UNTITLED'}
      </Signage>
      <Signage position={[-9, 3.7, 4]} size={0.3} color="#c9c9cf" rotation={[0, 0.7, 0]}>
        {art.medium.toUpperCase()}
      </Signage>

      {/* food signage — over the relocated corner stove */}
      <Signage position={[12, 4.0, -8]} size={0.6} color="#f5f5f0" rotation={[0, -0.9, 0]}>
        {(food.cuisine ?? 'FOOD').toUpperCase()}
      </Signage>
      <Signage position={[12, 3.4, -8]} size={0.34} color={accentHex} emissive rotation={[0, -0.9, 0]}>
        {food.name}
      </Signage>

      {/* ===== warm hanging work-lamps + HDRI fill ===== */}
      <spotLight position={[-6, H - 1, 4]} target-position={[-9, 2, 4]} angle={0.7} penumbra={0.8} intensity={90} distance={26} color="#ffe6b8" />
      <spotLight position={[10, H - 1, -6]} target-position={[10, 1, -9]} angle={0.7} penumbra={0.8} intensity={80} distance={26} color="#ffe6b8" />
      <pointLight position={[0, H - 2, 0]} intensity={30} distance={38} color="#fff1d6" />
    </group>
  )
}
