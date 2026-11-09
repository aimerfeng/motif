// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Tremor Labs, Inc.
// Source: https://github.com/tremorlabs/tremor-blocks/blob/b319e8d/src/content/components/chart-compositions/chart-composition-15.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { useId, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#3b82f6',
  alertColor: '#ef4444',
  sparkType: 'area',
  timePeriod: 'today',
  columns: '3',
  heading: 'Cloud monitoring',
  showTable: true,
}
/* @motif:end */

export type DashboardCloudMonitoringProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 强制显示某张卡片的悬停层（演示自动播放用）；-1 表示不强制。 */
  activeIndex?: number
}

// 按亮度选色块上的文字颜色，任何颜色参数都可读
function inkFor(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return '#ffffff'
  const n = parseInt(m[1], 16)
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.36 ? '#0b0b0f' : '#ffffff'
}

type Category = 'Overall costs' | 'Active workspaces' | 'Active users' | 'Uptime' | 'Response time' | 'MTTR'

const data: (Record<Category, number> & { date: string })[] = [
  { date: 'Oct 08, 2024', 'Overall costs': 13500, 'Active workspaces': 180, 'Active users': 15800, Uptime: 96.8, 'Response time': 5.45, MTTR: 425 },
  { date: 'Oct 09, 2024', 'Overall costs': 14920, 'Active workspaces': 165, 'Active users': 14900, Uptime: 97.9, 'Response time': 5.32, MTTR: 385 },
  { date: 'Oct 10, 2024', 'Overall costs': 14250, 'Active workspaces': 210, 'Active users': 13200, Uptime: 97.2, 'Response time': 5.58, MTTR: 410 },
  { date: 'Oct 11, 2024', 'Overall costs': 15800, 'Active workspaces': 195, 'Active users': 14500, Uptime: 98.7, 'Response time': 4.88, MTTR: 298 },
  { date: 'Oct 12, 2024', 'Overall costs': 14580, 'Active workspaces': 285, 'Active users': 11800, Uptime: 99.3, 'Response time': 4.91, MTTR: 315 },
  { date: 'Oct 13, 2024', 'Overall costs': 16200, 'Active workspaces': 245, 'Active users': 13600, Uptime: 97.5, 'Response time': 5.8, MTTR: 445 },
  { date: 'Oct 14, 2024', 'Overall costs': 15750, 'Active workspaces': 390, 'Active users': 11500, Uptime: 98.2, 'Response time': 5.36, MTTR: 378 },
  { date: 'Oct 15, 2024', 'Overall costs': 14290, 'Active workspaces': 355, 'Active users': 13900, Uptime: 99.4, 'Response time': 4.79, MTTR: 290 },
  { date: 'Oct 16, 2024', 'Overall costs': 14550, 'Active workspaces': 420, 'Active users': 12100, Uptime: 99.5, 'Response time': 4.87, MTTR: 305 },
  { date: 'Oct 17, 2024', 'Overall costs': 15980, 'Active workspaces': 375, 'Active users': 14200, Uptime: 98.1, 'Response time': 5.43, MTTR: 420 },
  { date: 'Oct 18, 2024', 'Overall costs': 15220, 'Active workspaces': 445, 'Active users': 11700, Uptime: 98.8, 'Response time': 5.22, MTTR: 358 },
  { date: 'Oct 19, 2024', 'Overall costs': 14780, 'Active workspaces': 395, 'Active users': 13500, Uptime: 99.1, 'Response time': 5.24, MTTR: 330 },
  { date: 'Oct 20, 2024', 'Overall costs': 15450, 'Active workspaces': 455, 'Active users': 11900, Uptime: 99.3, 'Response time': 5.21, MTTR: 340 },
  { date: 'Oct 21, 2024', 'Overall costs': 15210, 'Active workspaces': 380, 'Active users': 12500, Uptime: 99.4, 'Response time': 5.15, MTTR: 325 },
  { date: 'Oct 22, 2024', 'Overall costs': 15091, 'Active workspaces': 312, 'Active users': 12100, Uptime: 99.6, 'Response time': 5.1, MTTR: 313 },
]

