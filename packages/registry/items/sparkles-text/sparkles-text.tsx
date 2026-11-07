// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/sparkles-text.tsx
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop } from '@motif/runtime'
import { useRef, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  text: 'Inbox zero',
  colors: ['#ffd479', '#ff9fc5'],
  count: 10,
  size: 1,
  speed: 1,
  spread: 45,
  seed: 2,
}
/* @motif:end */

export type SparklesTextProps = Partial<typeof defaults> & {
  /** 优先于 text，可以直接写成 <SparklesText>…</SparklesText>。 */
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

/** 上游的四角星（21×21）。 */
const STAR =
  'M9.82531 0.843845C10.0553 0.215178 10.9446 0.215178 11.1746 0.843845L11.8618 2.72026C12.4006 4.19229 12.3916 6.39157 13.5 7.5C14.6084 8.60843 16.8077 8.59935 18.2797 9.13822L20.1561 9.82534C20.7858 10.0553 20.7858 10.9447 20.1561 11.1747L18.2797 11.8618C16.8077 12.4007 14.6084 12.3916 13.5 13.5C12.3916 14.6084 12.4006 16.8077 11.8618 18.2798L11.1746 20.1562C10.9446 20.7858 10.0553 20.7858 9.82531 20.1562L9.13819 18.2798C8.59932 16.8077 8.60843 14.6084 7.5 13.5C6.39157 12.3916 4.19225 12.4007 2.72023 11.8618L0.843814 11.1747C0.215148 10.9447 0.215148 10.0553 0.843814 9.82534L2.72023 9.13822C4.19225 8.59935 6.39157 8.60843 7.5 7.5C8.60843 6.39157 8.59932 4.19229 9.13819 2.72026L9.82531 0.843845Z'

/** 每颗星在同一位置闪几次再换地方（上游是 5–15 秒随机）。 */
const TWINKLES_PER_SPOT = 2
/** 一次闪烁的基础时长（秒），与上游的 0.8 秒相近。 */
const TWINKLE = 0.9

/** 无状态的整数哈希，返回 [0, 1)：同样的输入永远得到同样的结果，截图逐帧可复现。 */
function hash(a: number, b: number, c: number): number {
  let h = Math.imul(a + 0x632be5ab, 0x9e3779b1) ^ Math.imul(b + 0x2545f491, 0x85ebca77) ^ Math.imul(c + 0x7f4a7c15, 0xc2b2ae3d)
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d)
  h = Math.imul(h ^ (h >>> 12), 0x297a2d39)
  return ((h ^ (h >>> 15)) >>> 0) / 4294967296
}

/**
 * 在文字盒子外扩一圈的范围里取点，尽量避开字身中段：星星围着字闪，而不是盖住笔画。
 * spread 按文字高度计，宽字、窄字的外扩看起来一样。返回相对文字盒子的百分比。
 */
function pickSpot(index: number, spot: number, seed: number, width: number, height: number, spread: number): [number, number] {
  const margin = spread * height
  let x = 0
  let y = 0
  for (let attempt = 0; attempt < 6; attempt++) {
    x = -margin + (width + 2 * margin) * hash(index * 8 + attempt, spot, seed * 16 + 3)
    y = -margin + (height + 2 * margin) * hash(index * 8 + attempt, spot, seed * 16 + 4)
    const onGlyphs = x > width * 0.04 && x < width * 0.96 && y > height * 0.22 && y < height * 0.78
    if (!onGlyphs) break
  }
  return [(x / width) * 100, (y / height) * 100]
}

/**
 * 文字周围不断闪烁的小星星。星星的位置、大小、颜色和闪烁节奏都由帧循环的时间和 seed 算出来，
 * 直接改 DOM 的 transform / opacity，不触发 React 重渲染。
 */
export function SparklesText({ children, className, style, ...props }: SparklesTextProps) {
  const { text, colors, count, size, speed, spread, seed } = { ...defaults, ...props }
  const content = children ?? text
  const hostRef = useRef<HTMLSpanElement>(null)
  const starsRef = useRef<(SVGSVGElement | null)[]>([])
  const spotsRef = useRef<string[]>([])
  const total = Math.max(0, Math.round(count))
  const palette = colors.length > 0 ? colors : ['#ffffff']
  // 外观参数变了就立即重新布点，不必等到下一次换位置。
  const look = `${spread}|${size}|${palette.join(',')}`

  useFrameLoop(
    hostRef,
    ({ time }) => {
      const host = hostRef.current
      // 每帧开头、写样式之前读一次尺寸，不会强制额外排版。
      const width = host?.offsetWidth ?? 0
      const height = host?.offsetHeight ?? 0
      if (width === 0 || height === 0) return
      for (let index = 0; index < total; index++) {
        const star = starsRef.current[index]
        if (!star) continue
        const life = (TWINKLE * (0.8 + 0.5 * hash(index, seed, 1))) / Math.max(speed, 0.05)
        const t = time / life + hash(index, seed, 2) * TWINKLES_PER_SPOT
        const cycle = Math.floor(t)
        const phase = t - cycle
        const spot = Math.floor(cycle / TWINKLES_PER_SPOT)
        // 换位置只发生在两次闪烁之间（此刻星星不可见），不会凭空跳动。
        const key = `${spot}|${look}`
        if (spotsRef.current[index] !== key) {
          spotsRef.current[index] = key
          const [x, y] = pickSpot(index, spot, seed, width, height, spread / 100)
          star.style.left = `${x.toFixed(2)}%`
          star.style.top = `${y.toFixed(2)}%`
          star.style.color = palette[Math.floor(hash(index, spot, seed * 16 + 5) * palette.length)] ?? palette[0]!
          star.dataset.scale = String((0.4 + 0.6 * hash(index, spot, seed * 16 + 6)) * size)
        }
        const envelope = Math.sin(Math.PI * phase)
        const scale = envelope * Number(star.dataset.scale ?? 1)
        // 上游的旋转是 75° → 150°，这里沿用。
        star.style.transform = `translate(-50%, -50%) rotate(${75 + 75 * phase}deg) scale(${scale.toFixed(4)})`
        star.style.opacity = Math.min(1, envelope * 1.25).toFixed(3)
      }
    },
    // 减少动态效果：停在一帧，几颗星以不同大小定格在字的周围。
    { reducedMotion: 'static', staticTime: 2.2 },
  )

  return (
    <span ref={hostRef} className={cn('relative inline-block font-bold', className)} style={style}>
      {Array.from({ length: total }, (_, index) => (
        <svg
          key={`${index}-${seed}`}
          ref={(element) => {
            starsRef.current[index] = element
            if (!element) spotsRef.current[index] = ''
          }}
          aria-hidden
          viewBox="0 0 21 21"
          className="pointer-events-none absolute z-10 size-[0.46em] opacity-0"
        >
          <path d={STAR} fill="currentColor" />
        </svg>
      ))}
      {content}
    </span>
  )
}
