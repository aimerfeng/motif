// SPDX-License-Identifier: MIT
// Copyright (c) 2014 Dave Liepmann
// Source: https://github.com/edwardtufte/tufte-css/blob/b5d7b7b/index.html
// Modified by Motif; see the item's provenance.
import { useEffect, useId, useMemo, useRef, useState, type RefObject } from 'react'
import { useFrameLoop } from '@motif/runtime'

/* ---------- 示例数据：同一个种子总是同一组数 ---------- */

export function random(seed: number) {
  let a = (seed >>> 0) + 0x9e3779b9
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// 周一到周日的流量起伏：工作日高、周末低。
const WEEK = [1.04, 1.08, 1.06, 1.02, 0.94, 0.7, 0.66]

/** 每日访客：基数 × 趋势 × 星期起伏 × 随机游走，可选一个衰减的尖峰（发文、上榜）。 */
function daily(rand: () => number, days: number, base: number, trend: number, spike: number | null) {
  const out: number[] = []
  let walk = 0
  const offset = Math.floor(rand() * 7)
  for (let i = 0; i < days; i++) {
    walk = walk * 0.8 + (rand() - 0.5) * 0.16
    const burst = spike === null || i < spike ? 0 : 2.4 * Math.exp(-(i - spike) / 1.6)
    out.push(Math.max(1, Math.round(base * (1 + (trend * i) / days) * WEEK[(i + offset) % 7]! * (1 + walk + burst))))
  }
  return out
}

const PAGES = ['/', '/pricing', '/docs/install', '/blog/quiet-metrics', '/changelog', '/signup', '/docs/api', '/about', '/blog/no-cookies', '/status', '/careers', '/contact']

export interface SiteData {
  pages: { path: string; values: number[]; total: number }[]
  claims: { script: number[]; load: number[]; sites: number[] }
  slope: { label: string; before: number; after: number }[]
  live: number[]
}

export function sampleData(seed: number): SiteData {
  const rand = random(seed)
  const spikeAt = 8 + Math.floor(rand() * 16)
  const spikePage = 3 + Math.floor(rand() * 2)
  const pages = PAGES.map((path, i) => {
    const base = 3600 * Math.pow(0.72, i) * (0.85 + rand() * 0.3)
    const values = daily(rand, 30, base, -0.25 + rand() * 0.7, i === spikePage ? spikeAt : null)
    return { path, values, total: values.reduce((sum, v) => sum + v, 0) }
  })

  // 脚本体积：每次发版往下掉一点，最后落在 1.4 kB。
  const script: number[] = []
  let size = 2.9
  for (let i = 0; i < 14; i++) {
    script.push(Math.round(size * 100) / 100)
    size = Math.max(1.4, size - 0.05 - rand() * 0.2)
  }
  script[script.length - 1] = 1.4
  const load = Array.from({ length: 40 }, () => Math.round(180 + (rand() - 0.5) * 70 + (rand() < 0.08 ? 60 : 0)))
  load[load.length - 1] = 180
  // 站点数：每月复利增长，再整体缩放让最后一个月正好是 4,812。
  let sites = 1000
  const growth = Array.from({ length: 24 }, () => (sites *= 1.03 + rand() * 0.035))
  const siteGrowth = growth.map((v) => Math.round((v * 4812) / sites))

  const slope = ['Checkout', 'Docs', 'Sign-up', 'Pricing', 'Blog post', 'Home'].map((label) => {
    const before = Math.round((1900 + rand() * 2000) / 10) * 10
    const after = Math.round((before * (0.45 + rand() * 0.37)) / 10) * 10
    return { label, before, after }
  })

  let live = 210
  const liveValues = Array.from({ length: 480 }, (_, i) => {
    live = live + (rand() - 0.5) * 18 + (212 - live) * 0.08
    return Math.round(live + Math.sin(i / 9) * 6)
  })

  return { pages, claims: { script, load, sites: siteGrowth }, slope, live: liveValues }
}

export function formatCount(n: number) {
  return n >= 10000 ? `${(n / 1000).toFixed(1)}k` : n.toLocaleString('en-US')
}

/* ---------- 绘图 ---------- */

function extent(values: number[]) {
  let min = Infinity
  let max = -Infinity
  for (const v of values) {
    if (v < min) min = v
    if (v > max) max = v
  }
  return [min, max === min ? min + 1 : max] as const
}

function linePath(values: number[], width: number, height: number, pad: number) {
  const [min, max] = extent(values)
  const step = width / Math.max(1, values.length - 1)
  return values.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(2)} ${(pad + (1 - (v - min) / (max - min)) * (height - pad * 2)).toFixed(2)}`).join('')
}

/** 字大小的迷你折线：只有线和末端一个点，点用强调色。viewBox 的宽高比与 CSS 里的 3.4em × 0.85em 一致。 */
export function Sparkline({ values, label }: { values: number[]; label: string }) {
  const w = 60
  const h = 15
  const [min, max] = extent(values)
  const last = values[values.length - 1]!
  const endY = 1.5 + (1 - (last - min) / (max - min)) * (h - 3)
  return (
    <svg className="di-spark" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label}>
      <path d={linePath(values, w, h, 1.5)} fill="none" stroke="var(--ink)" strokeWidth={1} strokeLinejoin="round" />
      <circle cx={w} cy={endY} r={1.6} fill="var(--hl)" />
    </svg>
  )
}

const LIVE_SPAN = 36
const LIVE_W = 81
const LIVE_H = 15

/** 实时折线在 time 秒时的形状：每秒推进一个点，最后一个点从右边缘外滑进来，末端的值按小数部分插值。 */
function liveGeometry(values: number[], min: number, max: number, time: number) {
  const tick = Math.floor(time) % (values.length - LIVE_SPAN - 1)
  const frac = time - Math.floor(time)
  const slice = values.slice(tick, tick + LIVE_SPAN + 1)
  const step = LIVE_W / (LIVE_SPAN - 1)
  const yOf = (v: number) => 1.5 + (1 - (v - min) / (max - min)) * (LIVE_H - 3)
  const d = slice.map((v, i) => `${i === 0 ? 'M' : 'L'}${((i - frac) * step).toFixed(2)} ${yOf(v).toFixed(2)}`).join('')
  const end = slice[LIVE_SPAN - 1]! + (slice[LIVE_SPAN]! - slice[LIVE_SPAN - 1]!) * frac
  return { tick, d, cy: yOf(end), value: slice[LIVE_SPAN - 1]! }
}

/** 实时访客数，跟 LiveSparkline 共用同一个时钟；初始渲染就是第 0 秒的值。 */
export function liveStart(values: number[]) {
  return values[LIVE_SPAN - 1]!
}

/** 实时访客：曲线平滑地向左滑，数字只在整秒时改（直接写 DOM，不触发重渲染）。 */
export function LiveSparkline({ values, numberRef }: { values: number[]; numberRef: RefObject<HTMLSpanElement | null> }) {
  const host = useRef<SVGSVGElement>(null)
  const line = useRef<SVGPathElement>(null)
  const dot = useRef<SVGCircleElement>(null)
  const lastTick = useRef(-1)
  const [min, max] = useMemo(() => extent(values), [values])
  const clipId = `di-live-${useId().replace(/[^\w-]/g, '')}`
  const initial = liveGeometry(values, min, max, 0)

  useFrameLoop(
    host,
    ({ time }) => {
      const shape = liveGeometry(values, min, max, time)
      line.current?.setAttribute('d', shape.d)
      dot.current?.setAttribute('cy', shape.cy.toFixed(2))
      if (shape.tick !== lastTick.current && numberRef.current) {
        lastTick.current = shape.tick
        numberRef.current.textContent = String(shape.value)
      }
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  return (
    <svg ref={host} className="di-spark di-spark-live" viewBox={`0 0 ${LIVE_W} ${LIVE_H}`} aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={-2} width={LIVE_W} height={LIVE_H + 4} />
        </clipPath>
      </defs>
      <path ref={line} d={initial.d} clipPath={`url(#${clipId})`} fill="none" stroke="var(--ink)" strokeWidth={1} strokeLinejoin="round" />
      <circle ref={dot} cx={LIVE_W} cy={initial.cy} r={1.7} fill="var(--hl)" />
    </svg>
  )
}

