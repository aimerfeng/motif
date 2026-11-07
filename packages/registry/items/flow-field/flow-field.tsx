// SPDX-License-Identifier: MIT
// Copyright (c) 2025 kokonutUI
// Source: https://github.com/kokonut-labs/kokonutui/blob/83eec6d/components/kokonutui/flow-field.tsx
// Modified by Motif; see the item's provenance.
import { cn, useCanvasSize, useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  count: 1500,
  scale: 1,
  colors: ['#4ade80', '#22d3ee', '#818cf8', '#e879f9'],
  background: '#050508',
  size: 1.5,
  trail: 0.6,
  vignette: 0.75,
  speed: 1,
}
/* @motif:end */

export type FlowFieldProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 固定的模拟步长（秒）：上游每帧推进一步，这里固定 60 Hz，刷新率不同看起来也一样。 */
const STEP = 1 / 60
/** 每帧最多补几步，标签页切回来时不会一下子算太多。 */
const MAX_STEPS = 16
/** 尾迹点数的上限（trail = 1 时）。 */
const MAX_POINTS = 24
/**
 * 线段按颜色和透明度分桶，同一桶合成一条路径一次描边。桶要少：Canvas 对每次描边的大路径
 * 都要按整张画布处理一遍，上百次描边在 1280×800 上就掉到 40 帧左右，24 次则稳定 60 帧。
 */
const TONES = 8
/** 尾迹按新旧分三段，越旧越淡。 */
const AGE_ALPHA = [1, 0.5, 0.2]
/** 每段的透明度（尾迹新旧 × 寿命淡入淡出）就近归到这三档。 */
const ALPHA_LEVELS = [0.24, 0.52, 0.92]
const SEED = 0xf10e

interface Field {
  count: number
  width: number
  height: number
  /** 已经模拟的步数，也是流场的时间（上游的 time）。 */
  tick: number
  x: Float32Array
  y: Float32Array
  /** 每步前进的像素数。 */
  speed: Float32Array
  /** 在配色里的基础位置（0–1）。 */
  tone: Float32Array
  /** 最近一步的流向（弧度），颜色随它偏移。 */
  angle: Float32Array
  life: Float32Array
  maxLife: Float32Array
  /** 尾迹点的环形缓冲，每个粒子 MAX_POINTS 个点。 */
  trailX: Float32Array
  trailY: Float32Array
  /** 最新一个尾迹点的位置。 */
  head: Uint8Array
  /** 有效尾迹点的个数。 */
  filled: Uint8Array
}

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

/** 上游的流场：几层正弦、余弦叠加，得到随时间连续变化的角度。scale 越大，涡旋越密。 */
function fieldAngle(x: number, y: number, t: number, scale: number): number {
  const s = 0.0025 * scale
  return (
    Math.sin(x * s + t * 0.0007) * Math.PI +
    Math.cos(y * s + t * 0.0005) * Math.PI +
    Math.sin((x + y) * s * 0.6 + t * 0.0009) * Math.PI * 0.6 +
    Math.cos((x - y) * s * 0.4 + t * 0.0006) * Math.PI * 0.4
  )
}

function parseHex(hex: string): [number, number, number] {
  const value = hex.replace('#', '')
  return [0, 1, 2].map((index) => parseInt(value.slice(index * 2, index * 2 + 2), 16)) as [number, number, number]
}

/** 把配色线性插值成 TONES 个 rgb 字符串。 */
function toneTable(colors: string[]): string[] {
  const palette = (colors.length > 0 ? colors : ['#ffffff']).map(parseHex)
  return Array.from({ length: TONES }, (_, index) => {
    const position = (index / (TONES - 1)) * (palette.length - 1)
    const from = Math.min(palette.length - 1, Math.floor(position))
    const to = Math.min(palette.length - 1, from + 1)
    const mix = position - from
    const rgb = [0, 1, 2].map((channel) => Math.round(palette[from]![channel]! + (palette[to]![channel]! - palette[from]![channel]!) * mix))
    return `rgb(${rgb.join(', ')})`
  })
}

