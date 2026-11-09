// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/components/comp-423.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useId, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  chipType: 'selectable',
  variant: 'default',
  shape: 'pill',
  size: 'sm',
  accent: '#10b981',
  showCheck: true,
  showClearAll: true,
}
/* @motif:end */

export type ChipTone = 'success' | 'warning' | 'danger' | 'neutral'
export type Chip = { id: string; label: string; tone?: ChipTone; count?: number }

export type ChipFilterGroupProps = Partial<typeof defaults> & {
  chips?: Chip[]
  /** selectable / status / count: the selected ids. removable: the ids still shown. */
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  /** Accessible name of the group. */
  label?: string
  className?: string
  style?: CSSProperties
}

const DOT: Record<ChipTone, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  neutral: 'bg-zinc-400',
}

function inkFor(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return '#ffffff'
  const n = parseInt(m[1] ?? '000000', 16)
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const L = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return (L + 0.05) / 0.05 > 1.05 / (L + 0.05) ? '#09090b' : '#ffffff'
}

const DEFAULT_CHIPS: Chip[] = [
  { id: 'production', label: 'Production', tone: 'success', count: 24 },
  { id: 'preview', label: 'Preview', tone: 'warning', count: 12 },
  { id: 'failed', label: 'Failed', tone: 'danger', count: 3 },
  { id: 'canceled', label: 'Canceled', tone: 'neutral', count: 5 },
]

/* badge.tsx base classes (cva inlined) */
const badgeBase =
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 whitespace-nowrap border px-1.5 font-medium text-xs leading-normal transition-[color,background-color,border-color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:shrink-0'
const badgeVariants: Record<string, string> = {
  default: 'border-transparent bg-(--accent) text-(--ink)',
  outline: 'text-foreground',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
}

function CheckIcon({ size }: { size: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
function XIcon({ size }: { size: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

/** A wrapping bar of filter chips: selectable (native checkbox), removable (× button), status dot or count. */
export function ChipFilterGroup({ chips = DEFAULT_CHIPS, value, defaultValue, onValueChange, label = 'Filters', className, style, ...props }: ChipFilterGroupProps) {
  const { chipType, variant, shape, size, accent, showCheck, showClearAll } = { ...defaults, ...props }
  const id = useId()
  const reduced = useReducedMotion()
  const removable = chipType === 'removable'
  const [inner, setInner] = useState<string[]>(defaultValue ?? (removable ? chips.map((c) => c.id) : chips.slice(0, 1).map((c) => c.id)))
  const current = value ?? inner
  const set = (next: string[]) => {
    if (value === undefined) setInner(next)
    onValueChange?.(next)
  }
  const md = size === 'md'
  const shapeCls = shape === 'rounded' ? 'rounded-md' : 'rounded-full'
  const sizeCls = md ? 'px-2 py-1 text-sm' : ''
  const icon = md ? 14 : 12
  const vars = { '--accent': accent, '--ink': inkFor(accent) } as CSSProperties
  const variantCls = badgeVariants[variant] ?? badgeVariants.default
  const shown = removable ? chips.filter((c) => current.includes(c.id)) : chips
  const layoutTransition = reduced ? { duration: 0 } : { type: 'spring' as const, visualDuration: 0.28, bounce: 0.15 }

  return (
    <div role="group" aria-label={label} className={cn('flex flex-wrap items-center gap-2', className)} style={{ ...vars, ...style }}>
      <AnimatePresence initial={false} mode="popLayout">
        {shown.map((chip) => {
          const checked = current.includes(chip.id)
          const dot = chipType === 'status' ? <span aria-hidden="true" className={cn('size-1.5 rounded-full', DOT[chip.tone ?? 'neutral'])} /> : null
          const count =
            chipType === 'count' && chip.count !== undefined ? (
              <span className="ms-1 rounded-full bg-current/15 px-1.5 text-[0.85em] tabular-nums">{chip.count}</span>
            ) : null
          return (
            <motion.span
              key={chip.id}
              layout={!reduced}
              initial={reduced ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.6 }}
              transition={layoutTransition}
              className="inline-flex"
            >
              {removable ? (
                <span className={cn(badgeBase, variantCls, shapeCls, sizeCls, 'gap-0')}>
                  {dot && <span className="me-1.5 inline-flex">{dot}</span>}
                  {chip.label}
                  <button
                    aria-label={`Remove ${chip.label}`}
                    className={cn(
                      'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[inherit] p-0 opacity-60 outline-none transition-[opacity,box-shadow] hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50',
                      md ? '-my-[5px] -ms-0.5 -me-2 size-7' : '-my-px -ms-px -me-1.5 size-5',
                    )}
                    onClick={() => set(current.filter((v) => v !== chip.id))}
                    type="button"
                  >
                    <XIcon size={icon} />
                  </button>
                </span>
              ) : (
                <span
                  className={cn(
                    badgeBase,
                    variantCls,
                    shapeCls,
                    sizeCls,
                    'relative gap-0 outline-none has-focus-visible:border-ring has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50',
                    !checked && 'border-border bg-muted text-muted-foreground',
                  )}
                >
                  <input
                    type="checkbox"
                    id={`${id}-${chip.id}`}
                    className="peer sr-only"
                    checked={checked}
                    onChange={(e) => set(e.target.checked ? [...current, chip.id] : current.filter((v) => v !== chip.id))}
                  />
                  {showCheck && (
                    <motion.span
                      aria-hidden="true"
                      className={cn('inline-flex overflow-hidden', variant === 'outline' && 'text-(--accent)')}
                      initial={false}
                      animate={{ width: checked ? icon + 4 : 0, opacity: checked ? 1 : 0 }}
                      transition={reduced ? { duration: 0 } : { type: 'spring', visualDuration: 0.25, bounce: 0.2 }}
                    >
                      <CheckIcon size={icon} />
                    </motion.span>
                  )}
                  {dot && <span className="me-1.5 inline-flex">{dot}</span>}
                  <label className="cursor-pointer select-none after:absolute after:inset-0" htmlFor={`${id}-${chip.id}`}>
                    {chip.label}
                  </label>
                  {count}
                </span>
              )}
            </motion.span>
          )
        })}
        {showClearAll && current.length > 0 && (
          <motion.button
            key="__clear"
            layout={!reduced}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.15 } }}
            transition={layoutTransition}
            type="button"
            onClick={() => set([])}
            className={cn(
              'cursor-pointer rounded-md px-1.5 font-medium text-muted-foreground underline-offset-4 outline-none transition-[color,box-shadow] hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50',
              md ? 'text-sm' : 'text-xs',
            )}
          >
            Clear all
          </motion.button>
        )}
      </AnimatePresence>
      {removable && shown.length === 0 && <span className={cn('text-muted-foreground', md ? 'text-sm' : 'text-xs')}>No filters applied</span>}
    </div>
  )
}
