// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Tremor Labs, Inc.
// Source: https://github.com/tremorlabs/tremor-blocks/blob/b319e8d/src/content/components/kpi-cards/kpi-card-29.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import type { CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  layout: 'signals',
  bars: 3,
  redThreshold: 0.3,
  orangeThreshold: 0.7,
  showFraction: true,
  heading: 'Overview',
}
/* @motif:end */

type Category = 'red' | 'orange' | 'emerald' | 'gray'

export interface Metric {
  label: string
  value: number
  percentage: string
  fraction: string
}

export interface RangeCheck {
  name: string
  stat: string
  status: 'within' | 'observe' | 'critical'
  range: string
}

export interface GoalRegion {
  name: string
  stat: string
  goalsAchieved: number
  status: 'within' | 'observe' | 'critical'
  href: string
}

export type KpiHealthSignalsProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  metrics?: readonly Metric[]
  checks?: readonly RangeCheck[]
  regions?: readonly GoalRegion[]
}

const THEME_COLORS = {
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  emerald: 'bg-emerald-500',
  gray: 'bg-gray-300',
} as const

const INACTIVE_CLASS = `${THEME_COLORS.gray} dark:bg-gray-800`

const CARD = 'relative w-full rounded-lg border border-border bg-card p-6 text-left shadow-xs'

function getCategory(value: number, red: number, orange: number): Category {
  if (value < 0) return 'gray'
  if (value < red) return 'red'
  if (value < orange) return 'orange'
  return 'emerald'
}

