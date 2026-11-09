// SPDX-License-Identifier: MIT
// Copyright (c) 2023 — Present shadcnblocks
// Source: https://github.com/shadcnblocks/kibo/blob/3d63cdb/packages/gantt/index.tsx
// Modified by Motif; see the item's provenance.
import { cn, usePrefersReducedMotion } from '@motif/runtime'
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type FC,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
  type SetStateAction,
} from 'react'

/* @motif:defaults */
export const defaults = {
  range: 'monthly',
  zoom: 100,
  accent: '#7c8cff',
  statusColors: ['#6b7280', '#f59e0b', '#10b981'],
  radius: 8,
  rowHeight: 36,
  sidebarWidth: 300,
  showToday: true,
  showMarkers: true,
}
/* @motif:end */

const FONT = "'Geist Variable', ui-sans-serif, system-ui, sans-serif"

// ---- 小型日期工具（替代 date-fns，只实现这里用到的部分） ----

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const NARROW_WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const endOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1)
const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
const getDate = (date: Date) => date.getDate()
const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const timeOfDay = (date: Date) => date.getTime() - startOfDay(date).getTime()

const addDays = (date: Date, amount: number) => {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

// 与 date-fns 一致：目标月份没有这一天时落在月末
const addMonths = (date: Date, amount: number) => {
  const next = new Date(date)
  const day = next.getDate()
  next.setDate(1)
  next.setMonth(next.getMonth() + amount)
  next.setDate(Math.min(day, getDaysInMonth(next)))
  return next
}

const differenceInCalendarDays = (a: Date, b: Date) =>
  Math.round((Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()) - Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())) / 86_400_000)

/** 完整天数（不足一天的部分舍去），同 date-fns 的 differenceInDays。 */
const differenceInDays = (a: Date, b: Date) => {
  const diff = differenceInCalendarDays(a, b)
  if (diff > 0 && timeOfDay(a) < timeOfDay(b)) return diff - 1
  if (diff < 0 && timeOfDay(a) > timeOfDay(b)) return diff + 1
  return diff
}

const differenceInHours = (a: Date, b: Date) => Math.trunc((a.getTime() - b.getTime()) / 3_600_000)

/** 完整月数，同 date-fns 的 differenceInMonths（不处理月末的特殊情况）。 */
const differenceInMonths = (a: Date, b: Date) => {
  const months = (a.getFullYear() - b.getFullYear()) * 12 + a.getMonth() - b.getMonth()
  const rest = (date: Date) => date.getDate() * 86_400_000 + timeOfDay(date)
  if (months > 0 && rest(a) < rest(b)) return months - 1
  if (months < 0 && rest(a) > rest(b)) return months + 1
  return months
}

const shortMonth = (date: Date) => (MONTH_NAMES[date.getMonth()] ?? '').slice(0, 3)
/** "MMM dd, yyyy" */
const formatDate = (date: Date) => `${shortMonth(date)} ${String(date.getDate()).padStart(2, '0')}, ${date.getFullYear()}`

const plural = (count: number, unit: string) => `${count} ${unit}${count === 1 ? '' : 's'}`

/** date-fns formatDistance 的英文输出（不含秒）。 */
const formatDistance = (a: Date, b: Date) => {
  const minutes = Math.abs(b.getTime() - a.getTime()) / 60_000
  if (minutes < 1) return 'less than a minute'
  if (minutes < 45) return plural(Math.round(minutes), 'minute')
  if (minutes < 90) return 'about 1 hour'
  if (minutes < 1440) return `about ${plural(Math.round(minutes / 60), 'hour')}`
  if (minutes < 2520) return '1 day'
  if (minutes < 43_200) return plural(Math.round(minutes / 1440), 'day')
  if (minutes < 86_400) return `about ${plural(Math.round(minutes / 43_200), 'month')}`
  const [earlier, later] = a < b ? [a, b] : [b, a]
  const months = differenceInMonths(later, earlier)
  if (months < 12) return plural(Math.round(minutes / 43_200), 'month')
  const remainder = months % 12
  const years = Math.trunc(months / 12)
  if (remainder < 3) return `about ${plural(years, 'year')}`
  if (remainder < 9) return `over ${plural(years, 'year')}`
  return `almost ${plural(years + 1, 'year')}`
}

/** 在一种颜色上放文字时，选对比度更高的深色或浅色墨水。 */
const inkFor = (hex: string) => {
  const m = hex.replace('#', '')
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m.slice(0, 6)
  const [r = 0, g = 0, b = 0] = [0, 2, 4].map((i) => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return (lum + 0.05) / 0.05 >= 1.05 / (lum + 0.05) ? '#0a0a0a' : '#ffffff'
}

const PlusIcon = ({ className, size = 16 }: { className?: string; size?: number }) => (
  <svg aria-hidden className={className} fill="none" height={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width={size}>
    <path d="M5 12h14M12 5v14" />
  </svg>
)

const TrashIcon = ({ className, size = 16 }: { className?: string; size?: number }) => (
  <svg aria-hidden className={className} fill="none" height={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width={size}>
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)

// ---- 拖动（替代 @dnd-kit：鼠标/触控指针，移动 10px 后才算开始，只取水平方向） ----

type PointerDragHandlers = {
  onStart?: (originX: number) => void
  onMove: (clientX: number) => void
  onEnd: () => void
}

function usePointerDrag(handlers: PointerDragHandlers) {
  const [isPressed, setPressed] = useState(false)
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers
  const pointer = useRef<{ id: number; x: number; y: number; active: boolean } | null>(null)

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0) return
    pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, active: false }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const state = pointer.current
    if (!state || state.id !== event.pointerId) return
    if (!state.active) {
      if (Math.hypot(event.clientX - state.x, event.clientY - state.y) < 10) return
      state.active = true
      setPressed(true)
      handlersRef.current.onStart?.(state.x)
    }
    handlersRef.current.onMove(event.clientX)
  }
  const finish = (event: ReactPointerEvent<HTMLElement>) => {
    const state = pointer.current
    if (!state || state.id !== event.pointerId) return
    pointer.current = null
    if (state.active) {
      setPressed(false)
      handlersRef.current.onEnd()
    }
  }

  return { isPressed, listeners: { onPointerDown, onPointerMove, onPointerUp: finish, onPointerCancel: finish } }
}

type StateTuple<T> = [T, Dispatch<SetStateAction<T>>]
const noop = () => undefined

// jotai 的全局 atom 换成每个 Gantt 自己的 context，同一页面上的多个甘特图互不影响
const GanttDraggingContext = createContext<StateTuple<boolean>>([false, noop])
const GanttScrollXContext = createContext<StateTuple<number>>([0, noop])

export const useGanttDragging = () => useContext(GanttDraggingContext)
export const useGanttScrollX = () => useContext(GanttScrollXContext)

export type GanttStatus = {
  id: string
  name: string
  color: string
}

export type GanttFeature = {
  id: string
  name: string
  startAt: Date
  endAt: Date
  status: GanttStatus
  lane?: string // Optional: features with the same lane will share a row
}

