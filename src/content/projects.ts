import type { Project, SkillGroup } from './types'

/** CREATIONS — placeholder projects. `featured` ones surface first. */
export const projects: Project[] = [
  {
    id: 'p1',
    name: '[[ Project Alpha ]]',
    blurb: 'An immersive interface experiment.',
    description:
      'Placeholder description. What it is, the problem it solves, and the ' +
      'interesting technical or design decision behind it.',
    stack: ['React', 'TypeScript', 'WebGL'],
    year: '[[ 20XX ]]',
    status: 'prototype',
    featured: true,
    // media: { src: '/media/projects/alpha.jpg', alt: 'Screenshot of Project Alpha' },
    links: [{ label: 'placeholder', url: '#' }],
  },
  {
    id: 'p2',
    name: '[[ Project Beta ]]',
    blurb: 'AI-assisted tooling.',
    description: 'Placeholder description of an AI or automation project.',
    stack: ['Python', 'LLM', 'Vector DB'],
    year: '[[ 20XX ]]',
    status: 'shipped',
    featured: true,
    links: [{ label: 'placeholder', url: '#' }],
  },
  {
    id: 'p3',
    name: '[[ Project Gamma ]]',
    blurb: 'Real-time systems.',
    description: 'Placeholder description of a systems / infrastructure project.',
    stack: ['Go', 'WebSockets', 'Redis'],
    year: '[[ 20XX ]]',
    status: 'shipped',
    featured: false,
  },
  {
    id: 'p4',
    name: '[[ Project Delta ]]',
    blurb: 'A playful side quest.',
    description: 'Placeholder description of an experimental or fun side project.',
    stack: ['Canvas', 'Web Audio', 'TypeScript'],
    year: '[[ 20XX ]]',
    status: 'research',
    featured: false,
  },
]

/** Skills grouped for the interactive resume. Levels are 0-100 placeholders. */
export const skills: SkillGroup[] = [
  {
    label: 'Languages',
    items: [
      { name: '[[ TypeScript ]]', level: 80 },
      { name: '[[ Python ]]', level: 70 },
      { name: '[[ Language ]]', level: 55 },
    ],
  },
  {
    label: 'Craft',
    items: [
      { name: 'Frontend / interaction', level: 82 },
      { name: 'Systems / backend', level: 68 },
      { name: 'AI / ML tinkering', level: 60 },
    ],
  },
  {
    label: 'Tools',
    items: [
      { name: '[[ Tool ]]', level: 75 },
      { name: '[[ Tool ]]', level: 65 },
      { name: '[[ Tool ]]', level: 60 },
    ],
  },
]
