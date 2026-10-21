import { cn } from '@/lib/cn'

/**
 * RollText — wraps children in a roll-up animation on hover.
 * The parent must have `group` class; this reacts to `group-hover`.
 *
 * Usage (wrap the interactive parent in group, put RollText inside):
 *   <button className="group overflow-hidden">
 *     <RollText>Click me</RollText>
 *   </button>
 *
 * Uses pure CSS — no JS, hardware-accelerated transform.
 */
export function RollText({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'relative inline-flex h-[1.15em] flex-col overflow-hidden',
        className
      )}
    >
      {/* Visible line — slides up on hover */}
      <span className="transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full">
        {children}
      </span>
      {/* Hidden duplicate — slides in from below on hover */}
      <span
        className="absolute top-full transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full"
        aria-hidden="true"
      >
        {children}
      </span>
    </span>
  )
}
