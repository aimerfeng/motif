// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Eduardo Calvo
// Source: https://github.com/educlopez/smoothui/blob/b6312bc/packages/smoothui/components/animated-tabs/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { motion, useReducedMotion } from 'motion/react'
import { useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  variant: 'underline',
  color: '#8b5cf6',
  size: 'md',
  radius: 10,
  stretch: false,
  spring: {
    visualDuration: 0.3,
    bounce: 0.12,
  },
}
/* @motif:end */

export type TabItem = {
  value: string
  label: string
  icon?: ReactNode
  /** 标签右侧的小计数。 */
  badge?: string | number
  /** 选中时显示的面板内容；所有条目都没有 content 时不渲染面板。 */
  content?: ReactNode
  disabled?: boolean
}

export type TabsAnimatedProps = Partial<typeof defaults> & {
  items?: TabItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** tablist 的无障碍名称。 */
  label?: string
  className?: string
  style?: CSSProperties
}

const SAMPLE: TabItem[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'activity', label: 'Activity' },
  { value: 'members', label: 'Members' },
]

const SIZES = {
  sm: 'h-8 gap-1.5 px-3 text-[13px]',
  md: 'h-10 gap-2 px-3.5 text-sm',
  lg: 'h-12 gap-2.5 px-5 text-[15px]',
} as const

/** 带滑动指示器的选项卡：下划线、胶囊、分段三种样式，方向感知的面板切换，方向键 / Home / End 导航。 */
export function TabsAnimated({ items = SAMPLE, value, defaultValue, onValueChange, label = 'Sections', className, style, ...props }: TabsAnimatedProps) {
  const { variant, color, size, radius, stretch, spring } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const uid = useId()
  const [inner, setInner] = useState(defaultValue ?? items[0]?.value ?? '')
  const current = value ?? inner
  const index = Math.max(0, items.findIndex((item) => item.value === current))
  const previous = useRef(index)
  const direction = index >= previous.current ? 1 : -1
  const listRef = useRef<HTMLDivElement>(null)

  const select = (next: string) => {
    previous.current = index
    if (value === undefined) setInner(next)
    onValueChange?.(next)
  }

  const onKeyDown = (event: KeyboardEvent, from: number) => {
    const enabled = items.map((item, i) => (item.disabled ? -1 : i)).filter((i) => i >= 0)
    const at = enabled.indexOf(from)
    let target: number | undefined
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = enabled[(at + 1) % enabled.length]
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = enabled[(at - 1 + enabled.length) % enabled.length]
    else if (event.key === 'Home') target = enabled[0]
    else if (event.key === 'End') target = enabled[enabled.length - 1]
    if (target === undefined) return
    event.preventDefault()
    select(items[target]!.value)
    listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[target]?.focus()
  }

  const transition = reduced ? { duration: 0 } : { type: 'spring' as const, visualDuration: spring.visualDuration, bounce: spring.bounce }
  const hasPanels = items.some((item) => item.content !== undefined)
  const active = items[index]
  const rounded = variant === 'underline' ? 6 : radius

  return (
    <div className={cn('flex w-full flex-col', className)} style={{ '--tab-accent': color, ...style } as CSSProperties}>
      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        aria-orientation="horizontal"
        className={cn(
          'relative isolate flex',
          stretch ? 'w-full' : 'w-fit max-w-full',
          variant === 'underline' && 'border-b border-border',
          variant === 'pill' && 'gap-1 p-1',
          variant === 'segment' && 'bg-muted p-1 ring-1 ring-border/60',
        )}
        style={{ borderRadius: variant === 'segment' ? radius + 4 : variant === 'pill' ? radius + 8 : 0 }}
      >
        {items.map((item, i) => {
          const selected = i === index
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              id={`${uid}-tab-${item.value}`}
              aria-selected={selected}
              aria-controls={hasPanels ? `${uid}-panel-${item.value}` : undefined}
              tabIndex={selected ? 0 : -1}
              disabled={item.disabled}
              onClick={() => select(item.value)}
              onKeyDown={(event) => onKeyDown(event, i)}
              className={cn(
                'relative inline-flex items-center justify-center font-medium whitespace-nowrap outline-none select-none disabled:opacity-40',
                'transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--tab-accent)',
                SIZES[size as keyof typeof SIZES] ?? SIZES.md,
                stretch && 'flex-1',
                selected ? (variant === 'pill' ? 'text-[color-mix(in_oklab,var(--tab-accent)_70%,var(--foreground))]' : 'text-foreground') : 'text-muted-foreground hover:text-foreground',
              )}
              style={{ borderRadius: rounded }}
            >
              {selected && (
                <motion.span
                  layoutId={`${uid}-indicator`}
                  transition={transition}
                  aria-hidden
                  className={cn(
                    'absolute -z-10',
                    variant === 'underline' && 'inset-x-2 -bottom-px h-0.5 rounded-full bg-(--tab-accent) shadow-[0_0_12px_var(--tab-accent)]',
                    variant === 'pill' && 'inset-0 bg-[color-mix(in_oklab,var(--tab-accent)_18%,transparent)] ring-1 ring-[color-mix(in_oklab,var(--tab-accent)_38%,transparent)] ring-inset',
                    variant === 'segment' && 'inset-0 bg-card shadow-md shadow-black/25 ring-1 ring-border',
                  )}
                  style={variant === 'underline' ? undefined : { borderRadius: rounded }}
                />
              )}
              {item.icon && <span className="grid size-4 place-items-center [&>svg]:size-full">{item.icon}</span>}
              {item.label}
              {item.badge !== undefined && (
                <span className="ml-0.5 rounded-full bg-foreground/10 px-1.5 text-[11px] leading-[18px] font-semibold tabular-nums">{item.badge}</span>
              )}
            </button>
          )
        })}
      </div>
      {hasPanels && active && (
        <div className="relative pt-4">
          <motion.div
              key={active.value}
              role="tabpanel"
              id={`${uid}-panel-${active.value}`}
              aria-labelledby={`${uid}-tab-${active.value}`}
              tabIndex={0}
              className="rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--tab-accent)"
              initial={{ opacity: 0, x: reduced ? 0 : direction * 16, filter: reduced ? 'blur(0px)' : 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              transition={{ duration: reduced ? 0.12 : 0.32, ease: [0.32, 0.72, 0, 1] }}
            >
              {active.content}
            </motion.div>
        </div>
      )}
    </div>
  )
}
