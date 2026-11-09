// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/components/comp-144.tsx
// Modified by Motif; see the item's provenance.
import { cn, cssVars } from '@/lib/motif-runtime'
import { useId, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  mode: 'checkbox',
  layout: 'list',
  columns: 3,
  indicator: 'corner',
  showIcon: true,
  showDescription: true,
  density: 'comfortable',
  radius: 6,
  accent: '#e4e4e7',
}
/* @motif:end */

export type ChoiceOption = {
  value: string
  label: string
  sublabel?: string
  description?: string
  icon?: ReactNode
  disabled?: boolean
}

export type ChoiceCardsProps = Partial<typeof defaults> & {
  options: ChoiceOption[]
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  name?: string
  /** Visible group heading (fieldset legend). */
  legend?: string
  className?: string
  style?: CSSProperties
}

function luminance(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return 1
  const n = parseInt(m[1]!, 16)
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * ch[0]! + 0.7152 * ch[1]! + 0.0722 * ch[2]!
}

const DARK_INK = '#09090b'
const DARK_L = luminance(DARK_INK)

/** White or near-black, whichever contrasts more with the fill. */
function inkOn(hex: string): string {
  const l = luminance(hex)
  return 1.05 / (l + 0.05) > (l + 0.05) / (DARK_L + 0.05) ? '#ffffff' : DARK_INK
}

function Indicator({ mode }: { mode: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none flex size-4 shrink-0 items-center justify-center border border-input shadow-xs transition-[background-color,border-color,box-shadow] motion-reduce:transition-none',
        'group-has-[:checked]:border-[var(--cc-accent)] group-has-[:checked]:bg-[var(--cc-accent)] group-has-[:checked]:text-[var(--cc-ink)]',
        'group-has-[:focus-visible]:border-ring group-has-[:focus-visible]:ring-[3px] group-has-[:focus-visible]:ring-ring/50',
        mode === 'radio' ? 'rounded-full' : 'rounded-[4px]',
      )}
    >
      {mode === 'radio' ? (
        <svg className="hidden group-has-[:checked]:block" fill="currentcolor" height="6" viewBox="0 0 6 6" width="6">
          <circle cx="3" cy="3" r="3" />
        </svg>
      ) : (
        <svg className="hidden group-has-[:checked]:block" fill="currentcolor" height="9" viewBox="0 0 9 9" width="9">
          <path
            clipRule="evenodd"
            d="M8.53547 0.62293C8.88226 0.849446 8.97976 1.3142 8.75325 1.66099L4.5083 8.1599C4.38833 8.34356 4.19397 8.4655 3.9764 8.49358C3.75883 8.52167 3.53987 8.45309 3.3772 8.30591L0.616113 5.80777C0.308959 5.52987 0.285246 5.05559 0.563148 4.74844C0.84105 4.44128 1.31533 4.41757 1.62249 4.69547L3.73256 6.60459L7.49741 0.840706C7.72393 0.493916 8.18868 0.396414 8.53547 0.62293Z"
            fillRule="evenodd"
          />
        </svg>
      )}
    </span>
  )
}

export function ChoiceCards({ options, value, defaultValue, onValueChange, name, legend, className, style, ...props }: ChoiceCardsProps) {
  const o = { ...defaults, ...props }
  const id = useId()
  const [inner, setInner] = useState<string[]>(defaultValue ?? [])
  const selected = value ?? inner
  const radio = o.mode === 'radio'
  const tiles = o.layout === 'tiles'
  const grid = o.layout === 'grid'
  const compact = o.density === 'compact'
  const showIndicator = o.indicator === 'corner' && !tiles

  const toggle = (v: string, checked: boolean) => {
    const next = radio ? [v] : checked ? [...selected, v] : selected.filter((s) => s !== v)
    if (value === undefined) setInner(next)
    onValueChange?.(next)
  }

  return (
    <fieldset
      className={cn('min-w-0', className)}
      style={cssVars({ '--cc-accent': o.accent, '--cc-ink': inkOn(o.accent), '--cc-radius': `${o.radius}px` }, style)}
    >
      {legend && <legend className="mb-4 font-medium text-foreground text-sm leading-none">{legend}</legend>}
      <div
        role={radio ? 'radiogroup' : 'group'}
        className={cn('grid gap-2', o.layout !== 'list' && 'sm:gap-3')}
        style={o.layout === 'list' ? undefined : { gridTemplateColumns: `repeat(${o.columns}, minmax(0, 1fr))` }}
      >
        {options.map((item) => {
          const inputId = `${id}-${item.value}`
          const checked = selected.includes(item.value)
          const desc = o.showDescription && item.description && !tiles
          const icon = o.showIcon && item.icon
          return (
            <label
              key={inputId}
              htmlFor={inputId}
              className={cn(
                'group relative flex min-w-0 cursor-pointer rounded-[var(--cc-radius)] border border-input shadow-xs outline-none transition-[border-color,box-shadow] motion-reduce:transition-none',
                'has-[:checked]:border-[color-mix(in_oklab,var(--cc-accent)_50%,transparent)]',
                'has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50',
                (tiles || !showIndicator) && 'has-[:focus-visible]:border-ring has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50',
                tiles
                  ? cn('flex-col items-center justify-center gap-3 text-center', compact ? 'px-2 py-2.5' : 'px-2 py-3')
                  : grid
                    ? cn('flex-col gap-4', compact ? 'p-3' : 'p-4')
                    : cn('w-full items-start gap-2', compact ? 'p-3' : 'p-4'),
              )}
            >
              <input
                id={inputId}
                type={radio ? 'radio' : 'checkbox'}
                name={name ?? id}
                value={item.value}
                checked={checked}
                disabled={item.disabled}
                aria-describedby={desc ? `${inputId}-description` : undefined}
                onChange={(e) => toggle(item.value, e.target.checked)}
                className="sr-only"
              />
              {grid ? (
                <>
                  <div className="flex justify-between gap-2">
                    {icon ? <span className="opacity-60">{item.icon}</span> : <span />}
                    {showIndicator && <Indicator mode={o.mode} />}
                  </div>
                  <div className="grid gap-1.5">
                    <span className="font-medium text-foreground text-sm leading-none break-words">{item.label}</span>
                    {desc && (
                      <span className="text-muted-foreground text-xs" id={`${inputId}-description`}>
                        {item.description}
                      </span>
                    )}
                  </div>
                </>
              ) : tiles ? (
                <>
                  {icon && <span className="opacity-60">{item.icon}</span>}
                  <span className="font-medium text-foreground text-sm leading-none">{item.label}</span>
                </>
              ) : (
                <>
                  {showIndicator && (
                    <span className="order-1 flex">
                      <Indicator mode={o.mode} />
                    </span>
                  )}
                  <div className={cn('flex min-w-0 grow gap-3', desc ? 'items-start' : 'items-center')}>
                    {icon && <span className="shrink-0">{item.icon}</span>}
                    <div className="grid min-w-0 gap-2">
                      <span className="font-medium text-foreground text-sm leading-4">
                        {item.label}{' '}
                        {item.sublabel && <span className="font-normal text-muted-foreground text-xs leading-[inherit]">({item.sublabel})</span>}
                      </span>
                      {desc && (
                        <span className="text-muted-foreground text-xs" id={`${inputId}-description`}>
                          {item.description}
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
