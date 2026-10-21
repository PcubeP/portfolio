import { useEffect, useRef } from 'react'

/**
 * Fires `onMatch` when the user types `sequence` (array of KeyboardEvent.key
 * values, case-insensitive). Used by the easter-egg system.
 */
export function useKeySequence(sequence: string[], onMatch: () => void) {
  const idx = useRef(0)
  useEffect(() => {
    const norm = sequence.map((k) => k.toLowerCase())
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (key === norm[idx.current]) {
        idx.current += 1
        if (idx.current === norm.length) {
          idx.current = 0
          onMatch()
        }
      } else {
        // allow restart if the mismatched key is the first key
        idx.current = key === norm[0] ? 1 : 0
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sequence, onMatch])
}
