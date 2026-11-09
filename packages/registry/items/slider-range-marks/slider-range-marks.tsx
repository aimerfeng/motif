// SPDX-License-Identifier: MIT
// Copyright (c) 2019 Material-UI SAS
// Source: https://github.com/mui/base-ui/blob/6a29b4b/docs/src/app/(docs)/react/components/slider/demos/marks/css-modules/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  mode: 'range',
  orientation: 'horizontal',
  accent: '#fafafa',
  step: 1,
  showMarks: true,
  showBubble: true,
  thumbSize: 16,
  trackHeight: 4,
}
/* @motif:end */

type Value = number | [number, number]

export type SliderRangeMarksProps = Partial<typeof defaults> & {
  value?: Value
  defaultValue?: Value
  onValueChange?: (value: Value) => void
  min?: number
  max?: number
  /** PageUp / PageDown 的步长，默认 step × 10。 */
  largeStep?: number
  /** 刻度位置；默认在 0%、25%、50%、75%、100%。 */
  marks?: number[]
  formatValue?: (value: number) => string
  /** 每个滑块的 aria-label。 */
  thumbLabels?: [string, string?]
  /** 强制某个滑块处于激活态（演示自动播放用）。 */
  activeThumb?: number | null
  className?: string
  style?: CSSProperties
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v))
}

/** 按亮度选深 / 浅墨色，保证气泡文字可读。 */
function inkFor(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return '#0a0a0a'
  const n = parseInt(m[1]!, 16)
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.18 ? '#0a0a0a' : '#fafafa'
}

const defaultFormat = (v: number) => String(v)

