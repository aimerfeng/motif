// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Keenthemes Inc
// Source: https://github.com/keenthemes/reui/blob/6e433dd/registry-reui/bases/base/reui/filters/filters.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode, type RefObject } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#6366f1',
  chipStyle: 'outline',
  size: 'default',
  radius: 8,
  maxVisible: 2,
  spring: {
    visualDuration: 0.35,
    bounce: 0.25,
  },
}
/* @motif:end */

/* -------------------------------------------------------------------------- */
/*                         Types (filters-types.tsx)                          */
/* -------------------------------------------------------------------------- */

export type FilterValueType = 'text' | 'number' | 'select' | 'multiselect' | 'date'
export type FilterOperatorArity = 'none' | 'one' | 'many' | 'range'

export interface FilterOperator {
  value: string
  label: string
  /** none 去掉值那一段；many 是多选；range 是两端。 */
  arity?: FilterOperatorArity
  inverse?: string
}

export interface FilterOption {
  value: string
  label: string
  icon?: ReactNode
  /** 折叠成一叠时的色点类名（如 "bg-amber-500"）。 */
  dot?: string
  /** 在胶囊里显示成徽章时的底色、描边和文字类名。 */
  badge?: string
}

export interface FilterField {
  id: string
  label: string
  type?: FilterValueType
  icon?: ReactNode
  options?: FilterOption[]
  /** 覆盖该类型的默认条件列表。 */
  operators?: FilterOperator[]
  defaultOperator?: string
  placeholder?: string
  /** 选项列表是否显示搜索框（隐藏时打字仍会过滤）。 */
  searchable?: boolean
  /** 选项条件还没有值时的文字，如 "any status"。 */
  emptyLabel?: string
}

export interface FilterRule {
  id: string
  field: string
  /** 刚添加、还没选条件时为 null：胶囊显示 "Select condition"。 */
  operator: string | null
  value?: unknown
  negated?: boolean
}

/** 当前打开的弹层：添加筛选的字段列表，或某个胶囊的条件 / 值 / 菜单。 */
export type FilterOpen = { kind: 'add' } | { kind: 'operator' | 'value' | 'menu'; ruleId: string }

/* -------------------------------------------------------------------------- */
/*                      Labels and operators (i18n, operators)                */
/* -------------------------------------------------------------------------- */

const LABELS = {
  addFilter: 'Add filter',
  searchFields: 'Search attributes...',
  fieldsLabel: 'Attributes',
  clear: 'Clear',
  apply: 'Apply',
  discard: 'Discard changes',
  empty: 'No results',
  duplicate: 'Duplicate',
  negate: 'Negate',
  remove: 'Remove',
  filtersLabel: 'Filters',
  valuePlaceholder: 'enter text...',
  selectPlaceholder: 'Select...',
  noValue: 'no value',
  selectCondition: 'Select condition',
  incomplete: 'incomplete filter',
  rangeSeparator: 'to',
  chipMenu: (field: string) => `${field} filter options`,
  negated: (operator: string) => `not ${operator}`,
  valueCount: (count: number) => `${count} selected`,
  valueRange: (from: string, to: string) => `${from} to ${to}`,
  countAnnouncement: (count: number) => (count === 1 ? '1 filter applied' : `${count} filters applied`),
}

export const DEFAULT_FILTER_OPERATOR_LABELS: Record<string, string> = {
  contains: 'contains',
  not_contains: 'does not contain',
  starts_with: 'starts with',
  ends_with: 'ends with',
  is: 'is',
  is_not: 'is not',
  is_any_of: 'is any of',
  is_none_of: 'is none of',
  has_any_of: 'has any of',
  has_all_of: 'has all of',
  has_none_of: 'has none of',
  eq: 'equals',
  neq: 'does not equal',
  gt: 'is greater than',
  gte: 'is greater than or equal to',
  lt: 'is less than',
  lte: 'is less than or equal to',
  between: 'is between',
  not_between: 'is not between',
  is_before: 'is before',
  is_after: 'is after',
  is_on_or_before: 'is on or before',
  is_on_or_after: 'is on or after',
  empty: 'is empty',
  not_empty: 'is not empty',
}

type CatalogEntry = { value: string; arity?: FilterOperatorArity; inverse?: string }
const NONE: CatalogEntry[] = [
  { value: 'empty', arity: 'none', inverse: 'not_empty' },
  { value: 'not_empty', arity: 'none', inverse: 'empty' },
]

const CATALOG: Record<FilterValueType, CatalogEntry[]> = {
  text: [
    { value: 'contains', inverse: 'not_contains' },
    { value: 'not_contains', inverse: 'contains' },
    { value: 'starts_with' },
    { value: 'ends_with' },
    { value: 'is', inverse: 'is_not' },
    { value: 'is_not', inverse: 'is' },
    ...NONE,
  ],
  number: [
    { value: 'eq', inverse: 'neq' },
    { value: 'neq', inverse: 'eq' },
    { value: 'gt', inverse: 'lte' },
    { value: 'gte', inverse: 'lt' },
    { value: 'lt', inverse: 'gte' },
    { value: 'lte', inverse: 'gt' },
    { value: 'between', arity: 'range', inverse: 'not_between' },
    { value: 'not_between', arity: 'range', inverse: 'between' },
    ...NONE,
  ],
  select: [
    { value: 'is', inverse: 'is_not' },
    { value: 'is_not', inverse: 'is' },
    { value: 'is_any_of', arity: 'many', inverse: 'is_none_of' },
    { value: 'is_none_of', arity: 'many', inverse: 'is_any_of' },
    ...NONE,
  ],
  multiselect: [
    { value: 'has_any_of', arity: 'many', inverse: 'has_none_of' },
    { value: 'has_all_of', arity: 'many' },
    { value: 'has_none_of', arity: 'many', inverse: 'has_any_of' },
    ...NONE,
  ],
  // 日期条件来自上游 c-filters-5 的 dateOperators（不含区间）。
  date: [
    { value: 'is', inverse: 'is_not' },
    { value: 'is_not', inverse: 'is' },
    { value: 'is_before', inverse: 'is_on_or_after' },
    { value: 'is_after', inverse: 'is_on_or_before' },
    { value: 'is_on_or_before', inverse: 'is_after' },
    { value: 'is_on_or_after', inverse: 'is_before' },
    ...NONE,
  ],
}

