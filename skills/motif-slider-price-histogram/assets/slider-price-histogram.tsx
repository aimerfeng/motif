// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/components/comp-265.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { useId, useRef, useState, type ChangeEvent, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  bins: 40,
  distribution: 'listing',
  height: 48,
  barGap: 0,
  barRadius: 0,
  inactiveOpacity: 0.2,
  accent: '#fafafa',
  showInputs: true,
  currency: '$',
}
/* @motif:end */

// Upstream sample: prices of 120 listings.
const LISTING = [
  80, 95, 110, 125, 130, 140, 145, 150, 155, 165, 175, 185, 195, 205, 215, 225, 235, 245, 255, 260, 265, 270, 275, 280, 285, 290, 290, 295, 295, 295,
  298, 299, 300, 305, 310, 315, 320, 325, 330, 335, 340, 345, 350, 355, 360, 365, 365, 375, 380, 385, 390, 395, 400, 405, 410, 415, 420, 425, 430, 435,
  440, 445, 450, 455, 460, 465, 470, 475, 480, 485, 490, 495, 495, 498, 499, 500, 500, 500, 515, 530, 545, 560, 575, 590, 605, 620, 635, 650, 655, 660,
  665, 670, 675, 680, 685, 690, 695, 700, 700, 700, 700, 700, 700, 725, 750, 775, 800, 815, 830, 845, 845, 845, 870, 875, 880, 885, 890, 895, 898, 900,
]

function sample(distribution: string): number[] {
  if (distribution === 'listing') return LISTING
  return Array.from({ length: 120 }, (_, i) => {
    const t = i / 119
    let v: number
    if (distribution === 'bell') {
      const p = (i + 0.5) / 120
      v = 490 + 95 * Math.log(p / (1 - p))
    } else if (distribution === 'skewed') v = 80 + 820 * t ** 2.2
    else v = 80 + 820 * t
    return Math.round(Math.min(900, Math.max(80, v)))
  })
}

