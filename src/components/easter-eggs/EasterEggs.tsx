import { useCallback, useEffect, useState } from 'react'
import { useKeySequence } from '@/hooks/useKeySequence'
import { useExperience } from '@/context/ExperienceContext'
import { MatrixRain } from './MatrixRain'
import { EGGS } from './registry'

const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a',
]
const MATRIX = ['m', 'a', 't', 'r', 'i', 'x']

/**
 * Central easter-egg controller. Detectors call `discover(id)`; the ARCADE
 * panel reflects which are found. Extend by adding to registry.ts + a detector.
 */
export function EasterEggs() {
  const { discover } = useExperience()
  const [rain, setRain] = useState(false)

  const egg = useCallback(
    (id: string) => {
      const def = EGGS.find((e) => e.id === id)
      if (def) discover(def.id, def.label)
    },
    [discover]
  )

  useKeySequence(KONAMI, () => {
    egg('konami')
    setRain(true)
  })
  useKeySequence(MATRIX, () => {
    egg('matrix')
    setRain(true)
  })

  // Friendly console signature for the developers who open dev tools.
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(
      '%c> SYSTEM ONLINE\n%cYou found the console. Curiosity noted.\nTry the Konami code. Or just type what you believe in.',
      'color:#ff5b2e;font-weight:bold;font-family:monospace',
      'color:#8a8e98;font-family:monospace'
    )
  }, [])

  return rain ? <MatrixRain onDone={() => setRain(false)} /> : null
}
