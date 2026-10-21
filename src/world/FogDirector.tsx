import { useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { chapters } from '@/content'
import { worldIdAt } from '@/world/spline'
import { worldFx } from '@/world/worldFx'

/**
 * FogDirector — tints the exponential fog toward the CURRENT chapter's accent
 * (only ~20%, a mood not a wash) so each world emerges from a distinctly hued
 * haze rather than one grey murk, while the background stays darker/less
 * saturated than the fog so an atmospheric horizon band always reads.
 */
const BASE = '#0d1a2e'

export function FogDirector() {
  const scene = useThree((s) => s.scene)
  const base = useMemo(() => new THREE.Color(BASE), [])
  const tint = useMemo(() => new THREE.Color(), [])
  const hsl = useMemo(() => ({ h: 0, s: 0, l: 0 }), [])
  const accents = useMemo(() => {
    const map: Record<string, THREE.Color> = {}
    for (const c of chapters) {
      const [r, g, b] = c.accent.split(' ').map(Number)
      map[c.id] = new THREE.Color().setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace)
    }
    return map
  }, [])

  useFrame(() => {
    const fog = scene.fog as THREE.FogExp2 | null
    if (!fog) return
    tint.copy(accents[worldIdAt(worldFx.t)] ?? base)
    // Cap the accent's saturation first so neon hues (e.g. the pop-culture
    // phosphor green) read as a hued haze, not a wash that floods the room —
    // balanced accents (the garage's warm orange) already sit well below the cap.
    tint.getHSL(hsl)
    if (hsl.s > 0.5) tint.setHSL(hsl.h, 0.5, hsl.l)
    fog.color.copy(base).lerp(tint, 0.2)
  })

  return null
}
