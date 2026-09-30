// SPDX-License-Identifier: MIT
// Copyright 2023 David Tang
// Source: https://github.com/dvtng/react-loading-skeleton/blob/f8b040d/src/skeleton.css
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  animation: 'shimmer',
  duration: 1.6,
  stagger: 0.12,
  direction: 'ltr',
  baseColor: '#94949e2e',
  highlightColor: '#a1a1ab59',
  radius: 8,
  reveal: 'blur',
}
/* @motif:end */

export type SkeletonProps = {
  className?: string
  style?: CSSProperties
  /** 正圆（头像）：宽高相同，圆角 50%。 */
  circle?: boolean
  width?: number | string
  height?: number | string
  /** 在整块骨架里的序号；相邻块的高光按序号错开，看起来是一道光扫过整张卡片。 */
  index?: number
}

/** 一块骨架。样式变量来自外层 SkeletonShimmer，脱离它单独使用时用下面的回退值。 */
export function Skeleton({ className, style, circle, width, height, index = 0 }: SkeletonProps) {
  return (
    <span
      aria-hidden
      className={cn('msk-block', circle && 'msk-circle', className)}
      style={
        {
          width,
          height: height ?? (circle ? width : undefined),
          '--msk-i': index,
          ...style,
        } as CSSProperties
      }
    />
  )
}

export type SkeletonShimmerProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** true 显示骨架；false 显示 children。切换时两层叠在同一格里，高度不会跳动。 */
  loading?: boolean
  /** 加载中显示的骨架，用 Skeleton 拼出和真实内容同样的形状。 */
  skeleton?: ReactNode
  /** 加载完成后的真实内容。 */
  children?: ReactNode
  /** 给读屏用户的说明。 */
  label?: string
}

/**
 * 骨架屏容器：骨架和真实内容叠在同一个网格格子里，
 * 加载完成时骨架淡出、内容淡入（可选模糊或上浮），没有布局跳动。
 */
export function SkeletonShimmer({
  className,
  style,
  loading = true,
  skeleton,
  children,
  label = 'Loading content',
  ...props
}: SkeletonShimmerProps) {
  const { animation, duration, baseColor, highlightColor, radius, direction, stagger, reveal } = { ...defaults, ...props }
  return (
    <div
      aria-busy={loading}
      data-animation={animation}
      data-reveal={reveal}
      data-loading={loading ? '' : undefined}
      className={cn('msk-root', className)}
      style={
        {
          '--msk-base': baseColor,
          '--msk-hi': highlightColor,
          '--msk-dur': `${duration}s`,
          '--msk-radius': `${radius}px`,
          '--msk-stagger': `${stagger}s`,
          '--msk-from': direction === 'rtl' ? '100%' : '-100%',
          '--msk-to': direction === 'rtl' ? '-100%' : '100%',
          ...style,
        } as CSSProperties
      }
    >
      <span role="status" className="sr-only">
        {loading ? label : ''}
      </span>
      <div className="msk-layer msk-skeleton" aria-hidden>
        {skeleton}
      </div>
      <div className="msk-layer msk-content" inert={loading ? true : undefined}>
        {children}
      </div>
    </div>
  )
}
