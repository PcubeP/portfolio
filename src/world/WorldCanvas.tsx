import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, AdaptiveDpr, SoftShadows } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, N8AO, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import { chapters } from '@/content'
import { CameraRig } from '@/world/CameraRig'
import { ProceduralEnv } from '@/world/proceduralEnv'
import { Backdrop } from '@/world/Backdrop'
import { positionAt, WORLDS } from '@/world/spline'
import { Reveal } from '@/world/useReveal'
import { FogDirector } from '@/world/FogDirector'
import { Gateway } from '@/world/components/Gateway'
import { DiveEffect } from '@/world/effects/DiveEffect'
import { CRTEffect } from '@/world/effects/CRTEffect'

import { OpeningFlight } from '@/world/worlds/OpeningFlight'
import { Journey } from '@/world/worlds/Journey'
import { Creations } from '@/world/worlds/Creations'
import { Pool } from '@/world/worlds/Pool'
import { Tennis } from '@/world/worlds/Tennis'
import { WorldsDiorama } from '@/world/worlds/WorldsDiorama'
import { CRT } from '@/world/worlds/CRT'
import { Arcade } from '@/world/worlds/Arcade'
import { Connect } from '@/world/worlds/Connect'

/** "r g b" (0-255) accent string → linear THREE.Color. */
function accentColor(id: string): THREE.Color {
  const meta = chapters.find((c) => c.id === id)
  const [r, g, b] = (meta?.accent ?? '255 255 255').split(' ').map(Number)
  return new THREE.Color().setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace)
}

/**
 * WorldCanvas — the single fixed-viewport R3F stage. Lazy-loaded (this is the
 * heavy three.js chunk) and mounted only after the intro gate. Hosts the camera
 * rig, procedural lighting, fog, the post stack and every world. It is a sibling
 * of <main> in the DOM (never a descendant) so `position:fixed` isn't trapped by
 * a transformed ancestor.
 */
