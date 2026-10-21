import { Text } from '@react-three/drei'
import type { Vector3Tuple } from 'three'

/**
 * Signage — physical in-world text. A troika SDF label (drei <Text>) that lives
 * in 3D space: it has a position, faces a direction, catches fog and can glow.
 * This is how *all* copy is delivered in the world — discovered as objects, not
 * laid over the scene as HTML. The readable long-form prose lives in the DOM
 * section layer for a11y; these are the headlines you fly past.
 *
 * Fonts are bundled locally (public/assets/fonts, OFL/Apache) so nothing is
 * fetched from a CDN at runtime: a Chakra Petch display face by default, and a
 * Rubik Spray Paint graffiti face for the artwork tags in the garage.
 */
const FONTS = {
  display: '/assets/fonts/display.ttf',
  graffiti: '/assets/fonts/graffiti.ttf',
} as const

export function Signage({
  children,
  position,
  rotation = [0, 0, 0],
  size = 1,
  color = '#f5f5f0',
  emissive = false,
  anchorX = 'center',
  maxWidth,
  outline = 0,
  font = 'display',
  letterSpacing = 0.02,
}: {
  children: string
  position: Vector3Tuple
  rotation?: Vector3Tuple
  size?: number
  color?: string
  /** render as an emissive material so Bloom picks it up (signs that "glow") */
  emissive?: boolean
  anchorX?: 'left' | 'center' | 'right'
  maxWidth?: number
  outline?: number
  /** which bundled face to use */
  font?: keyof typeof FONTS
  letterSpacing?: number
}) {
  return (
    <Text
      font={FONTS[font]}
      position={position}
      rotation={rotation}
      fontSize={size}
      color={color}
      anchorX={anchorX}
      anchorY="middle"
      maxWidth={maxWidth}
      outlineWidth={outline}
      outlineColor="#000000"
      letterSpacing={letterSpacing}
    >
      {children}
      <meshStandardMaterial
        color={color}
        emissive={emissive ? color : '#000000'}
        emissiveIntensity={emissive ? 0.8 : 0}
        toneMapped={!emissive}
      />
    </Text>
  )
}
