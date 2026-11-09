// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Tremor Labs, Inc.
// Source: https://github.com/tremorlabs/tremor-blocks/blob/b319e8d/src/content/components/feature-sections/feature-section-05.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  eyebrow: 'Analytics',
  headline: 'Insights made for everyone',
  accent: '#3b82f6',
  secondary: '#f59e0b',
  tone: 'dark',
  fanAngle: 6,
  spread: 1,
  spring: {
    visualDuration: 0.35,
    bounce: 0.35,
  },
}
/* @motif:end */

export type FeaturesChartStackProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 受控散开状态；不传时由悬停控制。 */
  fanned?: boolean
}

const chartdata = [
  { date: 'Jan 23', SolarPanels: 2890, Inverters: 2338 },
  { date: 'Feb 23', SolarPanels: 2756, Inverters: 2103 },
  { date: 'Mar 23', SolarPanels: 3322, Inverters: 2194 },
  { date: 'Apr 23', SolarPanels: 3470, Inverters: 2108 },
  { date: 'May 23', SolarPanels: 3475, Inverters: 1812 },
  { date: 'Jun 23', SolarPanels: 3129, Inverters: 1726 },
  { date: 'Jul 23', SolarPanels: 3490, Inverters: 1982 },
  { date: 'Aug 23', SolarPanels: 2903, Inverters: 2012 },
  { date: 'Sep 23', SolarPanels: 2643, Inverters: 2342 },
  { date: 'Oct 23', SolarPanels: 2837, Inverters: 2473 },
  { date: 'Nov 23', SolarPanels: 2954, Inverters: 3848 },
  { date: 'Dec 23', SolarPanels: 3239, Inverters: 3736 },
]

const MAX = 4000
const TICKS = [0, 1000, 2000, 3000, 4000]

/** 用 ResizeObserver 量宽度，图表按像素绘制，文字不会被 viewBox 拉伸。 */
function useWidth<T extends Element>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width] as const
}

function Legend({ items }: { items: { label: string; color: string; line?: boolean }[] }) {
  return (
    <ul className="flex justify-end gap-4 text-xs" style={{ color: 'var(--cs-axis)' }}>
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-1.5">
          <span className={cn(it.line ? 'h-[3px] w-3.5 rounded-full' : 'size-2 rounded-sm')} style={{ background: it.color }} />
          {it.label}
        </li>
      ))}
    </ul>
  )
}

/** 坐标轴 + 网格的公共骨架；children 拿到绘图区的映射函数。 */
function Plot({
  height,
  leftAxis,
  rightAxis,
  children,
}: {
  height: number
  leftAxis: boolean
  rightAxis: boolean
  children: (p: { x: (i: number) => number; y: (v: number) => number; band: number }) => ReactNode
}) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const left = leftAxis ? 56 : 8
  const right = rightAxis ? 60 : 8
  const top = 8
  const bottom = 26
  const innerW = Math.max(0, width - left - right)
  const innerH = height - top - bottom
  const n = chartdata.length
  const band = innerW / n
  const x = (i: number) => left + band * (i + 0.5)
  const y = (v: number) => top + innerH * (1 - v / MAX)
  // 窄屏时隔几个标签显示一个，保证标签之间至少 ~46px
  const every = Math.max(1, Math.ceil(46 / Math.max(band, 1)))
  const fmt = (v: number) => v.toLocaleString('en-US')
  return (
    <div ref={ref} style={{ height }} className="w-full">
      {width > 0 && (
        <svg width={width} height={height} className="block overflow-visible text-xs" aria-hidden>
          {TICKS.map((t) => (
            <g key={t}>
              <line x1={left} x2={left + innerW} y1={y(t)} y2={y(t)} stroke="var(--cs-grid)" />
              {leftAxis && (
                <text x={left - 8} y={y(t)} dy="0.35em" textAnchor="end" fill="var(--cs-axis)">
                  {fmt(t)}
                </text>
              )}
              {rightAxis && (
                <text x={left + innerW + 8} y={y(t)} dy="0.35em" textAnchor="start" fill="var(--cs-axis)">
                  {fmt(t)}
                </text>
              )}
            </g>
          ))}
          {chartdata.map((d, i) =>
            i % every === 0 ? (
              <text key={d.date} x={x(i)} y={height - 6} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} dx={i === 0 ? -band / 2 + 2 : i === n - 1 ? band / 2 - 2 : 0} fill="var(--cs-axis)">
                {d.date}
              </text>
            ) : null,
          )}
          {children({ x, y, band })}
        </svg>
      )}
    </div>
  )
}

