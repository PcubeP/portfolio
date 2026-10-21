import { useMemo } from 'react'
import * as THREE from 'three'
import { Signage } from '@/world/components/Signage'
import { Model, NearGate } from '@/world/components/Model'
import { usePBR } from '@/world/materials/usePBR'
import { positionAt, worldMidT, worldRange } from '@/world/spline'

/**
 * ARCADE (experience) — a neon room of retro cabinets. Two rows of grounded
 * cabinets (body + angled bezel + emissive marquee strip in the accent hue)
 * flank the lane the camera threads between, under a big ARCADE sign.
 */
export function Arcade({ accent, reduced }: { accent: THREE.Color; reduced: boolean }) {
  const accentHex = `#${accent.getHexString()}`
  const mobile = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches,
    []
  )
  const lowFi = reduced || mobile

  // Real CC0 PBR: concrete floor + one painted-metal set shared across every cabinet body.
  const floor = usePBR('concrete', { repeat: [3, 8], diffuseOnly: lowFi })
  const cabinet = usePBR('metal', { repeat: [1, 2], diffuseOnly: lowFi })
  const wall = usePBR('concrete', { repeat: [4, 2], diffuseOnly: lowFi })

  // Anchor to the flight (clone: positionAt reuses a temp).
  const anchor = useMemo(() => positionAt(worldMidT('arcade')).clone(), [])
  const floorY = anchor.y - 3.2

  // Two mirrored rows of cabinets facing into the central lane.
  const cabinets = useMemo(() => {
    const arr: { x: number; z: number; yaw: number }[] = []
    const perSide = 6
    for (let i = 0; i < perSide; i++) {
      const z = anchor.z + 8 - i * 3.4
      arr.push({ x: anchor.x - 3, z, yaw: Math.PI / 2 })
      arr.push({ x: anchor.x + 3, z, yaw: -Math.PI / 2 })
    }
    return arr
  }, [anchor])

  return (
    <group>
      {/* ===== ROOM SHELL — side walls + ceiling enclose the lane; both ends stay
           open so the drone threads straight through toward connect ===== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[anchor.x, floorY, anchor.z - 2]} receiveShadow>
        <planeGeometry args={[16, 46]} />
        <meshStandardMaterial {...floor} color="#3f4148" roughness={1} metalness={0} envMapIntensity={0.6} />
      </mesh>
      {/* ceiling (dark, fills the empty upper frame that was reading as void) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[anchor.x, floorY + 8, anchor.z - 2]}>
        <planeGeometry args={[16, 46]} />
        <meshStandardMaterial {...wall} color="#1c1e24" roughness={1} metalness={0} envMapIntensity={0.15} />
      </mesh>
      {/* left / right walls just outside the cabinet rows (lane ends left open) */}
      <mesh position={[anchor.x - 7.5, floorY + 4, anchor.z - 1]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[26, 8]} />
        <meshStandardMaterial {...wall} color="#43454d" roughness={1} metalness={0} envMapIntensity={0.25} />
      </mesh>
      <mesh position={[anchor.x + 7.5, floorY + 4, anchor.z - 1]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[26, 8]} />
        <meshStandardMaterial {...wall} color="#43454d" roughness={1} metalness={0} envMapIntensity={0.25} />
      </mesh>

      {cabinets.map(({ x, z, yaw }, i) => (
        <group key={i} position={[x, floorY, z]} rotation={[0, yaw, 0]}>
          {/* cabinet body */}
          <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.2, 2.8, 1]} />
            <meshStandardMaterial {...cabinet} color="#3a3a42" roughness={0.6} envMapIntensity={0.6} />
          </mesh>
          {/* angled bezel above the screen */}
          <mesh position={[0, 2.9, 0.15]} rotation={[-0.35, 0, 0]} castShadow>
            <boxGeometry args={[1.2, 0.9, 0.2]} />
            <meshStandardMaterial color="#0d0d10" roughness={0.5} metalness={0.3} />
          </mesh>
          {/* emissive marquee strip */}
          <mesh position={[0, 3.4, 0.1]}>
            <boxGeometry args={[1.2, 0.35, 0.12]} />
            <meshStandardMaterial color={accentHex} emissive={accentHex} emissiveIntensity={0.55} toneMapped={false} />
          </mesh>
          {/* screen */}
          <mesh position={[0, 1.95, 0.52]}>
            <planeGeometry args={[0.9, 0.7]} />
            <meshStandardMaterial color="#05202a" emissive={accentHex} emissiveIntensity={0.25} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* real props threading the lane — a console and a boombox on the floor */}
      <NearGate range={worldRange('arcade')}>
        <Model folder="gameconsole" position={[anchor.x, floorY, anchor.z + 6]} rotation={[0, 0.4, 0]} scale={2.4} envMapIntensity={1} />
        <Model folder="boombox" position={[anchor.x + 1.2, floorY, anchor.z - 12]} rotation={[0, -0.5, 0]} scale={1.6} envMapIntensity={1} />
      </NearGate>

      {/* ARCADE sign overhead */}
      <Signage position={[anchor.x, floorY + 6, anchor.z + 9]} size={1.6} color={accentHex} emissive>
        ARCADE
      </Signage>

      {/* neutral fills so the room reads as a lit space (the marquees supply the
          neon accent) + one dim accent glow down the lane */}
      <pointLight position={[anchor.x, floorY + 6, anchor.z + 2]} intensity={26} distance={40} decay={2} color="#eef2ff" />
      <pointLight position={[anchor.x, floorY + 6, anchor.z - 12]} intensity={22} distance={40} decay={2} color="#fff2e0" />
      <pointLight position={[anchor.x, floorY + 2.5, anchor.z - 5]} intensity={10} distance={30} decay={2} color={accent} />
    </group>
  )
}
