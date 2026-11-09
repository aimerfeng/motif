import { cn, useCanvasSize, useFrameLoop } from '@/lib/motif-runtime'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  lines: 56,
  amplitude: 0.62,
  sharpness: 0.6,
  centerWeight: 0.8,
  perspective: 0.35,
  scroll: 1.2,
  lineWidth: 1.4,
  ink: '#f2eee6',
  background: '#0b0b0d',
}
/* @motif:end */

export type RidgelineTerrainProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 地形缓存的横向分辨率：每个世界单位（约半个画面高）多少个采样。 */
const RES = 96
/** 透视最强时远处一行比近处窄多少倍减一：z(t) = 1 + k·t，k 最大为它。 */
const MAX_DEPTH = 2.4
/** 远处最后这一段深度里线条渐渐隐入背景；近处一行在这个深度以下压平、淡出。进出画面都没有跳变。 */
const FAR_FADE = 0.32
const NEAR_FADE = 0.06
/** 起始的地形位置：挑一段峰形好看的区域，海报和第一帧都从这里开始。 */
const START_ROW = 37
const SEED = 0x51d6e

/** 可复现的伪随机数（mulberry32），只用来打乱梯度噪声的排列表。 */
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

const PERM = (() => {
  const random = createRandom(SEED)
  const table = Array.from({ length: 256 }, (_, index) => index)
  for (let index = 255; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1))
    ;[table[index], table[swap]] = [table[swap]!, table[index]!]
  }
  const perm = new Uint8Array(512)
  for (let index = 0; index < 512; index++) perm[index] = table[index & 255]!
  return perm
})()

/** 二维梯度噪声，输出大致在 [-1, 1]。 */
function noise(x: number, y: number): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const fx = x - xi
  const fy = y - yi
  const ix = xi & 255
  const iy = yi & 255
  const u = fx * fx * fx * (fx * (fx * 6 - 15) + 10)
  const v = fy * fy * fy * (fy * (fy * 6 - 15) + 10)
  const grad = (hash: number, dx: number, dy: number) => {
    switch (hash & 7) {
      case 0:
        return dx + dy
      case 1:
        return dx - dy
      case 2:
        return -dx + dy
      case 3:
        return -dx - dy
      case 4:
        return dx * 1.4142
      case 5:
        return -dx * 1.4142
      case 6:
        return dy * 1.4142
      default:
        return -dy * 1.4142
    }
  }
  const a = PERM[PERM[ix]! + iy]!
  const b = PERM[PERM[ix + 1]! + iy]!
  const c = PERM[PERM[ix]! + iy + 1]!
  const d = PERM[PERM[ix + 1]! + iy + 1]!
  const top = grad(a, fx, fy) + u * (grad(b, fx - 1, fy) - grad(a, fx, fy))
  const bottom = grad(c, fx, fy - 1) + u * (grad(d, fx - 1, fy - 1) - grad(c, fx, fy - 1))
  return (top + v * (bottom - top)) * 0.7
}

/**
 * 一行地形（世界里固定的一条剖面）。拆成低频、高频和细碎抖动三层分开缓存，
 * 「锐度」在绘制时才把它们组合起来，改参数不用重算噪声。
 */
interface Row {
  low: Float32Array
  high: Float32Array
  jitter: Float32Array
  /** 这一行的山峰中心（世界坐标），让中间的峰带缓慢地左右蜿蜒。 */
  center: number
}

interface Layout {
  width: number
  height: number
  /** 一个世界单位对应的像素数（近处一行）。 */
  unit: number
  /** 缓存覆盖的世界坐标半宽：透视最强时最远一行也能铺满画面。 */
  extent: number
  samples: number
}

