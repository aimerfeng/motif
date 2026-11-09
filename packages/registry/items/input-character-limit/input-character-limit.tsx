// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/components/comp-34.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { useId, useLayoutEffect, useRef, useState, type ChangeEvent, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  field: 'textarea',
  maxLength: 50,
  counter: 'auto',
  counterPosition: 'below',
  warnAt: 0.8,
  autogrow: true,
  radius: 6,
}
/* @motif:end */

export type InputCharacterLimitProps = Partial<typeof defaults> & {
  label?: string
  placeholder?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  disabled?: boolean
  name?: string
  className?: string
  style?: CSSProperties
}

/** Port of the upstream useCharacterLimit hook, with optional control. */
function useCharacterLimit({ maxLength, value: controlled, initialValue = '', onChange }: { maxLength: number; value?: string; initialValue?: string; onChange?: (v: string) => void }) {
  const [inner, setInner] = useState(initialValue)
  const value = (controlled ?? inner).slice(0, maxLength)
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value
    if (newValue.length <= maxLength) {
      if (controlled === undefined) setInner(newValue)
      onChange?.(newValue)
    }
  }
  return { value, characterCount: value.length, handleChange, maxLength }
}

const FIELD =
  'flex w-full min-w-0 rounded-(--r) border border-input bg-transparent px-3 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow,border-color] placeholder:text-muted-foreground/70 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 border-(--tone,var(--input)) focus-visible:border-(--tone,var(--ring)) focus-visible:ring-(--ring-tone)'

function Ring({ ratio, color }: { ratio: number; color: string }) {
  const r = 7
  const c = 2 * Math.PI * r
  return (
    <svg aria-hidden viewBox="0 0 18 18" width={16} height={16} className="-rotate-90 shrink-0">
      <circle cx="9" cy="9" r={r} fill="none" stroke="currentColor" strokeOpacity={0.2} strokeWidth={2} />
      <circle cx="9" cy="9" r={r} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - ratio)} className="transition-[stroke-dashoffset,stroke] duration-150 motion-reduce:transition-none" />
    </svg>
  )
}

/** Input / textarea with a live character counter (Origin UI comp-34 / comp-35 / comp-74, autogrow from comp-77). */
export function InputCharacterLimit({ label, placeholder, value: valueProp, defaultValue, onChange, disabled, name, className, style, ...props }: InputCharacterLimitProps) {
  const { field, maxLength, counter, counterPosition, warnAt, autogrow, radius } = { ...defaults, ...props }
  const id = useId()
  const { value, characterCount, handleChange, maxLength: limit } = useCharacterLimit({ maxLength, value: valueProp, initialValue: defaultValue, onChange })
  const areaRef = useRef<HTMLTextAreaElement>(null)

  const left = limit - characterCount
  const ratio = limit > 0 ? characterCount / limit : 0
  const level = ratio >= 1 ? 'full' : ratio >= warnAt ? 'warn' : 'ok'
  const tone = level === 'full' ? '#ef4444' : level === 'warn' ? '#f59e0b' : undefined
  const ringTone = tone ? `color-mix(in oklab, ${tone} 30%, transparent)` : 'color-mix(in oklab, var(--ring) 50%, transparent)'
  const near = level !== 'ok'

  // JS fallback for browsers without CSS field-sizing.
  useLayoutEffect(() => {
    const el = areaRef.current
    if (!el || field !== 'textarea' || !autogrow) return
    if (typeof CSS !== 'undefined' && CSS.supports?.('field-sizing', 'content')) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight + 2, 118)}px`
  }, [value, field, autogrow])

  const counterText =
    counter === 'remaining' || (counter === 'auto' && near) ? (
      <>
        <span className="tabular-nums">{left}</span> {counterPosition === 'inline' ? 'left' : 'characters left'}
      </>
    ) : (
      <span className="tabular-nums">
        {characterCount}/{limit}
      </span>
    )

  const counterEl = (
    <div
      aria-live="polite"
      role="status"
      id={`${id}-description`}
      className={cn(
        'flex items-center gap-1.5 text-xs text-muted-foreground transition-colors',
        counterPosition === 'inline'
          ? cn('pointer-events-none absolute end-0 pe-3 peer-disabled:opacity-50', field === 'textarea' ? 'bottom-0 pb-2' : 'inset-y-0')
          : 'mt-2 justify-end',
      )}
      style={tone ? { color: tone } : undefined}
    >
      {counter === 'ring' ? (
        <>
          <Ring ratio={ratio} color={tone ?? 'var(--muted-foreground)'} />
          {near && <span className="tabular-nums">{left}</span>}
        </>
      ) : (
        counterText
      )}
    </div>
  )

  const shared = {
    id,
    name,
    disabled,
    placeholder,
    maxLength: limit,
    value,
    onChange: handleChange,
    'aria-describedby': `${id}-description`,
    'aria-invalid': level === 'full' ? undefined : undefined,
  }
  const pad = counterPosition === 'inline' ? (counter === 'ring' ? 'pe-12' : counter === 'fraction' ? 'pe-16' : 'pe-20') : ''

  return (
    <div className={cn('w-full *:not-first:mt-2', className)} style={{ '--r': `${radius}px`, '--ring-tone': ringTone, ...(tone ? { '--tone': tone } : {}), ...style } as CSSProperties}>
      {label && (
        <label htmlFor={id} className="block text-sm leading-4 font-medium text-foreground select-none">
          {label}
        </label>
      )}
      <div className="relative">
        {field === 'textarea' ? (
          <textarea
            ref={areaRef}
            {...shared}
            rows={autogrow ? 1 : 4}
            className={cn(FIELD, 'peer', autogrow ? 'field-sizing-content max-h-29.5 min-h-0 resize-none py-1.75' : 'min-h-19.5 py-2', counterPosition === 'inline' && 'pb-7')}
          />
        ) : (
          <input {...shared} type="text" className={cn(FIELD, 'peer h-9 py-1', pad)} />
        )}
        {counterPosition === 'inline' && counterEl}
      </div>
      {counterPosition !== 'inline' && counterEl}
    </div>
  )
}
