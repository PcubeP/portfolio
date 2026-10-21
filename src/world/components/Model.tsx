import { Suspense, useMemo, useRef, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Vector3Tuple } from 'three'
import { worldFx } from '@/world/worldFx'

/**
 * Model — a real CC0 photoscanned glTF prop (downloaded into public/assets/models
 * by scripts/fetch-assets.mjs). This is what actually kills the "primitive box"
 * look: real geometry with baked-in AO and surface detail, lit by the HDRI so
 * metal/plastic/paint read as physical materials.
 *
 * The multi-file glTF (a .gltf + .bin + textures/) is loaded by drei's useGLTF;
 * we clone the scene per instance, enable shadows on every mesh, and nudge
 * envMapIntensity so the shared HDRI grounds each prop. Loading suspends, so a
 * Model must sit under a <Suspense> — NearGate provides one.
 */
const BASE = '/assets/models'

export function useModel(
  folder: string,
  { envMapIntensity = 1, shadows = true }: { envMapIntensity?: number; shadows?: boolean } = {}
): THREE.Object3D {
  const { scene } = useGLTF(`${BASE}/${folder}/model.gltf`)
  return useMemo(() => {
    const root = scene.clone(true)
    root.traverse((o) => {
      const m = o as THREE.Mesh
      if (!(m as unknown as { isMesh?: boolean }).isMesh) return
      if (shadows) {
        m.castShadow = true
        m.receiveShadow = true
      }
      const mats = Array.isArray(m.material) ? m.material : [m.material]
      for (const mat of mats) {
        const s = mat as THREE.MeshStandardMaterial
        if (s && 'envMapIntensity' in s) s.envMapIntensity = envMapIntensity
      }
    })
    return root
  }, [scene, envMapIntensity, shadows])
}

export function Model({
  folder,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  envMapIntensity = 1,
  shadows = true,
}: {
  folder: string
  position?: Vector3Tuple
  rotation?: Vector3Tuple
  scale?: number | Vector3Tuple
  envMapIntensity?: number
  shadows?: boolean
}) {
  const obj = useModel(folder, { envMapIntensity, shadows })
  return <primitive object={obj} position={position} rotation={rotation} scale={scale} />
}

/**
 * NearGate — defers mounting (and therefore the network fetch) of heavy glTF
 * props until the drone flies near their world. The reveal system keeps every
 * world MOUNTED and only toggles `.visible`/opacity, so ungated <Model>s would
 * pull all ~30 MB of photoscans at startup. Instead we watch the smoothed flown
 * parameter (`worldFx.t`) and only render children once it enters the world's
 * range (± margin). Once mounted we keep them — reload thrash on scrub-back is
 * worse than the bounded memory of a couple of decoded glTFs.
 */
export function NearGate({
  range: [a, b],
  margin = 0.06,
  children,
}: {
  range: [number, number]
  margin?: number
  children: React.ReactNode
}) {
  const [on, setOn] = useState(false)
  const armed = useRef(false)
  useFrame(() => {
    if (armed.current) return
    const t = worldFx.t
    if (t >= a - margin && t <= b + margin) {
      armed.current = true
      setOn(true)
    }
  })
  return on ? <Suspense fallback={null}>{children}</Suspense> : null
}
