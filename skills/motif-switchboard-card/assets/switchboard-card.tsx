// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Eduardo Calvo
// Source: https://github.com/educlopez/smoothui/blob/b6312bc/packages/smoothui/components/switchboard-card/index.tsx
// Modified by Motif; see the item's provenance.
import { cn, useCanvasSize, useFrameLoop } from '@/lib/motif-runtime'
import { useRef, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  text: 'LIVE',
  color: '#ffb224',
  shape: 'round',
  cell: 9,
  glow: 1,
  ambient: 0.12,
  speed: 1,
}
/* @motif:end */

export type SwitchboardCardProps = Partial<typeof defaults> & {
  title?: string
  subtitle?: string
  className?: string
  style?: CSSProperties
}

// 3x5 点阵字库：每个字符五行，每行三格，# 为亮
const GLYPHS: Record<string, string[]> = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  B: ['##.', '#.#', '##.', '#.#', '##.'],
  C: ['.##', '#..', '#..', '#..', '.##'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'],
  E: ['###', '#..', '##.', '#..', '###'],
  F: ['###', '#..', '##.', '#..', '#..'],
  G: ['.##', '#..', '#.#', '#.#', '.##'],
  H: ['#.#', '#.#', '###', '#.#', '#.#'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  J: ['..#', '..#', '..#', '#.#', '.#.'],
  K: ['#.#', '#.#', '##.', '#.#', '#.#'],
  L: ['#..', '#..', '#..', '#..', '###'],
  M: ['#.#', '###', '###', '#.#', '#.#'],
  N: ['##.', '#.#', '#.#', '#.#', '#.#'],
  O: ['.#.', '#.#', '#.#', '#.#', '.#.'],
  P: ['##.', '#.#', '##.', '#..', '#..'],
  Q: ['.#.', '#.#', '#.#', '##.', '.##'],
  R: ['##.', '#.#', '##.', '#.#', '#.#'],
  S: ['.##', '#..', '.#.', '..#', '##.'],
  T: ['###', '.#.', '.#.', '.#.', '.#.'],
  U: ['#.#', '#.#', '#.#', '#.#', '###'],
  V: ['#.#', '#.#', '#.#', '#.#', '.#.'],
  W: ['#.#', '#.#', '###', '###', '#.#'],
  X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
  Y: ['#.#', '#.#', '.#.', '.#.', '.#.'],
  Z: ['###', '..#', '.#.', '#..', '###'],
  '0': ['###', '#.#', '#.#', '#.#', '###'],
  '1': ['.#.', '##.', '.#.', '.#.', '###'],
  '2': ['##.', '..#', '.#.', '#..', '###'],
  '3': ['##.', '..#', '.#.', '..#', '##.'],
  '4': ['#.#', '#.#', '###', '..#', '..#'],
  '5': ['###', '#..', '##.', '..#', '##.'],
  '6': ['.##', '#..', '###', '#.#', '###'],
  '7': ['###', '..#', '.#.', '.#.', '.#.'],
  '8': ['###', '#.#', '###', '#.#', '###'],
  '9': ['###', '#.#', '###', '..#', '##.'],
  '-': ['...', '...', '###', '...', '...'],
  '!': ['.#.', '.#.', '.#.', '...', '.#.'],
  '.': ['...', '...', '...', '...', '.#.'],
  ' ': ['...', '...', '...', '...', '...'],
}

const PERIOD = 9
const REVEAL = 2.2
const FADE_AT = 6.6

const hash = (n: number) => {
  const x = Math.sin(n * 12.9898 + 4.1414) * 43758.5453
  return x - Math.floor(x)
}

interface Layout {
  key: string
  cols: number
  rows: number
  /** 每格：-1 不在文字里，否则是它在文字宽度中的位置 0–1。 */
  text: Float32Array
  seed: Float32Array
}

function buildLayout(cols: number, rows: number, text: string): Layout {
  const chars = [...text.toUpperCase()]
  const pixelCols = Math.max(1, chars.length * 4 - 1)
  // 能放多大就放多大，至少 1 格；四周留一圈边距
  const scale = Math.max(1, Math.floor(Math.min((cols - 2) / pixelCols, (rows - 2) / 5)))
  const width = pixelCols * scale
  const col0 = Math.floor((cols - width) / 2)
  const row0 = Math.floor((rows - 5 * scale) / 2)
  const map = new Float32Array(cols * rows).fill(-1)
  chars.forEach((ch, ci) => {
    const glyph = GLYPHS[ch] ?? GLYPHS[' ']
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 3; c++) {
        if (glyph[r][c] !== '#') continue
        for (let dy = 0; dy < scale; dy++) {
          for (let dx = 0; dx < scale; dx++) {
            const x = col0 + (ci * 4 + c) * scale + dx
            const y = row0 + r * scale + dy
            if (x >= 0 && x < cols && y >= 0 && y < rows) map[y * cols + x] = ((ci * 4 + c) * scale + dx) / Math.max(1, width - 1)
          }
        }
      }
    }
  })
  const seed = new Float32Array(cols * rows)
  for (let i = 0; i < seed.length; i++) seed[i] = hash(i + 1)
  return { key: `${cols}x${rows}:${text}`, cols, rows, text: map, seed }
}

/** 文字格的亮度：从左到右逐格点亮，停留，再从左到右熄灭。 */
function textLevel(t: number, pos: number, seed: number) {
  const p = t % PERIOD
  const on = 0.2 + pos * (REVEAL - 0.5) + seed * 0.45
  if (p < on) return 0
  if (p < on + 0.14) return 0.5
  const off = FADE_AT + pos + seed * 0.3
  if (p >= off) return p < off + 0.15 ? 0.5 : 0
  return 0.9 + 0.1 * Math.sin(p * 3 + seed * 6.28)
}