function Indicator({ number, bars, red, orange }: { number: number; bars: number; red: number; orange: number }) {
  const category = getCategory(number, red, orange)
  const filled = category === 'gray' ? 0 : category === 'red' ? 1 : category === 'orange' ? Math.ceil(bars / 2) : bars
  const active = THEME_COLORS[category]

  return (
    <div className="flex gap-0.5">
      {Array.from({ length: bars }, (_, index) => (
        <div
          key={index}
          className={cn('h-3.5 w-1 rounded-sm transition-colors duration-300 motion-reduce:transition-none', index < filled ? active : INACTIVE_CLASS)}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

function MetricCard({ metric, bars, red, orange, showFraction }: { metric: Metric; bars: number; red: number; orange: number; showFraction: boolean }) {
  const { label, value, percentage, fraction } = metric
  const category = getCategory(value, red, orange)
  const word = category === 'emerald' ? 'healthy' : category === 'orange' ? 'watch' : category === 'red' ? 'low' : 'no data'

  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1.5 flex items-center gap-2">
        <Indicator number={value} bars={bars} red={red} orange={orange} />
        <span className="sr-only">{word}:</span>
        <p className="text-lg font-semibold text-foreground tabular-nums">
          {percentage}
          {showFraction && <span className="ml-1 font-medium text-muted-foreground/70">- {fraction}</span>}
        </p>
      </dd>
    </div>
  )
}

const DEFAULT_METRICS: readonly Metric[] = [
  { label: 'Lead-to-Quote Ratio', value: 0.61, percentage: '59.8%', fraction: '450/752' },
  { label: 'Project Load', value: 0.24, percentage: '12.9%', fraction: '129/1K' },
  { label: 'Win Probability', value: 0.8, percentage: '85.1%', fraction: '280/329' },
]

const DEFAULT_CHECKS: readonly RangeCheck[] = [
  { name: 'Daily active users', stat: '345', status: 'within', range: '200-410' },
  { name: 'Weekly sessions', stat: '254', status: 'critical', range: '550-1,200' },
  { name: 'Open issues', stat: '34', status: 'observe', range: '10-25' },
]

const DEFAULT_REGIONS: readonly GoalRegion[] = [
  { name: 'Europe', stat: '$10,023', goalsAchieved: 3, status: 'observe', href: '#' },
  { name: 'North America', stat: '$14,092', goalsAchieved: 5, status: 'within', href: '#' },
  { name: 'Asia', stat: '$113,232', goalsAchieved: 1, status: 'critical', href: '#' },
]

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4 shrink-0" aria-hidden="true">
      <path d="M10 15.17l9.19-9.19 1.42 1.41L10 18 3.64 11.64l1.41-1.41L10 15.17z" />
    </svg>
  )
}

function EyeIcon({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4 shrink-0" aria-hidden="true">
      <path d="M1.18 12C2.12 6.88 6.6 3 12 3s9.88 3.88 10.82 9c-.94 5.12-5.42 9-10.82 9S2.12 17.12 1.18 12zM12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-2a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4 shrink-0" aria-hidden="true">
      <path d="M12 3c5.39 0 9.88 3.88 10.82 9-.94 5.12-5.43 9-10.82 9S2.12 17.12 1.18 12C2.12 6.88 6.61 3 12 3zm0 16a9 9 0 0 0 8.78-7A9 9 0 0 0 3.22 12 9 9 0 0 0 12 19zm0-2.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0-2a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
    </svg>
  )
}

function WarningIcon({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4 shrink-0" aria-hidden="true">
      <path d="M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4 shrink-0" aria-hidden="true">
      <path d="M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5 shrink-0 text-muted-foreground group-hover:text-foreground" aria-hidden="true">
      <path d="M13.17 12l-4.95-4.95 1.42-1.41L16 12l-6.36 6.36-1.42-1.41L13.17 12z" />
    </svg>
  )
}

export function KpiHealthSignals({ className, style, metrics, checks, regions, ...props }: KpiHealthSignalsProps) {
  const options = { ...defaults, ...props }
  const bars = Math.max(3, Math.min(5, Math.round(options.bars)))
  const red = Math.min(options.redThreshold, options.orangeThreshold)
  const orange = Math.max(options.redThreshold, options.orangeThreshold)

  if (options.layout === 'badges') {
    return (
      <dl className={cn('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3', className)} style={style}>
        {(checks ?? DEFAULT_CHECKS).map((item) => (
          <div key={item.name} className={CARD}>
            <dt className="text-sm font-medium text-muted-foreground">{item.name}</dt>
            <dd className="text-3xl font-semibold text-foreground">{item.stat}</dd>
            <dd
              className={cn(
                item.status === 'within'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-500'
                  : item.status === 'observe'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-400/10 dark:text-yellow-500'
                    : 'bg-red-100 text-red-800 dark:bg-red-400/10 dark:text-red-500',
                'mt-4 inline-flex items-center gap-x-1.5 rounded-md px-2 py-1.5 text-xs font-medium',
              )}
            >
              {item.status === 'within' ? <CheckIcon /> : item.status === 'observe' ? <EyeIcon /> : <WarningIcon />}
              {item.status}: {item.range}
            </dd>
          </div>
        ))}
      </dl>
    )
  }

  if (options.layout === 'goals') {
    return (
      <dl className={cn('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3', className)} style={style}>
        {(regions ?? DEFAULT_REGIONS).map((item) => (
          <div key={item.name} className={CARD}>
            <dt className="text-sm font-medium text-muted-foreground">{item.name}</dt>
            <dd className="text-3xl font-semibold text-foreground">{item.stat}</dd>
            <div className="group relative mt-6 flex items-center space-x-4 rounded-md bg-muted/60 p-2 transition-colors focus-within:ring-2 focus-within:ring-ring hover:bg-muted">
              <div className="flex w-full items-center justify-between truncate">
                <div className="flex items-center space-x-3">
                  <span
                    className={cn(
                      item.status === 'within' ? 'bg-emerald-500 text-white' : item.status === 'observe' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white',
                      'flex size-9 shrink-0 items-center justify-center rounded',
                    )}
                  >
                    {item.status === 'within' ? <CheckIcon /> : item.status === 'observe' ? <EyeIcon filled /> : <WarningIcon filled />}
                  </span>
                  <dd>
                    <p className="text-sm text-muted-foreground">
                      <a href={item.href} className="focus:outline-none">
                        {/* Extend link to entire card */}
                        <span className="absolute inset-0" aria-hidden="true" />
                        {item.goalsAchieved}/5 goals
                      </a>
                    </p>
                    <p
                      className={cn(
                        item.status === 'within'
                          ? 'text-emerald-800 dark:text-emerald-500'
                          : item.status === 'observe'
                            ? 'text-yellow-800 dark:text-yellow-500'
                            : 'text-red-800 dark:text-red-500',
                        'text-sm font-medium',
                      )}
                    >
                      {item.status}
                    </p>
                  </dd>
                </div>
                <ArrowRightIcon />
              </div>
            </div>
          </div>
        ))}
      </dl>
    )
  }

  return (
    <div className={cn(CARD, 'mx-auto w-fit max-w-full py-4', className)} style={style}>
      <h2 className="text-lg font-semibold text-foreground">{options.heading}</h2>
      <dl className="mt-6 flex flex-wrap items-center gap-x-12 gap-y-8">
        {(metrics ?? DEFAULT_METRICS).map((metric) => (
          <MetricCard key={metric.label} metric={metric} bars={bars} red={red} orange={orange} showFraction={options.showFraction} />
        ))}
      </dl>
    </div>
  )
}