/** 首屏的小倍数图：每页一格，各自的纵轴；点标出最忙的一天。 */
export function SmallMultiples({ pages, gridlines }: { pages: SiteData['pages']; gridlines: boolean }) {
  const w = 120
  const h = 38
  const pad = 3
  return (
    <ul className="di-multiples">
      {pages.map((page) => {
        const [min, max] = extent(page.values)
        const peak = page.values.indexOf(max)
        const step = w / (page.values.length - 1)
        const yOf = (v: number) => pad + (1 - (v - min) / (max - min)) * (h - pad * 2)
        const last = page.values[page.values.length - 1]!
        return (
          <li key={page.path} className="di-panel">
            <div className="di-panel-head sans">
              <span>{page.path}</span>
              <span>{formatCount(page.total)}</span>
            </div>
            <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`${page.path}: ${page.total} visitors in 30 days, busiest day ${max}`}>
              {gridlines &&
                [pad, h / 2, h - pad].map((y) => <line key={y} x1={0} x2={w} y1={y} y2={y} stroke="var(--rule)" strokeWidth={0.6} />)}
              <path d={linePath(page.values, w, h, pad)} fill="none" stroke="var(--ink)" strokeWidth={0.9} strokeLinejoin="round" />
              <circle cx={peak * step} cy={yOf(max)} r={2} fill="var(--hl)" />
              <circle cx={w} cy={yOf(last)} r={1.4} fill="var(--ink)" />
            </svg>
          </li>
        )
      })}
    </ul>
  )
}

