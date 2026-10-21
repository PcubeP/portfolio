import { MatrixRain } from '@/components/easter-eggs/MatrixRain'
import { interests } from '@/content'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/** CHANNEL 01 — THE MATRIX. Digital rain fills the tube; the film's line sits on top. */
export function MatrixChannel() {
  const reduced = useReducedMotion()
  const movie = interests.movies[0]
  return (
    <div className="relative h-full w-full bg-black">
      {/* rain lives for the life of the channel (contained → no auto-exit timer).
          Under reduced motion, a still glyph field stands in for the animation. */}
      {reduced ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgb(0 255 65/0.18) 0 1px, transparent 1px 16px), repeating-linear-gradient(90deg, rgb(0 255 65/0.12) 0 1px, transparent 1px 16px)',
          }}
        />
      ) : (
        <MatrixRain contained onDone={() => {}} />
      )}
      <div className="absolute inset-0 flex flex-col justify-end gap-2 p-6 md:p-10">
        <p className="font-mono text-[0.6rem] uppercase tracking-widest2 text-[rgb(0_255_65)]">
          CH 01 · {movie.title} · {movie.year}
        </p>
        <p className="max-w-xl font-display text-[clamp(1.6rem,5vw,3.5rem)] font-bold leading-[0.95] text-[rgb(120_255_180)]">
          “{movie.quote}”
        </p>
        <p className="max-w-md font-serif text-sm text-[rgb(120_255_180)]/80">{movie.note}</p>
      </div>
    </div>
  )
}
