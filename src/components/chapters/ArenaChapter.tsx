import { forwardRef } from 'react'
import { interests } from '@/content'
import { SwimmingScene } from './sports/SwimmingScene'
import { TennisScene } from './sports/TennisScene'
import { FootballScene } from './sports/FootballScene'

/**
 * ARENA — three sports as one continuous descent-and-play. Swimming (dive),
 * Tennis (bounce), Football (roll) stack back-to-back; the shared MorphBall
 * (mounted in App's chrome group with this section as its scroll target) is the
 * single object that travels through all three. This is a plain landmark, NOT
 * the `.chapter` class — its `content-visibility:auto` would fight the tall
 * pinned scenes inside.
 */
export const ArenaChapter = forwardRef<HTMLElement>(function ArenaChapter(_props, ref) {
  const swimming = interests.sports.find((s) => s.motif === 'water')
  const tennis = interests.sports.find((s) => s.motif === 'trajectory')
  const football = interests.sports.find((s) => s.motif === 'field')

  return (
    <section ref={ref} id="arena" aria-label="Arena">
      <SwimmingScene sport={swimming} />
      <TennisScene sport={tennis} />
      <FootballScene sport={football} />
    </section>
  )
})
