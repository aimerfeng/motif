// SPDX-License-Identifier: MIT
// Copyright (c) 2023 shadcn
// Source: https://github.com/shadcn-ui/ui/blob/08ab84f/apps/v4/registry/new-york-v4/blocks/dashboard-01/components/chart-area-interactive.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { motion, useReducedMotion } from 'motion/react'
import { useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#7c8cff',
  secondary: '#38bdf8',
  chart: 'area',
  range: '30d',
  density: 'comfortable',
  seed: 11,
  title: 'Visitors',
  subtitle: 'Sessions by device, counted daily',
  showGrid: true,
  animate: true,
}
/* @motif:end */

export type DashboardAreaChartProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const TOTAL_DAYS = 90
const ANCHOR = Date.UTC(2026, 8, 28)
const RANGES = [
  { id: '7d', label: '7 days', n: 7 },
  { id: '30d', label: '30 days', n: 30 },
  { id: '90d', label: '90 days', n: 90 },
]

function makeData(seed: number) {
  const rand = rng(seed * 7919 + 5)
  const desktop: number[] = []
  const mobile: number[] = []
  let dn = 0
  let mn = 0
  for (let i = 0; i < TOTAL_DAYS; i++) {
    const day = new Date(ANCHOR - (TOTAL_DAYS - 1 - i) * 86400000).getUTCDay()
    const weekend = day === 0 || day === 6 ? 0.72 : 1
    const growth = 1 + (i / TOTAL_DAYS) * 0.42
    dn += (rand() - 0.5) * 44
    mn += (rand() - 0.5) * 46
    dn *= 0.9
    mn *= 0.9
    desktop.push(Math.max(120, Math.round((640 + dn + Math.sin(i / 6) * 70) * weekend * growth)))
    mobile.push(Math.max(80, Math.round((330 + mn + Math.cos(i / 5) * 60) * (day === 0 || day === 6 ? 1.12 : 0.95) * (1 + (i / TOTAL_DAYS) * 0.6))))
  }
  // 三点滑动平均，去掉尖锐的毛刺，曲线更耐看。
  const soft = (arr: number[]) => arr.map((_, i) => Math.round((arr[Math.max(0, i - 1)] + arr[i] * 2 + arr[Math.min(arr.length - 1, i + 1)]) / 4))
  return { desktop: soft(soft(desktop)), mobile: soft(soft(mobile)) }
}

const fmtDate = (i: number) => new Date(ANCHOR - (TOTAL_DAYS - 1 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
const fmtNum = (v: number) => v.toLocaleString('en-US')
const fmtTick = (v: number) => (v >= 1000 ? `${Number((v / 1000).toFixed(1))}k` : String(v))

function smooth(pts: [number, number][]) {
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return d
}

function useWidth(ref: RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)))
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [ref])
  return width
}

const HEIGHT: Record<string, number> = { compact: 200, comfortable: 260, spacious: 320 }
const PAD = { l: 38, r: 10, t: 10, b: 26 }

