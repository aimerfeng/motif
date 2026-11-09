// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Eduardo Calvo
// Source: https://github.com/educlopez/smoothui/blob/b6312bc/packages/smoothui/components/exposure-slider/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { type MotionValue, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  min: -20,
  max: 20,
  step: 1,
  accentColor: '#f43f5e',
  showIndicator: true,
  tickSpacing: 13,
  label: 'Exposure',
}
/* @motif:end */

export type ExposureSliderProps = Partial<typeof defaults> & {
  /** Initial value */
  defaultValue?: number
  /** Controlled value (moves the ticker when it changes) */
  value?: number
  /** Callback fired when the value changes */
  onChange?: (value: number) => void
  className?: string
  style?: CSSProperties
}

const NOTCH = 3 // px notch width
const SPRING_CONFIG = { damping: 30, mass: 0.5, stiffness: 300 }

export function ExposureSlider({ defaultValue = 0, value, onChange, className, style, ...props }: ExposureSliderProps) {
  const { min, max, step, accentColor, showIndicator, tickSpacing, label } = { ...defaults, ...props }
  const NOTCH_WIDTH = tickSpacing
  const shouldReduceMotion = useReducedMotion()
  const isDragging = useRef(false)

  const count = Math.floor((max - min) / step) + 1
  const centerIndex = Math.max(0, Math.min(count - 1, Math.floor((defaultValue - min) / step)))

  // Raw drag offset and spring-smoothed version
  const rawX = useMotionValue(0)
  const springX = useSpring(rawX, SPRING_CONFIG)
  const x = shouldReduceMotion ? rawX : springX

  const valueFromOffset = useCallback(
    (offset: number) => {
      const indexOffset = Math.round(-offset / NOTCH_WIDTH)
      return Math.round(Math.max(min, Math.min(max, (centerIndex + indexOffset) * step + min)))
    },
    [NOTCH_WIDTH, centerIndex, min, max, step],
  )

  const [current, setCurrent] = useState(() => valueFromOffset(0))

  // Current value derived from offset
  const currentValue = useTransform(x, (latest) => {
    const indexOffset = Math.round(-latest / NOTCH_WIDTH)
    return Math.max(min, Math.min(max, (centerIndex + indexOffset) * step + min))
  })

  // Track value for circle and display
  const displayValue = useTransform(currentValue, (v) => Math.round(v))
  const normalizedValue = useTransform(currentValue, [min, max], [-1, 1])

  const clampOffset = useCallback(
    (offset: number) => {
      const maxOffset = (count - 1 - centerIndex) * NOTCH_WIDTH
      const minOffset = -centerIndex * NOTCH_WIDTH
      return Math.max(-maxOffset, Math.min(-minOffset, offset))
    },
    [count, centerIndex, NOTCH_WIDTH],
  )

  const commit = useCallback(() => {
    const val = valueFromOffset(rawX.get())
    setCurrent(val)
    onChange?.(val)
  }, [rawX, valueFromOffset, onChange])

  // Controlled value
  useEffect(() => {
    if (value === undefined || isDragging.current) return
    const index = Math.round((Math.max(min, Math.min(max, value)) - min) / step)
    rawX.set(clampOffset(-(index - centerIndex) * NOTCH_WIDTH))
    setCurrent(valueFromOffset(rawX.get()))
  }, [value, min, max, step, centerIndex, NOTCH_WIDTH, rawX, clampOffset, valueFromOffset])

  const snapToNearest = useCallback(() => {
    const snapped = Math.round(rawX.get() / NOTCH_WIDTH) * NOTCH_WIDTH
    rawX.set(snapped)
  }, [rawX, NOTCH_WIDTH])

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent) => {
      isDragging.current = true
      const startX = e.clientX
      const startOffset = rawX.get()

      const handleMove = (moveEvent: PointerEvent) => {
        const delta = moveEvent.clientX - startX
        rawX.set(clampOffset(startOffset + delta))
        commit()
      }

      const handleUp = () => {
        isDragging.current = false
        snapToNearest()
        commit()
        window.removeEventListener('pointermove', handleMove)
        window.removeEventListener('pointerup', handleUp)
      }

      window.addEventListener('pointermove', handleMove)
      window.addEventListener('pointerup', handleUp)
    },
    [rawX, clampOffset, commit, snapToNearest],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const big = Math.max(1, Math.round(count / 10))
      const steps: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: big, PageDown: -big }
      let next: number | null = null
      if (e.key in steps) next = Math.round(rawX.get() / NOTCH_WIDTH) * NOTCH_WIDTH - (steps[e.key] ?? 0) * NOTCH_WIDTH
      else if (e.key === 'Home') next = centerIndex * NOTCH_WIDTH
      else if (e.key === 'End') next = -(count - 1 - centerIndex) * NOTCH_WIDTH
      if (next === null) return
      e.preventDefault()
      rawX.set(clampOffset(next))
      commit()
    },
    [rawX, NOTCH_WIDTH, centerIndex, count, clampOffset, commit],
  )

  const items = Array.from({ length: count }, (_, i) => i)

  return (
    <div
      className={cn('flex w-full max-w-[500px] flex-col items-center gap-6 text-foreground', className)}
      style={{ '--es-accent': accentColor, ...style } as CSSProperties}
    >
      {/* Progress circle */}
      {showIndicator ? <ProgressCircle displayValue={displayValue} normalizedValue={normalizedValue} /> : null}

      {/* Ticker slider */}
      <div
        className="relative flex h-10 w-full items-center justify-center"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)',
        }}
      >
        <div
          role="slider"
          tabIndex={0}
          aria-label={label || 'Exposure'}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={current}
          aria-orientation="horizontal"
          className="relative h-full w-full cursor-grab touch-pan-y select-none rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onKeyDown={handleKeyDown}
          style={{ padding: `0 calc(50% - ${NOTCH_WIDTH / 2}px)` }}
        >
          <motion.ul className="relative m-0 flex h-full list-none items-center p-0" style={{ marginLeft: -centerIndex * NOTCH_WIDTH, x }}>
            {items.map((i) => (
              <Notch centerIndex={centerIndex} index={i} key={i} x={x} notchWidth={NOTCH_WIDTH} />
            ))}
          </motion.ul>
        </div>
      </div>
      {label ? <span className="-mt-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</span> : null}
    </div>
  )
}

