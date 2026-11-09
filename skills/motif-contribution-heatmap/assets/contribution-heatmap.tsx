// SPDX-License-Identifier: MIT
// Copyright (c) 2023 — Present shadcnblocks
// Source: https://github.com/shadcnblocks/kibo/blob/3d63cdb/packages/contribution-graph/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { motion, useReducedMotion } from 'motion/react'
import {
  type CSSProperties,
  createContext,
  Fragment,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react'

/* @motif:defaults */
export const defaults = {
  palette: ['#0e4429', '#39d353'],
  levels: 4,
  blockSize: 12,
  blockGap: 4,
  radius: 2,
  weekStart: 'sunday',
  showLegend: true,
  seed: 7,
}
/* @motif:end */

export type Activity = {
  date: string
  count: number
  level: number
}

type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6

type Week = Array<Activity | undefined>

export type Labels = {
  months?: string[]
  weekdays?: string[]
  totalCount?: string
  legend?: {
    less?: string
    more?: string
  }
}

type MonthLabel = {
  weekIndex: number
  label: string
}

const DEFAULT_MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const DEFAULT_LABELS: Labels = {
  months: DEFAULT_MONTH_LABELS,
  weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  totalCount: '{{count}} activities in {{year}}',
  legend: {
    less: 'Less',
    more: 'More',
  },
}

/* Small UTC date helpers replacing date-fns. Dates are ISO "YYYY-MM-DD" strings. */
const DAY_MS = 86_400_000
const parseISO = (date: string) => {
  const [y, m, d] = date.split('-').map(Number)
  return Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}
const formatISO = (ms: number) => new Date(ms).toISOString().slice(0, 10)
const getDay = (ms: number) => new Date(ms).getUTCDay()
const getMonth = (ms: number) => new Date(ms).getUTCMonth()
const getYear = (ms: number) => new Date(ms).getUTCFullYear()

type ContributionGraphContextType = {
  data: Activity[]
  weeks: Week[]
  blockMargin: number
  blockRadius: number
  blockSize: number
  fontSize: number
  labels: Labels
  labelHeight: number
  maxLevel: number
  totalCount: number
  weekStart: WeekDay
  year: number
  width: number
  height: number
}

const ContributionGraphContext = createContext<ContributionGraphContextType | null>(null)

const useContributionGraph = () => {
  const context = useContext(ContributionGraphContext)

  if (!context) {
    throw new Error('ContributionGraph components must be used within a ContributionGraph')
  }

  return context
}

const fillHoles = (activities: Activity[]): Activity[] => {
  if (activities.length === 0) {
    return []
  }

  // Sort activities by date to ensure correct date range
  const sortedActivities = [...activities].sort((a, b) => a.date.localeCompare(b.date))

  const calendar = new Map<string, Activity>(activities.map((a) => [a.date, a]))

  const firstActivity = sortedActivities[0] as Activity
  const lastActivity = sortedActivities.at(-1)

  if (!lastActivity) {
    return []
  }

  const result: Activity[] = []
  const end = parseISO(lastActivity.date)
  for (let day = parseISO(firstActivity.date); day <= end; day += DAY_MS) {
    const date = formatISO(day)
    result.push(calendar.get(date) ?? { date, count: 0, level: 0 })
  }
  return result
}

const groupByWeeks = (activities: Activity[], weekStart: WeekDay = 0): Week[] => {
  if (activities.length === 0) {
    return []
  }

  const normalizedActivities = fillHoles(activities)
  const firstActivity = normalizedActivities[0] as Activity
  const firstDate = parseISO(firstActivity.date)
  const padding = (getDay(firstDate) - weekStart + 7) % 7

  const paddedActivities = [...(new Array(padding).fill(undefined) as Activity[]), ...normalizedActivities]

  const numberOfWeeks = Math.ceil(paddedActivities.length / 7)

  return new Array(numberOfWeeks).fill(undefined).map((_, weekIndex) => paddedActivities.slice(weekIndex * 7, weekIndex * 7 + 7))
}

const getMonthLabels = (weeks: Week[], monthNames: string[] = DEFAULT_MONTH_LABELS): MonthLabel[] => {
  return weeks
    .reduce<MonthLabel[]>((labels, week, weekIndex) => {
      const firstActivity = week.find((activity) => activity !== undefined)

      if (!firstActivity) {
        return labels
      }

      const month = monthNames[getMonth(parseISO(firstActivity.date))] ?? ''

      const prevLabel = labels.at(-1)

      if (weekIndex === 0 || !prevLabel || prevLabel.label !== month) {
        return labels.concat({ weekIndex, label: month })
      }

      return labels
    }, [])
    .filter(({ weekIndex }, index, labels) => {
      const minWeeks = 3

      if (index === 0) {
        return Boolean(labels[1] && labels[1].weekIndex - weekIndex >= minWeeks)
      }

      if (index === labels.length - 1) {
        return weeks.slice(weekIndex).length >= minWeeks
      }

      return true
    })
}

/** Fill for a level: level 0 uses the muted token, the rest ramp between the palette's two ends. */
const levelFill = (level: number) => (level === 0 ? 'var(--muted)' : `var(--cg-level-${level})`)

export type ContributionGraphProps = HTMLAttributes<HTMLDivElement> & {
  data: Activity[]
  blockMargin?: number
  blockRadius?: number
  blockSize?: number
  fontSize?: number
  labels?: Labels
  maxLevel?: number
  /** Motif: [lowest level, highest level] colors. */
  palette?: string[]
  style?: CSSProperties
  totalCount?: number
  weekStart?: WeekDay
  children: ReactNode
  className?: string
}

export const ContributionGraph = ({
  data,
  blockMargin = 4,
  blockRadius = 2,
  blockSize = 12,
  fontSize = 14,
  labels: labelsProp = undefined,
  maxLevel: maxLevelProp = 4,
  palette = defaults.palette,
  style = {},
  totalCount: totalCountProp = undefined,
  weekStart = 0,
  className,
  ...props
}: ContributionGraphProps) => {
  const maxLevel = Math.max(1, maxLevelProp)
  const weeks = useMemo(() => groupByWeeks(data, weekStart), [data, weekStart])
  const LABEL_MARGIN = 8

  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const labelHeight = fontSize + LABEL_MARGIN

  const year = data.length > 0 ? getYear(parseISO(data[0]!.date)) : new Date().getFullYear()

  const totalCount = typeof totalCountProp === 'number' ? totalCountProp : data.reduce((sum, activity) => sum + activity.count, 0)

  const width = weeks.length * (blockSize + blockMargin) - blockMargin
  const height = labelHeight + (blockSize + blockMargin) * 7 - blockMargin

  const low = palette[0] ?? defaults.palette[0]
  const high = palette.at(-1) ?? defaults.palette[1]
  const levelVars: Record<string, string> = {}
  for (let level = 1; level <= maxLevel; level++) {
    const t = maxLevel === 1 ? 100 : Math.round(((level - 1) / (maxLevel - 1)) * 100)
    levelVars[`--cg-level-${level}`] = `color-mix(in oklab, ${high} ${t}%, ${low})`
  }

  if (data.length === 0) {
    return null
  }

  return (
    <ContributionGraphContext.Provider
      value={{
        data,
        weeks,
        blockMargin,
        blockRadius,
        blockSize,
        fontSize,
        labels,
        labelHeight,
        maxLevel,
        totalCount,
        weekStart,
        year,
        width,
        height,
      }}
    >
      <div className={cn('flex w-max max-w-full flex-col gap-2', className)} style={{ fontSize, ...levelVars, ...style } as CSSProperties} {...props} />
    </ContributionGraphContext.Provider>
  )
}

export type ContributionGraphBlockProps = {
  activity: Activity
  dayIndex: number
  weekIndex: number
  /** Motif: ripple the block in on mount (delay grows with week + weekday). */
  animate?: boolean
  active?: boolean
  className?: string
}

export const ContributionGraphBlock = ({ activity, dayIndex, weekIndex, animate = true, active = false, className }: ContributionGraphBlockProps) => {
  const { blockSize, blockMargin, blockRadius, labelHeight, maxLevel } = useContributionGraph()
  const reduced = useReducedMotion()
  const level = Math.min(Math.max(activity.level, 0), maxLevel)
  const ripple = animate && !reduced

  return (
    <motion.rect
      className={cn('stroke-foreground transition-[stroke-width] duration-150', className)}
      data-count={activity.count}
      data-date={activity.date}
      data-level={level}
      height={blockSize}
      rx={blockRadius}
      ry={blockRadius}
      width={blockSize}
      x={(blockSize + blockMargin) * weekIndex}
      y={labelHeight + (blockSize + blockMargin) * dayIndex}
      style={{ fill: levelFill(level), strokeWidth: active ? 1.5 : 0, transformBox: 'fill-box', transformOrigin: 'center' }}
      initial={ripple ? { opacity: 0, scale: 0.3 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={ripple ? { type: 'spring', visualDuration: 0.4, bounce: 0.35, delay: (weekIndex + dayIndex) * 0.018 } : { duration: 0 }}
    />
  )
}

export type ContributionGraphCalendarProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  hideMonthLabels?: boolean
  className?: string
  /** Motif: overlay drawn inside the scroll area, positioned in SVG coordinates (tooltip). */
  overlay?: ReactNode
  svgProps?: HTMLAttributes<SVGSVGElement> & { tabIndex?: number }
  children: (props: { activity: Activity; dayIndex: number; weekIndex: number }) => ReactNode
}

export const ContributionGraphCalendar = ({ hideMonthLabels = false, className, overlay, svgProps, children, ...props }: ContributionGraphCalendarProps) => {
  const { weeks, width, height, blockSize, blockMargin, labels } = useContributionGraph()

  const monthLabels = useMemo(() => getMonthLabels(weeks, labels.months), [weeks, labels.months])

  return (
    <div className={cn('relative max-w-full overflow-x-auto overflow-y-hidden', className)} {...props}>
      <svg className="block overflow-visible rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" height={height} viewBox={`0 0 ${width} ${height}`} width={width} {...svgProps}>
        <title>Contribution Graph</title>
        {!hideMonthLabels && (
          <g className="fill-current">
            {monthLabels.map(({ label, weekIndex }) => (
              <text dominantBaseline="hanging" key={weekIndex} x={(blockSize + blockMargin) * weekIndex}>
                {label}
              </text>
            ))}
          </g>
        )}
        {weeks.map((week, weekIndex) =>
          week.map((activity, dayIndex) => {
            if (!activity) {
              return null
            }

            return <Fragment key={`${weekIndex}-${dayIndex}`}>{children({ activity, dayIndex, weekIndex })}</Fragment>
          }),
        )}
      </svg>
      {overlay}
    </div>
  )
}

export type ContributionGraphFooterProps = HTMLAttributes<HTMLDivElement>

export const ContributionGraphFooter = ({ className, ...props }: ContributionGraphFooterProps) => (
  <div className={cn('flex flex-wrap gap-1 whitespace-nowrap sm:gap-x-4', className)} {...props} />
)

export type ContributionGraphTotalCountProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  children?: (props: { totalCount: number; year: number }) => ReactNode
}

export const ContributionGraphTotalCount = ({ className, children, ...props }: ContributionGraphTotalCountProps) => {
  const { totalCount, year, labels } = useContributionGraph()

  if (children) {
    return <>{children({ totalCount, year })}</>
  }

  return (
    <div className={cn('text-muted-foreground', className)} {...props}>
      {labels.totalCount
        ? labels.totalCount.replace('{{count}}', String(totalCount)).replace('{{year}}', String(year))
        : `${totalCount} activities in ${year}`}
    </div>
  )
}

export type ContributionGraphLegendProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  children?: (props: { level: number }) => ReactNode
}

