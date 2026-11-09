// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/components/comp-46.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { useId, useLayoutEffect, useRef, useState, type ChangeEvent, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  defaultCountry: 'US',
  countries: 'all',
  pickerStyle: 'chip',
  showDialCode: true,
  grouping: true,
  size: 'md',
  radius: 6,
  accent: '#a1a1aa',
}
/* @motif:end */

type Country = { code: string; name: string; dial: string; pattern: string; region: 'americas' | 'europe' | 'asia' | 'other' }

/** 代替 libphonenumber 元数据：只覆盖常见国家，# 是一位数字，其他字符是分组符号。 */
export const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', dial: '1', pattern: '(###) ###-####', region: 'americas' },
  { code: 'CA', name: 'Canada', dial: '1', pattern: '(###) ###-####', region: 'americas' },
  { code: 'MX', name: 'Mexico', dial: '52', pattern: '## #### ####', region: 'americas' },
  { code: 'BR', name: 'Brazil', dial: '55', pattern: '(##) #####-####', region: 'americas' },
  { code: 'AR', name: 'Argentina', dial: '54', pattern: '## ####-####', region: 'americas' },
  { code: 'GB', name: 'United Kingdom', dial: '44', pattern: '#### ######', region: 'europe' },
  { code: 'DE', name: 'Germany', dial: '49', pattern: '### ########', region: 'europe' },
  { code: 'FR', name: 'France', dial: '33', pattern: '# ## ## ## ##', region: 'europe' },
  { code: 'ES', name: 'Spain', dial: '34', pattern: '### ## ## ##', region: 'europe' },
  { code: 'IT', name: 'Italy', dial: '39', pattern: '### ### ####', region: 'europe' },
  { code: 'NL', name: 'Netherlands', dial: '31', pattern: '# ########', region: 'europe' },
  { code: 'SE', name: 'Sweden', dial: '46', pattern: '##-### ## ##', region: 'europe' },
  { code: 'PL', name: 'Poland', dial: '48', pattern: '### ### ###', region: 'europe' },
  { code: 'PT', name: 'Portugal', dial: '351', pattern: '### ### ###', region: 'europe' },
  { code: 'CN', name: 'China', dial: '86', pattern: '### #### ####', region: 'asia' },
  { code: 'JP', name: 'Japan', dial: '81', pattern: '##-####-####', region: 'asia' },
  { code: 'KR', name: 'South Korea', dial: '82', pattern: '##-####-####', region: 'asia' },
  { code: 'IN', name: 'India', dial: '91', pattern: '##### #####', region: 'asia' },
  { code: 'SG', name: 'Singapore', dial: '65', pattern: '#### ####', region: 'asia' },
  { code: 'AE', name: 'United Arab Emirates', dial: '971', pattern: '## ### ####', region: 'asia' },
  { code: 'AU', name: 'Australia', dial: '61', pattern: '### ### ###', region: 'other' },
  { code: 'NZ', name: 'New Zealand', dial: '64', pattern: '## ### ####', region: 'other' },
  { code: 'ZA', name: 'South Africa', dial: '27', pattern: '## ### ####', region: 'other' },
]

const EXAMPLE = '2015550123456'
const maxDigits = (pattern: string) => pattern.split('#').length - 1

/** 按国家的分组模式格式化；数字用完就停，不留尾随的分隔符。 */
export function formatPhone(digits: string, pattern: string, grouping = true) {
  const max = maxDigits(pattern)
  const d = digits.replace(/\D/g, '').slice(0, max)
  if (!grouping) return d
  let out = ''
  let i = 0
  for (const ch of pattern) {
    if (i >= d.length) break
    if (ch === '#') out += d[i++]
    else out += ch
  }
  return out
}

/** 选浅色或深色墨水：WCAG 相对亮度。 */
function inkFor(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return '#0a0a0a'
  const n = parseInt(m[1]!, 16)
  const lin = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const L = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return L > 0.4 ? '#0a0a0a' : '#fafafa'
}

const SIZE = {
  sm: { h: 'h-8', text: 'text-[13px]', pad: 'ps-2.5 pe-1.5' },
  md: { h: 'h-9', text: 'text-sm', pad: 'ps-3 pe-2' },
  lg: { h: 'h-11', text: 'text-base', pad: 'ps-3.5 pe-2.5' },
} as const

export type InputPhoneCountryProps = Partial<typeof defaults> & {
  label?: string
  /** 只含数字的号码（不含区号）；传了就是受控。 */
  value?: string
  onValueChange?: (digits: string, country: string) => void
  country?: string
  onCountryChange?: (country: string) => void
  disabled?: boolean
  name?: string
  className?: string
  style?: CSSProperties
}

const ChevronDownIcon = () => (
  <svg aria-hidden="true" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
)