export default function WorldCanvas({
  targetT,
  reduced,
}: {
  targetT: React.MutableRefObject<number>
  reduced: boolean
}) {
  const accents = useMemo(
    () => Object.fromEntries(chapters.map((c) => [c.id, accentColor(c.id)])),
    []
  )
  const start = useMemo(() => positionAt(0).clone(), [])
  const R = useMemo(
    () => Object.fromEntries(WORLDS.map((w) => [w.id, w.range])) as Record<string, [number, number]>,
    []
  )

  // Mobile gets a lighter pipeline (no PCSS soft shadows, no SSAO) to hold FPS.
  const mobile = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches,
    []
  )
  const lowFi = reduced || mobile

  // Post stack, assembled as an array so the SSAO pass can be dropped on mobile
  // without a boolean sneaking into EffectComposer's element-only children.
  const post = [
    mobile ? null : (
      <N8AO key="ao" aoRadius={1.4} intensity={1.3} distanceFalloff={1} quality="performance" />
    ),
    <DiveEffect key="dive" />,
    <CRTEffect key="crt" />,
    <Bloom key="bloom" mipmapBlur intensity={0.7} luminanceThreshold={0.7} luminanceSmoothing={0.3} />,
    <Vignette key="vignette" eskil={false} offset={0.25} darkness={0.45} />,
    // tone map LAST so bloom/AO operate in linear HDR, then ACES to sRGB.
    <ToneMapping key="tone" mode={ToneMappingMode.ACES_FILMIC} />,
  ].filter((e): e is JSX.Element => e !== null)

  return (
    <Canvas
      className="world-canvas"
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100dvh', zIndex: 2 }}
      dpr={[1, 2]}
      shadows={{ type: THREE.PCFSoftShadowMap }}
      frameloop={reduced ? 'demand' : 'always'}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        // ACES on the renderer for the reduced path (no composer). When the
        // composer runs it owns tone mapping via a final <ToneMapping> effect,
        // so we leave the renderer linear to avoid tone-mapping twice.
        toneMapping: reduced ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping,
        toneMappingExposure: 1.25,
      }}
      aria-hidden="true"
    >
      <color attach="background" args={['#0d1a2e']} />
      <fogExp2 attach="fog" args={['#0d1a2e', 0.048]} />

      {/* gradient sky so nothing ever sits against pure black */}
      <Backdrop />

      {/* Percentage-closer soft shadows — contact-hard near the caster, softening
          with distance. The single biggest "this is 3D, not a diorama" cue.
          Skipped under lowFi (recompiles every material; too heavy for mobile). */}
      {!lowFi && <SoftShadows size={26} samples={12} focus={0.6} />}

      <PerspectiveCamera
        makeDefault
        fov={55}
        near={0.1}
        far={400}
        position={[start.x, start.y, start.z]}
      />
      <CameraRig targetT={targetT} reduced={reduced} />
      <FogDirector />

      <Suspense fallback={null}>
        <ProceduralEnv reduced={reduced} />
      </Suspense>

      <ambientLight intensity={0.7} />
      <hemisphereLight args={['#bcd3ff', '#1c2740', 0.8]} />
      {/* global key light — gives every prop form + a cast direction so nothing
          reads as flat unlit geometry (per-world spots/points add accents). */}
      <directionalLight position={[18, 30, 12]} intensity={1.5} color="#fff2dd" />

      <Suspense fallback={null}>
        <Suspense fallback={null}>
          <Reveal range={R.identity} opts={{ lead: 0, trail: 0.04 }}>
            <OpeningFlight accent={accents.identity} reduced={reduced} />
          </Reveal>
        </Suspense>
        <Suspense fallback={null}>
          <Reveal range={R.journey} opts={{ lead: 0.05, trail: 0.045 }}>
            <Journey accent={accents.journey} reduced={reduced} />
          </Reveal>
        </Suspense>
        <Suspense fallback={null}>
          <Reveal range={R.creations} opts={{ lead: 0.05, trail: 0.045 }}>
            <Creations accent={accents.creations} reduced={reduced} />
          </Reveal>
        </Suspense>
        <Suspense fallback={null}>
          <Reveal range={R.arena} opts={{ lead: 0.06, trail: 0.05 }}>
            <Pool accent={accents.arena} reduced={reduced} />
            <Tennis accent={accents.arena} reduced={reduced} />
          </Reveal>
        </Suspense>
        <Suspense fallback={null}>
          <Reveal range={R.worlds} opts={{ lead: 0.045, trail: 0.04 }}>
            <WorldsDiorama accent={accents.worlds} reduced={reduced} />
          </Reveal>
        </Suspense>
        <Suspense fallback={null}>
          <Reveal range={R.popculture} opts={{ lead: 0.05, trail: 0.045 }}>
            <CRT accent={accents.popculture} reduced={reduced} />
          </Reveal>
        </Suspense>
        <Suspense fallback={null}>
          <Reveal range={R.arcade} opts={{ lead: 0.035, trail: 0.03 }}>
            <Arcade accent={accents.arcade} reduced={reduced} />
          </Reveal>
        </Suspense>
        <Suspense fallback={null}>
          <Reveal range={R.connect} opts={{ lead: 0.035, trail: 0 }}>
            <Connect accent={accents.connect} reduced={reduced} />
          </Reveal>
        </Suspense>

        {/* diegetic veils at the "dry" seams (pool dive + CRT glass are physical) */}
        <Gateway t={0.09} accent={accents.journey} reduced={reduced} />
        <Gateway t={0.2} accent={accents.creations} reduced={reduced} />
        <Gateway t={0.3} accent={accents.arena} reduced={reduced} />
        <Gateway t={0.6} accent={accents.worlds} reduced={reduced} />
        <Gateway t={0.86} accent={accents.arcade} reduced={reduced} />
        <Gateway t={0.93} accent={accents.connect} reduced={reduced} />
      </Suspense>

      {!reduced && (
        <EffectComposer enableNormalPass={false} multisampling={mobile ? 0 : 4}>
          {post}
        </EffectComposer>
      )}

      <AdaptiveDpr pixelated />
    </Canvas>
  )
}
