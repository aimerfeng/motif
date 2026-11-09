// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/components/comp-264.tsx
// Modified by Motif; see the item's provenance.
import { cn, cssVars } from '@motif/runtime'
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  rows: 'transform',
  precision: 0,
  showReset: true,
  accent: '#f4f4f5',
  trackHeight: 6,
  labelStyle: 'muted',
  inputWidth: 48,
  density: 'comfortable',
}
/* @motif:end */

export type SliderRow = {
  label: string
  minValue: number
  maxValue: number
  defaultValue: number
  initialValue?: number
  step?: number
}

const ROW_SETS: Record<string, { legend: string; rows: SliderRow[] }> = {
  transform: {
    legend: 'Object position',
    rows: [
      { label: 'X', minValue: -10, maxValue: 10, defaultValue: 0, initialValue: -2, step: 0.1 },
      { label: 'Y', minValue: -10, maxValue: 10, defaultValue: 0, initialValue: 4, step: 0.1 },
      { label: 'Z', minValue: -10, maxValue: 10, defaultValue: 0, initialValue: 2, step: 0.1 },
    ],
  },
  model: {
    legend: 'Model settings',
    rows: [
      { label: 'Temperature', minValue: 0, maxValue: 2, defaultValue: 1, initialValue: 1.25, step: 0.01 },
      { label: 'Top P', minValue: 0, maxValue: 1, defaultValue: 1, initialValue: 0.9, step: 0.01 },
      { label: 'Penalty', minValue: -2, maxValue: 2, defaultValue: 0, initialValue: 0.5, step: 0.01 },
    ],
  },
}

export type SliderParameterPanelProps = Partial<typeof defaults> & {
  /** 自定义行，覆盖 rows 选的那组预设行。 */
  items?: SliderRow[]
  legend?: string
  /** 受控值，按行排列。 */
  values?: number[]
  onValuesChange?: (values: number[]) => void
  className?: string
  style?: CSSProperties
}

function roundTo(value: number, precision: number): number {
  return Number(value.toFixed(precision))
}

/** 按 step 对齐、夹到范围内，再按精度取整。 */
function snap(value: number, row: SliderRow, precision: number): number {
  const step = Math.max(row.step ?? 1, 10 ** -precision)
  const snapped = Math.round((value - row.minValue) / step) * step + row.minValue
  return roundTo(Math.min(row.maxValue, Math.max(row.minValue, snapped)), precision)
}

const format = (value: number, precision: number) => roundTo(value, precision).toString()

/* ---- useSliderWithInput：上游 hooks/use-slider-with-input.ts 的单值版，可受控 ---- */
function useSliderWithInput({
  minValue,
  maxValue,
  initialValue,
  defaultValue,
  value,
  precision,
  onChange,
}: {
  minValue: number
  maxValue: number
  initialValue: number
  defaultValue: number
  value?: number
  precision: number
  onChange?: (value: number) => void
}) {
  const [sliderValue, setSliderValue] = useState(value ?? initialValue)
  const [inputValue, setInputValue] = useState(format(value ?? initialValue, precision))

  // 受控时跟着外部值走（上游 Slider 对 value 也是这样同步 internalValues）。
  useEffect(() => {
    if (value !== undefined) {
      setSliderValue(value)
      setInputValue(format(value, precision))
    }
  }, [value, precision])

  const commit = useCallback(
    (next: number) => {
      setSliderValue(next)
      setInputValue(format(next, precision))
      onChange?.(next)
    },
    [onChange, precision],
  )

  const showReset = sliderValue !== defaultValue

  const validateAndUpdateValue = useCallback(
    (rawValue: string) => {
      if (rawValue === '' || rawValue === '-') {
        commit(Math.min(maxValue, Math.max(minValue, 0)))
        return
      }
      const numValue = Number.parseFloat(rawValue)
      if (Number.isNaN(numValue)) {
        setInputValue(format(sliderValue, precision))
        return
      }
      commit(roundTo(Math.min(maxValue, Math.max(minValue, numValue)), precision))
    },
    [commit, maxValue, minValue, precision, sliderValue],
  )

  const handleInputChange = useCallback((newValue: string) => {
    if (newValue === '' || /^-?\d*\.?\d*$/.test(newValue)) setInputValue(newValue)
  }, [])

  const resetToDefault = useCallback(() => commit(defaultValue), [commit, defaultValue])

  return { sliderValue, inputValue, showReset, validateAndUpdateValue, handleInputChange, handleSliderChange: commit, resetToDefault }
}

