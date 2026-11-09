// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Tremor Labs, Inc.
// Source: https://github.com/tremorlabs/tremor-blocks/blob/b319e8d/src/content/components/filterbar/filterbar-03.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { BarChartThumbnail, DonutChartThumbnail, LineChartThumbnail, type ThumbProps } from './thumbnails'

/* @motif:defaults */
export const defaults = {
  accent: '#3b82f6',
  thumbStyle: 'gradient',
  previewSide: 'left',
  width: 192,
  radius: 6,
  showDisabled: true,
}
/* @motif:end */

// 上游用 @remixicon/react 的四个图标，这里换成手画的同形 SVG。
const icon = (children: ReactNode) =>
  function Icon({ className }: { className?: string }) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
        {children}
      </svg>
    )
  }
const LineIcon = icon(<path d="M5 3v16h16v2H3V3h2Zm15.3 3.3 1.4 1.4-6.7 6.7-3-3-4.3 4.3-1.4-1.4 5.7-5.7 3 3 5.3-5.3Z" />)
const BarIcon = icon(<path d="M3 12h4v9H3v-9Zm7-9h4v18h-4V3Zm7 5h4v13h-4V8Z" />)
const DonutIcon = icon(<path d="M11 2.05v3.02A7 7 0 1 0 18.93 13h3.02A10 10 0 1 1 11 2.05ZM13 2.05A10 10 0 0 1 21.95 11h-3.02A7 7 0 0 0 13 5.07V2.05Z" />)
const BubbleIcon = icon(
  <>
    <circle cx="7.5" cy="15.5" r="4.5" />
    <circle cx="16.5" cy="17" r="3" />
    <circle cx="15" cy="7.5" r="5" />
  </>,
)

export type ChartTypeOption = {
  value: string
  label: string
  icon: (p: { className?: string }) => ReactNode
  thumbnail: ((p: ThumbProps) => ReactNode) | null
  description: string
  disabled: boolean
}

export const CHART_TYPES: ChartTypeOption[] = [
  { value: 'line-chart', label: 'Line chart', icon: LineIcon, thumbnail: LineChartThumbnail, description: 'Best to show trends or changes over time', disabled: false },
  { value: 'bar-chart', label: 'Bar chart', icon: BarIcon, thumbnail: BarChartThumbnail, description: 'Best to display comparisons between categories', disabled: false },
  { value: 'donut-chart', label: 'Donut chart', icon: DonutIcon, thumbnail: DonutChartThumbnail, description: 'Display data through a circular visualization', disabled: false },
  { value: 'scatter-chart', label: 'Scatter chart', icon: BubbleIcon, thumbnail: null, description: 'Display data through a circular visualization', disabled: true },
]

export type SelectChartTypeProps = Omit<Partial<typeof defaults>, 'previewSide' | 'thumbStyle'> & {
    previewSide?: 'left' | 'right'
    thumbStyle?: 'gradient' | 'flat'
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
    items?: ChartTypeOption[]
    placeholder?: string
    /** 受控展开（演示自动播放用）。 */
    open?: boolean
    onOpenChange?: (open: boolean) => void
    /** 强制高亮项（演示自动播放用）。 */
    highlighted?: string
    'aria-label'?: string
    className?: string
    style?: CSSProperties
  }

