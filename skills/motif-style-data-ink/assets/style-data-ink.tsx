// SPDX-License-Identifier: MIT
// Copyright (c) 2014 Dave Liepmann
// Source: https://github.com/edwardtufte/tufte-css/blob/b5d7b7b/index.html
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  inkColor: '#111111',
  highlight: '#b8322a',
  paperTone: 'ivory',
  strokeWidth: 1.25,
  serifFont: 'newsreader',
  gridlines: false,
  density: 1,
  dataSeed: 7,
}
/* @motif:end */

export type DataInkProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 纸色：ivory 是上游的 #fffff8，night 是上游 prefers-color-scheme: dark 的 #151515。 */
export const papers: Record<string, string> = {
  ivory: '#fffff8',
  white: '#ffffff',
  stone: '#f3f1ea',
  night: '#151515',
}

const SERIFS: Record<string, string> = {
  newsreader: "'Newsreader Variable', Palatino, 'Palatino Linotype', 'Book Antiqua', Georgia, serif",
  fraunces: "'Fraunces Variable', Palatino, 'Palatino Linotype', 'Book Antiqua', Georgia, serif",
  playfair: "'Playfair Display Variable', Palatino, 'Palatino Linotype', 'Book Antiqua', Georgia, serif",
}
const CJK = "'Songti SC', 'Noto Serif CJK SC', 'SimSun', serif"
const SANS = "'IBM Plex Sans Variable', 'Gill Sans', 'Gill Sans MT', Calibri, sans-serif"
const MONO = "'IBM Plex Mono', Consolas, 'Liberation Mono', Menlo, monospace"

// ---- 颜色：任何墨色、强调色、纸色组合都要读得清 ----

type Rgb = [number, number, number]

