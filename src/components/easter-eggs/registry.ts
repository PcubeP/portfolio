/**
 * EASTER-EGG REGISTRY
 * -------------------
 * Add a new egg by appending here and wiring a detector in EasterEggs.tsx.
 * `hint` is shown (locked) in the ARCADE achievements panel so curious visitors
 * know secrets exist without being told how.
 */
export interface EggDef {
  id: string
  label: string
  hint: string
}

export const EGGS: EggDef[] = [
  { id: 'konami', label: 'THE CODE', hint: 'An old code still opens doors.' },
  { id: 'matrix', label: 'FOLLOW THE WHITE RABBIT', hint: 'Type what you already believe in.' },
  { id: 'glyph', label: 'PERSISTENCE', hint: 'Some things reward repetition.' },
  { id: 'depths', label: 'THE DEEP END', hint: 'Reach the very end of the journey.' },
]