export type GanttMarkerProps = {
  id: string
  date: Date
  label: string
}

export type Range = 'daily' | 'monthly' | 'quarterly'

export type TimelineData = {
  year: number
  quarters: {
    months: {
      days: number
    }[]
  }[]
}[]

export type GanttContextProps = {
  zoom: number
  range: Range
  columnWidth: number
  sidebarWidth: number
  headerHeight: number
  rowHeight: number
  onAddItem: ((date: Date) => void) | undefined
  placeholderLength: number
  timelineData: TimelineData
  ref: RefObject<HTMLDivElement | null> | null
  scrollToFeature?: (feature: GanttFeature) => void
  accent: string
  radius: number
}

const getsDaysIn = (range: Range) => {
  // For when range is daily
  let fn = (_date: Date) => 1

  if (range === 'monthly' || range === 'quarterly') {
    fn = getDaysInMonth
  }

  return fn
}

const getDifferenceIn = (range: Range) => {
  let fn = differenceInDays

  if (range === 'monthly' || range === 'quarterly') {
    fn = differenceInMonths
  }

  return fn
}

const getInnerDifferenceIn = (range: Range) => {
  let fn = differenceInHours

  if (range === 'monthly' || range === 'quarterly') {
    fn = differenceInDays
  }

  return fn
}

const getStartOf = (range: Range) => {
  let fn = startOfDay

  if (range === 'monthly' || range === 'quarterly') {
    fn = startOfMonth
  }

  return fn
}

const getEndOf = (range: Range) => {
  let fn = endOfDay

  if (range === 'monthly' || range === 'quarterly') {
    fn = endOfMonth
  }

  return fn
}

const getAddRange = (range: Range) => {
  let fn = addDays

  if (range === 'monthly' || range === 'quarterly') {
    fn = addMonths
  }

  return fn
}

const getDateByMousePosition = (context: GanttContextProps, mouseX: number) => {
  const timelineStartDate = new Date(context.timelineData[0]?.year ?? 0, 0, 1)
  const columnWidth = (context.columnWidth * context.zoom) / 100
  const offset = Math.floor(mouseX / columnWidth)
  const daysIn = getsDaysIn(context.range)
  const addRange = getAddRange(context.range)
  const month = addRange(timelineStartDate, offset)
  const daysInMonth = daysIn(month)
  const pixelsPerDay = Math.round(columnWidth / daysInMonth)
  const dayOffset = Math.floor((mouseX % columnWidth) / pixelsPerDay)
  const actualDate = addDays(month, dayOffset)

  return actualDate
}

const createYear = (year: number): TimelineData[number] => ({
  year,
  quarters: new Array(4).fill(null).map((_, quarterIndex) => ({
    months: new Array(3).fill(null).map((_, monthIndex) => {
      const month = quarterIndex * 3 + monthIndex
      return {
        days: getDaysInMonth(new Date(year, month, 1)),
      }
    }),
  })),
})

const createInitialTimelineData = (today: Date): TimelineData => [
  createYear(today.getFullYear() - 1),
  createYear(today.getFullYear()),
  createYear(today.getFullYear() + 1),
]

const getOffset = (date: Date, timelineStartDate: Date, context: GanttContextProps) => {
  const parsedColumnWidth = (context.columnWidth * context.zoom) / 100
  const differenceIn = getDifferenceIn(context.range)
  const startOf = getStartOf(context.range)
  const fullColumns = differenceIn(startOf(date), timelineStartDate)

  if (context.range === 'daily') {
    return parsedColumnWidth * fullColumns
  }

  const partialColumns = date.getDate()
  const daysInMonth = getDaysInMonth(date)
  const pixelsPerDay = parsedColumnWidth / daysInMonth

  return fullColumns * parsedColumnWidth + partialColumns * pixelsPerDay
}

const getWidth = (startAt: Date, endAt: Date | null, context: GanttContextProps) => {
  const parsedColumnWidth = (context.columnWidth * context.zoom) / 100

  if (!endAt) {
    return parsedColumnWidth * 2
  }

  const differenceIn = getDifferenceIn(context.range)

  if (context.range === 'daily') {
    const delta = differenceIn(endAt, startAt)

    return parsedColumnWidth * (delta ? delta : 1)
  }

  const daysInStartMonth = getDaysInMonth(startAt)
  const pixelsPerDayInStartMonth = parsedColumnWidth / daysInStartMonth

  if (isSameDay(startAt, endAt)) {
    return pixelsPerDayInStartMonth
  }

  const innerDifferenceIn = getInnerDifferenceIn(context.range)
  const startOf = getStartOf(context.range)

  if (isSameDay(startOf(startAt), startOf(endAt))) {
    return innerDifferenceIn(endAt, startAt) * pixelsPerDayInStartMonth
  }

  const startRangeOffset = daysInStartMonth - getDate(startAt)
  const endRangeOffset = getDate(endAt)
  const fullRangeOffset = differenceIn(startOf(endAt), startOf(startAt))
  const daysInEndMonth = getDaysInMonth(endAt)
  const pixelsPerDayInEndMonth = parsedColumnWidth / daysInEndMonth

  return (fullRangeOffset - 1) * parsedColumnWidth + startRangeOffset * pixelsPerDayInStartMonth + endRangeOffset * pixelsPerDayInEndMonth
}

const calculateInnerOffset = (date: Date, range: Range, columnWidth: number) => {
  // 上游按日刻度时用「几号 ÷ 23」，月底的标记会越过当天那一列；这里改成当天已过去的比例
  if (range === 'daily') {
    return (timeOfDay(date) / 86_400_000) * columnWidth
  }

  const startOf = getStartOf(range)
  const endOf = getEndOf(range)
  const differenceIn = getInnerDifferenceIn(range)
  const startOfRange = startOf(date)
  const endOfRange = endOf(date)
  const totalRangeDays = differenceIn(endOfRange, startOfRange)
  const dayOfMonth = date.getDate()

  return (dayOfMonth / totalRangeDays) * columnWidth
}

const GanttContext = createContext<GanttContextProps>({
  zoom: 100,
  range: 'monthly',
  columnWidth: 50,
  headerHeight: 60,
  sidebarWidth: 300,
  rowHeight: 36,
  onAddItem: undefined,
  placeholderLength: 2,
  timelineData: [],
  ref: null,
  scrollToFeature: undefined,
  accent: '#7c8cff',
  radius: 8,
})

export type GanttContentHeaderProps = {
  renderHeaderItem: (index: number) => ReactNode
  title: string
  columns: number
}

