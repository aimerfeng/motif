// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Tremor Labs, Inc.
// Source: https://github.com/tremorlabs/tremor-blocks/blob/b319e8d/src/content/components/chart-compositions/chart-composition-11.tsx
// Source: https://github.com/tremorlabs/tremor-blocks/blob/b319e8d/src/content/components/chart-compositions/chart-composition-12.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  siteName: 'halyard.dev',
  status: 'up',
  accent: '#8b5cf6',
  fill: 'solid',
  view: 'response',
  region: 'europe',
  range: 'day',
  showActions: true,
}
/* @motif:end */

export type DashboardUptimeMonitorProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 强制图表高亮某个数据点（演示自动播放用）；-1 表示不强制。 */
  activeIndex?: number
}

type Row = { date: string } & Record<string, number | string>

// ---- chart-composition-11 data ----
const responseData: Row[] = [
  { date: '01:29am', 'Name lookup': 710, Connection: 605, 'TLS handshake': 300, 'Data transfer': 200 },
  { date: '01:42am', 'Name lookup': 794, Connection: 601, 'TLS handshake': 310, 'Data transfer': 220 },
  { date: '02:22am', 'Name lookup': 1088, Connection: 592, 'TLS handshake': 290, 'Data transfer': 210 },
  { date: '03:34am', 'Name lookup': 1209, Connection: 543, 'TLS handshake': 250, 'Data transfer': 130 },
  { date: '03:51am', 'Name lookup': 3571, Connection: 2090, 'TLS handshake': 1512, 'Data transfer': 1054 },
  { date: '04:01am', 'Name lookup': 1090, Connection: 890, 'TLS handshake': 300, 'Data transfer': 180 },
  { date: '04:23am', 'Name lookup': 129, Connection: 605, 'TLS handshake': 320, 'Data transfer': 210 },
  { date: '04:41am', 'Name lookup': 100, Connection: 210, 'TLS handshake': 180, 'Data transfer': 90 },
  { date: '04:47am', 'Name lookup': 102, Connection: 392, 'TLS handshake': 150, 'Data transfer': 110 },
  { date: '05:01am', 'Name lookup': 102, Connection: 432, 'TLS handshake': 160, 'Data transfer': 100 },
  { date: '05:08am', 'Name lookup': 103, Connection: 423, 'TLS handshake': 150, 'Data transfer': 105 },
  { date: '05:18am', 'Name lookup': 104, Connection: 530, 'TLS handshake': 180, 'Data transfer': 140 },
  { date: '06:03am', 'Name lookup': 354, Connection: 484, 'TLS handshake': 270, 'Data transfer': 150 },
  { date: '07:09am', 'Name lookup': 463, Connection: 631, 'TLS handshake': 310, 'Data transfer': 220 },
  { date: '07:09am', 'Name lookup': 412, Connection: 541, 'TLS handshake': 290, 'Data transfer': 200 },
  { date: '08:21am', 'Name lookup': 693, Connection: 873, 'TLS handshake': 400, 'Data transfer': 300 },
  { date: '08:39am', 'Name lookup': 192, Connection: 294, 'TLS handshake': 160, 'Data transfer': 90 },
  { date: '09:03am', 'Name lookup': 293, Connection: 912, 'TLS handshake': 340, 'Data transfer': 250 },
  { date: '09:19am', 'Name lookup': 105, Connection: 430, 'TLS handshake': 170, 'Data transfer': 120 },
  { date: '10:22am', 'Name lookup': 110, Connection: 731, 'TLS handshake': 280, 'Data transfer': 190 },
  { date: '10:29am', 'Name lookup': 670, Connection: 539, 'TLS handshake': 290, 'Data transfer': 210 },
  { date: '10:34am', 'Name lookup': 690, Connection: 605, 'TLS handshake': 300, 'Data transfer': 220 },
  { date: '10:36am', 'Name lookup': 793, Connection: 1023, 'TLS handshake': 410, 'Data transfer': 320 },
  { date: '11:46am', 'Name lookup': 902, Connection: 605, 'TLS handshake': 320, 'Data transfer': 240 },
  { date: '11:49am', 'Name lookup': 919, Connection: 392, 'TLS handshake': 270, 'Data transfer': 180 },
  { date: '11:50am', 'Name lookup': 955, Connection: 539, 'TLS handshake': 300, 'Data transfer': 210 },
  { date: '11:55am', 'Name lookup': 995, Connection: 293, 'TLS handshake': 160, 'Data transfer': 120 },
  { date: '12:05pm', 'Name lookup': 872, Connection: 520, 'TLS handshake': 290, 'Data transfer': 230 },
  { date: '12:19pm', 'Name lookup': 101, Connection: 418, 'TLS handshake': 190, 'Data transfer': 160 },
  { date: '12:21pm', 'Name lookup': 657, Connection: 912, 'TLS handshake': 340, 'Data transfer': 270 },
  { date: '12:31pm', 'Name lookup': 732, Connection: 640, 'TLS handshake': 300, 'Data transfer': 200 },
  { date: '12:41pm', 'Name lookup': 895, Connection: 509, 'TLS handshake': 280, 'Data transfer': 210 },
  { date: '01:13pm', 'Name lookup': 993, Connection: 701, 'TLS handshake': 320, 'Data transfer': 250 },
  { date: '01:34pm', 'Name lookup': 1189, Connection: 760, 'TLS handshake': 390, 'Data transfer': 290 },
  { date: '01:56pm', 'Name lookup': 1390, Connection: 831, 'TLS handshake': 420, 'Data transfer': 320 },
  { date: '02:12pm', 'Name lookup': 1375, Connection: 713, 'TLS handshake': 410, 'Data transfer': 310 },
  { date: '02:33pm', 'Name lookup': 960, Connection: 481, 'TLS handshake': 270, 'Data transfer': 230 },
  { date: '02:56pm', 'Name lookup': 1120, Connection: 510, 'TLS handshake': 290, 'Data transfer': 240 },
  { date: '03:14pm', 'Name lookup': 1210, Connection: 654, 'TLS handshake': 350, 'Data transfer': 260 },
  { date: '03:31pm', 'Name lookup': 1185, Connection: 700, 'TLS handshake': 360, 'Data transfer': 280 },
  { date: '03:55pm', 'Name lookup': 1290, Connection: 820, 'TLS handshake': 400, 'Data transfer': 300 },
]
const responseCategories = ['Name lookup', 'Connection', 'TLS handshake', 'Data transfer']

