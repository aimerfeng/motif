// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/components/comp-158.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { useId, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  palette: ['#3b82f6', '#6366f1', '#ec4899', '#ef4444', '#f97316', '#f59e0b', '#10b981'],
  shape: 'circle',
  showCheck: true,
  size: 24,
  ringOffset: 2,
  gap: 8,
  layout: 'row',
}
/* @motif:end */

export type ColorSwatchesProps = Partial<typeof defaults> & {
  /** 每个色块的名字（读屏软件和 title 用），与 palette 一一对应。 */
  labels?: string[]
  value?: string
  defaultValue?: string
  onValueChange?: (color: string) => void
  legend?: string
  name?: string
  disabled?: boolean
  className?: string
  style?: CSSProperties
}

/** 相对亮度（WCAG），用来在色块上选白色或近黑色的对勾。 */
function luminance(hex: string): number {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6)
  const n = Number.parseInt(full, 16)
  if (Number.isNaN(n)) return 0
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * ch[0]! + 0.7152 * ch[1]! + 0.0722 * ch[2]!
}

function inkFor(hex: string): string {
  const l = luminance(hex)
  // 白色对比度 (1.05)/(l+0.05) 与近黑色 (#111) 对比度 (l+0.05)/(0.0056+0.05)，取高的那个。
  return 1.05 / (l + 0.05) >= (l + 0.05) / 0.0556 ? '#ffffff' : '#111111'
}

export function ColorSwatches({ labels, value, defaultValue, onValueChange, legend = 'Choose a color', name, disabled, className, style, ...props }: ColorSwatchesProps) {
  const options = { ...defaults, ...props }
  const palette = options.palette
  const autoName = useId()
  const [inner, setInner] = useState(defaultValue ?? palette[0])
  const current = value ?? inner
  const radius = options.shape === 'square' ? Math.round(options.size * 0.22) : 9999

  return (
    <fieldset className={cn('min-w-0 space-y-4', className)} style={style} disabled={disabled}>
      <legend className="font-medium text-foreground text-sm leading-none">{legend}</legend>
      <div
        role="radiogroup"
        aria-label={legend}
        className={cn(options.layout === 'grid' ? 'grid w-fit max-w-full' : 'flex flex-wrap')}
        style={{
          gap: options.gap,
          padding: options.ringOffset + 2,
          margin: -(options.ringOffset + 2),
          gridTemplateColumns: options.layout === 'grid' ? `repeat(${Math.min(4, palette.length)}, ${options.size}px)` : undefined,
        }}
      >
        {palette.map((color, i) => {
          const checked = color === current
          const label = labels?.[i] ?? `Color ${i + 1} (${color})`
          const ink = inkFor(color)
          return (
            <label
              key={`${color}-${i}`}
              title={label}
              className={cn(
                'group relative grid aspect-square shrink-0 cursor-pointer place-items-center border shadow-none',
                'transition-[box-shadow,transform] duration-200 ease-out motion-reduce:transition-none',
                'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-[calc(var(--ro)+4px)] has-[:focus-visible]:outline-ring',
                'has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50',
                !checked && 'hover:scale-105 motion-reduce:hover:scale-100',
              )}
              style={
                {
                  '--ro': `${options.ringOffset}px`,
                  width: options.size,
                  height: options.size,
                  borderRadius: radius,
                  background: color,
                  borderColor: color,
                  color: ink,
                  boxShadow: checked ? `0 0 0 ${options.ringOffset}px var(--background), 0 0 0 ${options.ringOffset + 2}px ${color}` : 'none',
                } as CSSProperties
              }
            >
              <input
                type="radio"
                className="peer absolute inset-0 m-0 cursor-[inherit] appearance-none rounded-[inherit] opacity-0"
                name={name ?? autoName}
                value={color}
                checked={checked}
                aria-label={label}
                onChange={() => {
                  setInner(color)
                  onValueChange?.(color)
                }}
              />
              <span
                aria-hidden
                className={cn('pointer-events-none flex items-center justify-center transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none', checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0')}
              >
                {options.showCheck ? (
                  <svg viewBox="0 0 16 16" width={Math.round(options.size * 0.5)} height={Math.round(options.size * 0.5)} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3.5 8.5 3 3 6-7" />
                  </svg>
                ) : (
                  <svg fill="currentcolor" height="6" viewBox="0 0 6 6" width="6">
                    <circle cx="3" cy="3" r="3" />
                  </svg>
                )}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