export const GanttContentHeader: FC<GanttContentHeaderProps> = ({ title, columns, renderHeaderItem }) => {
  const id = useId()

  return (
    <div className="sticky top-0 z-20 grid w-full shrink-0 bg-background/90 backdrop-blur-sm" style={{ height: 'var(--gantt-header-height)' }}>
      <div>
        <div
          className="sticky inline-flex whitespace-nowrap px-3 py-2 text-muted-foreground text-xs"
          style={{
            left: 'var(--gantt-sidebar-width)',
          }}
        >
          <p>{title}</p>
        </div>
      </div>
      <div
        className="grid w-full"
        style={{
          gridTemplateColumns: `repeat(${columns}, var(--gantt-column-width))`,
        }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <div className="shrink-0 border-border/50 border-b py-1 text-center text-xs" key={`${id}-${index}`}>
            {renderHeaderItem(index)}
          </div>
        ))}
      </div>
    </div>
  )
}

const DailyHeader: FC = () => {
  const gantt = useContext(GanttContext)

  return gantt.timelineData.map((year) =>
    year.quarters
      .flatMap((quarter) => quarter.months)
      .map((month, index) => (
        <div className="relative flex flex-col" key={`${year.year}-${index}`}>
          <GanttContentHeader
            columns={month.days}
            renderHeaderItem={(item: number) => {
              const day = addDays(new Date(year.year, index, 1), item)
              return (
                <div className="flex items-center justify-center gap-1">
                  <p>{day.getDate()}</p>
                  <p className="text-muted-foreground">{NARROW_WEEKDAYS[day.getDay()]}</p>
                </div>
              )
            }}
            title={`${MONTH_NAMES[index] ?? ''} ${year.year}`}
          />
          <GanttColumns columns={month.days} isColumnSecondary={(item: number) => [0, 6].includes(addDays(new Date(year.year, index, 1), item).getDay())} />
        </div>
      )),
  )
}

const MonthlyHeader: FC = () => {
  const gantt = useContext(GanttContext)

  return gantt.timelineData.map((year) => (
    <div className="relative flex flex-col" key={year.year}>
      <GanttContentHeader
        columns={year.quarters.flatMap((quarter) => quarter.months).length}
        renderHeaderItem={(item: number) => <p>{shortMonth(new Date(year.year, item, 1))}</p>}
        title={`${year.year}`}
      />
      <GanttColumns columns={year.quarters.flatMap((quarter) => quarter.months).length} />
    </div>
  ))
}

const QuarterlyHeader: FC = () => {
  const gantt = useContext(GanttContext)

  return gantt.timelineData.map((year) =>
    year.quarters.map((quarter, quarterIndex) => (
      <div className="relative flex flex-col" key={`${year.year}-${quarterIndex}`}>
        <GanttContentHeader
          columns={quarter.months.length}
          renderHeaderItem={(item: number) => <p>{shortMonth(new Date(year.year, quarterIndex * 3 + item, 1))}</p>}
          title={`Q${quarterIndex + 1} ${year.year}`}
        />
        <GanttColumns columns={quarter.months.length} />
      </div>
    )),
  )
}

const headers: Record<Range, FC> = {
  daily: DailyHeader,
  monthly: MonthlyHeader,
  quarterly: QuarterlyHeader,
}

export type GanttHeaderProps = {
  className?: string
}

// memo：任务条拖动时父组件频繁重渲染，表头和上千个日列不必跟着重算
export const GanttHeader: FC<GanttHeaderProps> = memo(({ className }) => {
  const gantt = useContext(GanttContext)
  const Header = headers[gantt.range]

  return (
    <div className={cn('-space-x-px flex h-full w-max divide-x divide-border/50', className)}>
      <Header />
    </div>
  )
})

GanttHeader.displayName = 'GanttHeader'

export type GanttSidebarItemProps = {
  feature: GanttFeature
  onSelectItem?: (id: string) => void
  className?: string
}

export const GanttSidebarItem: FC<GanttSidebarItemProps> = ({ feature, onSelectItem, className }) => {
  const gantt = useContext(GanttContext)
  const tempEndAt = feature.endAt && isSameDay(feature.startAt, feature.endAt) ? addDays(feature.endAt, 1) : feature.endAt
  const duration = tempEndAt ? formatDistance(feature.startAt, tempEndAt) : `${formatDistance(feature.startAt, new Date())} so far`
  // 侧栏在窄屏上会收窄，放不下时只留名称
  const showDuration = gantt.sidebarWidth >= 220

  const handleClick: MouseEventHandler<HTMLDivElement> = (event) => {
    if (event.target === event.currentTarget) {
      // Scroll to the feature in the timeline
      gantt.scrollToFeature?.(feature)
      // Call the original onSelectItem callback
      onSelectItem?.(feature.id)
    }
  }

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.key === 'Enter') {
      // Scroll to the feature in the timeline
      gantt.scrollToFeature?.(feature)
      // Call the original onSelectItem callback
      onSelectItem?.(feature.id)
    }
  }

  return (
    <div
      aria-label={`${feature.name}, ${feature.status.name}, ${duration}`}
      className={cn(
        'relative flex items-center gap-2.5 p-2.5 text-xs outline-none hover:bg-secondary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--gantt-accent)',
        className,
      )}
      key={feature.id}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      style={{
        height: 'var(--gantt-row-height)',
      }}
      tabIndex={0}
    >
      <div
        className="pointer-events-none h-2 w-2 shrink-0 rounded-full"
        style={{
          backgroundColor: feature.status.color,
        }}
      />
      <p className="pointer-events-none flex-1 truncate text-left font-medium">{feature.name}</p>
      {showDuration && <p className="pointer-events-none shrink-0 text-muted-foreground">{duration}</p>}
    </div>
  )
}

export const GanttSidebarHeader: FC = () => {
  const gantt = useContext(GanttContext)

  return (
    <div
      className="sticky top-0 z-10 flex shrink-0 items-end justify-between gap-2.5 border-border/50 border-b bg-background/90 p-2.5 font-medium text-muted-foreground text-xs backdrop-blur-sm"
      style={{ height: 'var(--gantt-header-height)' }}
    >
      <p className="flex-1 truncate text-left">Issues</p>
      {gantt.sidebarWidth >= 220 && <p className="shrink-0">Duration</p>}
    </div>
  )
}

export type GanttSidebarGroupProps = {
  children: ReactNode
  name: string
  className?: string
}

export const GanttSidebarGroup: FC<GanttSidebarGroupProps> = ({ children, name, className }) => (
  <div className={className}>
    <p className="w-full truncate p-2.5 text-left font-medium text-muted-foreground text-xs" style={{ height: 'var(--gantt-row-height)' }}>
      {name}
    </p>
    <div className="divide-y divide-border/50">{children}</div>
  </div>
)

export type GanttSidebarProps = {
  children: ReactNode
  className?: string
}

export const GanttSidebar: FC<GanttSidebarProps> = ({ children, className }) => (
  <div
    className={cn('sticky left-0 z-30 h-max min-h-full overflow-clip border-border/50 border-r bg-background/90 backdrop-blur-md', className)}
    data-roadmap-ui="gantt-sidebar"
  >
    <GanttSidebarHeader />
    <div className="space-y-4">{children}</div>
  </div>
)

export type GanttAddFeatureHelperProps = {
  top: number
  className?: string
}

