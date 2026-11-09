// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Tremor Labs, Inc.
// Source: https://github.com/tremorlabs/tremor-blocks/blob/b319e8d/src/content/components/tables/table-11.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import type { CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  hue: '#3b82f6',
  weeks: 10,
  cellRadius: 4,
  cellGap: 2,
  showCounts: true,
  stickyColumn: true,
}
/* @motif:end */

const valueFormatter = (number: number) => `${Intl.NumberFormat('en-US').format(number).toString()}`

export interface WeekData {
  percentage: number
  count: number
}

export interface CohortData {
  size: number
  dates: {
    start: string
    end: string
  }
  weeks: (WeekData | null)[]
}

export type CohortRetentionData = Record<string, CohortData>

export const cohorts: CohortRetentionData = {
  'Sep 15, 2023': {
    size: 2157,
    dates: { start: '2023-09-15T00:00:00.000Z', end: '2023-09-22T00:00:00.000Z' },
    weeks: [
      { percentage: 100, count: 2157 },
      { percentage: 69.2, count: 1492 },
      { percentage: 49.3, count: 1063 },
      { percentage: 44.6, count: 962 },
      { percentage: 28.8, count: 621 },
      { percentage: 23.9, count: 515 },
      { percentage: 19.3, count: 416 },
      { percentage: 12.6, count: 271 },
      { percentage: 9.6, count: 207 },
      { percentage: 8.2, count: 176 },
    ],
  },
  'Sep 22, 2023': {
    size: 2584,
    dates: { start: '2023-09-22T00:00:00.000Z', end: '2023-09-29T00:00:00.000Z' },
    weeks: [
      { percentage: 100, count: 2584 },
      { percentage: 62.2, count: 1607 },
      { percentage: 51.9, count: 1341 },
      { percentage: 46.4, count: 1198 },
      { percentage: 29.1, count: 751 },
      { percentage: 29.4, count: 759 },
      { percentage: 18.5, count: 478 },
      { percentage: 15.5, count: 400 },
      { percentage: 15.8, count: 408 },
      null,
    ],
  },
  'Sep 29, 2023': {
    size: 2873,
    dates: { start: '2023-09-29T00:00:00.000Z', end: '2023-10-06T00:00:00.000Z' },
    weeks: [
      { percentage: 100, count: 2873 },
      { percentage: 63.5, count: 1824 },
      { percentage: 54.9, count: 1577 },
      { percentage: 46.3, count: 1330 },
      { percentage: 32.2, count: 925 },
      { percentage: 27.5, count: 790 },
      { percentage: 26.1, count: 749 },
      { percentage: 15.4, count: 442 },
      null,
      null,
    ],
  },
  'Oct 6, 2023': {
    size: 2882,
    dates: { start: '2023-10-06T00:00:00.000Z', end: '2023-10-13T00:00:00.000Z' },
    weeks: [
      { percentage: 100, count: 2882 },
      { percentage: 61.8, count: 1781 },
      { percentage: 55, count: 1585 },
      { percentage: 39.6, count: 1141 },
      { percentage: 32.4, count: 933 },
      { percentage: 22.1, count: 636 },
      { percentage: 19.4, count: 559 },
      null,
      null,
      null,
    ],
  },
  'Oct 13, 2023': {
    size: 2925,
    dates: { start: '2023-10-13T00:00:00.000Z', end: '2023-10-20T00:00:00.000Z' },
    weeks: [
      { percentage: 100, count: 2925 },
      { percentage: 65.6, count: 1918 },
      { percentage: 56.7, count: 1658 },
      { percentage: 45.2, count: 1322 },
      { percentage: 32.2, count: 941 },
      { percentage: 28, count: 819 },
      null,
      null,
      null,
      null,
    ],
  },
  'Oct 20, 2023': {
    size: 2066,
    dates: { start: '2023-10-20T00:00:00.000Z', end: '2023-10-27T00:00:00.000Z' },
    weeks: [
      { percentage: 100, count: 2066 },
      { percentage: 67.9, count: 1402 },
      { percentage: 55.4, count: 1144 },
      { percentage: 37.6, count: 776 },
      { percentage: 29.7, count: 613 },
      null,
      null,
      null,
      null,
      null,
    ],
  },
  'Oct 27, 2023': {
    size: 2302,
    dates: { start: '2023-10-27T00:00:00.000Z', end: '2023-11-03T00:00:00.000Z' },
    weeks: [
      { percentage: 100, count: 2302 },
      { percentage: 64.5, count: 1484 },
      { percentage: 48.8, count: 1123 },
      { percentage: 46.1, count: 1061 },
      null,
      null,
      null,
      null,
      null,
      null,
    ],
  },
  'Nov 3, 2023': {
    size: 2361,
    dates: { start: '2023-11-03T00:00:00.000Z', end: '2023-11-10T00:00:00.000Z' },
    weeks: [
      { percentage: 100, count: 2361 },
      { percentage: 66.9, count: 1579 },
      { percentage: 51, count: 1204 },
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ],
  },
  'Nov 10, 2023': {
    size: 2729,
    dates: { start: '2023-11-10T00:00:00.000Z', end: '2023-11-17T00:00:00.000Z' },
    weeks: [
      { percentage: 100, count: 2729 },
      { percentage: 69.9, count: 1907 },
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ],
  },
  'Nov 17, 2023': {
    size: 2905,
    dates: { start: '2023-11-17T00:00:00.000Z', end: '2023-11-24T00:00:00.000Z' },
    weeks: [
      { percentage: 100, count: 2905 },
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ],
  },
}

