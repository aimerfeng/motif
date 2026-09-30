// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Julien Thibeaut
// Source: https://github.com/ibelick/prompt-kit/blob/5a94966/components/prompt-kit/text-shimmer.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { useEffect, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  text: 'Thinking through your request',
  variant: 'sweep',
  size: 20,
  duration: 2.6,
  spread: 16,
  baseColor: '#71717a',
  highlightColor: '#fafafa',
  angle: 100,
  delay: 0,
}
/* @motif:end */

export type LoaderTextShimmerProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 是否处于加载中；为 false 时不渲染。 */
  loading?: boolean
}

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
 * 「思考中」文字流光：一道高光扫过文字（sweep）、逐字起伏（wave）或整体呼吸（pulse）。
 * 上游把 spread 夹在 5–45，防止高光带过宽或过窄；这里沿用。
 */
export function LoaderTextShimmer({ className, style, loading = true, ...props }: LoaderTextShimmerProps) {
  const { text, variant, size, duration, spread, baseColor, highlightColor, angle, delay } = { ...defaults, ...props }
  const visible = useDelayedVisible(loading, delay * 1000)
  const band = Math.min(Math.max(spread, 5), 45)
  const chars = Array.from(text)

  return (
    <span
      role="status"
      aria-live="polite"
      aria-busy={loading}
      className={cn('mlt-root', className)}
      style={
        {
          '--mlt-size': `${size}px`,
          '--mlt-dur': `${duration}s`,
          '--mlt-base': baseColor,
          '--mlt-hi': highlightColor,
          '--mlt-angle': `${angle}deg`,
          '--mlt-from': `${50 - band}%`,
          '--mlt-to': `${50 + band}%`,
          ...style,
        } as CSSProperties
      }
    >
      <span className="sr-only">{loading ? text : ''}</span>
      {visible && variant === 'wave' && (
        <span className="mlt-wave" aria-hidden>
          {chars.map((char, i) => (
            <span key={i} className="mlt-char" style={{ '--i': i, '--n': chars.length } as CSSProperties}>
              {char === ' ' ? ' ' : char}
            </span>
          ))}
        </span>
      )}
      {visible && variant !== 'wave' && (
        <span className={cn('mlt-text', variant === 'pulse' ? 'mlt-pulse' : 'mlt-sweep')} aria-hidden>
          {text}
        </span>
      )}
    </span>
  )
}
