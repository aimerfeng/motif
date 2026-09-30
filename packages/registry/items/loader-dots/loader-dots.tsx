// SPDX-License-Identifier: MIT
// Copyright (c) 2022 Griffin Johnston
// Source: https://github.com/GriffinJohnston/ldrs/blob/f759f65/src/elements/dotWave.scss
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { useEffect, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  variant: 'pulse',
  size: 12,
  color: '#8b5cf6',
  count: 3,
  spacing: 0.7,
  speed: 1,
  delay: 0,
  label: 'Loading',
}
/* @motif:end */

export type LoaderDotsProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 是否处于加载中；为 false 时不渲染圆点，只保留（空的）读屏区域。 */
  loading?: boolean
}

/** 每个变体一个循环的基础秒数，除以 speed 得到实际时长。 */
const BASE_SECONDS: Record<string, number> = { pulse: 1.3, wave: 1.2, bounce: 1.1, typing: 1.4, ellipsis: 1.5 }

/** 延迟出现；用 rAF + performance.now 计时，手动时钟下也是确定的。 */
function useDelayedVisible(active: boolean, delayMs: number): boolean {
  const [visible, setVisible] = useState(delayMs <= 0)
  useEffect(() => {
    if (!active) {
      setVisible(false)
      return
    }
    if (delayMs <= 0) {
      setVisible(true)
      return
    }
    const start = performance.now()
    let frame = 0
    const tick = () => {
      if (performance.now() - start >= delayMs) setVisible(true)
      else frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, delayMs])
  return active && visible
}

/**
 * 圆点加载器：脉冲、波浪、弹跳、输入中、省略号。
 * 共用 size / color / count / spacing / speed；开启「减少动态效果」时圆点定格为渐变亮度并缓慢呼吸。
 */
export function LoaderDots({ className, style, loading = true, ...props }: LoaderDotsProps) {
  const { variant, size, color, count, spacing, speed, delay, label } = { ...defaults, ...props }
  const visible = useDelayedVisible(loading, delay * 1000)
  const seconds = (BASE_SECONDS[variant] ?? 1.3) / Math.max(speed, 0.1)
  const dots = Math.round(Math.min(Math.max(count, 2), 6))

  return (
    <span
      role="status"
      aria-live="polite"
      aria-busy={loading}
      className={cn('mld-root', className)}
      style={
        {
          '--mld-size': `${size}px`,
          '--mld-gap': `${size * spacing}px`,
          '--mld-color': color,
          '--mld-dur': `${seconds}s`,
          '--mld-n': dots,
          ...style,
        } as CSSProperties
      }
    >
      <span className="sr-only">{loading ? label : ''}</span>
      {visible && (
        <span className={cn('mld-visual', `mld-${variant}`)} aria-hidden>
          {Array.from({ length: dots }, (_, i) => (
            <i key={i} className="mld-dot" style={{ '--i': i } as CSSProperties} />
          ))}
        </span>
      )}
    </span>
  )
}