export const GanttAddFeatureHelper: FC<GanttAddFeatureHelperProps> = ({ top, className }) => {
  const gantt = useContext(GanttContext)

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    const scroller = gantt.ref?.current
    const ganttRect = scroller?.getBoundingClientRect()
    const x = event.clientX - (ganttRect?.left ?? 0) + (scroller?.scrollLeft ?? 0) - gantt.sidebarWidth
    const currentDate = getDateByMousePosition(gantt, x)

    gantt.onAddItem?.(currentDate)
  }

  return (
    <div
      className={cn('absolute top-0 w-full px-0.5', className)}
      style={{
        marginTop: -gantt.rowHeight / 2,
        transform: `translateY(${top}px)`,
      }}
    >
      <button
        aria-label="Add item"
        className="flex h-full w-full items-center justify-center rounded-md border border-dashed p-2 outline-none focus-visible:border-(--gantt-accent)"
        onClick={handleClick}
        type="button"
      >
        <PlusIcon className="pointer-events-none select-none text-muted-foreground" size={16} />
      </button>
    </div>
  )
}

export type GanttColumnProps = {
  index: number
  isColumnSecondary?: (item: number) => boolean
}

export const GanttColumn: FC<GanttColumnProps> = ({ index, isColumnSecondary }) => {
  const gantt = useContext(GanttContext)
  const [dragging] = useGanttDragging()
  const [hovering, setHovering] = useState(false)
  const [top, setTop] = useState(0)
  // 只在能添加条目时跟踪指针，避免上千个日列白白重渲染
  const tracking = Boolean(gantt.onAddItem)

  const handleMouseEnter = () => setHovering(true)
  const handleMouseLeave = () => setHovering(false)
  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => setTop(event.clientY - event.currentTarget.getBoundingClientRect().top)

  return (
    <div
      className={cn('group relative h-full overflow-hidden', isColumnSecondary?.(index) ? 'bg-secondary' : '')}
      onPointerEnter={tracking ? handleMouseEnter : undefined}
      onPointerLeave={tracking ? handleMouseLeave : undefined}
      onPointerMove={tracking ? handlePointerMove : undefined}
    >
      {!dragging && hovering && gantt.onAddItem ? <GanttAddFeatureHelper top={top} /> : null}
    </div>
  )
}

export type GanttColumnsProps = {
  columns: number
  isColumnSecondary?: (item: number) => boolean
}

export const GanttColumns: FC<GanttColumnsProps> = ({ columns, isColumnSecondary }) => {
  const id = useId()

  return (
    <div
      className="divide grid h-full w-full divide-x divide-border/50"
      style={{
        gridTemplateColumns: `repeat(${columns}, var(--gantt-column-width))`,
      }}
    >
      {Array.from({ length: columns }).map((_, index) => (
        <GanttColumn index={index} isColumnSecondary={isColumnSecondary} key={`${id}-${index}`} />
      ))}
    </div>
  )
}

export type GanttCreateMarkerTriggerProps = {
  onCreateMarker: (date: Date) => void
  className?: string
}

export const GanttCreateMarkerTrigger: FC<GanttCreateMarkerTriggerProps> = ({ onCreateMarker, className }) => {
  const gantt = useContext(GanttContext)
  const mouseRef = useRef<HTMLDivElement>(null)
  const [x, setX] = useState(0)
  const scrollRef = gantt.ref

  // 替代 useMouse + useThrottle：在甘特图的滚动容器上听指针，每帧最多更新一次
  useEffect(() => {
    const scroller = scrollRef?.current
    if (!scroller) return
    let frame = 0
    let clientX = 0
    const update = () => {
      frame = 0
      const rect = mouseRef.current?.getBoundingClientRect()
      if (rect) setX(clientX - rect.left)
    }
    const handlePointerMove = (event: PointerEvent) => {
      clientX = event.clientX
      if (!frame) frame = requestAnimationFrame(update)
    }
    scroller.addEventListener('pointermove', handlePointerMove)
    return () => {
      scroller.removeEventListener('pointermove', handlePointerMove)
      cancelAnimationFrame(frame)
    }
  }, [scrollRef])

  const date = getDateByMousePosition(gantt, x)

  const handleClick = () => onCreateMarker(date)

  return (
    <div className={cn('group pointer-events-none absolute top-0 left-0 h-full w-full select-none overflow-visible', className)} ref={mouseRef}>
      <div
        className="-ml-2 pointer-events-auto sticky top-6 z-20 flex w-4 flex-col items-center justify-center gap-1 overflow-visible opacity-0 group-hover:opacity-100 focus-within:opacity-100"
        style={{ transform: `translateX(${x}px)` }}
      >
        <button
          aria-label={`Add marker on ${formatDate(date)}`}
          className="z-50 inline-flex h-4 w-4 items-center justify-center rounded-full bg-card outline-none focus-visible:outline-2 focus-visible:outline-(--gantt-accent)"
          onClick={handleClick}
          type="button"
        >
          <PlusIcon className="text-muted-foreground" size={12} />
        </button>
        <div className="whitespace-nowrap rounded-full border border-border/50 bg-background/90 px-2 py-1 text-foreground text-xs backdrop-blur-lg">{formatDate(date)}</div>
      </div>
    </div>
  )
}

/** 方向键挪动日期：←/→ 一天，按住 Shift 一周。 */
const stepFromKey = (key: string, shiftKey: boolean) => {
  if (key !== 'ArrowLeft' && key !== 'ArrowRight') return 0
  return (key === 'ArrowLeft' ? -1 : 1) * (shiftKey ? 7 : 1)
}

export type GanttFeatureDragHelperProps = {
  featureId: GanttFeature['id']
  direction: 'left' | 'right'
  date: Date | null
  onDragMove: (clientX: number) => void
  onDragEnd: () => void
  onStep?: (days: number) => void
}

export const GanttFeatureDragHelper: FC<GanttFeatureDragHelperProps> = ({ direction, featureId, date, onDragMove, onDragEnd, onStep }) => {
  const [, setDragging] = useGanttDragging()
  const { isPressed, listeners } = usePointerDrag({
    onStart: () => setDragging(true),
    onMove: onDragMove,
    onEnd: () => {
      setDragging(false)
      onDragEnd()
    },
  })

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    const days = stepFromKey(event.key, event.shiftKey)
    if (!days || !onStep) return
    event.preventDefault()
    onStep(days)
  }

  return (
    <div
      aria-label={`${direction === 'left' ? 'Start' : 'End'} date${date ? `, ${formatDate(date)}` : ''}. Use arrow keys to change.`}
      aria-pressed={isPressed || undefined}
      aria-roledescription="resize handle"
      className={cn(
        'group -translate-y-1/2 absolute top-1/2 z-[3] h-full w-6 cursor-col-resize touch-none rounded-md outline-none',
        direction === 'left' ? '-left-2.5' : '-right-2.5',
      )}
      data-feature-id={featureId}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      {...listeners}
    >
      <div
        className={cn(
          '-translate-y-1/2 absolute top-1/2 h-[80%] w-1 rounded-sm bg-muted-foreground opacity-0 transition-[translate,opacity] motion-reduce:transition-none',
          direction === 'left' ? 'left-2.5' : 'right-2.5',
          direction === 'left' ? 'group-hover:-translate-x-2.5 group-focus-visible:-translate-x-2.5' : 'group-hover:translate-x-2.5 group-focus-visible:translate-x-2.5',
          isPressed && (direction === 'left' ? '-translate-x-2.5' : 'translate-x-2.5'),
          'group-hover:opacity-100 group-focus-visible:bg-(--gantt-accent) group-focus-visible:opacity-100',
          isPressed && 'opacity-100',
        )}
      />
      {date && (
        <div
          className={cn(
            '-translate-x-1/2 absolute top-10 hidden whitespace-nowrap rounded-lg border border-border/50 bg-background/90 px-2 py-1 text-foreground text-xs backdrop-blur-lg group-hover:block group-focus-visible:block',
            isPressed && 'block',
          )}
        >
          {formatDate(date)}
        </div>
      )}
    </div>
  )
}

