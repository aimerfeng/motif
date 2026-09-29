// SPDX-License-Identifier: MIT
// Copyright (c) 2024 ibelick
// Source: https://github.com/ibelick/motion-primitives/blob/120f64f/components/core/infinite-slider.tsx
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop, usePrefersReducedMotion } from '@/lib/motif-runtime'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  speed: 80,
  hoverSpeed: 0.25,
  gap: 32,
  direction: 'horizontal',
  reverse: false,
  fade: 96,
}
/* @motif:end */

export type InfiniteSliderProps = Partial<typeof defaults> & {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

/**
 * 首尾相接的循环滚动条。横向时需要一个有宽度的容器，纵向时还需要给容器一个高度（className）。
 * 内容会被重复排列到足够覆盖容器为止，重复出来的副本对屏幕阅读器隐藏。
 */
export function InfiniteSlider({ children, className, style, ...props }: InfiniteSliderProps) {
  const { speed, hoverSpeed, gap, direction, reverse, fade } = { ...defaults, ...props }
  const vertical = direction === 'vertical'
  const reducedMotion = usePrefersReducedMotion()

  const outerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const [copies, setCopies] = useState(2)

  // 这些值每帧都要读，放在 ref 里，避免每帧触发渲染。
  const period = useRef(0)
  const offset = useRef(0)
  const factor = useRef(1)
  const hovering = useRef(false)

  // 用 ResizeObserver 量出一份内容的尺寸（加上间距就是循环的周期）和容器尺寸。
  useEffect(() => {
    const outer = outerRef.current
    const copy = copyRef.current
    if (!outer || !copy) return
    const measure = () => {
      const copySize = vertical ? copy.offsetHeight : copy.offsetWidth
      const containerSize = vertical ? outer.clientHeight : outer.clientWidth
      period.current = copySize + gap
      if (period.current <= gap) return
      setCopies(reducedMotion ? 1 : Math.max(2, Math.ceil(containerSize / period.current) + 1))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(outer)
    observer.observe(copy)
    return () => observer.disconnect()
  }, [vertical, gap, reducedMotion])

  useFrameLoop(
    outerRef,
    ({ delta }) => {
      const track = trackRef.current
      if (!track || period.current <= 0) return
      // 悬停时速度平滑地过渡到 hoverSpeed 倍，而不是突然切换。
      const target = hovering.current ? hoverSpeed : 1
      factor.current += (target - factor.current) * (1 - Math.exp(-delta * 8))
      offset.current += (reverse ? -1 : 1) * speed * factor.current * delta
      offset.current = ((offset.current % period.current) + period.current) % period.current
      track.style.transform = vertical ? `translate3d(0, ${-offset.current}px, 0)` : `translate3d(${-offset.current}px, 0, 0)`
    },
    { reducedMotion: 'static' },
  )

  const edge = vertical ? 'to bottom' : 'to right'
  const mask = fade > 0 ? `linear-gradient(${edge}, transparent, #000 ${fade}px, #000 calc(100% - ${fade}px), transparent)` : undefined
  const flow: CSSProperties = { gap, flexDirection: vertical ? 'column' : 'row' }

  return (
    <div
      ref={outerRef}
      // 减少动态效果时不再自动滚动，改为可以手动滚动。
      className={cn('min-w-0 max-w-full', reducedMotion ? (vertical ? 'overflow-y-auto' : 'overflow-x-auto') : 'overflow-hidden', className)}
      style={{ maskImage: mask, WebkitMaskImage: mask, ...style }}
      onPointerEnter={() => {
        hovering.current = true
      }}
      onPointerLeave={() => {
        hovering.current = false
      }}
    >
      <div ref={trackRef} className={cn('flex', vertical ? 'h-max' : 'w-max')} style={flow}>
        {Array.from({ length: reducedMotion ? 1 : copies }, (_, index) => (
          <div key={index} ref={index === 0 ? copyRef : undefined} aria-hidden={index > 0 ? true : undefined} className="flex shrink-0" style={flow}>
            {children}
          </div>
        ))}
      </div>
    </div>
  )
}
