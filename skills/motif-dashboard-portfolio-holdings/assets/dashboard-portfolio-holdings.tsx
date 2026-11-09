// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Tremor Labs, Inc.
// Source: https://github.com/tremorlabs/tremor-blocks/blob/b319e8d/src/content/components/chart-compositions/chart-composition-01.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { motion, useReducedMotion } from 'motion/react'
import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  currency: 'USD',
  seriesColors: ['#3b82f6', '#8b5cf6', '#d946ef'],
  curve: 'linear',
  range: 'all',
  linkHover: true,
  showTable: true,
}
/* @motif:end */

export type DashboardPortfolioHoldingsProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 受控的十字线位置（数据下标），演示自动播放用；null 表示不显示。 */
  hoverIndex?: number | null
  /** 受控的高亮基金（0–2），演示自动播放用。 */
  highlight?: number | null
}

const CATEGORIES = ['ETF Shares Vital', 'Vitainvest Core', 'Lumora Tech Growth']

// date, ETF Shares Vital, Vitainvest Core, Lumora Tech Growth (upstream data, unchanged values)
const RAW: [string, number, number, number][] = [
  ['Aug 01', 2100.2, 4434.1, 7943.2],
  ['Aug 02', 2943.0, 4954.1, 8954.1],
  ['Aug 03', 4889.5, 6100.2, 9123.7],
  ['Aug 04', 3909.8, 4909.7, 7478.4],
  ['Aug 05', 5778.7, 7103.1, 9504.3],
  ['Aug 06', 5900.9, 7534.3, 9943.4],
  ['Aug 07', 4129.4, 7412.1, 10112.2],
  ['Aug 08', 6021.2, 7834.4, 10290.2],
  ['Aug 09', 6279.8, 8159.1, 10349.6],
  ['Aug 10', 6224.5, 8260.6, 10415.4],
  ['Aug 11', 6380.6, 8965.3, 10636.3],
  ['Aug 12', 6414.4, 7989.3, 10900.5],
  ['Aug 13', 6540.1, 7839.6, 11040.4],
  ['Aug 14', 6634.4, 7343.8, 11390.5],
  ['Aug 15', 7124.6, 6903.7, 11423.1],
  ['Aug 16', 7934.5, 6273.6, 12134.4],
  ['Aug 17', 10287.8, 5900.3, 12034.4],
  ['Aug 18', 10323.2, 5732.1, 11011.7],
  ['Aug 19', 10511.4, 5523.1, 11834.8],
  ['Aug 20', 11043.9, 5422.3, 12387.1],
  ['Aug 21', 6700.7, 5334.2, 11032.2],
  ['Aug 22', 6900.8, 4943.4, 10134.2],
  ['Aug 23', 7934.5, 4812.1, 9921.2],
  ['Aug 24', 9021.0, 2729.1, 10549.8],
  ['Aug 25', 9198.2, 2178.0, 10968.4],
  ['Aug 26', 9557.1, 2158.3, 11059.1],
  ['Aug 27', 9959.8, 2100.8, 11903.6],
  ['Aug 28', 10034.6, 2934.4, 12143.3],
  ['Aug 29', 10243.8, 3223.4, 12930.1],
  ['Aug 30', 10078.5, 3779.1, 13420.5],
  ['Aug 31', 11134.6, 4190.3, 14443.2],
  ['Sep 01', 12347.2, 4839.1, 14532.1],
  ['Sep 02', 12593.8, 5153.3, 14283.5],
  ['Sep 03', 12043.4, 5234.8, 14078.9],
  ['Sep 04', 12144.9, 5478.4, 13859.7],
  ['Sep 05', 12489.5, 5741.1, 13539.2],
  ['Sep 06', 12748.7, 6743.9, 13643.2],
  ['Sep 07', 12933.2, 7832.8, 14629.2],
  ['Sep 08', 13028.8, 8943.2, 13611.2],
  ['Sep 09', 13412.4, 9932.2, 12515.2],
  ['Sep 10', 13649.0, 10139.2, 11143.8],
  ['Sep 11', 13748.5, 10441.2, 8929.2],
  ['Sep 12', 13148.1, 10933.8, 8943.2],
  ['Sep 13', 12839.6, 11073.4, 7938.3],
  ['Sep 14', 12428.2, 11128.3, 7533.4],
  ['Sep 15', 12012.8, 11412.3, 7100.4],
  ['Sep 16', 11801.3, 10501.1, 6532.1],
  ['Sep 17', 10102.9, 8923.3, 4332.8],
  ['Sep 18', 12132.5, 10212.1, 7847.4],
  ['Sep 19', 12901.1, 10101.7, 7223.3],
  ['Sep 20', 13132.6, 12132.3, 6900.2],
  ['Sep 21', 14132.2, 13212.5, 5932.2],
  ['Sep 22', 14245.8, 12163.4, 5577.1],
  ['Sep 23', 14328.3, 10036.1, 5439.2],
  ['Sep 24', 14949.9, 8985.1, 4463.1],
  ['Sep 25', 15967.5, 9700.1, 4123.2],
  ['Sep 26', 17349.3, 10943.4, 3935.1],
]

