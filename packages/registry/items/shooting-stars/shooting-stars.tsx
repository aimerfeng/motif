// SPDX-License-Identifier: MIT
// Copyright (c) Animata
// Source: https://github.com/codse/animata/blob/36674e4/animata/background/shooting-stars.tsx
// Modified by Motif; see the item's provenance.
import { cn, useCanvasSize, useFrameLoop } from '@motif/runtime'
import { useEffect, useMemo, useRef, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  skyTop: '#06161d',
  skyBottom: '#0d3a40',
  glowColor: '#f59e0b',
  stars: 90,
  colors: ['#ffffff', '#9ff0e0', '#ffd9a0'],
  count: 16,
  length: 170,
  angle: 24,
  speed: 1,
}
/* @motif:end */

export type ShootingStarsProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 可复现的整数哈希到 [0, 1)，让每条流星在第 k 轮的参数只取决于 (i, k)，画面是时间的纯函数。 */
function hash(a: number, b: number, c: number): number {
  let h = Math.imul(a + 0x9e3779b1, 0x85ebca6b) ^ Math.imul(b + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(c + 0x165667b1, 0x27d4eb2f)
  h ^= h >>> 15
  h = Math.imul(h, 0x2c1b3c6d)
  h ^= h >>> 12
  h = Math.imul(h, 0x297a2d39)
  h ^= h >>> 15
  return (h >>> 0) / 4294967296
}

function parseRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '')
  const channel = (index: number) => parseInt(value.slice(index * 2, index * 2 + 2), 16)
  return [channel(0), channel(1), channel(2)]
}

/** 夜空里不断划过的流星：渐隐的拖尾加一颗发光的头，背后是缓缓闪烁的星点。内容放在 children 里，叠在天空之上。 */
export function ShootingStars({ className, style, children, ...props }: ShootingStarsProps) {
  const options = { ...defaults, ...props }
  const optionsRef = useRef(options)
  optionsRef.current = options

  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const area = useRef({ width: 1, height: 1, dpr: 1 })
  const lastTime = useRef(0)

  // 星点位置固定（归一化坐标），数量变化只是多画或少画几颗。
  const dots = useMemo(
    () =>
      Array.from({ length: 400 }, (_, index) => ({
        x: hash(index, 1, 11),
        y: hash(index, 2, 11) ** 1.3,
        r: 0.4 + hash(index, 3, 11) * 0.9,
        alpha: 0.25 + hash(index, 4, 11) * 0.6,
        rate: 0.4 + hash(index, 5, 11) * 0.9,
        phase: hash(index, 6, 11) * Math.PI * 2,
      })),
    [],
  )

  const draw = (time: number) => {
    lastTime.current = time
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const o = optionsRef.current
    const { width: pw, height: ph, dpr } = area.current
    const width = pw / dpr
    const height = ph / dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)

    // 星点：数量按画面面积折算，大屏不会显得稀疏。
    const visible = Math.min(dots.length, Math.round((o.stars * width * height) / (1280 * 720)))
    for (let index = 0; index < visible; index++) {
      const dot = dots[index]!
      const twinkle = 0.55 + 0.45 * Math.sin(time * dot.rate + dot.phase)
      ctx.globalAlpha = dot.alpha * twinkle
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(dot.x * width, dot.y * height, dot.r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    const palette = o.colors.map(parseRgb)
    const diagonal = Math.hypot(width, height)
    // 画面越小，拖尾按比例缩短，窄屏也不会满屏都是线。
    const lengthScale = Math.min(1, Math.max(0.55, width / 900))

    for (let index = 0; index < o.count; index++) {
      const period = 3 + hash(index, 0, 1) * 4.5
      const progress = time / period + hash(index, 0, 2)
      const round = Math.floor(progress)
      const phase = progress - round
      // 每一轮只有前 40% 的时间在划过，其余时间是安静的间隔。
      const travel = phase / 0.4
      if (travel >= 1) continue

      const seed = (salt: number) => hash(index, round, salt)
      const angle = ((o.angle + (seed(3) - 0.5) * 10) * Math.PI) / 180
      const dx = Math.cos(angle)
      const dy = Math.sin(angle)
      const length = o.length * lengthScale * (0.55 + seed(4) * 0.8)
      const distance = diagonal * (0.35 + seed(5) * 0.3)
      const startX = width * (-0.05 + seed(6) * 0.85)
      const startY = height * (-0.05 + seed(7) * 0.5)
      const eased = 1 - (1 - travel) ** 2.2
      const headX = startX + dx * distance * eased
      const headY = startY + dy * distance * eased
      const alpha = Math.min(travel / 0.12, 1) * Math.min((1 - travel) / 0.3, 1)
      const [r, g, b] = palette[Math.floor(seed(8) * palette.length) % palette.length]!
      const lineWidth = 1 + seed(9) * 1.3

      const gradient = ctx.createLinearGradient(headX - dx * length, headY - dy * length, headX, headY)
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`)
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${alpha})`)
      ctx.strokeStyle = gradient
      ctx.lineWidth = lineWidth
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(headX - dx * length, headY - dy * length)
      ctx.lineTo(headX, headY)
      ctx.stroke()

      const glowRadius = Math.max(5, lineWidth * 4)
      const glow = ctx.createRadialGradient(headX, headY, 0, headX, headY, glowRadius)
      glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.85})`)
      glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(headX, headY, glowRadius, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
      ctx.beginPath()
      ctx.arc(headX, headY, Math.max(1.1, lineWidth * 0.8), 0, Math.PI * 2)
      ctx.fill()
    }
  }
  const drawRef = useRef(draw)
  drawRef.current = draw

  useCanvasSize(canvasRef, {
    maxDpr: 2,
    onResize: (size) => {
      area.current = size
      drawRef.current(lastTime.current)
    },
  })

  // 颜色等参数变化时，减少动态效果下也要立刻重画。调色板按内容比较：每次渲染都是新数组。
  const colorKey = options.colors.join()
  useEffect(() => {
    drawRef.current(lastTime.current)
  }, [colorKey, options.count, options.length, options.angle, options.stars])

  useFrameLoop(hostRef, ({ time }) => draw(time), { speed: options.speed, reducedMotion: 'static', staticTime: 3.2 })

  return (
    <div ref={hostRef} className={cn('relative overflow-hidden', className)} style={{ ...style, background: `radial-gradient(70% 45% at 50% 108%, ${options.glowColor}55, transparent 70%), linear-gradient(to bottom, ${options.skyTop}, ${options.skyBottom})` }}>
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 block size-full" />
      <div className="relative size-full">{children}</div>
    </div>
  )
}