/** Individual notch mark in the ticker */
function Notch({ index, centerIndex, x, notchWidth }: { index: number; centerIndex: number; x: MotionValue<number>; notchWidth: number }) {
  // Distance from center in notch units
  const distance = useTransform(x, (latest) => {
    const currentCenter = centerIndex + -latest / notchWidth
    return Math.abs(index - currentCenter)
  })

  const opacity = useTransform(distance, [0, 1, 3], [1, 0.6, 0.3])
  const clipTop = useTransform(distance, [0, 1, 2], [0, 30, 50])
  const clipPath = useTransform(clipTop, (v) => `inset(${v}% 0px 0px)`)

  const isCenter = useTransform(distance, (d) => d < 0.5)
  const bg = useTransform(isCenter, (center) => (center ? 'var(--es-accent)' : 'currentColor'))

  return (
    <li className="relative flex-shrink-0 flex-grow-0" style={{ height: 'fit-content' }}>
      <div style={{ padding: `0 ${(notchWidth - NOTCH) / 2}px` }}>
        <motion.div
          className="rounded-sm"
          style={{ backgroundColor: bg, clipPath, height: 40, opacity, width: NOTCH, willChange: 'clip-path, opacity' }}
        />
      </div>
    </li>
  )
}

/** SVG progress ring showing positive/negative value */
function ProgressCircle({ normalizedValue, displayValue }: { normalizedValue: MotionValue<number>; displayValue: MotionValue<number> }) {
  // Positive arc (right side, 0 to 1)
  const positiveDash = useTransform(normalizedValue, (v) => (v > 0 ? `${v} ${1 - v}` : '0 1'))
  // Negative arc (left side, mirrored)
  const negativeDash = useTransform(normalizedValue, (v) => (v < 0 ? `${-v} ${1 + v}` : '0 1'))

  return (
    <div className="relative flex h-[75px] w-[75px] items-center justify-center" aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
        {/* Background ring */}
        <circle cx="50" cy="50" fill="currentColor" fillOpacity={0.067} r="48" stroke="currentColor" strokeOpacity={0.3} strokeWidth="3" />
        {/* Positive indicator */}
        <motion.circle
          cx="50"
          cy="50"
          fill="none"
          pathLength={1}
          r="48"
          stroke="var(--es-accent)"
          strokeDasharray={positiveDash}
          strokeDashoffset={0}
          strokeWidth="3"
          style={{ transform: 'rotate(-90deg)', transformBox: 'fill-box', transformOrigin: '50% 50%' }}
        />
        {/* Negative indicator */}
        <motion.circle
          cx="50"
          cy="50"
          fill="none"
          pathLength={1}
          r="48"
          stroke="var(--es-accent)"
          strokeDasharray={negativeDash}
          strokeDashoffset={0}
          strokeWidth="3"
          style={{ transform: 'scaleX(-1) rotate(-90deg)', transformBox: 'fill-box', transformOrigin: '50% 50%' }}
        />
      </svg>
      <motion.span className="absolute text-lg font-semibold tabular-nums">{displayValue}</motion.span>
    </div>
  )
}
