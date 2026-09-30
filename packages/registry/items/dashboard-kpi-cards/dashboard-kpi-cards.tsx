// SPDX-License-Identifier: MIT
// Copyright (c) 2023 shadcn
// Source: https://github.com/shadcn-ui/ui/blob/08ab84f/apps/v4/registry/new-york-v4/blocks/dashboard-01/components/section-cards.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { animate, motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useMemo, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#7c8cff',
  chart: 'area',
  density: 'comfortable',
  seed: 7,
  heading: 'Overview',
  period: 'Last 30 days',
  showDelta: true,
  animate: true,
}
/* @motif:end */

export type DashboardKpiCardsProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

type Kind = 'money' | 'int' | 'percent' | 'ms'
type Metric = { id: string; label: string; base: number; kind: Kind; good: 'up' | 'down'; trend: number; icon: string }

const METRICS: Metric[] = [
  { id: 'revenue', label: 'Revenue', base: 48200, kind: 'money', good: 'up', trend: 0.16, icon: 'M12 4v16M16 8.5c0-1.4-1.8-2.5-4-2.5s-4 1.1-4 2.5 1.8 2.3 4 2.5 4 1.2 4 2.6-1.8 2.4-4 2.4-4-1-4-2.4' },
  { id: 'users', label: 'Active users', base: 12480, kind: 'int', good: 'up', trend: 0.12, icon: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.5 19c.4-3 2.6-4.5 5.5-4.5s5.1 1.5 5.5 4.5M16 6.2a3 3 0 0 1 0 5.6M18 14.8c1.6.5 2.7 1.8 3 4.2' },
  { id: 'conv', label: 'Conversion', base: 3.42, kind: 'percent', good: 'up', trend: 0.05, icon: 'M4 19h16M6 15l4-4 3 3 5-6' },
  { id: 'latency', label: 'p95 latency', base: 212, kind: 'ms', good: 'down', trend: -0.1, icon: 'M12 7v5l3 2M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z' },
]

/** 可复现的伪随机数，同一个 seed 永远得到同一组数据。 */
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

const POINTS = 28

function makeSeries(metric: Metric, seed: number, index: number) {
  const rand = rng(seed * 101 + index * 977 + 13)
  const rel: number[] = []
  let v = 1
  for (let i = 0; i < POINTS; i++) {
    v += (rand() - 0.5) * 0.04 + metric.trend / POINTS + Math.sin(i / 4 + index * 1.7) * 0.02
    rel.push(v)
  }
  const last = rel[POINTS - 1]
  const value = metric.base * (0.9 + rand() * 0.2)
  const series = rel.map((r) => (r / last) * value)
  const delta = (rel[POINTS - 1] / rel[0] - 1) * 100
  return { value, series, delta }
}

function format(value: number, kind: Kind) {
  const n = (x: number, d = 0) => x.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
  if (kind === 'money') return `$${n(value)}`
  if (kind === 'percent') return `${n(value, 2)}%`
  if (kind === 'ms') return `${n(value)}ms`
  return n(value)
}

function CountUp({ value, kind, run }: { value: number; kind: Kind; run: boolean }) {
  const [shown, setShown] = useState(run ? 0 : value)
  useEffect(() => {
    if (!run) {
      setShown(value)
      return
    }
    const controls = animate(0, value, { duration: 1.3, ease: [0.22, 1, 0.36, 1], onUpdate: setShown })
    return () => controls.stop()
  }, [value, run])
  return <span className="tabular-nums">{format(shown, kind)}</span>
}

/** 平滑的三次贝塞尔折线（Catmull-Rom 转换）。 */
function smooth(pts: [number, number][], height: number) {
  const clamp = (y: number) => Math.min(height, Math.max(0, y))
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${clamp(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${clamp(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return d
}

const W = 200

function Spark({ series, chart, height, run, delay }: { series: number[]; chart: string; height: number; run: boolean; delay: number }) {
  const uid = useId().replace(/:/g, '')
  const H = height
  const min = Math.min(...series)
  const max = Math.max(...series)
  const span = max - min || 1
  const y = (v: number) => 6 + (1 - (v - min) / span) * (H - 12)
  const pts: [number, number][] = series.map((v, i) => [(i / (series.length - 1)) * W, y(v)])
  const line = smooth(pts, H)
  const lastY = pts[pts.length - 1][1]
  const ease = [0.22, 1, 0.36, 1] as const
  const bars = series.slice(-20)

  return (
    <div className="relative" style={{ height }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id={`${uid}g`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--acc)" stopOpacity="0.38" />
            <stop offset="1" stopColor="var(--acc)" stopOpacity="0" />
          </linearGradient>
          <clipPath id={`${uid}c`}>
            <motion.rect x="-2" y="-4" height={H + 8} initial={run ? { width: 0 } : false} animate={{ width: W + 4 }} transition={{ duration: 1.2, delay, ease }} />
          </clipPath>
        </defs>
        {chart === 'bars' ? (
          bars.map((v, i) => {
            const bw = W / bars.length
            const top = 4 + (1 - (v - min) / span) * (H - 10)
            return (
              <motion.rect
                key={i}
                x={i * bw + bw * 0.16}
                width={bw * 0.68}
                y={top}
                height={H - top}
                rx="2"
                fill="var(--acc)"
                fillOpacity={i === bars.length - 1 ? 1 : 0.32}
                style={{ transformOrigin: `0px ${H}px`, transformBox: 'view-box' }}
                initial={run ? { scaleY: 0 } : false}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.7, delay: delay + i * 0.025, ease }}
              />
            )
          })
        ) : (
          <g clipPath={`url(#${uid}c)`}>
            {chart === 'area' && <path d={`${line} L${W} ${H} L0 ${H} Z`} fill={`url(#${uid}g)`} />}
            <path d={line} fill="none" stroke="var(--acc)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </g>
        )}
      </svg>
      {chart !== 'bars' && (
        <motion.span
          className="pointer-events-none absolute right-0 size-2 -translate-y-1/2 translate-x-1/2 rounded-full ring-4"
          style={{ top: lastY, background: 'var(--acc)', ['--tw-ring-color' as string]: 'color-mix(in oklab, var(--acc) 25%, transparent)' }}
          initial={run ? { opacity: 0, scale: 0.4 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: delay + 1.05 }}
        />
      )}
    </div>
  )
}

const PAD: Record<string, { card: string; spark: number; num: string }> = {
  compact: { card: 'p-4', spark: 40, num: 'text-2xl' },
  comfortable: { card: 'p-5', spark: 56, num: 'text-3xl' },
  spacious: { card: 'p-6', spark: 76, num: 'text-[2rem]' },
}

/** 四张带迷你图的指标卡：数字滚动、曲线自左向右描出，涨跌用语义色标注。 */
export function DashboardKpiCards({ className, style, ...props }: DashboardKpiCardsProps) {
  const { accent, chart, density, seed, heading, period, showDelta, animate: animated } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const run = animated && !reduced
  const pad = PAD[density] ?? PAD.comfortable
  const data = useMemo(() => METRICS.map((m, i) => ({ m, ...makeSeries(m, seed, i) })), [seed])

  return (
    <section className={cn('w-full text-foreground', className)} style={{ ['--acc' as string]: accent, ...style }}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold tracking-tight">{heading}</h2>
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-xs text-muted-foreground">
          <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
            <rect x="2.5" y="3.5" width="11" height="10" rx="2" />
            <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" />
          </svg>
          {period}
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.map(({ m, value, series, delta }, i) => {
          const good = m.good === 'up' ? delta >= 0 : delta <= 0
          return (
            <motion.article
              key={m.id}
              className={cn('group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-colors hover:border-[color-mix(in_oklab,var(--acc)_45%,var(--border))]', pad.card)}
              initial={run ? { opacity: 0, y: 12 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full opacity-[0.14] blur-2xl" style={{ background: 'var(--acc)' }} />
              <div className="relative flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="grid size-7 place-items-center rounded-md border bg-muted/60 text-foreground/80">
                    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d={m.icon} />
                    </svg>
                  </span>
                  {m.label}
                </div>
                {showDelta && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums',
                      good ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/12 text-rose-600 dark:text-rose-400',
                    )}
                  >
                    <svg viewBox="0 0 12 12" className={cn('size-3', delta < 0 && 'rotate-180')} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M6 9.5v-7M3 5.5l3-3 3 3" />
                    </svg>
                    {Math.abs(delta).toFixed(1)}%
                  </span>
                )}
              </div>
              <p className={cn('relative mt-4 font-semibold tracking-tight', pad.num)}>
                <CountUp value={value} kind={m.kind} run={run} />
              </p>
              <p className="relative mt-1 text-xs text-muted-foreground">vs. previous period</p>
              <div className="relative mt-5">
                <Spark series={series} chart={chart} height={pad.spark} run={run} delay={0.25 + i * 0.07} />
              </div>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
