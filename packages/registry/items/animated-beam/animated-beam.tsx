// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/animated-beam.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useState, type CSSProperties, type RefObject } from 'react'

/* @motif:defaults */
export const defaults = {
  curvature: 0,
  pathWidth: 2,
  length: 16,
  pathOpacity: 0.3,
  gradientStartColor: '#ffaa40',
  gradientStopColor: '#9c40ff',
  duration: 4,
  repeatDelay: 0.4,
  ease: [0.4, 0, 0.2, 1],
  reverse: false,
}
/* @motif:end */

export type AnimatedBeamProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 光束所在的容器（需要 position: relative）。 */
  containerRef: RefObject<HTMLElement | null>
  fromRef: RefObject<HTMLElement | null>
  toRef: RefObject<HTMLElement | null>
  startXOffset?: number
  startYOffset?: number
  endXOffset?: number
  endYOffset?: number
  /** 第一次流动前的等待（秒），多条光束错开时用。 */
  delay?: number
  /** 底线颜色。 */
  pathColor?: string
}

interface Geometry {
  width: number
  height: number
  sx: number
  sy: number
  ex: number
  ey: number
}

/** 在容器里画一条从 fromRef 到 toRef 中心的连线，并让一束渐变光沿它流动。 */
export function AnimatedBeam({ className, style, containerRef, fromRef, toRef, startXOffset = 0, startYOffset = 0, endXOffset = 0, endYOffset = 0, delay = 0, pathColor = '#8a8fa8', ...props }: AnimatedBeamProps) {
  const { curvature, pathWidth, length, pathOpacity, gradientStartColor, gradientStopColor, duration, ease, repeatDelay, reverse } = { ...defaults, ...props }
  const id = useId()
  const reduced = useReducedMotion()
  const [geometry, setGeometry] = useState<Geometry>({ width: 0, height: 0, sx: 0, sy: 0, ex: 0, ey: 0 })

  useEffect(() => {
    const container = containerRef.current
    const from = fromRef.current
    const to = toRef.current
    if (!container || !from || !to) return
    const update = () => {
      const box = container.getBoundingClientRect()
      const a = from.getBoundingClientRect()
      const b = to.getBoundingClientRect()
      setGeometry({
        width: box.width,
        height: box.height,
        sx: a.left - box.left + a.width / 2 + startXOffset,
        sy: a.top - box.top + a.height / 2 + startYOffset,
        ex: b.left - box.left + b.width / 2 + endXOffset,
        ey: b.top - box.top + b.height / 2 + endYOffset,
      })
    }
    // 容器或任一端点的尺寸变化都要重算路径。
    const observer = new ResizeObserver(update)
    observer.observe(container)
    observer.observe(from)
    observer.observe(to)
    update()
    return () => observer.disconnect()
  }, [containerRef, fromRef, toRef, startXOffset, startYOffset, endXOffset, endYOffset])

  const { width, height, sx, sy, ex, ey } = geometry
  const path = `M ${sx},${sy} Q ${(sx + ex) / 2},${sy - curvature} ${ex},${ey}`
  const coordinates = reverse
    ? { x1: [`${100 - length}%`, `${-length}%`], x2: ['100%', '0%'] }
    : { x1: [`${length}%`, `${100 + length}%`], x2: ['0%', '100%'] }

  return (
    <svg fill="none" width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={cn('pointer-events-none absolute top-0 left-0 transform-gpu', className)} style={style} aria-hidden>
      <path d={path} stroke={pathColor} strokeWidth={pathWidth} strokeOpacity={pathOpacity} strokeLinecap="round" />
      <path d={path} strokeWidth={pathWidth} stroke={`url(#${id})`} strokeLinecap="round" />
      <defs>
        {reduced ? (
          // 减少动态效果时不流动，整条线用起止渐变着色。
          <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={reverse ? ex : sx} y1={reverse ? ey : sy} x2={reverse ? sx : ex} y2={reverse ? sy : ey}>
            <stop stopColor={gradientStartColor} />
            <stop offset="100%" stopColor={gradientStopColor} />
          </linearGradient>
        ) : (
          <motion.linearGradient
            id={id}
            className="transform-gpu"
            gradientUnits="userSpaceOnUse"
            initial={{ x1: '0%', x2: '0%', y1: '0%', y2: '0%' }}
            animate={{ x1: coordinates.x1, x2: coordinates.x2, y1: ['0%', '0%'], y2: ['0%', '0%'] }}
            transition={{ delay, duration, ease: ease as [number, number, number, number], repeat: Infinity, repeatDelay }}
          >
            <stop stopColor={gradientStartColor} stopOpacity="0" />
            <stop stopColor={gradientStartColor} />
            <stop offset="32.5%" stopColor={gradientStopColor} />
            <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
          </motion.linearGradient>
        )}
      </defs>
    </svg>
  )
}
