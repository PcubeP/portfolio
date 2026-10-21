import { useMemo } from 'react'
import * as THREE from 'three'
import { Signage } from '@/world/components/Signage'
import { Model, NearGate } from '@/world/components/Model'
import { usePBR } from '@/world/materials/usePBR'
import { lookAt, worldRange } from '@/world/spline'
import { social } from '@/content'

/**
 * CONNECT (connect) — the closing beat: a real wooden desk (photoscanned CC0)
 * with an arm chair, an articulated desk lamp and a camera body on top, plus a
 * monitor whose accent-lit screen faces the drone. Social handles stack beside
 * it under a big LET'S TALK sign. The heavy props load through <NearGate>.
 *
 * The flight ENDS here (the drone comes to rest looking at the final gaze
 * target), so the desk is anchored at that gaze target — not on the flight path,
 * where the camera would fly straight over it — and the space is enclosed on all
 * but the open entry side so the finale reads as a room, not an empty void.
 */
export function Connect({ accent, reduced }: { accent: THREE.Color; reduced: boolean }) {
  const accentHex = `#${accent.getHexString()}`

  // Anchor to where the camera is looking as the flight settles (not the path
  // point at this beat — the drone flies over that). Floor sits below the gaze.
  const aim = useMemo(() => lookAt(0.99).clone(), [])
  const floorY = aim.y - 2.8

  const mobile = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches,
    []
  )
  const lowFi = reduced || mobile

  // Real CC0 concrete PBR on the shell; the desk/chair/lamp/camera are models.
  const floor = usePBR('concrete', { repeat: [3, 3], diffuseOnly: lowFi, displacementScale: lowFi ? 0 : 0.08 })
  const wall = usePBR('concrete', { repeat: [5, 2], diffuseOnly: lowFi })

  return (
    <group position={[aim.x, floorY, aim.z]}>
      {/* ===== ROOM SHELL — enclosed on the back + sides, open toward the drone ===== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[22, 22, 160, 160]} />
        <meshStandardMaterial {...floor} color="#b6b6bc" roughness={0.95} metalness={0} envMapIntensity={0.5} />
      </mesh>
      <mesh position={[0, 9, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[22, 22]} />
        <meshStandardMaterial {...wall} color="#33363f" roughness={1} metalness={0} envMapIntensity={0.25} />
      </mesh>
      <mesh position={[0, 4.5, -9]} receiveShadow>
        <planeGeometry args={[22, 9]} />
        <meshStandardMaterial {...wall} color="#cccdd4" roughness={0.95} metalness={0} envMapIntensity={0.35} />
      </mesh>
      <mesh position={[-9, 4.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[22, 9]} />
        <meshStandardMaterial {...wall} color="#cccdd4" roughness={0.95} metalness={0} envMapIntensity={0.35} />
      </mesh>
      <mesh position={[9, 4.5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[22, 9]} />
        <meshStandardMaterial {...wall} color="#cccdd4" roughness={0.95} metalness={0} envMapIntensity={0.35} />
      </mesh>

      <NearGate range={worldRange('connect')}>
        {/* real wooden desk + arm chair + articulated lamp + camera */}
        <Model folder="table" position={[0, 0, -1]} scale={1.6} envMapIntensity={1} />
        <Model folder="armchair" position={[0, 0, -2.6]} rotation={[0, 0, 0]} envMapIntensity={1} />
        <Model folder="desklamp" position={[-1.3, 1.2, -1.2]} rotation={[0, 0.6, 0]} envMapIntensity={1} />
        <Model folder="camera" position={[1.1, 1.24, -0.7]} rotation={[0, -0.9, 0]} envMapIntensity={1.1} />
      </NearGate>

      {/* monitor stand + panel sitting on the desk, screen toward the camera */}
      <mesh position={[0, 1.55, -1.2]} castShadow>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color="#111114" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, 2.05, -1.25]} castShadow>
        <boxGeometry args={[2.2, 1.3, 0.12]} />
        <meshStandardMaterial color="#0c0c10" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* emissive screen */}
      <mesh position={[0, 2.05, -1.18]}>
        <planeGeometry args={[2, 1.1]} />
        <meshStandardMaterial color={accentHex} emissive={accentHex} emissiveIntensity={0.9} toneMapped={false} />
      </mesh>

      {/* headline signs */}
      <Signage position={[0, 4.4, -1.2]} size={1.1} color={accentHex} emissive>
        LET'S TALK
      </Signage>
      <Signage position={[0, 3.7, -1.2]} size={0.42} color="#f5f5f0">
        CONNECT
      </Signage>

      {/* social handles beside the desk */}
      {social.map((s, i) => (
        <Signage
          key={s.id}
          position={[3.6, 3.4 - i * 0.5, -0.6]}
          rotation={[0, -0.5, 0]}
          size={0.34}
          color="#cfd2d6"
          anchorX="left"
        >
          {`${s.platform.toUpperCase()}  ${s.handle}`}
        </Signage>
      ))}

      {/* warm key over the desk + a soft neutral fill so the room reads as lit */}
      <spotLight
        position={[0, 8, 3]}
        target-position={[0, 1.5, -1]}
        angle={0.6}
        penumbra={0.7}
        intensity={160}
        distance={22}
        color="#fff2e0"
        castShadow
      />
      <pointLight position={[0, 4, 5]} intensity={20} distance={34} decay={2} color="#eef2ff" />
      {/* accent screen spill */}
      <pointLight position={[0, 2.4, 0]} intensity={8} distance={8} decay={2} color={accentHex} />
    </group>
  )
}
