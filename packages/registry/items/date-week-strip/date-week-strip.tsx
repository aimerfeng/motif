// SPDX-License-Identifier: MIT
// Copyright (c) 2023 — Present shadcnblocks
// Source: https://github.com/shadcnblocks/kibo/blob/3d63cdb/packages/mini-calendar/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { LayoutGroup, motion, useReducedMotion } from 'motion/react'
import {
  createContext,
  useContext,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
} from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#6366f1',
  days: 7,
  weekStart: 'monday',
  pillStyle: 'solid',
  showMarkers: true,
  radius: 10,
  spring: {
    visualDuration: 0.35,
    bounce: 0.2,
  },
}
/* @motif:end */

type Options = {
  accent: string
  days: number
  weekStart: string
  pillStyle: string
  showMarkers: boolean
  radius: number
  spring: { visualDuration: number; bounce: number }
}

// Small date helpers (replace date-fns)
const addDays = (date: Date, amount: number) => {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}
const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const isToday = (date: Date) => isSameDay(date, new Date())
const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Aligns a date to the start of its week ('monday' | 'sunday'); 'today' keeps the date. */
export const alignStart = (date: Date, weekStart: string) => {
  const d = startOfDay(date)
  if (weekStart === 'monday') return addDays(d, -((d.getDay() + 6) % 7))
  if (weekStart === 'sunday') return addDays(d, -d.getDay())
  return d
}

// Helper function to get array of consecutive dates
const getDays = (startDate: Date, count: number): Date[] => {
  const days: Date[] = []
  for (let i = 0; i < count; i++) days.push(addDays(startDate, i))
  return days
}

// Helper function to format date
const formatDate = (date: Date) => ({ weekday: WEEKDAYS[date.getDay()] ?? '', month: MONTHS[date.getMonth()] ?? '', day: String(date.getDate()) })

