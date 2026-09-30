// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Eduardo Calvo
// Source: https://github.com/educlopez/smoothui/blob/b6312bc/packages/smoothui/components/ai-loader/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { useEffect, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  variant: 'spark',
  messages: 'Thinking|Reading your sources|Drafting a reply',
  color: '#a78bfa',
  textColor: '#a1a1aa',
  size: 18,
  speed: 1,
  interval: 2.6,
  showElapsed: true,
  delay: 0,
}
/* @motif:end */

export type LoaderAiThinkingProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 是否处于加载中；为 false 时不渲染。 */
  loading?: boolean
}

/**
 * 一个以秒为单位的时钟。用 rAF + performance.now 而不是 setInterval，
 * 这样标签页在后台时自动暂停，手动时钟下也是确定的；只在 1/4 秒的边界上更新状态。
 */
function useSeconds(active: boolean): number {
  const [quarters, setQuarters] = useState(0)
  useEffect(() => {
    if (!active) {
      setQuarters(0)
      return
    }
    const start = performance.now()
    let frame = 0
    const tick = () => {
      setQuarters(Math.floor(((performance.now() - start) / 1000) * 4))
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active])
  return quarters / 4
}

/** 延迟出现：短请求根本不显示。 */
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
 * AI 思考指示器：一个小图形 + 会流光的文案 + 已等待秒数。
 * 文案按 interval 轮换，长时间等待时用已用时间告诉用户「还在动」。
 */
export function LoaderAiThinking({ className, style, loading = true, ...props }: LoaderAiThinkingProps) {
  const { variant, messages, color, textColor, size, speed, interval, showElapsed, delay } = { ...defaults, ...props }
  const visible = useDelayedVisible(loading, delay * 1000)
  const seconds = useSeconds(visible)
  const list = messages.split('|').map((line) => line.trim()).filter(Boolean)
  const lines = list.length ? list : ['Thinking']
  const index = Math.floor(seconds / Math.max(interval, 1)) % lines.length
  const message = lines[index]!
  const cycle = 1.4 / Math.max(speed, 0.1)

  return (
    <span
      role="status"
      aria-live="polite"
      aria-busy={loading}
      className={cn('mla-root', className)}
      style={
        {
          '--mla-size': `${size}px`,
          '--mla-color': color,
          '--mla-text': textColor,
          '--mla-dur': `${cycle}s`,
          ...style,
        } as CSSProperties
      }
    >
      {visible && (
        <>
          <span className={cn('mla-mark', `mla-${variant}`)} aria-hidden>
            {variant === 'spark' && (
              <svg viewBox="0 0 24 24" className="mla-spark-svg">
                <path d="M12 1.5C12.9 8.2 15.8 11.1 22.5 12C15.8 12.9 12.9 15.8 12 22.5C11.1 15.8 8.2 12.9 1.5 12C8.2 11.1 11.1 8.2 12 1.5Z" fill="currentColor" />
              </svg>
            )}
            {variant === 'orb' && (
              <>
                <i className="mla-orb-ring" />
                <i className="mla-orb-core" />
              </>
            )}
            {variant === 'dots' && [0, 1, 2].map((i) => <i key={i} className="mla-dot" style={{ '--i': i } as CSSProperties} />)}
            {variant === 'bar' && <i className="mla-bar-fill" />}
          </span>
          <span className="mla-line">
            {/* 换文案时用 key 重新挂载，触发淡入；屏幕阅读器只在文案变化时播报一次 */}
            <span key={message} className="mla-text mla-in">
              {message}
            </span>
            {showElapsed && seconds >= 2 && (
              <span className="mla-elapsed" aria-hidden>
                {Math.floor(seconds)}s
              </span>
            )}
          </span>
        </>
      )}
    </span>
  )
}
