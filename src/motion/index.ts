/**
 * MOTION SYSTEM — the single source of truth for how this site moves.
 * Import springs, easings, the scroll primitive, and reusable transitions
 * from here rather than hand-tuning motion per component.
 */
export * from './springs'
export * from './ease'
export * from './useSectionScroll'
export * from './useAccentOnView'
export { PinnedStage } from './PinnedStage'
export { ZoomTransition } from './transitions/ZoomTransition'