const summary = [
  { name: CATEGORIES[0], value: 21349.36, invested: 19698.65, cashflow: 14033.74, gain: 11012.39, realized: 177.48, dividends: 490.97, changeType: 'positive' },
  { name: CATEGORIES[1], value: 25943.43, invested: 23698.65, cashflow: 11033.74, gain: 3012.39, realized: 565.41, dividends: 290.97, changeType: 'positive' },
  { name: CATEGORIES[2], value: 9443.46, invested: 14698.65, cashflow: 2033.74, gain: -5012.39, realized: -634.42, dividends: -990.97, changeType: 'negative' },
]

const SYMBOLS: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', JPY: '¥' }
const FALLBACK_COLORS = ['#3b82f6', '#8b5cf6', '#d946ef']

function formatter(currency: string, digits = 2) {
  const symbol = SYMBOLS[currency] ?? '$'
  const nf = new Intl.NumberFormat('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
  const plain = (n: number) => `${symbol}${nf.format(n)}`
  const signed = (n: number) => `${n < 0 ? '-' : '+'}${symbol}${nf.format(Math.abs(n))}`
  return { plain, signed }
}

/** 单调三次插值（与 recharts 的 monotone 曲线一致的 Fritsch–Carlson 做法）。 */
function monotonePath(pts: [number, number][]) {
  const n = pts.length
  if (n < 2) return ''
  const dx: number[] = []
  const m: number[] = []
  for (let i = 0; i < n - 1; i++) {
    dx.push(pts[i + 1][0] - pts[i][0])
    m.push((pts[i + 1][1] - pts[i][1]) / (dx[i] || 1))
  }
  const t: number[] = [m[0]]
  for (let i = 1; i < n - 1; i++) t.push(m[i - 1] * m[i] <= 0 ? 0 : (3 * (dx[i - 1] + dx[i])) / ((2 * dx[i] + dx[i - 1]) / m[i - 1] + (dx[i] + 2 * dx[i - 1]) / m[i]))
  t.push(m[n - 2])
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3
    d += `C${pts[i][0] + h},${pts[i][1] + h * t[i]} ${pts[i + 1][0] - h},${pts[i + 1][1] - h * t[i + 1]} ${pts[i + 1][0]},${pts[i + 1][1]}`
  }
  return d
}

function linearPath(pts: [number, number][]) {
  return pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join('')
}

function niceMax(v: number) {
  const step = 10 ** Math.floor(Math.log10(v / 4))
  const nice = [1, 2, 2.5, 5, 10].map((s) => s * step).find((s) => s * 4 >= v) ?? step * 10
  return nice * 4
}

function useSize() {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, size] as const
}

const positive = 'text-emerald-700 dark:text-emerald-500'
const negative = 'text-red-700 dark:text-red-500'