/** 图表类型选择：每项带图标，禁用项变淡；悬停或方向键经过时在侧边浮出缩略图预览卡。 */
export function SelectChartType({
  value,
  defaultValue = 'line-chart',
  onValueChange,
  items = CHART_TYPES,
  placeholder = 'Select',
  open: openProp,
  onOpenChange,
  highlighted,
  'aria-label': ariaLabel = 'Chart type',
  className,
  style,
  ...props
}: SelectChartTypeProps) {
  const { accent, previewSide, thumbStyle, width, radius, showDisabled } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const id = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [innerValue, setInnerValue] = useState(defaultValue)
  const [innerOpen, setInnerOpen] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const current = value ?? innerValue
  const open = openProp ?? innerOpen
  const list = showDisabled ? items : items.filter((i) => !i.disabled)
  const enabled = list.filter((i) => !i.disabled)
  const activeValue = highlighted ?? active
  const activeItem = list.find((i) => i.value === activeValue)
  const selected = items.find((i) => i.value === current)

  const setOpen = (next: boolean) => {
    if (openProp === undefined) setInnerOpen(next)
    onOpenChange?.(next)
    if (next) setActive(current)
    else setActive(null)
  }
  const choose = (v: string) => {
    if (value === undefined) setInnerValue(v)
    onValueChange?.(v)
    setOpen(false)
    triggerRef.current?.focus()
  }

  // 点击外部关闭
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  })

  const move = (dir: 1 | -1 | 'first' | 'last') => {
    if (!enabled.length) return
    const idx = enabled.findIndex((i) => i.value === active)
    const next = dir === 'first' ? 0 : dir === 'last' ? enabled.length - 1 : idx < 0 ? 0 : (idx + dir + enabled.length) % enabled.length
    setActive(enabled[next]!.value)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        setOpen(true)
      }
      return
    }
    if (e.key === 'ArrowDown') move(1)
    else if (e.key === 'ArrowUp') move(-1)
    else if (e.key === 'Home') move('first')
    else if (e.key === 'End') move('last')
    else if (e.key === 'Enter' || e.key === ' ') {
      if (activeItem && !activeItem.disabled) choose(activeItem.value)
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      if (e.key === 'Escape') e.preventDefault()
      setOpen(false)
      return
    } else return
    e.preventDefault()
  }

  const r = Math.max(0, radius)
  const Preview = activeItem?.thumbnail
  const side = previewSide === 'left' ? 'sm:right-full sm:mr-[15px]' : 'sm:left-full sm:ml-[15px]'

  return (
    <div ref={rootRef} className={cn('relative w-full sm:w-[var(--sct-w)]', className)} style={{ '--sct-w': `${width}px`, ...style } as CSSProperties}>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={open && activeValue ? `${id}-${activeValue}` : undefined}
        onClick={() => setOpen(!open)}
        onKeyDown={onKeyDown}
        style={{ borderRadius: r }}
        className="flex h-9 w-full items-center justify-between gap-2 border border-border bg-background px-3 text-left text-sm text-foreground shadow-sm outline-none transition-[border-color,box-shadow] hover:bg-muted/40 focus-visible:border-[var(--sct-accent)] focus-visible:ring-2 focus-visible:ring-[var(--sct-accent)]/30"
      >
        <span className={cn('flex min-w-0 items-center gap-x-2 truncate', !selected && 'text-muted-foreground')}>
          {selected ? (
            <>
              <selected.icon className="size-4 shrink-0 text-muted-foreground" />
              {selected.label}
            </>
          ) : (
            placeholder
          )}
        </span>
        <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-muted-foreground" fill="currentColor" aria-hidden>
          <path d="M12 16 6 10h12l-6 6Z" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: reduced ? 0 : -4, scale: reduced ? 1 : 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduced ? 0 : -4, scale: reduced ? 1 : 0.97 }}
            transition={{ duration: reduced ? 0.1 : 0.16, ease: [0.16, 1, 0.3, 1] }}
            style={{ '--sct-accent': accent, transformOrigin: 'top' } as CSSProperties}
            className="absolute inset-x-0 top-full z-50 mt-2"
          >
            <ul
              ref={listRef}
              id={`${id}-list`}
              role="listbox"
              aria-label={ariaLabel}
              style={{ borderRadius: r }}
              className="border border-border bg-popover p-1 text-popover-foreground shadow-xl shadow-black/10"
            >
              {list.map((item) => {
                const isActive = item.value === activeValue
                const isSelected = item.value === current
                return (
                  <li
                    key={item.value}
                    id={`${id}-${item.value}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={item.disabled || undefined}
                    onPointerEnter={() => setActive(item.value)}
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => !item.disabled && choose(item.value)}
                    style={{ borderRadius: Math.max(0, r - 2) }}
                    className={cn(
                      'relative flex cursor-default select-none items-center gap-x-2 py-1.5 pl-2 pr-8 text-sm transition-colors',
                      item.disabled ? 'text-muted-foreground/50' : isActive && 'bg-muted',
                    )}
                  >
                    <item.icon className={cn(item.disabled ? 'text-muted-foreground/40' : 'text-muted-foreground', 'size-4 shrink-0')} />
                    {item.label}
                    {isSelected && (
                      <svg viewBox="0 0 24 24" className="absolute right-2 size-4" fill="none" stroke={accent} strokeWidth={2.5} aria-hidden>
                        <path d="m5 12 5 5 9-10" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </li>
                )
              })}
            </ul>

            {/* 预览卡：上游是 Radix Tooltip（side="left"、sideOffset 15、带箭头）；窄屏改到列表下方 */}
            <AnimatePresence mode="popLayout">
              {activeItem && (
                <motion.div
                  key={activeItem.value}
                  role="tooltip"
                  initial={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduced ? 0.08 : 0.14 }}
                  style={{ borderRadius: r }}
                  className={cn(
                    'pointer-events-none relative mt-2 w-full max-w-40 bg-foreground px-2.5 py-1.5 text-background shadow-md sm:absolute sm:top-0 sm:mt-0 sm:w-40',
                    side,
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'absolute top-3 hidden size-2.5 rotate-45 bg-foreground sm:block',
                      previewSide === 'left' ? '-right-1' : '-left-1',
                    )}
                  />
                  <div>
                    <div className="p-1">{Preview ? <Preview accent={accent} thumbStyle={thumbStyle === 'flat' ? 'flat' : 'gradient'} /> : <div className="h-14" />}</div>
                    <p className="mt-1 text-xs">{activeItem.description}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