/** 可切换范围的双序列图表卡：面积 / 柱状 / 折线，悬停出十字线和提示。手绘 SVG，没有图表库。 */
export function DashboardAreaChart({ className, style, ...props }: DashboardAreaChartProps) {
  const { accent, secondary, chart, range: initialRange, density, seed, title, subtitle, showGrid, animate: animated } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const run = animated && !reduced
  const uid = useId().replace(/:/g, '')
  const box = useRef<HTMLDivElement>(null)
  const width = useWidth(box)
  const [range, setRange] = useState(initialRange)
  const [hidden, setHidden] = useState<Record<string, boolean>>({})
  const [hover, setHover] = useState<number | null>(null)

  const all = useMemo(() => makeData(seed), [seed])
  const spec = RANGES.find((r) => r.id === range) ?? RANGES[1]
  const n = spec.n
  const slice = (arr: number[]) => arr.slice(TOTAL_DAYS - n)
  const series = [
    { id: 'desktop', label: 'Desktop', color: accent, data: slice(all.desktop) },
    { id: 'mobile', label: 'Mobile', color: secondary, data: slice(all.mobile) },
  ]
  const visible = series.filter((s) => !hidden[s.id])
  const rawMax = Math.max(1, ...visible.flatMap((s) => s.data))
  const pow = 10 ** Math.floor(Math.log10(rawMax))
  const yMax = Math.ceil((rawMax / pow) * 2) / 2 * pow
  const H = HEIGHT[density] ?? HEIGHT.comfortable
  const iw = Math.max(10, width - PAD.l - PAD.r)
  const ih = H - PAD.t - PAD.b
  const y = (v: number) => PAD.t + (1 - v / yMax) * ih
  const isBars = chart === 'bars'
  const x = (i: number) => (isBars ? PAD.l + ((i + 0.5) * iw) / n : PAD.l + (n === 1 ? 0 : (i / (n - 1)) * iw))
  const bandW = iw / n
  const tickCount = width < 420 ? 4 : 6
  const xTicks = Array.from({ length: tickCount }, (_, k) => Math.round((k * (n - 1)) / (tickCount - 1)))

  const onMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const px = event.clientX - rect.left - PAD.l
    const idx = isBars ? Math.floor(px / bandW) : Math.round((px / iw) * (n - 1))
    setHover(Math.min(n - 1, Math.max(0, idx)))
  }

  const tipLeft = hover === null ? 0 : x(hover)
  const flip = tipLeft > width - 150
  const totals = series.map((s) => s.data.reduce((a, b) => a + b, 0))

  return (
    <section className={cn('w-full rounded-xl border bg-card text-card-foreground shadow-sm', className)} style={{ ['--acc' as string]: accent, ...style }}>
      <header className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="relative inline-flex rounded-lg border bg-muted/50 p-0.5" role="group" aria-label="Time range">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={range === r.id}
              onClick={() => setRange(r.id)}
              className={cn(
                'relative rounded-md px-3 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                range === r.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {range === r.id && (
                <motion.span layoutId={`${uid}pill`} className="absolute inset-0 rounded-md border bg-card shadow-sm" transition={{ type: 'spring', visualDuration: 0.3, bounce: 0.15 }} />
              )}
              <span className="relative">{r.label}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-2 divide-x border-b">
        {series.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={!hidden[s.id]}
            onClick={() => setHidden((h) => ({ ...h, [s.id]: !h[s.id] }))}
            className="px-5 py-3 text-left outline-none transition-colors hover:bg-muted/40 focus-visible:bg-muted/40"
          >
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className={cn('size-2 rounded-full transition-opacity', hidden[s.id] && 'opacity-30')} style={{ background: s.color }} />
              {s.label}
            </span>
            <span className={cn('mt-1 block text-xl font-semibold tracking-tight tabular-nums transition-opacity', hidden[s.id] && 'opacity-40')}>{fmtNum(totals[i])}</span>
          </button>
        ))}
      </div>

      <div ref={box} className="relative px-2 pt-4 pb-3 sm:px-4">
        {width > 0 && (
          <div className="relative" style={{ height: H }}>
            <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} className="block touch-pan-y select-none" onPointerMove={onMove} onPointerLeave={() => setHover(null)} role="img" aria-label={`${title} chart, ${spec.label}`}>
              <defs>
                {series.map((s) => (
                  <linearGradient key={s.id} id={`${uid}${s.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={s.color} stopOpacity="0.3" />
                    <stop offset="1" stopColor={s.color} stopOpacity="0.02" />
                  </linearGradient>
                ))}
                <clipPath id={`${uid}clip${range}${chart}`}>
                  <motion.rect x={0} y={0} height={H} initial={run ? { width: PAD.l } : false} animate={{ width }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} />
                </clipPath>
              </defs>

              {[0, 1, 2, 3, 4].map((k) => {
                const v = (yMax * k) / 4
                return (
                  <g key={k}>
                    {showGrid && <line x1={PAD.l} x2={width - PAD.r} y1={y(v)} y2={y(v)} stroke="currentColor" strokeOpacity={k === 0 ? 0.18 : 0.08} strokeDasharray={k === 0 ? undefined : '3 5'} />}
                    <text x={PAD.l - 8} y={y(v) + 3.5} textAnchor="end" className="fill-muted-foreground text-[10px] tabular-nums">
                      {fmtTick(v)}
                    </text>
                  </g>
                )
              })}
              {xTicks.map((idx, k) => (
                <text key={idx} x={x(idx)} y={H - 6} textAnchor={k === 0 ? 'start' : k === xTicks.length - 1 ? 'end' : 'middle'} className="fill-muted-foreground text-[10px]">
                  {fmtDate(TOTAL_DAYS - n + idx)}
                </text>
              ))}

              {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={PAD.t + ih} stroke="currentColor" strokeOpacity="0.25" strokeDasharray="3 3" />}

              <g key={`${range}${chart}`}>
                {isBars
                  ? visible.map((s, si) => {
                      const bw = Math.max(1.5, (bandW * 0.7) / visible.length - 1)
                      return s.data.map((v, i) => (
                        <motion.rect
                          key={`${s.id}${i}`}
                          x={PAD.l + i * bandW + bandW * 0.15 + si * (bw + 1)}
                          width={bw}
                          y={y(v)}
                          height={PAD.t + ih - y(v)}
                          rx={Math.min(3, bw / 2)}
                          fill={s.color}
                          fillOpacity={hover === null || hover === i ? 0.95 : 0.4}
                          style={{ transformOrigin: `0px ${PAD.t + ih}px`, transformBox: 'view-box' }}
                          initial={run ? { scaleY: 0 } : false}
                          animate={{ scaleY: 1 }}
                          transition={{ duration: 0.6, delay: Math.min(0.5, i * 0.012), ease: [0.22, 1, 0.36, 1] }}
                        />
                      ))
                    })
                  : (
                    <g clipPath={`url(#${uid}clip${range}${chart})`}>
                      {[...visible].reverse().map((s) => {
                        const pts = s.data.map((v, i): [number, number] => [x(i), y(v)])
                        const line = smooth(pts)
                        return (
                          <g key={s.id}>
                            {chart === 'area' && <path d={`${line} L${pts[pts.length - 1][0]} ${PAD.t + ih} L${pts[0][0]} ${PAD.t + ih} Z`} fill={`url(#${uid}${s.id})`} />}
                            <path d={line} fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </g>
                        )
                      })}
                    </g>
                  )}
              </g>

              {hover !== null && !isBars && visible.map((s) => <circle key={s.id} cx={x(hover)} cy={y(s.data[hover])} r="4" fill="var(--card)" stroke={s.color} strokeWidth="2" />)}
            </svg>

            {hover !== null && (
              <div
                className="pointer-events-none absolute top-2 z-10 min-w-32 rounded-lg border bg-popover/95 px-3 py-2 text-xs text-popover-foreground shadow-lg backdrop-blur"
                style={{ left: tipLeft, transform: `translateX(${flip ? 'calc(-100% - 12px)' : '12px'})` }}
              >
                <p className="mb-1.5 font-medium">{fmtDate(TOTAL_DAYS - n + hover)}</p>
                {visible.map((s) => (
                  <p key={s.id} className="flex items-center justify-between gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full" style={{ background: s.color }} />
                      {s.label}
                    </span>
                    <span className="font-medium text-foreground tabular-nums">{fmtNum(s.data[hover])}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
