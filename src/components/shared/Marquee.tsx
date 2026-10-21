import { cn } from '@/lib/cn'

/**
 * Marquee — infinite scrolling text band. Hardware-accelerated CSS.
 * Doubles the content so the seam is invisible.
 *
 * Usage:
 *   <Marquee text="SWIMMING · TENNIS · FOOTBALL ·" />
 *   <Marquee text="..." direction="right" speed={60} className="border-y border-line" />
 */
export function Marquee({
  text,
  direction = 'left',
  speed = 40,
  className,
  textClassName,
}: {
  text: string
  direction?: 'left' | 'right'
  speed?: number   // seconds for one full loop
  className?: string
  textClassName?: string
}) {
  const animName = direction === 'right' ? 'marquee-right' : 'marquee-left'
  return (
    <div
      className={cn('overflow-hidden whitespace-nowrap', className)}
      aria-hidden="true"
    >
      <span
        className={cn('inline-block', textClassName)}
        style={{
          animation: `${animName} ${speed}s linear infinite`,
          willChange: 'transform',
        }}
      >
        {/* Doubled so the loop is seamless */}
        {text}&nbsp;&nbsp;{text}&nbsp;&nbsp;
      </span>
    </div>
  )
}
