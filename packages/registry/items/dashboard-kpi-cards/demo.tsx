import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { DashboardKpiCards, type DashboardKpiCardsProps } from './dashboard-kpi-cards'

/** 每隔一个周期重播入场动画，循环视频的长度与它一致。 */
const PERIOD = 6

export function Demo(props: DashboardKpiCardsProps) {
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
      <div ref={stage} className="mx-auto flex min-h-full max-w-6xl flex-col justify-center gap-6 px-4 py-8 sm:px-8" style={{ fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif" }}>
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Halcyon Analytics</p>
          <p className="mt-1 text-sm text-muted-foreground">Workspace metrics, refreshed every five minutes.</p>
        </div>
        <DashboardKpiCards key={`${cycle}:${JSON.stringify(props)}`} {...props} />
      </div>
    </div>
  )
}
