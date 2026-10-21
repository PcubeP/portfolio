import { interests } from '@/content'
import { Reveal } from '@/components/shared/Reveal'
import { FoodScene } from './interests/FoodScene'
import { AutoScene } from './interests/AutoScene'
import { ArtScene } from './interests/ArtScene'

/**
 * WORLDS — the interests beyond the keyboard, de-tabbed into a scrolled
 * sequence: Food → Autos → Art. No tab bar, no AnimatePresence swap; each world
 * simply arrives as you reach it.
 */
export function WorldsChapter() {
  return (
    <section id="worlds" aria-label="Worlds">
      <Reveal>
        <FoodScene items={interests.food} />
      </Reveal>
      <Reveal>
        <AutoScene items={interests.automobiles} />
      </Reveal>
      <Reveal>
        <ArtScene pieces={interests.art} />
      </Reveal>
    </section>
  )
}
