import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Backdrop — a camera-following gradient sky sphere that guarantees nothing ever
 * sits against pure black. Its horizon colour is locked to the scene fog colour
 * every frame (which FogDirector tints per world), so geometry fogging out in
 * the distance melts seamlessly into the sky instead of hanging in a void — the
 * single biggest cue separating "a place" from "objects floating in nothing".
 * Renders first, writes no depth, ignores fog; radius sits inside camera.far.
 */
export function Backdrop() {
  const ref = useRef<THREE.Mesh>(null)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          horizon: { value: new THREE.Color('#1b2c44') },
          zenith: { value: new THREE.Color('#070b12') },
        },
        vertexShader: `
          varying vec3 vDir;
          void main() {
            vDir = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vDir;
          uniform vec3 horizon;
          uniform vec3 zenith;
          void main() {
            float h = normalize(vDir).y * 0.5 + 0.5;         // 0 down → 1 up
            // dense near the horizon, easing to zenith — reads as atmosphere
            float g = smoothstep(0.0, 0.72, h);
            vec3 c = mix(horizon, zenith, g);
            gl_FragColor = vec4(c, 1.0);
          }
        `,
      }),
    []
  )

  useFrame(() => {
    if (ref.current) ref.current.position.copy(camera.position)
    const fog = scene.fog as THREE.FogExp2 | null
    if (fog) {
      const h = mat.uniforms.horizon.value as THREE.Color
      const z = mat.uniforms.zenith.value as THREE.Color
      h.copy(fog.color)
      z.copy(fog.color).multiplyScalar(0.32) // darker overhead
    }
  })

  return (
    <mesh ref={ref} scale={320} renderOrder={-1000} frustumCulled={false}>
      <sphereGeometry args={[1, 32, 16]} />
      <primitive object={mat} attach="material" />
    </mesh>
  )
}
