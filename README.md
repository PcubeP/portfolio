# Personal Digital Universe — Portfolio Prototype

An immersive, content-driven personal portfolio built as an *experience*, not a
page. The visitor boots into a system, then descends through eight worlds —
Identity, Journey, Creations, Arena (sports), Arcade (gaming), Reel (cinema),
Frequency (music) and Connect — with the interface shifting its accent colour as
it travels. Everything personal is placeholder and lives in one data layer.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into /dist
npm run preview    # serve the production build
```

Stack: **Vite · React 18 · TypeScript · Tailwind CSS · Framer Motion**. No heavy
3D libraries — effects are Canvas 2D and CSS transforms for performance.

## Make it yours — edit data, never components

All personal information lives in `src/content/`. Components read from it and
never hardcode anything. Search the codebase for `[[` to find every placeholder.

| File | What to fill in |
|------|-----------------|
| `content/profile.ts` | name, role, tagline, statement, location, résumé PDF path |
| `content/journey.ts` | education, experience and milestone timeline entries |
| `content/projects.ts` | projects (the explorer) and skill groups |
| `content/interests.ts` | movies, music channels, sports + athletes, games, achievements |
| `content/social.ts` | social platforms — add real `url`s to activate offline nodes |
| `content/media.ts` | the gallery / memory wall images |
| `content/index.ts` | the `chapters` list — reorder, rename, or recolour worlds |

Nothing was invented: names, URLs, dates and biography are all bracketed
placeholders. Offline social nodes stay visibly offline until you add a `url`.

### Adding images
Drop files into `public/media/…` and set the `src` on any `MediaRef`
(`{ src: '/media/x.jpg', alt: 'describe it' }`). Until then, a labelled
placeholder tile renders in the same spot — no layout breaks. `alt` is required.

### Adding the résumé
Put a PDF at `public/resume.pdf` and set `resume.pdfUrl = '/resume.pdf'` in
`content/profile.ts`. The download button activates automatically.

### Connecting audio
The music player never autoplays. Give a channel a real file
(`track: { title, src: '/audio/x.mp3' }`) in `content/interests.ts` and it plays
only when the visitor activates the signal.

## Architecture

```
src/
  content/     data layer — the single source of truth (edit this)
  context/     ExperienceContext — accent, audio, system messages, easter eggs
  hooks/       reduced-motion, active-chapter observer, pointer, key sequences
  lib/         tiny helpers (classnames, seeded prng)
  components/
    intro/         IntroSequence (boot ritual, always skippable)
    chrome/        Navigation, ScrollProgress, SystemHud, MusicInterface, toasts
    chapters/      the eight worlds + FinalScene
    shared/        Chapter, Reveal, Media, MediaGallery, GlitchText, Meter, headings
    easter-eggs/   registry + controller + Matrix rain
```

## Easter eggs

Registered in `components/easter-eggs/registry.ts`; the Arcade chapter shows
locked hints for each. Currently wired:

- **Konami code** (`↑ ↑ ↓ ↓ ← → ← → B A`) — triggers digital rain.
- Type **`matrix`** anywhere.
- Click the system glyph in the Identity header **five times**.
- Reach the very end of the journey.
- There is also a message in the browser console.

Add one by appending to the registry and wiring a detector in `EasterEggs.tsx`.

## Accessibility & motion

- Semantic landmarks, `aria-current` navigation, visible focus rings, a skip link.
- Every interaction has a non-hover path; all controls are real buttons/links.
- `prefers-reduced-motion` is honoured everywhere — parallax, loops, glitch and
  rain collapse to static/opacity, and the intro renders instantly.

## Notes for the next iteration

- Real media, résumé PDF and audio sources.
- Optional: horizontal scroll-pin for the interest worlds, WebGL identity object.
- Fill the remaining placeholder achievements and games.
