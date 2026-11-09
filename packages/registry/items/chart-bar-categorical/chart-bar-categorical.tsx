// SPDX-License-Identifier: MIT
// Copyright (c) 2023 shadcn
// Source: https://github.com/shadcn-ui/ui/blob/08ab84f/apps/v4/registry/new-york-v4/charts/chart-bar-multiple.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { motion, useReducedMotion } from 'motion/react'
import { useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  layout: 'grouped',
  palette: ['#2563eb', '#10b981'],
  radius: 4,
  barGap: 4,
  showLabels: false,
  showGrid: true,
  animate: true,
  tooltipIndicator: 'dashed',
}
/* @motif:end */

export type ChartBarCategoricalProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** Controlled hover index (used by the demo autoplay); pointer / keyboard hover overrides it. */
  activeIndex?: number | null
}

const chartData = [
  { month: 'January', desktop: 186, mobile: 80, visitors: 186 },
  { month: 'February', desktop: 305, mobile: 200, visitors: 205 },
  { month: 'March', desktop: 237, mobile: 120, visitors: -207 },
  { month: 'April', desktop: 73, mobile: 190, visitors: 173 },
  { month: 'May', desktop: 209, mobile: 130, visitors: -209 },
  { month: 'June', desktop: 214, mobile: 140, visitors: 214 },
]

const TITLES: Record<string, string> = {
  grouped: 'Bar Chart - Multiple',
  stacked: 'Bar Chart - Stacked + Legend',
  horizontal: 'Bar Chart - Horizontal',
  negative: 'Bar Chart - Negative',
}

const H = 220
const EASE = [0.22, 1, 0.36, 1] as const

/** Rounded rect path with per-corner radii [tl, tr, br, bl], clamped to the rect size. */
function rectPath(x: number, y: number, w: number, h: number, r: [number, number, number, number]) {
  if (h < 0) {
    y += h
    h = -h
  }
  const m = Math.min(w / 2, h / 2)
  const [tl, tr, br, bl] = r.map((v) => Math.max(0, Math.min(v, m)))
  return `M${x + tl} ${y}H${x + w - tr}Q${x + w} ${y} ${x + w} ${y + tr}V${y + h - br}Q${x + w} ${y + h} ${x + w - br} ${y + h}H${x + bl}Q${x} ${y + h} ${x} ${y + h - bl}V${y + tl}Q${x} ${y} ${x + tl} ${y}Z`
}

function luminance(hex: string) {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.replace(/./g, (c) => c + c)
  const n = Number.parseInt(h.slice(0, 6), 16)
  if (Number.isNaN(n)) return 0
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}

function niceStep(raw: number) {
  const p = 10 ** Math.floor(Math.log10(raw))
  const f = raw / p
  const s = [1, 1.5, 2, 2.5, 4, 5, 8, 10].find((v) => v >= f) ?? 10
  return s * p
}

function TrendingUp() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 7 13.5 15.5 8.5 10.5 2 17" />
      <path d="M16 7h6v6" />
    </svg>
  )
}

