// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Keenthemes Inc
// Source: https://github.com/keenthemes/reui/blob/6e433dd/registry-reui/bases/base/reui/date-selector.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#6366f1',
  defaultPeriod: 'day',
  allowRange: true,
  showOperators: true,
  radius: 8,
  yearSpan: 12,
  maxYear: 2026,
  spring: {
    visualDuration: 0.3,
    bounce: 0.2,
  },
}
/* @motif:end */

export interface DateSelectorI18nConfig {
  selectDate: string
  apply: string
  cancel: string
  clear: string
  today: string
  filterTypes: { is: string; before: string; after: string; between: string }
  periodTypes: { day: string; month: string; quarter: string; halfYear: string; year: string }
  months: string[]
  monthsShort: string[]
  quarters: string[]
  halfYears: string[]
  weekdays: string[]
  weekdaysShort: string[]
  placeholder: string
  rangePlaceholder: string
}

export const DEFAULT_DATE_SELECTOR_I18N: DateSelectorI18nConfig = {
  selectDate: 'Select date',
  apply: 'Apply',
  cancel: 'Cancel',
  clear: 'Clear',
  today: 'Today',
  filterTypes: { is: 'is', before: 'before', after: 'after', between: 'between' },
  periodTypes: { day: 'Day', month: 'Month', quarter: 'Quarter', halfYear: 'Half-year', year: 'Year' },
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  quarters: ['Q1', 'Q2', 'Q3', 'Q4'],
  halfYears: ['H1', 'H2'],
  weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  weekdaysShort: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  placeholder: 'Select date...',
  rangePlaceholder: 'Select date range...',
}

export type DateSelectorPeriodType = 'day' | 'month' | 'quarter' | 'half-year' | 'year'
export type DateSelectorFilterType = 'is' | 'before' | 'after' | 'between'

export interface DateSelectorValue {
  period: DateSelectorPeriodType
  operator: DateSelectorFilterType
  startDate?: Date
  endDate?: Date
  year?: number
  month?: number
  quarter?: number
  halfYear?: number
  rangeStart?: { year: number; value: number }
  rangeEnd?: { year: number; value: number }
}

/* 取代 date-fns 的几个小工具：只用到加减月、同日 / 同月比较和 MM/dd/yyyy 格式。 */
const pad2 = (n: number) => String(n).padStart(2, '0')
const formatDay = (d: Date) => `${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}/${d.getFullYear()}`
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1)
const isSameDay = (a?: Date, b?: Date) => a !== undefined && b !== undefined && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const isSameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
const dayKey = (d: Date) => d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate()

/** WCAG 相对亮度；解析不了的颜色返回 null。 */
function luminance(color: string) {
  const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(color.trim())
  if (!m) return null
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1]
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
/** 选中态按钮上的字：在白字和近黑字里取对比度更高的那个。 */
function readable(color: string) {
  const l = luminance(color)
  if (l === null) return '#ffffff'
  const ink = 0.0036
  return (l + 0.05) / (ink + 0.05) > 1.05 / (l + 0.05) ? '#0b0b12' : '#ffffff'
}

interface DateSelectorContextValue {
  i18n: DateSelectorI18nConfig
  spring: { visualDuration: number; bounce: number }
  reduced: boolean
}

const DateSelectorContext = createContext<DateSelectorContextValue>({
  i18n: DEFAULT_DATE_SELECTOR_I18N,
  spring: defaults.spring,
  reduced: false,
})

const useDateSelectorContext = () => useContext(DateSelectorContext)