function computeRow(world: number, layout: Layout): Row {
  const { extent, samples } = layout
  const low = new Float32Array(samples)
  const high = new Float32Array(samples)
  const jitter = new Float32Array(samples)
  // 行与行之间相距 0.085 个噪声单位：相邻几行的峰形连贯，看起来是一块地形而不是一堆随机折线。
  const z = world * 0.085
  for (let index = 0; index < samples; index++) {
    const x = -extent + index / RES
    low[index] = noise(x * 1.6, z) + 0.5 * noise(x * 3.3 + 17.1, z * 1.9 + 4.2)
    high[index] = 0.5 * noise(x * 7.1 - 3.3, z * 3.1 + 9.7) + 0.25 * noise(x * 14.3 + 8.8, z * 5.3 - 2.1)
    jitter[index] = noise(x * 34 + 1.7, world * 0.61)
  }
  return { low, high, jitter, center: 0.16 * noise(world * 0.035, 7.31) }
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

/** 平滑的 min：两值接近时圆滑过渡，结果永远不大于 min(a, b)。 */
function softMin(a: number, b: number, k: number): number {
  if (k <= 0) return Math.min(a, b)
  const d = Math.max(k - Math.abs(a - b), 0) / k
  return Math.min(a, b) - d * d * k * 0.25
}

/**
 * 几十条叠起来的山脊线，前面的线挡住后面的线（消隐线），中间峰高、两侧平缓，
 * 整片地形缓缓朝观者移来。尺寸由 className 决定，children 叠在地形之上。
 */
export function RidgelineTerrain({ className, style, children, ...props }: RidgelineTerrainProps) {
  const options = { ...defaults, ...props }
  const optionsRef = useRef(options)
  optionsRef.current = options

  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rows = useRef(new Map<number, Row>())
  const layout = useRef<Layout | null>(null)
  /** 镜头位置（行）：每过一行，最近的一条线滑出画面底部，最远处淡入一条新的。 */
  const position = useRef(START_ROW)
  const ys = useRef(new Float32Array(0))
  const horizon = useRef(new Float32Array(0))

  const size = useCanvasSize(canvasRef, {
    maxDpr: 2,
    onResize: () => {
      const { width, height, dpr } = size.current
      const w = width / dpr
      const h = height / dpr
      // 横屏时画面宽两个单位；竖屏（手机）时少看一些世界宽度，中间的山不会被挤成细针。
      const unit = Math.max(1, Math.min(h * 0.8, Math.max(w / 2, h * 0.32)))
      const extent = (w / 2 / unit) * (1 + MAX_DEPTH) + 0.08
      layout.current = { width: w, height: h, unit, extent, samples: Math.ceil(extent * 2 * RES) + 2 }
      rows.current.clear()
      drawRef.current()
    },
  })

  const draw = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const view = layout.current
    if (!canvas || !ctx || !view) return
    const o = optionsRef.current
    const { dpr } = size.current
    const { width: w, height: h, unit, extent, samples } = view

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    // 细线上看不出接头的差别；斜切接头最省，也不会像尖角接头那样在尖峰上冒出长刺。
    ctx.lineJoin = 'bevel'
    ctx.lineCap = 'butt'
    ctx.strokeStyle = o.ink

    const count = Math.max(8, Math.round(o.lines))
    const depth = MAX_DEPTH * Math.min(1, Math.max(0, o.perspective))
    const camera = position.current
    // 起伏按画面高度算，但不超过横向尺度的 1.6 倍：竖屏上山峰的高宽比和横屏一致。
    const amplitude = o.amplitude * Math.min(h, unit * 1.6) * 0.3
    const sharp = Math.min(1, Math.max(0, o.sharpness))
    const exponent = 1 + sharp * 3.2
    // 锐度越高峰越尖，同时把峰顶拉高一些，免得整体变矮。
    // 锐度接近 0 时额外补一点起伏和细节、压低整体抬升：圆缓的丘陵也要看得出是地形，而不是一叠横线。
    const soft = (1 - sharp) * (1 - sharp)
    const gain = 1 + sharp * 1.4 + soft * 0.55
    const highMix = 0.15 + sharp * 1.3 + soft * 0.3
    const lift = 0.5 - soft * 0.12
    const contrast = 0.62 + soft * 0.18
    // 细碎的「信号噪声」也随锐度增减：圆缓的丘陵线条干净，尖峰带一点毛刺。
    const grit = 0.004 + sharp * 0.016
    const gritPeak = 0.006 + sharp * 0.026
    const weight = Math.min(1, Math.max(0, o.centerWeight))
    const sigma = 0.34
    const far = h * 0.2
    const near = h * 1.03
    // 一行能升到的最高处（以 rowAmplitude 为单位）：shape、envelope ≤ 1，|jitter| < 1。
    const peak = gain + grit + gritPeak
    // 峰顶不越过画面顶部 5%：每行的起伏按它头顶剩下的空间封顶。
    const ceiling = h * 0.05
    // 每行横向的点数跟着画面宽度走，左右各多出一点，线条两端不会露在画面里。
    const segments = Math.max(96, Math.min(480, Math.round(w / 4)))
    const pad = 4
    const step = (w + pad * 2) / segments
    if (ys.current.length < segments + 1) {
      ys.current = new Float32Array(segments + 1)
      horizon.current = new Float32Array(segments + 1)
    }
    const y = ys.current
    const top = horizon.current
    top.fill(Number.POSITIVE_INFINITY)

    // 只保留看得见的行：滑出底部的丢掉，最远处的按需计算。
    const first = Math.floor(camera)
    for (const key of rows.current.keys()) if (key < first || key > first + count + 1) rows.current.delete(key)

    // 同样线宽、同样透明度的行合成一条路径一起描边：描边次数从几十次降到十几次。
    const batches = new Map<number, { path: Path2D; alpha: number; width: number }>()

    // 浮动地平线消隐：从近往远画，top[i] 记着这一列目前最高的线（屏幕 y 最小）；
    // 后面的行只有高出它的部分可见。不用背景色去盖，所以每行只描一次线、不用填充。
    for (let world = first; world <= first + count + 1; world++) {
      const t = (world - camera) / count
      if (t <= 0 || t > 1) continue
      let row = rows.current.get(world)
      if (!row) {
        row = computeRow(world, view)
        rows.current.set(world, row)
      }

      // 透视：z = 1 + k·t，屏幕位置按 1/z 投影；k = 0 时退化成等距排列。
      const scale = 1 / (1 + depth * t)
      const q = (1 - t) / (1 + depth * t)
      const base = far + q * (near - far)
      const rowUnit = unit * scale
      // 远处的行（透视弱时尤其明显）基线离顶部近：起伏不超过头顶的空间，平滑地封顶，所有参数下峰都在画面里。
      const room = Math.max(0, base - ceiling) / peak
      // 最近的一行在滑出底部前慢慢压平，它挡住的线一点点露出来，而不是突然出现。
      const rowAmplitude = softMin(amplitude * scale, room, room * 0.5) * smoothstep(0, NEAR_FADE, t)

      for (let index = 0; index <= segments; index++) {
        const worldX = (-pad + index * step - w / 2) / rowUnit
        const offset = Math.min(samples - 2, Math.max(0, (worldX + extent) * RES))
        const cell = Math.floor(offset)
        const mix = offset - cell
        const low = row.low[cell]! + (row.low[cell + 1]! - row.low[cell]!) * mix
        const high = row.high[cell]! + (row.high[cell + 1]! - row.high[cell]!) * mix
        const jitter = row.jitter[cell]! + (row.jitter[cell + 1]! - row.jitter[cell]!) * mix
        const shape = Math.min(1, Math.max(0, lift + (low + high * highMix) * contrast))
        const dx = worldX - row.center
        const envelope = 1 - weight + weight * Math.exp((-dx * dx) / (2 * sigma * sigma))
        const height = Math.pow(shape, exponent) * gain * envelope + jitter * (grit + gritPeak * envelope)
        y[index] = base - Math.max(0, height) * rowAmplitude
      }

      // 远处一段渐渐隐入背景（兼作空气透视），中间的行完全不透明、可以合批。
      const alpha = smoothstep(1, 1 - FAR_FADE, t) * smoothstep(0, NEAR_FADE * 0.6, t)
      if (alpha > 0.004) {
        const width = Math.round(o.lineWidth * (1 - 0.55 * (1 - scale)) * 10) / 10
        const key = alpha >= 0.999 ? width : -1 - world
        let batch = batches.get(key)
        if (!batch) {
          batch = { path: new Path2D(), alpha: Math.min(1, alpha), width }
          batches.set(key, batch)
        }
        const path = batch.path
        let drawing = false
        for (let index = 0; index < segments; index++) {
          const y0 = y[index]!
          const y1 = y[index + 1]!
          const d0 = y0 - top[index]!
          const d1 = y1 - top[index + 1]!
          const x0 = -pad + index * step
          if (d0 < 0 && d1 < 0) {
            if (!drawing) path.moveTo(x0, y0)
            path.lineTo(x0 + step, y1)
            drawing = true
          } else if (d0 < 0 || d1 < 0) {
            // 这一段和地平线相交：只画露在上面的那一截。
            const s = d0 / (d0 - d1)
            const xm = x0 + step * s
            const ym = y0 + (y1 - y0) * s
            if (d0 < 0) {
              if (!drawing) path.moveTo(x0, y0)
              path.lineTo(xm, ym)
              drawing = false
            } else {
              path.moveTo(xm, ym)
              path.lineTo(x0 + step, y1)
              drawing = true
            }
          } else {
            drawing = false
          }
        }
      }
      for (let index = 0; index <= segments; index++) if (y[index]! < top[index]!) top[index] = y[index]!
    }

    for (const batch of batches.values()) {
      ctx.globalAlpha = batch.alpha
      ctx.lineWidth = batch.width
      ctx.stroke(batch.path)
    }
    ctx.globalAlpha = 1
  }
  const drawRef = useRef(draw)
  drawRef.current = draw

  useEffect(
    () => drawRef.current(),
    [options.lines, options.amplitude, options.sharpness, options.centerWeight, options.lineWidth, options.ink, options.background, options.perspective],
  )

  useFrameLoop(
    hostRef,
    ({ time }) => {
      const next = START_ROW + time
      if (next === position.current && rows.current.size > 0) return
      position.current = next
      drawRef.current()
    },
    { speed: options.scroll, reducedMotion: 'static', staticTime: 0 },
  )

  return (
    <div ref={hostRef} className={cn('relative isolate overflow-hidden', className)} style={{ background: options.background, ...style }}>
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 block size-full" />
      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  )
}
