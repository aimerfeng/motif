import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { KpiCategoryBar, type KpiCategoryBarProps, type KpiGroup, type KpiSummary } from './kpi-category-bar'

// 演示：各分段占比随时间缓慢漂移（周期 8 秒，与循环视频一致），条形和图例一起变化
const PERIOD = 8

function drift(base: readonly number[], t: number, phase: number, amp: number): number[] {
  // 第一段和最后一段此消彼长，总和保持不变
  const d = Math.sin(t + phase) * amp
  const next = [...base]
  next[0] = Math.max(1, base[0] + d)
  next[next.length - 1] = Math.max(1, base[base.length - 1] - d)
  return next.map((v) => Math.round(v * 10) / 10)
}

function build(time: number): { groups: KpiGroup[]; summary: KpiSummary } {
  const t = (time / PERIOD) * Math.PI * 2
  const tickets = drift([82, 13, 5], t, 0, 6)
  const queries = drift([57, 12, 31], t, 2.1, 9)
  const latency = drift([75, 20, 5], t, 4.2, 5)
  const sales = drift([34.4, 30.6, 20.9, 14.1], t, 1, 4)
  const money = (share: number) => `$${((share / 100) * 292.4).toFixed(1)}K`
  return {
    groups: [
      {
        name: 'Open Tickets',
        total: '247',
        markerLabel: 'SLA target: 80% resolved',
        segments: [
          { name: 'Resolved', value: tickets[0], display: String(Math.round(tickets[0] * 2.47)) },
          { name: 'In progress', value: tickets[1], display: String(Math.round(tickets[1] * 2.47)) },
          { name: 'Escalated', value: tickets[2], display: String(Math.round(tickets[2] * 2.47)) },
        ],
      },
      {
        name: 'Database Queries',
        total: '44,757',
        markerLabel: 'Goal: 80% optimized',
        segments: [
          { name: 'Optimized', value: queries[0] },
          { name: 'Editing', value: queries[1] },
          { name: 'Slow', value: queries[2] },
        ],
      },
      {
        name: 'Query Latency',
        total: '1,247ms',
        markerLabel: 'Budget: 80% fast',
        segments: [
          { name: 'Fast', value: latency[0] },
          { name: 'Medium', value: latency[1] },
          { name: 'Slow', value: latency[2] },
        ],
      },
    ],
    summary: {
      title: 'Total sales',
      total: '$292,400',
      subtitle: 'Sales channel distribution',
      markerLabel: 'Direct + retail target: 80%',
      segments: [
        { name: 'Direct sales', value: sales[0], display: money(sales[0]) },
        { name: 'Retail stores', value: sales[1], display: money(sales[1]) },
        { name: 'E-commerce', value: sales[2], display: money(sales[2]) },
        { name: 'Wholesale', value: sales[3], display: money(sales[3]) },
      ],
    },
  }
}

export function Demo(props: KpiCategoryBarProps) {
  const host = useRef<HTMLDivElement>(null)
  const [data, setData] = useState(() => build(0))

  useFrameLoop(
    host,
    ({ time }) => {
      // 只在显示的数字变化时更新，避免每帧重渲染
      const next = build(time)
      setData((prev) => (prev.groups.every((g, i) => g.segments[0].value === next.groups[i].segments[0].value) && prev.summary.segments[0].value === next.summary.segments[0].value ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background">
      <div className="mx-auto flex min-h-full max-w-5xl flex-col justify-center gap-6 px-4 py-10 sm:px-8" style={{ fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif" }}>
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Northwind Ops</p>
          <p className="mt-1 text-sm text-muted-foreground">Support and data platform, last 24 hours.</p>
        </div>
        <KpiCategoryBar {...props} groups={data.groups} summary={data.summary} />
      </div>
    </div>
  )
}