/* ---- Slider：上游 ui/slider.tsx 的 Radix Slider 换成手写的 role="slider"，类名照旧 ---- */
function Slider({
  value,
  row,
  precision,
  label,
  onValueChange,
  className,
}: {
  value: number
  row: SliderRow
  precision: number
  label: string
  onValueChange: (value: number) => void
  className?: string
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLSpanElement>(null)
  const dragging = useRef(false)
  const t = (value - row.minValue) / (row.maxValue - row.minValue)
  const step = Math.max(row.step ?? 1, 10 ** -precision)

  const fromPointer = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    onValueChange(snap(row.minValue + ratio * (row.maxValue - row.minValue), row, precision))
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    thumbRef.current?.focus()
    fromPointer(e.clientX)
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) fromPointer(e.clientX)
  }
  const onPointerUp = () => {
    dragging.current = false
  }

  const onKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    const big = (row.maxValue - row.minValue) / 10
    let next: number | null = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = value + (e.shiftKey ? big : step)
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = value - (e.shiftKey ? big : step)
    else if (e.key === 'PageUp') next = value + big
    else if (e.key === 'PageDown') next = value - big
    else if (e.key === 'Home') next = row.minValue
    else if (e.key === 'End') next = row.maxValue
    if (next === null) return
    e.preventDefault()
    onValueChange(snap(next, row, precision))
  }

  return (
    <div
      className={cn('relative flex h-4 w-full min-w-0 touch-none items-center select-none', className)}
      data-slot="slider"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div ref={trackRef} className="relative w-full grow overflow-hidden rounded-full bg-muted" style={{ height: 'var(--sp-track)' }} data-slot="slider-track">
        <div className="absolute inset-0 origin-left rounded" style={{ background: 'var(--sp-accent)', transform: `scaleX(${t})` }} data-slot="slider-range" />
      </div>
      <span
        ref={thumbRef}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={row.minValue}
        aria-valuemax={row.maxValue}
        aria-valuenow={value}
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        className="absolute top-1/2 block size-4 shrink-0 cursor-grab rounded-full border bg-background shadow-sm ring-[color-mix(in_oklab,var(--sp-accent)_45%,transparent)] outline-none transition-[box-shadow] hover:ring-4 focus-visible:ring-4 active:cursor-grabbing"
        // 拇指始终留在轨道内：0 时左边贴齐，1 时右边贴齐（与 Radix 的行为一致）。
        style={{ borderColor: 'var(--sp-accent)', left: `calc(${t * 100}% + ${8 - t * 16}px)`, transform: 'translate(-50%, -50%)' }}
        data-slot="slider-thumb"
      />
    </div>
  )
}

function RotateCcwIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
}

