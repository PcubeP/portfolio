import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { Signage } from '@/world/components/Signage'
import { usePBR } from '@/world/materials/usePBR'

/**
 * CRT (pop culture) — a physical television built entirely from primitives:
 * rounded casing, curved emissive glass, bezel, chunky buttons, vent slats and
 * a rabbit-ear antenna, grounded on a console. The drone approaches head-on so
 * the set grows in true perspective; the "enter the screen" broadcast portal and
 * the CRT scanline/curvature post stack are added by <CRTEffect> at the canvas
 * level. Here the screen shows a procedural station-ident test pattern.
 *
 * Set centre ≈ (41.6,1.6,-112), facing +Z toward the incoming camera.
 */
const TX = 41.6
const TY = 1.6
const TZ = -112

// SMPTE-ish colour bars (original palette, not a copied asset).
const BARS = ['#c0c0c0', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0']

export function CRT({ accent, reduced }: { accent: THREE.Color; reduced: boolean }) {
  const screenRef = useRef<THREE.MeshStandardMaterial>(null)

  const mobile = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches,
    []
  )
  const lowFi = reduced || mobile

  // Real wood veneer on the console, scratched-metal on the moulded TV casing,
  // wood floor + concrete back wall to seat the set in a room (not a void).
  const wood = usePBR('wood', { repeat: [2, 1], diffuseOnly: lowFi })
  const casing = usePBR('metal', { repeat: [1, 1], diffuseOnly: lowFi })
  const floor = usePBR('wood', { repeat: [4, 4], diffuseOnly: lowFi })
  const wall = usePBR('concrete', { repeat: [4, 3], diffuseOnly: lowFi })

  useFrame((state) => {
    // subtle phosphor flicker on the screen glow
    if (screenRef.current) {
      const f = 0.9 + Math.sin(state.clock.elapsedTime * 40) * 0.05
      screenRef.current.emissiveIntensity = 0.45 * f
    }
  })

  return (
    <group position={[TX, TY, TZ]}>
      {/* ===== ROOM CONTEXT — grounds the set so it isn't floating in a void ===== */}
      {/* wood floor under the whole scene */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.1, 2]} receiveShadow>
        <planeGeometry args={[34, 30]} />
        <meshStandardMaterial {...floor} color="#5a4a2e" roughness={0.85} metalness={0} envMapIntensity={0.35} />
      </mesh>
      {/* dim back wall behind the TV for depth (camera approaches head-on from +Z) */}
      <mesh position={[0, 3, -4]} receiveShadow>
        <planeGeometry args={[34, 16]} />
        <meshStandardMaterial {...wall} color="#3a3630" roughness={0.9} metalness={0} envMapIntensity={0.3} />
      </mesh>
      {/* warm living-room fills (NOT the green accent) so the room reads as a place */}
      <pointLight position={[-6, 4, 6]} intensity={30} distance={26} decay={2} color="#ffd9a8" />
      <pointLight position={[7, 3, 5]} intensity={16} distance={22} decay={2} color="#ffcf9a" />

      {/* console the TV sits on — real wood veneer */}
      <mesh position={[0, -2.3, 0]} receiveShadow castShadow>
        <boxGeometry args={[6, 1.6, 3]} />
        <meshStandardMaterial {...wood} color="#6f4a2e" roughness={0.6} metalness={0} envMapIntensity={0.5} />
      </mesh>

      {/* casing */}
      <RoundedBox args={[5, 4, 3]} radius={0.25} smoothness={4} castShadow>
        <meshStandardMaterial {...casing} color="#26261f" roughness={0.6} metalness={0.3} envMapIntensity={0.5} />
      </RoundedBox>

      {/* bezel */}
      <mesh position={[0, 0.3, 1.46]}>
        <boxGeometry args={[3.9, 3, 0.15]} />
        <meshStandardMaterial color="#111" roughness={0.4} />
      </mesh>

      {/* dark glass screen seated flat in the bezel — a faint phosphor glow only.
          The bright element is the colour-bar pattern in front of it (multi-colour,
          so the set never washes to a single green). Screen curvature/scanlines are
          layered on by <CRTEffect> in post, so a flat plane is correct here. */}
      <mesh position={[0, 0.3, 1.5]}>
        <planeGeometry args={[3.5, 2.5]} />
        <meshStandardMaterial
          ref={screenRef}
          color="#050505"
          emissive={accent}
          emissiveIntensity={0.45}
          roughness={0.15}
          metalness={0}
        />
      </mesh>
      <group position={[0, 0.3, 1.62]}>
        {BARS.map((c, i) => (
          <mesh key={i} position={[-1.5 + (i * 3) / BARS.length, 0.3, 0]}>
            <planeGeometry args={[3 / BARS.length - 0.02, 2]} />
            <meshBasicMaterial color={c} toneMapped={false} />
          </mesh>
        ))}
        <mesh position={[0, -0.85, 0]}>
          <planeGeometry args={[3, 0.5]} />
          <meshBasicMaterial color="#0a0a0a" toneMapped={false} />
        </mesh>
      </group>

      {/* control panel: buttons + dials on the right of the screen */}
      <group position={[2.2, 0.3, 1.45]}>
        {[0.8, 0.2, -0.4].map((y) => (
          <mesh key={y} position={[0, y, 0.1]}>
            <cylinderGeometry args={[0.18, 0.18, 0.2, 12]} />
            <meshStandardMaterial color="#4a4a44" roughness={0.5} metalness={0.4} />
          </mesh>
        ))}
      </group>

      {/* vent slats on top */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[-1.5 + i * 0.6, 2.05, 0]}>
          <boxGeometry args={[0.4, 0.06, 2.2]} />
          <meshStandardMaterial color="#151510" roughness={0.8} />
        </mesh>
      ))}

      {/* rabbit-ear antenna */}
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * 0.6, 3, 0]} rotation={[0, 0, sd * 0.5]}>
          <cylinderGeometry args={[0.03, 0.03, 2.4, 6]} />
          <meshStandardMaterial color="#888" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}

      {/* screen glow into the room — a modest green phosphor spill, not a flood */}
      <pointLight position={[0, 0.3, 3]} intensity={9} distance={10} decay={2} color={accent} />

      <Signage position={[0, -3.4, 1.6]} size={0.5} color={`#${accent.getHexString()}`} emissive>
        POP CULTURE
      </Signage>
    </group>
  )
}
