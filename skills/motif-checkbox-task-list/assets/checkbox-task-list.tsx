// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/components/comp-137.tsx
// Modified by Motif; see the item's provenance.
import { cn, cssVars } from '@/lib/motif-runtime'
import { useId, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  checkShape: 'round',
  strikeStyle: 'sweep',
  showProgress: true,
  duration: 150,
  accent: '#10b981',
}
/* @motif:end */

export type Task = { id: string; label: string }

export type TaskChecklistProps = Partial<typeof defaults> & {
  tasks: Task[]
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (ids: string[]) => void
  title?: string
  className?: string
  style?: CSSProperties
}

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

/** 勾选框里的对勾取白色或近黑色里对比度高的那个。 */
function inkOn(hex: string): string {
  const fill = luminance(hex)
  if (fill === null) return '#ffffff'
  return 1.05 / (fill + 0.05) >= (fill + 0.05) / 0.051 ? '#ffffff' : '#030304'
}

/**
 * 待办清单：上游 comp-136（直接划线）与 comp-137（圆形勾选框 + 从左往右扫过的删除线）合在一起。
 * 每项是原生复选框（peer），Radix Checkbox 换成了自绘的指示器。
 */
export function TaskChecklist({
  tasks,
  value,
  defaultValue = [],
  onValueChange,
  title,
  checkShape = defaults.checkShape,
  strikeStyle = defaults.strikeStyle,
  showProgress = defaults.showProgress,
  duration = defaults.duration,
  accent = defaults.accent,
  className,
  style,
}: TaskChecklistProps) {
  const id = useId()
  const [inner, setInner] = useState<string[]>(defaultValue)
  const checked = value ?? inner
  const done = tasks.filter((task) => checked.includes(task.id)).length

  const toggle = (taskId: string, on: boolean) => {
    const next = on ? [...checked.filter((x) => x !== taskId), taskId] : checked.filter((x) => x !== taskId)
    if (value === undefined) setInner(next)
    onValueChange?.(next)
  }

  return (
    <div
      role="group"
      aria-labelledby={title ? `${id}-title` : undefined}
      className={cn('flex w-full flex-col gap-3', className)}
      style={cssVars({ '--tl-accent': accent, '--tl-ink': inkOn(accent), '--tl-duration': `${duration}ms` }, style)}
    >
      {(title || showProgress) && (
        <div className="flex items-center justify-between gap-3">
          {title && (
            <span id={`${id}-title`} className="text-sm font-medium">
              {title}
            </span>
          )}
          {showProgress && (
            <span className="ml-auto text-xs text-muted-foreground tabular-nums" aria-live="polite">
              {done} of {tasks.length}
            </span>
          )}
        </div>
      )}
      {tasks.map((task) => {
        const itemId = `${id}-${task.id}`
        const on = checked.includes(task.id)
        return (
          <div key={task.id} className="flex items-center gap-2">
            <input id={itemId} type="checkbox" className="peer sr-only" checked={on} onChange={(event) => toggle(task.id, event.target.checked)} />
            <label
              htmlFor={itemId}
              aria-hidden
              className={cn(
                'flex size-4 shrink-0 cursor-pointer items-center justify-center border border-input shadow-xs transition-[background-color,border-color,box-shadow] duration-[var(--tl-duration)] motion-reduce:transition-none',
                'peer-focus-visible:border-ring peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50',
                'peer-checked:border-[var(--tl-accent)] peer-checked:bg-[var(--tl-accent)] peer-checked:text-[var(--tl-ink)]',
                checkShape === 'round' ? 'rounded-full' : 'rounded-[4px]',
              )}
            >
              <svg
                fill="currentcolor"
                height="9"
                viewBox="0 0 9 9"
                width="9"
                className={cn('transition-[opacity,transform] duration-[var(--tl-duration)] motion-reduce:transition-none', on ? 'scale-100 opacity-100' : 'scale-50 opacity-0')}
              >
                <path
                  clipRule="evenodd"
                  d="M8.53547 0.62293C8.88226 0.849446 8.97976 1.3142 8.75325 1.66099L4.5083 8.1599C4.38833 8.34356 4.19397 8.4655 3.9764 8.49358C3.75883 8.52167 3.53987 8.45309 3.3772 8.30591L0.616113 5.80777C0.308959 5.52987 0.285246 5.05559 0.563148 4.74844C0.84105 4.44128 1.31533 4.41757 1.62249 4.69547L3.73256 6.60459L7.49741 0.840706C7.72393 0.493916 8.18868 0.396414 8.53547 0.62293Z"
                  fillRule="evenodd"
                />
              </svg>
            </label>
            {strikeStyle === 'sweep' ? (
              <label
                htmlFor={itemId}
                className="relative min-w-0 cursor-pointer text-sm leading-5 font-medium transition-[color] duration-[var(--tl-duration)] after:absolute after:top-1/2 after:left-0 after:h-px after:w-full after:origin-left after:-translate-y-1/2 after:scale-x-0 after:bg-muted-foreground after:transition-transform after:duration-[var(--tl-duration)] after:ease-in-out peer-checked:text-muted-foreground peer-checked:after:scale-x-100 motion-reduce:transition-none motion-reduce:after:transition-none"
              >
                {task.label}
              </label>
            ) : (
              <label htmlFor={itemId} className="min-w-0 cursor-pointer text-sm leading-5 font-medium peer-checked:line-through">
                {task.label}
              </label>
            )}
          </div>
        )
      })}
    </div>
  )
}
