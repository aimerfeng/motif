import { cn, useFrameLoop } from '@/lib/motif-runtime'
import { useMemo, useRef, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  set: 'organic',
  colors: ['#ff5a36', '#ffb23e'],
  background: '#f6efe4',
  layers: 4,
  size: 56,
  morph: 1.3,
  hold: 0.9,
  ease: [0.7, 0, 0.2, 1],
  spin: 8,
}
/* @motif:end */

export type ShapeMorphProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

const TAU = Math.PI * 2
const SAMPLES = 96
/** 每一层比前一层晚多少秒跟上：拖尾的长度。 */
const LAG = 0.09

/**
 * 每个形状都是「角度 → 半径」的函数。所有形状在同一组角度上采样，
 * 变形就是逐点插值半径：顶点天然一一对应，不会出现乱跳的拓扑。
 */
const SHAPES: Record<string, (angle: number) => number> = {
  circle: () => 1,
  blob: (a) => 1 + 0.12 * Math.sin(3 * a + 0.6) + 0.07 * Math.sin(5 * a + 1.9),
  pebble: (a) => 1 + 0.16 * Math.cos(2 * a + 0.4) + 0.05 * Math.sin(3 * a),
  flower: (a) => 0.84 + 0.18 * Math.cos(6 * a),
  star: (a) => {
    const t = ((((a + Math.PI / 2) * 5) / TAU) % 1 + 1) % 1
    return 0.56 + 0.44 * Math.abs(t - 0.5) ** 1.4 * 2 ** 1.4
  },
  squircle: (a) => (Math.abs(Math.cos(a)) ** 4 + Math.abs(Math.sin(a)) ** 4) ** -0.25,
  triangle: (a) => {
    // 正三角形的极坐标形式再和圆混一点，把尖角磨圆。
    const sector = TAU / 3
    const local = ((((a + Math.PI / 2) % sector) + sector) % sector) - sector / 2
    return 0.82 * (0.5 / Math.cos(local)) + 0.18 * 0.62
  },
  burst: (a) => 0.9 + 0.1 * Math.tanh(4 * Math.sin(9 * a)),
}

const SETS: Record<string, string[]> = {
  organic: ['blob', 'flower', 'circle', 'pebble'],
  geometric: ['squircle', 'triangle', 'star', 'circle'],
  playful: ['star', 'flower', 'burst', 'blob'],
}

/** 采样一个形状，并按均方根半径归一化：不同形状看起来一样大。 */
function sample(shape: (angle: number) => number): Float64Array {
  const radii = new Float64Array(SAMPLES)
  let sum = 0
  for (let i = 0; i < SAMPLES; i++) {
    radii[i] = shape((i / SAMPLES) * TAU)
    sum += radii[i]! ** 2
  }
  const rms = Math.sqrt(sum / SAMPLES)
  for (let i = 0; i < SAMPLES; i++) radii[i]! /= rms
  return radii
}

/** CSS cubic-bezier(x1, y1, x2, y2)：先用牛顿法由 x 求参数 t，再算 y。 */
function bezier([x1, y1, x2, y2]: readonly number[]): (x: number) => number {
  const cx = 3 * x1!
  const bx = 3 * (x2! - x1!) - cx
  const ax = 1 - cx - bx
  const cy = 3 * y1!
  const by = 3 * (y2! - y1!) - cy
  const ay = 1 - cy - by
  const curveX = (t: number) => ((ax * t + bx) * t + cx) * t
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx
  return (x) => {
    if (x <= 0) return 0
    if (x >= 1) return 1
    let t = x
    for (let i = 0; i < 8; i++) {
      const slope = slopeX(t)
      if (Math.abs(slope) < 1e-6) break
      t -= (curveX(t) - x) / slope
    }
    t = Math.min(Math.max(t, 0), 1)
    return ((ay * t + by) * t + cy) * t
  }
}