export function DashboardPortfolioHoldings({ className, style, hoverIndex, highlight, ...props }: DashboardPortfolioHoldingsProps) {
  const { currency, seriesColors, curve, range, linkHover, showTable } = { ...defaults, ...props }
  const colors = CATEGORIES.map((_, i) => seriesColors[i % Math.max(1, seriesColors.length)] ?? FALLBACK_COLORS[i])
  const data = range === '30d' ? RAW.slice(-30) : RAW
  const fmt = formatter(currency)
  const axisFmt = formatter(currency, 0)
  const reduced = useReducedMotion()
  const tooltipId = useId()

  const [chartRef, { w, h }] = useSize()
  const [pointer, setPointer] = useState<number | null>(null)
  const [hovered, setHovered] = useState<number | null>(null)
  const active = pointer ?? (hoverIndex != null ? Math.max(0, Math.min(data.length - 1, Math.round(hoverIndex))) : null)
  const focus = hovered ?? (highlight ?? null)

  const wide = w >= 560
  const left = wide ? 60 : 4
  const right = 8
  const top = 8
  const bottom = 28
  const iw = Math.max(1, w - left - right)
  const ih = Math.max(1, h - top - bottom)
  const yMax = niceMax(Math.max(...data.flatMap((d) => [d[1], d[2], d[3]])))
  const x = (i: number) => left + (data.length > 1 ? (i / (data.length - 1)) * iw : iw / 2)
  const y = (v: number) => top + ih - (v / yMax) * ih
  const ticks = [0, 1, 2, 3, 4].map((k) => (yMax / 4) * k)
  const labelCount = wide ? 6 : 2
  const xLabels = Array.from({ length: labelCount }, (_, k) => Math.round((k / (labelCount - 1)) * (data.length - 1)))
  const paths = CATEGORIES.map((_, c) => {
    const pts = data.map((d, i) => [x(i), y(d[(c + 1) as 1])] as [number, number])
    return curve === 'monotone' ? monotonePath(pts) : linearPath(pts)
  })

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - rect.left
    const i = Math.round(((px - left) / iw) * (data.length - 1))
    setPointer(Math.max(0, Math.min(data.length - 1, i)))
  }
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const dir = e.key === 'ArrowRight' ? 1 : -1
      setPointer((p) => Math.max(0, Math.min(data.length - 1, (p ?? (dir > 0 ? -1 : data.length)) + dir)))
    } else if (e.key === 'Escape') setPointer(null)
  }

  const tipLeft = active != null ? x(active) : 0
  const tipFlip = tipLeft > w / 2
  const lineOpacity = (c: number) => (focus == null || focus === c ? 1 : 0.25)

  return (
    <div className={cn('text-foreground', className)} style={style}>
      <h3 className="text-sm text-muted-foreground">Portfolio performance</h3>
      <p className="mt-1 text-3xl font-semibold text-foreground tabular-nums">{fmt.plain(32227.4)}</p>
      <p className="mt-1 text-sm font-medium">
        <span className={positive}>{fmt.signed(430.9)} (4.1%)</span>{' '}
        <span className="font-normal text-muted-foreground">Past 24 hours</span>
      </p>

      <ul className="mt-6 flex flex-wrap items-center justify-end gap-x-4 gap-y-1" aria-label="Legend">
        {CATEGORIES.map((name, c) => (
          <li
            key={name}
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-opacity duration-200"
            style={{ opacity: focus == null || focus === c ? 1 : 0.5 }}
            onPointerEnter={() => setHovered(c)}
            onPointerLeave={() => setHovered(null)}
          >
            <span className="size-2 shrink-0 rounded-full" style={{ background: colors[c] }} aria-hidden />
            {name}
          </li>
        ))}
      </ul>

      <div
        ref={chartRef}
        className="relative mt-2 h-72 w-full touch-pan-y rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-96"
        tabIndex={0}
        role="group"
        aria-label="Portfolio value by fund. Use the arrow keys to inspect days."
        aria-describedby={active != null ? tooltipId : undefined}
        onPointerMove={onMove}
        onPointerLeave={() => setPointer(null)}
        onKeyDown={onKey}
        onBlur={() => setPointer(null)}
      >
        {w > 0 && (
          <svg width={w} height={h} className="block overflow-visible" aria-hidden>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={left} x2={w - right} y1={y(t)} y2={y(t)} className="stroke-border" strokeWidth={1} />
                {wide && (
                  <text x={left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted-foreground text-xs tabular-nums">
                    {axisFmt.plain(t)}
                  </text>
                )}
              </g>
            ))}
            {xLabels.map((i, k) => (
              <text
                key={i}
                x={x(i)}
                y={h - 8}
                textAnchor={k === 0 ? 'start' : k === xLabels.length - 1 ? 'end' : 'middle'}
                className="fill-muted-foreground text-xs"
              >
                {data[i][0]}
              </text>
            ))}
            {active != null && <line x1={x(active)} x2={x(active)} y1={top} y2={top + ih} className="stroke-muted-foreground/50" strokeWidth={1} />}
            {paths.map((d, c) => (
              <motion.path
                key={`${c}:${range}:${curve}`}
                d={d}
                fill="none"
                stroke={colors[c]}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                style={{ opacity: lineOpacity(c), transition: 'opacity 200ms ease' }}
                initial={reduced ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, delay: c * 0.12, ease: [0.22, 1, 0.36, 1] }}
              />
            ))}
            {active != null &&
              CATEGORIES.map((name, c) => (
                <circle key={name} cx={x(active)} cy={y(data[active][(c + 1) as 1])} r={5} fill={colors[c]} className="stroke-background" strokeWidth={2} style={{ opacity: lineOpacity(c) }} />
              ))}
          </svg>
        )}
        {active != null && w > 0 && (
          <div
            id={tooltipId}
            role="status"
            className="pointer-events-none absolute top-2 z-10 w-60 max-w-full rounded-md border bg-popover text-sm text-popover-foreground shadow-md"
            style={{ left: tipFlip ? undefined : Math.min(tipLeft + 12, w - 240), right: tipFlip ? Math.min(w - tipLeft + 12, w - 240) : undefined }}
          >
            <div className="border-b px-3 py-2 font-medium">{data[active][0]}</div>
            <div className="space-y-1 px-3 py-2">
              {CATEGORIES.map((name, c) => (
                <div key={name} className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="size-2 shrink-0 rounded-full" style={{ background: colors[c] }} aria-hidden />
                    <span className="truncate text-muted-foreground">{name}</span>
                  </div>
                  <span className="font-medium tabular-nums">{fmt.plain(data[active][(c + 1) as 1])}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showTable && (
        <div className="mt-8 w-full overflow-x-auto">
          <table className="w-full caption-bottom border-b text-sm">
            <caption className="sr-only">Holdings by fund</caption>
            <thead>
              <tr className="border-b">
                <th scope="col" className="px-4 py-3.5 text-left font-semibold whitespace-nowrap text-foreground">Name</th>
                {['Value', 'Invested', 'Cashflow', 'Gain', 'Realized', 'Dividends'].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3.5 text-right font-semibold whitespace-nowrap text-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {summary.map((item, c) => {
                const tone = item.changeType === 'positive' ? positive : negative
                const lit = linkHover && focus === c
                return (
                  <tr
                    key={item.name}
                    tabIndex={linkHover ? 0 : undefined}
                    className={cn('outline-none transition-colors duration-150 focus-visible:bg-muted/60', lit && 'bg-muted/50')}
                    onPointerEnter={linkHover ? () => setHovered(c) : undefined}
                    onPointerLeave={linkHover ? () => setHovered(null) : undefined}
                    onFocus={linkHover ? () => setHovered(c) : undefined}
                    onBlur={linkHover ? () => setHovered(null) : undefined}
                  >
                    <td className="p-4 font-medium whitespace-nowrap text-foreground">
                      <div className="flex space-x-3">
                        <span className="w-1 shrink-0 rounded" style={{ background: colors[c] }} aria-hidden />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap text-muted-foreground tabular-nums">{fmt.plain(item.value)}</td>
                    <td className="p-4 text-right whitespace-nowrap text-muted-foreground tabular-nums">{fmt.plain(item.invested)}</td>
                    <td className="p-4 text-right whitespace-nowrap text-muted-foreground tabular-nums">{fmt.plain(item.cashflow)}</td>
                    <td className="p-4 text-right whitespace-nowrap tabular-nums">
                      <span className={tone}>{fmt.signed(item.gain)}</span>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap tabular-nums">
                      <span className={tone}>{fmt.signed(item.realized)}</span>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap tabular-nums">
                      <span className={tone}>{fmt.signed(item.dividends)}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