function buildOperators(type: FilterValueType): FilterOperator[] {
  return CATALOG[type].map((entry) => ({
    value: entry.value,
    label: DEFAULT_FILTER_OPERATOR_LABELS[entry.value] ?? entry.value,
    arity: entry.arity ?? 'one',
    inverse: entry.inverse,
  }))
}

export const DEFAULT_FILTER_OPERATORS: Record<FilterValueType, FilterOperator[]> = {
  text: buildOperators('text'),
  number: buildOperators('number'),
  select: buildOperators('select'),
  multiselect: buildOperators('multiselect'),
  date: buildOperators('date'),
}

export function resolveFilterOperators(field: FilterField): FilterOperator[] {
  return field.operators ?? DEFAULT_FILTER_OPERATORS[field.type ?? 'text']
}

function getOperator(operators: FilterOperator[], value: string | null | undefined) {
  return value ? operators.find((operator) => operator.value === value) : undefined
}

function arityOf(operator: FilterOperator | undefined): FilterOperatorArity {
  return operator?.arity ?? 'one'
}

/** 换条件时值跟着变形："is" 到 "is any of" 保留已选，收窄时取第一个，none 一律丢掉。 */
function coerceValue(value: unknown, from: FilterOperator | undefined, to: FilterOperator | undefined): unknown {
  const next = arityOf(to)
  if (next === 'none') return undefined
  if (value === undefined || value === null) return value
  if (arityOf(from) === next) return value
  const list = Array.isArray(value) ? (value as unknown[]) : [value]
  if (next === 'many') return list
  if (next === 'one') return list[0]
  return [list[0], list[1]]
}

/** 取反：有声明的反义条件就换过去，否则切换 negated。 */
function negateOperator(operator: FilterOperator | undefined, operators: FilterOperator[], negated: boolean | undefined) {
  if (operator?.inverse) {
    const inverse = getOperator(operators, operator.inverse)
    if (inverse) return { operator: inverse.value, negated: Boolean(negated) }
  }
  return { operator: operator?.value ?? null, negated: !negated }
}

/* -------------------------------------------------------------------------- */
/*                                 Value display                              */
/* -------------------------------------------------------------------------- */

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function toIso(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function fromIso(value: unknown): Date | null {
  if (typeof value !== 'string') return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

/** "MMM d, yyyy"，与上游 formatFilterDate 的默认格式一致。 */
function formatDate(value: unknown) {
  const date = fromIso(value)
  if (!date) return String(value ?? '')
  return `${MONTHS[date.getMonth()]!.slice(0, 3)} ${date.getDate()}, ${date.getFullYear()}`
}

function isEmptyValue(value: unknown) {
  return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)
}

function isOptionBacked(field: FilterField) {
  return field.type === 'select' || field.type === 'multiselect' || Boolean(field.options?.length)
}

/** 徽章：上游 Badge outline 变体（nova 样式）。 */
function Badge({ option }: { option: FilterOption }) {
  return (
    <span className={cn('inline-flex h-5 shrink-0 items-center gap-1 rounded-4xl border border-border px-2 py-0.5 text-xs font-medium whitespace-nowrap text-foreground', option.badge)}>
      {option.label}
    </span>
  )
}

/** 重叠的色点加一个数：选得再多，胶囊也是同一个宽度（c-filters-3 的 StackedDots）。 */
function StackedDots({ options }: { options: FilterOption[] }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="flex items-center">
        {options.slice(0, 4).map((option) => (
          <span key={option.value} className={cn('-ml-1 size-2.5 rounded-full ring-2 ring-background first:ml-0', option.dot ?? 'bg-muted-foreground')} />
        ))}
      </span>
      <span className="text-xs text-muted-foreground tabular-nums">{options.length}</span>
    </span>
  )
}

interface RuleDisplay {
  operatorLabel: string
  valueLabel: ReactNode
  valueText: string
  valueEmpty: boolean
}

/** 一条规则怎么读：条件文字、值的显示和它的纯文本（给无障碍名称用）。 */
function ruleDisplay(rule: FilterRule, field: FilterField, operator: FilterOperator | undefined, maxVisible: number): RuleDisplay {
  const operatorLabel = operator ? (rule.negated ? LABELS.negated(operator.label) : operator.label) : rule.operator || LABELS.selectCondition
  const optionBacked = isOptionBacked(field)
  const valueEmpty = isEmptyValue(rule.value)
  const values = rule.value === undefined || rule.value === null ? [] : Array.isArray(rule.value) ? (rule.value as unknown[]) : [rule.value]
  const resolve = (value: unknown) => field.options?.find((option) => option.value === String(value))
  const show = (value: unknown) => (field.type === 'date' ? formatDate(value) : (resolve(value)?.label ?? String(value ?? '')))

  let valueText: string
  if (valueEmpty) valueText = optionBacked ? LABELS.selectPlaceholder : (field.placeholder ?? LABELS.valuePlaceholder)
  else if (arityOf(operator) === 'range' && Array.isArray(rule.value)) valueText = LABELS.valueRange(show(values[0]), show(values[1]))
  else if (values.length > 1) valueText = LABELS.valueCount(values.length)
  else valueText = show(values[0])

  let valueLabel: ReactNode = valueEmpty && field.emptyLabel ? field.emptyLabel : valueText
  if (optionBacked && !valueEmpty) {
    const options = values.map(resolve).filter((option): option is FilterOption => Boolean(option))
    if (options.length > maxVisible && options.every((option) => option.dot)) {
      valueLabel = <StackedDots options={options} />
    } else if (options.length <= maxVisible && options.length > 0 && options.every((option) => option.badge)) {
      valueLabel = (
        <span className="flex min-w-0 items-center gap-2 overflow-hidden">
          {options.map((option) => (
            <Badge key={option.value} option={option} />
          ))}
        </span>
      )
    } else if (options.length === 1 && options[0]!.icon) {
      valueLabel = (
        <span className="flex min-w-0 items-center gap-1.5">
          {options[0]!.icon}
          <span className="truncate">{valueText}</span>
        </span>
      )
    }
  }
  return { operatorLabel, valueLabel, valueText, valueEmpty }
}

