// SPDX-License-Identifier: MIT
// Copyright (c) 2019 Jhey Tompkins (jh3y)
// Source: https://github.com/jh3y/whirl/blob/a43ebd5/src/whirls/meetup.scss
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import type { CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  variant: 'meetup',
  count: 0,
  radius: 30,
  dotSize: 10,
  color: '#8b5cf6',
  speed: 1,
  spin: true,
  label: 'Loading',
}
/* @motif:end */

export type LoaderRadialBloomProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
}

/** whirl 里每个变体的点数与周期（秒）。 */
const VARIANTS: Record<string, { count: number; seconds: number }> = {
  meetup: { count: 4, seconds: 1.25 },
  'pan-out': { count: 8, seconds: 1.5 },
  reach: { count: 10, seconds: 1 },
  'in-and-out': { count: 5, seconds: 1 },
}

/**
 * 放射绽放加载器（移植自 jh3y/whirl 的 meetup、pan-out-circle、reach、in-and-out）。
 * 原 SCSS 循环生成的角度和延迟改为在 JS 里算好、写成自定义属性。
 */
export function LoaderRadialBloom({ className, style, ...props }: LoaderRadialBloomProps) {
  const { variant, count, radius, dotSize, color, speed, spin, label } = { ...defaults, ...props }
  const name = variant in VARIANTS ? variant : 'meetup'
  const v = VARIANTS[name] ?? { count: 4, seconds: 1.25 }
  const n = Math.round(count > 0 ? Math.min(Math.max(count, 2), 16) : v.count)
  const k = 1 / Math.max(speed, 0.1)
  // 原版尺寸都相对 10px 的点：pan-out 的点是 15px，reach 是 5×15 的块。
  const extent = name === 'in-and-out' ? radius * 1.34 : name === 'reach' ? radius * 1.125 + dotSize : radius
  const box = Math.ceil((extent + dotSize * 1.5) * 2)

  const dots = () =>
    Array.from({ length: n }, (_, i) => (
      <div key={i} style={{ '--rotation': (360 / n) * (i + 1), '--angle': (360 / n) * (i + 1), '--delay': (i + 1) * 0.1 } as CSSProperties} />
    ))

  return (
    <span
      role="status"
      aria-live="polite"
      aria-busy
      className={cn('mrb-root', className)}
      style={
        {
          '--mrb-color': color,
          '--mrb-size': `${dotSize}px`,
          '--mrb-radius': `${radius}px`,
          '--mrb-dur': `${v.seconds * k}s`,
          '--mrb-k': k,
          '--mrb-spin': `${k}s`,
          width: box,
          height: box,
          ...style,
        } as CSSProperties
      }
    >
      <span className="sr-only">{label}</span>
      <span className={cn('mrb-spinner', spin && 'mrb-spin')} aria-hidden>
        {name === 'in-and-out' ? (
          <span className="mrb-in-and-out" style={{ '--offset': 360 / n / 4 } as CSSProperties}>
            <div>{dots()}</div>
            <div>{dots()}</div>
          </span>
        ) : (
          <span className={`mrb-${name}`}>{dots()}</span>
        )}
      </span>
    </span>
  )
}
