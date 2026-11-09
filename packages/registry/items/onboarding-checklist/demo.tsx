import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { OnboardingChecklist, type OnboardingChecklistProps } from './onboarding-checklist'

const STEP = 2.6
const PERIOD = STEP * 5

export function Demo(props: OnboardingChecklistProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(true)
  const [completed, setCompleted] = useState(1)

  useFrameLoop(
    host,
    ({ time }) => {
      if (!auto) return
      const t = time % PERIOD
      const n = Math.min(4, 1 + Math.floor(t / STEP))
      setCompleted((c) => (c === n ? c : n))
    },
    { reducedMotion: 'static', staticTime: 1 },
  )

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background" onPointerDown={() => setAuto(false)}>
      <div className="mx-auto flex min-h-full max-w-xl flex-col justify-center gap-4 px-4 py-8 sm:px-8" style={{ fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif" }}>
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Fernhollow Goods</p>
          <p className="mt-1 text-sm text-muted-foreground">Finish these steps to open your shop to customers.</p>
        </div>
        <OnboardingChecklist {...props} completed={completed} onCompletedChange={setCompleted} className="mb-0" />
      </div>
    </div>
  )
}