export function formatDateValue(value: DateSelectorValue, i18n: DateSelectorI18nConfig = DEFAULT_DATE_SELECTOR_I18N): string {
  const { period, startDate, endDate, year, month, quarter, halfYear, rangeStart, rangeEnd } = value

  if (period === 'day') {
    if (startDate && endDate) return `${formatDay(startDate)} - ${formatDay(endDate)}`
    if (startDate) return formatDay(startDate)
    return ''
  }
  if (period === 'month') {
    if (rangeStart && rangeEnd) return `${i18n.monthsShort[rangeStart.value]} ${rangeStart.year} - ${i18n.monthsShort[rangeEnd.value]} ${rangeEnd.year}`
    if (year !== undefined && month !== undefined) return `${i18n.monthsShort[month]} ${year}`
    return ''
  }
  if (period === 'quarter') {
    if (rangeStart && rangeEnd) return `${i18n.quarters[rangeStart.value]} ${rangeStart.year} - ${i18n.quarters[rangeEnd.value]} ${rangeEnd.year}`
    if (year !== undefined && quarter !== undefined) return `${i18n.quarters[quarter]} ${year}`
    return ''
  }
  if (period === 'half-year') {
    if (rangeStart && rangeEnd) return `${i18n.halfYears[rangeStart.value]} ${rangeStart.year} - ${i18n.halfYears[rangeEnd.value]} ${rangeEnd.year}`
    if (year !== undefined && halfYear !== undefined) return `${i18n.halfYears[halfYear]} ${year}`
    return ''
  }
  if (period === 'year') {
    if (rangeStart && rangeEnd) return `${rangeStart.year} - ${rangeEnd.year}`
    if (year !== undefined) return `${year}`
    return ''
  }
  return ''
}

interface UseDateSelectorOptions {
  value?: DateSelectorValue
  onChange?: (value: DateSelectorValue) => void
  defaultPeriodType?: DateSelectorPeriodType
  defaultFilterType?: DateSelectorFilterType
  allowRange?: boolean
  minYear: number
  maxYear: number
}