/* -------------------------------------------------------------------------- */
/*                                 Shared chrome                              */
/* -------------------------------------------------------------------------- */

/** 按亮度选深 / 浅字色，任何强调色上的文字都清楚。 */
function ink(hex: string) {
  const n = parseInt(hex.replace('#', '').padEnd(6, '0').slice(0, 6), 16)
  const channel = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  const l = 0.2126 * channel[0]! + 0.7152 * channel[1]! + 0.0722 * channel[2]!
  return l > 0.36 ? '#0b0b0f' : '#ffffff'
}

const SIZES = {
  sm: { seg: 'h-7 gap-1 px-2.5 text-[0.8rem] [&_svg:not([class*=size-])]:size-3.5', icon: 'size-7', gap: 'gap-1.5' },
  default: { seg: 'h-8 gap-1.5 px-2.5 text-sm [&_svg:not([class*=size-])]:size-4', icon: 'size-8', gap: 'gap-2' },
}

/** 一段胶囊 / 一个描边按钮（上游 ButtonGroupText + Button outline，nova 样式）。 */
const SEG =
  'flex shrink-0 items-center border border-border bg-background font-medium whitespace-nowrap outline-none select-none transition-[color,background-color,border-color,box-shadow] focus-visible:relative focus-visible:z-10 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:border-input dark:bg-input/30 [&_svg]:pointer-events-none [&_svg]:shrink-0'
const OUTLINE_BUTTON = cn(SEG, 'cursor-default justify-center rounded-(--filter-radius) hover:bg-muted hover:text-foreground aria-expanded:bg-muted dark:hover:bg-input/50')

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={d} />
    </svg>
  )
}
const ICON = {
  check: 'm3.5 8.5 3 3 6-7',
  x: 'm4.5 4.5 7 7m0-7-7 7',
  more: 'M8 3.25v.01M8 8v.01M8 12.75v.01',
  filterPlus: 'M2.5 4h7M4.5 8h5M6.5 12h3M12.5 5.5v5M10 8h5',
  copy: 'M5.5 5.5V3.75c0-.69.56-1.25 1.25-1.25h5.5c.69 0 1.25.56 1.25 1.25v5.5c0 .69-.56 1.25-1.25 1.25H10.5M3.75 5.5h5.5c.69 0 1.25.56 1.25 1.25v5.5c0 .69-.56 1.25-1.25 1.25h-5.5c-.69 0-1.25-.56-1.25-1.25v-5.5c0-.69.56-1.25 1.25-1.25Z',
  swap: 'M2.5 5.5h11m0 0L11 3m2.5 2.5L11 8M13.5 10.5h-11m0 0L5 8m-2.5 2.5L5 13',
  trash: 'M2.75 4.25h10.5M6.25 4.25V3c0-.41.34-.75.75-.75h2c.41 0 .75.34.75.75v1.25M4 4.25l.6 8.5c.05.56.51 1 1.07 1h4.66c.56 0 1.02-.44 1.07-1l.6-8.5',
  left: 'm9.5 4-4 4 4 4',
  right: 'm6.5 4 4 4-4 4',
}

/** 从锚点一路累加 offsetLeft / offsetTop 到根元素：不受弹簧动画里 transform 的影响。 */
function offsetWithin(element: HTMLElement, root: HTMLElement) {
  let left = 0
  let top = 0
  let node: HTMLElement | null = element
  while (node && node !== root) {
    left += node.offsetLeft
    top += node.offsetTop
    const parent = node.offsetParent as HTMLElement | null
    if (parent && parent !== root && !root.contains(parent)) break
    node = parent
  }
  if (node === root) return { left, top }
  const a = element.getBoundingClientRect()
  const b = root.getBoundingClientRect()
  return { left: a.left - b.left, top: a.top - b.top }
}

/* -------------------------------------------------------------------------- */
/*                              Popover (hand-rolled)                         */
/* -------------------------------------------------------------------------- */

interface PopoverPanelProps {
  rootRef: RefObject<HTMLDivElement | null>
  anchor: string
  align: 'start' | 'end'
  reduced: boolean
  onDismiss: (restoreFocus: boolean) => void
  /** 规则变了就重新定位。 */
  revision: unknown
  className?: string
  children: ReactNode
}

/** 替代上游的 Base UI Popover：贴在锚点下方，水平方向夹在根元素以内；外部按下或 Escape 关闭。 */
function PopoverPanel({ rootRef, anchor, align, reduced, onDismiss, revision, className, children }: PopoverPanelProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null)
  const dismiss = useRef(onDismiss)
  useLayoutEffect(() => {
    dismiss.current = onDismiss
  })

  // 规则变化（revision）会挪动锚点，尺寸变化（换行、面板内容）由 ResizeObserver 接住；值不变时 setState 直接跳过。
  useLayoutEffect(() => {
    const root = rootRef.current
    const panel = ref.current
    if (!root || !panel) return
    const place = () => {
      const target = root.querySelector<HTMLElement>(`[data-filter-anchor="${anchor}"]`)
      if (!target) return
      const offset = offsetWithin(target, root)
      const width = panel.offsetWidth
      const raw = align === 'end' ? offset.left + target.offsetWidth - width : offset.left
      const left = Math.round(Math.min(Math.max(0, raw), Math.max(0, root.clientWidth - width)))
      const top = Math.round(offset.top + target.offsetHeight + 4)
      setPos((prev) => (prev && prev.left === left && prev.top === top ? prev : { left, top }))
    }
    place()
    const observer = new ResizeObserver(place)
    observer.observe(root)
    observer.observe(panel)
    return () => observer.disconnect()
  }, [rootRef, anchor, align, revision])

  useEffect(() => {
    const root = rootRef.current
    const onPointerDown = (event: PointerEvent) => {
      const node = event.target as Node
      if (ref.current?.contains(node)) return
      const target = root?.querySelector(`[data-filter-anchor="${anchor}"]`)
      if (target?.contains(node)) return
      dismiss.current(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [rootRef, anchor])

  return (
    <motion.div
      ref={ref}
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return
        event.preventDefault()
        event.stopPropagation()
        dismiss.current(true)
      }}
      className={cn(
        'absolute z-50 flex max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[calc(var(--filter-radius)+2px)] bg-popover text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10',
        align === 'end' ? 'origin-top-right' : 'origin-top-left',
        className,
      )}
      style={{ left: pos?.left ?? 0, top: pos?.top ?? 0, visibility: pos ? 'visible' : 'hidden' }}
    >
      {children}
    </motion.div>
  )
}