export type GanttFeatureItemCardProps = Pick<GanttFeature, 'id'> & {
  children?: ReactNode
  label?: string
  onDragStart?: (originX: number) => void
  onDragMove: (clientX: number) => void
  onDragEnd: () => void
  onStep?: (days: number) => void
}

export const GanttFeatureItemCard: FC<GanttFeatureItemCardProps> = ({ id, children, label, onDragStart, onDragMove, onDragEnd, onStep }) => {
  const gantt = useContext(GanttContext)
  const [, setDragging] = useGanttDragging()
  const { isPressed, listeners } = usePointerDrag({
    onStart: (originX) => {
      setDragging(true)
      onDragStart?.(originX)
    },
    onMove: onDragMove,
    onEnd: () => {
      setDragging(false)
      onDragEnd()
    },
  })

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    const days = stepFromKey(event.key, event.shiftKey)
    if (!days || !onStep) return
    event.preventDefault()
    onStep(days)
  }

  return (
    <div
      className="h-full w-full border bg-background p-2 text-card-foreground text-xs shadow-sm has-focus-visible:outline-2 has-focus-visible:outline-offset-1 has-focus-visible:outline-(--gantt-accent)"
      style={{ borderRadius: gantt.radius }}
    >
      <div
        aria-label={label}
        aria-pressed={isPressed || undefined}
        aria-roledescription="draggable"
        className={cn('flex h-full w-full touch-pan-y items-center justify-between gap-2 text-left outline-none', isPressed && 'cursor-grabbing')}
        data-feature-id={id}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        {...listeners}
      >
        {children}
      </div>
    </div>
  )
}

export type GanttFeatureItemProps = GanttFeature & {
  onMove?: (id: string, startDate: Date, endDate: Date | null) => void
  children?: ReactNode
  className?: string
}

export const GanttFeatureItem: FC<GanttFeatureItemProps> = ({ onMove, children, className, ...feature }) => {
  const gantt = useContext(GanttContext)
  const timelineStartDate = useMemo(() => new Date(gantt.timelineData.at(0)?.year ?? 0, 0, 1), [gantt.timelineData])
  const [startAt, setStartAt] = useState<Date>(feature.startAt)
  const [endAt, setEndAt] = useState<Date | null>(feature.endAt)

  // 父组件改了日期（保存了拖动结果，或程序化地调整）时跟上 props
  const propsKey = `${feature.startAt.getTime()}:${feature.endAt.getTime()}`
  const [syncedKey, setSyncedKey] = useState(propsKey)
  if (syncedKey !== propsKey) {
    setSyncedKey(propsKey)
    setStartAt(feature.startAt)
    setEndAt(feature.endAt)
  }

  // Memoize expensive calculations
  const width = useMemo(() => getWidth(startAt, endAt, gantt), [startAt, endAt, gantt])
  const offset = useMemo(() => getOffset(startAt, timelineStartDate, gantt), [startAt, timelineStartDate, gantt])

  const addRange = useMemo(() => getAddRange(gantt.range), [gantt.range])

  // 拖动回调里读最新值：状态更新是异步的，松手那一刻状态可能还没提交
  const live = useRef({ startAt, endAt })
  live.current = { startAt, endAt }
  const previous = useRef({ mouseX: 0, startAt, endAt })

  const update = (next: { startAt: Date; endAt: Date | null }) => {
    live.current = next
    setStartAt(next.startAt)
    setEndAt(next.endAt)
  }

  const handleItemDragStart = (originX: number) => {
    previous.current = { mouseX: originX, ...live.current }
  }

  const handleItemDragMove = (mouseX: number) => {
    const currentDate = getDateByMousePosition(gantt, mouseX)
    const originalDate = getDateByMousePosition(gantt, previous.current.mouseX)
    const delta = gantt.range === 'daily' ? getDifferenceIn(gantt.range)(currentDate, originalDate) : getInnerDifferenceIn(gantt.range)(currentDate, originalDate)
    const newStartDate = addDays(previous.current.startAt, delta)
    const newEndDate = previous.current.endAt ? addDays(previous.current.endAt, delta) : null

    update({ startAt: newStartDate, endAt: newEndDate })
  }

  const onDragEnd = () => onMove?.(feature.id, live.current.startAt, live.current.endAt)

  const timelineX = (clientX: number) => {
    const scroller = gantt.ref?.current
    const ganttRect = scroller?.getBoundingClientRect()
    return clientX - (ganttRect?.left ?? 0) + (scroller?.scrollLeft ?? 0) - gantt.sidebarWidth
  }

  const handleLeftDragMove = (clientX: number) => {
    const newStartAt = getDateByMousePosition(gantt, timelineX(clientX))
    const end = live.current.endAt
    // 上游允许把开始拖过结束，这里至少留一天
    update({ startAt: end && newStartAt >= end ? addDays(end, -1) : newStartAt, endAt: end })
  }

  const handleRightDragMove = (clientX: number) => {
    const newEndAt = getDateByMousePosition(gantt, timelineX(clientX))
    const start = live.current.startAt
    update({ startAt: start, endAt: newEndAt <= start ? addDays(start, 1) : newEndAt })
  }

  const step = (edge: 'both' | 'start' | 'end', days: number) => {
    const { startAt: start, endAt: end } = live.current
    const nextStart = edge === 'end' ? start : addDays(start, days)
    const nextEnd = end && edge !== 'start' ? addDays(end, days) : end
    if (nextEnd && nextStart >= nextEnd) return
    update({ startAt: nextStart, endAt: nextEnd })
    onMove?.(feature.id, nextStart, nextEnd)
  }

  const label = `${feature.name}, ${formatDate(startAt)} to ${endAt ? formatDate(endAt) : 'open'}${onMove ? '. Drag or use arrow keys to move.' : ''}`

  return (
    <div className={cn('relative flex w-max min-w-full py-0.5', className)} style={{ height: 'var(--gantt-row-height)' }}>
      <div
        className="pointer-events-auto absolute top-0.5"
        data-roadmap-ui="gantt-feature"
        style={{
          height: 'calc(var(--gantt-row-height) - 4px)',
          width: Math.round(width),
          left: Math.round(offset),
        }}
      >
        {onMove && (
          <GanttFeatureDragHelper
            date={startAt}
            direction="left"
            featureId={feature.id}
            onDragEnd={onDragEnd}
            onDragMove={handleLeftDragMove}
            onStep={(days) => step('start', days)}
          />
        )}
        <GanttFeatureItemCard
          id={feature.id}
          label={label}
          onDragEnd={onDragEnd}
          onDragMove={handleItemDragMove}
          onDragStart={handleItemDragStart}
          onStep={onMove ? (days) => step('both', days) : undefined}
        >
          {children ?? <p className="flex-1 truncate text-xs">{feature.name}</p>}
        </GanttFeatureItemCard>
        {onMove && (
          <GanttFeatureDragHelper
            date={endAt ?? addRange(startAt, 2)}
            direction="right"
            featureId={feature.id}
            onDragEnd={onDragEnd}
            onDragMove={handleRightDragMove}
            onStep={(days) => step('end', days)}
          />
        )}
      </div>
    </div>
  )
}

