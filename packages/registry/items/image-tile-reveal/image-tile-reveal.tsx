// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/pixel-image.tsx
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop, usePrefersReducedMotion } from '@motif/runtime'
import { useMemo, useRef, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  rows: 4,
  cols: 6,
  tileDuration: 1000,
  maxDelay: 1200,
  grayscale: true,
  colorDelay: 1300,
  radius: 40,
  replayInterval: 5,
  artwork: 'dunes',
}
/* @motif:end */

export type PixelImageProps = Partial<typeof defaults> & {
  src: string
  alt?: string
  className?: string
  style?: CSSProperties
}

const MIN_GRID = 1
const MAX_GRID = 16

/** mulberry32：固定种子，每次刷新拼块的出场顺序都一样（上游用 Math.random）。 */
function random(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
/** CSS ease-out 的近似。 */
const easeOut = (t: number) => 1 - (1 - t) * (1 - t)
/** cubic-bezier(0.4, 0, 0.2, 1) 的近似。 */
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

export function PixelImage({ src, alt = '', className, style, ...props }: PixelImageProps) {
  const options = { ...defaults, ...props }
  const { tileDuration, maxDelay, colorDelay, grayscale, radius, replayInterval } = options
  const isValid = (n: number) => Number.isInteger(n) && n >= MIN_GRID && n <= MAX_GRID
  const rows = isValid(options.rows) ? options.rows : 4
  const cols = isValid(options.cols) ? options.cols : 6

  const host = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const pieceRefs = useRef<(HTMLDivElement | null)[]>([])
  const imgRefs = useRef<(HTMLImageElement | null)[]>([])

  const pieces = useMemo(() => {
    const total = rows * cols
    const next = random(rows * 97 + cols * 13 + 7)
    return Array.from({ length: total }, (_, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols

      const clipPath = `polygon(
        ${col * (100 / cols)}% ${row * (100 / rows)}%,
        ${(col + 1) * (100 / cols)}% ${row * (100 / rows)}%,
        ${(col + 1) * (100 / cols)}% ${(row + 1) * (100 / rows)}%,
        ${col * (100 / cols)}% ${(row + 1) * (100 / rows)}%
      )`

      const delay = next() * maxDelay
      return { clipPath, delay }
    })
  }, [rows, cols, maxDelay])

  // 整段出场在多少毫秒后结束（拼块到齐、颜色也恢复完）。
  const settled = Math.max(maxDelay + tileDuration, grayscale ? colorDelay + tileDuration : 0)
  const fadeOut = 600

  useFrameLoop(
    host,
    ({ time }) => {
      let ms = time * 1000
      let fade = 1
      if (reduced) {
        // 减少动态效果：直接停在拼好、上完色的那一帧。
        ms = settled
      } else if (replayInterval > 0) {
        const cycle = Math.max(replayInterval * 1000, settled + 1200 + fadeOut)
        ms %= cycle
        fade = clamp01((cycle - ms) / fadeOut)
      }
      if (host.current) host.current.style.opacity = String(fade)
      const color = grayscale ? easeInOut(clamp01((ms - colorDelay) / tileDuration)) : 1
      const filter = grayscale ? `grayscale(${(1 - color).toFixed(3)})` : 'none'
      pieces.forEach((piece, index) => {
        const el = pieceRefs.current[index]
        if (el) el.style.opacity = easeOut(clamp01((ms - piece.delay) / tileDuration)).toFixed(3)
        const img = imgRefs.current[index]
        if (img) img.style.filter = filter
      })
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  return (
    <div ref={host} className={cn('relative h-72 w-72 select-none md:h-96 md:w-96', className)} style={style} role="img" aria-label={alt || undefined}>
      {pieces.map((piece, index) => (
        <div
          key={index}
          ref={(el) => {
            pieceRefs.current[index] = el
          }}
          className="absolute inset-0"
          style={{ clipPath: piece.clipPath, opacity: 0 }}
          aria-hidden="true"
        >
          {src ? (
            <img
              ref={(el) => {
                imgRefs.current[index] = el
              }}
              src={src}
              alt=""
              className="z-1 h-full w-full object-cover"
              style={{ borderRadius: radius, filter: grayscale ? 'grayscale(1)' : undefined }}
              draggable={false}
            />
          ) : null}
        </div>
      ))}
    </div>
  )
}
