// SPDX-License-Identifier: MIT
// Copyright (c) Animata
// Source: https://github.com/codse/animata/blob/36674e4/animata/text/metis-text.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  variant: 'metis',
  color: '#f5f5f4',
  thickness: 1,
  offset: 0,
  duration: 0.3,
  easing: [0.25, 0.1, 0.25, 1],
  lift: 0,
}
/* @motif:end */

export type LinkUnderlineHoverProps = Partial<typeof defaults> & {
  children?: ReactNode
  /** 渲染成链接（默认）或普通 span。 */
  as?: 'a' | 'span'
  href?: string
  /** 强制显示悬停状态，例如当前导航项或演示中的自动播放。 */
  active?: boolean
  className?: string
  labelClassName?: string
  style?: CSSProperties
} & Omit<HTMLAttributes<HTMLElement>, 'children' | 'style' | 'className' | 'color'>

/**
 * 四种链接悬停下划线，共用一套参数：
 * metis（从一侧划入、从另一侧离开）、center（中心展开并上浮）、double（上方线条越过文字）、bar（左进右出的色条）。
 */
export function LinkUnderlineHover({
  children,
  as = 'a',
  href,
  active,
  className,
  labelClassName,
  style,
  variant = defaults.variant,
  color = defaults.color,
  thickness = defaults.thickness,
  offset = defaults.offset,
  duration = defaults.duration,
  easing = defaults.easing,
  lift = defaults.lift,
  ...dom
}: LinkUnderlineHoverProps) {
  const Tag = as
  const vars = {
    '--mlu-color': color,
    '--mlu-thickness': `${thickness}px`,
    '--mlu-offset': `${offset}px`,
    '--mlu-duration': `${duration}s`,
    '--mlu-ease': `cubic-bezier(${easing.join(',')})`,
    '--mlu-lift': `${lift}px`,
    ...style,
  } as CSSProperties

  return (
    <Tag
      {...dom}
      href={as === 'a' ? (href ?? '#') : undefined}
      data-variant={variant}
      data-active={active ? 'true' : undefined}
      className={cn('mlu', className)}
      style={vars}
    >
      <span className={cn('mlu-label', labelClassName)}>{children}</span>
      {(variant === 'center' || variant === 'double') && <span aria-hidden className="mlu-line mlu-base" />}
      {variant === 'bar' ? (
        <span aria-hidden className="mlu-track">
          <span className="mlu-line mlu-in" />
          <span className="mlu-line mlu-out" />
        </span>
      ) : (
        <span aria-hidden className="mlu-line" />
      )}
    </Tag>
  )
}