export type GanttFeatureListGroupProps = {
  children: ReactNode
  className?: string
}

export const GanttFeatureListGroup: FC<GanttFeatureListGroupProps> = ({ children, className }) => (
  <div className={className} style={{ paddingTop: 'var(--gantt-row-height)' }}>
    {children}
  </div>
)

export type GanttFeatureRowProps = {
  features: GanttFeature[]
  onMove?: (id: string, startAt: Date, endAt: Date | null) => void
  children?: (feature: GanttFeature) => ReactNode
  className?: string
}

export const GanttFeatureRow: FC<GanttFeatureRowProps> = ({ features, onMove, children, className }) => {
  const gantt = useContext(GanttContext)
  // Sort features by start date to handle potential overlaps
  const sortedFeatures = [...features].sort((a, b) => a.startAt.getTime() - b.startAt.getTime())

  // Calculate sub-row positions for overlapping features using a proper algorithm
  const featureWithPositions = []
  const subRowEndTimes: Date[] = [] // Track when each sub-row becomes free

  for (const feature of sortedFeatures) {
    let subRow = 0

    // Find the first sub-row that's free (doesn't overlap)
    while (subRow < subRowEndTimes.length && (subRowEndTimes[subRow] ?? feature.startAt) > feature.startAt) {
      subRow++
    }

    // Update the end time for this sub-row
    if (subRow === subRowEndTimes.length) {
      subRowEndTimes.push(feature.endAt)
    } else {
      subRowEndTimes[subRow] = feature.endAt
    }

    featureWithPositions.push({ ...feature, subRow })
  }

  const maxSubRows = Math.max(1, subRowEndTimes.length)
  const subRowHeight = gantt.rowHeight // Base row height

  return (
    <div
      className={cn('relative', className)}
      style={{
        height: `${maxSubRows * subRowHeight}px`,
        minHeight: 'var(--gantt-row-height)',
      }}
    >
      {featureWithPositions.map((feature) => (
        <div
          className="absolute w-full"
          key={feature.id}
          style={{
            top: `${feature.subRow * subRowHeight}px`,
            height: `${subRowHeight}px`,
          }}
        >
          <GanttFeatureItem {...feature} onMove={onMove}>
            {children ? children(feature) : <p className="flex-1 truncate text-xs">{feature.name}</p>}
          </GanttFeatureItem>
        </div>
      ))}
    </div>
  )
}

export type GanttFeatureListProps = {
  className?: string
  children: ReactNode
}

export const GanttFeatureList: FC<GanttFeatureListProps> = ({ className, children }) => (
  <div className={cn('absolute top-0 left-0 h-full w-max space-y-4', className)} style={{ marginTop: 'var(--gantt-header-height)' }}>
    {children}
  </div>
)

/** 标记的右键菜单（替代 Radix ContextMenu）：只有「删除」一项。 */
const MarkerMenu: FC<{ onRemove: () => void; onClose: () => void }> = ({ onRemove, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || !menuRef.current?.contains(event.target)) onClose()
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [onClose])

  return (
    <div
      className="absolute top-full left-1/2 z-50 mt-1 min-w-[9rem] -translate-x-1/2 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
      onKeyDown={(event) => {
        if (event.key === 'Escape' || event.key === 'Tab') {
          event.preventDefault()
          onClose()
        }
      }}
      ref={menuRef}
      role="menu"
    >
      <button
        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-destructive text-sm outline-none hover:bg-accent focus-visible:bg-accent"
        onClick={() => {
          onRemove()
          onClose()
        }}
        role="menuitem"
        type="button"
      >
        <TrashIcon size={16} />
        Remove marker
      </button>
    </div>
  )
}

export const GanttMarker: FC<
  GanttMarkerProps & {
    onRemove?: (id: string) => void
    className?: string
  }
> = memo(({ label, date, id, onRemove, className }) => {
  const gantt = useContext(GanttContext)
  const differenceIn = useMemo(() => getDifferenceIn(gantt.range), [gantt.range])
  const timelineStartDate = useMemo(() => new Date(gantt.timelineData.at(0)?.year ?? 0, 0, 1), [gantt.timelineData])
  const [menuOpen, setMenuOpen] = useState(false)

  // Memoize expensive calculations
  const offset = useMemo(() => differenceIn(date, timelineStartDate), [differenceIn, date, timelineStartDate])
  const innerOffset = useMemo(() => calculateInnerOffset(date, gantt.range, (gantt.columnWidth * gantt.zoom) / 100), [date, gantt.range, gantt.columnWidth, gantt.zoom])

  const handleRemove = useCallback(() => onRemove?.(id), [onRemove, id])
  const handleClose = useCallback(() => setMenuOpen(false), [])

  return (
    <div
      className="pointer-events-none absolute top-0 left-0 z-20 flex h-full select-none flex-col items-center justify-center overflow-visible"
      style={{
        width: 0,
        transform: `translateX(calc(var(--gantt-column-width) * ${offset} + ${innerOffset}px))`,
      }}
    >
      <div
        aria-haspopup={onRemove ? 'menu' : undefined}
        aria-label={onRemove ? `${label}, ${formatDate(date)}` : undefined}
        className={cn(
          'group pointer-events-auto sticky top-0 flex select-auto flex-col flex-nowrap items-center justify-center whitespace-nowrap rounded-b-md bg-card px-2 py-1 text-foreground text-xs outline-none focus-visible:outline-2 focus-visible:outline-(--gantt-accent)',
          className,
        )}
        onContextMenu={
          onRemove
            ? (event) => {
                event.preventDefault()
                setMenuOpen(true)
              }
            : undefined
        }
        onKeyDown={(event) => {
          if (onRemove && (event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey))) {
            event.preventDefault()
            setMenuOpen(true)
          }
        }}
        tabIndex={onRemove ? 0 : undefined}
      >
        {label}
        <span className="max-h-[0] overflow-hidden opacity-80 transition-[max-height] group-hover:max-h-[2rem] group-focus-visible:max-h-[2rem] motion-reduce:transition-none">
          {formatDate(date)}
        </span>
        {menuOpen && onRemove ? <MarkerMenu onClose={handleClose} onRemove={handleRemove} /> : null}
      </div>
      <div className={cn('h-full w-px bg-card', className)} />
    </div>
  )
})

