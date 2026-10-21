import { useMemo } from 'react'
import { Lightformer, Environment } from '@react-three/drei'

/**
 * ENVIRONMENT / image-based lighting.
 *
 * Full fidelity: a real CC0 HDRI (Poly Haven `studio_small_08`, downloaded to
 * public/assets/hdri) drives scene reflections + soft IBL, so metal, tinted
 * glass, car-paint and water read honestly. Under lowFi (reduced-motion or
 * mobile) we fall back to the zero-download <Lightformer> studio rig — a broad
 * key, a cool rim and two warm fills — which still lights chrome and clay
 * without fetching a 1.5 MB file. Individual worlds add point/spot lights on top.
 */
export function ProceduralEnv({ reduced = false }: { reduced?: boolean }) {
  const mobile = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches,
    []
  )
  const lowFi = reduced || mobile

  if (!lowFi) {
    return <Environment files="/assets/hdri/studio.hdr" resolution={512} />
  }

  return (
    <Environment resolution={256} frames={1}>
      {/* broad soft key from above */}
      <Lightformer
        intensity={2.2}
        form="rect"
        position={[0, 12, 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[30, 30, 1]}
        color="#fdf5e6"
      />
      {/* cool rim from behind the travel direction */}
      <Lightformer
        intensity={1.1}
        form="rect"
        position={[0, 4, 40]}
        rotation={[0, Math.PI, 0]}
        scale={[20, 12, 1]}
        color="#8fb8ff"
      />
      {/* warm side fills */}
      <Lightformer
        intensity={0.8}
        form="rect"
        position={[-18, 3, -10]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[16, 10, 1]}
        color="#ffd9a0"
      />
      <Lightformer
        intensity={0.8}
        form="rect"
        position={[18, 3, -10]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={[16, 10, 1]}
        color="#ffd9a0"
      />
    </Environment>
  )
}
