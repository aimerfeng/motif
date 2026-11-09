import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { KpiHealthSignals, type KpiHealthSignalsProps, type Metric } from './kpi-health-signals'

// 演示：三个指标的比率随时间缓慢漂移，信号格跨过阈值时换色；周期 8 秒与循环视频一致
const PERIOD = 8
const SERIES = [
  { label: 'Lead-to-Quote Ratio', total: 752, base: 0.6, amp: 0.16, phase: 0 },
  { label: 'Project Load', total: 1000, base: 0.26, amp: 0.2, phase: 2.1 },
  { label: 'Win Probability', total: 329, base: 0.78, amp: 0.14, phase: 4.2 },
]

function build(time: number): Metric[] {
  const t = (time / PERIOD) * Math.PI * 2
  return SERIES.map((s) => {
    const value = Math.max(0.02, Math.min(0.98, s.base + Math.sin(t + s.phase) * s.amp))
    const count = Math.round(value * s.total)
    const total = s.total >= 1000 ? `${s.total / 1000}K` : String(s.total)
    return { label: s.label, value, percentage: `${(value * 100).toFixed(1)}%`, fraction: `${count}/${total}` }
  })
}

export function Demo(props: KpiHealthSignalsProps) {
  const host = useRef<HTMLDivElement>(null)
  const [metrics, setMetrics] = useState<Metric[]>(() => build(0))

  useFrameLoop(
    host,
    ({ time }) => {
      // 只在显示的数字变化时更新，避免每帧重渲染
      const next = build(time)
      setMetrics((prev) => (prev.every((m, i) => m.percentage === next[i].percentage) ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background">
      <div className="mx-auto flex min-h-full max-w-5xl flex-col justify-center gap-6 px-4 py-10 sm:px-8" style={{ fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif" }}>
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Halden Sales</p>
          <p className="mt-1 text-sm text-muted-foreground">Funnel health for the current quarter, refreshed hourly.</p>
        </div>
        <KpiHealthSignals {...props} metrics={metrics} />
      </div>
    </div>
  )
}