/** 环境里零星闪烁的灯：off -> medium -> high -> off。 */
function ambientLevel(t: number, seed: number, density: number) {
  if (seed > density) return 0
  const rate = 0.5 + hash(seed * 977) * 0.9
  const wave = Math.sin(t * rate + seed * 6283)
  return wave > 0 ? 0.6 * Math.min(1, wave * 1.6) ** 2 : 0
}

/** 点阵灯牌卡片：一块 LED 面板用 3×5 点阵拼出文字，周围零星的灯随机亮灭；下方是标题和说明。 */
export function SwitchboardCard({ title = 'Studio B is live', subtitle = 'Cues, lights and signal on one panel. Tap the lamp to take the next cue.', className, style, ...props }: SwitchboardCardProps) {
  const { text, color, shape, cell, glow, ambient, speed } = { ...defaults, ...props }
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const optionsRef = useRef({ text, color, shape, cell, glow, ambient })
  optionsRef.current = { text, color, shape, cell, glow, ambient }
  const layoutRef = useRef<Layout | null>(null)
  const spriteRef = useRef<{ key: string; canvas: HTMLCanvasElement } | null>(null)
  const timeRef = useRef(0)

  const draw = (time: number) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const { text, color, shape, cell, glow, ambient } = optionsRef.current
    const { width, height, dpr } = sizeRef.current
    const px = cell * dpr
    // 四周各留一格空白，让辉光不被画布边缘切掉
    const cols = Math.max(1, Math.floor(width / px) - 2)
    const rows = Math.max(1, Math.floor(height / px) - 2)
    const key = `${cols}x${rows}:${text}`
    if (layoutRef.current?.key !== key) layoutRef.current = buildLayout(cols, rows, text)
    const layout = layoutRef.current

    // 发光贴图：每帧复用同一张，比 shadowBlur 便宜得多
    const hex = color.slice(0, 7)
    const spriteKey = `${hex}@${Math.round(px)}`
    if (spriteRef.current?.key !== spriteKey) {
      const size = Math.max(8, Math.round(px * 3))
      const sprite = document.createElement('canvas')
      sprite.width = sprite.height = size
      const sctx = sprite.getContext('2d')!
      const g = sctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
      g.addColorStop(0, hex + '88')
      g.addColorStop(0.2, hex + '40')
      g.addColorStop(0.5, hex + '14')
      g.addColorStop(1, hex + '00')
      sctx.fillStyle = g
      sctx.fillRect(0, 0, size, size)
      spriteRef.current = { key: spriteKey, canvas: sprite }
    }
    const sprite = spriteRef.current.canvas

    ctx.clearRect(0, 0, width, height)
    const ox = (width - cols * px) / 2
    const oy = (height - rows * px) / 2
    const round = shape === 'round'
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c
        const cx = ox + (c + 0.5) * px
        const cy = oy + (r + 0.5) * px
        const pos = layout.text[i]
        const level = pos >= 0 ? textLevel(time, pos, layout.seed[i]) : ambientLevel(time, layout.seed[i], ambient)

        // 底座：熄灭的灯
        const base = px * 0.11
        ctx.globalAlpha = 0.16
        ctx.fillStyle = '#ffffff'
        if (round) {
          ctx.beginPath()
          ctx.arc(cx, cy, base, 0, Math.PI * 2)
          ctx.fill()
        } else ctx.fillRect(cx - base, cy - base, base * 2, base * 2)

        if (level <= 0.01) continue
        ctx.globalAlpha = Math.min(1, level * 0.7 * glow)
        const s = sprite.width * (0.8 + 0.2 * level)
        ctx.drawImage(sprite, cx - s / 2, cy - s / 2, s, s)

        const lit = px * (0.12 + 0.2 * level)
        ctx.globalAlpha = 0.3 + 0.7 * level
        ctx.fillStyle = color
        if (round) {
          ctx.beginPath()
          ctx.arc(cx, cy, lit, 0, Math.PI * 2)
          ctx.fill()
        } else ctx.fillRect(cx - lit, cy - lit, lit * 2, lit * 2)
        if (level > 0.8) {
          ctx.globalAlpha = (level - 0.8) * 3
          ctx.fillStyle = '#ffffff'
          ctx.beginPath()
          ctx.arc(cx, cy, lit * 0.45, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
    ctx.globalAlpha = 1
  }

  const sizeRef = useCanvasSize(canvasRef, { maxDpr: 2, onResize: () => draw(timeRef.current) })

  useFrameLoop(
    hostRef,
    ({ time }) => {
      timeRef.current = time
      draw(time)
    },
    { speed, reducedMotion: 'static', staticTime: 4.2 },
  )

  return (
    <div
      ref={hostRef}
      className={cn('relative flex h-[380px] w-full flex-col overflow-hidden rounded-2xl border border-white/10 p-6 text-left', className)}
      style={{ background: 'linear-gradient(160deg, #1a1612, #0e0c09)', color: '#f4efe6', ...style }}
    >
      <canvas ref={canvasRef} role="img" aria-label={`Lights spelling ${text}`} className="min-h-0 w-full flex-1" />
      <h3 className="mt-4 text-xl leading-8 font-semibold tracking-[-0.03em]">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed tracking-[-0.01em] opacity-65">{subtitle}</p>
    </div>
  )
}