export function useDateSelector({ value, onChange, defaultPeriodType = 'day', defaultFilterType = 'is', allowRange = true, minYear, maxYear }: UseDateSelectorOptions) {
  const [periodType, setPeriodType] = useState<DateSelectorPeriodType>(value?.period || defaultPeriodType)
  const [filterType, setFilterType] = useState<DateSelectorFilterType>(value?.operator ?? defaultFilterType)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value?.startDate)
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(value?.endDate)
  const [calendarMonth, setCalendarMonth] = useState(() => value?.startDate || new Date())
  const [selectedYear, setSelectedYear] = useState<number | undefined>(value?.year)
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(value?.month)
  const [selectedQuarter, setSelectedQuarter] = useState<number | undefined>(value?.quarter)
  const [selectedHalfYear, setSelectedHalfYear] = useState<number | undefined>(value?.halfYear)
  const [rangeStart, setRangeStart] = useState<{ year: number; value: number } | undefined>(value?.rangeStart)
  const [rangeEnd, setRangeEnd] = useState<{ year: number; value: number } | undefined>(value?.rangeEnd)
  const [hoverDate, setHoverDate] = useState<Date | undefined>()

  const years = useMemo(() => Array.from({ length: Math.max(1, maxYear - minYear + 1) }, (_, i) => minYear + i), [minYear, maxYear])

  const currentValue = useMemo<DateSelectorValue>(
    () => ({
      period: periodType,
      operator: filterType,
      startDate: selectedDate,
      endDate: selectedEndDate,
      year: selectedYear,
      month: selectedMonth,
      quarter: selectedQuarter,
      halfYear: selectedHalfYear,
      rangeStart,
      rangeEnd,
    }),
    [periodType, filterType, selectedDate, selectedEndDate, selectedYear, selectedMonth, selectedQuarter, selectedHalfYear, rangeStart, rangeEnd],
  )

  const clearSelection = useCallback(() => {
    setSelectedDate(undefined)
    setSelectedEndDate(undefined)
    setSelectedYear(undefined)
    setSelectedMonth(undefined)
    setSelectedQuarter(undefined)
    setSelectedHalfYear(undefined)
    setRangeStart(undefined)
    setRangeEnd(undefined)
  }, [])

  const handleDayClick = useCallback(
    (day: Date) => {
      if (filterType === 'between' && allowRange) {
        if (!selectedDate || (selectedDate && selectedEndDate)) {
          setSelectedDate(day)
          setSelectedEndDate(undefined)
        } else if (dayKey(day) < dayKey(selectedDate)) {
          setSelectedEndDate(selectedDate)
          setSelectedDate(day)
        } else {
          setSelectedEndDate(day)
        }
      } else {
        setSelectedDate(day)
        setSelectedEndDate(undefined)
      }
    },
    [filterType, allowRange, selectedDate, selectedEndDate],
  )

  const handlePeriodSelect = useCallback(
    (year: number, value: number) => {
      if (filterType === 'between' && allowRange) {
        if (!rangeStart || (rangeStart && rangeEnd)) {
          setRangeStart({ year, value })
          setRangeEnd(undefined)
          setSelectedYear(year)
          if (periodType === 'month') setSelectedMonth(value)
          if (periodType === 'quarter') setSelectedQuarter(value)
          if (periodType === 'half-year') setSelectedHalfYear(value)
        } else {
          const startKey = rangeStart.year * 100 + rangeStart.value
          const endKey = year * 100 + value
          if (endKey < startKey) {
            setRangeEnd(rangeStart)
            setRangeStart({ year, value })
          } else {
            setRangeEnd({ year, value })
          }
        }
      } else {
        setSelectedYear(year)
        if (periodType === 'month') setSelectedMonth(value)
        if (periodType === 'quarter') setSelectedQuarter(value)
        if (periodType === 'half-year') setSelectedHalfYear(value)
        setRangeStart(undefined)
        setRangeEnd(undefined)
      }
    },
    [filterType, allowRange, rangeStart, rangeEnd, periodType],
  )

  const handleYearSelect = useCallback(
    (year: number) => {
      if (filterType === 'between' && allowRange) {
        if (!rangeStart || (rangeStart && rangeEnd)) {
          setRangeStart({ year, value: 0 })
          setRangeEnd(undefined)
          setSelectedYear(year)
        } else if (year < rangeStart.year) {
          setRangeEnd(rangeStart)
          setRangeStart({ year, value: 0 })
        } else {
          setRangeEnd({ year, value: 0 })
        }
      } else {
        setSelectedYear(year)
        setRangeStart(undefined)
        setRangeEnd(undefined)
      }
    },
    [filterType, allowRange, rangeStart, rangeEnd],
  )

  const handlePeriodTypeChange = useCallback(
    (type: DateSelectorPeriodType) => {
      setPeriodType(type)
      clearSelection()
    },
    [clearSelection],
  )

  const handleFilterTypeChange = useCallback(
    (type: DateSelectorFilterType) => {
      setFilterType(type)
      clearSelection()
    },
    [clearSelection],
  )

  const isInRange = useCallback(
    (year: number, value: number) => {
      if (!rangeStart || !rangeEnd) return false
      const key = year * 100 + value
      return key >= rangeStart.year * 100 + rangeStart.value && key <= rangeEnd.year * 100 + rangeEnd.value
    },
    [rangeStart, rangeEnd],
  )

  const isYearInRange = useCallback((year: number) => rangeStart !== undefined && rangeEnd !== undefined && year >= rangeStart.year && year <= rangeEnd.year, [rangeStart, rangeEnd])

  useEffect(() => {
    if (value) {
      setPeriodType(value.period || defaultPeriodType)
      setFilterType(value.operator ?? defaultFilterType)
      setSelectedDate(value.startDate)
      setSelectedEndDate(value.endDate)
      if (value.startDate) setCalendarMonth(value.startDate)
      setSelectedYear(value.year)
      setSelectedMonth(value.month)
      setSelectedQuarter(value.quarter)
      setSelectedHalfYear(value.halfYear)
      setRangeStart(value.rangeStart)
      setRangeEnd(value.rangeEnd)
    }
  }, [value, defaultPeriodType, defaultFilterType])

  // 未开启区间时 between 不可选，回退到 is。
  useEffect(() => {
    if (!allowRange && filterType === 'between') setFilterType('is')
  }, [allowRange, filterType])

  useEffect(() => {
    onChange?.(currentValue)
  }, [currentValue, onChange])

  return {
    periodType,
    filterType,
    selectedDate,
    selectedEndDate,
    calendarMonth,
    selectedYear,
    selectedMonth,
    selectedQuarter,
    selectedHalfYear,
    rangeStart,
    rangeEnd,
    hoverDate,
    years,
    currentValue,
    setPeriodType: handlePeriodTypeChange,
    setFilterType: handleFilterTypeChange,
    setCalendarMonth,
    setHoverDate,
    clearSelection,
    handleDayClick,
    handlePeriodSelect,
    handleYearSelect,
    isInRange,
    isYearInRange,
  }
}

