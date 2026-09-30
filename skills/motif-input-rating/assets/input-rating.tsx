// SPDX-License-Identifier: MIT
// Copyright (c) 2023 — Present shadcnblocks
// Source: https://github.com/shadcnblocks/kibo/blob/3d63cdb/packages/rating/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  icon: 'star',
  color: '#fbbf24',
  size: 40,
  count: 5,
  allowHalf: false,
  gap: 6,
  spring: {
    visualDuration: 0.3,
    bounce: 0.5,
  },
}
/* @motif:end */

export type InputRatingProps = Partial<typeof defaults> & {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  /** 强制显示悬停预览（演示自动播放用）。 */
  hoverValue?: number | null
  readOnly?: boolean
  label?: string
  className?: string
  style?: CSSProperties
}

const SHAPES = {
  star: 'M12 3.2l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.2l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z',
  heart: 'M12 20.4S4.6 16 4.6 10.2A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 7.4 2.8c0 5.8-7.4 10.2-7.4 10.2z',
  bolt: 'M13.2 2.8 5.4 13.4h5.6l-1 7.8 7.8-10.6H12z',
} as const

/** 评分：悬停预览、点击后被选中的图标依次弹起；支持半星。role="slider"，方向键 / Home / End 调整。 */
export function InputRating({ value, defaultValue = 0, onValueChange, hoverValue, readOnly, label = 'Rating', className, style, ...props }: InputRatingProps) {
  const { icon, color, size, count, allowHalf, gap, spring } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const [inner, setInner] = useState(defaultValue)
  const [hover, setHover] = useState<number | null>(null)
  const [pop, setPop] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const current = value ?? inner
  const shown = hoverValue ?? hover ?? current
  // 值变高（无论来自点击还是外部受控）时触发一次弹起。
  const previous = useRef(current)
  useEffect(() => {
    if (current !== previous.current && current > previous.current) setPop((n) => n + 1)
    previous.current = current
  }, [current])
  const step = allowHalf ? 0.5 : 1
  const path = SHAPES[icon as keyof typeof SHAPES] ?? SHAPES.star

  const commit = (next: number) => {
    const clamped = Math.max(0, Math.min(count, next))
    if (value === undefined) setInner(clamped)
    onValueChange?.(clamped)
  }

  const valueAt = (event: { clientX: number }) => {
    const el = ref.current
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    const scale = rect.width / el.offsetWidth || 1
    const x = (event.clientX - rect.left) / scale
    const cell = size + gap
    const index = Math.min(count - 1, Math.max(0, Math.floor(x / cell)))
    const within = (x - index * cell) / size
    return index + (allowHalf && within < 0.5 ? 0.5 : 1)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (readOnly) return
    const map: Record<string, number> = { ArrowRight: current + step, ArrowUp: current + step, ArrowLeft: current - step, ArrowDown: current - step, Home: 0, End: count }
    if (!(event.key in map)) return
    event.preventDefault()
    commit(map[event.key]!)
  }

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={readOnly ? -1 : 0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={count}
      aria-valuenow={current}
      aria-valuetext={`${current} of ${count}`}
      aria-readonly={readOnly || undefined}
      onKeyDown={onKeyDown}
      onPointerMove={(event) => !readOnly && event.pointerType === 'mouse' && setHover(valueAt(event))}
      onPointerLeave={() => setHover(null)}
      onClick={(event) => {
        if (readOnly) return
        const next = valueAt(event)
        commit(next === current ? 0 : next)
      }}
      className={cn('flex w-fit touch-none rounded-lg outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--c)', !readOnly && 'cursor-pointer', className)}
      style={{ '--c': color, gap, ...style } as CSSProperties}
    >
      {Array.from({ length: count }, (_, i) => {
        const fill = Math.max(0, Math.min(1, shown - i))
        const previewing = shown !== current
        const lit = current - i > 0
        return (
          <motion.span
            key={`${i}-${pop}`}
            aria-hidden
            className="relative block"
            style={{ width: size, height: size }}
            initial={false}
            animate={reduced || pop === 0 || !lit ? { scale: fill > 0 && previewing ? 1.1 : 1 } : { scale: [1, 1.4, 1] }}
            transition={reduced ? { duration: 0.12 } : pop > 0 && lit && !previewing ? { duration: 0.5, delay: i * 0.05, ease: [0.34, 1.56, 0.64, 1] } : { type: 'spring', visualDuration: spring.visualDuration, bounce: spring.bounce }}
          >
            <svg viewBox="0 0 24 24" className="absolute inset-0 size-full" fill="none" stroke="color-mix(in oklab, var(--foreground) 24%, transparent)" strokeWidth="1.5" strokeLinejoin="round">
              <path d={path} />
            </svg>
            <svg
              viewBox="0 0 24 24"
              className="absolute inset-0 size-full transition-[filter] duration-200"
              style={{ clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)`, filter: fill > 0 ? `drop-shadow(0 0 ${size * 0.16}px color-mix(in oklab, ${color} 55%, transparent))` : 'none' }}
              fill={color}
              stroke={color}
              strokeWidth="1.5"
              strokeLinejoin="round"
            >
              <path d={path} />
            </svg>
          </motion.span>
        )
      })}
    </div>
  )
}
