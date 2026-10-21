import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Effect } from 'postprocessing'
import { Uniform } from 'three'
import { worldFx } from '@/world/worldFx'

/**
 * CRTEffect — the "you are inside the television" pass. As `entry` ramps 0→1
 * (camera passing through the glass) it applies, all in one merged pass:
 *   · barrel/pincushion curvature warping the whole frame
 *   · horizontal scanlines + an aperture-grille RGB phosphor mask
 *   · slight RGB separation (badly-converged tube)
 *   · animated static noise + a slow rolling brightness bar
 *   · exposure flicker + a heavy tube vignette
 * At entry 0 it is a perfect no-op, so it can live permanently in the composer.
 */
const fragment = /* glsl */ `
  uniform float entry;
  uniform float time;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void mainUv(inout vec2 uv) {
    // barrel curvature — bend the sampling coords outward from centre
    vec2 c = uv - 0.5;
    float r2 = dot(c, c);
    uv = 0.5 + c * (1.0 + r2 * 0.35 * entry);
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    float e = entry;

    // off-screen after curvature → black tube border
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
      outputColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }

    // RGB separation
    float sep = 0.0016 * e;
    float r = texture2D(inputBuffer, uv + vec2(sep, 0.0)).r;
    float g = inputColor.g;
    float b = texture2D(inputBuffer, uv - vec2(sep, 0.0)).b;
    vec3 col = vec3(r, g, b);

    // aperture-grille phosphor mask (RGB stripes across x)
    float m = mod(gl_FragCoord.x, 3.0);
    vec3 mask = vec3(m < 1.0 ? 1.0 : 0.55, (m >= 1.0 && m < 2.0) ? 1.0 : 0.55, m >= 2.0 ? 1.0 : 0.55);
    col *= mix(vec3(1.0), mask, e);

    // scanlines
    float scan = 0.8 + 0.2 * sin(uv.y * 900.0);
    col *= mix(1.0, scan, e);

    // rolling brightness bar
    float roll = smoothstep(0.0, 0.1, fract(uv.y * 0.5 - time * 0.15));
    col *= mix(1.0, 0.85 + 0.15 * roll, e);

    // animated static
    float n = hash(uv * vec2(640.0, 480.0) + time);
    col += (n - 0.5) * 0.10 * e;

    // exposure flicker
    col *= mix(1.0, 0.95 + 0.05 * sin(time * 50.0), e);

    // tube vignette
    vec2 vc = uv - 0.5;
    float vig = smoothstep(0.75, 0.2, dot(vc, vc) * 2.2);
    col *= mix(1.0, vig, e);

    outputColor = vec4(col, inputColor.a);
  }
`

class CRTEffectImpl extends Effect {
  constructor() {
    super('CRTEffect', fragment, {
      uniforms: new Map<string, Uniform<number>>([
        ['entry', new Uniform(0)],
        ['time', new Uniform(0)],
      ]),
    })
  }
}

/** Composer child: owns the effect and pumps the FX-bus scalars into it. */
export function CRTEffect() {
  const effect = useMemo(() => new CRTEffectImpl(), [])
  useFrame(() => {
    const u = effect.uniforms
    u.get('entry')!.value = worldFx.crtEntry
    u.get('time')!.value = worldFx.time
  })
  return <primitive object={effect} dispose={null} />
}