/** 宽度跟着容器走，图里的字就能一直保持正文字号，不随 viewBox 缩放。 */
function useWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(fallback)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.round(entry.contentRect.width))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return [ref, width] as const
}

/** 标签按纵向位置排好，挤在一起的往下推，超出底部再整体上移。 */
function spread(ys: number[], gap: number, top: number, bottom: number) {
  const order = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y)
  for (let k = 0; k < order.length; k++) order[k]!.y = Math.max(order[k]!.y, k === 0 ? top : order[k - 1]!.y + gap)
  const overflow = order[order.length - 1]!.y - bottom
  if (overflow > 0) for (const entry of order) entry.y -= overflow
  const out = new Array<number>(ys.length)
  for (const entry of order) out[entry.i] = entry.y
  return out
}

/** 斜率图：左右两列各自直接标数，最大降幅那条线用强调色。 */
export function Slopegraph({ rows, before, after, gridlines }: { rows: SiteData['slope']; before: string; after: string; gridlines: boolean }) {
  const [ref, width] = useWidth<HTMLDivElement>(540)
  const narrow = width < 420
  const font = narrow ? 12 : 14.5
  const labelW = Math.min(150, Math.round(width * (narrow ? 0.38 : 0.3)))
  const clip = (text: string) => (narrow && text.length > 13 ? `${text.slice(0, 12)}…` : text)
  const height = narrow ? 230 : 280
  const top = 44
  const bottom = height - 12
  const x1 = labelW
  const x2 = width - labelW
  const all = rows.flatMap((row) => [row.before, row.after])
  const [min, max] = extent(all)
  const yOf = (v: number) => top + (1 - (v - min) / (max - min)) * (bottom - top)
  const gap = font + 3
  const leftY = spread(rows.map((row) => yOf(row.before)), gap, top, bottom)
  const rightY = spread(rows.map((row) => yOf(row.after)), gap, top, bottom)
  let star = 0
  rows.forEach((row, i) => {
    if (row.before - row.after > rows[star]!.before - rows[star]!.after) star = i
  })
  const fmt = (n: number) => n.toLocaleString('en-US')

  return (
    <div ref={ref} className="di-slope">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Slopegraph of p75 load time per page, ${before} versus ${after}`} style={{ fontSize: font }}>
        <text x={x1} y={16} textAnchor="end" fill="var(--ink-soft)" fontStyle="italic">
          {clip(before)}
        </text>
        <text x={x2} y={16} textAnchor="start" fill="var(--ink-soft)" fontStyle="italic">
          {clip(after)}
        </text>
        {gridlines && (
          <g stroke="var(--rule)" strokeWidth={1}>
            <line x1={x1 + 6} x2={x1 + 6} y1={top - 10} y2={bottom + 6} />
            <line x1={x2 - 6} x2={x2 - 6} y1={top - 10} y2={bottom + 6} />
          </g>
        )}
        {rows.map((row, i) => {
          const hot = i === star
          const color = hot ? 'var(--hl)' : 'var(--ink)'
          const text = hot ? 'var(--hl-text)' : 'var(--ink)'
          return (
            <g key={row.label}>
              <line x1={x1 + 6} y1={yOf(row.before)} x2={x2 - 6} y2={yOf(row.after)} stroke={color} strokeWidth={hot ? 1.6 : 0.9} />
              <text x={x1} y={leftY[i]! + font * 0.35} textAnchor="end" fill={text}>
                {row.label}
                <tspan dx={6} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {fmt(row.before)}
                </tspan>
              </text>
              <text x={x2} y={rightY[i]! + font * 0.35} textAnchor="start" fill={text}>
                <tspan style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(row.after)}</tspan>
                <tspan dx={6}>{row.label}</tspan>
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
