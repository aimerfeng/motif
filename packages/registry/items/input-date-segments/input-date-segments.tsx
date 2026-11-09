// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/ui/datefield-rac.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  granularity: 'day',
  hourCycle: '12',
  locale: 'en-US',
  showIcon: false,
  iconPosition: 'start',
  size: 'md',
  radius: 6,
  accent: '#34334a',
}
/* @motif:end */

export type SegmentType = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'dayPeriod'

/** Field value: hour is always 0–23; missing or null fields show as placeholders. */
export type DateSegmentsValue = Partial<Record<'year' | 'month' | 'day' | 'hour' | 'minute', number | null>>

export type InputDateSegmentsProps = Partial<{
  granularity: string
  hourCycle: string
  locale: string
  showIcon: boolean
  iconPosition: string
  size: string
  radius: number
  accent: string
}> & {
  label?: ReactNode
  description?: ReactNode
  value?: DateSegmentsValue
  defaultValue?: DateSegmentsValue
  onChange?: (value: DateSegmentsValue) => void
  /** Shows a segment as focused without moving real focus (used by demos). */
  activeSegment?: SegmentType | null
  name?: string
  className?: string
  style?: CSSProperties
}

type Part = { type: SegmentType | 'literal'; text: string }

const SAMPLE = new Date(2001, 10, 22, 10, 33)

const PLACEHOLDERS: Record<string, Partial<Record<SegmentType, string>>> = {
  en: { year: 'yyyy', month: 'mm', day: 'dd' },
  de: { year: 'jjjj', month: 'mm', day: 'tt' },
  fr: { year: 'aaaa', month: 'mm', day: 'jj' },
  ja: { year: 'yyyy', month: 'mm', day: 'dd' },
  zh: { year: 'yyyy', month: 'mm', day: 'dd' },
}

const LABELS: Record<SegmentType, string> = { year: 'year', month: 'month', day: 'day', hour: 'hour', minute: 'minute', dayPeriod: 'AM/PM' }

const daysInMonth = (year: number | null | undefined, month: number | null | undefined) =>
  month ? new Date(year ?? 2000, month, 0).getDate() : 31

function getParts(locale: string, granularity: string, h12: boolean): Part[] {
  const date = granularity !== 'time'
  const time = granularity !== 'day'
  let formatter: Intl.DateTimeFormat
  const options: Intl.DateTimeFormatOptions = {
    ...(date ? { year: 'numeric', month: '2-digit', day: '2-digit' } : {}),
    ...(time ? { hour: '2-digit', minute: '2-digit', hourCycle: h12 ? 'h12' : 'h23' } : {}),
  }
  try {
    formatter = new Intl.DateTimeFormat(locale, options)
  } catch {
    formatter = new Intl.DateTimeFormat('en-US', options)
  }
  const out: Part[] = []
  for (const p of formatter.formatToParts(SAMPLE)) {
    if (p.type === 'year' || p.type === 'month' || p.type === 'day' || p.type === 'hour' || p.type === 'minute' || p.type === 'dayPeriod') {
      out.push({ type: p.type, text: p.value })
    } else if (p.type === 'literal') {
      // Keep separators compact the way date inputs show them ("11/22/2001, 10:33 AM").
      const last = out[out.length - 1]
      if (last?.type === 'literal') last.text += p.value
      else out.push({ type: 'literal', text: p.value })
    }
  }
  return out
}

type Range = { min: number; max: number }

function rangeOf(type: SegmentType, v: DateSegmentsValue, h12: boolean): Range {
  switch (type) {
    case 'year':
      return { min: 1, max: 9999 }
    case 'month':
      return { min: 1, max: 12 }
    case 'day':
      return { min: 1, max: daysInMonth(v.year, v.month) }
    case 'hour':
      return h12 ? { min: 1, max: 12 } : { min: 0, max: 23 }
    case 'minute':
      return { min: 0, max: 59 }
    default:
      return { min: 0, max: 1 }
  }
}

/** Segment value as the user sees it (12-hour clock maps 0 → 12). */
function shownValue(type: SegmentType, v: DateSegmentsValue, h12: boolean): number | null {
  if (type === 'dayPeriod') return v.hour == null ? null : v.hour >= 12 ? 1 : 0
  const raw = v[type]
  if (raw == null) return null
  if (type === 'hour' && h12) return raw % 12 || 12
  return raw
}

function withSegment(type: SegmentType, v: DateSegmentsValue, next: number | null, h12: boolean): DateSegmentsValue {
  const out = { ...v }
  if (type === 'dayPeriod') {
    const hour = v.hour ?? 0
    if (next == null) return out
    out.hour = (hour % 12) + (next ? 12 : 0)
    return out
  }
  if (type === 'hour' && h12 && next != null) {
    const pm = (v.hour ?? 0) >= 12
    out.hour = (next % 12) + (pm ? 12 : 0)
  } else {
    out[type] = next
  }
  if (out.day != null) out.day = Math.min(out.day, daysInMonth(out.year, out.month))
  return out
}

const pad = (n: number, len: number) => String(n).padStart(len, '0')