// ---- chart-composition-12 data ----
const incidentValues: [number, number, number, number][] = [
  [6.5, 31, 45, 50], [7, 45, 58, 65], [9, 53, 65, 73], [12, 130, 100, 90], [22, 105, 95, 88],
  [14, 145, 120, 100], [35, 120, 110, 85], [11, 140, 125, 98], [10, 115, 98, 88], [13, 150, 118, 110],
  [13, 140, 123, 100], [11, 135, 110, 98], [15, 170, 130, 115], [12, 135, 115, 105], [10.5, 130, 110, 95],
  [45, 165, 125, 115], [35, 150, 120, 100], [10, 140, 112, 105], [25, 135, 115, 110], [55, 160, 140, 125],
  [61, 180, 150, 130], [45, 155, 135, 120], [50, 170, 140, 125], [15, 140, 118, 105], [40, 160, 130, 120],
]
const incidentCategories = ['Avg. response time', 'Total incident length', 'MTTR', 'MTTA']
const incidentData: Row[] = incidentValues.map((v, i) => ({
  date: `Day ${i + 1}`,
  'Avg. response time': v[0],
  'Total incident length': v[1],
  MTTR: v[2],
  MTTA: v[3],
}))

const stats = [
  { name: 'Avg. response time', description: 'Speed at which the server can respond', value: '34s' },
  { name: 'Total incident length', description: 'Total duration from when an incident starts to when it is fully resolved', value: '1min 31s' },
  { name: 'MTTA', description: "Avg. time it takes to acknowledge or respond to an incident after it's been detected", value: '3min 29s' },
  { name: 'MTTR', description: 'Avg. time it takes to resolve an issue after it has been reported', value: '5min 21s' },
]

