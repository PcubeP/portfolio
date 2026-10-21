import { forwardRef, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import type { Theme } from '@/lib/themes'

/**
 * Semantic section wrapper for each world. Provides the scroll anchor id,
 * an accessible landmark, and optional per-section theming: passing `theme`
 * locally overrides the design tokens (ink/surface/fg/accent...) and paints
 * the section's own background, so each world can look entirely different.
 *
 * `bare` drops the default centred-column rhythm for full-bleed compositions.
 */
export const Chapter = forwardRef<HTMLElement, {
  id: string
  label: string
  children: ReactNode
  className?: string
  full?: boolean
  bare?: boolean
  theme?: Theme
}>(function Chapter({ id, label, children, className, full, bare, theme }, ref) {
  return (
    <section
      ref={ref}
      id={id}
      aria-label={label}
      data-theme={theme ? 'custom' : undefined}
      style={
        theme
          ? ({ ...(theme as React.CSSProperties), background: 'rgb(var(--ink))' })
          : undefined
      }
      className={cn(
        !bare && 'chapter',
        full && 'p-0',
        theme && 'relative isolate overflow-hidden',
        className
      )}
    >
      {children}
    </section>
  )
})
