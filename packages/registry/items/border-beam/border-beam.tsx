// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/border-beam.tsx
// Modified by Motif; see the item's provenance.
import { motion, useReducedMotion, type MotionStyle } from 'motion/react'
import { cn } from '@motif/runtime'
import type { CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  size: 160,
  duration: 7,
  colorFrom: '#ffaa40',
  colorTo: '#9c40ff',
  borderWidth: 2,
  reverse: false,
  initialOffset: 0,
}
/* @motif:end */

export type BorderBeamProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
}

/**
 * 一束光沿着父元素的边框绕行。父元素需要 `position: relative`，光束会继承它的圆角。
 */
export function BorderBeam({ className, style, ...props }: BorderBeamProps) {
  const { size, duration, colorFrom, colorTo, borderWidth, reverse, initialOffset } = { ...defaults, ...props }
  // 减少动态效果时光束停在起始位置，边框的高光仍然可见。
  const reducedMotion = useReducedMotion()
  const from = reverse ? 100 - initialOffset : initialOffset
  const to = reverse ? -initialOffset : 100 + initialOffset

  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-[inherit] border-(length:--border-beam-width) border-transparent mask-[linear-gradient(transparent,transparent),linear-gradient(#000,#000)] mask-intersect [mask-clip:padding-box,border-box]"
      style={{ '--border-beam-width': `${borderWidth}px` } as CSSProperties}
    >
      <motion.div
        className={cn('absolute aspect-square', 'bg-linear-to-l from-(--color-from) via-(--color-to) to-transparent', className)}
        style={
          {
            width: size,
            offsetPath: `rect(0 auto auto 0 round ${size}px)`,
            '--color-from': colorFrom,
            '--color-to': colorTo,
            ...style,
          } as MotionStyle
        }
        initial={{ offsetDistance: `${from}%` }}
        animate={reducedMotion ? { offsetDistance: `${from}%` } : { offsetDistance: [`${from}%`, `${to}%`] }}
        transition={{ repeat: Infinity, ease: 'linear', duration }}
      />
    </div>
  )
}
