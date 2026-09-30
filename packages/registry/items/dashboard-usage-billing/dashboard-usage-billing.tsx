// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Tremor Labs, Inc.
// Source: https://github.com/tremorlabs/tremor-blocks/blob/b319e8d/src/content/components/billing-usage/billing-usage-01.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { animate, motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#7c8cff',
  layout: 'split',
  density: 'comfortable',
  planName: 'Team',
  seed: 5,
  warnAt: 80,
  showInvoice: true,
  animate: true,
}
/* @motif:end */

export type DashboardUsageBillingProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

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

const METERS = [
  { id: 'requests', label: 'API requests', hint: 'per month', limit: 250000, unit: '', lo: 0.82, span: 0.12 },
  { id: 'storage', label: 'Storage', hint: 'of 100 GB', limit: 100, unit: ' GB', lo: 0.28, span: 0.4 },
  { id: 'seats', label: 'Team seats', hint: 'active members', limit: 10, unit: '', lo: 0.5, span: 0.4 },
  { id: 'bandwidth', label: 'Bandwidth', hint: 'of 1 TB', limit: 1000, unit: ' GB', lo: 0.12, span: 0.4 },
]
const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']

function Count({ value, run, format }: { value: number; run: boolean; format: (v: number) => string }) {
  const [shown, setShown] = useState(run ? 0 : value)
  useEffect(() => {
    if (!run) {
      setShown(value)
      return
    }
    const controls = animate(0, value, { duration: 1.2, ease: [0.22, 1, 0.36, 1], onUpdate: setShown })
    return () => controls.stop()
  }, [value, run])
  return <span className="tabular-nums">{format(shown)}</span>
}

const PAD: Record<string, string> = { compact: 'p-4 sm:p-5', comfortable: 'p-5 sm:p-6', spacious: 'p-6 sm:p-8' }