const stats: { name: Category; change: string; changeType: 'positive' | 'negative' }[] = [
  { name: 'Overall costs', change: '+1.23%', changeType: 'negative' },
  { name: 'Active workspaces', change: '+4.09%', changeType: 'positive' },
  { name: 'Active users', change: '-4.21%', changeType: 'negative' },
  { name: 'Uptime', change: '+1.21%', changeType: 'positive' },
  { name: 'Response time', change: '+0.21%', changeType: 'negative' },
  { name: 'MTTR', change: '+4.91%', changeType: 'negative' },
]

const dataTable: (Record<Category, string> & { 'Time period': string })[] = [
  { 'Time period': 'Today', 'Overall costs': '$15,091', 'Active workspaces': '312', 'Active users': '12.1K', Uptime: '99.6%', 'Response time': '5.1ms', MTTR: '5min 11s' },
  { 'Time period': 'Last 7 days', 'Overall costs': '$12,432', 'Active workspaces': '419', 'Active users': '8.7K', Uptime: '98.2%', 'Response time': '4.5ms', MTTR: '4min 19s' },
  { 'Time period': 'Last 30 days', 'Overall costs': '$10,321', 'Active workspaces': '210', 'Active users': '7.2K', Uptime: '94.1%', 'Response time': '10.2ms', MTTR: '8min 43s' },
  { 'Time period': 'Last 365 days', 'Overall costs': '$21,432', 'Active workspaces': '380', 'Active users': '7.9K', Uptime: '95.3%', 'Response time': '9.1ms', MTTR: '7min 23s' },
  { 'Time period': 'All time', 'Overall costs': '$9,213', 'Active workspaces': '264', 'Active users': '10.1K', Uptime: '98.2%', 'Response time': '9.9ms', MTTR: '6min 41s' },
]

const PERIODS: Record<string, number> = { today: 0, '7d': 1, '30d': 2, '365d': 3, all: 4 }
const CATEGORIES: Category[] = ['Overall costs', 'Active workspaces', 'Active users', 'Uptime', 'Response time', 'MTTR']

// 代替 Tremor 的 SparkAreaChart（recharts）：一段 SVG 面积 / 折线 / 柱状
function SparkChart({ values, type, color }: { values: number[]; type: string; color: string }) {
  const id = useId().replace(/:/g, '')
  const W = 100
  const H = 40
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const x = (i: number) => (i / (values.length - 1)) * W
  const y = (v: number) => H - 2 - ((v - min) / span) * (H - 4)
  const line = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="mt-4 h-10 w-full overflow-visible" aria-hidden="true">
      {type === 'bar' ? (
        values.map((v, i) => {
          const bw = W / values.length
          const top = y(v)
          return <rect key={i} x={i * bw + bw * 0.15} y={top} width={bw * 0.7} height={H - top} rx={0.6} fill={color} />
        })
      ) : (
        <>
          {type === 'area' && (
            <>
              <defs>
                <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={color} stopOpacity={0.3} />
                  <stop offset="1" stopColor={color} stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <path d={`${line} L${W},${H} L0,${H} Z`} fill={`url(#g${id})`} />
            </>
          )}
          <path d={line} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        </>
      )}
    </svg>
  )
}

const btnBase =
  'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-[var(--acc)] focus-visible:ring-offset-2 focus-visible:ring-offset-background'

