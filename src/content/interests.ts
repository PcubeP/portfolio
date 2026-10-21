import type { Interests } from './types'

/**
 * INTERESTS — seeded with real interests. Images: Wikimedia Commons (CC).
 * YouTube embeds via privacy-enhanced youtube-nocookie.com — never autoplay.
 */
export const interests: Interests = {
  movies: [
    {
      title: 'The Matrix',
      year: '1999',
      note: 'The film that made software feel like magic and choice feel like architecture.',
      quote: 'There is no spoon.',
      media: {
        src: 'https://upload.wikimedia.org/wikipedia/en/d/db/The_Matrix.png',
        alt: 'The Matrix 1999 theatrical release poster',
        caption: 'The Matrix (1999)',
        kind: 'image',
        width: 259,
        height: 383,
      },
    },
    {
      title: 'The Lion King',
      year: '1994',
      note: 'Story, score and the weight of who you decide to become.',
      quote: 'Remember who you are.',
      media: {
        src: 'https://upload.wikimedia.org/wikipedia/en/3/3d/The_Lion_King_poster.jpg',
        alt: 'The Lion King 1994 theatrical release poster',
        caption: 'The Lion King (1994)',
        kind: 'image',
        width: 268,
        height: 394,
      },
    },
    {
      title: '[[ Add a film ]]',
      note: 'Placeholder — drop in another film that shaped you.',
    },
  ],
  music: [
    {
      artist: 'Linkin Park',
      kind: 'band',
      note: 'The loud half of the signal.',
      track: { title: 'In The End' },
      media: {
        src: 'https://www.youtube-nocookie.com/embed/eVTXPUF4Oz4',
        alt: 'Linkin Park – In The End official music video',
        caption: 'In The End (Official HD)',
        kind: 'embed',
      },
    },
    {
      artist: 'Lo-fi',
      kind: 'mood',
      note: 'The quiet half — the sound of building at 2am.',
      track: { title: 'lo-fi hip hop radio' },
      media: {
        src: 'https://www.youtube-nocookie.com/embed/jfKfPfyJRdk',
        alt: 'Lo-fi Hip Hop Radio – beats to relax/study to',
        caption: 'beats to relax/study to · lofi girl',
        kind: 'embed',
      },
    },
    {
      artist: '[[ Add an artist ]]',
      kind: 'genre',
      note: 'Placeholder — expand the frequency map.',
    },
  ],
  sports: [
    {
      name: 'Swimming',
      motif: 'water',
      note: 'Lines, lanes and the physics of moving through water.',
      figure: {
        name: 'Michael Phelps',
        note: 'The benchmark for what focus can compound into.',
        media: {
          src: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Phelps_400m_IM-crop.jpg',
          alt: 'Michael Phelps competing in the 400 IM, February 2008',
          caption: 'Phelps · 400 IM · 2008',
          kind: 'image',
          width: 2013,
          height: 1569,
        },
      },
      stats: [
        { label: 'Olympic gold medals', value: '23' },
        { label: 'Beijing 2008 golds', value: '8' },
        { label: 'World records set', value: '39' },
      ],
    },
    {
      name: 'Tennis',
      motif: 'trajectory',
      note: 'Angles, velocity and refusing to lose the point.',
      figure: {
        name: 'Rafael Nadal',
        note: 'Relentless. The last ball is never lost.',
        media: {
          src: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Rafael_Nadal_Roland_Garros_2008.jpg',
          alt: 'Rafael Nadal at Roland Garros 2008',
          caption: 'Nadal · Roland Garros 2008',
          kind: 'image',
          width: 2464,
          height: 1632,
        },
      },
      stats: [
        { label: 'Grand Slam titles', value: '22' },
        { label: 'French Open wins', value: '14' },
        { label: 'career titles', value: '92' },
      ],
    },
    {
      name: 'Football',
      motif: 'field',
      note: 'Space, geometry and the beauty of a perfect pass.',
      figure: {
        name: 'Lionel Messi',
        note: 'Proof that vision beats force.',
        media: {
          src: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Messi_a_la_carrera.jpg',
          alt: 'Lionel Messi running with ball, Real Madrid vs Barcelona, May 2009',
          caption: 'Messi · Clásico 2009',
          kind: 'image',
          width: 1500,
          height: 1004,
        },
      },
      stats: [
        { label: "Ballon d'Or awards", value: '8' },
        { label: 'Barcelona goals', value: '672' },
        { label: 'career assists', value: '400+' },
      ],
    },
  ],
  games: [
    { title: '[[Favourite game]]', platform: '[[platform]]', genre: '[[genre]]', affinity: 92, note: 'Placeholder — the one you always return to.' },
    { title: '[[Game]]', platform: '[[platform]]', genre: '[[genre]]', affinity: 78, note: 'Placeholder.' },
    { title: '[[Game]]', platform: '[[platform]]', genre: '[[genre]]', affinity: 65, note: 'Placeholder.' },
    { title: '[[Game]]', platform: '[[platform]]', genre: '[[genre]]', affinity: 54, note: 'Placeholder.' },
  ],
  achievements: [
    { id: 'a1', label: 'FIRST DEPLOY', detail: 'Shipped something real into the world.', unlocked: true, rarity: 'common' },
    { id: 'a2', label: 'NIGHT OWL', detail: 'Built past 3am and lived.', unlocked: true, rarity: 'common' },
    { id: 'a3', label: 'THE GRIND', detail: '[[a real achievement]]', unlocked: true, rarity: 'rare' },
    { id: 'a4', label: 'PODIUM', detail: '[[a sports / competition milestone]]', unlocked: true, rarity: 'rare' },
    { id: 'a5', label: 'SIGNAL FOUND', detail: 'Discovered a hidden layer of this site.', unlocked: false, rarity: 'legendary' },
    { id: 'a6', label: '[[LOCKED]]', detail: 'More to unlock as the story continues.', unlocked: false, rarity: 'legendary' },
  ],
  food: [
    {
      name: '[[ Favourite dish ]]',
      cuisine: 'South Indian',
      note: 'Where it all started — the original comfort plate.',
    },
    {
      name: '[[ Street food pick ]]',
      cuisine: 'Bangalore street food',
      note: 'The kind of food that only works at 10pm on the side of the road.',
    },
    {
      name: '[[ World cuisine favourite ]]',
      cuisine: '[[ origin ]]',
      note: 'Placeholder — a dish from somewhere far that stuck.',
    },
    {
      name: '[[ Guilty pleasure ]]',
      cuisine: '[[ origin ]]',
      note: 'No explanation needed.',
    },
  ],
  automobiles: [
    {
      name: '[[ Dream car ]]',
      kind: 'dream' as const,
      note: 'The one on the wall. The reason for the spreadsheet.',
    },
    {
      name: '[[ All-time icon ]]',
      kind: 'icon' as const,
      note: 'Not about the spec sheet — about what it means.',
    },
    {
      name: 'Formula 1',
      kind: 'category' as const,
      note: 'Engineering at the absolute limit. Ballet at 300km/h.',
    },
    {
      name: 'Supercars',
      kind: 'category' as const,
      note: 'Where physics fights back and loses.',
    },
  ],
  art: [
    {
      title: '[[ Piece 01 ]]',
      medium: 'spray' as const,
      note: 'Placeholder — describe the first spray painting you are proud of.',
    },
    {
      title: '[[ Piece 02 ]]',
      medium: 'spray' as const,
      note: 'Placeholder — every wall is a canvas.',
    },
    {
      title: '[[ Piece 03 ]]',
      medium: 'spray' as const,
      note: 'Placeholder — the one that surprised you.',
    },
  ],
  pcBuilds: [
    {
      name: 'da-beast',
      note: 'The main rig. Built for everything — no compromises.',
      specs: [
        { component: 'CPU', value: '[[ processor ]]' },
        { component: 'GPU', value: '[[ graphics card ]]' },
        { component: 'RAM', value: '[[ memory ]]' },
        { component: 'Storage', value: '[[ storage ]]' },
        { component: 'Case', value: '[[ case ]]' },
      ],
    },
    {
      name: 'da-baby',
      note: 'Compact. Capable. Still hits different.',
      specs: [
        { component: 'CPU', value: '[[ processor ]]' },
        { component: 'GPU', value: '[[ graphics card ]]' },
        { component: 'RAM', value: '[[ memory ]]' },
        { component: 'Storage', value: '[[ storage ]]' },
        { component: 'Form factor', value: '[[ case ]]' },
      ],
    },
  ],
  videography: {
    note: 'Every frame is a decision. The lens sees what the eye overlooks.',
    platform: 'Instagram',
  },
}