/* -------------------------------------------------------------------------- */
/*                         The menu (FilterMenu, cascader)                    */
/* -------------------------------------------------------------------------- */

interface MenuItem {
  value: string
  label: string
  icon?: ReactNode
  destructive?: boolean
}

interface FilterMenuProps {
  items: MenuItem[]
  selected?: string[]
  multiple?: boolean
  /** menu：动作菜单（role="menu"，没有勾）；listbox：选项列表。 */
  role?: 'listbox' | 'menu'
  onSelect: (value: string) => void
  ariaLabel: string
  searchable?: boolean
  searchPlaceholder?: string
  maxHeight?: number
  initialActive?: string | null
  /** 受控的高亮项（演示自动播放用）。 */
  highlight?: string | null
  autoFocus: boolean
}

/** 替代上游基于 Cascader 的 FilterMenu：一个输入框持有焦点和 aria-activedescendant，方向键 / Home / End / Enter 选择。 */
function FilterMenu({ items, selected = [], multiple = false, role = 'listbox', onSelect, ariaLabel, searchable = true, searchPlaceholder, maxHeight = 256, initialActive, highlight, autoFocus }: FilterMenuProps) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [innerActive, setInnerActive] = useState<string | null>(initialActive ?? selected[0] ?? null)
  const isMenu = role === 'menu'

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? items.filter((item) => item.label.toLowerCase().includes(q)) : items
  }, [items, query])

  const candidate = highlight ?? innerActive
  const active = filtered.some((item) => item.value === candidate) ? candidate : (filtered[0]?.value ?? null)

  useEffect(() => {
    if (!autoFocus) return
    if (isMenu) listRef.current?.focus()
    else inputRef.current?.focus()
  }, [autoFocus, isMenu])

  // 高亮项滚进可视区：只动列表自己的 scrollTop，不用 scrollIntoView（会连带滚动外层页面）。
  useEffect(() => {
    const list = listRef.current
    const row = active ? list?.querySelector<HTMLElement>(`[data-value="${CSS.escape(active)}"]`) : null
    if (!list || !row) return
    if (row.offsetTop < list.scrollTop) list.scrollTop = row.offsetTop - 4
    else if (row.offsetTop + row.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = row.offsetTop + row.offsetHeight - list.clientHeight + 4
  }, [active])

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const index = filtered.findIndex((item) => item.value === active)
    const move = (next: number) => {
      event.preventDefault()
      const item = filtered[(next + filtered.length) % filtered.length]
      if (item) setInnerActive(item.value)
    }
    if (event.key === 'ArrowDown') move(index + 1)
    else if (event.key === 'ArrowUp') move(index - 1)
    else if (event.key === 'Home') move(0)
    else if (event.key === 'End') move(filtered.length - 1)
    else if (event.key === 'Enter' || (event.key === ' ' && (isMenu || !searchable))) {
      event.preventDefault()
      if (active) onSelect(active)
    }
  }

  const optionId = (value: string) => `${id}-${value}`

  return (
    <>
      {isMenu ? null : (
        <div className={cn('flex items-center gap-2 border-b border-border px-2.5', !searchable && 'sr-only')}>
          <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="size-4 shrink-0 text-muted-foreground">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded="true"
            aria-controls={`${id}-list`}
            aria-autocomplete="list"
            aria-activedescendant={active ? optionId(active) : undefined}
            aria-label={ariaLabel}
            value={query}
            placeholder={searchPlaceholder ?? 'Search...'}
            onChange={(event) => {
              setQuery(event.target.value)
              setInnerActive(null)
            }}
            onKeyDown={onKeyDown}
            className="h-9 w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      )}
      <div
        ref={listRef}
        id={`${id}-list`}
        role={role}
        aria-label={ariaLabel}
        aria-multiselectable={isMenu ? undefined : multiple}
        aria-activedescendant={isMenu && active ? optionId(active) : undefined}
        tabIndex={isMenu ? -1 : undefined}
        onKeyDown={isMenu ? onKeyDown : undefined}
        className="overflow-y-auto p-1 outline-none"
        style={{ maxHeight }}
      >
        {filtered.length === 0 ? <div className="py-6 text-center text-sm text-muted-foreground">{LABELS.empty}</div> : null}
        {filtered.map((item) => {
          const isActive = item.value === active
          const isSelected = selected.includes(item.value)
          return (
            <div
              key={item.value}
              id={optionId(item.value)}
              data-value={item.value}
              role={isMenu ? 'menuitem' : 'option'}
              aria-selected={isMenu ? undefined : isSelected}
              onPointerMove={() => setInnerActive(item.value)}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => onSelect(item.value)}
              className={cn(
                'relative flex cursor-default items-center gap-2 rounded-[calc(var(--filter-radius)-2px)] py-1.5 pl-2 text-sm outline-none select-none',
                isMenu ? 'pr-2' : 'pr-8',
                item.destructive ? 'text-destructive' : 'text-foreground',
              )}
              style={isActive ? { background: item.destructive ? 'color-mix(in oklab, var(--color-destructive) 14%, transparent)' : 'var(--filter-highlight)' } : undefined}
            >
              {item.icon ? <span className={cn('flex shrink-0 items-center justify-center [&_svg:not([class*=size-])]:size-4', !item.destructive && 'text-muted-foreground')}>{item.icon}</span> : null}
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {!isMenu && isSelected ? (
                <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center text-foreground">
                  <Icon d={ICON.check} className="size-4" />
                </span>
              ) : null}
            </div>
          )
        })}
      </div>
    </>
  )
}

/* -------------------------------------------------------------------------- */
/*                         Editors (filters-editors.tsx)                      */
/* -------------------------------------------------------------------------- */

interface EditorProps {
  field: FilterField
  operator: FilterOperator
  value: unknown
  commit: (value: unknown, close?: boolean) => void
  cancel: () => void
  autoFocus: boolean
  /** 受控的草稿文字和高亮项（演示自动播放用）。 */
  draft?: string
  highlight?: string | null
}

