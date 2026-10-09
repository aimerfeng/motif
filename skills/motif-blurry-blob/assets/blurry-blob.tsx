// SPDX-License-Identifier: MIT
// Copyright (c) Animata
// Source: https://github.com/codse/animata/blob/36674e4/animata/background/blurry-blob.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  background: '#f1fbf8',
  colors: ['#5eead4', '#7dd3fc', '#a7f3d0', '#bae6fd'],
  opacity: 0.75,
  blur: 80,
  size: 1,
  drift: 1,
  speed: 1,
}
/* @motif:end */

export type BlurryBlobProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

// 五个固定的落点：位置和大小用容器宽度的百分比，漂移幅度（dx, dy）用容器宽度的 cqw。
// 周期都能整除 12 秒，循环视频首尾衔接。
const SLOTS = [
  { x: 22, y: 30, size: 46, dx: 12, dy: 8, duration: 12 },
  { x: 76, y: 26, size: 40, dx: -10, dy: 12, duration: 12 },
  { x: 62, y: 76, size: 48, dx: -12, dy: -9, duration: 6 },
  { x: 16, y: 80, size: 36, dx: 9, dy: -11, duration: 12 },
  { x: 46, y: 52, size: 32, dx: 8, dy: 10, duration: 6 },
]

function luminance(hex: string): number {
  const value = hex.replace('#', '')
  const channel = (index: number) => parseInt(value.slice(index * 2, index * 2 + 2), 16) / 255
  return 0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2)
}

/** 几团模糊的彩色光斑在背景上缓缓漂移、呼吸。每种颜色一团光斑（最多五团），内容放在 children 里叠在上面。 */
export function BlurryBlob({ className, style, children, ...props }: BlurryBlobProps) {
  const { background, colors, blur, opacity, size, drift, speed } = { ...defaults, ...props }
  // 浅色背景用正片叠底，颜色叠加处加深；深色背景用滤色，叠加处发亮。
  const blend = luminance(background) > 0.5 ? 'multiply' : 'screen'

  return (
    <div
      className={cn('mbb-root', className)}
      style={
        {
          '--mbb-bg': background,
          '--mbb-blur': `${blur}px`,
          '--mbb-opacity': opacity,
          '--mbb-blend': blend,
          '--mbb-drift': drift,
          '--mbb-speed': Math.max(0.05, speed),
          ...style,
        } as CSSProperties
      }
    >
      {colors.slice(0, SLOTS.length).map((color, index) => {
        const slot = SLOTS[index]!
        return (
          <div
            key={index}
            aria-hidden
            className="mbb-blob"
            style={
              {
                '--mbb-color': color,
                '--mbb-x': `${slot.x}%`,
                '--mbb-y': `${slot.y}%`,
                '--mbb-size': slot.size * size,
                '--mbb-dx': `${slot.dx}cqw`,
                '--mbb-dy': `${slot.dy}cqw`,
                '--mbb-duration': `${slot.duration}s`,
              } as CSSProperties
            }
          />
        )
      })}
      <div className="mbb-content">{children}</div>
    </div>
  )
}
