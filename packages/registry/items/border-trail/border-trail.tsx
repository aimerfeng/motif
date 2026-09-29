// SPDX-License-Identifier: MIT
// Copyright (c) 2024 ibelick
// Source: https://github.com/ibelick/motion-primitives/blob/120f64f/components/core/border-trail.tsx
// Modified by Motif; see the item's provenance.
import { motion, useReducedMotion, type MotionStyle } from 'motion/react'
import { cn } from '@motif/runtime'
import type { CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  color: '#6366f1',
  headColor: '#c7d2fe',
  size: 120,
  borderWidth: 2,
  glow: 0.6,
  count: 1,
  duration: 6,
  reverse: false,
}
/* @motif:end */

export type BorderTrailProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
}

/**
 * 彗尾沿父元素的边框绕行。父元素需要 `position: relative`，彗尾会继承它的圆角。
 * 数量大于 1 时等距分布，彼此保持相同的间隔。
 */
export function BorderTrail({ className, style, ...props }: BorderTrailProps) {
  const { color, headColor, size, borderWidth, glow, count, duration, reverse } = { ...defaults, ...props }
  // 减少动态效果时彗尾停在边框上的固定位置，不再移动。
  const reducedMotion = useReducedMotion()
  const trails = Math.max(1, Math.round(count))

  const gradient = `linear-gradient(${reverse ? 'to left' : 'to right'}, transparent 0%, ${color} 70%, ${headColor} 100%)`
  const trailAt = (index: number) => {
    const start = (index / trails) * 100
    const from = reverse ? 100 - start : start
    const to = reverse ? -start : 100 + start
    // 静止时把彗尾停在上边缘附近，起点错开，看起来像正在移动的一帧。
    const rest = reverse ? 100 - start - 8 : start + 8
    return {
      initial: { offsetDistance: `${reducedMotion ? rest : from}%` },
      animate: reducedMotion ? { offsetDistance: `${rest}%` } : { offsetDistance: [`${from}%`, `${to}%`] },
    }
  }
  const transition = { repeat: Infinity, ease: 'linear', duration } as const

  return (
    <>
      {/* 光晕：一条沿边框跨着走的细长模糊光带，不受遮罩限制，会溢到边框两侧。 */}
      {glow > 0 && (
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]">
          {Array.from({ length: trails }, (_, index) => (
            <motion.div
              key={index}
              className="absolute"
              style={{ width: size, height: 8 + borderWidth * 2, offsetPath: `rect(0 auto auto 0 round ${size}px)`, background: gradient, filter: 'blur(7px)', opacity: glow } as MotionStyle}
              {...trailAt(index)}
              transition={transition}
            />
          ))}
        </div>
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] border-(length:--border-trail-width) border-transparent mask-[linear-gradient(transparent,transparent),linear-gradient(#000,#000)] mask-intersect [mask-clip:padding-box,border-box]"
        style={{ '--border-trail-width': `${borderWidth}px` } as CSSProperties}
      >
        {Array.from({ length: trails }, (_, index) => (
          <motion.div
            key={index}
            className={cn('absolute aspect-square', className)}
            // 从彗尾（透明）到亮头：沿路径前进时元素朝右，所以渐变朝右变亮；反向时头部在左。
            style={{ width: size, offsetPath: `rect(0 auto auto 0 round ${size}px)`, background: gradient, ...style } as MotionStyle}
            {...trailAt(index)}
            transition={transition}
          />
        ))}
      </div>
    </>
  )
}