const INPUT =
  'h-8 w-full min-w-0 border border-input bg-transparent px-2.5 py-1 text-sm text-foreground outline-none transition-[color,border-color,box-shadow] placeholder:text-muted-foreground focus-visible:relative focus-visible:z-10 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30'

function commitKeys(commit: () => void, cancel: () => void) {
  return (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
      event.preventDefault()
      commit()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      cancel()
    }
  }
}

/** 确认 / 取消：两个描边图标按钮，和输入框并成一组。 */
function EditorCommitButtons({ onCommit, onCancel }: { onCommit: () => void; onCancel: () => void }) {
  return (
    <>
      <button type="button" aria-label={LABELS.apply} onClick={onCommit} className={cn(OUTLINE_BUTTON, 'size-8 rounded-none border-l-0 px-0')}>
        <Icon d={ICON.check} className="size-4" />
      </button>
      <button type="button" aria-label={LABELS.discard} onClick={onCancel} className={cn(OUTLINE_BUTTON, 'size-8 rounded-l-none border-l-0 px-0')}>
        <Icon d={ICON.x} className="size-4" />
      </button>
    </>
  )
}

function EditorFooter({ onCommit, onCancel, disabled }: { onCommit: () => void; onCancel: () => void; disabled?: boolean }) {
  return (
    <div className="flex items-center justify-end gap-1.5 pt-1">
      <button type="button" onClick={onCancel} className="inline-flex h-8 cursor-default items-center rounded-(--filter-radius) px-2.5 text-sm font-medium text-foreground outline-none transition-[background-color,box-shadow] hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50">
        {LABELS.discard}
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onCommit}
        className="inline-flex h-8 cursor-default items-center rounded-(--filter-radius) bg-(--filter-accent) px-2.5 text-sm font-medium text-(--filter-ink) outline-none transition-[opacity,box-shadow] hover:opacity-90 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
      >
        {LABELS.apply}
      </button>
    </div>
  )
}

function FilterTextEditor({ field, value, commit, cancel, autoFocus, draft: forced }: EditorProps) {
  const [draft, setDraft] = useState(typeof value === 'string' ? value : '')
  const shown = forced ?? draft
  const done = () => commit(shown.trim() === '' ? undefined : shown)
  return (
    <div data-slot="filter-editor" className="flex w-72 max-w-[calc(100vw-2rem)] min-w-0 flex-col gap-2 p-2">
      <div className="flex w-full items-stretch">
        <input
          autoFocus={autoFocus}
          value={shown}
          placeholder={field.placeholder ?? LABELS.valuePlaceholder}
          aria-label={field.label}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={commitKeys(done, cancel)}
          className={cn(INPUT, 'rounded-l-(--filter-radius)')}
        />
        <EditorCommitButtons onCommit={done} onCancel={cancel} />
      </div>
    </div>
  )
}

function FilterNumberEditor({ field, value, commit, cancel, autoFocus }: EditorProps) {
  const [draft, setDraft] = useState(typeof value === 'number' ? String(value) : '')
  const done = () => commit(draft === '' ? undefined : Number(draft))
  return (
    <div data-slot="filter-editor" className="flex w-56 min-w-0 flex-col gap-2 p-2">
      <div className="flex w-full items-stretch">
        <input
          autoFocus={autoFocus}
          type="number"
          value={draft}
          placeholder={field.placeholder}
          aria-label={field.label}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={commitKeys(done, cancel)}
          className={cn(INPUT, 'rounded-l-(--filter-radius)')}
        />
        <EditorCommitButtons onCommit={done} onCancel={cancel} />
      </div>
    </div>
  )
}

function FilterRangeEditor({ field, value, commit, cancel, autoFocus }: EditorProps) {
  const tuple = Array.isArray(value) ? (value as unknown[]) : []
  const [from, setFrom] = useState(tuple[0] === undefined || tuple[0] === null ? '' : String(tuple[0]))
  const [to, setTo] = useState(tuple[1] === undefined || tuple[1] === null ? '' : String(tuple[1]))
  const done = () => commit(from === '' && to === '' ? undefined : [from === '' ? undefined : Number(from), to === '' ? undefined : Number(to)])
  const keys = commitKeys(done, cancel)
  return (
    <div data-slot="filter-editor" className="flex w-64 max-w-[calc(100vw-2rem)] min-w-0 flex-col gap-2 p-2">
      <div className="flex items-center gap-1.5">
        <input autoFocus={autoFocus} type="number" value={from} aria-label={`${field.label} from`} onChange={(event) => setFrom(event.target.value)} onKeyDown={keys} className={cn(INPUT, 'rounded-(--filter-radius)')} />
        <span className="text-xs text-muted-foreground">{LABELS.rangeSeparator}</span>
        <input type="number" value={to} aria-label={`${field.label} to`} onChange={(event) => setTo(event.target.value)} onKeyDown={keys} className={cn(INPUT, 'rounded-(--filter-radius)')} />
      </div>
      <EditorFooter onCommit={done} onCancel={cancel} />
    </div>
  )
}

