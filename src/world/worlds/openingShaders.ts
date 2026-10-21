import * as THREE from 'three'

/**
 * Procedural GLSL for the EMBERWAKE opening — a floor light-lattice, flowing
 * energy ribbons, volumetric god-ray cones and a hologram monolith. All inline
 * (no textures, no HDRI). Each material is a raw THREE.ShaderMaterial built from
 * the sources + uniform factory here; OpeningFlight owns the instances, mutates
 * `uTime`/`uFade`/etc. on the hoisted uniform objects each frame, and disposes
 * them on unmount. `uFade` carries the reveal factor so the additive shaders
 * (which ignore material.opacity) still fade with the world.
 */

// ─── Floor lattice: hex-ish grid + sonar pulse-rings from beneath the drone ───
export const latticeVert = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

export const latticeFrag = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec3  uAccent;
  uniform vec2  uCamXZ;
  uniform float uFade;
  varying vec3  vWorld;

  float gridLines(vec2 p, float scale) {
    vec2 g = abs(fract(p / scale - 0.5) - 0.5) / fwidth(p / scale);
    return 1.0 - min(min(g.x, g.y), 1.0);
  }

  void main() {
    vec2 xz = vWorld.xz;
    float coarse = gridLines(xz, 4.0);
    float fine   = gridLines(xz, 1.0) * 0.35;
    float lattice = clamp(coarse + fine, 0.0, 1.0);

    // sonar pulse-rings racing outward from directly beneath the camera
    float d = distance(xz, uCamXZ);
    float ring = sin(d * 0.5 - uTime * 2.0) * 0.5 + 0.5;
    ring = pow(ring, 6.0) * smoothstep(70.0, 4.0, d);

    // fade the whole field with distance so far edges melt into fog
    float fall = smoothstep(95.0, 12.0, d);

    float intensity = (lattice * 0.9 + ring * 0.8) * fall * uFade;
    vec3 col = uAccent * (0.7 + ring * 1.4);
    gl_FragColor = vec4(col * intensity, intensity);
  }
`

export function latticeUniforms(accent: THREE.Color) {
  return {
    uTime: { value: 0 },
    uAccent: { value: accent.clone() },
    uCamXZ: { value: new THREE.Vector2() },
    uFade: { value: 0 },
  }
}

// ─── Energy ribbon: sine-flow displacement + scrolling warm→cold gradient ─────
export const ribbonVert = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vLen;
  void main() {
    vUv = uv;
    vLen = uv.y;
    vec3 p = position;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    float phase = wp.x * 0.35 + wp.z * 0.2;
    p.x += sin(position.y * 0.35 + uTime * 1.5 + phase) * 0.6
         + sin(position.y * 0.13 - uTime * 0.7 + phase) * 0.9;
    p.z += cos(position.y * 0.2 + uTime * 0.9 + phase) * 0.4;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

export const ribbonFrag = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec3  uAccent;
  uniform float uFade;
  varying vec2  vUv;
  varying float vLen;
  void main() {
    vec3 cold = vec3(0.353, 0.424, 1.0); // #5a6cff
    vec3 col = mix(uAccent, cold, vLen * 0.7);
    float scroll = fract(vLen * 2.0 - uTime * 0.25);
    float streak = pow(scroll, 3.0);
    float edge = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
    float ends = smoothstep(0.0, 0.1, vLen) * smoothstep(1.0, 0.9, vLen);
    float a = (0.22 + streak * 0.9) * edge * ends * uFade;
    gl_FragColor = vec4(col * (0.6 + streak), a);
  }
`

export function ribbonUniforms(accent: THREE.Color) {
  return {
    uTime: { value: 0 },
    uAccent: { value: accent.clone() },
    uFade: { value: 0 },
  }
}

// ─── God-ray cone: soft length falloff + faint shimmer ────────────────────────
export const godrayVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const godrayFrag = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec3  uColor;
  uniform float uFade;
  varying vec2  vUv;
  void main() {
    float lengthFade = smoothstep(0.0, 0.28, vUv.y) * smoothstep(1.0, 0.35, vUv.y);
    float shimmer = 0.85 + 0.15 * sin(vUv.y * 18.0 - uTime * 2.0);
    float a = lengthFade * 0.11 * shimmer * uFade;
    gl_FragColor = vec4(uColor, a);
  }
`

export function godrayUniforms() {
  return {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#ffd9a0') },
    uFade: { value: 0 },
  }
}

// ─── Hologram monolith: scanlines, fresnel rim, bottom-up build wipe ──────────
export const hologramVert = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mv;
  }
`

export const hologramFrag = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec3  uAccent;
  uniform float uBuild;
  uniform float uFade;
  varying vec3  vNormal;
  varying vec3  vView;
  varying vec2  vUv;

  float hash(float n) { return fract(sin(n) * 43758.5453); }

  void main() {
    float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.0);
    float scan = sin(vUv.y * 220.0 - uTime * 4.0) * 0.5 + 0.5;
    float flick = 0.82 + 0.18 * hash(floor(vUv.y * 220.0) + floor(uTime * 10.0));

    // build wipe: fills from bottom (uv.y=0) to top as uBuild 0→1
    float edge = mix(0.0, 1.0, uBuild);
    float built = smoothstep(edge, edge - 0.06, vUv.y);
    float edgeGlow = smoothstep(0.05, 0.0, abs(vUv.y - edge)) * (1.0 - step(1.0, uBuild));

    float body = (0.22 + scan * 0.35) * flick + fres * 0.7 + edgeGlow * 1.6;
    float a = clamp(built * body + edgeGlow, 0.0, 1.0) * uFade;
    vec3 col = uAccent * (0.6 + scan * 0.5 + edgeGlow * 2.0);
    gl_FragColor = vec4(col, a);
  }
`

export function hologramUniforms(accent: THREE.Color) {
  return {
    uTime: { value: 0 },
    uAccent: { value: accent.clone() },
    uBuild: { value: 0 },
    uFade: { value: 0 },
  }
}
