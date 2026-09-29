// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/marquee.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  duration: 28,
  gap: 16,
  repeat: 4,
  reverse: false,
  pauseOnHover: true,
  vertical: false,
  fade: true,
}
/* @motif:end */

export type MarqueeProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

const FADE = 'linear-gradient(var(--fade-direction), transparent, #000 10%, #000 90%, transparent)'

/** 把 children 重复若干份首尾相接地滚动；容器需要有确定的宽（纵向时是高）。 */
export function Marquee({ className, style, children, ...props }: MarqueeProps) {
  const { duration, gap, repeat, reverse, pauseOnHover, vertical, fade } = { ...defaults, ...props }
  return (
    <div
      className={cn('group flex overflow-hidden p-2', vertical ? 'flex-col' : 'flex-row', className)}
      style={
        {
          '--duration': `${duration}s`,
          '--gap': `${gap}px`,
          '--fade-direction': vertical ? 'to bottom' : 'to right',
          gap,
          maskImage: fade ? FADE : undefined,
          WebkitMaskImage: fade ? FADE : undefined,
          ...style,
        } as CSSProperties
      }
    >
      {Array.from({ length: repeat }, (_, index) => (
        <div
          key={index}
          // 只有第一份对读屏可见，其余是视觉上的重复。
          aria-hidden={index > 0 ? true : undefined}
          className={cn(
            'motif-marquee-track flex shrink-0 justify-around',
            vertical ? 'animate-marquee-vertical flex-col' : 'animate-marquee flex-row',
            pauseOnHover && 'group-hover:[animation-play-state:paused]',
            reverse && '[animation-direction:reverse]',
          )}
          style={{ gap }}
        >
          {children}
        </div>
      ))}
    </div>
  )
}
