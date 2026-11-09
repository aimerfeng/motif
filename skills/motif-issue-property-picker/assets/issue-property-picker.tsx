// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Keenthemes Inc
// Source: https://github.com/keenthemes/reui/blob/6e433dd/registry-reui/bases/base/components/combobox/c-combobox-21.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  property: 'status',
  accent: '#6366f1',
  radius: 8,
  triggerStyle: 'outline',
  showShortcuts: true,
  spring: {
    visualDuration: 0.3,
    bounce: 0.35,
  },
  width: 240,
}
/* @motif:end */

export type Property = 'status' | 'priority' | 'assignee'

export type PropertyOption = {
  value: string
  label: string
  /** 搜索时额外匹配的文字。 */
  searchText?: string
  /** 名称后的灰色补充（如 "(You)"）。 */
  note?: string
  group?: string
}

/* ---------- status（c-combobox-21） ---------- */

export const statusOptions: PropertyOption[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'planned', label: 'Planned' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

function StatusGlyph({ value, className }: { value: string; className?: string }) {
  const base = cn('size-4 shrink-0', className)
  switch (value) {
    case 'backlog':
      return (
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={cn(base, 'text-muted-foreground/70')}>
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.2 2.2" />
        </svg>
      )
    case 'planned':
      return (
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={cn(base, 'text-foreground/70')}>
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )
    case 'in-progress':
      return (
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={cn(base, 'text-sky-500')}>
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 4.5a3.5 3.5 0 0 1 0 7z" fill="currentColor" />
        </svg>
      )
    case 'paused':
      return (
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={cn(base, 'text-amber-500')}>
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6.5 5.75v4.5M9.5 5.75v4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    case 'completed':
      return (
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={cn(base, 'text-emerald-500')}>
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="m5.5 8.2 1.7 1.7 3.3-3.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    default:
      return (
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={cn(base, 'text-muted-foreground')}>
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="m6 6 4 4M10 6l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
  }
}

/* ---------- priority（c-combobox-22） ---------- */

export const priorityOptions: PropertyOption[] = [
  { value: 'none', label: 'No Priority' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

function Bars({ level, className }: { level: number; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={cn('size-4 shrink-0', className)}>
      <rect x="3" y="9" width="2.5" height="4" rx="1" fill="currentColor" />
      <rect x="7" y="6" width="2.5" height="7" rx="1" fill="currentColor" opacity={level >= 2 ? 1 : 0.28} />
      <rect x="11" y="3" width="2.5" height="10" rx="1" fill="currentColor" opacity={level >= 3 ? 1 : 0.28} />
    </svg>
  )
}

function PriorityGlyph({ value, className }: { value: string; className?: string }) {
  switch (value) {
    case 'low':
      return <Bars level={1} className={cn('text-foreground', className)} />
    case 'medium':
      return <Bars level={2} className={cn('text-foreground', className)} />
    case 'high':
      return <Bars level={3} className={cn('text-foreground', className)} />
    case 'urgent':
      return (
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={cn('size-4 shrink-0 text-yellow-500', className)}>
          <path d="M7.13 2.5a1 1 0 0 1 1.74 0l5.2 9.5a1 1 0 0 1-.88 1.5H2.81a1 1 0 0 1-.88-1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M8 6.5v2.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="8" cy="11.2" r=".85" fill="currentColor" />
        </svg>
      )
    default:
      return (
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={cn('size-4 shrink-0 text-muted-foreground', className)}>
          <circle cx="3.5" cy="8" r="1.25" fill="currentColor" />
          <circle cx="8" cy="8" r="1.25" fill="currentColor" />
          <circle cx="12.5" cy="8" r="1.25" fill="currentColor" />
        </svg>
      )
  }
}

/* ---------- assignee（c-combobox-28） ---------- */

export const assigneeOptions: PropertyOption[] = [
  { value: 'none', label: 'No assignee', searchText: 'unassigned clear remove' },
  { value: 'alex-morgan', label: 'Alex Morgan', note: '(You)', group: 'Team members', searchText: 'current user owner' },
  { value: 'emma-carter', label: 'Emma Carter', group: 'Team members', searchText: 'product design' },
  { value: 'ryan-mitchell', label: 'Ryan Mitchell', group: 'Team members', searchText: 'engineering backend' },
  { value: 'olivia-bennett', label: 'Olivia Bennett', group: 'Team members', searchText: 'growth marketing' },
  { value: 'ethan-brooks', label: 'Ethan Brooks', group: 'Team members', searchText: 'operations' },
  { value: 'invite', label: 'Invite...', group: 'New user', searchText: 'new user teammate member collaborator' },
]

/* 首字母头像：用名字算出色相，按亮度选深浅字色。 */
const AVATAR_COLORS = ['#f97316', '#0ea5e9', '#a855f7', '#10b981', '#f43f5e', '#eab308', '#64748b']
function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}
function ink(hex: string) {
  const n = parseInt(hex.replace('#', '').padEnd(6, '0').slice(0, 6), 16)
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  const l = 0.2126 * ch[0]! + 0.7152 * ch[1]! + 0.0722 * ch[2]!
  return l > 0.36 ? '#0b0b0f' : '#ffffff'
}

function Avatar({ label }: { label: string }) {
  const bg = AVATAR_COLORS[hash(label) % AVATAR_COLORS.length]!
  const initials = label
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <span aria-hidden="true" className="grid size-5 shrink-0 place-items-center rounded-full text-[9px] font-semibold" style={{ background: bg, color: ink(bg) }}>
      {initials}
    </span>
  )
}

function AssigneeGlyph({ option }: { option: PropertyOption }) {
  if (option.value === 'none')
    return (
      <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="size-4 shrink-0 text-muted-foreground">
        <circle cx="8" cy="5.5" r="2.75" stroke="currentColor" strokeWidth="1.4" />
        <path d="M2.75 13.5c.6-2.4 2.7-3.9 5.25-3.9s4.65 1.5 5.25 3.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    )
  if (option.value === 'invite')
    return (
      <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="size-4 shrink-0 text-muted-foreground">
        <path d="M14 2 7 9M14 2l-4.5 12L7 9 2 6.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    )
  return <Avatar label={option.label} />
}

/* ---------- 通用 ---------- */

const CONFIG: Record<Property, { options: PropertyOption[]; placeholder: string; search: string; empty: string; label: string }> = {
  status: { options: statusOptions, placeholder: 'Set status', search: 'Change status', empty: 'No statuses found.', label: 'Status' },
  priority: { options: priorityOptions, placeholder: 'Set priority', search: 'Change priority', empty: 'No priorities found.', label: 'Priority' },
  assignee: { options: assigneeOptions, placeholder: 'No assignee', search: 'Select assignee', empty: 'No assignees found.', label: 'Assignee' },
}

export function PropertyGlyph({ property, option }: { property: Property; option: PropertyOption }) {
  if (property === 'status') return <StatusGlyph value={option.value} />
  if (property === 'priority') return <PriorityGlyph value={option.value} />
  return <AssigneeGlyph option={option} />
}

function OptionLabel({ property, option, trigger }: { property: Property; option: PropertyOption; trigger?: boolean }) {
  const urgent = property === 'priority' && option.value === 'urgent'
  return (
    <span className={cn('flex min-w-0 items-center gap-2', urgent && 'text-yellow-500')}>
      <PropertyGlyph property={property} option={option} />
      <span className="truncate">{option.label}</span>
      {!trigger && option.note ? <span className="font-normal text-muted-foreground">{option.note}</span> : null}
    </span>
  )
}

export type IssuePropertyPickerProps = Partial<typeof defaults> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** 受控的搜索文字（演示自动播放用）。 */
  query?: string
  /** 受控的高亮项（演示自动播放用）。 */
  activeValue?: string
  /** 替换内置选项列表。 */
  options?: PropertyOption[]
  className?: string
  style?: CSSProperties
}

/** 任务属性选择器：触发按钮 + 可搜索的弹出列表；方向键 / Enter 选择，搜索框为空时数字键直接选第 N 项。 */
export function IssuePropertyPicker({
  value,
  defaultValue,
  onValueChange,
  open: openProp,
  onOpenChange,
  query: queryProp,
  activeValue,
  options: optionsProp,
  className,
  style,
  ...props
}: IssuePropertyPickerProps) {
  const { property: propertyRaw, accent, radius, showShortcuts, triggerStyle, spring, width } = { ...defaults, ...props }
  const property = (propertyRaw in CONFIG ? propertyRaw : 'status') as Property
  const config = CONFIG[property]
  const options = optionsProp ?? config.options
  const reduced = useReducedMotion()
  const id = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const [innerValue, setInnerValue] = useState(defaultValue ?? (property === 'status' ? 'planned' : options[0]!.value))
  const [innerOpen, setInnerOpen] = useState(false)
  const [innerQuery, setInnerQuery] = useState('')
  const [innerActive, setInnerActive] = useState<string | null>(null)
  const current = value ?? innerValue
  const open = openProp ?? innerOpen
  const query = queryProp ?? innerQuery
  const selected = options.find((o) => o.value === current) ?? null

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => `${o.label} ${o.searchText ?? ''}`.toLowerCase().includes(q))
  }, [options, query])

  const active = activeValue ?? innerActive ?? filtered[0]?.value ?? null

  const setOpen = (next: boolean) => {
    if (openProp === undefined) setInnerOpen(next)
    onOpenChange?.(next)
    if (next) {
      setInnerQuery('')
      setInnerActive(current)
    }
  }

  const choose = (option: PropertyOption) => {
    setOpen(false)
    triggerRef.current?.focus()
    if (option.value === 'invite') return
    if (value === undefined) setInnerValue(option.value)
    onValueChange?.(option.value)
  }

  useEffect(() => {
    if (!open || openProp !== undefined) return
    inputRef.current?.focus()
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, openProp])

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const index = filtered.findIndex((o) => o.value === active)
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const step = e.key === 'ArrowDown' ? 1 : -1
      const next = filtered[(index + step + filtered.length) % filtered.length]
      if (next) setInnerActive(next.value)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const option = filtered[index]
      if (option) choose(option)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
    } else if (!query && /^[1-9]$/.test(e.key)) {
      const option = options[Number(e.key) - 1]
      if (option) {
        e.preventDefault()
        choose(option)
      }
    }
  }

  const transition = reduced ? { duration: 0 } : { type: 'spring' as const, ...spring }
  const listId = `${id}-list`
  let lastGroup: string | undefined

  const rows: ReactNode[] = []
  filtered.forEach((option, i) => {
    if (!query && option.group !== lastGroup && i > 0) {
      rows.push(<div key={`sep-${i}`} role="separator" className="-mx-1 my-1 h-px bg-border" />)
      if (option.group)
        rows.push(
          <div key={`g-${option.group}`} role="presentation" className="px-2 py-1.5 text-xs text-muted-foreground">
            {option.group}
          </div>,
        )
    }
    lastGroup = option.group
    const isActive = option.value === active
    const isSelected = option.value === current
    const shortcut = options.indexOf(option) + 1
    rows.push(
      <div
        key={option.value}
        id={`${id}-${option.value}`}
        role="option"
        aria-selected={isSelected}
        onPointerMove={() => setInnerActive(option.value)}
        onPointerDown={(e) => e.preventDefault()}
        onClick={() => choose(option)}
        className="relative flex cursor-default items-center gap-2 px-2 py-1.5 text-sm text-foreground outline-none select-none"
        style={{ borderRadius: Math.max(2, radius - 3) }}
      >
        {isActive ? (
          <motion.span
            layoutId={reduced ? undefined : `${id}-hl`}
            transition={transition}
            aria-hidden="true"
            className="absolute inset-0 bg-accent"
            style={{ borderRadius: Math.max(2, radius - 3), background: `color-mix(in oklab, ${accent} 16%, transparent)` }}
          />
        ) : null}
        <span className="relative z-10 flex min-w-0 flex-1 items-center">
          <OptionLabel property={property} option={option} />
        </span>
        {isSelected ? (
          <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="relative z-10 size-4 shrink-0" style={{ color: accent }}>
            <path d="m3.5 8.5 3 3 6-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
        {showShortcuts && shortcut <= 9 ? (
          <kbd className="relative z-10 w-3 shrink-0 text-right font-sans text-xs text-muted-foreground tabular-nums">{shortcut}</kbd>
        ) : null}
      </div>,
    )
  })

  return (
    <div ref={rootRef} className={cn('relative max-w-full', className)} style={{ width, ...style }}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`${config.label}: ${selected?.label ?? config.placeholder}`}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) {
            e.preventDefault()
            setOpen(true)
          }
        }}
        className={cn(
          'flex h-9 w-full items-center justify-between gap-2 px-3 text-sm font-normal text-foreground outline-none transition-[background-color,border-color,box-shadow] focus-visible:ring-2',
          triggerStyle === 'ghost' ? 'border border-transparent hover:bg-muted' : 'border border-input bg-background shadow-xs hover:bg-muted/60',
        )}
        style={{ borderRadius: radius, ['--tw-ring-color' as string]: accent }}
      >
        <span className="relative flex min-w-0 items-center overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={selected?.value ?? 'none'}
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.4, rotate: -45, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, rotate: 0, filter: 'blur(0px)' }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.4, rotate: 45, filter: 'blur(4px)' }}
              transition={transition}
              className="flex min-w-0 items-center"
            >
              {selected ? <OptionLabel property={property} option={selected} trigger /> : <span className="truncate text-muted-foreground">{config.placeholder}</span>}
            </motion.span>
          </AnimatePresence>
        </span>
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="pointer-events-none size-4 shrink-0 text-muted-foreground">
          <path d="m5 6.5 3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }}
            transition={reduced ? { duration: 0.1 } : { type: 'spring', visualDuration: 0.18, bounce: 0 }}
            className="absolute top-full left-0 z-50 mt-1 w-full origin-top overflow-hidden border bg-popover p-1 text-popover-foreground shadow-lg"
            style={{ borderRadius: radius + 2 }}
          >
            <div className="mb-1 flex items-center gap-2 border-b px-2 pb-1">
              <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="size-4 shrink-0 text-muted-foreground">
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={active ? `${id}-${active}` : undefined}
                aria-label={config.search}
                value={query}
                onChange={(e) => {
                  setInnerQuery(e.target.value)
                  setInnerActive(null)
                }}
                onKeyDown={onKeyDown}
                placeholder={config.search}
                className="h-8 w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div id={listId} role="listbox" aria-label={config.label} className="max-h-72 overflow-y-auto">
              {filtered.length ? rows : <div className="py-6 text-center text-sm text-muted-foreground">{config.empty}</div>}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
