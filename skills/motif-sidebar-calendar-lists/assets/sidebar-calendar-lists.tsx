// SPDX-License-Identifier: MIT
// Copyright (c) 2023 shadcn
// Source: https://github.com/shadcn-ui/ui/blob/08ab84f/apps/v4/registry/new-york-v4/blocks/sidebar-12/components/app-sidebar.tsx
// Modified by Motif; see the item's provenance.
import { cn, cssVars } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type SVGProps,
} from 'react'

/* @motif:defaults */
export const defaults = {
  side: 'left',
  width: 256,
  weekStart: 'sunday',
  showWeekNumbers: false,
  accent: '#2563eb',
  calendarPalette: ['#2563eb', '#16a34a', '#f59e0b', '#e11d48'],
  radius: 10,
}
/* @motif:end */

const MOBILE_BREAKPOINT = 768

/* ---------- 图标：内联 SVG，代替 lucide ---------- */

type IconProps = SVGProps<SVGSVGElement>
function Icon({ children, className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn('size-4 shrink-0', className)}
      {...props}
    >
      {children}
    </svg>
  )
}
const PlusIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12h14M12 5v14" />
  </Icon>
)
const CheckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Icon>
)
const ChevronRightIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m9 18 6-6-6-6" />
  </Icon>
)
const ChevronLeftIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m15 18-6-6 6-6" />
  </Icon>
)
const ChevronsUpDownIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
  </Icon>
)
const PanelLeftIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18" />
  </Icon>
)
const SparklesIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
  </Icon>
)
const BadgeCheckIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m9 12 2 2 4-4" />
  </Icon>
)
const CreditCardIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </Icon>
)
const BellIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </Icon>
)
const LogOutIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </Icon>
)

/* ---------- 颜色：按亮度给强调色挑白字或近黑字 ---------- */

function luminance(hex: string): number | null {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return null
  const digits = match[1]!.length === 3 ? [...match[1]!].map((c) => c + c).join('') : match[1]!
  const value = Number.parseInt(digits, 16)
  const channel = (shift: number) => {
    const c = ((value >> shift) & 255) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0)
}

function inkOn(hex: string): string {
  const fill = luminance(hex)
  if (fill === null) return '#ffffff'
  return 1.05 / (fill + 0.05) >= (fill + 0.05) / 0.051 ? '#ffffff' : '#030304'
}

/* ---------- 日期工具：代替 react-day-picker / date-fns ---------- */

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** 'YYYY-MM-DD' ⇄ 本地日期；只用年月日，避免时区把日期挪一天。 */
export function toISODate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}
function fromISODate(s: string | undefined): Date | null {
  if (!s) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (!m) return null
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
}
function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
}
function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
function isoWeek(d: Date): number {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = t.getUTCDay() || 7
  t.setUTCDate(t.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1))
  return Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}
/** 和 react-day-picker 默认一样：showOutsideDays，只排需要的周数。 */
function monthWeeks(year: number, month: number, weekStartsOn: number): Date[][] {
  const first = new Date(year, month, 1)
  const offset = (first.getDay() - weekStartsOn + 7) % 7
  let cursor = addDays(first, -offset)
  const weeks: Date[][] = []
  do {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(cursor)
      cursor = addDays(cursor, 1)
    }
    weeks.push(week)
  } while (cursor.getMonth() === month)
  return weeks
}

/* ---------- 示例数据（上游 sample data，用户换成虚构的人） ---------- */

const data = {
  user: { name: 'Mira Chen', email: 'mira@example.com', initials: 'MC' },
  calendars: [
    { name: 'My Calendars', items: ['Personal', 'Work', 'Family'] },
    { name: 'Favorites', items: ['Holidays', 'Birthdays'] },
    { name: 'Other', items: ['Travel', 'Reminders', 'Deadlines'] },
  ],
}

/* ---------- Sidebar 上下文（上游 SidebarProvider 的最小版本） ---------- */

type SidebarContextValue = {
  open: boolean
  openMobile: boolean
  isMobile: boolean
  toggleSidebar: () => void
  setOpenMobile: (open: boolean) => void
}
const SidebarContext = createContext<SidebarContextValue | null>(null)

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used within CalendarSidebar.')
  return ctx
}

