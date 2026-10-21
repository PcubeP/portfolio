import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RoundedBox, Sparkles, Float, MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { Signage } from '@/world/components/Signage'
import { profile } from '@/content'
import { worldFx } from '@/world/worldFx'
import { revealAt } from '@/world/useReveal'
import {
  latticeVert,
  latticeFrag,
  latticeUniforms,
  ribbonVert,
  ribbonFrag,
  ribbonUniforms,
  godrayVert,
  godrayFrag,
  godrayUniforms,
  hologramVert,
  hologramFrag,
  hologramUniforms,
} from '@/world/worlds/openingShaders'

/**
 * OPENING FLIGHT (identity) — "EMBERWAKE": the drone launches into darkness and
 * a dormant data-field IGNITES around it. A wet-obsidian reflector floor mirrors
 * an igniting hex lattice pulsing sonar-rings from beneath the craft; flanking
 * energy ribbons unspool where dull pylons used to be; a holographic monolith
 * assembles at the corridor mouth and burns the visitor's name onto its face,
 * lit by volumetric god-ray shafts and a newborn ember. Strip every letter and
 * it still reads as a machine waking up because you flew in.
 */
const IDENTITY_RANGE: [number, number] = [0, 0.09]

const hash = (i: number) => {
  const s = Math.sin(i * 12.9898) * 43758.5453
  return s - Math.floor(s)
}

