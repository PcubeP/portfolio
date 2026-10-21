/**
 * CONTENT — single import surface for the whole app.
 * Components import from '@/content' and never from individual files, so the
 * data layer can be reorganised without touching the UI.
 */
export * from './types'
export { profile, resume } from './profile'
export { journey } from './journey'
export { projects, skills } from './projects'
export { interests } from './interests'
export { social } from './social'
export { gallery } from './media'

/** Navigation model — the spine of the whole experience. */
export interface ChapterMeta {
  id: string
  index: string
  label: string
  /** short verb describing the journey stage */
  stage: string
  /** accent color as "r g b" for this world */
  accent: string
}

/**
 * The ordered journey. ENTER → DISCOVER → EXPLORE → EXPERIENCE → CONNECT.
 * Each chapter carries its own accent so the whole site shifts hue as you move.
 */
export const chapters: ChapterMeta[] = [
  { id: 'identity',   index: '01', label: 'IDENTITY',    stage: 'enter',      accent: '255 91 46'  },
  { id: 'journey',    index: '02', label: 'JOURNEY',     stage: 'discover',   accent: '245 197 66' },
  { id: 'creations',  index: '03', label: 'CREATIONS',   stage: 'explore',    accent: '0 255 65'   },
  { id: 'arena',      index: '04', label: 'ARENA',       stage: 'compete',    accent: '54 224 208' },
  { id: 'worlds',     index: '05', label: 'WORLDS',      stage: 'wander',     accent: '245 160 30' },
  { id: 'popculture', index: '06', label: 'POP CULTURE', stage: 'tune in',    accent: '0 255 65'   },
  { id: 'arcade',     index: '07', label: 'ARCADE',      stage: 'experience', accent: '150 240 90' },
  { id: 'connect',    index: '08', label: 'CONNECT',     stage: 'connect',    accent: '255 91 46'  },
]