/** Picks dark or light ink for text on top of a hex color. */
const inkFor = (hex: string) => {
  const m = hex.replace('#', '')
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m.slice(0, 6)
  const [r = 0, g = 0, b = 0] = [0, 2, 4].map((i) => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return lum > 0.36 ? '#0a0a0a' : '#ffffff'
}

// Controllable state (replaces @radix-ui/react-use-controllable-state)
function useControllableState<T>(prop: T | undefined, defaultProp: T, onChange?: (value: T) => void) {
  const [inner, setInner] = useState(defaultProp)
  const value = prop !== undefined ? prop : inner
  const setValue = (next: T) => {
    if (prop === undefined) setInner(next)
    onChange?.(next)
  }
  return [value, setValue] as const
}

// Context for sharing state between components
type MiniCalendarContextType = {
  selectedDate: Date | null | undefined
  onDateSelect: (date: Date) => void
  startDate: Date
  onNavigate: (direction: 'prev' | 'next') => void
  days: number
  options: Options
  markers: Date[]
  layoutId: string
}

const MiniCalendarContext = createContext<MiniCalendarContextType | null>(null)

const useMiniCalendar = () => {
  const context = useContext(MiniCalendarContext)
  if (!context) throw new Error('MiniCalendar components must be used within MiniCalendar')
  return context
}

export type MiniCalendarProps = Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue'> &
  Partial<Options> & {
    value?: Date
    defaultValue?: Date
    onValueChange?: (date: Date | undefined) => void
    startDate?: Date
    defaultStartDate?: Date
    onStartDateChange?: (date: Date | undefined) => void
    /** Days that have events; each shows a small marker. */
    markers?: Date[]
  }

export const MiniCalendar = ({
  value,
  defaultValue,
  onValueChange,
  startDate,
  defaultStartDate,
  onStartDateChange,
  markers = [],
  className,
  children,
  style,
  ...rest
}: MiniCalendarProps) => {
  const { accent, days, weekStart, pillStyle, showMarkers, radius, spring, ...props } = { ...(defaults as Options), ...rest }
  const options: Options = { accent, days, weekStart, pillStyle, showMarkers, radius, spring }
  const layoutId = useId()
  const [selectedDate, setSelectedDate] = useControllableState<Date | undefined>(value, defaultValue, onValueChange)
  const [currentStartDate, setCurrentStartDate] = useControllableState<Date | undefined>(
    startDate,
    defaultStartDate ?? alignStart(new Date(), weekStart),
    onStartDateChange,
  )

  const handleNavigate = (direction: 'prev' | 'next') => {
    setCurrentStartDate(addDays(currentStartDate || new Date(), direction === 'next' ? days : -days))
  }

  const contextValue: MiniCalendarContextType = {
    selectedDate: selectedDate || null,
    onDateSelect: setSelectedDate,
    startDate: currentStartDate || new Date(),
    onNavigate: handleNavigate,
    days,
    options,
    markers,
    layoutId,
  }

  return (
    <MiniCalendarContext.Provider value={contextValue}>
      <div
        role="group"
        aria-label="Choose a date"
        className={cn('flex items-center gap-1 border bg-background p-1.5 sm:gap-2 sm:p-2', className)}
        style={{ borderRadius: radius + 6, ...style }}
        {...props}
      >
        {children}
      </div>
    </MiniCalendarContext.Provider>
  )
}

export type MiniCalendarNavigationProps = ButtonHTMLAttributes<HTMLButtonElement> & { direction: 'prev' | 'next' }

export const MiniCalendarNavigation = ({ direction, children, onClick, className, ...props }: MiniCalendarNavigationProps) => {
  const { onNavigate, days, options } = useMiniCalendar()

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    onNavigate(direction)
    onClick?.(event)
  }

  return (
    <button
      type="button"
      aria-label={direction === 'prev' ? `Previous ${days} days` : `Next ${days} days`}
      onClick={handleClick}
      className={cn(
        'grid size-8 shrink-0 place-items-center text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--c) sm:size-9',
        className,
      )}
      style={{ '--c': options.accent, borderRadius: options.radius } as CSSProperties}
      {...props}
    >
      {children ?? (
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d={direction === 'prev' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
        </svg>
      )}
    </button>
  )
}

export type MiniCalendarDaysProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & { children: (date: Date) => ReactNode }

export const MiniCalendarDays = ({ className, children, ...props }: MiniCalendarDaysProps) => {
  const { startDate, days: dayCount } = useMiniCalendar()
  const days = getDays(startDate, dayCount)
  return (
    <LayoutGroup>
      <div className={cn('flex min-w-0 flex-1 items-center gap-1', className)} {...props}>
        {days.map((date) => children(date))}
      </div>
    </LayoutGroup>
  )
}

export type MiniCalendarDayProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & { date: Date }

export const MiniCalendarDay = ({ date, className, style, ...props }: MiniCalendarDayProps) => {
  const { selectedDate, onDateSelect, options, markers, layoutId } = useMiniCalendar()
  const reduced = useReducedMotion()
  const { weekday, month, day } = formatDate(date)
  const isSelected = selectedDate ? isSameDay(date, selectedDate) : false
  const isTodayDate = isToday(date)
  const events = options.showMarkers ? markers.filter((m) => isSameDay(m, date)).length : 0
  const solid = options.pillStyle === 'solid'
  const ink = inkFor(options.accent)
  const selectedInk = isSelected && solid ? ink : undefined

  const pill: CSSProperties =
    options.pillStyle === 'solid'
      ? { backgroundColor: options.accent }
      : options.pillStyle === 'soft'
        ? { backgroundColor: `color-mix(in oklab, ${options.accent} 24%, transparent)` }
        : { boxShadow: `inset 0 0 0 1.5px ${options.accent}` }

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      aria-label={`${weekday}, ${month} ${day}${isTodayDate ? ', today' : ''}${events ? `, ${events} event${events > 1 ? 's' : ''}` : ''}`}
      onClick={() => onDateSelect(date)}
      className={cn(
        'relative flex h-auto min-w-0 flex-1 flex-col items-center gap-0 px-1 py-2 text-xs outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--c) sm:min-w-[3rem] sm:px-2',
        !isSelected && 'hover:bg-accent',
        isTodayDate && !isSelected && 'bg-accent',
        className,
      )}
      style={{ '--c': options.accent, borderRadius: options.radius, ...style } as CSSProperties}
      {...props}
    >
      {isSelected && (
        <motion.span
          aria-hidden
          layoutId={layoutId}
          className="absolute inset-0"
          style={{ ...pill, borderRadius: options.radius }}
          transition={reduced ? { duration: 0 } : { type: 'spring', visualDuration: options.spring.visualDuration, bounce: options.spring.bounce }}
        />
      )}
      <span
        className={cn('relative text-[10px] font-medium text-muted-foreground', isSelected && !solid && 'text-foreground/80')}
        style={selectedInk ? { color: selectedInk, opacity: 0.75 } : undefined}
      >
        {weekday}
      </span>
      <span className="relative text-sm font-semibold text-foreground tabular-nums" style={selectedInk ? { color: selectedInk } : undefined}>
        {day}
      </span>
      <span aria-hidden className="relative mt-0.5 flex h-1 items-center gap-0.5">
        {isTodayDate && <span className="size-1 rounded-full" style={{ backgroundColor: selectedInk ?? options.accent }} />}
        {Array.from({ length: Math.min(events, 3) }, (_, i) => (
          <span key={i} className="size-1 rounded-full bg-muted-foreground/70" style={selectedInk ? { backgroundColor: selectedInk, opacity: 0.6 } : undefined} />
        ))}
      </span>
    </button>
  )
}

export type DateWeekStripProps = Omit<MiniCalendarProps, 'children'>

/** Week strip date picker: arrows page by `days`, the selected pill glides between days. */
export function DateWeekStrip(props: DateWeekStripProps) {
  return (
    <MiniCalendar {...props}>
      <MiniCalendarNavigation direction="prev" />
      <MiniCalendarDays>{(date) => <MiniCalendarDay date={date} key={date.toISOString()} />}</MiniCalendarDays>
      <MiniCalendarNavigation direction="next" />
    </MiniCalendar>
  )
}