/** #rrggbb 加透明度。 */
function withAlpha(hex: string, alpha: number): string {
  return `rgb(${parseHex(hex).join(' ')} / ${alpha.toFixed(3)})`
}

/** 上千个光点顺着缓慢变化的流场漂流、拖出发光的尾迹。尺寸由 className 决定，children 叠在流场之上。 */
export function FlowField({ className, style, children, ...props }: FlowFieldProps) {
  const options = { ...defaults, ...props }
  const optionsRef = useRef(options)
  optionsRef.current = options

  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const field = useRef<Field | null>(null)
  const random = useRef(createRandom(SEED))
  const accumulator = useRef(0)
  const tones = useRef<string[]>(toneTable(options.colors))
  const size = useCanvasSize(canvasRef, { maxDpr: 1.5, onResize: () => resetRef.current() })

  const trailPoints = () => Math.round(4 + Math.min(1, Math.max(0, optionsRef.current.trail)) * (MAX_POINTS - 4))

  const clearTrail = (f: Field, index: number) => {
    f.head[index] = 0
    f.filled[index] = 1
    f.trailX[index * MAX_POINTS] = f.x[index]!
    f.trailY[index * MAX_POINTS] = f.y[index]!
  }

  const respawn = (f: Field, index: number, initial: boolean) => {
    const rand = random.current
    f.x[index] = rand() * f.width
    f.y[index] = rand() * f.height
    f.tone[index] = rand()
    if (initial) {
      f.maxLife[index] = 200 + Math.floor(rand() * 300)
      f.life[index] = Math.floor(rand() * f.maxLife[index]!)
      f.speed[index] = 1.1 + rand() * 1.8
    } else {
      f.life[index] = 0
    }
    clearTrail(f, index)
  }

  /** 推进一个固定步长：沿流向移动、到寿命重生、出界从另一侧进来（尾迹在这里断开）。 */
  const simulate = (f: Field) => {
    const scale = optionsRef.current.scale
    for (let index = 0; index < f.count; index++) {
      const angle = fieldAngle(f.x[index]!, f.y[index]!, f.tick, scale)
      f.angle[index] = angle
      let x = f.x[index]! + Math.cos(angle) * f.speed[index]!
      let y = f.y[index]! + Math.sin(angle) * f.speed[index]!
      const life = f.life[index]! + 1
      f.life[index] = life
      if (life > f.maxLife[index]!) {
        respawn(f, index, false)
        continue
      }
      const wrapped = x < 0 || x > f.width || y < 0 || y > f.height
      if (x < 0) x += f.width
      else if (x > f.width) x -= f.width
      if (y < 0) y += f.height
      else if (y > f.height) y -= f.height
      f.x[index] = x
      f.y[index] = y
      if (wrapped) {
        clearTrail(f, index)
      } else {
        const head = (f.head[index]! + 1) % MAX_POINTS
        f.head[index] = head
        f.trailX[index * MAX_POINTS + head] = x
        f.trailY[index * MAX_POINTS + head] = y
        f.filled[index] = Math.min(MAX_POINTS, f.filled[index]! + 1)
      }
    }
    f.tick += 1
  }

  const draw = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const f = field.current
    if (!canvas || !ctx || !f) return
    const o = optionsRef.current
    const { dpr } = size.current
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.lineWidth = o.size
    ctx.lineCap = 'butt'

    const points = trailPoints()
    // paths[色调 × 透明度档]：同样颜色、同样透明度的线段一起描边。
    const paths: (Path2D | undefined)[] = []
    for (let index = 0; index < f.count; index++) {
      const n = Math.min(points, f.filled[index]!)
      if (n < 2) continue
      // 寿命的淡入（前 1/8）和淡出（后 1/6），沿用上游。
      const progress = f.life[index]! / f.maxLife[index]!
      const fade = Math.min(progress * 8, 1) * Math.min((1 - progress) * 6, 1)
      if (fade <= 0.05) continue
      // 颜色随流向偏移（上游是色相偏移 70°），在配色里来回折返，不会突然跳色。
      const shifted = f.tone[index]! + (f.angle[index]! / (Math.PI * 2)) * 0.3
      const folded = ((shifted % 2) + 2) % 2
      const tone = Math.min(TONES - 1, Math.floor((folded > 1 ? 2 - folded : folded) * TONES))
      const base = index * MAX_POINTS
      const head = f.head[index]!
      // 尾迹很短、弯得很缓，每段用一条直线就够了：从最新的点往回，每段一条线，段与段首尾相接。
      let fromX = f.trailX[base + head]!
      let fromY = f.trailY[base + head]!
      for (let group = 0; group < AGE_ALPHA.length; group++) {
        const k = Math.round(((group + 1) / AGE_ALPHA.length) * (n - 1))
        const slot = base + ((head - k + MAX_POINTS) % MAX_POINTS)
        const toX = f.trailX[slot]!
        const toY = f.trailY[slot]!
        const alpha = AGE_ALPHA[group]! * fade
        if (alpha >= 0.08) {
          const level = alpha < 0.32 ? 0 : alpha < 0.65 ? 1 : 2
          const path = (paths[tone * ALPHA_LEVELS.length + level] ??= new Path2D())
          path.moveTo(fromX, fromY)
          path.lineTo(toX, toY)
        }
        fromX = toX
        fromY = toY
      }
    }

    const table = tones.current
    paths.forEach((path, bucket) => {
      if (!path) return
      ctx.globalAlpha = ALPHA_LEVELS[bucket % ALPHA_LEVELS.length]!
      ctx.strokeStyle = table[Math.floor(bucket / ALPHA_LEVELS.length)]!
      ctx.stroke(path)
    })
    ctx.globalAlpha = 1
  }

  /** 按当前尺寸重新播种，并预先跑满一条尾迹的步数：第一帧（以及减少动态效果时唯一的一帧）就有完整的尾迹。 */
  const reset = () => {
    const { width, height, dpr } = size.current
    const count = Math.max(1, Math.round(optionsRef.current.count))
    random.current = createRandom(SEED)
    const f: Field = {
      count,
      width: width / dpr,
      height: height / dpr,
      tick: 0,
      x: new Float32Array(count),
      y: new Float32Array(count),
      speed: new Float32Array(count),
      tone: new Float32Array(count),
      angle: new Float32Array(count),
      life: new Float32Array(count),
      maxLife: new Float32Array(count),
      trailX: new Float32Array(count * MAX_POINTS),
      trailY: new Float32Array(count * MAX_POINTS),
      head: new Uint8Array(count),
      filled: new Uint8Array(count),
    }
    for (let index = 0; index < count; index++) respawn(f, index, true)
    for (let step = 0; step < MAX_POINTS; step++) simulate(f)
    field.current = f
    accumulator.current = 0
    draw()
  }
  const resetRef = useRef(reset)
  resetRef.current = reset
  const drawRef = useRef(draw)
  drawRef.current = draw

  useEffect(() => resetRef.current(), [options.count])
  useEffect(() => {
    tones.current = toneTable(options.colors)
    drawRef.current()
  }, [options.colors])
  useEffect(() => drawRef.current(), [options.size, options.trail])

  useFrameLoop(
    hostRef,
    ({ delta }) => {
      const f = field.current
      if (!f) return
      accumulator.current += delta
      let steps = 0
      while (accumulator.current >= STEP && steps < MAX_STEPS) {
        simulate(f)
        accumulator.current -= STEP
        steps++
      }
      if (steps === MAX_STEPS) accumulator.current = 0
      if (steps > 0) draw()
    },
    { speed: options.speed, reducedMotion: 'static', staticTime: 0 },
  )

  const { background, vignette } = options
  return (
    <div ref={hostRef} className={cn('relative isolate overflow-hidden', className)} style={{ background, ...style }}>
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 block size-full" />
      {vignette > 0 && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: [
              `linear-gradient(to bottom, ${withAlpha(background, vignette)}, transparent 160px)`,
              `linear-gradient(to top, ${withAlpha(background, vignette)}, transparent 160px)`,
              `radial-gradient(ellipse 65% 60% at 50% 50%, transparent 20%, ${withAlpha(background, 0.92 * vignette)} 100%)`,
            ].join(', '),
          }}
        />
      )}
      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  )
}
