// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/components/comp-169.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { useId, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  options: 'all',
  previewStyle: 'app',
  accent: '#6366f1',
  size: 88,
  radius: 6,
  labelPosition: 'start',
}
/* @motif:end */

export type ThemeValue = 'light' | 'dark' | 'system'

export type ThemePreviewPickerProps = Partial<typeof defaults> & {
  value?: ThemeValue
  defaultValue?: ThemeValue
  onValueChange?: (value: ThemeValue) => void
  legend?: string
  name?: string
  disabled?: boolean
  className?: string
  style?: CSSProperties
}

const items: { label: string; value: ThemeValue }[] = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
]

const PALETTES = {
  light: { bg: '#ffffff', panel: '#f4f4f5', line: '#e4e4e7', ink: '#a1a1aa' },
  dark: { bg: '#18181b', panel: '#27272a', line: '#3f3f46', ink: '#71717a' },
}

/** 用 CSS 画的迷你应用窗口，代替上游的 PNG 截图。 */
function Window({ tone, variant, accent }: { tone: 'light' | 'dark'; variant: string; accent: string }) {
  const p = PALETTES[tone]
  const bar = (w: string, c = p.line) => <span className="block h-[3px] shrink-0 rounded-full" style={{ width: w, background: c }} />
  if (variant === 'page') {
    return (
      <span className="absolute inset-0 flex flex-col" style={{ background: p.bg }}>
        <span className="flex h-[16%] items-center gap-[3px] px-[8%]" style={{ background: p.panel, borderBottom: `1px solid ${p.line}` }}>
          <span className="size-[4px] shrink-0 rounded-full" style={{ background: accent }} />
          {bar('18%', p.ink)}
        </span>
        <span className="flex flex-1 flex-col gap-[4px] px-[14%] pt-[9%]">
          {bar('60%', p.ink)}
          {bar('100%')}
          {bar('92%')}
          {bar('70%')}
          <span className="block h-[22%] rounded-[2px]" style={{ background: p.panel, border: `1px solid ${p.line}` }} />
          {bar('85%')}
        </span>
      </span>
    )
  }
  return (
    <span className="absolute inset-0 flex" style={{ background: p.bg }}>
      <span className="flex w-[26%] flex-col gap-[4px] px-[5%] pt-[10%]" style={{ background: p.panel, borderRight: `1px solid ${p.line}` }}>
        <span className="mb-[2px] size-[6px] shrink-0 rounded-[2px]" style={{ background: accent }} />
        {bar('100%', p.ink)}
        {bar('80%')}
        {bar('90%')}
        {bar('70%')}
      </span>
      <span className="flex flex-1 flex-col">
        <span className="flex h-[16%] items-center justify-between px-[7%]" style={{ borderBottom: `1px solid ${p.line}` }}>
          {bar('34%', p.ink)}
          <span className="size-[5px] rounded-full" style={{ background: p.line }} />
        </span>
        <span className="grid flex-1 grid-cols-2 gap-[4px] p-[7%]">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="flex flex-col justify-end rounded-[2px] p-[3px]" style={{ background: p.panel, border: `1px solid ${p.line}` }}>
              <span className="block h-[3px] rounded-full" style={{ width: i === 0 ? '70%' : '45%', background: i === 0 ? accent : p.ink }} />
            </span>
          ))}
        </span>
      </span>
    </span>
  )
}

export function ThemePreviewPicker({ value, defaultValue, onValueChange, legend = 'Choose a theme', name, disabled, className, style, ...props }: ThemePreviewPickerProps) {
  const options = { ...defaults, ...props }
  const id = useId()
  const [inner, setInner] = useState<ThemeValue>(defaultValue ?? 'light')
  const current = value ?? inner
  const list = options.options === 'pair' ? items.slice(0, 2) : items
  const width = options.size
  const height = Math.round((width * 70) / 88)

  return (
    <fieldset className={cn('min-w-0 space-y-4', className)} style={style} disabled={disabled}>
      <legend className="font-medium text-foreground text-sm leading-none">{legend}</legend>
      <div role="radiogroup" aria-label={legend} className="flex flex-wrap gap-3">
        {list.map((item) => {
          const checked = item.value === current
          return (
            <label key={`${id}-${item.value}`} className="block">
              <input
                type="radio"
                className="peer sr-only"
                id={`${id}-${item.value}`}
                name={name ?? id}
                value={item.value}
                checked={checked}
                onChange={() => {
                  setInner(item.value)
                  onValueChange?.(item.value)
                }}
              />
              <span
                aria-hidden="true"
                className="relative block cursor-pointer overflow-hidden border border-input shadow-xs outline-none transition-[color,box-shadow,border-color] peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50 peer-disabled:cursor-not-allowed peer-checked:border-ring peer-checked:bg-accent peer-disabled:opacity-50 motion-reduce:transition-none"
                style={{ width, height, borderRadius: options.radius }}
              >
                {item.value === 'system' ? (
                  <>
                    <Window tone="light" variant={options.previewStyle} accent={options.accent} />
                    <span className="absolute inset-0" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}>
                      <Window tone="dark" variant={options.previewStyle} accent={options.accent} />
                    </span>
                  </>
                ) : (
                  <Window tone={item.value} variant={options.previewStyle} accent={options.accent} />
                )}
              </span>
              <span
                className={cn('mt-2 flex items-center gap-1', options.labelPosition === 'center' && 'justify-center', !checked && 'text-muted-foreground/70')}
                style={{ width }}
              >
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {checked ? <path d="M20 6 9 17l-5-5" /> : <path d="M5 12h14" />}
                </svg>
                <span className="font-medium text-xs">{item.label}</span>
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