/** 闭合的 Catmull-Rom 曲线换算成三次贝塞尔，得到光滑的 SVG 路径。 */
function smoothPath(xs: Float64Array, ys: Float64Array): string {
  const n = xs.length
  const at = (i: number) => ((i % n) + n) % n
  let d = `M${xs[0]!.toFixed(2)} ${ys[0]!.toFixed(2)}`
  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1)
    const p1 = at(i)
    const p2 = at(i + 1)
    const p3 = at(i + 2)
    const c1x = xs[p1]! + (xs[p2]! - xs[p0]!) / 6
    const c1y = ys[p1]! + (ys[p2]! - ys[p0]!) / 6
    const c2x = xs[p2]! - (xs[p3]! - xs[p1]!) / 6
    const c2y = ys[p2]! - (ys[p3]! - ys[p1]!) / 6
    d += `C${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${xs[p2]!.toFixed(2)} ${ys[p2]!.toFixed(2)}`
  }
  return `${d}Z`
}

function mix(a: string, b: string, t: number): string {
  const parse = (hex: string) => [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16))
  const [ra, ga, ba] = parse(a)
  const [rb, gb, bb] = parse(b)
  const channel = (x: number, y: number) => Math.round(x + (y - x) * t)
  return `rgb(${channel(ra!, rb!)} ${channel(ga!, gb!)} ${channel(ba!, bb!)})`
}

/** 调色板上第 t（0–1）处的颜色。 */
function paletteAt(colors: readonly string[], t: number): string {
  if (colors.length === 1) return colors[0]!
  const scaled = t * (colors.length - 1)
  const index = Math.min(Math.floor(scaled), colors.length - 2)
  return mix(colors[index]!, colors[index + 1]!, scaled - index)
}

/**
 * 一组形状轮流变身，多层错开跟随形成拖尾。
 * 每帧只改 SVG 路径的 d 属性和旋转，不触发 React 重渲染；开启「减少动态效果」时停在一个形状上。
 */
export function ShapeMorph({ className, style, children, ...props }: ShapeMorphProps) {
  const options = { ...defaults, ...props }
  const { set, colors, background, layers, size, morph, hold, ease, spin } = options
  const host = useRef<HTMLDivElement>(null)
  const paths = useRef<(SVGPathElement | null)[]>([])

  const shapes = useMemo(() => (SETS[set] ?? SETS.organic!).map((name) => sample(SHAPES[name]!)), [set])
  const easing = useMemo(() => bezier(ease), [ease])
  const count = Math.round(layers)
  const buffers = useMemo(() => ({ xs: new Float64Array(SAMPLES), ys: new Float64Array(SAMPLES) }), [])

  useFrameLoop(
    host,
    ({ time }) => {
      const segment = morph + hold
      const radius = size * 0.9
      for (let layer = 0; layer < count; layer++) {
        const path = paths.current[layer]
        if (!path) continue
        const t = Math.max(time - layer * LAG, 0)
        const index = Math.floor(t / segment)
        const from = shapes[index % shapes.length]!
        const to = shapes[(index + 1) % shapes.length]!
        const progress = easing(Math.min((t - index * segment) / morph, 1))
        const rotation = ((t * spin) / 180) * Math.PI
        const scale = radius * (1 + layer * 0.07)
        for (let i = 0; i < SAMPLES; i++) {
          const r = (from[i]! + (to[i]! - from[i]!) * progress) * scale
          const angle = (i / SAMPLES) * TAU + rotation
          buffers.xs[i] = 100 + Math.cos(angle) * r
          buffers.ys[i] = 100 + Math.sin(angle) * r
        }
        path.setAttribute('d', smoothPath(buffers.xs, buffers.ys))
      }
    },
    // 减少动态效果时停在第二个形状的停留中间。
    { reducedMotion: 'static', staticTime: morph * 2 + hold * 1.5 },
  )

  return (
    <div ref={host} className={cn('relative isolate grid place-items-center overflow-hidden', className)} style={{ background, ...style }}>
      <svg viewBox="0 0 200 200" className="absolute inset-0 m-auto size-full max-h-full max-w-full" aria-hidden>
        {Array.from({ length: count }, (_, index) => count - 1 - index).map((layer) => (
          <path
            key={layer}
            ref={(element) => {
              paths.current[layer] = element
            }}
            fill={paletteAt(colors, count === 1 ? 0 : layer / (count - 1))}
            fillOpacity={1 - (layer / Math.max(count, 2)) * 0.75}
          />
        ))}
      </svg>
      {children && <div className="relative">{children}</div>}
    </div>
  )
}