GanttMarker.displayName = 'GanttMarker'

export type GanttProviderProps = {
  range?: Range
  zoom?: number
  onAddItem?: (date: Date) => void
  children: ReactNode
  className?: string
  style?: CSSProperties
  /** 行高（像素），上游固定为 36。 */
  rowHeight?: number
  /** 侧栏宽度（像素），上游固定为 300；窄容器里会自动收窄。 */
  sidebarWidth?: number
  /** 今天标线和焦点框的颜色。 */
  accent?: string
  /** 任务条圆角（像素）。 */
  radius?: number
}

export const GanttProvider: FC<GanttProviderProps> = ({
  zoom = 100,
  range = 'monthly',
  onAddItem,
  children,
  className,
  style,
  rowHeight = 36,
  sidebarWidth: preferredSidebarWidth = 300,
  accent = '#7c8cff',
  radius = 8,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const [timelineData, setTimelineData] = useState<TimelineData>(() => createInitialTimelineData(new Date()))
  const [scrollX, setScrollX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [hasSidebar, setHasSidebar] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)

  const headerHeight = 60
  let columnWidth = 50

  if (range === 'monthly') {
    columnWidth = 150
  } else if (range === 'quarterly') {
    columnWidth = 100
  }

  // 窄容器（手机）里侧栏不超过容器的 42%，至少 160px
  const sidebarWidth = hasSidebar ? (containerWidth > 0 ? Math.min(preferredSidebarWidth, Math.max(160, Math.round(containerWidth * 0.42))) : preferredSidebarWidth) : 0

  // Memoize CSS variables to prevent unnecessary re-renders
  const cssVariables = useMemo(
    () =>
      ({
        '--gantt-zoom': `${zoom}`,
        '--gantt-column-width': `${(zoom / 100) * columnWidth}px`,
        '--gantt-header-height': `${headerHeight}px`,
        '--gantt-row-height': `${rowHeight}px`,
        '--gantt-sidebar-width': `${sidebarWidth}px`,
        '--gantt-accent': accent,
        '--gantt-accent-ink': inkFor(accent),
      }) as CSSProperties,
    [zoom, columnWidth, rowHeight, sidebarWidth, accent],
  )

  const scrollToFeature = useCallback(
    (feature: GanttFeature) => {
      const scrollElement = scrollRef.current
      if (!scrollElement) {
        return
      }

      // Calculate timeline start date from timelineData
      const timelineStartDate = new Date(timelineData[0]?.year ?? 0, 0, 1)

      // Calculate the horizontal offset for the feature's start date
      const offset = getOffset(feature.startAt, timelineStartDate, {
        zoom,
        range,
        columnWidth,
        sidebarWidth,
        headerHeight,
        rowHeight,
        onAddItem,
        placeholderLength: 2,
        timelineData,
        ref: scrollRef,
        accent,
        radius,
      })

      // Scroll to align the feature's start with the right side of the sidebar
      const targetScrollLeft = Math.max(0, offset)

      scrollElement.scrollTo({
        left: targetScrollLeft,
        behavior: reducedMotion ? 'auto' : 'smooth',
      })
    },
    [timelineData, zoom, range, columnWidth, sidebarWidth, rowHeight, onAddItem, accent, radius, reducedMotion],
  )

  const context = useMemo<GanttContextProps>(
    () => ({
      zoom,
      range,
      headerHeight,
      columnWidth,
      sidebarWidth,
      rowHeight,
      onAddItem,
      timelineData,
      placeholderLength: 2,
      ref: scrollRef,
      scrollToFeature,
      accent,
      radius,
    }),
    [zoom, range, columnWidth, sidebarWidth, rowHeight, onAddItem, timelineData, scrollToFeature, accent, radius],
  )
  const draggingState = useMemo<StateTuple<boolean>>(() => [dragging, setDragging], [dragging])
  const scrollXState = useMemo<StateTuple<number>>(() => [scrollX, setScrollX], [scrollX])

  // Update sidebar width when DOM is ready（布局阶段量好，首帧就是正确的列宽）
  useLayoutEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement) return

    const updateSidebar = () => setHasSidebar(Boolean(scrollElement.querySelector('[data-roadmap-ui="gantt-sidebar"]')))
    const updateWidth = () => setContainerWidth(scrollElement.clientWidth)

    // Update immediately
    updateSidebar()
    updateWidth()

    // Also update on resize or when children change
    const mutations = new MutationObserver(updateSidebar)
    mutations.observe(scrollElement, { childList: true, subtree: true })
    const resize = new ResizeObserver(updateWidth)
    resize.observe(scrollElement)

    return () => {
      mutations.disconnect()
      resize.disconnect()
    }
  }, [])

  // 打开时让「今天」落在可见时间轴的三分之一处（上游是滚到整条时间轴的正中）；切换刻度或缩放时重新对齐
  const latest = useRef({ context, sidebarWidth })
  latest.current = { context, sidebarWidth }
  const ready = containerWidth > 0

  useLayoutEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement || !ready) return
    const { context: current, sidebarWidth: sidebar } = latest.current
    const timelineStartDate = new Date(current.timelineData[0]?.year ?? 0, 0, 1)
    const offset = getOffset(new Date(), timelineStartDate, current)
    scrollElement.scrollLeft = Math.max(1, offset - (scrollElement.clientWidth - sidebar) * 0.35)
    setScrollX(scrollElement.scrollLeft)
  }, [range, zoom, ready])

  // 滚到两端时向前 / 向后再接一年（lodash.throttle 换成每帧最多一次）
  useEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement) return
    let frame = 0

    const handleScroll = () => {
      frame = 0
      const { scrollLeft, scrollWidth, clientWidth } = scrollElement
      setScrollX(scrollLeft)

      if (scrollLeft === 0) {
        // Extend timelineData to the past
        setTimelineData((data) => {
          const firstYear = data[0]?.year
          return firstYear === undefined ? data : [createYear(firstYear - 1), ...data]
        })

        // Scroll a bit forward so it's not at the very start
        scrollElement.scrollLeft = scrollElement.clientWidth
        setScrollX(scrollElement.scrollLeft)
      } else if (scrollLeft + clientWidth >= scrollWidth) {
        // Extend timelineData to the future
        setTimelineData((data) => {
          const lastYear = data.at(-1)?.year
          return lastYear === undefined ? data : [...data, createYear(lastYear + 1)]
        })

        // Scroll a bit back so it's not at the very end
        scrollElement.scrollLeft = scrollElement.scrollWidth - scrollElement.clientWidth
        setScrollX(scrollElement.scrollLeft)
      }
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(handleScroll)
    }

    scrollElement.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      scrollElement.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <GanttContext.Provider value={context}>
      <GanttDraggingContext.Provider value={draggingState}>
        <GanttScrollXContext.Provider value={scrollXState}>
          <div
            className={cn('gantt relative isolate grid h-full w-full flex-none select-none overflow-auto rounded-sm bg-secondary', range, className)}
            ref={scrollRef}
            style={{
              ...cssVariables,
              gridTemplateColumns: 'var(--gantt-sidebar-width) 1fr',
              ...style,
            }}
          >
            {children}
          </div>
        </GanttScrollXContext.Provider>
      </GanttDraggingContext.Provider>
    </GanttContext.Provider>
  )
}