/** 滑块：单值或区间，刻度、步进吸附、数值气泡、横竖两个方向。role="slider"，方向键 / PageUp / PageDown / Home / End。 */
export function SliderRangeMarks({
  value: controlled,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  largeStep,
  marks,
  formatValue = defaultFormat,
  thumbLabels,
  activeThumb,
  className,
  style,
  ...props
}: SliderRangeMarksProps) {
  const { mode, orientation, accent, step, showMarks, showBubble, thumbSize, trackHeight } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const vertical = orientation === 'vertical'
  const range = mode === 'range'

  const toPair = (v: Value | undefined): [number, number] => {
    if (Array.isArray(v)) return [v[0], v[1]]
    if (typeof v === 'number') return [min, v]
    return [min + (max - min) * 0.25, min + (max - min) * 0.45]
  }
  const [inner, setInner] = useState<[number, number]>(() => toPair(defaultValue))
  const pair = controlled !== undefined ? toPair(controlled) : inner
  const values: number[] = range ? [Math.min(pair[0], pair[1]), Math.max(pair[0], pair[1])] : [pair[1]]

  const controlRef = useRef<HTMLDivElement>(null)
  const thumbRefs = useRef<(HTMLDivElement | null)[]>([])
  const [dragging, setDragging] = useState<number | null>(null)
  const [focused, setFocused] = useState<number | null>(null)
  const active = dragging ?? activeThumb ?? null

  const snap = (v: number) => clamp(Math.round((v - min) / step) * step + min, min, max)
  const pct = (v: number) => ((v - min) / (max - min)) * 100

  const commit = (index: number, raw: number) => {
    const next = [...values]
    let v = snap(raw)
    if (range) v = index === 0 ? Math.min(v, values[1]!) : Math.max(v, values[0]!)
    next[index] = v
    const out: [number, number] = range ? [next[0]!, next[1]!] : [min, next[0]!]
    if (controlled === undefined) setInner(out)
    onValueChange?.(range ? out : out[1])
  }

  const valueAt = (e: PointerEvent) => {
    const rect = controlRef.current!.getBoundingClientRect()
    const t = vertical ? (rect.bottom - e.clientY) / rect.height : (e.clientX - rect.left) / rect.width
    return min + clamp(t, 0, 1) * (max - min)
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    const v = valueAt(e)
    let index = 0
    if (range) {
      const d0 = Math.abs(v - values[0]!)
      const d1 = Math.abs(v - values[1]!)
      index = d1 < d0 || (d1 === d0 && v > values[1]!) ? 1 : 0
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(index)
    commit(index, v)
    thumbRefs.current[index]?.focus({ preventScroll: true })
    e.preventDefault()
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging === null) return
    commit(dragging, valueAt(e))
  }
  const endDrag = () => setDragging(null)

  const onKeyDown = (index: number) => (e: KeyboardEvent<HTMLDivElement>) => {
    const v = values[index]!
    const big = largeStep ?? step * 10
    const map: Record<string, number> = {
      ArrowRight: v + step,
      ArrowUp: v + step,
      ArrowLeft: v - step,
      ArrowDown: v - step,
      PageUp: v + big,
      PageDown: v - big,
      Home: min,
      End: max,
    }
    if (!(e.key in map)) return
    e.preventDefault()
    commit(index, map[e.key]!)
  }

  const markList = marks ?? [0, 0.25, 0.5, 0.75, 1].map((t) => min + (max - min) * t)
  const lo = range ? values[0]! : min
  const hi = range ? values[1]! : values[0]!
  const animate = !reduced && dragging === null
  const fillTransition = animate ? 'transform 160ms cubic-bezier(0.2, 0, 0, 1)' : 'none'
  const ink = inkFor(accent)
  const swell = 1.3

  const indicatorStyle: CSSProperties = vertical
    ? { transformOrigin: 'bottom', transform: `translateY(${-pct(lo)}%) scaleY(${(pct(hi) - pct(lo)) / 100})`, transition: fillTransition }
    : { transformOrigin: 'left', transform: `translateX(${pct(lo)}%) scaleX(${(pct(hi) - pct(lo)) / 100})`, transition: fillTransition }

  return (
    <div
      role="group"
      data-orientation={orientation}
      className={cn('relative flex select-none', vertical ? 'h-40 flex-row' : 'w-56 flex-col', className)}
      style={{ ...style, ['--slider-accent' as string]: accent }}
    >
      <div
        ref={controlRef}
        data-orientation={orientation}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={cn('relative box-border flex cursor-pointer touch-none select-none', vertical ? 'h-full justify-center' : 'w-full items-center')}
        style={vertical ? { paddingInline: Math.max(12, thumbSize / 2 + 4) } : { paddingBlock: Math.max(10, thumbSize / 2 + 4) }}
      >
        <div
          data-orientation={orientation}
          className="relative bg-muted select-none"
          style={vertical ? { width: trackHeight, height: '100%' } : { height: trackHeight, width: '100%' }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[var(--slider-accent)]" style={indicatorStyle} />
          </div>
          {showMarks &&
            markList.map((mark) => {
              const inside = mark >= lo && mark <= hi
              return (
                <div
                  key={mark}
                  aria-hidden
                  className="absolute"
                  style={{
                    ...(vertical
                      ? { left: '50%', bottom: `${pct(mark)}%`, width: trackHeight + 4, height: 1, transform: 'translate(-50%, 50%)' }
                      : { top: '50%', left: `${pct(mark)}%`, width: 1, height: trackHeight + 4, transform: 'translate(-50%, -50%)' }),
                    background: inside ? 'var(--slider-accent)' : 'var(--color-muted-foreground)',
                    opacity: inside ? 1 : 0.6,
                  }}
                />
              )
            })}
          {values.map((v, i) => {
            const isActive = active === i
            const bubble = showBubble && (isActive || focused === i)
            const label = thumbLabels?.[i] ?? (range ? (i === 0 ? 'Minimum value' : 'Maximum value') : 'Value')
            return (
              <div
                key={i}
                className="pointer-events-none absolute inset-0"
                style={{ transform: vertical ? `translateY(${-pct(v)}%)` : `translateX(${pct(v)}%)`, transition: fillTransition, zIndex: isActive ? 2 : 1 }}
              >
                <motion.div
                  ref={(el) => {
                    thumbRefs.current[i] = el
                  }}
                  role="slider"
                  tabIndex={0}
                  aria-label={label}
                  aria-valuemin={min}
                  aria-valuemax={max}
                  aria-valuenow={v}
                  aria-valuetext={formatValue(v)}
                  aria-orientation={vertical ? 'vertical' : 'horizontal'}
                  onKeyDown={onKeyDown(i)}
                  onFocus={() => setFocused(i)}
                  onBlur={() => setFocused((f) => (f === i ? null : f))}
                  className="pointer-events-auto absolute box-border border bg-background outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--slider-accent)]"
                  style={{
                    width: thumbSize,
                    height: thumbSize,
                    borderColor: 'var(--slider-accent)',
                    ...(vertical ? { left: '50%', bottom: 0, x: '-50%', y: '50%' } : { top: '50%', left: 0, x: '-50%', y: '-50%' }),
                  }}
                  animate={{ scale: isActive && !reduced ? swell : 1 }}
                  transition={reduced ? { duration: 0 } : { type: 'spring', visualDuration: 0.2, bounce: 0.3 }}
                >
                  <AnimatePresence>
                    {bubble && (
                      <motion.span
                        aria-hidden
                        className="absolute rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-4 whitespace-nowrap tabular-nums shadow-md"
                        style={{
                          background: 'var(--slider-accent)',
                          color: ink,
                          ...(vertical
                            ? { left: '100%', top: '50%', marginLeft: 8, y: '-50%' }
                            : { bottom: '100%', left: '50%', marginBottom: 8, x: '-50%' }),
                          transformOrigin: vertical ? 'left center' : 'bottom center',
                        }}
                        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: isActive && !reduced ? 1 / swell : 1 }}
                        exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.7 }}
                        transition={{ duration: reduced ? 0 : 0.16 }}
                      >
                        {formatValue(v)}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            )
          })}
        </div>
      </div>
      {showMarks && (
        <div aria-hidden className={cn('relative select-none', vertical ? 'my-0 w-10' : 'h-4 w-full')} style={vertical ? { marginBlock: 12 } : undefined}>
          {markList.map((mark) => (
            <span
              key={mark}
              className="absolute text-xs leading-4 whitespace-nowrap text-muted-foreground tabular-nums"
              style={vertical ? { bottom: `${pct(mark)}%`, left: 0, transform: 'translateY(50%)' } : { top: 0, left: `${pct(mark)}%`, transform: 'translateX(-50%)' }}
            >
              {formatValue(mark)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
