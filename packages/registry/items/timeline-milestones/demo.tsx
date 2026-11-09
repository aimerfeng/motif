import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { defaults, MilestoneTimeline, type MilestoneTimelineProps } from './timeline-milestones'

const ITEMS = [
  { id: 1, date: 'Mar 15, 2024', title: 'Project Kickoff', description: 'Scope defined with the team; milestones and owners agreed.' },
  { id: 2, date: 'Mar 22, 2024', title: 'Design Phase', description: 'Wireframes and mockups reviewed, feedback folded in.' },
  { id: 3, date: 'Apr 5, 2024', title: 'Development Sprint', description: 'API endpoints and the new settings screens are in progress.' },
  { id: 4, date: 'Apr 19, 2024', title: 'Testing & Deployment', description: 'QA pass, load tests and the production rollout.' },
]

/** 一轮 6 秒：从 0 每 0.7 秒前进一步到 currentStep，停住，再回到 0。 */
function stepAt(time: number, target: number): number {
  const t = time % 6
  if (t >= 5.4) return 0
  return Math.min(target, Math.floor(t / 0.7))
}

export function Demo(props: MilestoneTimelineProps) {
  const host = useRef<HTMLDivElement>(null)
  const target = props.currentStep ?? defaults.currentStep
  const [step, setStep] = useState(target)

  useFrameLoop(
    host,
    ({ time }) => {
      const next = stepAt(time, target)
      setStep((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 4 },
  )

  const horizontal = (props.orientation ?? defaults.orientation) === 'horizontal'
  const done = Math.min(step, ITEMS.length)

  return (
    <div ref={host} className="grid h-full w-full place-items-center overflow-y-auto bg-background p-4 sm:p-6">
      <div className={horizontal ? 'w-full max-w-[720px] rounded-2xl border bg-card/60 p-5 sm:p-6' : 'w-full max-w-[460px] rounded-2xl border bg-card/60 p-5 sm:p-6'}>
        <div className="mb-6 flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground">Harbor v2 launch</div>
            <div className="text-xs text-muted-foreground">Q2 product plan</div>
          </div>
          <div className="shrink-0 text-xs tabular-nums text-muted-foreground" aria-live="polite">
            {done} of {ITEMS.length} done
          </div>
        </div>
        <MilestoneTimeline {...props} items={ITEMS} currentStep={step} />
      </div>
    </div>
  )
}
