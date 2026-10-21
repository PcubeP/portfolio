import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Effect } from 'postprocessing'
import { Uniform } from 'three'
import { worldFx } from '@/world/worldFx'

/**
 * DiveEffect — the screen-space payoff of piercing the water surface. A single
 * fragment pass that, as `submergence` ramps 0→1:
 *   · warps the image with a sine ripple (refraction through a moving surface)
 *   · splits the RGB channels outward (chromatic aberration under water)
 *   · sinks the palette toward deep teal and darkens with depth
 *   · adds a faint vignette of caustic shimmer at the edges
 * `droplets` adds transient lens-bead distortion when breaching back out.
 *
 * Built as a postprocessing `Effect` (single merged pass in the composer) rather
 * than stacked drei effects, so the refraction and the colour shift share one
 * sampling of the input buffer.
 */
const fragment = /* glsl */ `
  uniform float submergence;
  uniform float droplets;
  uniform float time;

  void mainUv(inout vec2 uv) {
    // refraction: horizontal + vertical sine ripple, strength ∝ submergence
    float s = submergence;
    uv.x += sin(uv.y * 26.0 + time * 1.8) * 0.006 * s;
    uv.y += cos(uv.x * 22.0 - time * 1.5) * 0.006 * s;

    // lens droplets on breach: a few travelling beads that pull the image
    if (droplets > 0.001) {
      vec2 c = vec2(0.5 + sin(time) * 0.2, 0.7 - fract(time * 0.3));
      float d = distance(uv, c);
      uv += normalize(uv - c) * 0.02 * droplets * smoothstep(0.25, 0.0, d);
    }
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    float s = submergence;

    // chromatic aberration outward from centre, scaled by depth
    vec2 dir = uv - 0.5;
    float ca = 0.004 * s + 0.006 * droplets;
    float r = texture2D(inputBuffer, uv - dir * ca).r;
    float g = inputColor.g;
    float b = texture2D(inputBuffer, uv + dir * ca).b;
    vec3 col = vec3(r, g, b);

    // sink toward deep teal, darken with depth
    vec3 deep = vec3(0.03, 0.18, 0.22);
    col = mix(col, col * deep * 3.0, s * 0.6);
    col *= mix(1.0, 0.55, s);

    // caustic shimmer near the edges while submerged
    float shimmer = sin(uv.x * 40.0 + time * 2.0) * sin(uv.y * 34.0 - time * 1.7);
    col += vec3(0.05, 0.12, 0.12) * max(0.0, shimmer) * s * 0.5;

    outputColor = vec4(col, inputColor.a);
  }
`

class DiveEffectImpl extends Effect {
  constructor() {
    super('DiveEffect', fragment, {
      uniforms: new Map<string, Uniform<number>>([
        ['submergence', new Uniform(0)],
        ['droplets', new Uniform(0)],
        ['time', new Uniform(0)],
      ]),
    })
  }
}

/** Composer child: owns the effect and pumps the FX-bus scalars into it. */
export function DiveEffect() {
  const effect = useMemo(() => new DiveEffectImpl(), [])
  useFrame(() => {
    const u = effect.uniforms
    u.get('submergence')!.value = worldFx.submergence
    u.get('droplets')!.value = worldFx.droplets
    u.get('time')!.value = worldFx.time
  })
  return <primitive object={effect} dispose={null} />
}
