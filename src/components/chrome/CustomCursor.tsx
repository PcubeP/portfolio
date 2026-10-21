import { useEffect, useState } from 'react'

/**
 * Reactive custom cursor: an instant inner dot and a lagging outer ring that
 * grows and shows a contextual label over interactive elements. Uses the
 * global --mx/--my CSS vars (no React churn) and mix-blend so it reads on any
 * background. Only mounts on fine pointers with motion allowed — otherwise the
 * native cursor is used untouched.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false)
  const [hover, setHover] = useState(false)
  const [down, setDown] = useState(false)
  const [label, setLabel] = useState('')

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduced) return
    setEnabled(true)
    document.documentElement.classList.add('has-custom-cursor')

    const onOver = (e: PointerEvent) => {
      const el = (e.target as HTMLElement)?.closest?.(
        'a,button,[role="button"],[data-cursor],input,summary,label'
      ) as HTMLElement | null
      setHover(!!el)
      setLabel(el?.getAttribute('data-cursor-label') ?? '')
    }
    const onDown = () => setDown(true)
    const onUp = () => setDown(false)

    document.addEventListener('pointerover', onOver)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    return () => {
      document.documentElement.classList.remove('has-custom-cursor')
      document.removeEventListener('pointerover', onOver)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  if (!enabled) return null

  const pos = {
    transform:
      'translate3d(calc(var(--mx,-100) * 1px), calc(var(--my,-100) * 1px), 0) translate(-50%, -50%)',
  } as React.CSSProperties

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[130]">
      {/* lagging reticle — a camera-viewfinder ring with rotating tick marks */}
      <div
        className="fixed left-0 top-0 grid place-items-center rounded-full transition-[width,height] duration-200 ease-out"
        style={{
          ...pos,
          width: hover ? 64 : down ? 20 : 34,
          height: hover ? 64 : down ? 20 : 34,
          transition: 'transform 110ms ease-out, width 200ms ease, height 200ms ease',
          mixBlendMode: 'difference',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          style={{ animation: 'cursor-spin 7s linear infinite' }}
        >
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgb(var(--accent))" strokeWidth="2.5" strokeDasharray="3 10" />
          <line x1="50" y1="1" x2="50" y2="14" stroke="rgb(var(--accent))" strokeWidth="2.5" />
          <line x1="50" y1="86" x2="50" y2="99" stroke="rgb(var(--accent))" strokeWidth="2.5" />
          <line x1="1" y1="50" x2="14" y2="50" stroke="rgb(var(--accent))" strokeWidth="2.5" />
          <line x1="86" y1="50" x2="99" y2="50" stroke="rgb(var(--accent))" strokeWidth="2.5" />
        </svg>
        {label && (
          <span className="relative font-mono text-[0.55rem] uppercase tracking-widest2 text-accent">
            {label}
          </span>
        )}
      </div>
      {/* instant dot — flashes red like a shutter release while pressed */}
      <div
        className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full transition-colors duration-150"
        style={{
          ...pos,
          opacity: hover ? 0 : 1,
          mixBlendMode: 'difference',
          background: down ? 'rgb(214 44 58)' : 'rgb(var(--accent))',
          transform: pos.transform + (down ? ' scale(1.8)' : ''),
        }}
      />
    </div>
  )
}
