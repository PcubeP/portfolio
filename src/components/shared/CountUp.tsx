import { useEffect, useRef, useState } from 'react'

/**
 * CountUp — animates a numeric string from 0 to its value when it enters
 * the viewport. Non-numeric values render immediately with no animation.
 *
 * Supports suffixes: "23" → counts 0→23; "672+" → counts 0→672 then adds "+".
 */
export function CountUp({
  value,
  duration = 1800,
  className,
}: {
  value: string
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(value)
  const startedRef = useRef(false)

  // Parse the number and suffix
  const match = value.match(/^(\d+)(.*)$/)
  const isNumeric = !!match

  useEffect(() => {
    if (!isNumeric || startedRef.current) return
    const target = parseInt(match![1], 10)
    const suffix = match![2] ?? ''

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || startedRef.current) return
        startedRef.current = true
        observer.disconnect()

        const startTime = performance.now()
        const tick = (now: number) => {
          const elapsed = now - startTime
          const progress = Math.min(elapsed / duration, 1)
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3)
          const current = Math.round(eased * target)
          setDisplay(String(current) + suffix)
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.5 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [isNumeric, duration, match])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}