/* 取代 base-ui Tabs：role="tablist"，方向键移动并选中，选中底块用 layoutId 弹簧滑动。 */
function Tabs<T extends string>({ value, onChange, items, label, className, triggerClassName }: { value: T; onChange: (value: T) => void; items: { value: T; label: string }[]; label: string; className?: string; triggerClassName?: string }) {
  const { spring, reduced } = useDateSelectorContext()
  const group = useId()
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    const to = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : step ? (index + step + items.length) % items.length : -1
    if (to < 0) return
    e.preventDefault()
    onChange(items[to].value)
    refs.current[to]?.focus()
  }
  return (
    <LayoutGroup id={group}>
      <div role="tablist" aria-label={label} className={cn('bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-(--r) p-[3px]', className)}>
        {items.map((item, i) => {
          const active = item.value === value
          return (
            <button
              key={item.value}
              ref={(el) => {
                refs.current[i] = el
              }}
              type="button"
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(item.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                'relative inline-flex h-full flex-1 items-center justify-center rounded-[calc(var(--r)-3px)] px-2 text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-(--accent)/60',
                active ? 'text-foreground' : 'hover:text-foreground',
                triggerClassName,
              )}
            >
              {active && (
                <motion.span
                  layoutId="indicator"
                  aria-hidden
                  className="bg-background dark:bg-input/60 absolute inset-0 rounded-[inherit] shadow-sm ring-1 ring-foreground/5"
                  transition={reduced ? { duration: 0 } : { type: 'spring', visualDuration: spring.visualDuration, bounce: spring.bounce }}
                />
              )}
              <span className="relative">{item.label}</span>
            </button>
          )
        })}
      </div>
    </LayoutGroup>
  )
}

const iconProps = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }

function IconButton({ children, label, onClick }: { children: ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className="hover:bg-muted text-foreground grid size-8.5 place-items-center rounded-(--r) transition-colors outline-none focus-visible:ring-2 focus-visible:ring-(--accent)/60">
      {children}
    </button>
  )
}

function DateSelectorPeriodTabs({ value, onChange, calendarMonth, onMonthChange }: { value: DateSelectorPeriodType; onChange: (value: DateSelectorPeriodType) => void; calendarMonth: Date; onMonthChange: (date: Date) => void }) {
  const { i18n } = useDateSelectorContext()
  const tabs: { value: DateSelectorPeriodType; label: string }[] = [
    { value: 'day', label: i18n.periodTypes.day },
    { value: 'month', label: i18n.periodTypes.month },
    { value: 'quarter', label: i18n.periodTypes.quarter },
    { value: 'half-year', label: i18n.periodTypes.halfYear },
    { value: 'year', label: i18n.periodTypes.year },
  ]
  const today = new Date()
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Tabs value={value} onChange={onChange} items={tabs} label="Period" triggerClassName="px-1.5 sm:px-2.5" />
      {value === 'day' && (
        <div className="flex items-center">
          {!isSameMonth(calendarMonth, today) && (
            <IconButton label={i18n.today} onClick={() => onMonthChange(new Date())}>
              <svg {...iconProps}>{calendarMonth > today ? <path d="M9 14 4 9l5-5M20 20v-7a4 4 0 0 0-4-4H4" /> : <path d="m15 14 5-5-5-5M4 20v-7a4 4 0 0 1 4-4h12" />}</svg>
            </IconButton>
          )}
          <IconButton label="Previous month" onClick={() => onMonthChange(addMonths(calendarMonth, -1))}>
            <svg {...iconProps}>
              <path d="m15 18-6-6 6-6" />
            </svg>
          </IconButton>
          <IconButton label="Next month" onClick={() => onMonthChange(addMonths(calendarMonth, 1))}>
            <svg {...iconProps}>
              <path d="m9 18 6-6-6-6" />
            </svg>
          </IconButton>
        </div>
      )}
    </div>
  )
}

