import { Suspense, lazy, useEffect } from 'react'
import { chapters } from '@/content'
import { WORLDS } from '@/world/spline'
import { useScrollProgress } from '@/world/useScrollProgress'
import { useWorldState } from '@/world/useWorldState'
import { useGlobalPointer } from '@/hooks/useGlobalPointer'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useExperience } from '@/context/ExperienceContext'
import { profile } from '@/content'

import { IntroSequence } from '@/components/intro/IntroSequence'
import { Navigation } from '@/components/chrome/Navigation'
import { ScrollProgress } from '@/components/chrome/ScrollProgress'
import { SystemHud } from '@/components/chrome/SystemHud'
import { MusicInterface } from '@/components/chrome/MusicInterface'
import { SystemMessages } from '@/components/chrome/SystemMessages'
import { EasterEggs } from '@/components/easter-eggs/EasterEggs'
import { CustomCursor } from '@/components/chrome/CustomCursor'
import { VelocityTrail } from '@/components/chrome/VelocityTrail'
import { CinematicFrame } from '@/components/chrome/CinematicFrame'
import { WorldLoader } from '@/world/WorldLoader'
import { WorldSection } from '@/components/world/WorldSection'

// The heavy three.js layer — split into its own chunk and only fetched once the
// visitor has entered (a real user gesture), so the initial payload stays light.
const WorldCanvas = lazy(() => import('@/world/WorldCanvas'))

// Total scroll length; each world claims a slice proportional to its t-range so
// scroll position maps linearly onto the camera's position along the spline.
const TOTAL_VH = 900

export default function App() {
  const targetT = useScrollProgress()
  const { t, activeId } = useWorldState()
  const { entered, setAccent } = useExperience()
  const reduced = useReducedMotion()
  useGlobalPointer()

  // Shift the world accent as the camera crosses into each world.
  useEffect(() => {
    const c = chapters.find((x) => x.id === activeId)
    if (c) setAccent(c.accent)
  }, [activeId, setAccent])

  return (
    <div className="bg-grain scanlines relative min-h-screen">
      <a href="#content-start" className="skip-link">Skip to content</a>

      <IntroSequence />

      {/* The world + persistent chrome — mounted only after entering. */}
      {entered && (
        <>
          <Suspense fallback={<WorldLoader />}>
            <WorldCanvas targetT={targetT} reduced={reduced} />
          </Suspense>

          <ScrollProgress progress={t} />
          <Navigation activeId={activeId} />
          <SystemHud activeId={activeId} progress={t} />
          <MusicInterface />
          <SystemMessages />
          <EasterEggs />
          <CustomCursor />
          <VelocityTrail />
          <CinematicFrame activeId={activeId} />
        </>
      )}

      {/* Semantic scroll layer: one landmark per world. Heights define journey
          length; copy is sr-only in motion mode, readable under reduced motion. */}
      <main id="content">
        <div id="content-start" tabIndex={-1} />
        {WORLDS.map((w) => {
          const meta = chapters.find((c) => c.id === w.id)
          const heightVh = Math.round((w.range[1] - w.range[0]) * TOTAL_VH)
          return (
            <WorldSection
              key={w.id}
              id={w.id}
              index={meta?.index ?? ''}
              label={meta?.label ?? w.id.toUpperCase()}
              heightVh={heightVh}
            >
              {w.id === 'identity' && <p>{profile.statement}</p>}
              {w.id === 'connect' && (
                <p>
                  {profile.location} · {profile.coordinates}
                </p>
              )}
            </WorldSection>
          )
        })}
      </main>

      <footer className="relative z-[3] border-t border-line px-6 py-8 text-center font-mono text-[0.6rem] text-faint">
        <span className="ph">{'// a flown-through 3D world — replace [[ placeholders ]] in /src/content'}</span>
      </footer>
    </div>
  )
}
