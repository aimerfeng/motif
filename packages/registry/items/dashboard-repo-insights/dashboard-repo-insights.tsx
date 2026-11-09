// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Tremor Labs, Inc.
// Source: https://github.com/tremorlabs/tremor-blocks/blob/b319e8d/src/content/components/chart-compositions/chart-composition-02.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { motion, useReducedMotion } from 'motion/react'
import { useId, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  repoName: 'northwind/ledger',
  accent: '#6366f1',
  tone: '#10b981',
  range: 'week',
  contributors: 5,
  barStyle: 'bars',
  showSummary: true,
}
/* @motif:end */

export type DashboardRepoInsightsProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

type Range = 'week' | 'month' | 'year'

const RANGES: Record<Range, { label: string; dates: string; scale: number }> = {
  week: { label: 'Last week', dates: 'December 27, 2023 – January 3, 2024', scale: 1 },
  month: { label: 'Last month', dates: 'December 3, 2023 – January 3, 2024', scale: 4 },
  year: { label: 'Last year', dates: 'January 3, 2023 – January 3, 2024', scale: 48 },
}

const ICONS = {
  pr: 'M6 3a3 3 0 0 1 1 5.83v6.34A3 3 0 1 1 5 15.17V8.83A3 3 0 0 1 6 3Zm12 12.17V9a2 2 0 0 0-2-2h-1.59l1.3 1.29-1.42 1.42L10.59 6l3.7-3.71 1.42 1.42L14.41 5H16a4 4 0 0 1 4 4v6.17a3 3 0 1 1-2 0Z',
  merge: 'M7.1 7.9A3 3 0 1 0 5 8.83v6.34a3 3 0 1 0 2 0V11.6A6.98 6.98 0 0 0 12.5 14h2.67a3 3 0 1 0 0-2H12.5A5 5 0 0 1 7.1 7.9Z',
  add: 'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Zm-1-11H7v2h4v4h2v-4h4v-2h-4V7h-2v4Z',
  check: 'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Zm-1-6 7.07-7.07-1.41-1.42L11 13.17 8.17 10.34l-1.41 1.42L11 16Z',
}

const CONTRIBUTORS = [
  { username: 'Mbauchet', contributions: 7 },
  { username: 'Pizuronin', contributions: 4 },
  { username: 'Codetrendy', contributions: 3 },
  { username: 'Devsparkle', contributions: 3 },
  { username: 'Techphantom', contributions: 2 },
]

/** 按亮度挑选深色或浅色文字，保证任何颜色上都看得清。 */
function ink(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return '#ffffff'
  const n = parseInt(m[1], 16)
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.18 ? '#0b0b0f' : '#ffffff'
}

const ease = [0.22, 1, 0.36, 1] as const

/** 分段条：替代上游 CategoryBar。 */
function CategoryBar({ values, colors, run, delay = 0 }: { values: number[]; colors: string[]; run: boolean; delay?: number }) {
  const total = values.reduce((a, b) => a + b, 0) || 1
  return (
    <div className="relative flex h-2 w-full items-center gap-1" aria-hidden>
      {values.map((v, i) => (
        <motion.div
          key={i}
          className={cn('h-full origin-left', i === 0 && 'rounded-l-full', i === values.length - 1 && 'rounded-r-full')}
          style={{ width: `${(v / total) * 100}%`, background: colors[i] }}
          initial={run ? { scaleX: 0 } : false}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, delay: delay + i * 0.12, ease }}
        />
      ))}
    </div>
  )
}

function Strong({ children }: { children: ReactNode }) {
  return <span className="font-medium text-foreground">{children}</span>
}

