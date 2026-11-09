// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/components/comp-168.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  type: 'nps',
  max: 10,
  lowLabel: 'Not likely',
  highLabel: 'Very Likely',
  colorScale: true,
  showValueLabel: true,
  size: 36,
  radius: 6,
}
/* @motif:end */

export type RatingScaleProps = Partial<typeof defaults> & {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  label?: string
  className?: string
  style?: CSSProperties
}

const FACE_LABELS = ['Angry', 'Sad', 'Neutral', 'Happy', 'Laughing']
const SLIDER_LABELS = ['Awful', 'Poor', 'Okay', 'Good', 'Amazing']

/** Red to green scale; t in 0..1 is interpolated. */
const SCALE = ['#e5484d', '#f2843a', '#e9b21b', '#8cc63f', '#30a46c']

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function scaleRgb(t: number): [number, number, number] {
  const x = Math.min(Math.max(t, 0), 1) * (SCALE.length - 1)
  const i = Math.min(Math.floor(x), SCALE.length - 2)
  const f = x - i
  const a = hexToRgb(SCALE[i]!)
  const b = hexToRgb(SCALE[i + 1]!)
  return [0, 1, 2].map((k) => Math.round(a[k]! + (b[k]! - a[k]!) * f)) as [number, number, number]
}

function scaleColor(t: number): string {
  const [r, g, b] = scaleRgb(t)
  return `rgb(${r}, ${g}, ${b})`
}

/** White or near-black ink on a fill, whichever contrasts more. */
function inkFor(rgb: [number, number, number]): string {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return (l + 0.05) / 0.0625 > 1.05 / (l + 0.05) ? '#111113' : '#ffffff'
}

const MOUTHS = [
  'M8 16.75c1.2-1.6 2.5-2.25 4-2.25s2.8.65 4 2.25',
  'M8.5 16.25c1-1 2.2-1.5 3.5-1.5s2.5.5 3.5 1.5',
  'M8.75 15.5h6.5',
  'M8.5 14.5c1 1 2.2 1.5 3.5 1.5s2.5-.5 3.5-1.5',
  'M7.75 13.75h8.5c0 2.4-1.9 3.9-4.25 3.9s-4.25-1.5-4.25-3.9Z',
]

/** Inline SVG face replacing the upstream emoji: mood 0 = angry ... 4 = laughing. */
export function Face({ mood, size = 20, className }: { mood: number; size?: number; className?: string }) {
  const m = Math.min(Math.max(Math.round(mood), 0), 4)
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <circle cx="12" cy="12" r="9.25" />
      {m === 0 ? <path d="M7.5 8.25 10 9.5M16.5 8.25 14 9.5" /> : null}
      <circle cx="9" cy="10.75" r="0.7" fill="currentColor" />
      <circle cx="15" cy="10.75" r="0.7" fill="currentColor" />
      <path d={MOUTHS[m]} fill={m === 4 ? 'currentColor' : 'none'} fillOpacity={m === 4 ? 0.25 : undefined} />
    </svg>
  )
}

