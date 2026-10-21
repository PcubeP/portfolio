import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import { Signage } from '@/world/components/Signage'
import { usePBR } from '@/world/materials/usePBR'
import { positionAt, worldMidT } from '@/world/spline'
import { projects } from '@/content'

/**
 * CREATIONS (explore) — an enclosed concrete gallery. Plinths stand in a loose
 * arc, one per project, each holding a slowly-rotating faceted "hologram"
 * artifact (not a placeholder cube) lit by a warm track spot, with the project
 * name + stack on signage above. Walls + ceiling turn the space into a real room
 * so the drone flies into a gallery rather than past objects in a void.
 */

// A creation on display: geometry varies per index so the row never reads as
// one repeated object.
function artifactGeometry(i: number) {
  switch (i % 6) {
    case 0:
      return <icosahedronGeometry args={[0.55, 0]} />
    case 1:
      return <octahedronGeometry args={[0.62, 0]} />
    case 2:
      return <dodecahedronGeometry args={[0.55, 0]} />
    case 3:
      return <torusKnotGeometry args={[0.34, 0.12, 120, 16]} />
    case 4:
      return <tetrahedronGeometry args={[0.72, 0]} />
    default:
      return <torusGeometry args={[0.44, 0.16, 20, 40]} />
  }
}

function Artifact({
  index,
  accentHex,
  reduced,
}: {
  index: number
  accentHex: string
  reduced: boolean
}) {
  const ref = useRef<THREE.Group>(null)
  const phase = useMemo(() => index * 1.7, [index])

  useFrame((state) => {
    const g = ref.current
    if (!g || reduced) return
    const t = state.clock.elapsedTime
    g.rotation.y = t * 0.4 + phase
    g.rotation.x = Math.sin(t * 0.3 + phase) * 0.25
    g.position.y = 2.0 + Math.sin(t * 0.9 + phase) * 0.09
  })

  return (
    <group ref={ref} position={[0, 2.0, 0]}>
      {/* solid faceted core */}
      <mesh castShadow>
        {artifactGeometry(index)}
        <meshStandardMaterial
          color={accentHex}
          emissive={accentHex}
          emissiveIntensity={0.45}
          roughness={0.25}
          metalness={0.6}
        />
      </mesh>
      {/* glowing wireframe shell — reads as a hologram */}
      <mesh scale={1.05}>
        {artifactGeometry(index)}
        <meshBasicMaterial color={accentHex} wireframe toneMapped={false} />
      </mesh>
      {/* faint spill onto the plinth top */}
      <pointLight position={[0, -0.5, 0]} intensity={4} distance={4} decay={2} color={accentHex} />
    </group>
  )
}

export function Creations({ accent, reduced }: { accent: THREE.Color; reduced: boolean }) {
  const accentHex = `#${accent.getHexString()}`

  const mobile = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches,
    []
  )
  const lowFi = reduced || mobile

  // Real CC0 concrete PBR on the gallery floor, plinths and shell.
  const floorConcrete = usePBR('concrete', { repeat: [3, 3], diffuseOnly: lowFi })
  const pedestalConcrete = usePBR('concrete', { repeat: [2, 2], diffuseOnly: lowFi })
  const wallPlaster = usePBR('concrete', { repeat: [5, 2], diffuseOnly: lowFi })

  // Anchor to the flight (clone: positionAt reuses a temp).
  const anchor = useMemo(() => positionAt(worldMidT('creations')).clone(), [])
  const floorY = anchor.y - 4
  const cx = anchor.x
  const cz = anchor.z - 3 // room + arc centre (plinths sit ahead of the entry)

  const items = useMemo(() => projects.slice(0, 6), [])
  const plinths = useMemo(() => {
    const n = items.length
    const radius = 6
    return items.map((project, i) => {
      const a = (i - (n - 1) / 2) * 0.55
      return {
        project,
        i,
        x: anchor.x + Math.sin(a) * radius,
        z: anchor.z - 3 - Math.cos(a) * radius,
        yaw: -a,
      }
    })
  }, [anchor, items])

  return (
    <group>
      {/* ===== GALLERY SHELL — encloses the arc so it reads as a room, not a void ===== */}
      {/* polished-concrete floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, floorY, cz]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial {...floorConcrete} color="#b8b8be" roughness={0.9} metalness={0} envMapIntensity={0.5} />
      </mesh>
      {/* ceiling (darker, fills the empty upper frame) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[cx, floorY + 9, cz]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial {...wallPlaster} color="#33363f" roughness={1} metalness={0} envMapIntensity={0.25} />
      </mesh>
      {/* left / right / back walls (the front stays open where the drone enters) */}
      <mesh position={[cx - 13, floorY + 4.5, cz]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[30, 9]} />
        <meshStandardMaterial {...wallPlaster} color="#cfcfd6" roughness={0.95} metalness={0} envMapIntensity={0.35} />
      </mesh>
      <mesh position={[cx + 13, floorY + 4.5, cz]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[30, 9]} />
        <meshStandardMaterial {...wallPlaster} color="#cfcfd6" roughness={0.95} metalness={0} envMapIntensity={0.35} />
      </mesh>
      <mesh position={[cx, floorY + 4.5, cz - 13]} receiveShadow>
        <planeGeometry args={[26, 9]} />
        <meshStandardMaterial {...wallPlaster} color="#cfcfd6" roughness={0.95} metalness={0} envMapIntensity={0.35} />
      </mesh>

      {/* warm track downlights along the arc — a real gallery, not flat fill */}
      {plinths.map(({ x, z, i }) => (
        <spotLight
          key={`spot-${i}`}
          position={[x, floorY + 8, z + 1.5]}
          target-position={[x, floorY + 2, z]}
          angle={0.5}
          penumbra={0.7}
          intensity={110}
          distance={16}
          color="#fff4e2"
        />
      ))}

      {plinths.map(({ project, x, z, yaw, i }) => (
        <group key={project.id} position={[x, floorY, z]} rotation={[0, yaw, 0]}>
          {/* pedestal */}
          <RoundedBox
            args={[1.6, 1.4, 1.6]}
            radius={0.12}
            smoothness={2}
            position={[0, 0.7, 0]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial {...pedestalConcrete} color="#d6d6dc" roughness={0.85} metalness={0} envMapIntensity={0.6} />
          </RoundedBox>
          {/* the creation on display */}
          <Artifact index={i} accentHex={accentHex} reduced={reduced} />
          {/* project name + stack */}
          <Signage position={[0, 3.5, 0]} size={0.4} color="#f5f5f0" maxWidth={4}>
            {project.name}
          </Signage>
          <Signage position={[0, 3.05, 0]} size={0.19} color={accentHex} maxWidth={4} emissive>
            {project.stack.join('   ·   ')}
          </Signage>
        </group>
      ))}

      {/* soft neutral fills so the room reads as a lit space, not washed a single hue */}
      <pointLight position={[cx, floorY + 7, cz + 5]} intensity={22} distance={40} decay={2} color="#eef2ff" />
      <pointLight position={[cx, floorY + 3, cz + 9]} intensity={12} distance={26} decay={2} color="#ffffff" />
    </group>
  )
}
