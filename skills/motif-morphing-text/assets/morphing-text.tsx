// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/morphing-text.tsx
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop } from '@/lib/motif-runtime'
import { useId, useLayoutEffect, useRef, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  words: 'Lisbon, Berlin, Oslo, Vienna, Prague',
  morphTime: 1.5,
  holdTime: 1.4,
  melt: 8,
  color: '#f3eee4',
}
/* @motif:end */

export type MorphingTextProps = Partial<typeof defaults> & {
  /** 直接传数组时优先于 words。 */
  texts?: string[]
  className?: string
  style?: CSSProperties
}

/** words 用逗号或换行分隔。 */
function splitWords(words: string): string[] {
  return words
    .split(/[,\n]/)
    .map((word) => word.trim())
    .filter(Boolean)
}

/**
 * 上游的模糊与透明度曲线：fraction 为 1 时清晰，越接近 0 越模糊、越透明。
 * 模糊用 em，换字号时观感不变（上游写死 8px，相当于 96px 字号下的 0.08em）。
 */
function setLayer(element: HTMLElement, fraction: number, melt: number) {
  if (fraction <= 0.001) {
    element.style.opacity = '0'
    element.style.filter = 'none'
    return
  }
  const blur = Math.min(melt / fraction - melt, 1)
  element.style.opacity = String(Math.pow(Math.min(fraction, 1), 0.4))
  element.style.filter = blur > 0.0005 ? `blur(${blur.toFixed(4)}em)` : 'none'
}

/**
 * 词与词之间「融化」过渡：两层文字一个渐隐渐糊、一个渐显渐清，外层用 SVG 颜色矩阵把透明度阈值化，
 * 模糊的边缘就粘连成液体一样的形状。状态完全由帧循环的时间算出，暂停、截图、减少动态效果时都可复现。
 */
export function MorphingText({ texts, className, style, ...props }: MorphingTextProps) {
  const { words, morphTime, holdTime, melt, color } = { ...defaults, ...props }
  const list = texts && texts.length > 0 ? texts : splitWords(words)
  const longest = list.reduce((a, b) => (b.length > a.length ? b : a), '')
  const filterId = `mmt-${useId().replace(/[^\w-]/g, '')}`
  const hostRef = useRef<HTMLDivElement>(null)
  const fromRef = useRef<HTMLSpanElement>(null)
  const toRef = useRef<HTMLSpanElement>(null)
  const timeRef = useRef(0)

  const paint = (time: number) => {
    const from = fromRef.current
    const to = toRef.current
    if (!from || !to || list.length === 0) return
    const cycle = Math.max(holdTime + morphTime, 0.05)
    const index = Math.floor(time / cycle)
    const local = time - index * cycle
    const current = list[index % list.length]!
    const next = list[(index + 1) % list.length]!
    if (from.textContent !== current) from.textContent = current
    if (to.textContent !== next) to.textContent = next
    const m = melt / 100
    if (list.length < 2 || local < holdTime) {
      setLayer(from, 1, m)
      setLayer(to, 0, m)
      return
    }
    const fraction = (local - holdTime) / Math.max(morphTime, 0.05)
    setLayer(from, 1 - fraction, m)
    setLayer(to, fraction, m)
  }

  // 首帧之前就填好文字，避免挂载后空一帧；参数变化时按当前时间重画。
  useLayoutEffect(() => paint(timeRef.current))

  useFrameLoop(
    hostRef,
    ({ time }) => {
      timeRef.current = time
      paint(time)
    },
    // 减少动态效果：停在第一个词的停留阶段，文字清晰。
    { reducedMotion: 'static', staticTime: holdTime * 0.5 },
  )

  return (
    <div ref={hostRef} className={cn('relative w-full text-center text-6xl leading-none font-bold', className)} style={{ color, ...style }}>
      <span className="sr-only">{list.join(', ')}</span>
      <div aria-hidden className="grid" style={{ filter: `url(#${filterId}) blur(0.6px)` }}>
        {/* 不可见的最长词撑开高度和宽度，换词时不跳版。 */}
        <span className="invisible col-start-1 row-start-1 whitespace-nowrap">{longest}</span>
        <span ref={fromRef} className="col-start-1 row-start-1 whitespace-nowrap" />
        <span ref={toRef} className="col-start-1 row-start-1 whitespace-nowrap" />
      </div>
      <svg aria-hidden focusable="false" className="pointer-events-none absolute size-0 overflow-hidden">
        <defs>
          <filter id={filterId}>
            <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140" />
          </filter>
        </defs>
      </svg>
    </div>
  )
}
