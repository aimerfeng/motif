// SPDX-License-Identifier: MIT
// Copyright (c) 2020 Tobias Ahlin
// Source: https://github.com/tobiasahlin/SpinKit/blob/742a712/spinkit.css
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { useEffect, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  variant: 'equalizer',
  size: 32,
  color: '#8b5cf6',
  count: 5,
  thickness: 4,
  speed: 1,
  delay: 0,
  label: 'Loading',
}
/* @motif:end */

export type LoaderBarsProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 是否处于加载中；为 false 时不渲染图形，只保留（空的）读屏区域。 */
  loading?: boolean
}

/** 每个变体一个循环的基础秒数，除以 speed 得到实际时长。 */
const BASE_SECONDS: Record<string, number> = { equalizer: 1.1, wave: 1.2, voice: 1.3, signal: 1.4, sweep: 1.5 }

/** 每根柱子的相对周期，让均衡器看起来不规律但每次相同（不用随机数，服务端渲染和截图都稳定）。 */
const JITTER = [0.9, 1.2, 0.8, 1.35, 1, 0.85, 1.25, 0.95, 1.1]

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
 * 条形加载器：均衡器、波浪、居中扩散、信号格、扫描线。
 * 共用 size（高度）/ color / count / thickness / speed；开启「减少动态效果」时定格并缓慢呼吸。
 */
export function LoaderBars({ className, style, loading = true, ...props }: LoaderBarsProps) {
  const { variant, size, color, count, thickness, speed, delay, label } = { ...defaults, ...props }
  const visible = useDelayedVisible(loading, delay * 1000)
  const seconds = (BASE_SECONDS[variant] ?? 1.2) / Math.max(speed, 0.1)
  const bars = Math.round(Math.min(Math.max(count, 3), 9))
  const mid = (bars - 1) / 2

  return (
    <span
      role="status"
      aria-live="polite"
      aria-busy={loading}
      className={cn('mlb-root', className)}
      style={
        {
          '--mlb-size': `${size}px`,
          '--mlb-thick': `${thickness}px`,
          '--mlb-color': color,
          '--mlb-dur': `${seconds}s`,
          '--mlb-n': bars,
          ...style,
        } as CSSProperties
      }
    >
      <span className="sr-only">{loading ? label : ''}</span>
      {visible && (
        <span className={cn('mlb-visual', `mlb-${variant}`)} aria-hidden>
          {variant === 'sweep' ? (
            <i className="mlb-sweep-bar" />
          ) : (
            Array.from({ length: bars }, (_, i) => (
              <i
                key={i}
                className="mlb-bar"
                style={
                  {
                    '--i': i,
                    '--k': JITTER[i % JITTER.length],
                    // voice：离中心越远越晚起，形成从中间向两侧扩散
                    '--d': Math.abs(i - mid),
                  } as CSSProperties
                }
              />
            ))
          )}
        </span>
      )}
    </span>
  )
}
