// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Tremor Labs, Inc.
// Source: https://github.com/tremorlabs/tremor-blocks/blob/b319e8d/src/content/components/empty-states/empty-state-03.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  ghostType: 'bars',
  accent: '#3b82f6',
  tone: 'dashed',
  shimmer: true,
  message: 'No data to show',
  actionLabel: 'Connect database',
}
/* @motif:end */

export type EmptyStateGhostChartProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  onAction?: () => void
}

function inkFor(hex: string): string {
  const v = hex.replace('#', '')
  const r = parseInt(v.slice(0, 2), 16)
  const g = parseInt(v.slice(2, 4), 16)
  const b = parseInt(v.slice(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? '#0b0b0f' : '#ffffff'
}

/** RiBarChartFill 的替代 */
function BarChartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M2 13h6v8H2v-8Zm7-10h6v18H9V3Zm7 5h6v13h-6V8Z" />
    </svg>
  )
}

function AddIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6Z" />
    </svg>
  )
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M10 6v2H5v11h11v-5h2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6Zm11-3v8h-2V6.41l-7.79 7.8-1.42-1.42L17.59 5H13V3h8Z" />
    </svg>
  )
}

const BARS = [38, 62, 46, 78, 54, 88, 66, 72, 50, 84, 60, 70]

/** 占位图形：淡色柱子或虚线折线，放在提示文字后面 */
function Ghost({ type }: { type: string }) {
  if (type === 'line') {
    return (
      <svg
        viewBox="0 0 300 100"
        preserveAspectRatio="none"
        className="esg-ghost absolute inset-x-4 bottom-4 top-6 h-[calc(100%-2.5rem)] w-[calc(100%-2rem)] text-muted-foreground/40"
        aria-hidden
      >
        <path
          d="M0 78 L30 70 L60 74 L90 55 L120 60 L150 42 L180 48 L210 30 L240 36 L270 22 L300 26"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="6 6"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    )
  }
  return (
    <div className="esg-ghost absolute inset-x-4 bottom-4 top-6 flex items-end gap-1.5" aria-hidden>
      {BARS.map((h, i) => (
        <span key={i} className="flex-1 rounded-t-sm bg-muted-foreground/12" style={{ height: `${h}%` }} />
      ))}
    </div>
  )
}

type PlaceholderProps = {
  tone: string
  ghost: string
  shimmer: boolean
  height: string
  message: string
  note: string
  actionLabel: string
  accent: string
  onAction?: () => void
}

