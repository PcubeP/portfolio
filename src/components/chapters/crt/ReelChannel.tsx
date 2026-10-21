import { interests } from '@/content'

/** CHANNEL 02 — THE LION KING. Warm reel: poster, title, the line that lands. */
export function ReelChannel() {
  const movie = interests.movies[1]
  return (
    <div
      className="relative flex h-full w-full items-center gap-6 overflow-hidden p-6 md:gap-10 md:p-10"
      style={{ background: 'radial-gradient(ellipse at 30% 20%, #3a2410, #140a03 75%)' }}
    >
      {movie.media?.src && (
        <img
          src={movie.media.src}
          alt={movie.media.alt}
          loading="lazy"
          className="hidden h-[70%] w-auto shrink-0 border border-[rgb(245_197_66)]/30 object-cover shadow-2xl sm:block"
        />
      )}
      <div className="min-w-0">
        <p className="font-mono text-[0.6rem] uppercase tracking-widest2 text-[rgb(245_197_66)]">
          CH 02 · {movie.title} · {movie.year}
        </p>
        <p className="mt-3 max-w-xl font-display text-[clamp(1.6rem,5vw,3.5rem)] font-bold leading-[0.95] text-[rgb(255_236_190)]">
          “{movie.quote}”
        </p>
        <p className="mt-3 max-w-md font-serif text-sm text-[rgb(255_236_190)]/80">{movie.note}</p>
      </div>
    </div>
  )
}
