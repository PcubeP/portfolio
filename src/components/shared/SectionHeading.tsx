import { Reveal } from './Reveal'
import { SplitReveal } from './SplitReveal'
import { cn } from '@/lib/cn'

export function SectionHeading({
  index,
  eyebrow,
  title,
  className,
}: {
  index: string
  eyebrow: string
  title: string
  className?: string
}) {
  return (
    <div className={cn('mb-10 md:mb-16', className)}>
      <Reveal>
        <div className="flex items-baseline gap-4 border-b border-line pb-4">
          <span className="font-mono text-sm text-accent">{index}</span>
          <span className="eyebrow">{eyebrow}</span>
          <span className="ml-auto font-mono text-[0.65rem] text-faint">// chapter</span>
        </div>
      </Reveal>
      <h2 className="mt-6 font-display text-giant font-bold leading-[0.9] tracking-tight">
        <SplitReveal text={title} stagger={0.06} delay={0.1} />
      </h2>
    </div>
  )
}