function OptionEditor({ field, operator, value, commit, cancel, autoFocus, highlight }: EditorProps) {
  const multiple = arityOf(operator) === 'many'
  const selected = useMemo(() => (value === undefined || value === null ? [] : (Array.isArray(value) ? value : [value]).map(String)), [value])
  const items = useMemo(() => (field.options ?? []).map((option) => ({ value: option.value, label: option.label, icon: option.icon })), [field.options])
  return (
    <div data-slot="filter-editor" className="flex w-48 min-w-0 flex-col">
      <FilterMenu
        items={items}
        selected={selected}
        multiple={multiple}
        onSelect={(picked) => {
          if (!multiple) {
            // 再按一次已选的那项是撤销而不是新的选择，直接关闭。
            if (selected.includes(picked)) cancel()
            else commit(picked)
            return
          }
          const next = selected.includes(picked) ? selected.filter((entry) => entry !== picked) : [...selected, picked]
          // 多选每勾一项就提交一次，弹层保持打开。
          commit(next, false)
        }}
        ariaLabel={field.label}
        searchable={field.searchable ?? true}
        searchPlaceholder={field.placeholder}
        highlight={highlight}
        autoFocus={autoFocus}
      />
    </div>
  )
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

/** 替代上游的 react-day-picker Calendar：单月网格，方向键按天 / 周移动，Enter 选中。 */
function FilterDateEditor({ field, value, commit, cancel, autoFocus }: EditorProps) {
  const selected = fromIso(value)
  const [focused, setFocused] = useState<Date>(() => selected ?? new Date())
  const [today] = useState(() => toIso(new Date()))
  const gridRef = useRef<HTMLDivElement>(null)
  const focusDay = useRef(autoFocus)

  useEffect(() => {
    if (!focusDay.current) return
    gridRef.current?.querySelector<HTMLButtonElement>('[tabindex="0"]')?.focus()
  }, [focused])

  const year = focused.getFullYear()
  const month = focused.getMonth()
  const start = new Date(year, month, 1 - new Date(year, month, 1).getDay())
  const days = Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
  const shift = (amount: number, unit: 'day' | 'month') => {
    focusDay.current = unit === 'day'
    setFocused(unit === 'day' ? new Date(year, month, focused.getDate() + amount) : new Date(year, month + amount, Math.min(focused.getDate(), 28)))
  }
  const navButton = 'inline-flex size-7 cursor-default items-center justify-center rounded-[calc(var(--filter-radius)-2px)] text-muted-foreground outline-none transition-[background-color,color,box-shadow] hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50'

  return (
    <div data-slot="filter-editor" className="flex flex-col gap-2 p-2">
      <div className="flex items-center justify-between">
        <button type="button" aria-label="Previous month" onClick={() => shift(-1, 'month')} className={navButton}>
          <Icon d={ICON.left} className="size-4" />
        </button>
        <div aria-live="polite" className="text-sm font-medium">
          {MONTHS[month]} {year}
        </div>
        <button type="button" aria-label="Next month" onClick={() => shift(1, 'month')} className={navButton}>
          <Icon d={ICON.right} className="size-4" />
        </button>
      </div>
      <div
        ref={gridRef}
        role="grid"
        aria-label={field.label}
        className="grid grid-cols-7 gap-y-1"
        onKeyDown={(event) => {
          const steps: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
          const step = steps[event.key]
          if (step !== undefined) {
            event.preventDefault()
            shift(step, 'day')
          } else if (event.key === 'Escape') {
            event.preventDefault()
            event.stopPropagation()
            cancel()
          }
        }}
      >
        {WEEKDAYS.map((day) => (
          <div key={day} role="columnheader" className="flex size-7 items-center justify-center text-[0.8rem] font-normal text-muted-foreground">
            {day}
          </div>
        ))}
        {days.map((day) => {
          const iso = toIso(day)
          const isSelected = selected !== null && iso === toIso(selected)
          const outside = day.getMonth() !== month
          const isFocused = iso === toIso(focused)
          return (
            <button
              key={iso}
              type="button"
              role="gridcell"
              aria-selected={isSelected}
              aria-label={`${MONTHS[day.getMonth()]} ${day.getDate()}, ${day.getFullYear()}`}
              tabIndex={isFocused ? 0 : -1}
              onClick={() => commit(iso)}
              className={cn(
                'inline-flex size-7 cursor-default items-center justify-center rounded-[calc(var(--filter-radius)-2px)] text-sm tabular-nums outline-none transition-[background-color,color,box-shadow] focus-visible:ring-3 focus-visible:ring-ring/50',
                isSelected ? 'bg-(--filter-accent) font-medium text-(--filter-ink)' : 'hover:bg-muted',
                !isSelected && iso === today && 'bg-muted font-medium',
                !isSelected && outside && 'text-muted-foreground opacity-50',
              )}
            >
              {day.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** 按 (字段, 条件) 选编辑器：区间优先于类型，选项字段走列表，其余按类型。 */
function ValueEditor(props: EditorProps) {
  const { field, operator } = props
  if (arityOf(operator) === 'range') return <FilterRangeEditor {...props} />
  if (field.type === 'date') return <FilterDateEditor {...props} />
  if (isOptionBacked(field)) return <OptionEditor {...props} />
  if (field.type === 'number') return <FilterNumberEditor {...props} />
  return <FilterTextEditor {...props} />
}

/* -------------------------------------------------------------------------- */
/*                                   Filters                                  */
/* -------------------------------------------------------------------------- */

export type FiltersProps = Partial<typeof defaults> & {
  fields: FilterField[]
  rules?: FilterRule[]
  defaultRules?: FilterRule[]
  onRulesChange?: (rules: FilterRule[]) => void
  /** 显示「清除」按钮。 */
  showClear?: boolean
  /** 受控的弹层（演示自动播放用）。 */
  open?: FilterOpen | null
  onOpenChange?: (open: FilterOpen | null) => void
  /** 受控的列表高亮项（演示自动播放用）。 */
  highlight?: string | null
  /** 受控的文本草稿（演示自动播放用）。 */
  draft?: string
  className?: string
  style?: CSSProperties
}

/**
 * 筛选条：每个条件是一枚「字段 | 条件 | 值 | ⋮」胶囊。点条件换条件，点值打开对应的编辑器
 * （选项、文本、数字、区间、日期），⋮ 里复制、取反、删除。添加时先选字段，再自动打开条件和值。
 */
export function Filters({ fields, rules: rulesProp, defaultRules, onRulesChange, showClear = true, open: openProp, onOpenChange, highlight, draft, className, style, ...props }: FiltersProps) {
  const { accent, chipStyle, size, radius, maxVisible, spring } = { ...defaults, ...props }
  const reduced = Boolean(useReducedMotion())
  const prefix = useId()
  const counter = useRef(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const [innerRules, setInnerRules] = useState<FilterRule[]>(defaultRules ?? [])
  const [innerOpen, setInnerOpen] = useState<FilterOpen | null>(null)
  const rules = rulesProp ?? innerRules
  const controlled = openProp !== undefined
  const open = controlled ? openProp : innerOpen
  const sizes = SIZES[size === 'sm' ? 'sm' : 'default']
  const fieldOf = (id: string) => fields.find((field) => field.id === id)

  const setRules = (next: FilterRule[]) => {
    if (rulesProp === undefined) setInnerRules(next)
    onRulesChange?.(next)
  }
  const setOpen = (next: FilterOpen | null) => {
    if (!controlled) setInnerOpen(next)
    onOpenChange?.(next)
  }
  const updateRule = (id: string, patch: Partial<FilterRule>) => setRules(rules.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)))
  const removeRule = (id: string) => {
    setRules(rules.filter((rule) => rule.id !== id))
    if (open && open.kind !== 'add' && open.ruleId === id) setOpen(null)
  }
  const nextId = () => `${prefix}${++counter.current}`

  const anchorOf = (target: FilterOpen) => (target.kind === 'add' ? 'add' : `${target.ruleId}:${target.kind}`)
  const focusAnchor = (target: FilterOpen) => {
    const node = rootRef.current?.querySelector<HTMLElement>(`[data-filter-anchor="${anchorOf(target)}"]`)
    node?.focus()
  }
  const close = (restoreFocus: boolean) => {
    if (open && restoreFocus) focusAnchor(open)
    setOpen(null)
  }
  const toggle = (target: FilterOpen) => setOpen(open && anchorOf(open) === anchorOf(target) ? null : target)

  // 胶囊之间的方向键漫游；Backspace / Delete 删掉焦点所在的胶囊，焦点交给邻居。
  const onToolbarKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (!target.dataset.filterSeg) return
    const all = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[data-filter-seg]'))
    const index = all.indexOf(target)
    const rtl = getComputedStyle(target).direction === 'rtl'
    const focusAt = (next: number) => {
      event.preventDefault()
      all[Math.max(0, Math.min(next, all.length - 1))]?.focus()
    }
    if (event.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) focusAt(index + 1)
    else if (event.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) focusAt(index - 1)
    else if (event.key === 'Home') focusAt(0)
    else if (event.key === 'End') focusAt(all.length - 1)
    else if ((event.key === 'Backspace' || event.key === 'Delete') && target.dataset.ruleId) {
      event.preventDefault()
      const id = target.dataset.ruleId
      const chips = rules.map((rule) => rule.id)
      const neighbour = chips[chips.indexOf(id) + 1] ?? chips[chips.indexOf(id) - 1]
      removeRule(id)
      const next = neighbour ? rootRef.current?.querySelector<HTMLElement>(`[data-rule-id="${neighbour}"]`) : rootRef.current?.querySelector<HTMLElement>('[data-filter-anchor="add"]')
      next?.focus()
    }
  }

  const transition = reduced ? { duration: 0 } : { type: 'spring' as const, visualDuration: spring.visualDuration, bounce: spring.bounce }
  const surface = 'bg-background dark:bg-input/30'

  const renderChip = (rule: FilterRule) => {
    const field = fieldOf(rule.field)
    const operators = field ? resolveFilterOperators(field) : []
    const operator = getOperator(operators, rule.operator)
    const display = field ? ruleDisplay(rule, field, operator, maxVisible) : null
    const incomplete = !rule.operator
    const hasValue = Boolean(rule.operator) && arityOf(operator) !== 'none'
    const valueName = display ? (display.valueEmpty ? LABELS.noValue : display.valueText) : ''
    const isOpen = (kind: 'operator' | 'value' | 'menu') => Boolean(open && open.kind === kind && open.ruleId === rule.id)
    const label = field ? `${field.label} ${display!.operatorLabel}${hasValue ? ` ${valueName}` : ''}${incomplete ? `, ${LABELS.incomplete}` : ''}` : rule.field

    return (
      <motion.div
        key={rule.id}
        layout={reduced ? false : 'position'}
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
        transition={transition}
        data-slot="filter-chip"
        data-incomplete={incomplete || undefined}
        role="group"
        aria-label={label}
        className="flex w-fit max-w-full min-w-0 items-stretch"
      >
        {/* 字段段只用来显示：胶囊一旦建好，字段就固定了。 */}
        <div
          title={field?.label ?? rule.field}
          className={cn(SEG, sizes.seg, 'cursor-default rounded-l-(--filter-radius)', chipStyle === 'muted' ? 'bg-muted dark:bg-muted' : surface, !field && 'text-muted-foreground')}
        >
          {field?.icon}
          <span className="flex items-center">{field?.label ?? rule.field}</span>
        </div>

        {field ? (
          <button
            type="button"
            data-filter-seg=""
            data-rule-id={rule.id}
            data-filter-anchor={`${rule.id}:operator`}
            aria-haspopup="listbox"
            aria-expanded={isOpen('operator')}
            onClick={() => toggle({ kind: 'operator', ruleId: rule.id })}
            className={cn(SEG, sizes.seg, surface, 'cursor-default border-l-0 hover:bg-accent', incomplete ? 'text-foreground' : 'text-muted-foreground')}
          >
            {display!.operatorLabel}
          </button>
        ) : null}

        {field && hasValue ? (
          <button
            type="button"
            data-filter-seg=""
            data-rule-id={rule.id}
            data-filter-anchor={`${rule.id}:value`}
            aria-haspopup="dialog"
            aria-expanded={isOpen('value')}
            aria-label={display!.valueText}
            onClick={() => toggle({ kind: 'value', ruleId: rule.id })}
            className={cn(SEG, sizes.seg, surface, 'min-w-0 shrink cursor-default overflow-hidden border-l-0 hover:bg-accent', display!.valueEmpty && 'text-muted-foreground')}
          >
            {typeof display!.valueLabel === 'string' ? <span className="truncate">{display!.valueLabel}</span> : display!.valueLabel}
          </button>
        ) : null}

        <button
          type="button"
          data-filter-seg=""
          data-rule-id={rule.id}
          data-filter-anchor={`${rule.id}:menu`}
          aria-haspopup="menu"
          aria-expanded={isOpen('menu')}
          aria-label={LABELS.chipMenu(field?.label ?? rule.field)}
          onClick={() => toggle({ kind: 'menu', ruleId: rule.id })}
          className={cn(OUTLINE_BUTTON, sizes.icon, surface, 'rounded-l-none border-l-0 px-0')}
        >
          <Icon d={ICON.more} className="size-4" />
        </button>
      </motion.div>
    )
  }

  const renderPanel = (target: FilterOpen) => {
    const autoFocus = !controlled
    if (target.kind === 'add') {
      return (
        <div className="flex w-auto min-w-56 flex-col">
          <FilterMenu
            items={fields.map((field) => ({ value: field.id, label: field.label, icon: field.icon }))}
            onSelect={(fieldId) => {
              // 先建一条没有条件的规则，接着在新胶囊上打开条件菜单。
              const id = nextId()
              setRules([...rules, { id, field: fieldId, operator: null }])
              setOpen({ kind: 'operator', ruleId: id })
            }}
            ariaLabel={LABELS.fieldsLabel}
            searchPlaceholder={LABELS.searchFields}
            maxHeight={260}
            highlight={highlight}
            autoFocus={autoFocus}
          />
        </div>
      )
    }
    const rule = rules.find((entry) => entry.id === target.ruleId)
    const field = rule ? fieldOf(rule.field) : undefined
    if (!rule || !field) return null
    const operators = resolveFilterOperators(field)
    const operator = getOperator(operators, rule.operator)

    if (target.kind === 'operator') {
      return (
        <div className="flex w-auto min-w-40 flex-col">
          <FilterMenu
            items={operators.map((entry) => ({ value: entry.value, label: entry.label }))}
            selected={rule.operator ? [rule.operator] : []}
            onSelect={(value) => {
              if (value === rule.operator) {
                close(true)
                return
              }
              const chosen = getOperator(operators, value)
              // 只有添加时（还没有条件）才接着打开值；改已有条件只改这一格。
              const building = !rule.operator
              updateRule(rule.id, { operator: value, value: coerceValue(rule.value, operator, chosen) })
              if (building && arityOf(chosen) !== 'none') setOpen({ kind: 'value', ruleId: rule.id })
              else close(true)
            }}
            ariaLabel={field.label}
            searchable={false}
            maxHeight={320}
            initialActive={rule.operator ?? field.defaultOperator ?? null}
            highlight={highlight}
            autoFocus={autoFocus}
          />
        </div>
      )
    }

    if (target.kind === 'menu') {
      return (
        <div className="flex w-max min-w-32 flex-col">
          <FilterMenu
            role="menu"
            items={[
              { value: 'duplicate', label: LABELS.duplicate, icon: <Icon d={ICON.copy} /> },
              { value: 'negate', label: LABELS.negate, icon: <Icon d={ICON.swap} /> },
              { value: 'remove', label: LABELS.remove, icon: <Icon d={ICON.trash} />, destructive: true },
            ]}
            onSelect={(action) => {
              if (action === 'remove') {
                removeRule(rule.id)
                rootRef.current?.querySelector<HTMLElement>('[data-filter-anchor="add"]')?.focus()
                return
              }
              if (action === 'duplicate') {
                const index = rules.indexOf(rule)
                setRules([...rules.slice(0, index + 1), { ...rule, id: nextId() }, ...rules.slice(index + 1)])
              } else {
                updateRule(rule.id, negateOperator(operator, operators, rule.negated))
              }
              close(true)
            }}
            ariaLabel={LABELS.chipMenu(field.label)}
            highlight={highlight}
            autoFocus={autoFocus}
          />
        </div>
      )
    }

    if (!operator) return null
    return (
      <ValueEditor
        field={field}
        operator={operator}
        value={rule.value}
        commit={(value, shouldClose = true) => {
          updateRule(rule.id, { value })
          if (shouldClose) close(true)
        }}
        cancel={() => close(true)}
        autoFocus={autoFocus}
        draft={draft}
        highlight={highlight}
      />
    )
  }

  const panel = open ? renderPanel(open) : null
  const panelKey = open ? anchorOf(open) : null

  return (
    <div
      ref={rootRef}
      data-slot="filters"
      data-empty={rules.length === 0 || undefined}
      className={cn('relative flex flex-wrap items-center', sizes.gap, rules.length === 0 && 'gap-0', className)}
      style={{ '--filter-accent': accent, '--filter-ink': ink(accent), '--filter-radius': `${radius}px`, '--ring': accent, '--filter-highlight': `color-mix(in oklab, ${accent} 18%, var(--color-accent))`, ...style } as CSSProperties}
    >
      <div role="toolbar" aria-label={LABELS.filtersLabel} aria-orientation="horizontal" onKeyDown={onToolbarKeyDown} className={cn('relative flex max-w-full min-w-0 flex-wrap items-center', sizes.gap)}>
        <AnimatePresence initial={false} mode="popLayout">
          {rules.map(renderChip)}
        </AnimatePresence>
      </div>

      <motion.button
        layout={reduced ? false : 'position'}
        transition={transition}
        type="button"
        data-filter-anchor="add"
        aria-haspopup="listbox"
        aria-expanded={open?.kind === 'add'}
        aria-label={rules.length > 0 ? LABELS.addFilter : undefined}
        onClick={() => toggle({ kind: 'add' })}
        className={cn(OUTLINE_BUTTON, rules.length > 0 ? cn(sizes.icon, 'px-0') : cn(sizes.seg, 'text-foreground'))}
      >
        <Icon d={ICON.filterPlus} className={size === 'sm' ? 'size-3.5' : 'size-4'} />
        {rules.length > 0 ? null : LABELS.addFilter}
      </motion.button>

      {showClear && rules.length > 0 ? (
        // ms-auto：RTL 下「清除」仍在行尾。
        <motion.button layout={reduced ? false : 'position'} transition={transition} type="button" onClick={() => setRules([])} className={cn(OUTLINE_BUTTON, sizes.seg, 'ms-auto text-foreground')}>
          {LABELS.clear}
        </motion.button>
      ) : null}

      <AnimatePresence>
        {open && panel && panelKey ? (
          <PopoverPanel key={panelKey} rootRef={rootRef} anchor={panelKey} align={open.kind === 'menu' ? 'end' : 'start'} reduced={reduced} onDismiss={close} revision={rules}>
            {panel}
          </PopoverPanel>
        ) : null}
      </AnimatePresence>

      <div aria-live="polite" role="status" className="sr-only">
        {LABELS.countAnnouncement(rules.filter((rule) => rule.operator).length)}
      </div>
    </div>
  )
}