/** Upstream: bg-blue-50 … bg-blue-600 (seven steps). Here: the hue mixed into the page background. */
const colorSteps = [10, 20, 32, 46, 62, 80, 100]

const getBackgroundColor = (value: number, minValue: number, maxValue: number, hue: string) => {
  const normalizedValue = (value - minValue) / (maxValue - minValue)
  const index = Math.min(Math.floor(normalizedValue * colorSteps.length), colorSteps.length - 1)
  return `color-mix(in oklab, ${hue} ${colorSteps[index]}%, var(--background))`
}

/** Light or dark ink, picked from the cell's own lightness so every hue and theme stays readable. */
const textColor = 'oklch(from var(--cell) clamp(0.16, calc((0.68 - l) * 1000), 0.99) 0 0)'

export type TableCohortRetentionProps = Partial<typeof defaults> & {
  data?: CohortRetentionData
  title?: string
  description?: string
  className?: string
  style?: CSSProperties
}

export function TableCohortRetention({
  data = cohorts,
  title = 'Cohort Retention',
  description = 'Track customer engagement patterns and analyze support trends across user segments',
  className,
  style,
  ...props
}: TableCohortRetentionProps) {
  const options = { ...defaults, ...props }
  const cohortEntries = Object.entries(data)
  const weeksCount = Math.min(cohortEntries[0]?.[1].weeks.length ?? 0, options.weeks)
  const weeks = Array.from({ length: weeksCount }, (_, i) => i)
  const radius = `${options.cellRadius}px`
  const cellHeight = options.showCounts ? 64 : 44
  const stickyClass = options.stickyColumn ? 'sticky left-0 z-10' : ''

  return (
    <div className={cn('text-foreground', className)} style={style}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          <p className="text-muted-foreground sm:text-sm/6">{description}</p>
        </div>
      </div>
      <hr className="my-6 border-border" />
      <section className="mt-8">
        <div
          data-cohort-scroll=""
          role="region"
          aria-label={`${title} table`}
          tabIndex={0}
          className="w-full overflow-auto rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <table className="w-full caption-bottom border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th scope="col" className={cn(stickyClass, 'top-0 min-w-40 bg-background p-px pb-3 text-left font-semibold')}>
                  <span className="block">Cohort</span>
                  <span className="block font-normal text-muted-foreground">Initial customers</span>
                </th>
                {weeks.map((week) => (
                  <th key={week} scope="col" className="whitespace-nowrap px-4 pb-3 text-left font-medium">
                    Week {week}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cohortEntries.map(([cohortKey, cohortData]) => (
                <tr key={cohortKey} className="h-full">
                  <th scope="row" className={cn(stickyClass, 'h-full bg-background p-0 pr-4 text-left sm:min-w-56')}>
                    <span className="block whitespace-nowrap text-sm font-medium text-foreground">{cohortKey}</span>
                    <span className="mt-0.5 block whitespace-nowrap text-sm font-normal text-muted-foreground">
                      {valueFormatter(cohortData.size)} customers
                    </span>
                  </th>
                  {cohortData.weeks.slice(0, weeksCount).map((weekData, weekIndex) => (
                    <td key={weekIndex} className="h-full min-w-24" style={{ padding: options.cellGap }}>
                      {weekData === null ? (
                        <div
                          aria-label="No data yet"
                          className="flex flex-col justify-center border border-dashed border-border bg-muted/50 px-3.5 py-3"
                          style={{ height: cellHeight, borderRadius: radius }}
                        >
                          <span className="h-3 w-9 rounded-sm bg-muted" />
                          {options.showCounts && <span className="mt-1 h-3 w-6 rounded-sm bg-muted" />}
                        </div>
                      ) : (
                        <div
                          className="flex h-full flex-col justify-center px-3.5 py-3"
                          style={
                            {
                              '--cell': getBackgroundColor(weekData.percentage, 0, 100, options.hue),
                              background: 'var(--cell)',
                              color: textColor,
                              borderRadius: radius,
                              minHeight: cellHeight,
                            } as CSSProperties
                          }
                        >
                          <span className="block text-sm font-medium">{weekData.percentage.toFixed(1)}%</span>
                          {options.showCounts && (
                            <span className="mt-0.5 block text-sm opacity-80">{valueFormatter(weekData.count)}</span>
                          )}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
