import { useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

/**
 * usePBR — load a real CC0 PBR texture set (downloaded into public/assets by
 * scripts/fetch-assets.mjs) and return props ready to spread onto a
 * <meshStandardMaterial>. Hero sets ship 4K maps, props 2K:
 *   diff.jpg  — albedo  (sRGB)
 *   nor.jpg   — OpenGL tangent-space normal (linear)
 *   arm.jpg   — packed AO(r) / Roughness(g) / Metalness(b) (linear)
 *   disp.jpg  — height/displacement (linear, hero sets only) — loaded only when
 *               `displacementScale` is passed AND the caller subdivides its geometry
 *   diff_low.jpg — 2K albedo for the lowFi path (phones never fetch the 4K one)
 * The single `arm` map feeds both roughnessMap (uses .g) and metalnessMap
 * (uses .b), the standard glTF ORM packing — one fetch, two channels.
 *
 * Textures are cloned per-hook so each surface owns its own wrap/repeat without
 * mutating the shared drei cache. Under `diffuseOnly` (mobile / reduced-motion)
 * only the lightweight 2K albedo loads — still a real material, just lighter,
 * never a flat gradient. Loading suspends, so callers must sit under a <Suspense>.
 */
const BASE = '/assets/textures'

export interface PBROptions {
  /** UV tiling; larger = smaller features. */
  repeat?: [number, number]
  anisotropy?: number
  normalScale?: number
  /** load 2K albedo only (lowFi) — no normal/arm/disp maps. */
  diffuseOnly?: boolean
  /** height-map relief; requires subdivided geometry. Omit/0 = no displacement. */
  displacementScale?: number
}

export interface PBRProps {
  map: THREE.Texture
  normalMap?: THREE.Texture
  normalScale?: THREE.Vector2
  roughnessMap?: THREE.Texture
  metalnessMap?: THREE.Texture
  displacementMap?: THREE.Texture
  displacementScale?: number
}

export function usePBR(
  set: string,
  {
    repeat = [1, 1],
    anisotropy = 16,
    normalScale = 1,
    diffuseOnly = false,
    displacementScale = 0,
  }: PBROptions = {}
): PBRProps {
  const wantDisp = !diffuseOnly && displacementScale > 0
  const urls: Record<string, string> = diffuseOnly
    ? { map: `${BASE}/${set}/diff_low.jpg` }
    : {
        map: `${BASE}/${set}/diff.jpg`,
        normalMap: `${BASE}/${set}/nor.jpg`,
        roughnessMap: `${BASE}/${set}/arm.jpg`,
        metalnessMap: `${BASE}/${set}/arm.jpg`,
        ...(wantDisp ? { displacementMap: `${BASE}/${set}/disp.jpg` } : {}),
      }

  const raw = useTexture(urls) as Record<string, THREE.Texture>
  const [rx, ry] = repeat

  return useMemo(() => {
    const prep = (t0: THREE.Texture, srgb: boolean) => {
      const t = t0.clone()
      t.needsUpdate = true
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      t.repeat.set(rx, ry)
      t.anisotropy = anisotropy
      t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
      return t
    }
    const out: PBRProps = { map: prep(raw.map, true) }
    if (raw.normalMap) {
      out.normalMap = prep(raw.normalMap, false)
      out.normalScale = new THREE.Vector2(normalScale, normalScale)
    }
    if (raw.roughnessMap) out.roughnessMap = prep(raw.roughnessMap, false)
    if (raw.metalnessMap) out.metalnessMap = prep(raw.metalnessMap, false)
    if (raw.displacementMap) {
      out.displacementMap = prep(raw.displacementMap, false)
      out.displacementScale = displacementScale
    }
    return out
  }, [raw, rx, ry, anisotropy, normalScale, displacementScale])
}