function toIso(v: DateSegmentsValue, granularity: string) {
  const date = v.year != null && v.month != null && v.day != null ? `${pad(v.year, 4)}-${pad(v.month, 2)}-${pad(v.day, 2)}` : null
  const time = v.hour != null && v.minute != null ? `${pad(v.hour, 2)}:${pad(v.minute, 2)}` : null
  if (granularity === 'day') return date ?? ''
  if (granularity === 'time') return time ?? ''
  return date && time ? `${date}T${time}` : ''
}

function luminance(hex: string) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return 0
  let h = m[1]
  if (h.length === 3) h = h.replace(/./g, (c) => c + c)
  const ch = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}

function ClockIcon({ size = 16 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

function CalendarIcon({ size = 16 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v4M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  )
}

const SIZES: Record<string, { box: string; icon: number; pad: string; padStart: string; padEnd: string }> = {
  sm: { box: 'h-8 px-2.5 py-1.5 text-xs', icon: 14, pad: '0.625rem', padStart: 'ps-8', padEnd: 'pe-8' },
  md: { box: 'h-9 px-3 py-2 text-sm', icon: 16, pad: '0.75rem', padStart: 'ps-9', padEnd: 'pe-9' },
  lg: { box: 'h-11 px-3.5 py-2.5 text-base', icon: 18, pad: '0.875rem', padStart: 'ps-10', padEnd: 'pe-10' },
}

export function InputDateSegments({
  label,
  description,
  value: valueProp,
  defaultValue,
  onChange,
  activeSegment,
  name,
  className,
  style,
  ...props
}: InputDateSegmentsProps) {
  const options = { ...(defaults as Required<typeof props>), ...props }
  const { granularity, hourCycle, locale, showIcon, iconPosition, size, radius, accent } = options
  const h12 = granularity !== 'day' && hourCycle === '12'
  const parts = useMemo(() => getParts(locale, granularity, h12), [locale, granularity, h12])
  const editable = parts.filter((p) => p.type !== 'literal').map((p) => p.type as SegmentType)
  const lang = locale.split('-')[0].toLowerCase()
  const placeholders = PLACEHOLDERS[lang] ?? PLACEHOLDERS.en

  const [inner, setInner] = useState<DateSegmentsValue>(defaultValue ?? {})
  const value = valueProp ?? inner
  const setValue = (next: DateSegmentsValue) => {
    if (valueProp === undefined) setInner(next)
    onChange?.(next)
  }

  const [focused, setFocused] = useState<SegmentType | null>(null)
  const [buffer, setBuffer] = useState('')
  const refs = useRef<Partial<Record<SegmentType, HTMLDivElement | null>>>({})
  const labelId = useId()
  const descId = useId()
  const dayPeriodNames = useMemo(() => {
    try {
      const f = new Intl.DateTimeFormat(locale, { hour: 'numeric', hourCycle: 'h12' })
      const get = (h: number) => f.formatToParts(new Date(2001, 0, 1, h)).find((p) => p.type === 'dayPeriod')?.value ?? (h < 12 ? 'AM' : 'PM')
      return [get(9), get(21)]
    } catch {
      return ['AM', 'PM']
    }
  }, [locale])

  const focusAt = (index: number) => {
    const type = editable[Math.max(0, Math.min(editable.length - 1, index))]
    refs.current[type]?.focus()
  }

  const ink = luminance(accent) > 0.4 ? '#0b0b0f' : '#ffffff'
  const sz = SIZES[size] ?? SIZES.md
  const Icon = granularity === 'time' ? ClockIcon : CalendarIcon

  const onKeyDown = (type: SegmentType, e: KeyboardEvent<HTMLDivElement>) => {
    const index = editable.indexOf(type)
    const range = rangeOf(type, value, h12)
    const current = shownValue(type, value, h12)
    const step = (dir: number) => {
      let next: number
      if (current == null) next = type === 'year' ? new Date().getFullYear() : dir > 0 ? range.min : range.max
      else {
        const span = range.max - range.min + 1
        next = ((current - range.min + dir) % span + span) % span + range.min
      }
      setBuffer('')
      setValue(withSegment(type, value, next, h12))
    }
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        step(1)
        return
      case 'ArrowDown':
        e.preventDefault()
        step(-1)
        return
      case 'ArrowLeft':
        e.preventDefault()
        focusAt(index - 1)
        return
      case 'ArrowRight':
        e.preventDefault()
        focusAt(index + 1)
        return
      case 'Home':
        e.preventDefault()
        setValue(withSegment(type, value, range.min, h12))
        return
      case 'End':
        e.preventDefault()
        setValue(withSegment(type, value, range.max, h12))
        return
      case 'Backspace':
      case 'Delete': {
        e.preventDefault()
        if (type === 'dayPeriod') return
        const text = buffer || (current == null ? '' : String(current))
        const rest = text.slice(0, -1)
        setBuffer(rest)
        const n = rest ? Number(rest) : null
        if (!rest && text === '') focusAt(index - 1)
        setValue(withSegment(type, value, n != null && n >= range.min ? n : null, h12))
        return
      }
    }
    if (type === 'dayPeriod') {
      const key = e.key.toLowerCase()
      const am = dayPeriodNames[0].toLowerCase()
      const pm = dayPeriodNames[1].toLowerCase()
      if (key === 'a' || (am && key === am[0])) setValue(withSegment(type, value, 0, h12))
      else if (key === 'p' || (pm && key === pm[0])) setValue(withSegment(type, value, 1, h12))
      return
    }
    if (/^\d$/.test(e.key)) {
      e.preventDefault()
      const maxLen = type === 'year' ? 4 : 2
      let text = buffer + e.key
      if (Number(text) > range.max || text.length > maxLen) text = e.key
      const n = Number(text)
      setValue(withSegment(type, value, n >= range.min ? n : null, h12))
      const full = text.length >= maxLen || n * 10 > range.max
      if (full) {
        setBuffer('')
        if (index < editable.length - 1) focusAt(index + 1)
      } else {
        setBuffer(text)
      }
    }
  }

  const iso = toIso(value, granularity)

  return (
    <div className={cn('*:not-first:mt-2', className)} style={style}>
      {label ? (
        <div id={labelId} className="font-medium text-foreground text-sm">
          {label}
        </div>
      ) : null}
      <div className="relative">
        {showIcon && iconPosition === 'start' ? (
          <div className="pointer-events-none absolute inset-y-0 start-0 z-10 flex items-center justify-center text-muted-foreground/80" style={{ paddingInlineStart: sz.pad }}>
            <Icon size={sz.icon} />
          </div>
        ) : null}
        <div
          role="group"
          aria-labelledby={label ? labelId : undefined}
          aria-label={label ? undefined : granularity === 'time' ? 'Time' : 'Date'}
          aria-describedby={description ? descId : undefined}
          data-focus-within={focused || activeSegment ? '' : undefined}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              e.preventDefault()
              const firstEmpty = editable.findIndex((t) => shownValue(t, value, h12) == null)
              focusAt(firstEmpty === -1 ? 0 : firstEmpty)
            }
          }}
          className={cn(
            'relative inline-flex w-full items-center overflow-hidden whitespace-nowrap border border-input bg-background shadow-xs transition-[color,box-shadow] outline-none data-focus-within:border-ring data-focus-within:ring-ring/50 data-focus-within:ring-[3px]',
            sz.box,
            showIcon && iconPosition === 'start' && sz.padStart,
            showIcon && iconPosition === 'end' && sz.padEnd,
          )}
          style={{ borderRadius: radius }}
        >
          {parts.map((part, i) => {
            if (part.type === 'literal') {
              return (
                <span key={i} aria-hidden="true" className="inline rounded p-0.5 px-0 text-muted-foreground/70">
                  {part.text}
                </span>
              )
            }
            const type = part.type
            const shown = shownValue(type, value, h12)
            const isFocused = focused === type || (!focused && activeSegment === type)
            const placeholder = shown == null
            let text: string
            if (type === 'dayPeriod') text = placeholder ? dayPeriodNames[0] : dayPeriodNames[shown]
            else if (isFocused && buffer && focused === type) text = buffer
            else if (placeholder) text = type === 'hour' || type === 'minute' ? '––' : (placeholders[type] ?? '––')
            else text = type === 'year' ? pad(shown, 4) : pad(shown, 2)
            const range = rangeOf(type, value, h12)
            return (
              <div
                key={i}
                ref={(el) => {
                  refs.current[type] = el
                }}
                role="spinbutton"
                tabIndex={0}
                aria-label={LABELS[type]}
                aria-valuenow={shown ?? undefined}
                aria-valuemin={range.min}
                aria-valuemax={range.max}
                aria-valuetext={placeholder ? 'Empty' : text}
                data-placeholder={placeholder ? '' : undefined}
                data-focused={isFocused ? '' : undefined}
                data-type={type}
                onFocus={() => {
                  setFocused(type)
                  setBuffer('')
                }}
                onBlur={() => {
                  setFocused((f) => (f === type ? null : f))
                  setBuffer('')
                }}
                onKeyDown={(e) => onKeyDown(type, e)}
                className="inline cursor-default rounded p-0.5 text-foreground tabular-nums caret-transparent outline-hidden select-none data-placeholder:text-muted-foreground/70 data-focused:bg-(--seg-accent) data-focused:text-(--seg-ink) data-focused:data-placeholder:text-(--seg-ink)"
                style={{ '--seg-accent': accent, '--seg-ink': ink } as CSSProperties}
              >
                {text}
              </div>
            )
          })}
        </div>
        {showIcon && iconPosition === 'end' ? (
          <div className="pointer-events-none absolute inset-y-0 end-0 z-10 flex items-center justify-center text-muted-foreground/80" style={{ paddingInlineEnd: sz.pad }}>
            <Icon size={sz.icon} />
          </div>
        ) : null}
      </div>
      {description ? (
        <p id={descId} className="mt-2 text-muted-foreground text-xs">
          {description}
        </p>
      ) : null}
      {name ? <input type="hidden" name={name} value={iso} /> : null}
    </div>
  )
}