export const ContributionGraphLegend = ({ className, children, ...props }: ContributionGraphLegendProps) => {
  const { labels, maxLevel, blockSize, blockRadius } = useContributionGraph()

  return (
    <div className={cn('ml-auto flex items-center gap-[3px]', className)} {...props}>
      <span className="mr-1 text-muted-foreground">{labels.legend?.less || 'Less'}</span>
      {new Array(maxLevel + 1).fill(undefined).map((_, level) =>
        children ? (
          <Fragment key={level}>{children({ level })}</Fragment>
        ) : (
          <svg height={blockSize} key={level} width={blockSize}>
            <title>{`${level} contributions`}</title>
            <rect className="stroke-border stroke-[1px]" style={{ fill: levelFill(level) }} data-level={level} height={blockSize} rx={blockRadius} ry={blockRadius} width={blockSize} />
          </svg>
        ),
      )}
      <span className="ml-1 text-muted-foreground">{labels.legend?.more || 'More'}</span>
    </div>
  )
}

/* ---------- Motif: seeded sample data (the upstream examples' formula) ---------- */

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A year of sample activity: `count = max(0, round(r1 * max - r2 * 0.8 * max))`, as in the upstream examples. */
export function sampleActivity(seed: number, maxLevel = 4, year = 2025, maxCount = 20): Activity[] {
  const random = mulberry32(seed * 9973 + 17)
  const result: Activity[] = []
  const end = Date.UTC(year, 11, 31)
  for (let day = Date.UTC(year, 0, 1); day <= end; day += DAY_MS) {
    const c = Math.round(random() * maxCount - random() * (0.8 * maxCount))
    const count = Math.max(0, c)
    result.push({ date: formatISO(day), count, level: Math.ceil((count / maxCount) * maxLevel) })
  }
  return result
}