export function DashboardCloudMonitoring({ className, style, activeIndex = -1, ...props }: DashboardCloudMonitoringProps) {
  const { accent, alertColor, sparkType, timePeriod, columns, showTable, heading } = { ...defaults, ...props }
  const row = dataTable[PERIODS[timePeriod] ?? 0]

  const pill = (type: 'positive' | 'negative') => {
    const bg = type === 'negative' ? alertColor : '#10b981'
    return { backgroundColor: bg, color: inkFor(bg) }
  }

  return (
    <div className={cn('text-foreground', className)} style={{ ['--acc' as string]: accent, ...style }}>
      <h1 className="text-xl font-semibold text-foreground">{heading}</h1>
      <p className="mt-1 text-sm/6 text-muted-foreground">All your metrics in one overview.</p>
      <div className="mt-6 overflow-hidden rounded-lg border bg-card shadow-xs">
        <dl className={cn('grid grid-cols-1 gap-px bg-border sm:grid-cols-2', columns === '2' ? 'lg:grid-cols-2' : 'lg:grid-cols-3')}>
          {stats.map((stat, i) => {
            const forced = activeIndex === i
            return (
              <div key={stat.name} className="group relative">
                <div
                  className={cn(
                    'absolute inset-0 z-10 hidden bg-background/40 opacity-0 backdrop-blur-xl transition-opacity duration-100 group-focus-within:opacity-100 group-hover:opacity-100 motion-reduce:transition-none sm:block',
                    forced && 'opacity-100',
                  )}
                />
                <div className="relative z-0 flex w-full flex-wrap items-baseline justify-between gap-x-4 bg-card px-4 py-4 sm:px-6 sm:py-6 xl:px-8">
                  <dt className="text-sm/6 font-medium text-muted-foreground">{stat.name}</dt>
                  <dd className="rounded px-1.5 py-0.5 text-xs font-medium tabular-nums" style={pill(stat.changeType)}>
                    {stat.change}
                  </dd>
                  <dd className="mt-0.5 w-full flex-none text-3xl font-semibold tracking-tight text-foreground tabular-nums">{row[stat.name]}</dd>
                  <dd className="w-full">
                    <SparkChart values={data.map((d) => d[stat.name])} type={sparkType} color={accent} />
                  </dd>
                  <div className="block w-full pt-6 pb-4 sm:hidden" aria-hidden="true">
                    <div className="h-px w-full bg-border" />
                  </div>
                  <div className="flex w-full items-center justify-end gap-2 sm:hidden">
                    <button type="button" className="block rounded text-sm font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-[var(--acc)]">
                      Edit alarm
                    </button>
                    <span className="h-6 w-px bg-border" aria-hidden="true" />
                    <button type="button" className="block rounded text-sm font-medium text-foreground underline decoration-[var(--acc)] decoration-2 underline-offset-4 outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[var(--acc)]">
                      View more
                    </button>
                  </div>
                </div>
                {/* Hover state container */}
                <div className="absolute inset-0 z-50 m-auto hidden cursor-pointer sm:flex sm:items-center sm:justify-center sm:gap-2">
                  <button
                    type="button"
                    aria-label={`Edit alarm for ${stat.name}`}
                    className={cn(btnBase, 'border bg-background text-foreground opacity-0 transition-opacity duration-100 group-hover:opacity-100 hover:bg-muted focus-visible:opacity-100 motion-reduce:transition-none', forced && 'opacity-100')}
                  >
                    Edit alarm
                  </button>
                  <button
                    type="button"
                    aria-label={`View details for ${stat.name}`}
                    className={cn(btnBase, 'border-none opacity-0 transition-opacity duration-100 group-hover:opacity-100 focus-visible:opacity-100 motion-reduce:transition-none', forced && 'opacity-100')}
                    style={{ backgroundColor: accent, color: inkFor(accent) }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            )
          })}
        </dl>
      </div>
      {showTable && (
        <div className="mt-8">
          <div className="overflow-hidden overflow-x-auto rounded-lg shadow-sm ring-1 ring-border">
            <table className="w-full caption-bottom text-sm">
              <thead className="bg-muted">
                <tr className="border-b">
                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold whitespace-nowrap text-foreground">
                    Time period
                  </th>
                  {CATEGORIES.map((c) => (
                    <th key={c} scope="col" className="px-4 py-3.5 text-right text-sm font-semibold whitespace-nowrap text-foreground">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {dataTable.map((item, idx) => (
                  <tr key={idx} className={cn(item === row && 'bg-muted/50')} aria-current={item === row ? 'true' : undefined}>
                    <td className="p-4 text-sm whitespace-nowrap text-muted-foreground">{item['Time period']}</td>
                    {CATEGORIES.map((c) => (
                      <td key={c} className="p-4 text-right text-sm whitespace-nowrap text-muted-foreground tabular-nums">
                        {item[c]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
