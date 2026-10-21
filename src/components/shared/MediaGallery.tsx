import { Media } from './Media'
import type { MediaRef } from '@/content'
import { cn } from '@/lib/cn'

/** Reusable gallery grid. Renders placeholder tiles until real media arrives. */
export function MediaGallery({ items, className }: { items: MediaRef[]; className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3', className)}>
      {items.map((m, i) => (
        <Media
          key={i}
          media={m}
          ratio={i % 4 === 0 ? '1 / 1' : i % 3 === 0 ? '3 / 4' : '4 / 3'}
        />
      ))}
    </div>
  )
}