function SliderWithInput({
  row,
  value,
  precision,
  allowReset,
  inputWidth,
  labelStyle,
  compact,
  wideLabels,
  resetSignal,
  onChange,
}: {
  row: SliderRow
  value?: number
  precision: number
  allowReset: boolean
  inputWidth: number
  labelStyle: string
  compact: boolean
  wideLabels: boolean
  resetSignal: number
  onChange: (value: number) => void
}) {
  const inputId = useId()
  const { sliderValue, inputValue, showReset, validateAndUpdateValue, handleInputChange, handleSliderChange, resetToDefault } = useSliderWithInput({
    minValue: row.minValue,
    maxValue: row.maxValue,
    initialValue: row.initialValue ?? row.defaultValue,
    defaultValue: row.defaultValue,
    value,
    precision,
    onChange,
  })

  // Reset all：上游给每行注册 reset 函数到 ref 数组，这里换成一个递增的信号，效果相同。
  const lastSignal = useRef(resetSignal)
  useEffect(() => {
    if (resetSignal !== lastSignal.current) {
      lastSignal.current = resetSignal
      resetToDefault()
    }
  }, [resetSignal, resetToDefault])

  return (
    <div className={cn('flex items-center', compact ? 'gap-1.5' : 'gap-2')}>
      <label
        htmlFor={inputId}
        className={cn('shrink-0 truncate', labelStyle === 'strong' ? 'text-sm font-medium text-foreground' : 'text-xs text-muted-foreground', wideLabels ? 'w-[5.5rem]' : 'w-3')}
      >
        {row.label}
      </label>
      <Slider className="grow [&>:last-child>span]:rounded" value={sliderValue} row={row} precision={precision} label={row.label} onValueChange={handleSliderChange} />
      {allowReset && (
        <button
          type="button"
          aria-label={`Reset ${row.label} to default`}
          title="Reset to default"
          tabIndex={showReset ? 0 : -1}
          aria-hidden={!showReset}
          className={cn(
            'inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-opacity hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none',
            showReset ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
          onClick={resetToDefault}
        >
          <RotateCcwIcon />
        </button>
      )}
      <input
        id={inputId}
        aria-label={`Enter ${row.label} value`}
        className={cn(
          'shrink-0 rounded-md border bg-background px-2 py-1 text-sm text-foreground tabular-nums shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring',
          compact ? 'h-7' : 'h-8',
        )}
        style={{ width: inputWidth }}
        inputMode="decimal"
        onBlur={() => validateAndUpdateValue(inputValue)}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') validateAndUpdateValue(inputValue)
        }}
        type="text"
        value={inputValue}
      />
    </div>
  )
}

export function SliderParameterPanel({ items, legend, values, onValuesChange, className, style, ...props }: SliderParameterPanelProps) {
  const options = { ...defaults, ...props }
  const set = ROW_SETS[options.rows] ?? ROW_SETS.transform!
  const rows = items ?? set.rows
  const compact = options.density === 'compact'
  const legendId = useId()
  const [resetSignal, setResetSignal] = useState(0)
  const current = useRef<number[]>(rows.map((r) => r.initialValue ?? r.defaultValue))
  if (values) current.current = values
  const wideLabels = rows.some((r) => r.label.length > 2)

  return (
    <div
      role="group"
      aria-labelledby={legendId}
      className={cn('min-w-0', compact ? 'space-y-3' : 'space-y-4', className)}
      style={cssVars({ '--sp-accent': options.accent, '--sp-track': `${options.trackHeight}px` }, style)}
    >
      <div id={legendId} className="text-sm font-medium text-foreground">
        {legend ?? set.legend}
      </div>
      <div className={compact ? 'space-y-1' : 'space-y-2'}>
        {rows.map((row, index) => (
          <SliderWithInput
            key={`${row.label}-${index}`}
            row={row}
            value={values?.[index]}
            precision={options.precision}
            allowReset={options.showReset}
            inputWidth={options.inputWidth}
            labelStyle={options.labelStyle}
            compact={compact}
            wideLabels={wideLabels}
            resetSignal={resetSignal}
            onChange={(v) => {
              const next = [...current.current]
              next[index] = v
              current.current = next
              onValuesChange?.(next)
            }}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => setResetSignal((s) => s + 1)}
        className={cn(
          'inline-flex w-full items-center justify-center gap-2 rounded-md border bg-background px-4 text-sm font-medium text-foreground shadow-xs outline-none transition-[background-color] hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
          compact ? 'h-8' : 'h-9',
        )}
      >
        <RotateCcwIcon className="-ms-1 opacity-60" />
        Reset
      </button>
    </div>
  )
}
