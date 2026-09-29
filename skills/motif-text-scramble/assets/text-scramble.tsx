// SPDX-License-Identifier: MIT
// Copyright (c) 2024 ibelick
// Source: https://github.com/ibelick/motion-primitives/blob/120f64f/components/core/text-scramble.tsx
// Modified by Motif; see the item's provenance.
import { cn, usePrefersReducedMotion } from '@/lib/motif-runtime'
import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  text: 'Decrypting the signal',
  duration: 1.4,
  rate: 24,
  order: 'random',
  characterSet: 'symbols',
  glyphColor: '#7dd3fc',
  replayOnHover: true,
}
/* @motif:end */

const GLYPHS: Record<string, string> = {
  symbols: '!<>-_\\/[]{}—=+*^?#%&@',
  letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  binary: '01',
  hex: '0123456789ABCDEF',
}

type ScrambleTag = 'p' | 'h1' | 'h2' | 'h3' | 'div' | 'span'
type Cell = { char: string; done: boolean }

export type TextScrambleProps = Partial<typeof defaults> & {
  /** 优先于 text，方便直接写成 <TextScramble>…</TextScramble>。 */
  children?: string
  as?: ScrambleTag
  /** 变为 true（或挂载时为 true）就播放一次；悬停重播另算。 */
  trigger?: boolean
  onScrambleComplete?: () => void
  className?: string
  style?: CSSProperties
}

/**
 * 乱码逐个解码成正文。乱码宽度不一致时排版会抖动，建议配合等宽字体（font-mono）。
 * 时间用 requestAnimationFrame 和 performance.now 读取，截图时的手动时钟也能驱动它。
 */
export function TextScramble({ children, as: Tag = 'p', trigger = true, onScrambleComplete, className, style, ...props }: TextScrambleProps) {
  const { text: textProp, duration, rate, order, characterSet, glyphColor, replayOnHover } = { ...defaults, ...props }
  const text = children ?? textProp
  const reducedMotion = usePrefersReducedMotion()
  const [cells, setCells] = useState<Cell[] | null>(null)
  const [replay, setReplay] = useState(0)
  const running = useRef(false)
  const completeRef = useRef(onScrambleComplete)
  completeRef.current = onScrambleComplete

  // 用 layout effect：第一帧绘制之前就换成乱码，不会闪一下正文。
  useLayoutEffect(() => {
    if (!trigger || reducedMotion || text.length === 0) return
    const glyphs = GLYPHS[characterSet] ?? GLYPHS.symbols!
    const length = text.length

    // 每个字符「解出」的时刻：随机顺序时打乱名次，顺序模式就是从左到右。
    const ranks = Array.from({ length }, (_, index) => index)
    if (order === 'random') {
      for (let index = length - 1; index > 0; index--) {
        const swap = Math.floor(Math.random() * (index + 1))
        ;[ranks[index], ranks[swap]] = [ranks[swap]!, ranks[index]!]
      }
    }

    let frame = 0
    let lastTick = -1
    const start = performance.now()
    running.current = true

    const step = (now: number) => {
      const elapsed = (now - start) / 1000
      const progress = Math.min(1, elapsed / Math.max(duration, 0.05))
      const tick = Math.floor(elapsed * rate)
      if (tick !== lastTick || progress >= 1) {
        lastTick = tick
        setCells(
          Array.from(text, (char, index): Cell => {
            const done = char === ' ' || progress >= (ranks[index]! + 1) / length
            return { char: done ? char : glyphs[Math.floor(Math.random() * glyphs.length)]!, done }
          }),
        )
      }
      if (progress < 1) {
        frame = requestAnimationFrame(step)
      } else {
        running.current = false
        setCells(null)
        completeRef.current?.()
      }
    }
    step(start)

    return () => {
      cancelAnimationFrame(frame)
      running.current = false
      setCells(null)
    }
  }, [trigger, text, duration, rate, order, characterSet, reducedMotion, replay])

  return (
    <Tag
      className={cn(className)}
      style={style}
      onPointerEnter={replayOnHover && !reducedMotion ? () => !running.current && setReplay((count) => count + 1) : undefined}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {cells
          ? cells.map((cell, index) => (
              <span key={index} style={cell.done ? undefined : { color: glyphColor }}>
                {cell.char}
              </span>
            ))
          : text}
      </span>
    </Tag>
  )
}
