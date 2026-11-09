// SPDX-License-Identifier: MIT
// Copyright (c) 2014 Luke Haas
// Source: https://github.com/lukehaas/css-loaders/blob/c7fdf5a/css/load3.css
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import type { CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  variant: 'disc',
  size: 56,
  thickness: 6,
  color: '#0dc5c1',
  tailLength: 0.42,
  glow: 0.3,
  speed: 1,
  label: 'Loading',
}
/* @motif:end */

export type LoaderCometSweepProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
}

/** 上游每个变体一圈的秒数（load3 1.4s、load6 1.7s、load2 2s），除以 speed。 */
const BASE_SECONDS: Record<string, number> = { disc: 1.4, echo: 1.7, wipe: 2 }

/**
 * 彗尾加载器：渐变圆盘（load3）、回声尾（load6）、半圆扫环（load2）。
 * 上游用页面底色的圆盖住中心，这里改成 CSS mask，放在任何背景上都成立。
 */
export function LoaderCometSweep({ className, style, ...props }: LoaderCometSweepProps) {
  const { variant, size, thickness, color, tailLength, glow, speed, label } = { ...defaults, ...props }
  const seconds = (BASE_SECONDS[variant] ?? 1.4) / Math.max(speed, 0.1)

  return (
    <span
      role="status"
      aria-live="polite"
      aria-busy
      className={cn('mcs-root', className)}
      style={
        {
          '--mcs-size': `${size}px`,
          '--mcs-color': color,
          '--mcs-thick': `${thickness}px`,
          '--mcs-tail': `${Math.round(tailLength * 100)}%`,
          '--mcs-glow': `${(glow * size * 0.12).toFixed(2)}px`,
          '--mcs-dur': `${seconds}s`,
          ...style,
        } as CSSProperties
      }
    >
      <span className="sr-only">{label}</span>
      <span className="mcs-visual" aria-hidden>
        {variant === 'disc' && <span className="mcs-disc mcs-ring-mask" />}
        {variant === 'echo' && <span className="mcs-echo" />}
        {variant === 'wipe' && <span className="mcs-wipe" />}
      </span>
    </span>
  )
}
