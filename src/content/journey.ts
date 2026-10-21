import type { TimelineEntry } from './types'

/**
 * JOURNEY — a single ordered timeline mixing education, experience and
 * milestones. Order newest-first; the UI reverses/labels as needed.
 * Every field here is placeholder. Do not treat as real.
 */
export const journey: TimelineEntry[] = [
  {
    id: 'now',
    period: '[[ 20XX — Present ]]',
    title: '[[ Current Role ]]',
    org: '[[ Current Company ]]',
    location: '[[ Location ]]',
    summary: 'Placeholder role summary — what you build and why it matters.',
    detail: [
      'Placeholder achievement or responsibility one.',
      'Placeholder achievement or responsibility two.',
      'Placeholder achievement or responsibility three.',
    ],
    tags: ['[[ stack ]]', '[[ domain ]]'],
    kind: 'experience',
  },
  {
    id: 'prev-role',
    period: '[[ 20XX — 20XX ]]',
    title: '[[ Previous Role ]]',
    org: '[[ Previous Company ]]',
    location: '[[ Location ]]',
    summary: 'Placeholder summary of a previous position.',
    detail: ['Placeholder detail.', 'Placeholder detail.'],
    tags: ['[[ stack ]]'],
    kind: 'experience',
  },
  {
    id: 'milestone',
    period: '[[ 20XX ]]',
    title: '[[ A Defining Milestone ]]',
    org: '[[ Context ]]',
    summary: 'Something that changed the trajectory — a project, a win, a pivot.',
    kind: 'milestone',
    tags: ['turning point'],
  },
  {
    id: 'degree',
    period: '[[ 20XX — 20XX ]]',
    title: '[[ Degree / Field ]]',
    org: '[[ University ]]',
    location: '[[ Location ]]',
    summary: 'Placeholder education summary.',
    detail: ['Placeholder highlight.', 'Placeholder highlight.'],
    tags: ['[[ focus ]]'],
    kind: 'education',
  },
  {
    id: 'origin',
    period: '[[ Earlier ]]',
    title: 'First contact with code',
    org: 'The beginning',
    summary: 'Where the curiosity started — replace with your origin story.',
    kind: 'milestone',
    tags: ['origin'],
  },
]