function parseHex(hex: string): Rgb {
  const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})/i.exec(hex.trim())
  if (!m) return [17, 17, 17]
  const h = m[1]!.length === 3 ? m[1]!.replace(/./g, (c) => c + c) : m[1]!
  const n = parseInt(h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const toHex = (c: Rgb) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`
const mix = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]

function luminance(c: Rgb): number {
  const lin = (v: number) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2])
}

function contrast(a: Rgb, b: Rgb): number {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** 对比度不够时，把前景色逐步混向黑（浅纸）或白（深纸），直到达到 min。 */
function readable(fg: Rgb, bg: Rgb, min: number): Rgb {
  const pole: Rgb = luminance(bg) > 0.18 ? [0, 0, 0] : [255, 255, 255]
  for (let t = 0; t <= 1; t += 0.05) {
    const c = mix(fg, pole, t)
    if (contrast(c, bg) >= min) return c
  }
  return pole
}

/** 由参数算出整套颜色 token。 */
export function dataInkTokens(options: { inkColor: string; highlight: string; paperTone: string }) {
  const paper = parseHex(papers[options.paperTone] ?? papers.ivory!)
  const ink = readable(parseHex(options.inkColor), paper, 8)
  const hl = readable(parseHex(options.highlight), paper, 4.5)
  return {
    paper: toHex(paper),
    ink: toHex(ink),
    muted: toHex(readable(mix(ink, paper, 0.42), paper, 4.6)),
    rule: toHex(mix(ink, paper, 0.78)),
    hair: toHex(mix(ink, paper, 0.9)),
    band: toHex(mix(ink, paper, 0.94)),
    hl: toHex(hl),
    hlSoft: toHex(mix(hl, paper, 0.78)),
  }
}

/** 风格根节点：把参数写成 CSS 变量；页面内容放进 <article className="di-page">。 */
export function DataInk({ className, style, children, ...props }: DataInkProps) {
  const o = { ...defaults, ...props }
  const t = dataInkTokens(o)
  const vars = {
    '--di-paper': t.paper,
    '--di-ink': t.ink,
    '--di-muted': t.muted,
    '--di-rule': t.rule,
    '--di-hair': t.hair,
    '--di-band': t.band,
    '--di-hl': t.hl,
    '--di-hl-soft': t.hlSoft,
    '--di-sw': `${o.strokeWidth}px`,
    '--di-density': o.density,
    '--di-serif': `${SERIFS[o.serifFont] ?? SERIFS.newsreader}, ${CJK}`,
    '--di-sans': SANS,
    '--di-mono': MONO,
    colorScheme: o.paperTone === 'night' ? 'dark' : 'light',
    ...style,
  } as CSSProperties
  return (
    <div className={cn('di', className)} style={vars} data-grid={o.gridlines ? 'on' : 'off'}>
      {children}
    </div>
  )
}

// ---- 上游 index.html 的旁注、页边注和 new thought ----

/** 编号旁注：宽屏时浮在右侧页边，窄屏时点编号展开。 */
export function Sidenote({ children }: { children: ReactNode }) {
  const id = useId()
  return (
    <>
      <label htmlFor={id} className="margin-toggle sidenote-number" />
      <input type="checkbox" id={id} className="margin-toggle" aria-label="Show sidenote" />
      <span className="sidenote">{children}</span>
    </>
  )
}

/** 不编号的页边注（图注也用它）；窄屏时点 ⊕ 展开。 */
export function MarginNote({ children }: { children: ReactNode }) {
  const id = useId()
  return (
    <>
      <label htmlFor={id} className="margin-toggle">
        &#8853;
      </label>
      <input type="checkbox" id={id} className="margin-toggle" aria-label="Show margin note" />
      <span className="marginnote">{children}</span>
    </>
  )
}

export const NewThought = ({ children }: { children: ReactNode }) => <span className="newthought">{children}</span>

/** 图：普通图 55% 宽、图注进页边；fullwidth 占满，图注在下方右侧。 */
export function Figure({ caption, fullwidth, className, children }: { caption?: ReactNode; fullwidth?: boolean; className?: string; children: ReactNode }) {
  return (
    <figure className={cn(fullwidth && 'fullwidth', className)}>
      {caption && !fullwidth ? <MarginNote>{caption}</MarginNote> : null}
      {children}
      {caption && fullwidth ? <figcaption>{caption}</figcaption> : null}
    </figure>
  )
}

// ---- 数据部件（Motif 原创） ----

const extent = (values: number[]): [number, number] => {
  let lo = Infinity
  let hi = -Infinity
  for (const v of values) {
    if (v < lo) lo = v
    if (v > hi) hi = v
  }
  return lo === hi ? [lo - 1, hi + 1] : [lo, hi]
}

const median = (values: number[]) => {
  const s = [...values].sort((a, b) => a - b)
  const m = s.length >> 1
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2
}

const pathOf = (points: [number, number][]) => points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join('')

/** 量出元素的实际宽度：图按真实像素画，字号不会随缩放变形。 */
function useWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(fallback)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setWidth(Math.max(80, Math.round(el.clientWidth)))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return [ref, width] as const
}

export type SparklineProps = {
  data: number[]
  /** 正常范围，画成浅色带 */
  band?: [number, number]
  /** 标出最小值和最大值 */
  extremes?: boolean
  /** 宽度（em），高度是宽度的四分之一 */
  width?: number
  label?: string
  className?: string
}

/** 句子里的迷你走势线：末点用强调色，最小最大值是小灰点。 */
export function Sparkline({ data, band, extremes = true, width = 4, label, className }: SparklineProps) {
  const W = 64
  const H = 16
  const pad = 1.8
  const [lo, hi] = extent(band ? [...data, ...band] : data)
  const x = (i: number) => pad + (i * (W - pad * 2)) / Math.max(1, data.length - 1)
  const y = (v: number) => H - pad - ((v - lo) / (hi - lo)) * (H - pad * 2)
  const points = data.map((v, i) => [x(i), y(v)] as [number, number])
  const pMin = points[data.indexOf(Math.min(...data))]
  const pMax = points[data.indexOf(Math.max(...data))]
  const last = points[points.length - 1]
  return (
    <svg
      className={cn('di-spark', className)}
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: `${width}em`, height: `${(width * H) / W}em` }}
      role="img"
      aria-label={label ?? `Trend from ${data[0]} to ${data[data.length - 1]}`}
    >
      {band ? <rect className="di-band" x={0} y={y(band[1])} width={W} height={Math.max(0.5, y(band[0]) - y(band[1]))} /> : null}
      <path className="di-line" d={pathOf(points)} vectorEffect="non-scaling-stroke" />
      {extremes && pMin ? <circle className="di-dot" data-soft="true" cx={pMin[0]} cy={pMin[1]} r={1.25} /> : null}
      {extremes && pMax ? <circle className="di-dot" data-soft="true" cx={pMax[0]} cy={pMax[1]} r={1.25} /> : null}
      {last ? <circle className="di-dot" data-hl="true" cx={last[0]} cy={last[1]} r={1.6} /> : null}
    </svg>
  )
}

export type Series = { label: string; data: number[] }

function Multiple({ series, lo, hi, highlighted, format, height }: { series: Series; lo: number; hi: number; highlighted: boolean; format: (v: number) => string; height: number }) {
  const [ref, width] = useWidth<HTMLDivElement>(160)
  const pad = 3
  const n = series.data.length
  const x = (i: number) => pad + (i * (width - pad * 2)) / Math.max(1, n - 1)
  const y = (v: number) => height - pad - ((v - lo) / (hi - lo)) * (height - pad * 2)
  const points = series.data.map((v, i) => [x(i), y(v)] as [number, number])
  const last = points[n - 1]
  const first = points[0]
  return (
    <div className="di-multiple" data-hl={highlighted}>
      <div className="di-multiple-head">
        <span>{series.label}</span>
        <span className="di-num">{format(series.data[n - 1] ?? 0)}</span>
      </div>
      <div ref={ref} className="di-chart">
        <svg className="di-svg" width={width} height={height} role="img" aria-label={`${series.label}: ${format(series.data[0] ?? 0)} to ${format(series.data[n - 1] ?? 0)}`}>
          <line className="di-grid" x1={0} x2={width} y1={y(lo)} y2={y(lo)} />
          <line className="di-grid" x1={0} x2={width} y1={y(hi)} y2={y(hi)} />
          <line className="di-grid" x1={0} x2={width} y1={y((lo + hi) / 2)} y2={y((lo + hi) / 2)} />
          <path className="di-line" data-hl={highlighted} d={pathOf(points)} />
          {first ? <circle className="di-dot" data-soft="true" cx={first[0]} cy={first[1]} r={1.8} /> : null}
          {last ? <circle className="di-dot" data-hl={highlighted} cx={last[0]} cy={last[1]} r={2.4} /> : null}
        </svg>
      </div>
    </div>
  )
}

export type SmallMultiplesProps = {
  series: Series[]
  /** 用强调色标出的系列名 */
  highlight?: string[]
  format?: (value: number) => string
  /** 每格图的高度（px） */
  height?: number
  className?: string
}

/** 小多图：所有格子共用一个纵向刻度，名称和末值直接标在格子上，没有图例。 */
export function SmallMultiples({ series, highlight = [], format = (v) => v.toLocaleString('en-US'), height = 56, className }: SmallMultiplesProps) {
  const [lo, hi] = extent(series.flatMap((s) => s.data))
  return (
    <div className={cn('di-multiples', className)}>
      {series.map((s) => (
        <Multiple key={s.label} series={s} lo={lo} hi={hi} highlighted={highlight.includes(s.label)} format={format} height={height} />
      ))}
    </div>
  )
}

export type Point = { x: number; y: number; label?: string }
export type Axis = { label: string; format?: (value: number) => string }

export type RangeFrameProps = {
  points: Point[]
  x: Axis
  y: Axis
  /** 需要直接标注的点（按 label 匹配） */
  labelled?: string[]
  height?: number
  className?: string
}

/** 散点图，坐标轴是「范围框」：轴线只覆盖数据范围，只在最小、中位、最大处标刻度。 */
export function RangeFrame({ points, x: xAxis, y: yAxis, labelled = [], height = 280, className }: RangeFrameProps) {
  const [ref, width] = useWidth<HTMLDivElement>(560)
  const fx = xAxis.format ?? String
  const fy = yAxis.format ?? String
  const m = { top: 14, right: 16, bottom: 44, left: 46 }
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const [x0, x1] = extent(xs)
  const [y0, y1] = extent(ys)
  // 两端各留 6%，让最边上的点不压在轴线上
  const px = (x1 - x0) * 0.06
  const py = (y1 - y0) * 0.06
  const sx = (v: number) => m.left + ((v - (x0 - px)) / (x1 - x0 + px * 2)) * (width - m.left - m.right)
  const sy = (v: number) => height - m.bottom - ((v - (y0 - py)) / (y1 - y0 + py * 2)) * (height - m.top - m.bottom)
  const xTicks = [x0, median(xs), x1]
  const yTicks = [y0, median(ys), y1]
  const axisX = height - m.bottom + 8
  const axisY = m.left - 8
  return (
    <div ref={ref} className={cn('di-chart', className)}>
      <svg className="di-svg" width={width} height={height} role="img" aria-label={`${yAxis.label} against ${xAxis.label}, ${points.length} points`}>
        {xTicks.map((v, i) => (
          <line key={`gx${i}`} className="di-grid" x1={sx(v)} x2={sx(v)} y1={m.top} y2={height - m.bottom} />
        ))}
        {yTicks.map((v, i) => (
          <line key={`gy${i}`} className="di-grid" x1={m.left} x2={width - m.right} y1={sy(v)} y2={sy(v)} />
        ))}
        <line className="di-axis" x1={sx(x0)} x2={sx(x1)} y1={axisX} y2={axisX} />
        <line className="di-axis" x1={axisY} x2={axisY} y1={sy(y0)} y2={sy(y1)} />
        {xTicks.map((v, i) => (
          <g key={`tx${i}`}>
            <line className="di-axis" x1={sx(v)} x2={sx(v)} y1={axisX} y2={axisX + 4} />
            <text className="di-t-num" x={sx(v)} y={axisX + 16} textAnchor="middle">
              {fx(v)}
            </text>
          </g>
        ))}
        {yTicks.map((v, i) => (
          <g key={`ty${i}`}>
            <line className="di-axis" x1={axisY - 4} x2={axisY} y1={sy(v)} y2={sy(v)} />
            <text className="di-t-num" x={axisY - 7} y={sy(v)} dy="0.32em" textAnchor="end">
              {fy(v)}
            </text>
          </g>
        ))}
        <text className="di-t-cap" x={sx(x1)} y={height - 4} textAnchor="end">
          {xAxis.label}
        </text>
        <text className="di-t-cap" x={m.left} y={m.top - 2} dy="-0.2em">
          {yAxis.label}
        </text>
        {points.map((p, i) => {
          const hl = p.label ? labelled.includes(p.label) : false
          return <circle key={i} className="di-dot" data-hl={hl} cx={sx(p.x)} cy={sy(p.y)} r={hl ? 3.4 : 2.6} />
        })}
        {points.map((p, i) => {
          if (!p.label || !labelled.includes(p.label)) return null
          const right = sx(p.x) < width * 0.62
          return (
            <text key={`l${i}`} className="di-t-label di-t-hl" x={sx(p.x) + (right ? 8 : -8)} y={sy(p.y)} dy="0.32em" textAnchor={right ? 'start' : 'end'}>
              {p.label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

export type SlopeRow = { label: string; from: number; to: number }

export type SlopegraphProps = {
  rows: SlopeRow[]
  fromLabel: string
  toLabel: string
  highlight?: string[]
  format?: (value: number) => string
  height?: number
  className?: string
}

/** 把一组标签按 y 排开，彼此至少隔 gap 像素，避免直接标注重叠。 */
function spread(ys: number[], gap: number, top: number, bottom: number): number[] {
  const order = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y)
  for (let k = 1; k < order.length; k++) order[k]!.y = Math.max(order[k]!.y, order[k - 1]!.y + gap)
  const overflow = (order[order.length - 1]?.y ?? 0) - bottom
  if (overflow > 0) for (const o of order) o.y = Math.max(top, o.y - overflow)
  const out: number[] = []
  for (const o of order) out[o.i] = o.y
  return out
}

/** 斜率图：两列数值，标签和数值标在两端，强调色只给需要读者注意的那几条。 */
export function Slopegraph({ rows, fromLabel, toLabel, highlight = [], format = String, height = 300, className }: SlopegraphProps) {
  const [ref, width] = useWidth<HTMLDivElement>(560)
  const side = Math.min(150, Math.max(96, width * 0.32))
  const top = 34
  const bottom = height - 10
  const [lo, hi] = extent(rows.flatMap((r) => [r.from, r.to]))
  const sy = (v: number) => bottom - ((v - lo) / (hi - lo)) * (bottom - top)
  const left = spread(rows.map((r) => sy(r.from)), 15, top, bottom)
  const right = spread(rows.map((r) => sy(r.to)), 15, top, bottom)
  const xa = side
  const xb = width - side
  return (
    <div ref={ref} className={cn('di-chart', className)}>
      <svg className="di-svg" width={width} height={height} role="img" aria-label={`Slopegraph from ${fromLabel} to ${toLabel}`}>
        <text className="di-t-cap" x={xa} y={14} textAnchor="middle">
          {fromLabel}
        </text>
        <text className="di-t-cap" x={xb} y={14} textAnchor="middle">
          {toLabel}
        </text>
        {rows.map((r, i) => {
          const hl = highlight.includes(r.label)
          return (
            <g key={r.label}>
              <path className="di-line" data-hl={hl} data-soft={!hl && highlight.length > 0} d={`M${xa},${sy(r.from)}L${xb},${sy(r.to)}`} />
              <circle className="di-dot" data-hl={hl} cx={xa} cy={sy(r.from)} r={2.2} />
              <circle className="di-dot" data-hl={hl} cx={xb} cy={sy(r.to)} r={2.2} />
              <text className={cn('di-t-label', hl && 'di-t-hl')} x={xa - 10} y={left[i]} dy="0.32em" textAnchor="end">
                {r.label}{' '}
                <tspan className="di-t-num">{format(r.from)}</tspan>
              </text>
              <text className={cn('di-t-label', hl && 'di-t-hl')} x={xb + 10} y={right[i]} dy="0.32em">
                <tspan className="di-t-num">{format(r.to)}</tspan> {r.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/** 表格里的条形：宽度按 value / max，数字写在条形后面。 */
export function Bar({ value, max, highlighted }: { value: number; max: number; highlighted?: boolean }) {
  return <span className="di-bar" data-hl={highlighted} style={{ '--w': Math.max(0, Math.min(1, value / max)) } as CSSProperties} aria-hidden />
}

// ---- 极简控件 ----

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'quiet' }
export function Button({ variant = 'default', type = 'button', className, ...rest }: ButtonProps) {
  return <button type={type} className={cn('di-btn', className)} data-variant={variant} {...rest} />
}

export type SegmentedProps = {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  label: string
  className?: string
}

/** 单选：几个词，当前项加一条下划线。方向键切换。 */
export function Segmented({ options, value, onChange, label, className }: SegmentedProps) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0
    if (!step) return
    event.preventDefault()
    const index = options.findIndex((o) => o.value === value)
    const next = (index + step + options.length) % options.length
    onChange(options[next]!.value)
    ;(event.currentTarget.children[next] as HTMLElement | undefined)?.focus()
  }
  return (
    <div role="radiogroup" aria-label={label} className={cn('di-seg', className)} onKeyDown={onKeyDown}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={o.value === value} tabIndex={o.value === value ? 0 : -1} className="di-seg-item" onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