function Placeholder({ tone, ghost, shimmer, height, message, note, actionLabel, accent, onAction }: PlaceholderProps) {
  return (
    <div
      className={cn(
        'relative mt-4 flex items-center justify-center overflow-hidden rounded-md border p-4',
        height,
        tone === 'dashed' ? 'border-dashed border-border' : 'border-border bg-muted/50',
        shimmer && 'esg-shimmer',
      )}
    >
      <Ghost type={ghost} />
      <div className="relative text-center">
        <BarChartIcon className="mx-auto size-7 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium text-foreground">{message}</p>
        <p className="text-sm text-muted-foreground">{note}</p>
        {actionLabel ? (
          <button
            type="button"
            onClick={onAction}
            className="mt-6 inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium shadow-sm transition-[filter] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            style={{ background: accent, color: inkFor(accent) }}
          >
            <AddIcon className="-ml-1 size-5 shrink-0" />
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  )
}

const CAPACITY = [
  { name: 'Storage used', capacity: '0/10GB', value: 0 },
  { name: 'Members', capacity: '0/50', value: 0 },
  { name: 'API requests', capacity: '0/100K', value: 0 },
]

/** ProgressCircle 的替代：值为 0 时只有底圈 */
function ProgressCircle({ value, accent, label, children }: { value: number; accent: string; label: string; children: ReactNode }) {
  const r = 22
  const c = 2 * Math.PI * r
  return (
    <div
      className="relative flex size-[52px] shrink-0 items-center justify-center"
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg viewBox="0 0 52 52" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="26" cy="26" r={r} fill="none" strokeWidth="5" className="esg-ghost stroke-muted-foreground/25" />
        <circle
          cx="26"
          cy="26"
          r={r}
          fill="none"
          strokeWidth="5"
          stroke={accent}
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * c} ${c}`}
          opacity={value > 0 ? 1 : 0}
        />
      </svg>
      <div className="relative">{children}</div>
    </div>
  )
}

const TABS = [
  {
    name: 'Ratio',
    categories: [
      { name: 'Successful requests', value: '--' },
      { name: 'Errors', value: '--' },
    ],
  },
  {
    name: 'Projects',
    categories: [
      { name: 'Online shop', value: '--' },
      { name: 'Blog', value: '--' },
      { name: 'Test project', value: '--' },
    ],
  },
]

export function EmptyStateGhostChart({ className, style, onAction, ...props }: EmptyStateGhostChartProps) {
  const { ghostType, accent, shimmer, message, actionLabel, tone } = { ...defaults, ...props }
  const id = useId()
  const [tab, setTab] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const onTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = (tab + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length
    setTab(next)
    tabRefs.current[next]?.focus()
  }

  if (ghostType === 'ring') {
    return (
      <div
        className={cn(
          'w-full overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm sm:mx-auto sm:max-w-lg',
          shimmer && 'esg-shimmer',
          className,
        )}
        style={style}
      >
        <div className="p-6">
          <h3 className="text-sm font-medium text-foreground">Capacity</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {CAPACITY.map((item) => (
              <div key={item.name} className="flex items-center gap-4 sm:flex-col sm:justify-center sm:gap-1.5">
                <ProgressCircle value={item.value} accent={accent} label={item.name}>
                  <span className="text-sm font-medium text-muted-foreground">{item.value}%</span>
                </ProgressCircle>
                <div className="mt-0 text-left sm:mt-2 sm:text-center">
                  <p className="text-sm font-medium text-foreground">{item.capacity}</p>
                  <p className="text-sm text-muted-foreground">{item.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 border-t bg-muted/50 px-6 py-4">
          <h4 className="text-sm font-medium text-foreground">Usage updated hourly</h4>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Monthly usage resets in 4 days.{' '}
            {actionLabel ? (
              <button
                type="button"
                onClick={onAction}
                className="inline-flex items-center gap-1 rounded text-sm font-medium text-foreground underline decoration-2 underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"
                style={{ textDecorationColor: accent }}
              >
                {actionLabel}
                <ExternalLinkIcon className="size-4" />
              </button>
            ) : null}
          </p>
        </div>
      </div>
    )
  }

  if (ghostType === 'tabs') {
    const current = TABS[tab] ?? TABS[0]!
    return (
      <div className={cn('w-full overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm', className)} style={style}>
        <div className="p-6">
          <h3 className="font-medium text-foreground">Requests</h3>
          <p className="mt-1 text-sm/6 text-muted-foreground">
            Request volume and error rate across your projects, refreshed every hour.
          </p>
        </div>
        <div className="border-t p-6">
          <div
            role="tablist"
            aria-label="Requests view"
            className="flex w-full gap-1 rounded-md bg-muted p-1 md:w-60"
            onKeyDown={onTabKey}
          >
            {TABS.map((t, i) => (
              <button
                key={t.name}
                ref={(el) => {
                  tabRefs.current[i] = el
                }}
                type="button"
                role="tab"
                id={`${id}-tab-${i}`}
                aria-selected={i === tab}
                aria-controls={`${id}-panel`}
                tabIndex={i === tab ? 0 : -1}
                onClick={() => setTab(i)}
                className={cn(
                  'w-full rounded px-3 py-1 text-sm font-medium transition-[background-color,color] focus-visible:outline-2 focus-visible:outline-ring',
                  i === tab ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t.name}
              </button>
            ))}
          </div>
          <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${tab}`}>
            <div className="mt-6 flex flex-wrap gap-x-20 gap-y-6">
              {current.categories.map((item) => (
                <div key={item.name}>
                  <div className="flex items-center space-x-2">
                    <span className="size-3 shrink-0 rounded-sm bg-muted-foreground/50" aria-hidden />
                    <p className="font-semibold text-foreground">{item.value}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.name}</p>
                </div>
              ))}
            </div>
            <Placeholder
              tone={tone}
              ghost="bars"
              shimmer={shimmer}
              height="h-64"
              message={message}
              note="May take 24h for data to be shown."
              actionLabel={actionLabel}
              accent={accent}
              onAction={onAction}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn('w-full rounded-lg border bg-card p-6 text-card-foreground shadow-sm sm:mx-auto sm:max-w-lg', className)}
      style={style}
    >
      <h3 className="text-sm text-muted-foreground">Total API requests</h3>
      <p className="text-3xl font-semibold text-foreground">0</p>
      <Placeholder
        tone={tone}
        ghost={ghostType}
        shimmer={shimmer}
        height={actionLabel ? 'h-52' : 'h-44'}
        message={message}
        note={actionLabel ? 'Get started by connecting a database' : 'May take 24 hours for data to load'}
        actionLabel={actionLabel}
        accent={accent}
        onAction={onAction}
      />
    </div>
  )
}
