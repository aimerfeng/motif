import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { DashboardCloudMonitoring, type DashboardCloudMonitoringProps } from './dashboard-cloud-monitoring'

// 自动播放：每 1.5 秒把悬停层移到下一张卡片；用户指针进入后交还控制
const STEP = 1.5

export function Demo(props: DashboardCloudMonitoringProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(true)
  const [active, setActive] = useState(-1)

  useFrameLoop(
    host,
    ({ time }) => {
      if (!auto) return
      const n = Math.floor(time / STEP) % 7
      const next = n === 0 ? -1 : n - 1
      setActive((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background" onPointerEnter={() => setAuto(false)}>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8" style={{ fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif" }}>
        <DashboardCloudMonitoring {...props} activeIndex={auto ? active : -1} />
      </div>
    </div>
  )
}