/** 用量与账单面板：按额度着色的进度条、下次账单明细和近六个月花费。 */
export function DashboardUsageBilling({ className, style, ...props }: DashboardUsageBillingProps) {
  const { accent, layout, density, planName, seed, warnAt, showInvoice, animate: animated } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const run = animated && !reduced
  const data = useMemo(() => {
    const rand = rng(seed * 449 + 3)
    const meters = METERS.map((m) => ({ ...m, pct: m.lo + rand() * m.span }))
    const history = MONTHS.map((_, i) => 54 + i * 4 + Math.round(rand() * 14))
    return { meters, history }
  }, [seed])

  const base = 79
  const seats = 18
  const overage = Math.round(data.meters[0].pct * 100) > 92 ? 6.4 : 0
  const total = base + seats + overage
  const hot = data.meters.filter((m) => m.pct * 100 >= warnAt)
  const maxH = Math.max(...data.history, total)
  const split = layout === 'split' && showInvoice

  const tone = (pct: number) => (pct >= 0.97 ? '#f43f5e' : pct * 100 >= warnAt ? '#f59e0b' : accent)
  const fmtVal = (m: (typeof METERS)[number], v: number) => (m.limit >= 1000 && m.unit === '' ? Math.round(v).toLocaleString('en-US') : m.unit === '' ? String(Math.round(v)) : `${Number(v.toFixed(v < 10 ? 1 : 0))}${m.unit}`)

  const meters = (
    <div className="space-y-5">
      {data.meters.map((m, i) => {
        const used = m.pct * m.limit
        const color = tone(m.pct)
        return (
          <div key={m.id}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium">
                {m.label} <span className="ml-1 text-xs font-normal text-muted-foreground">{m.hint}</span>
              </span>
              <span className="text-muted-foreground tabular-nums">
                <span className="font-medium text-foreground">
                  <Count value={used} run={run} format={(v) => fmtVal(m, v)} />
                </span>{' '}
                / {m.limit.toLocaleString('en-US')}
                {m.unit}
              </span>
            </div>
            <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full origin-left rounded-full"
                style={{ width: `${m.pct * 100}%`, background: `linear-gradient(90deg, color-mix(in oklab, ${color} 70%, transparent), ${color})` }}
                initial={run ? { scaleX: 0 } : false}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.1, delay: 0.15 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              />
              <span className="absolute inset-y-0 w-px bg-background/70" style={{ left: `${warnAt}%` }} aria-hidden />
            </div>
            <p className="mt-1.5 text-xs tabular-nums" style={{ color: m.pct * 100 >= warnAt ? color : undefined }}>
              {m.pct * 100 >= warnAt ? `${Math.round(m.pct * 100)}% used — approaching your limit` : <span className="text-muted-foreground">{Math.round(m.pct * 100)}% used</span>}
            </p>
          </div>
        )
      })}
    </div>
  )

  const invoice = (
    <div className={cn('rounded-xl border bg-muted/30 p-5', !split && 'sm:flex sm:items-end sm:justify-between sm:gap-8')}>
      <div className={cn(!split && 'sm:min-w-56')}>
        <p className="text-xs text-muted-foreground">Next invoice · Oct 14</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight">
          <Count value={total} run={run} format={(v) => `$${v.toFixed(2)}`} />
        </p>
        <dl className="mt-4 space-y-2 text-sm">
          {[
            [`${planName} plan`, base],
            ['Extra seats (2)', seats],
            ...(overage ? [['Request overage', overage] as [string, number]] : []),
          ].map(([k, v]) => (
            <div key={k as string} className="flex justify-between gap-6">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="tabular-nums">${(v as number).toFixed(2)}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className={cn('mt-5', !split && 'sm:mt-0 sm:flex-1')}>
        <p className="mb-2 text-xs text-muted-foreground">Last six months</p>
        <div className="flex h-20 items-end gap-2">
          {data.history.map((v, i) => {
            const last = i === data.history.length - 1
            return (
              <div key={i} className="flex h-full flex-1 flex-col justify-end">
                <motion.div
                  className="w-full rounded-t-md"
                  style={{ height: `${(v / maxH) * 100}%`, transformOrigin: 'bottom', background: last ? accent : 'color-mix(in oklab, var(--foreground) 14%, transparent)' }}
                  initial={run ? { scaleY: 0 } : false}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.7, delay: 0.3 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            )
          })}
        </div>
        <div className="mt-1.5 flex gap-2 text-[10px] text-muted-foreground">
          {MONTHS.map((m) => (
            <span key={m} className="flex-1 text-center">
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <section className={cn('w-full rounded-xl border bg-card text-card-foreground shadow-sm', className)} style={{ ['--acc' as string]: accent, ...style }}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg text-sm font-semibold" style={{ background: 'color-mix(in oklab, var(--acc) 16%, transparent)', color: 'var(--acc)' }}>
            {planName.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <h2 className="text-sm font-semibold tracking-tight">{planName} plan</h2>
            <p className="text-xs text-muted-foreground">Billed monthly · renews Oct 14, 2026</p>
          </div>
        </div>
        <button type="button" className="rounded-lg border bg-background/60 px-3 py-1.5 text-xs font-medium transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
          Manage plan
        </button>
      </header>

      <div className={cn(PAD[density] ?? PAD.comfortable, split ? 'grid gap-8 lg:grid-cols-[1.5fr_1fr]' : 'space-y-8')}>
        <div>
          <h3 className="mb-5 text-sm font-medium">Usage this cycle</h3>
          {meters}
          {hot.length > 0 && (
            <motion.div
              className="mt-6 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm"
              initial={run ? { opacity: 0, y: 6 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              <svg viewBox="0 0 24 24" className="mt-0.5 size-4 shrink-0 text-amber-500" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 4 3.5 19h17L12 4ZM12 10v4M12 16.5v.01" />
              </svg>
              <p className="text-amber-700 dark:text-amber-300">
                Usage on {hot.map((m) => m.label).join(' and ')} is above {warnAt}% of the plan limit. Requests pause at 100%.
              </p>
            </motion.div>
          )}
        </div>
        {showInvoice && invoice}
      </div>
    </section>
  )
}
