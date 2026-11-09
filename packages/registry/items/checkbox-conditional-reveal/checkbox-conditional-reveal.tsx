// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/components/comp-142.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  control: 'checkbox',
  fieldType: 'text',
  duration: 150,
  autoFocus: true,
  showDescription: true,
  radius: 6,
  accent: '#e4e4e7',
}
/* @motif:end */

type Options = {
  control: string
  fieldType: string
  duration: number
  autoFocus: boolean
  showDescription: boolean
  radius: number
  accent: string
}

export type RevealFieldProps = Partial<Options> & {
  /** Label of the option that reveals the field. */
  label?: string
  description?: string
  /** Radio mode: label and description of the second option (no field). */
  otherLabel?: string
  otherDescription?: string
  fieldLabel?: string
  placeholder?: string
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  fieldValue?: string
  onFieldValueChange?: (value: string) => void
  name?: string
  className?: string
  style?: CSSProperties
}

/** Pick white or near-black ink, whichever contrasts more with the accent. */
function inkFor(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m?.[1]) return '#ffffff'
  const n = parseInt(m[1], 16)
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return 1.05 / (l + 0.05) >= (l + 0.05) / 0.0595 ? '#ffffff' : '#0a0a0a'
}

const controlBase =
  'peer flex size-4 shrink-0 cursor-pointer appearance-none items-center justify-center border border-input shadow-xs outline-none transition-[box-shadow,background-color,border-color] focus-visible:border-(--accent) focus-visible:ring-[3px] focus-visible:ring-(--accent)/50 disabled:cursor-not-allowed disabled:opacity-50 checked:border-(--accent) checked:bg-(--accent) motion-reduce:transition-none'

const fieldClass =
  'flex w-full min-w-0 rounded-(--radius) border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow,border-color] placeholder:text-muted-foreground/70 focus-visible:border-(--accent) focus-visible:ring-[3px] focus-visible:ring-(--accent)/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'

function Indicator({ radio }: { radio: boolean }) {
  const cls = 'pointer-events-none absolute inset-0 m-auto opacity-0 peer-checked:opacity-100'
  return radio ? (
    <svg aria-hidden className={cls} fill="var(--ink)" height="6" viewBox="0 0 6 6" width="6">
      <circle cx="3" cy="3" r="3" />
    </svg>
  ) : (
    <svg aria-hidden className={cls} fill="var(--ink)" height="9" viewBox="0 0 9 9" width="9">
      <path
        clipRule="evenodd"
        d="M8.53547 0.62293C8.88226 0.849446 8.97976 1.3142 8.75325 1.66099L4.5083 8.1599C4.38833 8.34356 4.19397 8.4655 3.9764 8.49358C3.75883 8.52167 3.53987 8.45309 3.3772 8.30591L0.616113 5.80777C0.308959 5.52987 0.285246 5.05559 0.563148 4.74844C0.84105 4.44128 1.31533 4.41757 1.62249 4.69547L3.73256 6.60459L7.49741 0.840706C7.72393 0.493916 8.18868 0.396414 8.53547 0.62293Z"
        fillRule="evenodd"
      />
    </svg>
  )
}

