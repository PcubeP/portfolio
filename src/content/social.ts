import type { SocialLink } from './types'

/**
 * SOCIAL — DO NOT invent URLs. `url` is intentionally undefined so each node
 * renders as an inactive placeholder until you provide the real link.
 */
export const social: SocialLink[] = [
  { id: 'linkedin', platform: 'LinkedIn', handle: '[[ /in/you ]]', note: 'Professional signal' },
  { id: 'github', platform: 'GitHub', handle: '[[ @you ]]', note: 'The workshop' },
  { id: 'instagram', platform: 'Instagram', handle: '[[ @you ]]', note: 'The visual diary' },
  { id: 'youtube', platform: 'YouTube', handle: '[[ @you ]]', note: 'Moving pictures' },
  { id: 'x', platform: 'X', handle: '[[ @you ]]', note: 'Short transmissions' },
  { id: 'email', platform: 'Email', handle: '[[ you@domain ]]', note: 'Direct line' },
]
