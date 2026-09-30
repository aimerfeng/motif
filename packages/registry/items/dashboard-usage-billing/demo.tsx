import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { DashboardUsageBilling, type DashboardUsageBillingProps } from './dashboard-usage-billing'

const PERIOD = 6

export function Demo(props: DashboardUsageBillingProps) {
  const host = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [cycle, setCycle] = useState(0)

  useFrameLoop(
    host,
    ({ time }) => {
      const n = Math.floor(time / PERIOD)
      setCycle(n)
      if (stage.current) stage.current.style.opacity = String(Math.min(1, (PERIOD - (time - n * PERIOD)) / 0.4))
    },
    { reducedMotion: 'static', staticTime: 3 },
  )

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background">
      <div ref={stage} className="mx-auto flex min-h-full max-w-4xl flex-col justify-center gap-5 px-4 py-8 sm:px-8" style={{ fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif" }}>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Billing</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track usage against your plan and see what the next invoice will be.</p>
        </div>
        <DashboardUsageBilling key={`${cycle}:${JSON.stringify(props)}`} {...props} />
      </div>
    </div>
  )
}
