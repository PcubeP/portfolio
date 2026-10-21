import { useState } from 'react'
import type { MediaRef } from '@/content'
import { cn } from '@/lib/cn'

/**
 * Reusable media unit. When `src` is missing it renders a labelled placeholder
 * frame — clearly signalling "image goes here" without breaking layout.
 * Lazy-loads real images. Use everywhere instead of raw <img>.
 */
export function Media({
  media,
  className,
  ratio = '4 / 3',
}: {
  media?: MediaRef
  className?: string
  ratio?: string
}) {
  const [loaded, setLoaded] = useState(false)
  const has = !!media?.src

  return (
    <figure
      className={cn('relative overflow-hidden block-brutal', className)}
      style={{ aspectRatio: ratio }}
    >
      {has ? (
        media!.kind === 'embed' ? (
          <iframe
            className="h-full w-full border-0"
            src={media!.src}
            title={media!.alt}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : media!.kind === 'video' ? (
          <video
            className="h-full w-full object-cover"
            src={media!.src}
            poster={media!.poster}
            muted
            loop
            playsInline
            controls
            aria-label={media!.alt}
          />
        ) : (
          <img
            src={media!.src}
            alt={media!.alt}
            loading="lazy"
            decoding="async"
            width={media!.width}
            height={media!.height}
            onLoad={() => setLoaded(true)}
            className={cn(
              'h-full w-full object-cover transition-opacity duration-700',
              loaded ? 'opacity-100' : 'opacity-0'
            )}
          />
        )
      ) : (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-2 text-center"
          role="img"
          aria-label={media?.alt ?? 'Placeholder media'}
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, rgb(var(--raised)) 0 12px, rgb(var(--surface)) 12px 24px)',
          }}
        >
          <span className="font-mono text-[0.6rem] tracking-widest2 text-faint">MEDIA</span>
          <span className="font-mono text-[0.65rem] text-dim max-w-[80%]">
            {media?.caption ?? media?.alt ?? '[[ add image ]]'}
          </span>
        </div>
      )}
      {media?.caption && has && (
        <figcaption className="absolute inset-x-0 bottom-0 bg-ink/70 px-3 py-1.5 font-mono text-[0.65rem] text-dim backdrop-blur-sm">
          {media.caption}
        </figcaption>
      )}
    </figure>
  )
}