const regions = [
  { value: 'north-america', label: 'North America' },
  { value: 'europe', label: 'Europe' },
  { value: 'asia', label: 'Asia' },
  { value: 'australia', label: 'Australia' },
]
const REGION_FACTOR: Record<string, number> = { 'north-america': 1.18, europe: 1, asia: 1.36, australia: 1.52 }

const selectOptions = [
  {
    id: 'integration',
    label: 'Integrations',
    defaultValue: 'all',
    width: 'w-28',
    options: [
      { value: 'all', label: 'All' },
      { value: 'beacon', label: 'Beacon Watch' },
      { value: 'logwell', label: 'Logwell' },
      { value: 'tracewire', label: 'Tracewire' },
    ],
  },
  {
    id: 'acknowledger',
    label: 'Acknowledged by',
    defaultValue: 'emily-smith',
    width: 'w-40',
    options: [
      { value: 'all', label: 'All' },
      { value: 'emily-smith', label: 'Emily Smith' },
      { value: 'mike-kingstone', label: 'Mike Kingstone' },
      { value: 'simon-dumentis', label: 'Simon Dumentis' },
    ],
  },
  {
    id: 'escalator',
    label: 'Resolved by',
    defaultValue: 'michael-bridge',
    width: 'w-40',
    options: [
      { value: 'michael-bridge', label: 'Michael Bridge' },
      { value: 'emma-stone', label: 'Emma Stone' },
      { value: 'max-mcbeccel', label: 'Max McBeccel' },
      { value: 'lena-goldriver', label: 'Lena Goldriver' },
    ],
  },
  {
    id: 'escalation-policy',
    label: 'Escalation policy',
    defaultValue: 'hierarchical',
    width: 'w-32',
    options: [
      { value: 'all', label: 'All' },
      { value: 'hierarchical', label: 'Hierarchical Escalation' },
      { value: 'functional', label: 'Functional Escalation' },
      { value: 'time-based', label: 'Time-based Escalation' },
    ],
  },
  {
    id: 'cause',
    label: 'Cause',
    defaultValue: '404-not-found',
    width: 'w-40',
    options: [
      { value: 'all', label: 'All' },
      { value: '502-bad-gateway', label: '502 Bad Gateway' },
      { value: '404-not-found', label: '404 Not Found' },
      { value: '400-bad-request', label: '400 Bad Request' },
    ],
  },
]

