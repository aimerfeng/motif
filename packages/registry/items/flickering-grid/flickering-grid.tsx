// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/flickering-grid.tsx
// Modified by Motif; see the item's provenance.
import { cn, useCanvasSize, useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  squareSize: 4,
  gap: 6,
  shape: 'square',
  color: '#c3cde0',
  accentColor: '#7dd3fc',
  accentShare: 0.04,
  maxOpacity: 0.6,
  fade: 0.6,
  flickerRate: 0.4,
}
/* @motif:end */

export type FlickeringGridProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

interface Grid {
  cols: number
  rows: number
  /** 方格之间的步长（CSS 像素）。 */
  pitch: number
  /** 让整张网格居中的偏移（CSS 像素），两侧被裁掉的半格一样宽。 */
  offsetX: number
  offsetY: number
  /** 每格当前的随机数（0–1），绘制时经 brightness 换算成亮度再乘 maxOpacity。 */
  levels: Float32Array
}

const SEED = 0x5eed

/** 可复现的伪随机数（mulberry32）。 */
function createRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 每格固定的 0–1 哈希：强调色占比变化时只增减强调格，不打乱其余方格。 */
function cellHash(index: number): number {
  const value = Math.sin(index * 12.9898 + 78.233) * 43758.5453
  return value - Math.floor(value)
}

/**
 * 随机数到亮度的映射：普通方格大多停在一层淡淡的底色上，只有少数亮起，网格的结构始终看得见；
 * 强调格总是偏亮，像亮着的指示灯。
 */
function brightness(roll: number, accent: boolean): number {
  return accent ? 0.5 + 0.5 * roll : 0.12 + 0.88 * roll * roll * roll
}

/** 一面随机明灭的方格墙。指针事件穿透，尺寸由 className 决定（如 absolute inset-0），children 叠在网格之上。 */
export function FlickeringGrid({ className, style, children, ...props }: FlickeringGridProps) {
  const options = { ...defaults, ...props }
  const optionsRef = useRef(options)
  optionsRef.current = options

  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const grid = useRef<Grid>({ cols: 0, rows: 0, pitch: 1, offsetX: 0, offsetY: 0, levels: new Float32Array(0) })
  const random = useRef(createRandom(SEED))
  // 尺寸变化时重新排布（rebuildRef 在下面赋值，回调执行时已经就绪）。
  const size = useCanvasSize(canvasRef, { maxDpr: 2, onResize: () => rebuildRef.current() })

  const drawCell = (ctx: CanvasRenderingContext2D, index: number, dpr: number) => {
    const g = grid.current
    const o = optionsRef.current
    const col = index % g.cols
    const row = (index - col) / g.cols
    // 先按 CSS 像素定位再换算成设备像素取整：每格大小一致，边缘不会糊。
    const x = Math.round((g.offsetX + col * g.pitch) * dpr)
    const y = Math.round((g.offsetY + row * g.pitch) * dpr)
    const size = Math.max(1, Math.round(o.squareSize * dpr))
    const accent = cellHash(index) < o.accentShare
    ctx.clearRect(x, y, size, size)
    ctx.globalAlpha = brightness(g.levels[index]!, accent) * o.maxOpacity
    ctx.fillStyle = accent ? o.accentColor : o.color
    if (o.shape === 'round') {
      ctx.beginPath()
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.fillRect(x, y, size, size)
    }
  }

  const drawAll = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const { dpr } = size.current
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalAlpha = 1
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const count = grid.current.cols * grid.current.rows
    for (let index = 0; index < count; index++) drawCell(ctx, index, dpr)
  }

  /** 按当前尺寸和格子大小重新排布网格，亮度从种子重新生成。 */
  const rebuild = () => {
    const { width, height, dpr } = size.current
    const o = optionsRef.current
    const pitch = Math.max(1, o.squareSize + o.gap)
    const cssWidth = width / dpr
    const cssHeight = height / dpr
    // 多铺一圈再居中，画面边缘总是被方格铺满。
    const cols = Math.ceil(cssWidth / pitch) + 1
    const rows = Math.ceil(cssHeight / pitch) + 1
    const rand = createRandom(SEED)
    const levels = new Float32Array(cols * rows)
    for (let index = 0; index < levels.length; index++) levels[index] = rand()
    random.current = rand
    grid.current = {
      cols,
      rows,
      pitch,
      offsetX: (cssWidth - (cols * pitch - o.gap)) / 2,
      offsetY: (cssHeight - (rows * pitch - o.gap)) / 2,
      levels,
    }
    drawAll()
  }
  const rebuildRef = useRef(rebuild)
  rebuildRef.current = rebuild
  const drawAllRef = useRef(drawAll)
  drawAllRef.current = drawAll

  // 几何变了要重新排布；只是颜色、亮度、形状变了就整张重画一次。
  useEffect(() => rebuildRef.current(), [options.squareSize, options.gap])
  useEffect(() => drawAllRef.current(), [options.color, options.accentColor, options.accentShare, options.maxOpacity, options.shape])

  // 每帧只重画亮度变了的方格：每格每秒有 flickerRate 的概率换一个新亮度。
  const step = (delta: number) => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx || delta <= 0) return
    const g = grid.current
    const chance = optionsRef.current.flickerRate * delta
    const rand = random.current
    const { dpr } = size.current
    for (let index = 0; index < g.levels.length; index++) {
      if (rand() < chance) {
        g.levels[index] = rand()
        drawCell(ctx, index, dpr)
      }
    }
  }

  useFrameLoop(hostRef, ({ delta }) => step(delta), { reducedMotion: 'static', staticTime: 0 })

  // 径向遮罩：fade 越大，四周越早开始变暗、边缘越透明。
  const mask =
    options.fade > 0
      ? `radial-gradient(ellipse 50% 50% at 50% 50%, #000 ${Math.round((1 - options.fade) * 100)}%, rgb(0 0 0 / ${(1 - options.fade).toFixed(2)}) 100%)`
      : undefined

  return (
    <div ref={hostRef} className={cn('relative isolate overflow-hidden', className)} style={style}>
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 block size-full" style={{ maskImage: mask, WebkitMaskImage: mask }} />
      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  )
}
