import type { MediaRef } from './types'

/**
 * MEDIA — central registry for reusable galleries.
 * Images: Wikimedia Commons (CC licensed), Unsplash (free to use).
 * Leave src undefined to get a labelled placeholder tile.
 */
export const gallery: MediaRef[] = [
  {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/BangaloreMontage.png/400px-BangaloreMontage.png',
    alt: 'Bengaluru city montage',
    caption: 'Bengaluru',
    kind: 'image',
    width: 400,
    height: 300,
  },
  {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/UB_City.jpg/400px-UB_City.jpg',
    alt: 'UB City commercial complex, Bengaluru',
    caption: 'UB City · Bengaluru',
    kind: 'image',
    width: 400,
    height: 300,
  },
  { alt: 'Placeholder — project screenshot', caption: '[[Work]]' },
  { alt: 'Placeholder — sport moment', caption: '[[Sport]]' },
  { alt: 'Placeholder — an event', caption: '[[Event]]' },
  { alt: 'Placeholder — a memory', caption: '[[Life]]' },
]
