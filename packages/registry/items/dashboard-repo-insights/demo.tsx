import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { DashboardRepoInsights, type DashboardRepoInsightsProps } from './dashboard-repo-insights'

/** 每隔一个周期重播入场动画。 */
const PERIOD = 8

export function Demo(props: DashboardRepoInsightsProps) {
  const host = useRef<HTMLDivElement>(null)
  const [cycle, setCycle] = useState(0)

  useFrameLoop(host, ({ time }) => setCycle(Math.floor(time / PERIOD)), { reducedMotion: 'static', staticTime: 3 })

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-12" style={{ fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif" }}>
        <h1 className="mb-6 text-lg font-semibold tracking-tight">Insights</h1>
        <DashboardRepoInsights key={`${cycle}:${JSON.stringify(props)}`} {...props} />
      </div>
    </div>
  )
}
