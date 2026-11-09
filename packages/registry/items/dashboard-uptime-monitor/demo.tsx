import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { DashboardUptimeMonitor, type DashboardUptimeMonitorProps } from './dashboard-uptime-monitor'

// 自动播放：十字线缓慢扫过图表（每 0.25 秒前进一个点），扫完停一拍；用户指针进入后交还控制
const STEP = 0.25
const POINTS = 44

export function Demo(props: DashboardUptimeMonitorProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(true)
  const [active, setActive] = useState(18)

  useFrameLoop(
    host,
    ({ time }) => {
      if (!auto) return
      const n = Math.floor(time / STEP) % POINTS
      const next = n < 40 ? n : -1
      setActive((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 18 * STEP },
  )

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background" onPointerEnter={() => setAuto(false)}>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-8" style={{ fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif" }}>
        <DashboardUptimeMonitor {...props} activeIndex={auto ? active : -1} />
      </div>
    </div>
  )
}
