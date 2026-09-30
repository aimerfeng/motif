// SPDX-License-Identifier: MIT
// Copyright (c) 2022 Griffin Johnston
// Source: https://github.com/GriffinJohnston/ldrs/blob/f759f65/src/elements/ring2.scss
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { useEffect, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  variant: 'ring',
  size: 44,
  color: '#8b5cf6',
  thickness: 4,
  speed: 1,
  delay: 0,
  label: 'Loading',
}
/* @motif:end */

export type LoaderOrbitsProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 是否处于加载中；为 false 时不渲染图形，只保留（空的）读屏区域。 */
  loading?: boolean
}

/** 每个变体转一圈的基础秒数，除以 speed 得到实际时长。 */
const BASE_SECONDS: Record<string, number> = { ring: 1.4, chase: 1.6, fade: 1, orbit: 1.6, pulsar: 1.8 }

/**
 * 延迟出现：短请求根本不显示加载器，避免一闪而过。
 * 用 rAF + performance.now 计时而不是 setTimeout，这样手动时钟下也是确定的。
 */
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
 * 轨道类加载器：圆弧、追逐点、渐隐刻度、轨道双点、脉冲环。
 * 共用 size / color / thickness / speed；开启「减少动态效果」时图形定格，整体做缓慢的明暗呼吸。
 */
export function LoaderOrbits({ className, style, loading = true, ...props }: LoaderOrbitsProps) {
  const { variant, size, color, thickness, speed, delay, label } = { ...defaults, ...props }
  const visible = useDelayedVisible(loading, delay * 1000)
  const seconds = (BASE_SECONDS[variant] ?? 1.4) / Math.max(speed, 0.1)
  // 圆点直径随 thickness 缩放；SVG 描边按 viewBox 50 换算。
  const dot = size * 0.06 * thickness
  const stroke = (thickness / size) * 50

  return (
    <span
      role="status"
      aria-live="polite"
      aria-busy={loading}
      className={cn('mlo-root', className)}
      style={
        {
          '--mlo-size': `${size}px`,
          '--mlo-color': color,
          '--mlo-thick': `${thickness}px`,
          '--mlo-dot': `${dot}px`,
          '--mlo-dur': `${seconds}s`,
          ...style,
        } as CSSProperties
      }
    >
      <span className="sr-only">{loading ? label : ''}</span>
      {visible && (
        <span className={cn('mlo-visual', `mlo-${variant}`)} aria-hidden>
          {variant === 'ring' && (
            <svg viewBox="0 0 50 50" className="mlo-ring-svg">
              <circle cx="25" cy="25" r={25 - stroke / 2 - 0.5} fill="none" stroke="currentColor" strokeOpacity="0.16" strokeWidth={stroke} />
              <circle className="mlo-arc" cx="25" cy="25" r={25 - stroke / 2 - 0.5} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" pathLength={100} strokeDasharray="28 72" />
            </svg>
          )}
          {variant === 'chase' &&
            [0, 1, 2, 3, 4, 5].map((i) => (
              <i key={i} className="mlo-chase-dot" style={{ '--i': i } as CSSProperties} />
            ))}
          {variant === 'fade' &&
            Array.from({ length: 12 }, (_, i) => <i key={i} className="mlo-tick" style={{ '--i': i } as CSSProperties} />)}
          {variant === 'orbit' && (
            <>
              <i className="mlo-orbit-dot" />
              <i className="mlo-orbit-dot mlo-orbit-dot-b" />
            </>
          )}
          {variant === 'pulsar' && (
            <>
              <i className="mlo-pulse-ring" />
              <i className="mlo-pulse-ring mlo-pulse-ring-b" />
              <i className="mlo-pulse-core" />
            </>
          )}
        </span>
      )}
    </span>
  )
}