export function SidebarTrigger({ className, onClick, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { toggleSidebar } = useSidebar()
  return (
    <button
      type="button"
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      className={cn(
        'inline-flex size-7 items-center justify-center rounded-md text-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      onClick={(e) => {
        onClick?.(e)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  )
}

/* ---------- 共用的菜单按钮样式（上游 sidebarMenuButtonVariants） ---------- */

const menuButton =
  'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding,background-color,color] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0'

/* ---------- NavUser：头像 + 下拉菜单（代替 Radix DropdownMenu） ---------- */

function UserAvatar({ initials }: { initials: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary font-medium text-sidebar-primary-foreground text-xs"
    >
      {initials}
    </span>
  )
}

function NavUser({ user }: { user: typeof data.user }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  const onMenuKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const items = [...(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])]
    const i = items.indexOf(document.activeElement as HTMLElement)
    if (e.key === 'Escape' || e.key === 'Tab') {
      if (e.key === 'Escape') e.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const next = (i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
      items[next]?.focus()
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault()
      items[e.key === 'Home' ? 0 : items.length - 1]?.focus()
    }
  }

  const item = (icon: ReactNode, label: string) => (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      onClick={() => setOpen(false)}
      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-hidden focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground [&_svg]:text-muted-foreground"
    >
      {icon}
      {label}
    </button>
  )
  const separator = <div role="separator" className="-mx-1 my-1 h-px bg-border" />

  return (
    <ul data-sidebar="menu" className="flex w-full min-w-0 flex-col gap-1">
      <li data-sidebar="menu-item" className="relative">
        <div ref={rootRef}>
          <button
            ref={triggerRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={open ? menuId : undefined}
            data-state={open ? 'open' : 'closed'}
            onClick={() => setOpen((o) => !o)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setOpen(true)
              }
            }}
            className={cn(
              menuButton,
              'h-12 text-sm data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground',
            )}
          >
            <UserAvatar initials={user.initials} />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4" />
          </button>
          {open && (
            <div
              ref={menuRef}
              id={menuId}
              role="menu"
              aria-label="Account"
              onKeyDown={onMenuKey}
              className="absolute inset-x-0 top-full z-50 mt-1 min-w-56 rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
            >
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <UserAvatar initials={user.initials} />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
              {separator}
              {item(<SparklesIcon />, 'Upgrade to Pro')}
              {separator}
              {item(<BadgeCheckIcon />, 'Account')}
              {item(<CreditCardIcon />, 'Billing')}
              {item(<BellIcon />, 'Notifications')}
              {separator}
              {item(<LogOutIcon />, 'Log out')}
            </div>
          )}
        </div>
      </li>
    </ul>
  )
}

/* ---------- DatePicker：手写月历（上游 ui/calendar 的类名） ---------- */

function DatePicker({
  selected,
  onSelect,
  today,
  weekStartsOn,
  showWeekNumber,
}: {
  selected: Date
  onSelect: (d: Date) => void
  today: Date
  weekStartsOn: number
  showWeekNumber: boolean
}) {
  const [view, setView] = useState({ year: selected.getFullYear(), month: selected.getMonth() })
  const [focusOnRender, setFocusOnRender] = useState(false)
  const gridRef = useRef<HTMLTableElement>(null)
  const captionId = useId()

  // 选中日期跑到别的月份（自动播放或键盘）时，跟着翻页
  useEffect(() => {
    setView((v) =>
      v.year === selected.getFullYear() && v.month === selected.getMonth()
        ? v
        : { year: selected.getFullYear(), month: selected.getMonth() },
    )
  }, [selected])

  useLayoutEffect(() => {
    if (!focusOnRender) return
    gridRef.current?.querySelector<HTMLElement>('[data-focus-target="true"]')?.focus()
    setFocusOnRender(false)
  }, [focusOnRender, selected])

  const weeks = useMemo(() => monthWeeks(view.year, view.month, weekStartsOn), [view, weekStartsOn])
  const inView = selected.getFullYear() === view.year && selected.getMonth() === view.month
  const focusDay = inView ? selected : new Date(view.year, view.month, 1)
  const weekdayOrder = Array.from({ length: 7 }, (_, i) => (i + weekStartsOn) % 7)

  const shiftMonth = (delta: number) =>
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })

  const onGridKey = (e: ReactKeyboardEvent, day: Date) => {
    const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
    let next: Date | null = null
    if (e.key in moves) next = addDays(day, moves[e.key]!)
    else if (e.key === 'PageUp' || e.key === 'PageDown') {
      next = new Date(day.getFullYear(), day.getMonth() + (e.key === 'PageDown' ? 1 : -1), day.getDate())
    } else if (e.key === 'Home') next = addDays(day, -((day.getDay() - weekStartsOn + 7) % 7))
    else if (e.key === 'End') next = addDays(day, 6 - ((day.getDay() - weekStartsOn + 7) % 7))
    if (!next) return
    e.preventDefault()
    onSelect(next)
    setFocusOnRender(true)
  }

  const navButton =
    'inline-flex size-(--cell-size) select-none items-center justify-center rounded-md p-0 outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring'

  return (
    <div data-sidebar="group" className="relative flex w-full min-w-0 flex-col px-0 py-2">
      <div data-slot="calendar" className="group/calendar w-full bg-transparent p-3 [--cell-size:--spacing(8)]">
        <div className="relative flex flex-col gap-4">
          <div className="absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1">
            <button type="button" className={navButton} aria-label="Go to the Previous Month" onClick={() => shiftMonth(-1)}>
              <ChevronLeftIcon />
            </button>
            <button type="button" className={navButton} aria-label="Go to the Next Month" onClick={() => shiftMonth(1)}>
              <ChevronRightIcon />
            </button>
          </div>
          <div className="flex w-full flex-col gap-4">
            <div className="flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)">
              <span id={captionId} aria-live="polite" className="select-none font-medium text-sm">
                {MONTHS[view.month]} {view.year}
              </span>
            </div>
            <table ref={gridRef} role="grid" aria-labelledby={captionId} className="w-full border-collapse">
              <thead aria-hidden="true">
                <tr className="flex">
                  {showWeekNumber && <th className="w-(--cell-size) select-none" />}
                  {weekdayOrder.map((d) => (
                    <th
                      key={d}
                      scope="col"
                      abbr={WEEKDAY_NAMES[d]}
                      className="flex-1 select-none rounded-md font-normal text-[0.8rem] text-muted-foreground"
                    >
                      {WEEKDAYS[d]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeks.map((week) => (
                  <tr key={toISODate(week[0]!)} className="mt-2 flex w-full">
                    {showWeekNumber && (
                      <td className="select-none text-[0.8rem] text-muted-foreground">
                        <div className="flex size-(--cell-size) items-center justify-center text-center">
                          {isoWeek(week[weekStartsOn === 1 ? 3 : 4]!)}
                        </div>
                      </td>
                    )}
                    {week.map((day) => {
                      const outside = day.getMonth() !== view.month
                      const isSelected = sameDay(day, selected)
                      const isToday = sameDay(day, today)
                      const isFocusTarget = sameDay(day, focusDay)
                      return (
                        <td
                          key={toISODate(day)}
                          role="gridcell"
                          aria-selected={isSelected}
                          className="group/day relative aspect-square h-full w-full min-w-0 select-none p-0 text-center"
                        >
                          <button
                            type="button"
                            tabIndex={isFocusTarget ? 0 : -1}
                            data-focus-target={isFocusTarget}
                            data-day={toISODate(day)}
                            data-selected-single={isSelected}
                            data-today={isToday && !isSelected}
                            data-outside={outside}
                            aria-label={`${WEEKDAY_NAMES[day.getDay()]}, ${MONTHS[day.getMonth()]} ${day.getDate()}, ${day.getFullYear()}${isToday ? ' (today)' : ''}`}
                            aria-current={isToday ? 'date' : undefined}
                            onClick={() => onSelect(day)}
                            onKeyDown={(e) => onGridKey(e, day)}
                            className={cn(
                              'flex aspect-square h-(--cell-size) w-full min-w-0 items-center justify-center rounded-md font-normal text-sm leading-none outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:relative focus-visible:z-10 focus-visible:ring-[3px] focus-visible:ring-ring/50',
                              'data-[outside=true]:text-muted-foreground',
                              'data-[today=true]:bg-sidebar-accent data-[today=true]:font-medium data-[today=true]:text-sidebar-accent-foreground',
                              'data-[selected-single=true]:bg-sidebar-primary data-[selected-single=true]:text-sidebar-primary-foreground',
                            )}
                          >
                            {day.getDate()}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Calendars：可折叠的日历分组（代替 Radix Collapsible） ---------- */

function CalendarGroup({
  calendar,
  defaultOpen,
  enabled,
  onToggle,
  colorFor,
}: {
  calendar: { name: string; items: string[] }
  defaultOpen: boolean
  enabled: Record<string, boolean>
  onToggle: (item: string) => void
  colorFor: (item: string) => string
}) {
  const [open, setOpen] = useState(defaultOpen)
  const reduce = useReducedMotion()
  const contentId = useId()

  return (
    <div data-sidebar="group" className="relative flex w-full min-w-0 flex-col p-2 py-0">
      <div data-state={open ? 'open' : 'closed'} className="group/collapsible">
        <button
          type="button"
          data-sidebar="group-label"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={() => setOpen((o) => !o)}
          className="group/label flex h-8 w-full shrink-0 items-center rounded-md px-2 font-medium text-sidebar-foreground text-sm outline-hidden ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0"
        >
          {calendar.name}
          <ChevronRightIcon className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90 motion-reduce:transition-none" />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={contentId}
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={reduce ? { duration: 0 } : { type: 'spring', visualDuration: 0.22, bounce: 0 }}
              className="overflow-hidden"
            >
              <div data-sidebar="group-content" className="w-full text-sm">
                <ul data-sidebar="menu" className="flex w-full min-w-0 flex-col gap-1">
                  {calendar.items.map((item) => {
                    const active = enabled[item] ?? false
                    const color = colorFor(item)
                    return (
                      <li key={item} data-sidebar="menu-item" className="group/menu-item relative">
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={active}
                          onClick={() => onToggle(item)}
                          className={cn(menuButton, 'h-8')}
                        >
                          <div
                            data-active={active}
                            style={cssVars({ '--cal': color, '--cal-ink': inkOn(color) })}
                            className="group/calendar-item flex aspect-square size-4 shrink-0 items-center justify-center rounded-sm border border-sidebar-border text-(--cal-ink) transition-colors data-[active=true]:border-(--cal) data-[active=true]:bg-(--cal)"
                          >
                            <CheckIcon className="hidden size-3 group-data-[active=true]/calendar-item:block" />
                          </div>
                          <span>{item}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ---------- 主组件 ---------- */

export type CalendarSidebarProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 页面内容（上游 SidebarInset 里的部分）。 */
  children?: ReactNode
  /** 受控的选中日期，'YYYY-MM-DD'。 */
  selected?: string
  onSelectedChange?: (date: string) => void
  /** 「今天」，'YYYY-MM-DD'；默认取系统日期。 */
  today?: string
  /** 受控的侧栏展开状态（桌面宽度）。 */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CalendarSidebar({
  className,
  style,
  children,
  selected: selectedProp,
  onSelectedChange,
  today: todayProp,
  open: openProp,
  onOpenChange,
  ...props
}: CalendarSidebarProps) {
  const o = { ...defaults, ...props }
  const reduce = useReducedMotion()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [openState, setOpenState] = useState(true)
  const [openMobile, setOpenMobile] = useState(false)
  const open = openProp ?? openState

  const today = useMemo(() => fromISODate(todayProp) ?? new Date(), [todayProp])
  const [selectedState, setSelectedState] = useState(() => toISODate(today))
  const selected = fromISODate(selectedProp) ?? fromISODate(selectedState) ?? today
  const selectDate = useCallback(
    (d: Date) => {
      const iso = toISODate(d)
      setSelectedState(iso)
      onSelectedChange?.(iso)
    },
    [onSelectedChange],
  )

  // 上游默认每组前两个日历是勾选的
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(data.calendars.flatMap((c) => c.items.map((item, i) => [item, i < 2]))),
  )
  const allItems = useMemo(() => data.calendars.flatMap((c) => c.items), [])
  const palette = o.calendarPalette.length > 0 ? o.calendarPalette : [o.accent]
  const colorFor = (item: string) => palette[allItems.indexOf(item) % palette.length]!

  useLayoutEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const update = () => setIsMobile(el.clientWidth < MOBILE_BREAKPOINT)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!isMobile) setOpenMobile(false)
  }, [isMobile])

  useEffect(() => {
    if (!openMobile) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMobile(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [openMobile])

  const toggleSidebar = useCallback(() => {
    if (isMobile) setOpenMobile((v) => !v)
    else {
      setOpenState(!open)
      onOpenChange?.(!open)
    }
  }, [isMobile, open, onOpenChange])

  const ctx = useMemo<SidebarContextValue>(
    () => ({ open, openMobile, isMobile, toggleSidebar, setOpenMobile }),
    [open, openMobile, isMobile, toggleSidebar],
  )

  const right = o.side === 'right'
  const transition = reduce ? { duration: 0 } : { type: 'spring' as const, visualDuration: 0.25, bounce: 0 }

  const panel = (
    <div
      data-sidebar="sidebar"
      className={cn(
        'flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground',
        right ? 'border-sidebar-border border-l' : 'border-sidebar-border border-r',
      )}
    >
      <div data-sidebar="header" className="flex h-16 flex-col justify-center gap-2 border-sidebar-border border-b p-2">
        <NavUser user={data.user} />
      </div>
      <div data-sidebar="content" className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto">
        <DatePicker
          selected={selected}
          onSelect={selectDate}
          today={today}
          weekStartsOn={o.weekStart === 'monday' ? 1 : 0}
          showWeekNumber={o.showWeekNumbers}
        />
        <div data-sidebar="separator" role="separator" className="mx-0 h-px w-auto shrink-0 bg-sidebar-border" />
        {data.calendars.map((calendar, index) => (
          <Fragment key={calendar.name}>
            <CalendarGroup
              calendar={calendar}
              defaultOpen={index === 0}
              enabled={enabled}
              onToggle={(item) => setEnabled((s) => ({ ...s, [item]: !s[item] }))}
              colorFor={colorFor}
            />
            <div data-sidebar="separator" role="separator" className="mx-0 h-px w-auto shrink-0 bg-sidebar-border" />
          </Fragment>
        ))}
      </div>
      <div data-sidebar="footer" className="flex flex-col gap-2 p-2">
        <ul data-sidebar="menu" className="flex w-full min-w-0 flex-col gap-1">
          <li data-sidebar="menu-item" className="relative">
            <button type="button" className={cn(menuButton, 'h-8')}>
              <PlusIcon />
              <span>New Calendar</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  )

  return (
    <SidebarContext.Provider value={ctx}>
      <div
        ref={wrapperRef}
        data-slot="calendar-sidebar-wrapper"
        className={cn('relative flex min-h-full w-full bg-background', right && 'flex-row-reverse', className)}
        style={cssVars(
          {
            '--sidebar-width': `${o.width}px`,
            '--radius': `${o.radius}px`,
            '--sidebar-primary': o.accent,
            '--sidebar-primary-foreground': inkOn(o.accent),
          },
          style,
        )}
      >
        {!isMobile && (
          <motion.aside
            aria-label="Calendars"
            data-state={open ? 'expanded' : 'collapsed'}
            data-side={o.side}
            initial={false}
            animate={{ width: open ? o.width : 0 }}
            transition={transition}
            className={cn('sticky top-0 z-10 flex h-svh shrink-0 overflow-hidden', right && 'justify-start')}
          >
            <div className="h-full w-(--sidebar-width) shrink-0" inert={!open}>
              {panel}
            </div>
          </motion.aside>
        )}
        {isMobile && (
          <AnimatePresence>
            {openMobile && (
              <>
                <motion.button
                  key="backdrop"
                  type="button"
                  aria-label="Close sidebar"
                  className="fixed inset-0 z-40 bg-black/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={transition}
                  onClick={() => setOpenMobile(false)}
                />
                <motion.aside
                  key="sheet"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Calendars"
                  className={cn('fixed inset-y-0 z-50 h-svh max-w-[85vw]', right ? 'right-0' : 'left-0')}
                  style={{ width: o.width }}
                  initial={{ x: right ? '100%' : '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: right ? '100%' : '-100%' }}
                  transition={transition}
                >
                  <div className="h-full [&>[data-sidebar=sidebar]]:w-full">{panel}</div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>
        )}
        <main data-slot="sidebar-inset" className="relative flex w-full min-w-0 flex-1 flex-col bg-background">
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  )
}