/** A checkbox (or a radio pair) whose selection expands a follow-up field and moves focus into it. */
export function RevealField({
  label = 'Checkbox with expansion',
  description = 'You can use this checkbox with a label and a description.',
  otherLabel = 'Radio without expansion',
  otherDescription = 'You can use this radio with a label and a description.',
  fieldLabel = 'Additional Information',
  placeholder = 'Enter details',
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  fieldValue,
  onFieldValueChange,
  name,
  className,
  style,
  ...props
}: RevealFieldProps) {
  const { control, fieldType, duration, autoFocus, showDescription, radius, accent } = { ...defaults, ...props } as Options
  const checkboxId = useId()
  const inputId = useId()
  const groupName = useId()
  const [inner, setInner] = useState(defaultChecked)
  const checked = checkedProp ?? inner
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null)
  const mounted = useRef(false)

  const setChecked = (next: boolean) => {
    if (checkedProp === undefined) setInner(next)
    onCheckedChange?.(next)
  }

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    if (checked && autoFocus && inputRef.current) {
      inputRef.current.focus({ preventScroll: true })
    }
  }, [checked, autoFocus])

  const isRadio = control === 'radio'
  const vars = { '--accent': accent, '--ink': inkFor(accent), '--radius': `${radius}px`, ...style } as CSSProperties
  const onFieldChange = onFieldValueChange ? (e: { target: { value: string } }) => onFieldValueChange(e.target.value) : undefined

  const field = (
    <div
      aria-labelledby={checkboxId}
      className="grid ease-in-out [transition-property:grid-template-rows,opacity] data-[state=collapsed]:grid-rows-[0fr] data-[state=collapsed]:opacity-0 data-[state=expanded]:grid-rows-[1fr] data-[state=expanded]:opacity-100 motion-reduce:transition-none"
      data-state={checked ? 'expanded' : 'collapsed'}
      id={inputId}
      role="region"
      style={{ transitionDuration: `${duration}ms` }}
    >
      <div className="pointer-events-none -m-2 overflow-hidden p-2">
        <div className="pointer-events-auto mt-3">
          {fieldType === 'textarea' ? (
            <textarea
              aria-label={fieldLabel}
              className={cn(fieldClass, 'min-h-18 resize-none py-2')}
              disabled={!checked}
              placeholder={placeholder}
              ref={inputRef}
              rows={3}
              value={fieldValue}
              onChange={onFieldChange}
            />
          ) : (
            <input
              aria-label={fieldLabel}
              className={cn(fieldClass, 'h-9')}
              disabled={!checked}
              placeholder={placeholder}
              ref={inputRef}
              type="text"
              value={fieldValue}
              onChange={onFieldChange}
            />
          )}
        </div>
      </div>
    </div>
  )

  const row = (
    <div className="flex items-start gap-2">
      <span className="relative mt-0.5 flex shrink-0">
        <input
          aria-controls={inputId}
          aria-describedby={showDescription ? `${checkboxId}-description` : undefined}
          checked={checked}
          className={cn(controlBase, isRadio ? 'rounded-full' : 'rounded-[4px]')}
          id={checkboxId}
          name={isRadio ? (name ?? groupName) : name}
          onChange={(e) => setChecked(isRadio ? true : e.target.checked)}
          type={isRadio ? 'radio' : 'checkbox'}
          value={isRadio ? 'with-expansion' : undefined}
        />
        <Indicator radio={isRadio} />
      </span>
      <div className="min-w-0 grow">
        <div className="grid gap-2">
          <label className="cursor-pointer text-sm leading-5 font-medium text-foreground" htmlFor={checkboxId}>
            {label}
          </label>
          {showDescription && (
            <p className="text-xs text-muted-foreground" id={`${checkboxId}-description`}>
              {description}
            </p>
          )}
        </div>
        {field}
      </div>
    </div>
  )

  if (!isRadio) {
    return (
      <div className={cn('text-foreground', className)} style={vars}>
        {row}
      </div>
    )
  }

  return (
    <div className={cn('grid gap-6 text-foreground', className)} role="radiogroup" style={vars}>
      <div>{row}</div>
      <div className="flex items-start gap-2">
        <span className="relative mt-0.5 flex shrink-0">
          <input
            aria-describedby={showDescription ? `${checkboxId}-2-description` : undefined}
            checked={!checked}
            className={cn(controlBase, 'rounded-full')}
            id={`${checkboxId}-2`}
            name={name ?? groupName}
            onChange={() => setChecked(false)}
            type="radio"
            value="without-expansion"
          />
          <Indicator radio />
        </span>
        <div className="grid min-w-0 grow gap-2">
          <label className="cursor-pointer text-sm leading-5 font-medium text-foreground" htmlFor={`${checkboxId}-2`}>
            {otherLabel}
          </label>
          {showDescription && (
            <p className="text-xs text-muted-foreground" id={`${checkboxId}-2-description`}>
              {otherDescription}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