function ComboChart({ accent, secondary }: { accent: string; secondary: string }) {
  return (
    <div className="mx-auto h-60 w-full px-3 sm:px-10">
      <Legend
        items={[
          { label: 'SolarPanels', color: accent },
          { label: 'Inverters', color: secondary, line: true },
        ]}
      />
      <div className="mt-2">
        <Plot height={208} leftAxis rightAxis>
          {({ x, y, band }) => {
            const bw = Math.max(2, band * 0.62)
            return (
              <>
                {chartdata.map((d, i) => (
                  <rect key={d.date} x={x(i) - bw / 2} y={y(d.SolarPanels)} width={bw} height={y(0) - y(d.SolarPanels)} fill={accent} />
                ))}
                <polyline points={chartdata.map((d, i) => `${x(i)},${y(d.Inverters)}`).join(' ')} fill="none" stroke={secondary} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              </>
            )
          }}
        </Plot>
      </div>
    </div>
  )
}

function AreaChart({ accent, secondary }: { accent: string; secondary: string }) {
  const id = useId().replace(/:/g, '')
  const series = [
    { key: 'SolarPanels' as const, color: accent },
    { key: 'Inverters' as const, color: secondary },
  ]
  return (
    <div className="mx-auto h-60 w-full px-3 sm:px-10">
      <Legend items={series.map((s) => ({ label: s.key, color: s.color, line: true }))} />
      <div className="mt-2">
        <Plot height={208} leftAxis rightAxis={false}>
          {({ x, y }) => (
            <>
              <defs>
                {series.map((s) => (
                  <linearGradient key={s.key} id={`${id}-${s.key}`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor={s.color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              {series.map((s) => {
                const pts = chartdata.map((d, i) => `${x(i)},${y(d[s.key])}`)
                const n = chartdata.length - 1
                return (
                  <g key={s.key}>
                    <path d={`M${pts.join(' L')} L${x(n)},${y(0)} L${x(0)},${y(0)} Z`} fill={`url(#${id}-${s.key})`} />
                    <polyline points={pts.join(' ')} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                  </g>
                )
              })}
            </>
          )}
        </Plot>
      </div>
    </div>
  )
}

/** Tremor CategoryBar 的简化版：分段条 + 刻度 + 标记。 */
function CategoryBar({ values, colors, marker, className }: { values: number[]; colors: string[]; marker: number; className?: string }) {
  const total = values.reduce((a, b) => a + b, 0)
  let acc = 0
  const stops = [0, ...values.map((v) => (acc += v))]
  return (
    <div className={className}>
      <div className="relative mb-2 h-5 text-sm" style={{ color: 'var(--cs-axis)' }}>
        {stops.map((s, i) => (
          <span key={i} className={cn('absolute', i === 0 ? 'left-0' : i === stops.length - 1 ? 'right-0' : '-translate-x-1/2')} style={i > 0 && i < stops.length - 1 ? { left: `${(s / total) * 100}%` } : undefined}>
            {s}
          </span>
        ))}
      </div>
      <div className="relative flex h-2 w-full items-center">
        <div className="flex h-full flex-1 items-center gap-0.5 overflow-hidden rounded-full">
          {values.map((v, i) => (
            <div key={i} className="h-full" style={{ width: `${(v / total) * 100}%`, background: colors[i] }} />
          ))}
        </div>
        <div className="absolute w-2 -translate-x-1/2" style={{ left: `${(marker / total) * 100}%` }}>
          <div className="mx-auto h-4 w-1 rounded-full ring-2" style={{ background: 'var(--cs-marker)', ['--tw-ring-color' as string]: 'var(--cs-card)' }} />
        </div>
      </div>
    </div>
  )
}

function Screws() {
  const dot = 'absolute size-1.5 rounded-full shadow-inner'
  const s = { background: 'var(--cs-screw)' }
  return (
    <>
      <div className={cn(dot, 'left-2.5 top-2.5')} style={s} />
      <div className={cn(dot, 'right-2.5 top-2.5')} style={s} />
      <div className={cn(dot, 'bottom-2.5 left-2.5')} style={s} />
      <div className={cn(dot, 'bottom-2.5 right-2.5')} style={s} />
    </>
  )
}

function palette(tone: string): CSSProperties {
  const dark = tone === 'dark'
  return {
    '--cs-bg': dark ? '#030712' : '#ffffff',
    '--cs-card': dark ? '#0b0f19' : '#ffffff',
    '--cs-ring': dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    '--cs-grid': dark ? '#1f2937' : '#e5e7eb',
    '--cs-axis': dark ? '#9ca3af' : '#6b7280',
    '--cs-screw': dark ? '#1f2937' : '#e5e7eb',
    '--cs-marker': dark ? '#f9fafb' : '#111827',
    '--cs-eyebrow-from': dark ? '#bfdbfe' : '#374151',
    '--cs-eyebrow-to': dark ? '#60a5fa' : '#9ca3af',
    '--cs-head-from': dark ? '#f9fafb' : '#111827',
    '--cs-head-to': dark ? '#d1d5db' : '#1f2937',
  } as CSSProperties
}

export function FeaturesChartStack({ className, style, fanned, ...props }: FeaturesChartStackProps) {
  const o = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const [hover, setHover] = useState(false)
  const open = fanned ?? hover
  const half = o.fanAngle / 2
  const sp = o.spread

  const transition = (delay: number) =>
    reduced ? { duration: 0 } : { type: 'spring' as const, visualDuration: o.spring.visualDuration, bounce: o.spring.bounce, delay: open ? delay : 0 }

  const card = 'absolute h-80 w-full transform-gpu rounded-lg ring-1'
  const cardStyle: CSSProperties = { background: 'var(--cs-card)', ['--tw-ring-color' as string]: 'var(--cs-ring)', top: 0 }

  return (
    <section className={cn('w-full', className)} style={{ ...palette(o.tone), background: 'var(--cs-bg)', ...style }} aria-labelledby="features-title">
      <div className="mx-auto w-full max-w-4xl px-3 py-20 sm:text-center">
        <span className="block bg-gradient-to-b bg-clip-text text-lg font-semibold text-transparent sm:text-xl" style={{ backgroundImage: 'linear-gradient(to bottom, var(--cs-eyebrow-from), var(--cs-eyebrow-to))' }}>
          {o.eyebrow}
        </span>
        <h2 id="features-title" className="mt-2 inline-block bg-clip-text py-2 text-4xl font-bold tracking-tighter text-transparent sm:text-6xl" style={{ backgroundImage: 'linear-gradient(to bottom right, var(--cs-head-from), var(--cs-head-to))' }}>
          {o.headline}
        </h2>
        <motion.div
          className="relative mt-12"
          style={{ height: 480 + Math.max(0, (sp - 1) * 160) }}
          onHoverStart={() => setHover(true)}
          onHoverEnd={() => setHover(false)}
          role="img"
          aria-label="Three stacked analytics cards: a combo chart, a segmented bar and an area chart"
        >
          <motion.div
            className={cn(card, 'shadow-md shadow-black/5')}
            style={cardStyle}
            initial={false}
            animate={open ? { y: 48 + 160 * sp, rotate: o.fanAngle, scale: 0.9 } : { y: 48, rotate: 0, scale: 0.9 }}
            transition={transition(0.075)}
          >
            <div className="relative flex size-full items-center">
              <Screws />
              <AreaChart accent={o.accent} secondary={o.secondary} />
            </div>
          </motion.div>
          <motion.div
            className={cn(card, 'shadow-md shadow-black/5')}
            style={cardStyle}
            initial={false}
            animate={open ? { y: 24 + 40 * sp, rotate: -half, scale: 0.95 } : { y: 24, rotate: 0, scale: 0.95 }}
            transition={transition(0.05)}
          >
            <div className="relative flex size-full items-end">
              <Screws />
              <CategoryBar values={[10, 10, 20]} marker={17} colors={['#ec4899', '#f59e0b', '#10b981']} className="mb-12 w-full px-3 sm:px-10" />
            </div>
          </motion.div>
          <motion.div
            className={cn(card, 'flex items-center shadow-xl shadow-black/5')}
            style={cardStyle}
            initial={false}
            animate={open ? { y: -24 * sp, rotate: half, scale: 0.95 } : { y: 0, rotate: 0, scale: 1 }}
            transition={transition(0)}
          >
            <div className="relative flex size-full items-center">
              <Screws />
              <ComboChart accent={o.accent} secondary={o.secondary} />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