const msFormatter = (milliseconds: number) => {
  const ms = Math.round(milliseconds)
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}
const secFormatter = (seconds: number) => {
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  return `${(seconds / 60).toFixed(1)}min`
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// 上游只有一天的数据；周 / 月视图由同一组数值做滑动平均得到，地区只按系数缩放
function responseRows(region: string, range: string): Row[] {
  const f = REGION_FACTOR[region] ?? 1
  const scale = (r: Row): Row => {
    const out: Row = { date: r.date }
    responseCategories.forEach((c, k) => (out[c] = Math.round((r[c] as number) * (k < 2 ? f : 1 + (f - 1) * 0.5))))
    return out
  }
  if (range === 'day') return responseData.map(scale)
  const n = range === 'week' ? 28 : 30
  const win = range === 'week' ? 3 : 5
  const len = responseData.length
  return Array.from({ length: n }, (_, i) => {
    const out: Row = { date: range === 'week' ? `${DAYS[Math.floor(i / 4)]} ${String((i % 4) * 6).padStart(2, '0')}:00` : `Oct ${i + 1}` }
    const base = scale(responseData[(i * 3 + (range === 'week' ? 7 : 2)) % len])
    responseCategories.forEach((c) => {
      let s = 0
      for (let j = 0; j < win; j++) s += scale(responseData[(i * 3 + j * 5) % len])[c] as number
      out[c] = Math.round((s / win + (base[c] as number)) / 2)
    })
    return out
  })
}

function niceCeil(v: number) {
  const p = 10 ** Math.floor(Math.log10(Math.max(1, v)))
  const m = v / p
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p
}

// ---- 代替 Tremor AreaChart（recharts）：手绘 SVG 面积图，带图例、十字线和提示 ----
type AreaChartProps = {
  data: Row[]
  categories: string[]
  colors: string[]
  fill: string
  valueFormatter: (v: number) => string
  maxValue: number
  yAxisWidth: number
  activeIndex: number
  label: string
  className?: string
}

function AreaChart({ data, categories, colors, fill, valueFormatter, maxValue, yAxisWidth, activeIndex, label, className }: AreaChartProps) {
  const uid = useId().replace(/:/g, '')
  const host = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(640)
  const [hover, setHover] = useState(-1)

  useLayoutEffect(() => {
    const el = host.current
    if (!el) return
    const update = () => setWidth(Math.max(200, el.clientWidth))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const narrow = width < 520
  const showYAxis = !narrow
  const H = 288
  const top = 8
  const bottom = 28
  const left = showYAxis ? yAxisWidth : 0
  const plotW = width - left - 4
  const plotH = H - top - bottom
  const dataMax = Math.max(...data.flatMap((d) => categories.map((c) => d[c] as number)))
  const max = dataMax <= maxValue ? maxValue : niceCeil(dataMax)
  const x = (i: number) => left + (data.length < 2 ? 0 : (i / (data.length - 1)) * plotW)
  const y = (v: number) => top + plotH - (v / max) * plotH
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max)

  // 横轴标签：窄屏只留首尾（upstream startEndOnly），宽屏按间距抽样（tickGap）
  const labelEvery = Math.max(1, Math.ceil(data.length / Math.max(2, Math.floor(plotW / 78))))
  const xLabels = narrow
    ? [0, data.length - 1]
    : data.map((_, i) => i).filter((i) => i % labelEvery === 0 && x(i) + 30 < width)

  const current = hover >= 0 ? hover : activeIndex
  const active = current >= 0 && current < data.length ? current : -1

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - r.left
    const i = Math.round(((px - left) / plotW) * (data.length - 1))
    setHover(Math.max(0, Math.min(data.length - 1, i)))
  }

  const tipLeft = active >= 0 ? Math.min(Math.max(x(active) + 12, 0), width - 228) : 0
  const flip = active >= 0 && x(active) + 240 > width

  return (
    <div className={cn('w-full', className)}>
      <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1">
        {categories.map((c, i) => (
          <span key={c} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2 shrink-0 rounded-xs" style={{ backgroundColor: colors[i] }} aria-hidden="true" />
            {c}
          </span>
        ))}
      </div>
      <div ref={host} className="relative mt-3 w-full">
        <svg
          width={width}
          height={H}
          className="block overflow-visible"
          role="img"
          aria-label={label}
          onPointerMove={onMove}
          onPointerLeave={() => setHover(-1)}
        >
          <defs>
            {categories.map((c, i) => (
              <linearGradient key={c} id={`${uid}-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[i]} stopOpacity={fill === 'gradient' ? 0.4 : 0.3} />
                <stop offset="95%" stopColor={colors[i]} stopOpacity={fill === 'gradient' ? 0 : 0.3} />
              </linearGradient>
            ))}
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={left} x2={left + plotW} y1={y(t)} y2={y(t)} className="stroke-border" strokeWidth={1} />
              {showYAxis && (
                <text x={left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted-foreground text-xs tabular-nums">
                  {valueFormatter(t)}
                </text>
              )}
            </g>
          ))}
          {xLabels.map((i) => (
            <text
              key={i}
              x={x(i)}
              y={H - 6}
              textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'}
              className="fill-muted-foreground text-xs"
            >
              {data[i].date}
            </text>
          ))}
          {categories.map((c, ci) => {
            const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d[c] as number).toFixed(1)}`).join(' ')
            return (
              <g key={c}>
                <path d={`${line} L${x(data.length - 1).toFixed(1)},${y(0)} L${left},${y(0)} Z`} fill={`url(#${uid}-${ci})`} />
                <path d={line} fill="none" stroke={colors[ci]} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              </g>
            )
          })}
          {active >= 0 && (
            <g>
              <line x1={x(active)} x2={x(active)} y1={top} y2={top + plotH} className="stroke-muted-foreground/60" strokeWidth={1} />
              {categories.map((c, ci) => (
                <circle key={c} cx={x(active)} cy={y(data[active][c] as number)} r={4} fill={colors[ci]} className="stroke-card" strokeWidth={2} />
              ))}
            </g>
          )}
        </svg>
        {active >= 0 && (
          <div
            className="pointer-events-none absolute top-2 z-10 w-56 rounded-md border bg-popover text-sm text-popover-foreground shadow-md"
            style={{ left: flip ? Math.max(0, x(active) - 232) : tipLeft }}
            aria-hidden="true"
          >
            <div className="border-b px-3 py-2 font-medium">{data[active].date}</div>
            <div className="space-y-1 px-3 py-2">
              {categories.map((c, ci) => (
                <div key={c} className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-3 w-1 shrink-0 rounded-full" style={{ backgroundColor: colors[ci] }} />
                    {c}
                  </span>
                  <span className="font-medium tabular-nums">{valueFormatter(data[active][c] as number)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ---- SelectNative → 原生 select + 内联箭头 ----
function NativeSelect({ id, value, onChange, children, className, joined }: { id: string; value?: string; onChange?: (v: string) => void; children: ReactNode; className?: string; joined?: boolean }) {
  return (
    <span className={cn('relative inline-flex', className)}>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          'h-[38px] w-full appearance-none truncate border bg-card py-1.5 pr-8 pl-3 text-base text-foreground shadow-xs outline-none sm:h-[34px] sm:text-sm',
          'focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-[var(--acc)]',
          joined ? '-ml-px rounded-none rounded-r-md shadow-none' : 'rounded-md',
        )}
      >
        {children}
      </select>
      <svg viewBox="0 0 20 20" className="pointer-events-none absolute top-1/2 right-2.5 z-10 size-4 -translate-y-1/2 text-muted-foreground" fill="currentColor" aria-hidden="true">
        <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" />
      </svg>
    </span>
  )
}

function UncontrolledSelect({ id, defaultValue, options, className }: { id: string; defaultValue: string; options: { value: string; label: string }[]; className?: string }) {
  const [v, setV] = useState(defaultValue)
  return (
    <NativeSelect id={id} value={v} onChange={setV} className={className} joined>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </NativeSelect>
  )
}

// ---- Tooltip → 手写：悬停 / 聚焦显示说明 ----
function InfoTooltip({ name, content }: { name: string; content: string }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <span className="relative inline-flex" onPointerEnter={() => setOpen(true)} onPointerLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-label={`About ${name}`}
        aria-describedby={open ? id : undefined}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        className="rounded-full text-muted-foreground/70 outline-none hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-[var(--acc)]"
      >
        <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="currentColor" aria-hidden="true">
          <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10Zm-1-11v6h2v-6h-2Zm0-4v2h2V7h-2Z" />
        </svg>
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-md bg-foreground px-2.5 py-1.5 text-xs leading-5 text-background shadow-md"
        >
          {content}
        </span>
      )}
    </span>
  )
}

// ---- 图标（替代 @remixicon/react） ----
const icons = {
  send: 'M3.5 1.346a.5.5 0 0 0-.69.582l2.4 8.572 7.29.5-7.29.5-2.4 8.572a.5.5 0 0 0 .69.582l18.44-9.154a.5.5 0 0 0 0-.896L3.5 1.346Z',
  shield: 'M3.783 2.826 12 1l8.217 1.826a1 1 0 0 1 .783.976v9.987a6 6 0 0 1-2.672 4.992L12 23l-6.328-4.219A6 6 0 0 1 3 13.79V3.802a1 1 0 0 1 .783-.976ZM5 4.604v9.185a4 4 0 0 0 1.781 3.328L12 20.597l5.219-3.48A4 4 0 0 0 19 13.79V4.604L12 3.05 5 4.604Z',
  pause: 'M6 3h2v18H6V3Zm10 0h2v18h-2V3Z',
  play: 'M7.752 5.439 17.861 12 7.752 18.561V5.439ZM6 3.5v17a.5.5 0 0 0 .77.42l14-9a.5.5 0 0 0 0-.84l-14-9A.5.5 0 0 0 6 3.5Z',
  settings: 'M12 1l9.526 5.5v11L12 23l-9.526-5.5v-11L12 1Zm0 2.31L4.474 7.655v8.69L12 20.69l7.526-4.345v-8.69L12 3.31ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
}
function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="currentColor" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

const ghostBtn =
  'inline-flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-[var(--acc)] aria-pressed:bg-muted aria-pressed:text-foreground motion-reduce:transition-none'

const SERIES = ['#3b82f6', '#06b6d4', '#10b981']

export function DashboardUptimeMonitor({ className, style, activeIndex = -1, ...props }: DashboardUptimeMonitorProps) {
  const { siteName, status, accent, fill, showActions, view: viewParam, region: regionParam, range: rangeParam } = { ...defaults, ...props }

  // 视图、地区、范围是页面内可切换的状态；参数变化时同步过来
  const [view, setView] = useState(viewParam)
  const [region, setRegion] = useState(regionParam)
  const [range, setRange] = useState(rangeParam)
  const [paused, setPaused] = useState(false)
  useEffect(() => setView(viewParam), [viewParam])
  useEffect(() => setRegion(regionParam), [regionParam])
  useEffect(() => setRange(rangeParam), [rangeParam])

  const degraded = status === 'degraded'
  const dot = paused ? '#71717a' : degraded ? '#f59e0b' : '#059669'
  const colors = [accent, ...SERIES]

  const summary = [
    { name: degraded ? 'Degraded for' : 'Currently up for', value: degraded ? '14 minutes' : '10 months 12 days' },
    { name: 'Last checked at', value: '2 minutes ago' },
    { name: 'Incidents', value: degraded ? '1' : '0' },
  ]

  const toggleItems = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year', disabled: true },
  ]
  const enabled = toggleItems.filter((t) => !t.disabled)
  const onToggleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const i = enabled.findIndex((t) => t.value === range)
    const next = enabled[(i + (e.key === 'ArrowRight' ? 1 : enabled.length - 1)) % enabled.length]
    setRange(next.value)
    const btn = e.currentTarget.querySelector<HTMLButtonElement>(`[data-value="${next.value}"]`)
    btn?.focus()
  }

  return (
    <div className={cn('text-foreground', className)} style={{ ['--acc' as string]: accent, ...style }}>
      <div className="flex min-w-0 items-center gap-3">
        <span className={cn('shrink-0 rounded-full p-1', !paused && 'motion-safe:animate-pulse')} style={{ backgroundColor: `${dot}4d` }} aria-hidden="true">
          <span className="block size-2 rounded-full" style={{ backgroundColor: dot }} />
        </span>
        <h1 className="min-w-0 truncate text-2xl font-semibold text-foreground">{siteName}</h1>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2" role="status">
        <span className={cn('text-sm font-medium', paused ? 'text-muted-foreground' : degraded ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400')}>
          {paused ? 'Paused' : degraded ? 'Degraded' : 'Up'}
        </span>
        <span className="size-1 shrink-0 rounded-full bg-muted-foreground" aria-hidden="true" />
        <span className="text-sm text-muted-foreground">Checking every 3 minutes</span>
      </div>
      {showActions && (
        <div className="mt-10 flex flex-wrap items-center gap-1">
          <button type="button" className={ghostBtn}>
            <Icon d={icons.send} />
            Send test alert
          </button>
          <button type="button" className={ghostBtn} aria-pressed={view === 'incidents'} onClick={() => setView(view === 'incidents' ? 'response' : 'incidents')}>
            <Icon d={icons.shield} />
            Incidents
          </button>
          <button type="button" className={ghostBtn} aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
            <Icon d={paused ? icons.play : icons.pause} />
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button type="button" className={ghostBtn}>
            <Icon d={icons.settings} />
            Configure
          </button>
        </div>
      )}

      {view === 'incidents' ? (
        <div className={showActions ? 'mt-6' : 'mt-10'}>
          <h2 className="text-xl font-semibold text-foreground">Overview</h2>
          <p className="mt-1 text-sm/6 text-muted-foreground">Get insights into your incidents</p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center shadow-xs">
              <label htmlFor="uptime-incident-region" className="flex h-[38px] items-center rounded-l-md border bg-muted px-2.5 text-base whitespace-nowrap text-foreground select-none sm:h-[34px] sm:text-sm">
                Region
              </label>
              <NativeSelect id="uptime-incident-region" value={region} onChange={setRegion} className="w-36" joined>
                {regions.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </NativeSelect>
            </span>
            {selectOptions.map(({ id, label, defaultValue, width, options }) => (
              <span key={id} className="inline-flex items-center shadow-xs">
                <label htmlFor={`uptime-${id}`} className="flex h-[38px] items-center rounded-l-md border bg-muted px-2.5 text-base whitespace-nowrap text-foreground select-none sm:h-[34px] sm:text-sm">
                  {label}
                </label>
                <UncontrolledSelect id={`uptime-${id}`} defaultValue={defaultValue} options={options} className={width} />
              </span>
            ))}
          </div>
          <div className="mt-6 overflow-hidden rounded-lg border bg-card shadow-xs">
            <div className="p-6">
              <AreaChart
                data={incidentData.map((r) => {
                  const f = REGION_FACTOR[region] ?? 1
                  const out: Row = { date: r.date }
                  incidentCategories.forEach((c) => (out[c] = Math.round((r[c] as number) * f * 10) / 10))
                  return out
                })}
                categories={incidentCategories}
                colors={colors}
                fill={fill}
                valueFormatter={secFormatter}
                maxValue={400}
                yAxisWidth={55}
                activeIndex={activeIndex}
                label="Incident metrics over the last 25 days"
              />
            </div>
            <dl className="mx-auto grid grid-cols-1 gap-px border-t bg-border sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((item) => (
                <div key={item.name} className="flex flex-col-reverse bg-card px-4 py-6 sm:px-6 xl:px-8">
                  <dt className="mt-1 flex items-center gap-2">
                    <span className="text-sm/6 text-muted-foreground">{item.name}</span>
                    <InfoTooltip name={item.name} content={item.description} />
                  </dt>
                  <dd className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      ) : (
        <>
          <dl className={cn('grid grid-cols-1 gap-6 sm:grid-cols-3', showActions ? 'mt-4' : 'mt-10')}>
            {summary.map((item) => (
              <div key={item.name} className="flex flex-col-reverse rounded-lg border bg-card p-6 shadow-xs">
                <dd className="mt-2 text-lg font-semibold text-foreground">{item.value}</dd>
                <dt className="text-sm text-muted-foreground">{item.name}</dt>
              </div>
            ))}
          </dl>
          <div className="mt-6 rounded-lg border bg-card shadow-xs">
            <div className="px-6 py-3">
              <h2 className="text-base font-medium text-foreground">Response times</h2>
            </div>
            <div className="h-px w-full bg-border" aria-hidden="true" />
            <div className="rounded-b-lg px-6 pt-6 pb-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <label htmlFor="uptime-region" className="sr-only">
                    Select region
                  </label>
                  <NativeSelect id="uptime-region" value={region} onChange={setRegion} className="w-full sm:w-fit">
                    {regions.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
                <div
                  role="radiogroup"
                  aria-label="Time period selection"
                  onKeyDown={onToggleKey}
                  className="inline-flex h-[38px] w-full divide-x rounded-md border bg-card shadow-xs sm:h-[34px] sm:w-fit"
                >
                  {toggleItems.map((t) => {
                    const on = t.value === range
                    return (
                      <button
                        key={t.value}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        aria-label={t.label}
                        data-value={t.value}
                        disabled={t.disabled}
                        tabIndex={on ? 0 : -1}
                        onClick={() => setRange(t.value)}
                        className={cn(
                          'flex w-full items-center justify-center bg-muted px-2.5 py-1 text-base text-muted-foreground outline-none transition-colors first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-muted/60 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-[var(--acc)] sm:text-sm motion-reduce:transition-none',
                          on && 'bg-card font-semibold text-foreground hover:bg-card',
                          'disabled:pointer-events-none disabled:text-muted-foreground/50',
                        )}
                      >
                        {t.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <AreaChart
                data={responseRows(region, range)}
                categories={responseCategories}
                colors={colors}
                fill={fill}
                valueFormatter={msFormatter}
                maxValue={4000}
                yAxisWidth={45}
                activeIndex={activeIndex}
                label={`Response times for ${regions.find((r) => r.value === region)?.label ?? region}, by ${range}`}
                className="mt-6"
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