export function DashboardRepoInsights({ className, style, ...props }: DashboardRepoInsightsProps) {
  const { repoName, accent, tone, range: initialRange, contributors, barStyle, showSummary } = { ...defaults, ...props }
  const count = Math.max(3, Math.min(5, Math.round(contributors)))
  const start: Range = initialRange in RANGES ? (initialRange as Range) : 'week'

  const [picked, setPicked] = useState<{ from: Range; value: Range } | null>(null)
  const range = picked && picked.from === start ? picked.value : start
  const reduced = useReducedMotion()
  const run = !reduced
  const selectId = useId()
  const k = RANGES[range].scale

  const data = [
    { name: 'Open PRs', value: 4 * k, icon: ICONS.pr, color: accent },
    { name: 'Merged PRs', value: 8 * k, icon: ICONS.merge, color: tone },
    { name: 'Open Issues', value: 8 * k, icon: ICONS.add, color: accent },
    { name: 'Closed Issues', value: 92 * k, icon: ICONS.check, color: tone },
  ]
  const top = CONTRIBUTORS.slice(0, count).map((c) => ({ ...c, contributions: c.contributions * k }))
  const max = Math.max(...top.map((c) => c.contributions))
  const sum = top.reduce((a, c) => a + c.contributions, 0)
  const opacity = (i: number) => 1 - i * 0.17
  const avatarInk = ink(tone)

  return (
    <div className={cn('text-foreground', className)} style={style}>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="truncate font-mono text-xs text-muted-foreground">{repoName}</p>
          <h3 className="mt-1 text-sm font-medium text-foreground">{RANGES[range].dates}</h3>
        </div>
        <div className="relative mt-4 sm:mt-0 sm:w-40">
          <label htmlFor={selectId} className="sr-only">
            Select period
          </label>
          <select
            id={selectId}
            value={range}
            onChange={(e) => setPicked({ from: start, value: e.target.value as Range })}
            className="h-9 w-full appearance-none rounded-md border bg-background pr-8 pl-3 text-sm text-foreground shadow-xs outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            {(Object.keys(RANGES) as Range[]).map((r) => (
              <option key={r} value={r}>
                {RANGES[r].label}
              </option>
            ))}
          </select>
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>
      <div className="my-6 h-px w-full bg-border" />
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="border-b bg-muted/40 px-6 py-4">
          <h3 className="text-sm font-medium text-foreground">Overview</h3>
        </div>
        <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
          <div>
            <CategoryBar values={[4, 8]} colors={[accent, tone]} run={run} />
            <p className="mt-2 text-sm text-foreground">
              <span className="font-semibold tabular-nums">{4 * k}</span> Active Pull Requests
            </p>
          </div>
          <div>
            <CategoryBar values={[8, 92]} colors={[accent, tone]} run={run} delay={0.15} />
            <p className="mt-2 text-sm text-foreground">
              <span className="font-semibold tabular-nums">{8 * k}</span> Active Issues
            </p>
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-px border-t bg-border md:grid-cols-4">
          {data.map((item) => (
            <li key={item.name} className="flex flex-col items-center justify-center bg-card p-3">
              <div className="flex items-center space-x-1">
                <svg viewBox="0 0 24 24" className="size-5" fill={item.color} aria-hidden>
                  <path d={item.icon} />
                </svg>
                <span className="font-semibold text-foreground tabular-nums">{item.value.toLocaleString('en-US')}</span>
              </div>
              <span className="text-sm text-foreground">{item.name}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="my-10 flex items-center gap-3 text-sm text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        More info
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className={cn('grid grid-cols-1 gap-10', showSummary && 'md:grid-cols-2')}>
        {showSummary && (
          <div>
            <h4 className="font-semibold text-foreground">Repository Summary</h4>
            <p className="mt-4 text-sm/6 text-muted-foreground">
              Excluding merges, <Strong>{Math.min(count, 2 + Math.floor(k / 4))} authors</Strong> have pushed <Strong>{2 * k} commits</Strong> to main and{' '}
              <Strong>{(19 * k).toLocaleString('en-US')} commits</Strong> to all branches. On main, <Strong>{12 * k} files</Strong> have changed and there have been{' '}
              <Strong>{(38 * k).toLocaleString('en-US')} additions</Strong> and <Strong>{(9 * k).toLocaleString('en-US')} deletions</Strong>.
            </p>
          </div>
        )}
        <div>
          <h4 className="font-semibold text-foreground">Top contributors</h4>
          {barStyle === 'share' ? (
            <div className="mt-4">
              <div className="flex h-3 w-full gap-1" role="img" aria-label={top.map((c) => `${c.username} ${c.contributions}`).join(', ')}>
                {top.map((c, i) => (
                  <motion.div
                    key={c.username}
                    className={cn('h-full origin-left', i === 0 && 'rounded-l-full', i === top.length - 1 && 'rounded-r-full')}
                    style={{ width: `${(c.contributions / sum) * 100}%`, background: tone, opacity: opacity(i) }}
                    initial={run ? { scaleX: 0 } : false}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.08, ease }}
                  />
                ))}
              </div>
              <ul className="mt-4 space-y-2.5">
                {top.map((c, i) => (
                  <li key={c.username} className="flex items-center gap-3 text-sm">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold" style={{ background: tone, color: avatarInk, opacity: 0.6 + opacity(i) * 0.4 }} aria-hidden>
                      {c.username[0]}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-foreground">{c.username}</span>
                    <span className="text-muted-foreground tabular-nums">{Math.round((c.contributions / sum) * 100)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ul className="mt-4 flex h-48 flex-col justify-around" aria-label="Contributions per user">
              {top.map((c, i) => (
                <li key={c.username} className="flex items-center gap-3 text-xs">
                  <span className="w-[85px] shrink-0 truncate text-right text-muted-foreground">{c.username}</span>
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <motion.div
                      className="h-6 origin-left rounded-r"
                      style={{ width: `${(c.contributions / max) * 85}%`, background: tone }}
                      initial={run ? { scaleX: 0 } : false}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: 0.25 + i * 0.08, ease }}
                    />
                    <span className="text-muted-foreground tabular-nums">{c.contributions}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
