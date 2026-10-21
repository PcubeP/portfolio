import { useEffect, useRef, useState, type ElementType } from 'react'
import { cn } from '@/lib/cn'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const GLYPHS = '01<>/\[]{}#$%*+=~ABCDEFXYZ'

/**
 * Text that briefly "decodes" from random glyphs into the real string when it
 * mounts or is hovered. Purely decorative — the real text is always in the DOM
 * for screen readers via the sr-only span.
 */
export function GlitchText({
  text,
  className,
  as: Tag = 'span',
  decodeOnMount = true,
}: {
  text: string
  className?: string
  as?: ElementType
  decodeOnMount?: boolean
}) {
  const reduced = useReducedMotion()
  const [display, setDisplay] = useState(reduced ? text : decodeOnMount ? '' : text)
  const frame = useRef(0)

  const run = () => {
    if (reduced) return
    let iteration = 0
    cancelAnimationFrame(frame.current)
    const step = () => {
      setDisplay(
        text
          .split('')
          .map((ch, i) => {
            if (ch === ' ') return ' '
            if (i < iteration) return text[i]
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          })
          .join('')
      )
      iteration += 1 / 2
      if (iteration < text.length) frame.current = requestAnimationFrame(step)
      else setDisplay(text)
    }
    frame.current = requestAnimationFrame(step)
  }

  useEffect(() => {
    if (decodeOnMount) run()
    return () => cancelAnimationFrame(frame.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  return (
    <Tag className={cn('inline-block', className)} onMouseEnter={run} aria-label={text}>
      <span aria-hidden="true">{display || ' '}</span>
    </Tag>
  )
}