export function RatingScale({ value, defaultValue, onValueChange, label, className, style, ...props }: RatingScaleProps) {
  const options = { ...defaults, ...props }
  const id = useId()
  const isNps = options.type === 'nps'
  const min = isNps ? 0 : 1
  const max = isNps ? options.max : 5
  const [inner, setInner] = useState<number | undefined>(defaultValue ?? (isNps ? undefined : 3))
  const current = value ?? inner
  const set = (v: number) => {
    if (value === undefined) setInner(v)
    onValueChange?.(v)
  }
  const { size, radius } = options
  const legend = label ?? (isNps ? 'How likely are you to recommend us?' : options.type === 'faces' ? 'How did it go?' : 'Rate your experience')

  if (options.type === 'slider') {
    return (
      <FaceSlider className={className} style={style} label={legend} value={current ?? 3} onChange={set} colorScale={options.colorScale} showValueLabel={options.showValueLabel} size={size} />
    )
  }

  if (options.type === 'faces') {
    return (
      <fieldset className={cn('min-w-0 space-y-4', className)} style={style}>
        <legend className="font-medium text-foreground text-sm leading-none">{legend}</legend>
        <div role="radiogroup" className="flex gap-1.5">
          {FACE_LABELS.map((name, i) => {
            const v = i + 1
            const checked = current === v
            const tint = scaleColor(i / 4)
            return (
              <label
                key={v}
                className={cn(
                  'relative flex cursor-pointer flex-col items-center justify-center rounded-full border border-input text-center shadow-xs outline-none transition-[color,box-shadow,border-color,background-color] has-focus-visible:border-ring has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50',
                  checked ? 'border-primary/50 text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
                style={{
                  width: size,
                  height: size,
                  ...(options.colorScale && checked ? { borderColor: tint, color: tint, backgroundColor: `color-mix(in oklab, ${tint} 16%, transparent)` } : null),
                }}
              >
                <input type="radio" className="sr-only" name={id} value={v} checked={checked} onChange={() => set(v)} aria-label={name} />
                <Face mood={i} size={Math.round(size * 0.6)} />
              </label>
            )
          })}
        </div>
        {options.showValueLabel ? (
          <p className="text-xs leading-4 text-muted-foreground" aria-live="polite">
            {current ? FACE_LABELS[current - 1] : ' '}
          </p>
        ) : null}
      </fieldset>
    )
  }

  const values = Array.from({ length: max - min + 1 }, (_, i) => i + min)
  return (
    <div className={cn('w-full min-w-0', className)} style={style}>
      <fieldset className="min-w-0 space-y-4">
        <legend className="font-medium text-foreground text-sm leading-none">{legend}</legend>
        <div role="radiogroup" className="flex gap-0 -space-x-px shadow-xs" style={{ borderRadius: radius }}>
          {values.map((v, i) => {
            const checked = current === v
            const rgb = options.colorScale ? scaleRgb((v - min) / (max - min)) : null
            const fill = rgb ? `rgb(${rgb.join(', ')})` : null
            const first = i === 0
            const last = i === values.length - 1
            return (
              <label
                key={v}
                className={cn(
                  'relative flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-3 border border-input text-center font-medium text-sm tabular-nums outline-none transition-[color,box-shadow,background-color,border-color] has-focus-visible:z-20 has-focus-visible:border-ring has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50',
                  checked ? 'z-10 border-primary/50' : 'hover:bg-accent/50',
                )}
                style={{
                  height: size,
                  borderStartStartRadius: first ? radius : 0,
                  borderEndStartRadius: first ? radius : 0,
                  borderStartEndRadius: last ? radius : 0,
                  borderEndEndRadius: last ? radius : 0,
                  ...(checked && rgb && fill ? { backgroundColor: fill, borderColor: fill, color: inkFor(rgb) } : null),
                  ...(checked && !fill ? { backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' } : null),
                }}
              >
                <input type="radio" className="sr-only" name={id} value={v} checked={checked} onChange={() => set(v)} aria-label={String(v)} />
                {v}
              </label>
            )
          })}
        </div>
      </fieldset>
      <div className="mt-1 flex justify-between gap-3 font-medium text-xs">
        <p className="flex items-center gap-1">
          <Face mood={0} size={16} className={options.colorScale ? 'text-[#e5484d]' : 'text-muted-foreground'} />
          <span>{options.lowLabel}</span>
        </p>
        <p className="flex items-center gap-1 text-right">
          <span>{options.highLabel}</span>
          <Face mood={4} size={16} className={options.colorScale ? 'text-[#30a46c]' : 'text-muted-foreground'} />
        </p>
      </div>
    </div>
  )
}

type FaceSliderProps = {
  label: string
  value: number
  onChange: (v: number) => void
  colorScale: boolean
  showValueLabel: boolean
  size: number
  className?: string
  style?: CSSProperties
}

/** comp-256 / comp-257: hand-rolled 1-5 slider; the face and the label follow the value. */
function FaceSlider({ label, value, onChange, colorScale, showValueLabel, size, className, style }: FaceSliderProps) {
  const track = useRef<HTMLDivElement>(null)
  const labelId = useId()
  const pct = ((value - 1) / 4) * 100
  const tint = colorScale ? scaleColor((value - 1) / 4) : 'var(--color-primary)'

  const fromPointer = (e: PointerEvent) => {
    const rect = track.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return
    const t = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
    const next = Math.round(t * 4) + 1
    if (next !== value) onChange(next)
  }
  const onKey = (e: KeyboardEvent) => {
    let next: number
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = value + 1
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = value - 1
    else if (e.key === 'Home') next = 1
    else if (e.key === 'End') next = 5
    else return
    e.preventDefault()
    next = Math.min(Math.max(next, 1), 5)
    if (next !== value) onChange(next)
  }

  return (
    <div className={cn('w-full min-w-0 space-y-3', className)} style={style}>
      <div className="flex items-center justify-between gap-2">
        <span id={labelId} className="font-medium text-foreground text-sm leading-6">
          {label}
        </span>
        {showValueLabel ? <span className="font-medium text-sm">{SLIDER_LABELS[value - 1]}</span> : null}
      </div>
      <div className="flex items-center gap-2">
        <div
          ref={track}
          className="relative flex h-5 w-full grow cursor-pointer touch-none items-center select-none"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            fromPointer(e)
          }}
          onPointerMove={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e)
          }}
        >
          <div className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-[width,background-color] duration-150 motion-reduce:transition-none"
              style={{ width: `${pct}%`, backgroundColor: tint }}
            />
          </div>
          <div
            role="slider"
            tabIndex={0}
            aria-labelledby={labelId}
            aria-valuemin={1}
            aria-valuemax={5}
            aria-valuenow={value}
            aria-valuetext={SLIDER_LABELS[value - 1]}
            onKeyDown={onKey}
            className="absolute top-1/2 block size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-background shadow-xs outline-none transition-[left,box-shadow,border-color] duration-150 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none"
            style={{ left: `${pct}%`, borderColor: tint }}
          />
        </div>
        <span className="grid shrink-0 place-items-center transition-[color] duration-150 motion-reduce:transition-none" style={{ color: colorScale ? tint : undefined }}>
          <Face mood={value - 1} size={Math.round(size * 0.75)} />
        </span>
      </div>
    </div>
  )
}
