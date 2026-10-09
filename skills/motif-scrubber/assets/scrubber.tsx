// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Eduardo Calvo
// Source: https://github.com/educlopez/smoothui/blob/b6312bc/packages/smoothui/components/scrubber/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  color: '#f97316',
  height: 44,
  radius: 12,
  ticks: 11,
  spring: {
    visualDuration: 0.25,
    bounce: 0.1,
  },
  label: 'Exposure',
}
/* @motif:end */

export type ScrubberProps = Partial<typeof defaults> & {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  /** 数值显示的小数位数。 */
  decimals?: number
  /** 强制显示拖动中的形态（演示自动播放用）。 */
  active?: boolean
  className?: string
  style?: CSSProperties
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
const snap = (value: number, step: number, min: number) => Math.round((value - min) / step) * step + min

/** 拖拽式数值滑块：整条轨道都是把手，点哪到哪；方向键微调，Home / End 跳到两端。 */
export function Scrubber({
  value: controlled,
  defaultValue = 0.5,
  onValueChange,
  min = 0,
  max = 1,
  step = 0.01,
  decimals = 2,
  active: forcedActive,
  className,
  style,
  ...props
}: ScrubberProps) {
  const { color, ticks, height, radius, spring, label } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const track = useRef<HTMLDivElement>(null)
  const [inner, setInner] = useState(defaultValue)
  const [dragging, setDragging] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [width, setWidth] = useState(0)

  const value = controlled ?? inner
  const range = max - min
  const ratio = range > 0 ? clamp((value - min) / range, 0, 1) : 0
  const active = forcedActive ?? (dragging || hovering)

  // 用 ResizeObserver 取轨道宽度，把手只走 transform，不碰 left。
  useEffect(() => {
    const el = track.current
    if (!el) return
    const observer = new ResizeObserver(() => setWidth(el.clientWidth))
    observer.observe(el)
    setWidth(el.clientWidth)
    return () => observer.disconnect()
  }, [])

  const commit = useCallback(
    (next: number) => {
      const snapped = clamp(snap(next, step, min), min, max)
      if (controlled === undefined) setInner(snapped)
      onValueChange?.(snapped)
    },
    [controlled, max, min, onValueChange, step],
  )

  const fromPointer = (clientX: number) => {
    const rect = track.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return value
    return min + clamp((clientX - rect.left) / rect.width, 0, 1) * range
  }

  const onPointerDown = (event: PointerEvent) => {
    event.preventDefault()
    track.current?.focus({ preventScroll: true })
    track.current?.setPointerCapture(event.pointerId)
    setDragging(true)
    commit(fromPointer(event.clientX))
  }

  const onKeyDown = (event: KeyboardEvent) => {
    const big = event.shiftKey ? 10 : 1
    const next =
      event.key === 'ArrowRight' || event.key === 'ArrowUp'
        ? value + step * big
        : event.key === 'ArrowLeft' || event.key === 'ArrowDown'
          ? value - step * big
          : event.key === 'Home'
            ? min
            : event.key === 'End'
              ? max
              : null
    if (next === null) return
    event.preventDefault()
    commit(next)
  }

  const ease = dragging ? 'none' : 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1)'
  const thumbX = ratio * width
  const transition = reduced ? { duration: 0 } : { type: 'spring' as const, visualDuration: spring.visualDuration, bounce: spring.bounce }

  return (
    <div className={cn('relative w-full select-none', className)} style={style}>
      <div
        ref={track}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Number(value.toFixed(decimals))}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={(event) => dragging && commit(fromPointer(event.clientX))}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onPointerEnter={(event) => event.pointerType === 'mouse' && setHovering(true)}
        onPointerLeave={() => setHovering(false)}
        className="relative cursor-pointer touch-none overflow-hidden bg-foreground/[0.06] outline-none focus-visible:ring-2 focus-visible:ring-(--c) focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        style={{ '--c': color, height, borderRadius: radius } as CSSProperties}
      >
        {/* 填充：只缩放，右端的圆角由轨道的 overflow 裁出来 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 origin-left"
          style={{
            transform: `scaleX(${ratio})`,
            transition: reduced ? 'none' : ease,
            background: `linear-gradient(90deg, color-mix(in oklab, ${color} 10%, transparent), color-mix(in oklab, ${color} 30%, transparent))`,
          }}
        />

        {ticks > 0 && (
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {Array.from({ length: ticks }, (_, i) => (
              <span
                key={i}
                className="absolute top-1/2 h-1.5 w-px -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/25"
                style={{ left: `${((i + 1) / (ticks + 1)) * 100}%` }}
              />
            ))}
          </div>
        )}

        <div aria-hidden className="pointer-events-none absolute top-0 left-0 h-full" style={{ transform: `translateX(${thumbX}px)`, transition: reduced ? 'none' : ease }}>
          <motion.span
            className="absolute top-1/2 left-0 block w-1 rounded-full"
            style={{ height: Math.round(height * 0.5), marginTop: -Math.round(height * 0.25), marginLeft: -2, background: color }}
            animate={{ opacity: active ? 1 : 0.35, scale: active ? 1 : 0.7 }}
            transition={transition}
          />
        </div>

        <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[13px] font-medium whitespace-nowrap text-foreground">{label}</span>
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-mono text-[13px] font-medium tabular-nums text-foreground/80">{value.toFixed(decimals)}</span>
      </div>
    </div>
  )
}
