// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/kinetic-text.tsx
// Modified by Motif; see the item's provenance.
import { cn, usePrefersReducedMotion } from '@/lib/motif-runtime'
import { createElement, useEffect, useMemo, useRef, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  text: 'Oona Marsh',
  font: 'geist',
  size: 136,
  baseWeight: 200,
  peakWeight: 900,
  spread: 1.8,
  strokeBoost: 1.6,
  letterPadding: 6,
  duration: 0.5,
}
/* @motif:end */

type WeightWaveTag = 'span' | 'p' | 'div' | 'h1' | 'h2' | 'h3' | 'h4'

export type WeightWaveTextProps = Partial<typeof defaults> & {
  /** 渲染成哪个标签；作为页面标题时用 h1。 */
  as?: WeightWaveTag
  className?: string
  style?: CSSProperties
}

const FONTS: Record<string, string> = {
  geist: "'Geist Variable', ui-sans-serif, system-ui, sans-serif",
  fraunces: "'Fraunces Variable', ui-serif, Georgia, serif",
  outfit: "'Outfit Variable', ui-sans-serif, system-ui, sans-serif",
  mono: "'Geist Mono Variable', ui-monospace, SFMono-Regular, Menlo, monospace",
}

/** 指针在字母中心上下这么多（按字号计）以内都算「压在这一行上」：从 x 字高到基线，浪尖一样饱满。 */
const BAND = 0.25
/** 超出这条带之后，竖直距离按这个倍数放大：上下两行挨得很近，浪应当沿着一行走，只有指针落在两行之间时才同时波及两行。 */
const VERTICAL = 2

interface Token {
  /** 空白为 null：渲染成普通空格，行只在这里折断。 */
  letters: { char: string; key: number }[] | null
}

/** 按空白拆成词，词里再拆成字母（Array.from 不会拆开代理对）；每个字母带一个全局序号作 key。 */
function tokenize(text: string): Token[] {
  let index = 0
  return text
    .split(/(\s+)/)
    .filter(Boolean)
    .map((token) => ({ letters: /^\s+$/.test(token) ? null : Array.from(token, (char) => ({ char, key: index++ })) }))
}

/**
 * 可变字重的大字：指针附近的字母按距离变粗，指针正下方的那个最粗并带同色描边，像一道跟着指针走的浪。
 * 指针挂在 window 上：浪在指针靠近时就渐渐浮起，而不是碰到字母边缘才突然出现。
 * 每次指针移动只给每个字母写一个 --tww-ink（0–1），字重、描边、让位都在 CSS 里由它算出，并由同一条过渡带动。
 */
export function WeightWaveText({ as = 'span', className, style, ...props }: WeightWaveTextProps) {
  const { text, font, size, baseWeight, peakWeight, spread, strokeBoost, letterPadding, duration } = { ...defaults, ...props }
  const rootRef = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  const tokens = useMemo(() => tokenize(text), [text])

  useEffect(() => {
    const root = rootRef.current
    // 减少动态效果：不跟随指针，整行停在静止字重。
    if (!root || reduced) return
    const letters = Array.from(root.querySelectorAll<HTMLElement>('.tww-letter'))
    const written = new Float64Array(letters.length)
    let active = false

    const write = (inks: ArrayLike<number>) => {
      for (let i = 0; i < letters.length; i++) {
        // 量化到千分之一：没变的字母不写，免得每次移动都重启它的过渡。
        const ink = Math.round(inks[i]! * 1000) / 1000
        if (ink === written[i]) continue
        written[i] = ink
        letters[i]!.style.setProperty('--tww-ink', String(ink))
      }
    }

    const relax = () => {
      if (!active) return
      active = false
      write(new Float64Array(letters.length))
    }

    const follow = (x: number, y: number) => {
      const box = root.getBoundingClientRect()
      const em = parseFloat(getComputedStyle(root).fontSize) || 16
      const reach = Math.max(spread, 0.1) * em
      const band = BAND * em
      if (x < box.left - reach || x > box.right + reach || y < box.top - band - reach / VERTICAL || y > box.bottom + band + reach / VERTICAL) {
        relax()
        return
      }
      active = true
      // 先把所有字母的位置读完再统一写入，只触发一次布局。
      const inks = new Float64Array(letters.length)
      for (let i = 0; i < letters.length; i++) {
        const rect = letters[i]!.getBoundingClientRect()
        const dx = x - (rect.left + rect.width / 2)
        const dy = Math.max(Math.abs(y - (rect.top + rect.height / 2)) - band, 0) * VERTICAL
        const u = Math.hypot(dx, dy) / reach
        // 余弦钟形：中心为 1，到 reach 处平滑落到 0，没有折角。
        inks[i] = u >= 1 ? 0 : 0.5 + 0.5 * Math.cos(Math.PI * u)
      }
      write(inks)
    }

    const onMove = (event: PointerEvent) => follow(event.clientX, event.clientY)
    // 触屏没有悬停：点一下让浪涌起，抬起手指后回落。
    const onUp = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') relax()
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onMove, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('pointercancel', onUp, { passive: true })
    document.documentElement.addEventListener('pointerleave', relax)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      document.documentElement.removeEventListener('pointerleave', relax)
      for (const letter of letters) letter.style.removeProperty('--tww-ink')
    }
  }, [reduced, tokens, spread])

  const vars = {
    '--tww-base': String(baseWeight),
    '--tww-peak': String(Math.max(peakWeight, baseWeight)),
    '--tww-stroke': `${strokeBoost / 100}em`,
    '--tww-pad': `${letterPadding / 100}em`,
    '--tww-duration': `${duration}s`,
  } as CSSProperties

  return createElement(
    as,
    {
      ref: rootRef,
      className: cn('tww-root', className),
      style: { fontFamily: FONTS[font] ?? FONTS.geist, fontSize: `${size}px`, ...vars, ...style },
    },
    tokens.map((token, i) =>
      token.letters === null ? (
        ' '
      ) : (
        <span key={i} aria-hidden>
          {token.letters.map((letter) => (
            <span key={letter.key} className="tww-letter">
              {letter.char}
            </span>
          ))}
        </span>
      ),
    ),
    <span key="label" className="sr-only">
      {text}
    </span>,
  )
}
