// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Tremor Labs, Inc.
// Source: https://github.com/tremorlabs/tremor-blocks/blob/b319e8d/src/content/components/kpi-cards/kpi-card-25.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { motion, useReducedMotion } from 'motion/react'
import { useId, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  layout: 'cards',
  palette: ['#3b82f6', '#6b7280', '#ef4444', '#f59e0b'],
  segmentGap: 2,
  radius: 4,
  legendStyle: 'stacked',
  showMarker: true,
  markerValue: 80,
  animateIn: true,
}
/* @motif:end */

export interface KpiSegment {
  name: string
  value: number
  /** Optional formatted value shown in the inline legend / channel cards (e.g. "$100.5K"). */
  display?: string
}

export interface KpiGroup {
  name: string
  total: string
  segments: readonly KpiSegment[]
  /** Tooltip text for the target marker. */
  markerLabel?: string
}

export interface KpiSummary {
  title: string
  total: string
  subtitle: string
  segments: readonly KpiSegment[]
  markerLabel?: string
}

export type KpiCategoryBarProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  groups?: readonly KpiGroup[]
  summary?: KpiSummary
}

const CARD = 'relative w-full rounded-lg border border-border bg-card p-6 text-left shadow-xs'

const sumNumericArray = (arr: readonly number[]) => arr.reduce((prefixSum, num) => prefixSum + num, 0)

const getPositionLeft = (value: number | undefined, maxValue: number): number => (value && maxValue ? (value / maxValue) * 100 : 0)

function getMarkerColor(marker: number, values: readonly number[], colors: readonly string[]): string {
  const color = (i: number) => colors[i % colors.length]
  if (marker === 0) {
    for (let index = 0; index < values.length; index++) {
      if (values[index] > 0) return color(index)
    }
  }
  let prefixSum = 0
  for (let index = 0; index < values.length; index++) {
    prefixSum += values[index]
    if (prefixSum >= marker) return color(index)
  }
  return color(values.length - 1)
}

const formatShare = (value: number, max: number) => `${max ? Math.round((value / max) * 1000) / 10 : 0}%`

interface CategoryBarProps {
  values: readonly number[]
  colors: readonly string[]
  gap: number
  radius: number
  marker?: { value: number; tooltip?: string }
  animateIn: boolean
  className?: string
}