/** Phone number input with a country select (Origin UI comp-46). */
export function InputPhoneCountry({ label = 'Phone number', value: valueProp, onValueChange, country: countryProp, onCountryChange, disabled, name, className, style, ...props }: InputPhoneCountryProps) {
  const { defaultCountry, countries, pickerStyle, showDialCode, grouping, size, radius, accent } = { ...defaults, ...props }
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const caret = useRef<number | null>(null)

  const options = COUNTRIES.filter((c) => countries === 'all' || c.region === countries || c.code === defaultCountry)
  const [innerCountry, setInnerCountry] = useState(defaultCountry)
  const [innerValue, setInnerValue] = useState('')
  const code = countryProp ?? innerCountry
  const current = COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0]!
  const digits = (valueProp ?? innerValue).replace(/\D/g, '').slice(0, maxDigits(current.pattern))
  const display = formatPhone(digits, current.pattern, grouping)
  const placeholder = formatPhone(EXAMPLE, current.pattern, grouping)
  const s = SIZE[size as keyof typeof SIZE] ?? SIZE.md
  const ink = inkFor(accent)

  // 重新分组后把光标放回同一位数字之后。
  useLayoutEffect(() => {
    const el = inputRef.current
    if (!el || caret.current === null || document.activeElement !== el) return
    let seen = 0
    let pos = 0
    while (pos < display.length && seen < caret.current) {
      if (/\d/.test(display[pos]!)) seen++
      pos++
    }
    el.setSelectionRange(pos, pos)
    caret.current = null
  }, [display])

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const at = e.target.selectionStart ?? raw.length
    caret.current = raw.slice(0, at).replace(/\D/g, '').length
    const next = raw.replace(/\D/g, '').slice(0, maxDigits(current.pattern))
    if (valueProp === undefined) setInnerValue(next)
    onValueChange?.(next, current.code)
  }

  const handleSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value
    if (countryProp === undefined) setInnerCountry(next)
    onCountryChange?.(next)
  }

  return (
    <div
      className={cn('w-full *:not-first:mt-2', className)}
      dir="ltr"
      style={{ '--r': `${radius}px`, '--accent-c': accent, ...style } as CSSProperties}
    >
      {label && (
        <label htmlFor={id} className="block text-sm leading-4 font-medium text-foreground select-none">
          {label}
        </label>
      )}
      <div className="flex rounded-(--r) shadow-xs">
        <div
          className={cn(
            'relative inline-flex shrink-0 items-center self-stretch rounded-s-(--r) border border-input bg-background text-muted-foreground outline-none transition-[color,box-shadow,background-color,border-color] focus-within:z-10 focus-within:border-(--accent-c) focus-within:ring-[3px] focus-within:ring-[color-mix(in_oklab,var(--accent-c)_45%,transparent)] hover:bg-accent hover:text-foreground has-disabled:pointer-events-none has-disabled:opacity-50 motion-reduce:transition-none',
            s.pad,
            s.text,
          )}
        >
          <div aria-hidden="true" className="inline-flex items-center gap-1">
            {pickerStyle === 'code' ? (
              <span className="font-medium text-foreground tabular-nums">{current.code}</span>
            ) : (
              <span
                className="inline-flex h-[15px] w-5 items-center justify-center overflow-hidden rounded-sm text-[9px] leading-none font-semibold tracking-wide"
                style={{ background: accent, color: ink }}
              >
                {current.code}
              </span>
            )}
            {pickerStyle === 'dial' && <span className="ms-0.5 text-foreground tabular-nums">+{current.dial}</span>}
            <span className="text-muted-foreground/80">
              <ChevronDownIcon />
            </span>
          </div>
          <select
            aria-label="Select country"
            className="absolute inset-0 cursor-pointer text-sm opacity-0"
            disabled={disabled}
            onChange={handleSelect}
            value={current.code}
          >
            {options.map((option) => (
              <option key={option.code} value={option.code}>
                {option.name} +{option.dial}
              </option>
            ))}
          </select>
        </div>
        <div
          className={cn(
            '-ms-px flex w-full min-w-0 items-center rounded-e-(--r) border border-input bg-transparent px-3 text-foreground outline-none transition-[color,box-shadow,border-color] focus-within:z-10 focus-within:border-(--accent-c) focus-within:ring-[3px] focus-within:ring-[color-mix(in_oklab,var(--accent-c)_45%,transparent)] has-disabled:opacity-50 motion-reduce:transition-none',
            s.h,
            s.text,
          )}
        >
          {showDialCode && (
            <span aria-hidden="true" className="me-1.5 shrink-0 text-muted-foreground tabular-nums">
              +{current.dial}
            </span>
          )}
          <input
            ref={inputRef}
            id={id}
            name={name}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            data-slot="phone-input"
            aria-label={label ? undefined : 'Phone number'}
            aria-description={`+${current.dial}, ${current.name}`}
            disabled={disabled}
            placeholder={placeholder}
            value={display}
            onChange={handleInput}
            className="h-full w-full min-w-0 bg-transparent tabular-nums outline-none placeholder:text-muted-foreground/70 disabled:cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  )
}
