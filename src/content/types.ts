/**
 * CONTENT MODEL
 * -------------
 * Every piece of personal information the site renders lives in ./content as
 * plain data. Components never hardcode biography, dates, links or media — they
 * read from these typed structures. To make the site "yours", edit the data
 * files; you should not need to touch a single visual component.
 *
 * Anything not yet provided uses a `Placeholder` marker so it is visually and
 * semantically obvious that it is awaiting real content.
 */

/** Marks a value as intentionally-not-yet-real. Rendered with a distinct style. */
export type Placeholder<T> = T & { __placeholder?: true }

export interface MediaRef {
  /** Public path or remote URL. Leave undefined to render a labelled placeholder. */
  src?: string
  /** Required for accessibility. Describe the image for screen readers. */
  alt: string
  /** Optional short caption shown in galleries. */
  caption?: string
  /** width/height help avoid layout shift; optional. */
  width?: number
  height?: number
  kind?: 'image' | 'video' | 'embed'
  /** poster image for video */
  poster?: string
}

export interface Profile {
  /** Preferred display name. */
  name: string
  /** e.g. "Software Engineer" */
  role: string
  /** One-line essence. Short. */
  tagline: string
  /** A few words that define the person, shown as rotating fragments. */
  fragments: string[]
  /** Longer statement, 2-4 sentences. */
  statement: string
  location: string
  /** Fake-but-flavorful coordinates for the HUD. Replace with real if desired. */
  coordinates: string
  /** Optional avatar. */
  portrait?: MediaRef
  /** Short status line shown in the system HUD. */
  status: string
  availableForWork?: boolean
}

export interface TimelineEntry {
  id: string
  /** ISO-ish or human string, e.g. "2021 — Present" */
  period: string
  title: string
  /** organisation / institution */
  org: string
  location?: string
  summary: string
  /** deeper detail revealed on expand */
  detail?: string[]
  tags?: string[]
  kind: 'education' | 'experience' | 'milestone'
}

export interface Project {
  id: string
  name: string
  /** short punchy line */
  blurb: string
  description: string
  /** e.g. ["React", "WebGL", "LLM"] */
  stack: string[]
  year?: string
  /** e.g. "shipped", "prototype", "research" */
  status?: string
  links?: { label: string; url: string }[]
  media?: MediaRef
  /** feature it in the explorer */
  featured?: boolean
}

export interface SkillGroup {
  label: string
  items: { name: string; level?: number /* 0-100 */ }[]
}

export interface Movie {
  title: string
  year?: string
  note?: string
  quote?: string
  media?: MediaRef
}

export interface MusicItem {
  artist: string
  kind?: string // "band", "mood", "genre"
  note?: string
  /** optional audio preview path — never autoplayed */
  track?: { title: string; src?: string }
  /** optional visual — band photo, YouTube embed, etc. Never autoplays. */
  media?: MediaRef
}

export interface Sport {
  name: string
  /** which visual treatment to use */
  motif: 'water' | 'trajectory' | 'field'
  note?: string
  icon?: MediaRef
  /** the athlete who matters here */
  figure?: { name: string; note?: string; media?: MediaRef }
  stats?: { label: string; value: string }[]
}

export interface Game {
  title: string
  platform?: string
  genre?: string
  note?: string
  /** 0-100 personal "affinity" used for the game-UI meters */
  affinity?: number
  media?: MediaRef
}

export interface Achievement {
  id: string
  label: string
  detail?: string
  /** unlocked vs locked (for the gaming interface treatment) */
  unlocked?: boolean
  rarity?: 'common' | 'rare' | 'legendary'
}

export interface SocialLink {
  id: string
  platform: string
  handle: string
  /** DO NOT invent. Leave undefined => rendered as an inactive placeholder node. */
  url?: string
  note?: string
}

export interface ResumeConfig {
  /** path to a PDF in /public, e.g. "/resume.pdf". Undefined => button disabled. */
  pdfUrl?: string
  updated?: string
}


export interface FoodItem {
  name: string
  /** cuisine origin, e.g. "South Indian", "Japanese" */
  cuisine?: string
  note?: string
  media?: MediaRef
}

export interface AutoItem {
  name: string
  note?: string
  /** dream car, all-time icon, or category obsession */
  kind: 'dream' | 'icon' | 'category'
  media?: MediaRef
}

export interface ArtPiece {
  title?: string
  medium: 'spray' | 'digital' | 'mixed'
  note?: string
  media?: MediaRef
}

export interface PCBuild {
  /** codename, e.g. "da-beast" */
  name: string
  note?: string
  specs?: { component: string; value: string }[]
}

export interface VideographyProfile {
  note: string
  platform?: string
  /** DO NOT invent a URL — leave undefined until real handle exists */
  url?: string
}

export interface Interests {
  movies: Movie[]
  music: MusicItem[]
  sports: Sport[]
  games: Game[]
  achievements: Achievement[]
  food: FoodItem[]
  automobiles: AutoItem[]
  art: ArtPiece[]
  pcBuilds: PCBuild[]
  videography: VideographyProfile
}
