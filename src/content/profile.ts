import type { Profile, ResumeConfig } from './types'

/**
 * PROFILE — replace every `[[ ... ]]` marker with real information.
 * The double-bracket style makes placeholders easy to find (search "[[").
 */
export const profile: Profile = {
  name: 'Pranit Prabhu',
  role: '[[ Developer / Technologist ]]',
  tagline: 'Builder of digital things. Explorer of most others.',
  fragments: [
    'engineer',
    'gamer',
    'sports obsessive',
    'film watcher',
    'sound seeker',
    'perpetual beginner',
    'systems thinker',
    'curious by default',
  ],
  statement:
    'I build software and chase the edges of what technology can feel like. ' +
    'Off-screen I am somewhere between a pool lane, a stadium, a controller and a soundtrack. ' +
    'This is a living map of the things I make and the things that make me.',
  location: 'Bangalore, India',
  coordinates: '12.9716° N, 77.5946° E',
  status: 'ONLINE · EXPLORING',
  availableForWork: true,
  // portrait: { src: '/media/portrait.jpg', alt: 'Portrait of [[ YOUR NAME ]]' },
}

export const resume: ResumeConfig = {
  // pdfUrl: '/resume.pdf',
  updated: '[[ MONTH YEAR ]]',
}
