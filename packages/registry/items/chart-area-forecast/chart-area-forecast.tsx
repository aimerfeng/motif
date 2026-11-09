// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Keenthemes Inc
// Source: https://github.com/keenthemes/reui/blob/6e433dd/registry-reui/bases/base/components/chart/c-chart-17.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { motion, useReducedMotion } from 'motion/react'
import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  color: '#60a5fa',
  forecastColor: '#a78bfa',
  pattern: 'stripes',
  bandWidth: 0.08,
  curve: 'natural',
  showMarkers: true,
  todayIndex: 5,
  animate: true,
}
/* @motif:end */

export type ChartAreaForecastProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** Controlled hover index (used by the demo autoplay); pointer hover overrides it. */
  activeIndex?: number | null
}

const chartData = [
  { month: 'January', value: 2600 },
  { month: 'February', value: 4200 },
  { month: 'March', value: 2400 },
  { month: 'April', value: 5000 },
  { month: 'May', value: 2800 },
  { month: 'June', value: 5800 },
  { month: 'July', value: 3200 },
  { month: 'August', value: 6200 },
  { month: 'September', value: 3800 },
]

const H = 220
const PAD = { l: 40, r: 12, t: 20, b: 26 }

type Pt = [number, number]

function pathFor(pts: Pt[], curve: string) {
  if (!pts.length) return ''
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i]
    const p2 = pts[i + 1]
    if (curve === 'linear') {
      d += ` L${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
      continue
    }
    const p0 = pts[i - 1] ?? p1
    const p3 = pts[i + 2] ?? p2
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return d
}

const fmtMoney = (v: number) => `$${Math.round(v).toLocaleString('en-US')}`
const fmtTick = (v: number) => (v >= 1000 ? `${Number((v / 1000).toFixed(1))}k` : String(v))

export function ChartAreaForecast({ className, style, activeIndex = null, ...props }: ChartAreaForecastProps) {
  const { color, forecastColor, pattern, bandWidth, curve, showMarkers, todayIndex, animate } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const run = animate && !reduced
  const uid = useId().replace(/:/g, '')
  const box = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [pointer, setPointer] = useState<number | null>(null)

  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)))
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  const n = chartData.length
  const today = Math.min(n - 2, Math.max(1, Math.round(todayIndex)))
  const band = chartData.map((d, i) => {
    const k = Math.max(0, i - today) * bandWidth
    return { lo: d.value * (1 - k), hi: d.value * (1 + k) }
  })
  const rawMax = Math.max(...band.map((b) => b.hi))
  const step = rawMax > 8000 ? 2500 : 2000
  const yMax = Math.ceil(rawMax / step) * step
  const iw = Math.max(10, width - PAD.l - PAD.r)
  const ih = H - PAD.t - PAD.b
  const x = (i: number) => PAD.l + (i / (n - 1)) * iw
  const y = (v: number) => PAD.t + (1 - v / yMax) * ih
  const base = PAD.t + ih

  const pts = chartData.map((d, i): Pt => [x(i), y(d.value)])
  const actualLine = pathFor(pts.slice(0, today + 1), curve)
  const forecastLine = pathFor(pts.slice(today), curve)
  const upper = pathFor(band.slice(today).map((b, j): Pt => [x(today + j), y(b.hi)]), curve)
  const lowerPts = band.slice(today).map((b, j): Pt => [x(today + j), y(b.lo)]).reverse()
  const lower = pathFor(lowerPts, curve).replace(/^M/, 'L')
  const bandPath = `${upper} ${lower} Z`
  const actualArea = `${actualLine} L${x(today).toFixed(1)} ${base} L${x(0).toFixed(1)} ${base} Z`

  const hover = pointer ?? activeIndex
  const onMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const idx = Math.round(((event.clientX - rect.left - PAD.l) / iw) * (n - 1))
    setPointer(Math.min(n - 1, Math.max(0, idx)))
  }
  const tipLeft = hover === null ? 0 : x(hover)
  const flip = tipLeft > width - 170
  const yTicks = Array.from({ length: Math.round(yMax / step) + 1 }, (_, k) => k * step)
  const showEvery = width < 420 ? 2 : 1
  const fill = pattern === 'solid' ? forecastColor : `url(#${uid}-forecast-${pattern})`

  return (
    <div className={cn('w-full max-w-xl rounded-xl border bg-card text-card-foreground shadow-sm', className)} style={style}>
      <div className="flex flex-col gap-1.5 p-6 pb-2">
        <h3 className="leading-none font-semibold">Sales Forecast</h3>
        <p className="text-sm text-muted-foreground">Projected sales performance with trends</p>
      </div>
      <div ref={box} className="relative px-4 pb-4 sm:px-6">
        {width > 0 && (
          <div className="relative" style={{ height: H }}>
            <svg
              width={width}
              height={H}
              viewBox={`0 0 ${width} ${H}`}
              className="block touch-pan-y select-none"
              onPointerMove={onMove}
              onPointerLeave={() => setPointer(null)}
              role="img"
              aria-label={`Sales forecast: actuals through ${chartData[today].month}, forecast to ${chartData[n - 1].month}`}
            >
              <defs>
                <pattern id={`${uid}-forecast-stripes`} patternUnits="userSpaceOnUse" width="6" height="6">
                  <rect width="6" height="6" fill={forecastColor} opacity="0.04" />
                  <path d="M0,6 L6,0" stroke={forecastColor} strokeWidth="0.8" opacity="0.5" />
                </pattern>
                <pattern id={`${uid}-forecast-dots`} patternUnits="userSpaceOnUse" width="6" height="6">
                  <rect width="6" height="6" fill={forecastColor} opacity="0.04" />
                  <circle cx="3" cy="3" r="0.9" fill={forecastColor} opacity="0.55" />
                </pattern>
                <linearGradient id={`${uid}-actual`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={color} stopOpacity="0.35" />
                  <stop offset="1" stopColor={color} stopOpacity="0.03" />
                </linearGradient>
                <filter id={`${uid}-dot-glow`} x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <clipPath id={`${uid}-clip`}>
                  <motion.rect x={0} y={0} height={H} initial={run ? { width: PAD.l } : false} animate={{ width }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} />
                </clipPath>
              </defs>

              {yTicks.map((v) => (
                <g key={v}>
                  <line x1={PAD.l} x2={width - PAD.r} y1={y(v)} y2={y(v)} stroke="currentColor" strokeOpacity={v === 0 ? 0.18 : 0.1} strokeDasharray={v === 0 ? undefined : '3 3'} />
                  <text x={PAD.l - 8} y={y(v) + 3.5} textAnchor="end" className="fill-muted-foreground text-[10px] tabular-nums">
                    {fmtTick(v)}
                  </text>
                </g>
              ))}
              {chartData.map((d, i) =>
                i % showEvery === 0 ? (
                  <text key={d.month} x={x(i)} y={H - 6} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} className="fill-muted-foreground text-[11px]">
                    {d.month.slice(0, 3)}
                  </text>
                ) : null,
              )}

              <g clipPath={`url(#${uid}-clip)`}>
                <rect x={x(today)} y={PAD.t} width={x(n - 1) - x(today)} height={ih} fill="currentColor" fillOpacity="0.025" />
                <path d={actualArea} fill={`url(#${uid}-actual)`} />
                <path d={bandPath} fill={fill} fillOpacity={pattern === 'solid' ? 0.16 : 1} />
                <path d={actualLine} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d={forecastLine} fill="none" stroke={forecastColor} strokeWidth="2.5" strokeDasharray="6 5" strokeLinecap="round" strokeLinejoin="round" />
                {showMarkers &&
                  pts.map(([px, py], i) => <circle key={i} cx={px} cy={py} r="3.5" fill={i <= today ? color : forecastColor} stroke="var(--card)" strokeWidth="2" />)}
              </g>

              <line x1={x(today)} x2={x(today)} y1={PAD.t - 8} y2={base} stroke="currentColor" strokeOpacity="0.35" strokeDasharray="2 3" />
              <text x={x(today) + 6} y={PAD.t - 6} className="fill-muted-foreground text-[10px] font-medium tracking-wide uppercase">
                Forecast
              </text>
              <text x={x(today) - 6} y={PAD.t - 6} textAnchor="end" className="fill-foreground text-[10px] font-medium tracking-wide uppercase">
                Today
              </text>

              {hover !== null && (
                <>
                  <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={base} stroke="currentColor" strokeOpacity="0.2" />
                  <circle
                    cx={x(hover)}
                    cy={y(chartData[hover].value)}
                    r="6"
                    fill={hover <= today ? color : forecastColor}
                    stroke="var(--background)"
                    strokeWidth="3"
                    filter={`url(#${uid}-dot-glow)`}
                  />
                </>
              )}
            </svg>

            {hover !== null && (
              <div
                className="pointer-events-none absolute top-6 z-10 min-w-40 rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg"
                style={{ left: tipLeft, transform: `translateX(${flip ? 'calc(-100% - 12px)' : '12px'})` }}
              >
                <p className="mb-1.5 border-b border-border/50 pb-1.5 font-medium">{chartData[hover].month} 2024</p>
                <p className="flex items-center justify-between gap-3 text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 shrink-0 rounded-xs" style={{ background: hover <= today ? color : forecastColor }} />
                    {hover <= today ? 'Actual' : 'Forecast'}
                  </span>
                  <span className="font-semibold text-foreground tabular-nums">{fmtMoney(chartData[hover].value)}</span>
                </p>
                {hover > today && (
                  <p className="mt-1 flex justify-between gap-3 text-muted-foreground">
                    <span>Range</span>
                    <span className="tabular-nums">
                      {fmtMoney(band[hover].lo)}–{fmtMoney(band[hover].hi)}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        )}
        <div className="flex items-center justify-center gap-4 pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-xs" style={{ background: color }} />
            Actual
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 rounded-full" style={{ background: forecastColor }} />
            Forecast
          </span>
        </div>
      </div>
    </div>
  )
}