export type GanttTimelineProps = {
  children: ReactNode
  className?: string
}

export const GanttTimeline: FC<GanttTimelineProps> = ({ children, className }) => (
  <div className={cn('relative flex h-full w-max flex-none overflow-clip', className)}>{children}</div>
)

export type GanttTodayProps = {
  className?: string
}

export const GanttToday: FC<GanttTodayProps> = ({ className }) => {
  const label = 'Today'
  const date = useMemo(() => new Date(), [])
  const gantt = useContext(GanttContext)
  const differenceIn = useMemo(() => getDifferenceIn(gantt.range), [gantt.range])
  const timelineStartDate = useMemo(() => new Date(gantt.timelineData.at(0)?.year ?? 0, 0, 1), [gantt.timelineData])

  // Memoize expensive calculations
  const offset = useMemo(() => differenceIn(date, timelineStartDate), [differenceIn, date, timelineStartDate])
  const innerOffset = useMemo(() => calculateInnerOffset(date, gantt.range, (gantt.columnWidth * gantt.zoom) / 100), [date, gantt.range, gantt.columnWidth, gantt.zoom])

  return (
    <div
      className="pointer-events-none absolute top-0 left-0 z-20 flex h-full select-none flex-col items-center justify-center overflow-visible"
      style={{
        width: 0,
        transform: `translateX(calc(var(--gantt-column-width) * ${offset} + ${innerOffset}px))`,
      }}
    >
      <div
        className={cn(
          'group pointer-events-auto sticky top-0 flex select-auto flex-col flex-nowrap items-center justify-center whitespace-nowrap rounded-b-md bg-(--gantt-accent) px-2 py-1 font-medium text-(--gantt-accent-ink) text-xs',
          className,
        )}
      >
        {label}
        <span className="max-h-[0] overflow-hidden opacity-80 transition-[max-height] group-hover:max-h-[2rem] motion-reduce:transition-none">{formatDate(date)}</span>
      </div>
      <div className={cn('h-full w-px bg-(--gantt-accent)', className)} />
    </div>
  )
}

// ---- 组合好的甘特图：照上游示例的结构拼装（分组侧栏 + 分组任务行 + 里程碑 + 今天） ----

export const DEFAULT_STATUSES: GanttStatus[] = [
  { id: 'planned', name: 'Planned', color: '#6B7280' },
  { id: 'in-progress', name: 'In Progress', color: '#F59E0B' },
  { id: 'done', name: 'Done', color: '#10B981' },
]

export type GanttChartFeature = GanttFeature & { group?: string }
export type GanttChartMarker = GanttMarkerProps & { className?: string }

export type GanttChartProps = Partial<typeof defaults> & {
  features: GanttChartFeature[]
  markers?: GanttChartMarker[]
  /** 状态列表；statusColors 按这里的顺序给状态上色。 */
  statuses?: GanttStatus[]
  onMove?: (id: string, startAt: Date, endAt: Date | null) => void
  onAddItem?: (date: Date) => void
  onCreateMarker?: (date: Date) => void
  onRemoveMarker?: (id: string) => void
  onSelectItem?: (id: string) => void
  /** 任务条里的内容，默认是任务名。 */
  renderFeature?: (feature: GanttChartFeature) => ReactNode
  className?: string
  style?: CSSProperties
}

const RANGES: readonly Range[] = ['daily', 'monthly', 'quarterly']

export function GanttChart({
  features,
  markers = [],
  statuses = DEFAULT_STATUSES,
  onMove,
  onAddItem,
  onCreateMarker,
  onRemoveMarker,
  onSelectItem,
  renderFeature,
  className,
  style,
  ...props
}: GanttChartProps) {
  const options = { ...defaults, ...props }
  const range = RANGES.find((value) => value === options.range) ?? 'monthly'
  const statusColors = options.statusColors

  const coloredFeatures = useMemo(
    () =>
      features.map((feature) => {
        const index = statuses.findIndex((status) => status.id === feature.status.id)
        const color = index >= 0 ? statusColors[index % statusColors.length] : undefined
        return color ? { ...feature, status: { ...feature.status, color } } : feature
      }),
    [features, statuses, statusColors],
  )

  // 替代 lodash.groupby：按分组名排序，和上游示例一致
  const groups = useMemo(() => {
    const byGroup = new Map<string, GanttChartFeature[]>()
    for (const feature of coloredFeatures) {
      const key = feature.group ?? ''
      byGroup.set(key, [...(byGroup.get(key) ?? []), feature])
    }
    return [...byGroup.entries()].sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
  }, [coloredFeatures])

  return (
    <GanttProvider
      accent={options.accent}
      className={className}
      onAddItem={onAddItem}
      radius={options.radius}
      range={range}
      rowHeight={options.rowHeight}
      sidebarWidth={options.sidebarWidth}
      style={{ fontFamily: FONT, ...style }}
      zoom={options.zoom}
    >
      <GanttSidebar>
        {groups.map(([group, items]) => (
          <GanttSidebarGroup key={group} name={group}>
            {items.map((feature) => (
              <GanttSidebarItem feature={feature} key={feature.id} onSelectItem={onSelectItem} />
            ))}
          </GanttSidebarGroup>
        ))}
      </GanttSidebar>
      <GanttTimeline>
        <GanttHeader />
        <GanttFeatureList>
          {groups.map(([group, items]) => (
            <GanttFeatureListGroup key={group}>
              {items.map((feature) => (
                <div className="flex" key={feature.id}>
                  <GanttFeatureItem onMove={onMove} {...feature}>
                    {renderFeature?.(feature)}
                  </GanttFeatureItem>
                </div>
              ))}
            </GanttFeatureListGroup>
          ))}
        </GanttFeatureList>
        {options.showMarkers && markers.map((marker) => <GanttMarker key={marker.id} {...marker} onRemove={onRemoveMarker} />)}
        {options.showToday && <GanttToday />}
        {onCreateMarker && <GanttCreateMarkerTrigger onCreateMarker={onCreateMarker} />}
      </GanttTimeline>
    </GanttProvider>
  )
}