export type SliderPriceHistogramProps = Partial<typeof defaults> & {
  /** 数据（例如每件商品的价格）；不传时使用 distribution 的示例数据。 */
  items?: number[]
  value?: [number, number]
  defaultValue?: [number, number]
  onValueChange?: (value: [number, number]) => void
  label?: string
  minLabel?: string
  maxLabel?: string
  onShow?: (value: [number, number], count: number) => void
  className?: string
  style?: CSSProperties
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** 直方图上的双滑块价格区间：区间内的柱子亮起，输入框与滑块双向同步，按钮显示匹配数量。 */
export function SliderPriceHistogram({
  items: itemsProp,
  value: controlled,
  defaultValue,
  onValueChange,
  label = 'Price slider',
  minLabel = 'Min price',
  maxLabel = 'Max price',
  onShow,
  className,
  style,
  ...props
}: SliderPriceHistogramProps) {
  const { bins, distribution, height, barGap, barRadius, inactiveOpacity, accent, showInputs, currency } = { ...defaults, ...props }
  const id = useId()
  const items = itemsProp && itemsProp.length > 0 ? itemsProp : sample(distribution)

  // Define the number of ticks
  const tick_count = Math.max(1, Math.round(bins))
  // Find the min and max values across all items
  const minValue = Math.min(...items)
  const maxValue = Math.max(...items)

  const [inner, setInner] = useState<[number, number]>(() => defaultValue ?? [200, 780])
  const raw = controlled ?? inner
  const sliderValue: [number, number] = [
    clamp(Math.min(raw[0], raw[1]), minValue, maxValue),
    clamp(Math.max(raw[0], raw[1]), minValue, maxValue),
  ]
  // Text being typed in a field; null shows the slider value (keeps fields in sync both ways).
  const [drafts, setDrafts] = useState<[string | null, string | null]>([null, null])
  const inputValues = [drafts[0] ?? String(sliderValue[0]), drafts[1] ?? String(sliderValue[1])]

  const handleSliderChange = (next: [number, number]) => {
    if (controlled === undefined) setInner(next)
    onValueChange?.(next)
    setDrafts([null, null])
  }

  const setDraft = (index: number, text: string | null) => setDrafts((d) => (index === 0 ? [text, d[1]] : [d[0], text]))

  const validateAndUpdateValue = (rawValue: string, index: number) => {
    const numValue = rawValue === '' || rawValue === '-' ? minValue : Number.parseFloat(rawValue)
    if (Number.isNaN(numValue)) {
      setDraft(index, null)
      return
    }
    let clampedValue = Math.min(maxValue, Math.max(minValue, numValue))
    if (index === 0) clampedValue = Math.min(clampedValue, sliderValue[1])
    else clampedValue = Math.max(clampedValue, sliderValue[0])
    handleSliderChange(index === 0 ? [clampedValue, sliderValue[1]] : [sliderValue[0], clampedValue])
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = e.target.value
    if (newValue === '' || /^-?\d*\.?\d*$/.test(newValue)) setDraft(index, newValue)
  }

  // Calculate the price step based on the min and max prices
  const priceStep = (maxValue - minValue) / tick_count

  // Calculate item counts for each price range
  const itemCounts = Array.from({ length: tick_count }, (_, tick) => {
    const rangeMin = minValue + tick * priceStep
    const rangeMax = minValue + (tick + 1) * priceStep
    return items.filter((item) => item >= rangeMin && (tick === tick_count - 1 ? item <= rangeMax : item < rangeMax)).length
  })

  // Find maximum count for scaling
  const maxCount = Math.max(1, ...itemCounts)

  // Function to count items in the selected range
  const countItemsInRange = (min: number, max: number) => items.filter((item) => item >= min && item <= max).length
  const inRange = countItemsInRange(sliderValue[0], sliderValue[1])

  const isBarInSelectedRange = (index: number) => {
    const rangeMin = minValue + index * priceStep
    const rangeMax = minValue + (index + 1) * priceStep
    return inRange > 0 && rangeMin <= sliderValue[1] && rangeMax >= sliderValue[0]
  }

  // ---- Slider (replaces the radix Slider primitive) ----
  const trackRef = useRef<HTMLDivElement>(null)
  const thumbRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [dragging, setDragging] = useState<number | null>(null)
  const span = Math.max(1, maxValue - minValue)
  const pct = (v: number) => ((v - minValue) / span) * 100

  const commit = (index: number, v: number) => {
    let next = Math.round(clamp(v, minValue, maxValue))
    next = index === 0 ? Math.min(next, sliderValue[1]) : Math.max(next, sliderValue[0])
    if (next === sliderValue[index]) return
    handleSliderChange(index === 0 ? [next, sliderValue[1]] : [sliderValue[0], next])
  }
  const valueAt = (e: PointerEvent) => {
    const rect = trackRef.current!.getBoundingClientRect()
    return minValue + clamp((e.clientX - rect.left) / rect.width, 0, 1) * span
  }
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    const v = valueAt(e)
    const d0 = Math.abs(v - sliderValue[0])
    const d1 = Math.abs(v - sliderValue[1])
    const index = d1 < d0 || (d1 === d0 && v > sliderValue[1]) ? 1 : 0
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(index)
    commit(index, v)
    thumbRefs.current[index]?.focus({ preventScroll: true })
    e.preventDefault()
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging !== null) commit(dragging, valueAt(e))
  }
  const endDrag = () => setDragging(null)
  const onKeyDown = (index: number) => (e: KeyboardEvent<HTMLSpanElement>) => {
    const v = sliderValue[index]
    const big = Math.max(1, Math.round(span / 10))
    const map: Record<string, number> = {
      ArrowRight: v + 1,
      ArrowUp: v + 1,
      ArrowLeft: v - 1,
      ArrowDown: v - 1,
      PageUp: v + big,
      PageDown: v - big,
      Home: minValue,
      End: maxValue,
    }
    if (!(e.key in map)) return
    e.preventDefault()
    commit(index, map[e.key]!)
  }

  const field = (index: 0 | 1) => {
    const fieldId = `${id}-${index ? 'max' : 'min'}`
    return (
      <div className="min-w-0 *:not-first:mt-1">
        <label htmlFor={fieldId} className="select-none font-medium text-foreground text-sm leading-4">
          {index ? maxLabel : minLabel}
        </label>
        <div className="relative">
          <input
            aria-label={index ? 'Enter maximum price' : 'Enter minimum price'}
            className="peer flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 ps-6 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            style={currency.length > 1 ? { paddingInlineStart: `${0.75 + currency.length * 0.55}rem` } : undefined}
            id={fieldId}
            inputMode="decimal"
            onBlur={() => validateAndUpdateValue(inputValues[index]!, index)}
            onChange={(e) => handleInputChange(e, index)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') validateAndUpdateValue(inputValues[index]!, index)
            }}
            type="text"
            value={inputValues[index]}
          />
          <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground text-sm">
            {currency}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn('w-full *:not-first:mt-4', className)}
      style={{ ...style, ['--slider-accent' as string]: accent }}
      role="group"
      aria-labelledby={`${id}-label`}
    >
      <div id={`${id}-label`} className="select-none font-medium text-foreground text-sm leading-4">
        {label}
      </div>
      <div>
        {/* Histogram bars */}
        <div aria-hidden="true" className="flex w-full items-end px-3" style={{ height, gap: barGap }}>
          {itemCounts.map((count, i) => {
            const selected = isBarInSelectedRange(i)
            return (
              <div className="flex min-w-0 flex-1 justify-center" key={String(i)} style={{ height: `${(count / maxCount) * 100}%` }}>
                <span
                  className="size-full bg-[var(--slider-accent)] transition-opacity duration-150 motion-reduce:transition-none"
                  data-selected={selected}
                  style={{ opacity: selected ? 1 : inactiveOpacity, borderRadius: `${barRadius}px ${barRadius}px 0 0` }}
                />
              </div>
            )
          })}
        </div>
        <div
          className="relative flex w-full touch-none select-none items-center py-1.5"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div className="mx-2 w-full">
            <div ref={trackRef} className="relative h-1.5 w-full grow rounded-full bg-muted">
              <div className="absolute inset-0 overflow-hidden rounded-full">
                <div
                  className="absolute h-full bg-[var(--slider-accent)]"
                  style={{ left: `${pct(sliderValue[0])}%`, width: `${pct(sliderValue[1]) - pct(sliderValue[0])}%` }}
                />
              </div>
              {sliderValue.map((v, i) => (
                <span
                  key={i}
                  ref={(el) => {
                    thumbRefs.current[i] = el
                  }}
                  role="slider"
                  tabIndex={0}
                  aria-label={i === 0 ? 'Minimum price' : 'Maximum price'}
                  aria-valuemin={minValue}
                  aria-valuemax={maxValue}
                  aria-valuenow={v}
                  aria-valuetext={`${currency}${v}`}
                  aria-orientation="horizontal"
                  onKeyDown={onKeyDown(i)}
                  className="absolute top-1/2 block size-4 shrink-0 cursor-grab rounded-full border border-[var(--slider-accent)] bg-background shadow-sm outline-none ring-ring/50 transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4"
                  style={{ left: `${pct(v)}%`, transform: 'translate(-50%, -50%)', zIndex: dragging === i ? 2 : 1 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Inputs */}
      {showInputs && (
        <div className="grid grid-cols-2 items-center gap-4">
          {field(0)}
          {field(1)}
        </div>
      )}

      {/* Button */}
      <button
        type="button"
        onClick={() => onShow?.(sliderValue, inRange)}
        className="inline-flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 font-medium text-sm shadow-xs outline-none transition-[color,box-shadow] hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        Show {inRange} items
      </button>
    </div>
  )
}