export function OpeningFlight({ accent, reduced }: { accent: THREE.Color; reduced: boolean }) {
  const camera = useThree((s) => s.camera)
  const accentHex = `#${accent.getHexString()}`

  const mobile = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches,
    []
  )
  const lowFi = reduced || mobile

  // Raw shader materials (uniforms mutated per frame; disposed on unmount).
  const mats = useMemo(() => {
    const lattice = new THREE.ShaderMaterial({
      vertexShader: latticeVert,
      fragmentShader: latticeFrag,
      uniforms: latticeUniforms(accent),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    })
    const ribbon = new THREE.ShaderMaterial({
      vertexShader: ribbonVert,
      fragmentShader: ribbonFrag,
      uniforms: ribbonUniforms(accent),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    })
    const godray = new THREE.ShaderMaterial({
      vertexShader: godrayVert,
      fragmentShader: godrayFrag,
      uniforms: godrayUniforms(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    })
    const holo = new THREE.ShaderMaterial({
      vertexShader: hologramVert,
      fragmentShader: hologramFrag,
      uniforms: hologramUniforms(accent),
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    })
    return { lattice, ribbon, godray, holo }
  }, [accent])

  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats])

  const ribbonGeo = useMemo(() => new THREE.PlaneGeometry(0.28, 44, 1, 80), [])
  useEffect(() => () => ribbonGeo.dispose(), [ribbonGeo])

  const runwayMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#05070d',
        emissive: accent,
        emissiveIntensity: 1.4,
        roughness: 0.5,
        metalness: 0.2,
      }),
    [accent]
  )
  useEffect(() => () => runwayMat.dispose(), [runwayMat])

  const runwayGeo = useMemo(() => new THREE.BoxGeometry(0.18, 0.05, 1.2), [])
  useEffect(() => () => runwayGeo.dispose(), [runwayGeo])

  // Deterministic ribbon placements flanking the lane (index hash, never random).
  const ribbons = useMemo(() => {
    const n = reduced ? 12 : mobile ? 10 : 20
    const out: { x: number; y: number; z: number; rz: number }[] = []
    for (let i = 0; i < n; i++) {
      const side = i % 2 === 0 ? -1 : 1
      const h = hash(i + 1)
      out.push({
        x: side * (5.5 + h * 5),
        y: 3.5 + h * 6,
        z: 30 - (Math.floor(i / 2) * 3.2 + h * 1.5),
        rz: side * (0.06 + h * 0.14),
      })
    }
    return out
  }, [reduced, mobile])

  // Converging "runway" strips leading the eye to the focal ring.
  const runway = useMemo(() => {
    const out: { x: number; z: number }[] = []
    for (let i = 0; i < 9; i++) {
      const z = 30 - i * 1.7
      const x = 3.6 - i * 0.32
      out.push({ x: -x, z })
      out.push({ x, z })
    }
    return out
  }, [])

  const emberRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    const f = reduced ? 1 : revealAt(worldFx.t, IDENTITY_RANGE, 0, 0.04)
    const ig = reduced ? 1 : THREE.MathUtils.clamp(worldFx.t / 0.09, 0, 1)
    const time = worldFx.time // frozen under reduced (rig stops advancing it)

    const lu = mats.lattice.uniforms
    lu.uTime.value = time
    ;(lu.uCamXZ.value as THREE.Vector2).set(camera.position.x, camera.position.z)
    lu.uFade.value = f

    mats.ribbon.uniforms.uTime.value = time
    mats.ribbon.uniforms.uFade.value = f

    mats.godray.uniforms.uTime.value = time
    mats.godray.uniforms.uFade.value = f

    mats.holo.uniforms.uTime.value = time
    mats.holo.uniforms.uBuild.value = ig
    mats.holo.uniforms.uFade.value = f

    if (emberRef.current) {
      const pulse = 0.55 + ig * 0.6 + (reduced ? 0 : Math.sin(time * 3) * 0.05)
      emberRef.current.scale.setScalar(pulse)
    }
  })

  return (
    <group>
      {/* wet-obsidian reflector floor — mirrors the glow + name for instant depth */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 10]} receiveShadow>
        <planeGeometry args={[90, 150]} />
        {lowFi ? (
          <meshStandardMaterial color="#0a0e18" metalness={0.4} roughness={0.6} />
        ) : (
          <MeshReflectorMaterial
            resolution={256}
            mirror={0.6}
            blur={[300, 90]}
            mixBlur={1}
            mixStrength={0.5}
            depthScale={0.6}
            minDepthThreshold={0.3}
            color="#05070d"
            metalness={0.85}
            roughness={0.35}
          />
        )}
      </mesh>

      {/* igniting hex lattice with sonar pulse-rings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.17, 10]}>
        <planeGeometry args={[90, 150]} />
        <primitive object={mats.lattice} attach="material" dispose={null} />
      </mesh>

      {/* energy ribbons (replace the pylons) */}
      {ribbons.map((r, i) => (
        <mesh
          key={i}
          geometry={ribbonGeo}
          material={mats.ribbon}
          position={[r.x, r.y, r.z]}
          rotation={[0, 0, r.rz]}
        />
      ))}

      {/* holographic monolith assembling the name */}
      <RoundedBox args={[3.8, 9, 0.6]} radius={0.12} position={[0, 4.2, 27]}>
        <primitive object={mats.holo} attach="material" dispose={null} />
      </RoundedBox>

      {/* flanking asymmetric monoliths forming a gorge + a parallax back row */}
      <RoundedBox args={[3, 11, 3]} radius={0.1} position={[-7, 4.5, 34]} rotation={[0, 0.22, 0.05]}>
        <meshStandardMaterial color="#0c0f16" roughness={0.5} metalness={0.4} emissive={accent} emissiveIntensity={0.06} />
      </RoundedBox>
      <RoundedBox args={[2.6, 8, 2.6]} radius={0.1} position={[6, 3, 22]} rotation={[0, -0.28, -0.04]}>
        <meshStandardMaterial color="#0c0f16" roughness={0.5} metalness={0.4} emissive={accent} emissiveIntensity={0.06} />
      </RoundedBox>
      <RoundedBox args={[2, 6, 2]} radius={0.08} position={[-13, 2.5, 40]} rotation={[0, 0.3, 0.06]}>
        <meshStandardMaterial color="#0a0d14" roughness={0.6} metalness={0.35} emissive={accent} emissiveIntensity={0.04} />
      </RoundedBox>
      <RoundedBox args={[2, 7, 2]} radius={0.08} position={[13, 3, 42]} rotation={[0, -0.34, -0.05]}>
        <meshStandardMaterial color="#0a0d14" roughness={0.6} metalness={0.35} emissive={accent} emissiveIntensity={0.04} />
      </RoundedBox>

      {/* focal launch ring at the corridor mouth — the drone flies through it */}
      <mesh position={[0, 3.4, 15]}>
        <torusGeometry args={[5.2, 0.14, 10, 64]} />
        <meshBasicMaterial color={accent} toneMapped={false} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* converging emissive runway strips */}
      {runway.map((s, i) => (
        <mesh key={i} geometry={runwayGeo} material={runwayMat} position={[s.x, -1.14, s.z]} />
      ))}

      {/* volumetric god-ray shafts */}
      {[-4, 2, 6].map((x, i) => (
        <mesh
          key={i}
          material={mats.godray}
          position={[x, 8, 20 + i * 3]}
          rotation={[0, 0, (x < 0 ? 1 : -1) * 0.16]}
        >
          <coneGeometry args={[3, 26, 20, 1, true]} />
        </mesh>
      ))}

      {/* newborn ember — rim-lights the name so it separates from the dark */}
      <mesh ref={emberRef} position={[0, 5, 22]}>
        <icosahedronGeometry args={[0.8, 2]} />
        <meshBasicMaterial color={accent} toneMapped={false} transparent />
      </mesh>

      {/* drifting embers */}
      {!lowFi && (
        <Sparkles count={120} scale={[22, 10, 56]} position={[0, 4, 18]} size={3} speed={0.2} color={accentHex} opacity={0.6} />
      )}

      {/* hero identity — physical emissive signage on the monolith face */}
      <Float speed={reduced ? 0 : 1} rotationIntensity={0} floatIntensity={reduced ? 0 : 0.4}>
        <group>
          <RoundedBox args={[7.4, 1.9, 0.1]} radius={0.06} position={[0, 5.4, 27.28]}>
            <meshStandardMaterial color="#05070d" roughness={1} />
          </RoundedBox>
          <Signage position={[0, 5.4, 27.36]} size={1.2} color="#f5f5f0" emissive maxWidth={14} outline={0.02}>
            {profile.name.toUpperCase()}
          </Signage>
          <Signage position={[0, 3.7, 27.36]} size={0.42} color={accentHex} emissive maxWidth={15}>
            {profile.tagline.toUpperCase()}
          </Signage>
          <Signage position={[-2.6, 1.4, 27.36]} size={0.3} color={accentHex} emissive anchorX="left">
            01 / IDENTITY
          </Signage>
        </group>
      </Float>

      {/* motivated key + accent fills (faded by useReveal via intensity) */}
      <directionalLight position={[0, 20, 10]} intensity={0.4} color="#bcd3ff" />
      <pointLight position={[0, 6, 24]} intensity={35} distance={70} color={accent} />
      <pointLight position={[0, 0.4, 26]} intensity={10} distance={20} color={accent} />
    </group>
  )
}