/* 取代 react-day-picker：单月网格，显示月外日期；区间模式下悬停预览终点。 */
function DateSelectorDayPicker({ currentMonth, selectedDate, selectedEndDate, onDayClick, isRange, onDayHover, hoverDate }: { currentMonth: Date; selectedDate?: Date; selectedEndDate?: Date; onDayClick: (day: Date) => void; isRange: boolean; onDayHover: (day: Date | undefined) => void; hoverDate?: Date }) {
  const { i18n } = useDateSelectorContext()
  const first = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - first.getDay())
  const days = Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
  const from = selectedDate
  const to = isRange ? (selectedEndDate ?? (selectedDate ? hoverDate : undefined)) : undefined
  const [lo, hi] = from && to ? (dayKey(to) < dayKey(from) ? [to, from] : [from, to]) : [from, from]
  const today = new Date()

  return (
    <div className="flex w-full flex-col items-center">
      <div className="mb-2 text-sm font-medium">{`${i18n.months[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`}</div>
      <div role="grid" aria-label={`${i18n.months[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`} className="grid w-full grid-cols-7 gap-y-1" onMouseLeave={() => isRange && onDayHover(undefined)}>
        {i18n.weekdaysShort.map((w, i) => (
          <div key={w} role="columnheader" aria-label={i18n.weekdays[i]} className="text-muted-foreground pb-1 text-center text-[0.8rem] font-normal">
            {w}
          </div>
        ))}
        {days.map((day) => {
          const outside = day.getMonth() !== currentMonth.getMonth()
          const k = dayKey(day)
          const isStart = isSameDay(day, lo)
          const isEnd = isSameDay(day, hi)
          const selected = isStart || isEnd
          const middle = lo !== undefined && hi !== undefined && k > dayKey(lo) && k < dayKey(hi)
          return (
            <div key={k} role="gridcell" className={cn('relative aspect-square', middle && 'bg-(--accent)/15', isStart && hi && !isEnd && 'rounded-s-(--r) bg-(--accent)/15', isEnd && lo && !isStart && 'rounded-e-(--r) bg-(--accent)/15')}>
              <button
                type="button"
                aria-pressed={selected}
                aria-label={formatDay(day)}
                onClick={() => onDayClick(day)}
                onMouseEnter={() => isRange && onDayHover(day)}
                className={cn(
                  'flex size-full items-center justify-center rounded-(--r) text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-(--accent)/60',
                  selected ? 'bg-(--accent) text-(--on-accent)' : 'hover:bg-muted',
                  !selected && outside && 'text-muted-foreground/60',
                  !selected && isSameDay(day, today) && 'bg-muted font-medium',
                )}
              >
                {day.getDate()}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PeriodButton({ active, inRange, onClick, children }: { active: boolean; inRange: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 items-center justify-center rounded-(--r) border px-3 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-(--accent)/60',
        active ? 'border-transparent bg-(--accent) text-(--on-accent)' : 'bg-background hover:bg-muted dark:bg-input/30 dark:hover:bg-input/50',
        inRange && !active && 'border-(--accent)/25 bg-(--accent)/15 dark:bg-(--accent)/20',
      )}
    >
      {children}
    </button>
  )
}

function DateSelectorPeriodGrid({ years, items, selectedYear, selectedValue, rangeStart, rangeEnd, isInRange, onSelect, columns }: { years: number[]; items: string[]; selectedYear?: number; selectedValue?: number; rangeStart?: { year: number; value: number }; rangeEnd?: { year: number; value: number }; isInRange: (year: number, value: number) => boolean; onSelect: (year: number, value: number) => void; columns: number }) {
  return (
    <div className="w-full space-y-6">
      {years.map((year) => (
        <div key={year} data-year={year}>
          <div className="text-muted-foreground mb-3 text-sm font-medium">{year}</div>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {items.map((item, index) => {
              const isSelected = selectedYear === year && selectedValue === index
              const isRangeStart = rangeStart?.year === year && rangeStart?.value === index
              const isRangeEnd = rangeEnd?.year === year && rangeEnd?.value === index
              return (
                <PeriodButton key={item} active={isSelected || isRangeStart || isRangeEnd} inRange={isInRange(year, index)} onClick={() => onSelect(year, index)}>
                  {item}
                </PeriodButton>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function DateSelectorYearList({ years, selectedYear, rangeStart, rangeEnd, isYearInRange, onSelect }: { years: number[]; selectedYear?: number; rangeStart?: { year: number; value: number }; rangeEnd?: { year: number; value: number }; isYearInRange: (year: number) => boolean; onSelect: (year: number) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {years.map((year) => {
        const isSelected = selectedYear === year && !rangeStart && !rangeEnd
        return (
          <div key={year} data-year={year} className="contents">
            <PeriodButton active={isSelected || rangeStart?.year === year || rangeEnd?.year === year} inRange={isYearInRange(year)} onClick={() => onSelect(year)}>
              {year}
            </PeriodButton>
          </div>
        )
      })}
    </div>
  )
}

export type DateSelectorProps = Partial<typeof defaults> & {
  value?: DateSelectorValue
  onChange?: (value: DateSelectorValue) => void
  defaultFilterType?: DateSelectorFilterType
  showInput?: boolean
  label?: string
  i18n?: Partial<DateSelectorI18nConfig>
  className?: string
  style?: CSSProperties
}

/** 时间周期选择器本体：比较方式（is / before / after / between）+ 粒度（日 / 月 / 季 / 半年 / 年）+ 对应的网格。 */
export function DateSelector({ value, onChange, defaultFilterType = 'is', showInput = true, label, i18n: i18nOverride, className, style, ...props }: DateSelectorProps) {
  const { accent, defaultPeriod, allowRange, showOperators, radius, yearSpan, maxYear, spring } = { ...defaults, ...props }
  const reduced = Boolean(useReducedMotion())
  const mergedI18n = useMemo(() => ({ ...DEFAULT_DATE_SELECTOR_I18N, ...i18nOverride }), [i18nOverride])
  const minYear = maxYear - Math.max(1, Math.round(yearSpan)) + 1

  const {
    periodType,
    filterType,
    selectedDate,
    selectedEndDate,
    calendarMonth,
    selectedYear,
    selectedMonth,
    selectedQuarter,
    selectedHalfYear,
    rangeStart,
    rangeEnd,
    hoverDate,
    years,
    currentValue,
    setPeriodType,
    setFilterType,
    setCalendarMonth,
    setHoverDate,
    clearSelection,
    handleDayClick,
    handlePeriodSelect,
    handleYearSelect,
    isInRange,
    isYearInRange,
  } = useDateSelector({ value, onChange, defaultPeriodType: defaultPeriod as DateSelectorPeriodType, defaultFilterType, allowRange, minYear, maxYear })

  const displayValue = formatDateValue(currentValue, mergedI18n)

  // 网格切换或选中变化时，把相关年份滚到可视区顶部（没有选中就停在最近一年）。
  const scroller = useRef<HTMLDivElement>(null)
  const targetYear = rangeStart?.year ?? selectedYear ?? maxYear
  useLayoutEffect(() => {
    const el = scroller.current
    const row = el?.querySelector<HTMLElement>(`[data-year="${targetYear}"]`)
    if (el && row) el.scrollTop = row.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop
  }, [periodType, targetYear])

  const filterItems: { value: DateSelectorFilterType; label: string }[] = [
    { value: 'is', label: mergedI18n.filterTypes.is },
    { value: 'before', label: mergedI18n.filterTypes.before },
    { value: 'after', label: mergedI18n.filterTypes.after },
    ...(allowRange ? [{ value: 'between' as const, label: mergedI18n.filterTypes.between }] : []),
  ]

  return (
    <DateSelectorContext.Provider value={{ i18n: mergedI18n, spring, reduced }}>
      <div className={cn('w-full space-y-4 sm:w-[470px]', className)} style={{ '--accent': accent, '--on-accent': readable(accent), '--r': `${radius}px`, ...style } as CSSProperties}>
        {(label || showOperators) && (
          <div className="flex flex-wrap items-center gap-3">
            {label && <h3 className="text-sm font-medium">{label}</h3>}
            {showOperators && <Tabs value={filterType} onChange={setFilterType} items={filterItems} label="Operator" className="bg-muted/80" triggerClassName="py-1" />}
          </div>
        )}
        {showInput && (
          <div className="relative">
            <input
              type="text"
              value={displayValue}
              readOnly
              aria-label={mergedI18n.selectDate}
              placeholder={filterType === 'between' ? mergedI18n.rangePlaceholder : mergedI18n.placeholder}
              className="border-input dark:bg-input/30 h-9 w-full min-w-0 rounded-(--r) border bg-transparent px-3 pe-8 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-(--accent) focus-visible:ring-2 focus-visible:ring-(--accent)/40"
            />
            {displayValue && (
              <button type="button" aria-label={mergedI18n.clear} onClick={clearSelection} className="absolute end-2.5 top-1/2 grid size-4 -translate-y-1/2 cursor-pointer place-items-center rounded-xs opacity-70 transition-opacity outline-none hover:opacity-100 focus-visible:ring-2 focus-visible:ring-(--accent)/60">
                <svg {...iconProps}>
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        <DateSelectorPeriodTabs value={periodType} onChange={setPeriodType} calendarMonth={calendarMonth} onMonthChange={setCalendarMonth} />

        {periodType === 'day' ? (
          <div className="w-full pb-1">
            <DateSelectorDayPicker currentMonth={calendarMonth} selectedDate={selectedDate} selectedEndDate={selectedEndDate} onDayClick={handleDayClick} isRange={filterType === 'between' && allowRange} onDayHover={setHoverDate} hoverDate={hoverDate} />
          </div>
        ) : (
          <div ref={scroller} key={periodType} className="h-[200px] w-full overflow-y-auto overscroll-contain pe-3 [scrollbar-width:thin]">
            {periodType === 'month' && <DateSelectorPeriodGrid years={years} items={mergedI18n.monthsShort} selectedYear={selectedYear} selectedValue={selectedMonth} rangeStart={rangeStart} rangeEnd={rangeEnd} isInRange={isInRange} onSelect={handlePeriodSelect} columns={3} />}
            {periodType === 'quarter' && <DateSelectorPeriodGrid years={years} items={mergedI18n.quarters} selectedYear={selectedYear} selectedValue={selectedQuarter} rangeStart={rangeStart} rangeEnd={rangeEnd} isInRange={isInRange} onSelect={handlePeriodSelect} columns={4} />}
            {periodType === 'half-year' && <DateSelectorPeriodGrid years={years} items={mergedI18n.halfYears} selectedYear={selectedYear} selectedValue={selectedHalfYear} rangeStart={rangeStart} rangeEnd={rangeEnd} isInRange={isInRange} onSelect={handlePeriodSelect} columns={2} />}
            {periodType === 'year' && <DateSelectorYearList years={years} selectedYear={selectedYear} rangeStart={rangeStart} rangeEnd={rangeEnd} isYearInRange={isYearInRange} onSelect={handleYearSelect} />}
          </div>
        )}
      </div>
    </DateSelectorContext.Provider>
  )
}

export type DatePeriodSelectorProps = DateSelectorProps & {
  /** 受控的弹层开关（演示自动播放用）；不传则自己管理。 */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** 已应用的值（受控）；不传则自己管理。 */
  applied?: DateSelectorValue
  onApply?: (value: DateSelectorValue | undefined) => void
  /** 弹层里正在编辑的值（受控，演示用）。 */
  draft?: DateSelectorValue
  triggerLabel?: string
}

/** 触发按钮 + 弹层 + 应用 / 取消（对应上游 c-date-selector-2 的用法）。Esc 或点击外部关闭。 */
export function DatePeriodSelector({ open: openProp, onOpenChange, applied, onApply, draft, triggerLabel = 'Select a date', label = 'Due date', className, style, ...props }: DatePeriodSelectorProps) {
  const { accent, radius } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const [innerOpen, setInnerOpen] = useState(false)
  const [innerValue, setInnerValue] = useState<DateSelectorValue | undefined>()
  const [internalValue, setInternalValue] = useState<DateSelectorValue | undefined>()
  const open = openProp ?? innerOpen
  const value = applied ?? innerValue
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setInnerOpen(next)
      onOpenChange?.(next)
    },
    [openProp, onOpenChange],
  )

  useEffect(() => {
    if (open) setInternalValue(value)
  }, [open, value])

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open, setOpen])

  const apply = () => {
    if (applied === undefined) setInnerValue(internalValue)
    onApply?.(internalValue)
    setOpen(false)
    trigger.current?.focus()
  }
  const cancel = () => {
    setInternalValue(value)
    setOpen(false)
    trigger.current?.focus()
  }

  const displayText = (value ? formatDateValue(value) : '') || triggerLabel

  return (
    <div ref={root} className={cn('relative inline-block', className)} style={{ '--accent': accent, '--on-accent': readable(accent), '--r': `${radius}px`, ...style } as CSSProperties}>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen(!open)}
        className="border-input bg-background hover:bg-muted dark:bg-input/30 dark:hover:bg-input/50 inline-flex h-9 w-56 items-center justify-start gap-2 rounded-(--r) border px-3 text-sm font-medium whitespace-nowrap shadow-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-(--accent)/60"
      >
        <svg {...iconProps} className="text-muted-foreground shrink-0">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
        <span className={cn('truncate', !value && 'text-muted-foreground')}>{displayText}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="dialog"
            aria-label={label}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.stopPropagation()
                cancel()
              }
            }}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.16, ease: [0.2, 0, 0, 1] }}
            className="bg-popover text-popover-foreground absolute start-0 top-full z-50 mt-1 flex w-[min(calc(100vw-2rem),calc(470px+1.5rem+2px))] origin-top-left flex-col gap-3 rounded-[calc(var(--r)+4px)] border shadow-lg shadow-black/20"
          >
            <div className="p-3">
              <DateSelector {...props} value={draft ?? internalValue} onChange={setInternalValue} label={label} className="sm:w-full" />
            </div>
            <div className="bg-border h-px w-full" />
            <div className="flex justify-end gap-2 p-3 pt-0">
              <button type="button" onClick={cancel} className="border-input bg-background hover:bg-muted dark:bg-input/30 dark:hover:bg-input/50 inline-flex h-9 items-center rounded-(--r) border px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-(--accent)/60">
                {DEFAULT_DATE_SELECTOR_I18N.cancel}
              </button>
              <button type="button" onClick={apply} className="inline-flex h-9 items-center rounded-(--r) bg-(--accent) px-4 text-sm font-medium text-(--on-accent) transition-[filter] outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-(--accent)/60 focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-popover)">
                {DEFAULT_DATE_SELECTOR_I18N.apply}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
