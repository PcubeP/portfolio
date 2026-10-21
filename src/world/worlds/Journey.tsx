import { useMemo } from 'react'
import * as THREE from 'three'
import { Signage } from '@/world/components/Signage'
import { usePBR } from '@/world/materials/usePBR'
import { positionAt, worldMidT } from '@/world/spline'
import { journey } from '@/content'

/**
 * JOURNEY (discover) — a timeline corridor. A row of grounded milestone plinths
 * recedes down the flight, one per career/education entry, each crowned with a
 * glowing marker and labelled with its period + title. A dark road strip runs
 * beneath the whole run so the eye reads a single path through time.
 */
export function Journey({ accent, reduced }: { accent: THREE.Color; reduced: boolean }) {
  const accentHex = `#${accent.getHexString()}`
  const mobile = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches,
    []
  )
  const lowFi = reduced || mobile

  // Real CC0 PBR: long asphalt road strip + concrete milestone plinth posts.
  const road = usePBR('asphalt', { repeat: [2, 9], diffuseOnly: lowFi })
  const post = usePBR('concrete', { repeat: [1, 2], diffuseOnly: lowFi })
  // Anchor to where the camera actually flies (clone: positionAt reuses a temp).
  const anchor = useMemo(() => positionAt(worldMidT('journey')).clone(), [])
  const floorY = anchor.y - 4

  // One plinth per timeline entry, stepped down the flight on the right flank.
  const markers = useMemo(
    () =>
      journey.map((entry, i) => ({
        entry,
        h: 2.6 + (i % 2) * 0.6,
        x: anchor.x + 3.4,
        z: anchor.z + 6 - i * 6,
      })),
    [anchor]
  )

  return (
    <group>
      {/* road strip / ground beneath the timeline */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[anchor.x + 2, floorY, anchor.z - 6]}
        receiveShadow
      >
        <planeGeometry args={[9, 46]} />
        <meshStandardMaterial {...road} color="#ffffff" roughness={1} metalness={0} envMapIntensity={0.6} />
      </mesh>

      {/* milestone plinths */}
      {markers.map(({ entry, h, x, z }) => (
        <group key={entry.id} position={[x, floorY, z]}>
          {/* plinth post */}
          <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.9, h, 0.9]} />
            <meshStandardMaterial {...post} color="#8a8a90" roughness={0.6} metalness={0.2} envMapIntensity={0.6} />
          </mesh>
          {/* glowing crown */}
          <mesh position={[0, h + 0.2, 0]}>
            <boxGeometry args={[1.1, 0.35, 1.1]} />
            <meshStandardMaterial
              color={accentHex}
              emissive={accentHex}
              emissiveIntensity={1.4}
              toneMapped={false}
            />
          </mesh>
          {/* label: title over period */}
          <Signage position={[0, h + 1.7, 0]} rotation={[0, -0.4, 0]} size={0.5} color="#f5f5f0" maxWidth={5}>
            {entry.title}
          </Signage>
          <Signage position={[0, h + 1.1, 0]} rotation={[0, -0.4, 0]} size={0.4} color={accentHex} emissive>
            {entry.period}
          </Signage>
        </group>
      ))}

      {/* accent lights raking down the corridor */}
      <pointLight position={[anchor.x + 3, floorY + 6, anchor.z + 4]} intensity={28} distance={42} color={accent} />
      <pointLight position={[anchor.x + 3, floorY + 6, anchor.z - 20]} intensity={28} distance={42} color={accent} />
    </group>
  )
}
