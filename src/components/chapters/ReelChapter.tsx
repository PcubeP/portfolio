import { Chapter } from '@/components/shared/Chapter'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { Reveal } from '@/components/shared/Reveal'
import { Media } from '@/components/shared/Media'
import { Tilt } from '@/components/shared/Tilt'
import { interests } from '@/content'
import { themes } from '@/lib/themes'

/** EXPERIENCE · Cinema world — a film strip of the stories that shaped me. */
export function ReelChapter({ embedded: _embedded = false }: { embedded?: boolean }) {
  const featured = interests.movies.find((m) => m.quote) ?? interests.movies[0]

  return (
    <Chapter id="reel" label="Reel" theme={themes.cinema}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-20 h-10 bg-black" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-10 bg-black" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 opacity-[0.08]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
      <div className="wrap relative z-10">
        <SectionHeading index="06" eyebrow="Experience · the reel" title="Stories on repeat." />

        {/* dramatic featured quote */}
        {featured?.quote && (
          <Reveal className="mb-10">
            <blockquote className="relative">
              <span aria-hidden="true" className="absolute -left-2 -top-8 font-serif text-[6rem] leading-none text-accent/25">
                “
              </span>
              <p className="font-serif text-3xl leading-tight text-fg md:text-5xl">
                {featured.quote}
              </p>
              <cite className="mt-3 block font-mono text-xs not-italic text-dim ph">
                — {featured.title}{featured.year ? `, ${featured.year}` : ''}
              </cite>
            </blockquote>
          </Reveal>
        )}

        {/* film strip */}
        <Reveal>
          <div
            className="relative overflow-x-auto border-y-[10px] border-dashed border-line/40 bg-ink py-4"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, transparent 0 26px, rgb(var(--line)/0.4) 26px 30px)',
              backgroundPosition: '0 0, 0 100%',
              backgroundSize: '100% 6px',
              backgroundRepeat: 'repeat-x',
            }}
          >
            <ul className="flex gap-4 px-4" style={{ scrollSnapType: 'x mandatory' }}>
              {interests.movies.map((m) => (
                <li key={m.title} className="w-[240px] shrink-0" style={{ scrollSnapAlign: 'start' }}>
                  <Tilt max={9} className="[transform-style:preserve-3d]"><Media media={m.media ?? { alt: `Still from ${m.title}`, caption: m.title }} ratio="2 / 3" /></Tilt>
                  <div className="mt-2">
                    <h3 className="font-display font-semibold ph">{m.title}</h3>
                    <p className="font-mono text-[0.6rem] text-faint ph">{m.year}</p>
                    <p className="mt-1 text-xs text-fg/70 ph">{m.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-2 font-mono text-[0.6rem] text-faint">← scroll the reel →</p>
        </Reveal>
      </div>
    </Chapter>
  )
}
