import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { chapters } from '@/content'
import { cn } from '@/lib/cn'
import { RollText } from '@/components/shared/RollText'

function scrollToChapter(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  // move focus for keyboard/screen-reader users without jumping the scroll
  el.setAttribute('tabindex', '-1')
  ;(el as HTMLElement).focus({ preventScroll: true })
}

/**
 * Persistent navigation. Desktop: a fixed vertical rail (right) with index +
 * label, current chapter highlighted. Mobile: a fixed control that opens a
 * full-screen chapter list. Fully keyboard operable; every item is a <button>.
 */
export function Navigation({ activeId }: { activeId: string }) {
  const [open, setOpen] = useState(false)
  const activeIndex = Math.max(0, chapters.findIndex((c) => c.id === activeId))

  return (
    <>
      {/* ---------- Desktop rail ---------- */}
      <nav
        aria-label="Chapters"
        className="fixed right-5 top-1/2 z-[90] hidden -translate-y-1/2 md:block"
      >
        <ul className="flex flex-col gap-1">
          {chapters.map((c) => {
            const active = c.id === activeId
            return (
              <li key={c.id}>
                <button
                  onClick={() => scrollToChapter(c.id)}
                  aria-current={active ? 'true' : undefined}
                  className="group flex items-center justify-end gap-3 py-1.5"
                >
                  <span
                    className={cn(
                      'font-mono text-[0.65rem] tracking-widest2 transition-opacity duration-300',
                      active ? 'text-accent opacity-100' : 'text-dim opacity-0 group-hover:opacity-100'
                    )}
                  >
                    <RollText>{c.index} {c.label}</RollText>
                  </span>
                  <span
                    className={cn(
                      'block h-px transition-all duration-300',
                      active ? 'w-8 bg-accent' : 'w-4 bg-faint group-hover:w-6 group-hover:bg-fg'
                    )}
                  />
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* ---------- Mobile trigger ---------- */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open chapter menu"
        aria-expanded={open}
        className="fixed right-4 top-4 z-[95] flex items-center gap-2 border border-line bg-surface/80 px-3 py-2 font-mono text-[0.7rem] text-fg backdrop-blur-md md:hidden"
      >
        <span className="text-accent">{chapters[activeIndex]?.index}</span>
        {chapters[activeIndex]?.label}
        <span className="ml-1 flex flex-col gap-[3px]">
          <span className="h-px w-4 bg-fg" />
          <span className="h-px w-4 bg-fg" />
          <span className="h-px w-4 bg-fg" />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[110] flex flex-col bg-ink/95 backdrop-blur-md md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between border-b border-line p-4">
              <span className="eyebrow">Navigate</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="font-mono text-sm text-fg"
              >
                CLOSE ✕
              </button>
            </div>
            <ul className="flex flex-1 flex-col justify-center gap-1 p-6">
              {chapters.map((c) => {
                const active = c.id === activeId
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => {
                        setOpen(false)
                        setTimeout(() => scrollToChapter(c.id), 120)
                      }}
                      className="flex w-full items-baseline gap-4 border-b border-line/50 py-3 text-left"
                    >
                      <span className={cn('font-mono text-sm', active ? 'text-accent' : 'text-faint')}>
                        {c.index}
                      </span>
                      <span className={cn('font-display text-2xl font-semibold', active ? 'text-accent' : 'text-fg')}>
                        {c.label}
                      </span>
                      <span className="ml-auto font-mono text-[0.6rem] uppercase text-faint">{c.stage}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