/* ---------- Motif: assembled heatmap (calendar + tooltip + footer) ---------- */

export type ContributionHeatmapProps = Partial<typeof defaults> & {
  /** Daily activity; levels must be within 0..levels. Defaults to seeded sample data. */
  data?: Activity[]
  labels?: Labels
  /** Highlight a day and show its tooltip (controlled, e.g. for an autoplay). Pointer hover takes precedence. */
  activeDate?: string | null
  /** Ripple the cells in on mount. */
  animate?: boolean
  className?: string
  style?: CSSProperties
}

export function ContributionHeatmap({ data: dataProp, labels, activeDate = null, animate = true, className, style, ...props }: ContributionHeatmapProps) {
  const { palette, levels, blockSize, blockGap, radius, weekStart, showLegend, seed } = { ...defaults, ...props }
  const maxLevel = Math.round(levels)
  const data = useMemo(() => dataProp ?? sampleActivity(seed, maxLevel), [dataProp, seed, maxLevel])
  const [hovered, setHovered] = useState<string | null>(null)
  const [focused, setFocused] = useState<string | null>(null)
  const shown = hovered ?? focused ?? activeDate
  const ws: WeekDay = weekStart === 'monday' ? 1 : 0

  const weeks = useMemo(() => groupByWeeks(data, ws), [data, ws])
  const position = useMemo(() => {
    const map = new Map<string, { weekIndex: number; dayIndex: number; activity: Activity }>()
    weeks.forEach((week, weekIndex) => week.forEach((activity, dayIndex) => activity && map.set(activity.date, { weekIndex, dayIndex, activity })))
    return map
  }, [weeks])

  const fontSize = 12
  const labelHeight = fontSize + 8
  const step = blockSize + blockGap
  const target = shown ? position.get(shown) : undefined
  const width = weeks.length * step - blockGap

  const onKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    const deltas: Record<string, number> = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1, Home: -Infinity, End: Infinity }
    const delta = deltas[event.key]
    if (delta === undefined) return
    event.preventDefault()
    const dates = data.map((d) => d.date).sort()
    const index = focused ? dates.indexOf(focused) : -1
    const next = index < 0 ? 0 : Math.min(dates.length - 1, Math.max(0, index + delta))
    setFocused(dates[next] ?? null)
  }

  let tooltip: ReactNode = null
  if (target) {
    const x = target.weekIndex * step + blockSize / 2
    const below = target.dayIndex < 3
    const y = labelHeight + target.dayIndex * step + (below ? blockSize + 6 : -6)
    const left = Math.min(Math.max(x, 64), Math.max(64, width - 64))
    tooltip = (
      <div
        role="tooltip"
        className="pointer-events-none absolute z-10 rounded-md border bg-popover px-2.5 py-1.5 text-xs whitespace-nowrap text-popover-foreground shadow-md"
        style={{ left, top: y, transform: `translate(-50%, ${below ? '0' : '-100%'})` }}
      >
        <p className="font-semibold">{target.activity.date}</p>
        <p>{target.activity.count} contributions</p>
      </div>
    )
  }

  return (
    <ContributionGraph
      data={data}
      blockMargin={blockGap}
      blockRadius={radius}
      blockSize={blockSize}
      fontSize={fontSize}
      labels={labels}
      maxLevel={maxLevel}
      palette={palette}
      weekStart={ws}
      className={cn('text-foreground', className)}
      style={style}
    >
      <ContributionGraphCalendar
        overlay={tooltip}
        onPointerLeave={() => setHovered(null)}
        svgProps={{
          tabIndex: 0,
          role: 'img',
          'aria-label': 'Daily activity calendar. Use the arrow keys to read individual days.',
          onKeyDown,
          onBlur: () => setFocused(null),
        }}
      >
        {({ activity, dayIndex, weekIndex }) => (
          <g onPointerEnter={() => setHovered(activity.date)} className="cursor-pointer">
            <ContributionGraphBlock activity={activity} dayIndex={dayIndex} weekIndex={weekIndex} animate={animate} active={shown === activity.date} />
          </g>
        )}
      </ContributionGraphCalendar>
      <div aria-live="polite" className="sr-only">
        {target ? `${target.activity.date}: ${target.activity.count} contributions` : ''}
      </div>
      <ContributionGraphFooter>
        <ContributionGraphTotalCount />
        {showLegend && <ContributionGraphLegend />}
      </ContributionGraphFooter>
    </ContributionGraph>
  )
}