export function ChartBarCategorical({ className, style, activeIndex = null, ...props }: ChartBarCategoricalProps) {
  const { layout, palette, radius, barGap, showLabels, showGrid, animate, tooltipIndicator } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const run = animate && !reduced
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

  const c1 = palette[0] ?? defaults.palette[0]
  const c2 = palette[1] ?? palette[0] ?? defaults.palette[1]
  const n = chartData.length
  const horizontal = layout === 'horizontal'
  const negative = layout === 'negative'
  const stacked = layout === 'stacked'
  const series = negative
    ? [{ key: 'visitors' as const, label: 'Visitors', color: c1 }]
    : horizontal
      ? [{ key: 'desktop' as const, label: 'Desktop', color: c1 }]
      : [
          { key: 'desktop' as const, label: 'Desktop', color: c1 },
          { key: 'mobile' as const, label: 'Mobile', color: c2 },
        ]
  const colorOf = (key: string, v: number) => (negative ? (v > 0 ? c1 : c2) : series.find((s) => s.key === key)?.color ?? c1)
  const ink = luminance(c1) > 0.4 ? '#0a0a0a' : '#fafafa'
  const hover = pointer ?? activeIndex

  // Paddings: labels need headroom; the horizontal axis labels need a left gutter.
  const labelRoom = showLabels ? 18 : 6
  const PAD = horizontal
    ? { l: showLabels ? 4 : 40, r: showLabels ? 40 : 8, t: 4, b: 4 }
    : { l: 4, r: 4, t: negative ? labelRoom + 2 : labelRoom, b: negative ? labelRoom : 26 }
  const iw = Math.max(10, width - PAD.l - PAD.r)
  const ih = H - PAD.t - PAD.b

  const values = chartData.map((d) => (negative ? d.visitors : stacked ? d.desktop + d.mobile : horizontal ? d.desktop : Math.max(d.desktop, d.mobile)))
  const rawMax = Math.max(...values.map((v) => Math.abs(v)))
  const step = niceStep(rawMax / 4)
  const vMax = Math.ceil(Math.max(...values) / step) * step
  const vMin = negative ? Math.floor(Math.min(...values) / step) * step : 0
  const span = vMax - vMin || 1

  // Vertical-layout scales.
  const band = (horizontal ? ih : iw) / n
  const thick = band * 0.8
  const y = (v: number) => PAD.t + ((vMax - v) / span) * ih
  const x = (v: number) => PAD.l + (v / span) * iw
  const zero = horizontal ? x(0) : y(0)
  const r = Math.max(0, radius)

  type Bar = { key: string; d: string; color: string; value: number }
  const bars: Bar[][] = chartData.map((d, i) => {
    const start = (horizontal ? PAD.t : PAD.l) + i * band + (band - thick) / 2
    if (horizontal) {
      const w = x(d.desktop) - zero
      return [{ key: 'desktop', d: rectPath(zero, start, w, thick, [r, r, r, r]), color: c1, value: d.desktop }]
    }
    if (negative) {
      const top = y(Math.max(0, d.visitors))
      const h = Math.abs(y(d.visitors) - zero)
      const corners: [number, number, number, number] = d.visitors > 0 ? [r, r, 0, 0] : [0, 0, r, r]
      return [{ key: 'visitors', d: rectPath(start, top, thick, h, corners), color: colorOf('visitors', d.visitors), value: d.visitors }]
    }
    if (stacked) {
      const hd = zero - y(d.desktop)
      const hm = zero - y(d.mobile)
      return [
        { key: 'desktop', d: rectPath(start, zero - hd, thick, hd, [0, 0, r, r]), color: c1, value: d.desktop },
        { key: 'mobile', d: rectPath(start, zero - hd - hm, thick, hm, [r, r, 0, 0]), color: c2, value: d.mobile },
      ]
    }
    const gap = Math.min(barGap, thick / 3)
    const bw = (thick - gap) / 2
    return series.map((s, k) => {
      const v = d[s.key]
      return { key: s.key, d: rectPath(start + k * (bw + gap), y(v), bw, zero - y(v), [r, r, r, r]), color: s.color, value: v }
    })
  })

  const ticks = Array.from({ length: Math.round(span / step) + 1 }, (_, k) => vMin + k * step)
  const center = (i: number) => (horizontal ? PAD.t : PAD.l) + i * band + band / 2

  const onKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const next = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
    if (next === undefined) return
    event.preventDefault()
    setPointer((p) => (p === null ? 0 : (p + next + n) % n))
  }

  // Tooltip anchor.
  let tipX = 0
  let tipY = 0
  if (hover !== null) {
    if (horizontal) {
      tipX = x(chartData[hover].desktop)
      tipY = center(hover)
    } else {
      tipX = center(hover)
      tipY = y(Math.max(0, values[hover]))
    }
  }
  const flip = tipX > width - 150
  const total = hover === null ? 0 : series.reduce((sum, s) => sum + chartData[hover][s.key], 0)
  const hideLabel = stacked || negative
  const hideIndicator = negative

  return (
    <div className={cn('flex w-full max-w-xl flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm', className)} style={style}>
      <div className="grid gap-1.5 px-6">
        <h3 className="leading-none font-semibold">{TITLES[layout] ?? TITLES.grouped}</h3>
        <p className="text-sm text-muted-foreground">January - June 2024</p>
      </div>
      <div className="px-6">
        <div
          ref={box}
          className="relative rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          tabIndex={0}
          role="group"
          aria-label={`${TITLES[layout] ?? TITLES.grouped}. Use arrow keys to inspect months.`}
          onKeyDown={onKey}
          onBlur={() => setPointer(null)}
        >
          {width > 0 && (
            <div className="relative" style={{ height: H }}>
              <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} className="block touch-pan-y overflow-visible select-none" onPointerLeave={() => setPointer(null)} aria-hidden="true">
                {showGrid &&
                  ticks.map((v) =>
                    horizontal ? (
                      <line key={v} x1={x(v - vMin)} x2={x(v - vMin)} y1={PAD.t} y2={H - PAD.b} stroke="currentColor" strokeOpacity="0.1" />
                    ) : (
                      <line key={v} x1={PAD.l} x2={width - PAD.r} y1={y(v)} y2={y(v)} stroke="currentColor" strokeOpacity={v === 0 && negative ? 0.22 : 0.1} />
                    ),
                  )}

                {!horizontal && !negative &&
                  chartData.map((d, i) => (
                    <text key={d.month} x={center(i)} y={H - 6} textAnchor="middle" className="fill-muted-foreground text-[12px]">
                      {d.month.slice(0, 3)}
                    </text>
                  ))}
                {horizontal && !showLabels &&
                  chartData.map((d, i) => (
                    <text key={d.month} x={PAD.l - 10} y={center(i) + 4} textAnchor="end" className="fill-muted-foreground text-[12px]">
                      {d.month.slice(0, 3)}
                    </text>
                  ))}

                <g key={`${layout}-${width > 0}`}>
                  {bars.map((group, i) => (
                    <motion.g
                      key={chartData[i].month}
                      style={{
                        transformBox: 'fill-box',
                        transformOrigin: horizontal ? 'left center' : negative && values[i] < 0 ? 'center top' : 'center bottom',
                      }}
                      initial={run ? (horizontal ? { scaleX: 0 } : { scaleY: 0 }) : false}
                      animate={{ ...(horizontal ? { scaleX: 1 } : { scaleY: 1 }), opacity: hover === null || hover === i ? 1 : 0.35 }}
                      transition={{ default: { duration: 0.8, delay: i * 0.06, ease: EASE }, opacity: { duration: reduced ? 0 : 0.2 } }}
                    >
                      {group.map((b) => (
                        <path key={b.key} d={b.d} fill={b.color} />
                      ))}
                    </motion.g>
                  ))}

                  {showLabels && (
                    <motion.g initial={run ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: run ? 0.7 : 0 }} className="text-[12px]">
                      {chartData.map((d, i) => {
                        if (horizontal)
                          return (
                            <g key={d.month}>
                              <text x={zero + 8} y={center(i) + 4} fill={ink}>
                                {d.month.slice(0, 3)}
                              </text>
                              <text x={x(d.desktop) + 8} y={center(i) + 4} className="fill-foreground tabular-nums">
                                {d.desktop}
                              </text>
                            </g>
                          )
                        if (negative)
                          return (
                            <text key={d.month} x={center(i)} y={d.visitors > 0 ? y(d.visitors) - 6 : y(d.visitors) + 15} textAnchor="middle" className="fill-foreground">
                              {d.month.slice(0, 3)}
                            </text>
                          )
                        if (stacked)
                          return (
                            <text key={d.month} x={center(i)} y={y(values[i]) - 6} textAnchor="middle" className="fill-foreground tabular-nums">
                              {values[i]}
                            </text>
                          )
                        const gap = Math.min(barGap, thick / 3)
                        const bw = (thick - gap) / 2
                        const start = PAD.l + i * band + (band - thick) / 2
                        return series.map((s, k) => (
                          <text key={`${d.month}-${s.key}`} x={start + k * (bw + gap) + bw / 2} y={y(d[s.key]) - 5} textAnchor="middle" className="fill-foreground text-[10px] tabular-nums">
                            {d[s.key]}
                          </text>
                        ))
                      })}
                    </motion.g>
                  )}
                </g>

                {chartData.map((d, i) =>
                  horizontal ? (
                    <rect key={d.month} x={0} y={PAD.t + i * band} width={width} height={band} fill="transparent" onPointerEnter={() => setPointer(i)} />
                  ) : (
                    <rect key={d.month} x={PAD.l + i * band} y={0} width={band} height={H} fill="transparent" onPointerEnter={() => setPointer(i)} />
                  ),
                )}
              </svg>

              {hover !== null && (
                <div
                  role="status"
                  className="pointer-events-none absolute z-10 grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl"
                  style={{
                    left: tipX,
                    top: horizontal ? tipY : Math.max(0, tipY - 8),
                    transform: horizontal
                      ? `translate(${flip ? 'calc(-100% - 12px)' : '12px'}, -50%)`
                      : `translate(${flip ? 'calc(-100% - 8px)' : tipX < 80 ? '8px' : '-50%'}, ${tipY > H / 2 ? '-100%' : '0'})`,
                  }}
                >
                  {!hideLabel && <div className="font-medium text-foreground">{chartData[hover].month}</div>}
                  <div className="grid gap-1.5">
                    {series.map((s) => {
                      const v = chartData[hover][s.key]
                      const color = colorOf(s.key, v)
                      return (
                        <div key={s.key} className={cn('flex w-full items-stretch gap-2', tooltipIndicator === 'dot' && 'items-center')}>
                          {!hideIndicator && (
                            <div
                              className={cn('shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)', {
                                'h-2.5 w-2.5': tooltipIndicator === 'dot',
                                'w-1': tooltipIndicator === 'line',
                                'w-0 border-[1.5px] border-dashed bg-transparent': tooltipIndicator === 'dashed',
                              })}
                              style={{ '--color-bg': color, '--color-border': color } as CSSProperties}
                            />
                          )}
                          <div className="flex flex-1 items-center justify-between gap-4 leading-none">
                            <span className="text-muted-foreground">{hideLabel && negative ? chartData[hover].month : s.label}</span>
                            <span className="font-mono font-medium text-foreground tabular-nums">{v.toLocaleString('en-US')}</span>
                          </div>
                        </div>
                      )
                    })}
                    {series.length > 1 && (
                      <div className="mt-0.5 flex basis-full items-center border-t pt-1.5 text-xs font-medium text-foreground">
                        Total
                        <div className="ml-auto font-mono font-medium text-foreground tabular-nums">{total.toLocaleString('en-US')}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {series.length > 1 && (
            <div className="flex items-center justify-center gap-4 pt-3 text-xs">
              {series.map((s) => (
                <div key={s.key} className="flex items-center gap-1.5">
                  <div className="h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: s.color }} />
                  {s.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col items-start gap-2 px-6 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp />
        </div>
        <div className="leading-none text-muted-foreground">Showing total visitors for the last 6 months</div>
      </div>
    </div>
  )
}
