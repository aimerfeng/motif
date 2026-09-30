import { useRef, useState } from 'react'
import { useFrameLoop } from '@motif/runtime'
import { ProgressRing, type ProgressRingProps } from './progress-ring'

const GOAL = 8000
const CYCLE = 9

/** 每个周期里：先在 0.6 秒时跳到 62%，再在 3.2 秒时跳到 84%，到 7 秒回零，弹簧会把跳变变成流畅的推进。 */
function stepsAt(time: number): number {
  const t = time % CYCLE
  if (t < 0.6 || t >= 7.4) return 0
  if (t < 3.2) return 4960
  return 6720
}

export function Demo(props: ProgressRingProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [steps, setSteps] = useState(0)
  useFrameLoop(ref, ({ time }) => setSteps(stepsAt(time)), { reducedMotion: 'static', staticTime: 4 })
  const value = (steps / GOAL) * 100

  return (
    <div ref={ref} className="grid h-full w-full place-items-center bg-background p-8">
      <div className="flex items-center gap-7 rounded-2xl border bg-card p-6 shadow-2xl shadow-black/40">
        <ProgressRing {...props} value={value} />
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground">Steps today</p>
            <p className="text-2xl font-semibold tabular-nums tracking-tight text-card-foreground">{steps.toLocaleString('en-US')}</p>
          </div>
          <div className="h-px bg-border" />
          <div className="flex gap-6 text-xs">
            <div>
              <p className="text-muted-foreground">Goal</p>
              <p className="mt-0.5 text-sm font-medium tabular-nums text-card-foreground">{GOAL.toLocaleString('en-US')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">To go</p>
              <p className="mt-0.5 text-sm font-medium tabular-nums text-card-foreground">{Math.max(GOAL - steps, 0).toLocaleString('en-US')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