function CategoryBar({ values, colors, gap, radius, marker, animateIn, className }: CategoryBarProps) {
  const reduce = useReducedMotion()
  const tooltipId = useId()
  const [open, setOpen] = useState(false)
  const maxValue = sumNumericArray(values)
  // marker.value is a percentage of the bar (0–100)
  const markerAbsolute = marker ? (Math.max(0, Math.min(100, marker.value)) / 100) * maxValue : undefined
  const markerPositionLeft = getPositionLeft(markerAbsolute, maxValue)
  const markerColor = marker ? getMarkerColor(markerAbsolute ?? 0, values, colors) : undefined
  const reveal = animateIn && !reduce

  return (
    <div className={cn(className)} role="group" aria-label={values.map((v) => formatShare(v, maxValue)).join(', ') + (marker ? `, target ${Math.round(marker.value)}%` : '')}>
      <div className="relative flex h-2 w-full items-center">
        <motion.div
          className="flex h-full flex-1 items-center overflow-hidden"
          style={{ gap, borderRadius: radius }}
          initial={reveal ? { clipPath: 'inset(0 100% 0 0)' } : false}
          animate={{ clipPath: 'inset(0 0% 0 0)' }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {values.map((value, index) => {
            const percentage = maxValue ? (value / maxValue) * 100 : 0
            return (
              <div
                key={`item-${index}`}
                className={cn('h-full', percentage === 0 && 'hidden')}
                style={{ width: `${percentage}%`, backgroundColor: colors[index % colors.length] }}
              />
            )
          })}
        </motion.div>

        {marker !== undefined ? (
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-full transition-transform duration-300 ease-in-out motion-reduce:transition-none"
            style={{ transform: `translateX(${markerPositionLeft}%)` }}
          >
            <div className="absolute top-1/2 left-0 w-2 -translate-x-1/2 -translate-y-1/2">
              <button
                type="button"
                aria-label={marker.tooltip ?? `Target ${Math.round(marker.value)}%`}
                aria-describedby={open && marker.tooltip ? tooltipId : undefined}
                className="pointer-events-auto relative mx-auto block h-4 w-1 rounded-full ring-2 ring-card outline-none focus-visible:ring-ring"
                style={{ backgroundColor: markerColor }}
                onPointerEnter={() => setOpen(true)}
                onPointerLeave={() => setOpen(false)}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
              >
                <span aria-hidden="true" className="absolute size-7 -translate-x-[45%] -translate-y-[15%]" />
              </button>
              {marker.tooltip && open ? (
                <span
                  id={tooltipId}
                  role="tooltip"
                  className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-md bg-foreground px-2.5 py-1.5 text-xs whitespace-nowrap text-background shadow-md"
                >
                  {marker.tooltip}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function ArrowRightUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden="true">
      <path d="M16.004 9.414l-8.607 8.607-1.414-1.414L14.589 8H7.004V6h11v11h-2V9.414z" />
    </svg>
  )
}

const DEFAULT_GROUPS: readonly KpiGroup[] = [
  {
    name: 'Current Tickets',
    total: '247',
    markerLabel: 'SLA target: 80% resolved',
    segments: [
      { name: 'Resolved', value: 82 },
      { name: 'Progress', value: 13 },
      { name: 'Escalated', value: 5 },
    ],
  },
  {
    name: 'Database Queries',
    total: '44,757',
    markerLabel: 'Goal: 80% optimized',
    segments: [
      { name: 'Optimized', value: 57 },
      { name: 'Editing', value: 12 },
      { name: 'Slow', value: 31 },
    ],
  },
  {
    name: 'Query Latency',
    total: '1,247ms',
    markerLabel: 'Budget: 80% fast',
    segments: [
      { name: 'Fast', value: 75 },
      { name: 'Medium', value: 20 },
      { name: 'Slow', value: 5 },
    ],
  },
]

const DEFAULT_SUMMARY: KpiSummary = {
  title: 'Total sales',
  total: '$292,400',
  subtitle: 'Sales channel distribution',
  markerLabel: 'Direct + retail target: 80%',
  segments: [
    { name: 'Direct sales', value: 34.4, display: '$100.5K' },
    { name: 'Retail stores', value: 30.6, display: '$89.5K' },
    { name: 'E-commerce', value: 20.9, display: '$61.2K' },
    { name: 'Wholesale', value: 14.1, display: '$41.2K' },
  ],
}

export function KpiCategoryBar({ className, style, groups, summary, ...props }: KpiCategoryBarProps) {
  const options = { ...defaults, ...props }
  const colors = options.palette.length ? options.palette : defaults.palette
  const gap = Math.max(0, Math.min(6, options.segmentGap))
  const radius = Math.max(0, Math.min(4, options.radius))
  const bar = (segments: readonly KpiSegment[], tooltip: string | undefined, cls: string) => (
    <CategoryBar
      values={segments.map((s) => s.value)}
      colors={colors}
      gap={gap}
      radius={radius}
      marker={options.showMarker ? { value: options.markerValue, tooltip } : undefined}
      animateIn={options.animateIn}
      className={cls}
    />
  )

  if (options.layout === 'summary') {
    const data = summary ?? DEFAULT_SUMMARY
    const max = sumNumericArray(data.segments.map((s) => s.value))
    return (
      <div className={cn('sm:mx-auto sm:max-w-2xl', className)} style={style}>
        <h3 className="text-sm text-muted-foreground">{data.title}</h3>
        <p className="text-3xl font-semibold text-foreground tabular-nums">{data.total}</p>
        <h4 className="mt-4 text-sm text-muted-foreground">{data.subtitle}</h4>
        {bar(data.segments, data.markerLabel, 'mt-4')}
        <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {data.segments.map((item, index) => (
            <div key={item.name} className={cn(CARD, 'group rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-ring')}>
              <div className="flex items-center space-x-2">
                <span className="size-2.5 rounded-sm" style={{ backgroundColor: colors[index % colors.length] }} aria-hidden="true" />
                <dt className="text-sm text-muted-foreground">
                  <a href="#" className="focus:outline-none" onClick={(e) => e.preventDefault()}>
                    {/* Extend link to entire card */}
                    <span className="absolute inset-0" aria-hidden="true" />
                    {item.name}
                  </a>
                </dt>
              </div>
              <dd className="mt-1 text-sm text-foreground tabular-nums">
                <span className="font-semibold">{formatShare(item.value, max)}</span> &#8729; {item.display ?? item.value}
              </dd>
              <span className="pointer-events-none absolute top-2 right-2 text-muted-foreground/60 group-hover:text-muted-foreground" aria-hidden="true">
                <ArrowRightUpIcon />
              </span>
            </div>
          ))}
        </dl>
      </div>
    )
  }

  return (
    <dl className={cn('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3', className)} style={style}>
      {(groups ?? DEFAULT_GROUPS).map((item) => {
        const max = sumNumericArray(item.segments.map((s) => s.value))
        return (
          <div key={item.name} className={CARD}>
            <dt className="truncate text-sm font-medium text-foreground">{item.name}</dt>
            <dd className="mt-1 text-3xl font-semibold text-foreground tabular-nums">{item.total}</dd>
            <dd>
              {bar(item.segments, item.markerLabel, 'mt-6')}
              {options.legendStyle === 'inline' ? (
                <ul role="list" className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                  {item.segments.map((category, index) => (
                    <li key={category.name} className="flex items-center space-x-2">
                      <span className="size-3 shrink-0 rounded-sm" style={{ backgroundColor: colors[index % colors.length] }} aria-hidden="true" />
                      <span className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground tabular-nums">{category.display ?? formatShare(category.value, max)}</span> {category.name}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul role="list" className="mt-4 flex flex-wrap gap-x-8 gap-y-4 text-sm">
                  {item.segments.map((category, index) => (
                    <li key={category.name}>
                      <span className="text-base font-semibold text-foreground tabular-nums">{formatShare(category.value, max)}</span>
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: colors[index % colors.length] }} aria-hidden="true" />
                        <span className="text-sm text-foreground">{category.name}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </dd>
          </div>
        )
      })}
    </dl>
  )
}
