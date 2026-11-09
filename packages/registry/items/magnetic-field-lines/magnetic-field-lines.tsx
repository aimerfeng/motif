import { cn, useCanvasSize, useFrameLoop, usePrefersReducedMotion } from '@motif/runtime'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  mode: 'filings',
  poles: 3,
  density: 1,
  strokeLength: 9,
  flowSpeed: 1,
  ink: '#c3d5ff',
  background: '#05070c',
  poleGlow: 0.6,
  grabRadius: 25,
}
/* @motif:end */

export type MagneticFieldLinesProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 磁极漂移的周期（秒）。光脉冲、演示里的虚拟指针都按它取整，循环视频首尾正好接上。 */
export const CYCLE = 12
const MAX_POLES = 6
/** density = 1 时铁屑网格的间距（CSS 像素）。 */
const GRID = 8.5
/** 铁屑总数上限：4K 全屏时自动放大间距，帧率不至于掉下去。 */
const MAX_FILINGS = 30000
/** 每个磁极放出的基础磁力线条数。远离磁极时线距变宽，再按 2、4、8 倍细分，链的疏密看起来处处差不多。 */
const BASE_LINES = 12
/** 铁屑按透明度分档，同一档合成一条路径一次描边。 */
const LEVELS = 8
/** 同一条磁力线上相邻两个光脉冲的间距（像素），和每个周期走过的脉冲数。 */
const PULSE_GAP = 210
const PULSES_PER_CYCLE = 4
const PULSE_LEVELS = 6
const PULSE_SPEED = (PULSE_GAP * PULSES_PER_CYCLE) / CYCLE
/** 追踪磁力线时每条最多的点数。 */
const MAX_POINTS = 420
/** 流线模式每个磁极最多 25 条（N 极出发的，加上 S 极出发、N 极够不着的那些）。 */
const MAX_LINES = MAX_POLES * 25
/** 抓住的磁极被指针甩开多远就放手（组件短边的比例，至少是抓取范围的两倍）。 */
const RELEASE = 0.4
/** 被指针抓住的磁极用临界阻尼弹簧跟随，越大跟得越紧；松开后用更软的弹簧慢慢回到轨道。 */
const SPRING_FOLLOW = 5.5
const SPRING_RETURN = 2.6
/** 铁屑往最近一条链上收拢的程度（1 时链中心附近的铁屑全部挤到线上）。 */
const SNAP = 0.7
const SEED = 0x6d61676e

/** 每个磁极在椭圆上的位置偏移和自己的小幅漂移相位，故意不对称，画面才不像教科书插图。 */
const POLE_LAYOUT = [
  { angle: 0.12, radius: 1, wx: 0.3, wy: 1.9 },
  { angle: -0.18, radius: 0.86, wx: 2.4, wy: 0.6 },
  { angle: 0.22, radius: 1.06, wx: 4.1, wy: 3.3 },
  { angle: -0.1, radius: 0.92, wx: 1.2, wy: 5.2 },
  { angle: 0.16, radius: 1.02, wx: 5.6, wy: 2.5 },
  { angle: -0.24, radius: 0.88, wx: 3.5, wy: 4.4 },
]

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

/**
 * 第 index 个磁极（共 count 个）在 time 秒时的轨道位置，按画面宽高的比例给出：
 * 整体沿椭圆来回摆动，每个磁极再叠一点自己的漂移，周期都是 CYCLE。演示里的虚拟指针也靠它找到磁极。
 */
export function orbitPosition(index: number, count: number, time: number): readonly [number, number] {
  const layout = POLE_LAYOUT[index % POLE_LAYOUT.length]!
  const phase = (time / CYCLE) * Math.PI * 2
  const sway = -0.38 + 0.46 * Math.sin(phase)
  const angle = sway + (index / count) * Math.PI * 2 + layout.angle + (count === 2 ? 0 : -Math.PI / 2)
  const radius = count === 1 ? 0 : layout.radius
  return [
    0.5 + Math.cos(angle) * radius * 0.3 + Math.sin(phase + layout.wx) * 0.035,
    0.5 + Math.sin(angle) * radius * 0.29 + Math.sin(phase * 2 + layout.wy) * 0.04,
  ]
}

function hash(a: number, b: number): number {
  let h = Math.imul(a + 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x7f4a7c15, 0xc2b2ae35)
  h = Math.imul(h ^ (h >>> 13), 0x27d4eb2f)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

type RGB = [number, number, number]

function parseHex(hex: string): RGB {
  const value = hex.replace('#', '')
  return [0, 1, 2].map((index) => parseInt(value.slice(index * 2, index * 2 + 2), 16) || 0) as RGB
}

function luminance([r, g, b]: RGB): number {
  const channel = (value: number) => {
    const c = value / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function contrast(a: RGB, b: RGB): number {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** 墨色和背景太接近时，把墨色往白（深色背景）或黑（浅色背景）推，直到对比度够看清铁屑。 */
function readableInk(ink: RGB, background: RGB): RGB {
  const toward: RGB = luminance(background) > 0.35 ? [12, 12, 14] : [255, 255, 255]
  let color = ink
  for (let step = 1; step <= 10 && contrast(color, background) < 4; step++) {
    const mix = step / 10
    color = ink.map((channel, index) => Math.round(channel + (toward[index]! - channel) * mix)) as RGB
  }
  return color
}

function rgba([r, g, b]: RGB, alpha: number): string {
  return `rgb(${r} ${g} ${b} / ${alpha.toFixed(3)})`
}

interface Grid {
  count: number
  spacing: number
  x: Float32Array
  y: Float32Array
  /** 每根铁屑自己的随机性：长度系数、亮度、方向抖动（单位向量）、相位噪声（cos、sin）。 */
  length: Float32Array
  tone: Float32Array
  jitterX: Float32Array
  jitterY: Float32Array
  phaseCos: Float32Array
  phaseSin: Float32Array
}

/** 抖动网格上撒铁屑：比纯随机均匀，又没有整齐的格子感。 */
function buildGrid(width: number, height: number, density: number): Grid {
  let spacing = GRID / Math.max(0.3, density)
  const area = width * height
  if (area / (spacing * spacing) > MAX_FILINGS) spacing = Math.sqrt(area / MAX_FILINGS)
  const cols = Math.ceil(width / spacing) + 1
  const rows = Math.ceil(height / spacing) + 1
  const count = cols * rows
  const random = createRandom(SEED)
  const grid: Grid = {
    count,
    spacing,
    x: new Float32Array(count),
    y: new Float32Array(count),
    length: new Float32Array(count),
    tone: new Float32Array(count),
    jitterX: new Float32Array(count),
    jitterY: new Float32Array(count),
    phaseCos: new Float32Array(count),
    phaseSin: new Float32Array(count),
  }
  let index = 0
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      grid.x[index] = (col + (random() - 0.5) * 0.9) * spacing
      grid.y[index] = (row + (random() - 0.5) * 0.9) * spacing
      grid.length[index] = 0.55 + random() * 0.75
      grid.tone[index] = 0.45 + random() * 0.55
      const jitter = random() * Math.PI * 2
      grid.jitterX[index] = Math.cos(jitter)
      grid.jitterY[index] = Math.sin(jitter)
      const phase = (random() - 0.5) * 1.4
      grid.phaseCos[index] = Math.cos(phase)
      grid.phaseSin[index] = Math.sin(phase)
      index++
    }
  }
  return grid
}

interface Poles {
  count: number
  x: Float64Array
  y: Float64Array
  /** 磁荷：N 为 +1，S 为 −1，交替排列。 */
  q: Float64Array
}

interface Lines {
  count: number
  /** 每条线的点（x, y 交错）、累计弧长、点数和光脉冲的相位。 */
  points: Float32Array
  arc: Float32Array
  length: Uint16Array
  phase: Float32Array
}

/**
 * 几个磁极周围的磁力线：上千根细短的铁屑顺着磁场排开，在磁极附近聚成放射状的链，
 * 磁极缓缓漂移；指针来到某个磁极的抓取范围（grabRadius）内时，这个磁极跟着指针走，指针离开或甩开后弹回轨道。
 * 光脉冲沿磁力线从 N 极流向 S 极。尺寸由 className 决定，children 叠在上面。
 */
export function MagneticFieldLines({ className, style, children, ...props }: MagneticFieldLinesProps) {
  const options = { ...defaults, ...props }
  const optionsRef = useRef(options)
  optionsRef.current = options

  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const grid = useRef<Grid | null>(null)
  const reduced = usePrefersReducedMotion()
  const reducedRef = useRef(reduced)
  reducedRef.current = reduced

  const poles = useRef<Poles>({ count: 0, x: new Float64Array(MAX_POLES), y: new Float64Array(MAX_POLES), q: new Float64Array(MAX_POLES) })
  const lines = useRef<Lines>({
    count: 0,
    points: new Float32Array(MAX_LINES * MAX_POINTS * 2),
    arc: new Float32Array(MAX_LINES * MAX_POINTS),
    length: new Uint16Array(MAX_LINES),
    phase: new Float32Array(MAX_LINES),
  })
  /** 每个磁极偏离轨道的位移和速度（被指针拖走时不为 0，松开后弹回轨道）。 */
  const offset = useRef({ x: new Float64Array(MAX_POLES), y: new Float64Array(MAX_POLES), vx: new Float64Array(MAX_POLES), vy: new Float64Array(MAX_POLES) })
  const pointer = useRef({ x: 0, y: 0, grabbed: -1 })
  const clock = useRef({ time: 0, flow: 0 })

  const size = useCanvasSize(canvasRef, {
    maxDpr: 1.5,
    onResize: () => {
      grid.current = null
      drawRef.current()
    },
  })

  /** 轨道位置加上被指针拖开的位移。 */
  const placePoles = (time: number) => {
    const { width, height, dpr } = size.current
    const w = width / dpr
    const h = height / dpr
    const n = Math.min(MAX_POLES, Math.max(1, Math.round(optionsRef.current.poles)))
    const p = poles.current
    const o = offset.current
    p.count = n
    for (let index = 0; index < n; index++) {
      const [fx, fy] = orbitPosition(index, n, time)
      p.x[index] = fx * w + o.x[index]!
      p.y[index] = fy * h + o.y[index]!
      p.q[index] = index % 2 === 0 ? 1 : -1
    }
    return { w, h }
  }

  /** 被抓住的磁极弹向指针，其余弹回轨道。按小步长积分，delta 为 0 或很大都稳定。 */
  const stepSprings = (delta: number) => {
    if (delta <= 0) return
    const o = offset.current
    const ptr = pointer.current
    const p = poles.current
    const steps = Math.min(24, Math.ceil(delta / (1 / 120)))
    const dt = delta / steps
    const enabled = optionsRef.current.grabRadius > 0
    for (let index = 0; index < p.count; index++) {
      const anchorX = p.x[index]! - o.x[index]!
      const anchorY = p.y[index]! - o.y[index]!
      const held = enabled && ptr.grabbed === index
      const targetX = held ? ptr.x - anchorX : 0
      const targetY = held ? ptr.y - anchorY : 0
      const k = held ? SPRING_FOLLOW : SPRING_RETURN
      for (let step = 0; step < steps; step++) {
        o.vx[index] = o.vx[index]! + (k * k * (targetX - o.x[index]!) - 2 * k * o.vx[index]!) * dt
        o.vy[index] = o.vy[index]! + (k * k * (targetY - o.y[index]!) - 2 * k * o.vy[index]!) * dt
        o.x[index] = o.x[index]! + o.vx[index]! * dt
        o.y[index] = o.y[index]! + o.vy[index]! * dt
      }
    }
  }

  /**
   * 把一条磁力线追踪进第 slot 条（二维点磁荷的场 B = Σ q·r/|r|²，用中点法沿单位方向走）：
   * sign = 1 时顺着 B 走、到 S 极为止，sign = −1 时逆着 B 走、到 N 极为止；出界很远或点数用完也停。
   * 返回是否落在了异号磁极上。
   */
  const traceInto = (slot: number, x0: number, y0: number, sign: number, w: number, h: number): boolean => {
    const p = poles.current
    const l = lines.current
    const margin = Math.max(w, h) * 0.3
    const base = slot * MAX_POINTS
    let x = x0
    let y = y0
    let arc = 0
    let n = 1
    let landed = false
    l.points[base * 2] = x
    l.points[base * 2 + 1] = y
    l.arc[base] = 0
    while (n < MAX_POINTS) {
      // 第一次求方向，同时找最近的磁极决定步长、找最近的异号磁极判断是否到头。
      let bx = 0
      let by = 0
      let nearest = Infinity
      let nearestSink = Infinity
      let sink = -1
      for (let k = 0; k < p.count; k++) {
        const dx = x - p.x[k]!
        const dy = y - p.y[k]!
        const d2 = dx * dx + dy * dy + 0.01
        bx += (p.q[k]! * dx) / d2
        by += (p.q[k]! * dy) / d2
        if (d2 < nearest) nearest = d2
        if (p.q[k]! * sign < 0 && d2 < nearestSink) {
          nearestSink = d2
          sink = k
        }
      }
      if (sink >= 0 && nearestSink < 36) {
        arc += Math.sqrt(nearestSink)
        l.points[(base + n) * 2] = p.x[sink]!
        l.points[(base + n) * 2 + 1] = p.y[sink]!
        l.arc[base + n] = arc
        n++
        landed = true
        break
      }
      const step = Math.min(14, Math.max(1.5, Math.sqrt(nearest) * 0.2))
      let scale = (sign * step) / (Math.hypot(bx, by) || 1)
      const mx = x + bx * scale * 0.5
      const my = y + by * scale * 0.5
      bx = 0
      by = 0
      for (let k = 0; k < p.count; k++) {
        const dx = mx - p.x[k]!
        const dy = my - p.y[k]!
        const d2 = dx * dx + dy * dy + 0.01
        bx += (p.q[k]! * dx) / d2
        by += (p.q[k]! * dy) / d2
      }
      scale = (sign * step) / (Math.hypot(bx, by) || 1)
      x += bx * scale
      y += by * scale
      arc += step
      l.points[(base + n) * 2] = x
      l.points[(base + n) * 2 + 1] = y
      l.arc[base + n] = arc
      n++
      if (x < -margin || x > w + margin || y < -margin || y > h + margin) break
    }
    l.length[slot] = n
    return landed
  }

  /** 把第 slot 条线首尾倒过来（弧长也重算），让光脉冲照样朝 S 极流。 */
  const reverseLine = (slot: number) => {
    const l = lines.current
    const base = slot * MAX_POINTS
    const n = l.length[slot]!
    const total = l.arc[base + n - 1]!
    for (let i = 0, j = n - 1; i <= j; i++, j--) {
      const ax = l.points[(base + i) * 2]!
      const ay = l.points[(base + i) * 2 + 1]!
      l.points[(base + i) * 2] = l.points[(base + j) * 2]!
      l.points[(base + i) * 2 + 1] = l.points[(base + j) * 2 + 1]!
      l.points[(base + j) * 2] = ax
      l.points[(base + j) * 2 + 1] = ay
      const arcI = l.arc[base + i]!
      l.arc[base + i] = total - l.arc[base + j]!
      l.arc[base + j] = total - arcI
    }
  }

  /**
   * 先从每个 N 极出发追踪，再从每个 S 极倒着追踪。起点角度取在流函数 ψ = Σ q·atan2 的同一组等值线上，正好和铁屑的链对齐。
   * 倒着走回 N 极的线和 N 极出发的线是同一条，丢掉；剩下的是 N 极的线够不着的那些：
   * 偶数个磁极时绕到画面外再回到 S 极外侧的大弧（二维偶极子的磁力线是过两极的圆），没有它们 S 极外侧会空一大块。
   */
  const traceLines = (w: number, h: number, perPole: number, sparse: boolean) => {
    const p = poles.current
    let count = 0
    for (const sign of [1, -1]) {
      for (let pole = 0; pole < p.count; pole++) {
        if (p.q[pole]! !== sign) continue
        let offsetAngle = 0
        for (let other = 0; other < p.count; other++) {
          if (other !== pole) offsetAngle += p.q[other]! * Math.atan2(p.y[pole]! - p.y[other]!, p.x[pole]! - p.x[other]!)
        }
        const key = sign > 0 ? pole : pole + MAX_POLES
        for (let m = 0; m < perPole && count < MAX_LINES; m++) {
          // 铁屑模式只给一半的线放光脉冲，免得太满；没有脉冲的线不用追踪。
          if (sparse && hash(key, m) > 0.5) continue
          // 磁极附近 ψ ≈ q·θ + offsetAngle，ψ 取 2πm/perPole。
          const angle = sign * ((m / perPole) * Math.PI * 2 - offsetAngle)
          const landed = traceInto(count, p.x[pole]! + Math.cos(angle) * 4, p.y[pole]! + Math.sin(angle) * 4, sign, w, h)
          if (sign < 0) {
            if (landed) continue
            reverseLine(count)
          }
          lines.current.phase[count] = hash(key, m) * PULSE_GAP
          count++
        }
      }
    }
    lines.current.count = count
  }

  /** 弧长 s 落在第几个点之前（二分查找）。 */
  const locate = (line: number, s: number): number => {
    const l = lines.current
    const base = line * MAX_POINTS
    let lo = 1
    let hi = l.length[line]! - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (l.arc[base + mid]! < s) lo = mid + 1
      else hi = mid
    }
    return lo
  }

  /** 第 index−1 到 index 个点之间、弧长为 s 的位置。 */
  const pointAt = (line: number, index: number, s: number): readonly [number, number] => {
    const l = lines.current
    const a = (line * MAX_POINTS + index - 1) * 2
    const a0 = l.arc[line * MAX_POINTS + index - 1]!
    const a1 = l.arc[line * MAX_POINTS + index]!
    const t = a1 > a0 ? Math.min(1, Math.max(0, (s - a0) / (a1 - a0))) : 0
    return [l.points[a]! + (l.points[a + 2]! - l.points[a]!) * t, l.points[a + 1]! + (l.points[a + 3]! - l.points[a + 1]!) * t]
  }

  /** 把一条线弧长 [from, to] 的一段加进路径。 */
  const addSpan = (path: Path2D, line: number, from: number, to: number) => {
    const l = lines.current
    const base = line * MAX_POINTS
    const n = l.length[line]!
    let index = locate(line, from)
    const [sx, sy] = pointAt(line, index, from)
    path.moveTo(sx, sy)
    while (index < n - 1 && l.arc[base + index]! < to) {
      path.lineTo(l.points[(base + index) * 2]!, l.points[(base + index) * 2 + 1]!)
      index++
    }
    const [ex, ey] = pointAt(line, index, to)
    path.lineTo(ex, ey)
  }

  const draw = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const o = optionsRef.current
    const { dpr } = size.current
    const { w, h } = placePoles(clock.current.time)
    if (!grid.current) grid.current = buildGrid(w, h, o.density)
    const g = grid.current
    const p = poles.current
    const background = parseHex(o.background)
    const ink = readableInk(parseHex(o.ink), background)
    const light = luminance(background) > 0.35
    const filings = o.mode !== 'streamlines'

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.lineCap = 'butt'
    ctx.globalCompositeOperation = 'source-over'

    // 磁极的光晕垫在最下面，铁屑压在上面。
    const glow = Math.min(1, Math.max(0, o.poleGlow))
    if (glow > 0) {
      ctx.globalCompositeOperation = light ? 'source-over' : 'lighter'
      // 按组件短边缩放：小卡片里不至于盖满，宽屏首屏里也不会只剩几个小点。
      const radius = Math.max(16, Math.min(w, h) * (0.08 + 0.22 * glow))
      for (let index = 0; index < p.count; index++) {
        const gradient = ctx.createRadialGradient(p.x[index]!, p.y[index]!, 0, p.x[index]!, p.y[index]!, radius)
        const strength = (light ? 0.18 : 0.42) * glow
        gradient.addColorStop(0, rgba(ink, strength))
        gradient.addColorStop(0.25, rgba(ink, strength * 0.4))
        gradient.addColorStop(1, rgba(ink, 0))
        ctx.fillStyle = gradient
        ctx.fillRect(p.x[index]! - radius, p.y[index]! - radius, radius * 2, radius * 2)
      }
      ctx.globalCompositeOperation = 'source-over'
    }

    const reference = Math.min(w, h) * 0.22
    if (filings) {
      const paths: (Path2D | undefined)[] = []
      const target = g.spacing * 3.2
      const core = 7 + g.spacing * 0.6
      // 铁屑比网格间距短太多时连不成链，只剩一片散点：稀的时候自动拉长一点。
      const lengthBase = Math.max(o.strokeLength, g.spacing * 0.75)
      const n = p.count
      for (let index = 0; index < g.count; index++) {
        let x = g.x[index]!
        let y = g.y[index]!
        let bx = 0
        let by = 0
        // w = e^{iψ}：流函数 ψ = Σ q·atan2(dy, dx) 写成复数连乘，每个磁极乘上 dx + i·q·dy，最后再归一化，省掉 atan2。
        let wr = 1
        let wi = 0
        let nearest = Infinity
        for (let k = 0; k < n; k++) {
          const dx = x - p.x[k]!
          const dy = y - p.y[k]!
          const d2 = dx * dx + dy * dy + 1
          const q = p.q[k]!
          bx += (q * dx) / d2
          by += (q * dy) / d2
          const ui = q * dy
          const t = wr * dx - wi * ui
          wi = wr * ui + wi * dx
          wr = t
          if (d2 < nearest) nearest = d2
        }
        if (nearest < core * core) continue
        const magnitude = Math.sqrt(bx * bx + by * by)
        if (magnitude < 1e-9) continue
        const strength = magnitude * reference
        // 铁屑聚成链：链就是 ψ 的等值线（磁力线），线距 2π/(k|B|)。离磁极远、线距变宽时换细一倍的一档，处处看起来一样密。
        const level = Math.log2((Math.PI * 2) / (BASE_LINES * magnitude * target))
        let band = 0.5
        if (level > -1.2) {
          const norm = Math.sqrt(wr * wr + wi * wi) || 1
          let ar = wr / norm
          let ai = wi / norm
          // w¹² = ((w²·w)²)²，再按档位平方几次。
          let sr = ar * ar - ai * ai
          const si = 2 * ar * ai
          const tr = sr * ar - si * ai
          const ti = sr * ai + si * ar
          ar = tr
          ai = ti
          const octave = Math.min(4, Math.max(0, Math.floor(level)))
          for (let square = 0; square < 2 + octave; square++) {
            sr = ar * ar - ai * ai
            ai = 2 * ar * ai
            ar = sr
          }
          const pc = g.phaseCos[index]!
          const ps = g.phaseSin[index]!
          const cosA = ar * pc - ai * ps
          const sinA = ar * ps + ai * pc
          const br = ar * ar - ai * ai
          const bi = 2 * ar * ai
          const cosB = br * pc - bi * ps
          const sinB = br * ps + bi * pc
          const mix = Math.min(1, Math.max(0, level - octave))
          const chain = 0.5 + 0.5 * (cosA + (cosB - cosA) * mix)
          const sharp = smoothstep(-1.2, 0.2, level)
          band = 0.5 + (chain * chain - 0.5) * sharp
          // 把铁屑沿 ∇ψ（垂直于磁场）往最近的链上拉：θ 变化 −S·sinθ 对应位移 −S·sinθ/(k|B|)。
          const k = BASE_LINES * 2 ** octave
          const pull = (-SNAP * sharp * (sinA * (1 - mix) + (sinB / 2) * mix)) / (k * magnitude * magnitude)
          x += pull * -by
          y += pull * bx
        }
        // 场弱的地方铁屑没被磁化：方向乱一些，但又短又淡，只是一层细碎的底，不会画成一片交叉的划痕。
        const aligned = smoothstep(0.06, 0.7, strength)
        const wobble = 0.1 + (1 - aligned) * 0.8
        let dirX = bx / magnitude + g.jitterX[index]! * wobble
        let dirY = by / magnitude + g.jitterY[index]! * wobble
        const dirLength = Math.sqrt(dirX * dirX + dirY * dirY) || 1
        const alpha = Math.min(1, 1.45 * g.tone[index]! * (0.06 + 0.94 * band) * (0.08 + 0.92 * smoothstep(0.04, 0.8, strength)) * smoothstep(core, core * 2.4, Math.sqrt(nearest)))
        if (alpha < 0.05) continue
        const half = (0.5 * lengthBase * g.length[index]! * (0.3 + 0.7 * aligned)) / dirLength
        dirX *= half
        dirY *= half
        const bucket = Math.min(LEVELS - 1, Math.floor(alpha * LEVELS))
        const path = (paths[bucket] ??= new Path2D())
        path.moveTo(x - dirX, y - dirY)
        path.lineTo(x + dirX, y + dirY)
      }
      // 线宽正好一个设备像素：画布按细线（hairline）光栅化，上万根铁屑也只要几毫秒；更粗的线在软件光栅下会慢好几倍。
      ctx.lineWidth = 1 / dpr
      ctx.strokeStyle = rgba(ink, 1)
      paths.forEach((path, bucket) => {
        if (!path) return
        ctx.globalAlpha = (bucket + 0.75) / LEVELS
        ctx.stroke(path)
      })
      ctx.globalAlpha = 1
    }

    // 磁力线和光脉冲。
    const perPole = filings ? BASE_LINES * 2 : Math.round(10 + 10 * Math.min(1.5, Math.max(0.75, o.density)))
    traceLines(w, h, perPole, filings)
    const l = lines.current
    if (!filings) {
      const path = new Path2D()
      for (let line = 0; line < l.count; line++) {
        const base = line * MAX_POINTS
        const n = l.length[line]!
        path.moveTo(l.points[base * 2]!, l.points[base * 2 + 1]!)
        for (let index = 1; index < n; index++) path.lineTo(l.points[(base + index) * 2]!, l.points[(base + index) * 2 + 1]!)
      }
      ctx.lineWidth = 1
      ctx.strokeStyle = rgba(ink, light ? 0.3 : 0.24)
      ctx.stroke(path)
    }

    // 光脉冲：一段带亮头的拖尾，按透明度分档合成几条路径，和铁屑一样批量描边。
    const tail = o.strokeLength * 6
    const segments = 4
    const pulsePaths: (Path2D | undefined)[] = []
    const bucketOf = (alpha: number) => (pulsePaths[Math.min(PULSE_LEVELS - 1, Math.floor(alpha * PULSE_LEVELS))] ??= new Path2D())
    const flow = clock.current.flow
    for (let line = 0; line < l.count; line++) {
      const base = line * MAX_POINTS
      const total = l.arc[base + l.length[line]! - 1]!
      const start = (((flow + l.phase[line]!) % PULSE_GAP) + PULSE_GAP) % PULSE_GAP
      for (let head = start; head - tail < total; head += PULSE_GAP) {
        // 磁极附近的线挤在一起，脉冲在这里会叠成一团亮斑：离开磁极一段再亮起来，进 S 极之前提前暗下去。
        const fade = smoothstep(12, 80, head - tail * 0.4) * smoothstep(0, 70, total - head)
        if (fade < 0.06) continue
        for (let segment = 0; segment < segments; segment++) {
          const alpha = ((segment + 1) / segments) ** 1.6 * fade
          const from = Math.max(0, head - tail + (tail * segment) / segments)
          const to = Math.min(total, head - tail + (tail * (segment + 1)) / segments)
          if (alpha >= 0.06 && to > from) addSpan(bucketOf(alpha), line, from, to)
        }
        if (head < total) {
          const [hx, hy] = pointAt(line, locate(line, head), head)
          const path = bucketOf(fade)
          path.moveTo(hx + 1.1, hy)
          path.arc(hx, hy, 1.1, 0, Math.PI * 2)
        }
      }
    }
    ctx.globalCompositeOperation = light ? 'source-over' : 'lighter'
    ctx.strokeStyle = rgba(ink, 1)
    // 先描一道宽而淡的光晕，再描亮芯；铁屑模式下脉冲压在同一条链上，没有光晕就和铁屑混在一起。
    ctx.lineCap = 'round'
    ctx.lineWidth = 5
    pulsePaths.forEach((path, bucket) => {
      if (!path) return
      ctx.globalAlpha = (light ? 0.06 : 0.12) * ((bucket + 1) / PULSE_LEVELS) ** 2
      ctx.stroke(path)
    })
    ctx.lineWidth = 1.6
    pulsePaths.forEach((path, bucket) => {
      if (!path) return
      ctx.globalAlpha = (bucket + 1) / PULSE_LEVELS
      ctx.stroke(path)
    })
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'

    // 磁极本身：N 极实心，S 极空心环。
    const marker = Math.min(1, glow * 3)
    if (marker > 0) {
      for (let index = 0; index < p.count; index++) {
        ctx.beginPath()
        if (p.q[index]! > 0) {
          ctx.arc(p.x[index]!, p.y[index]!, 3.4, 0, Math.PI * 2)
          ctx.fillStyle = rgba(ink, 0.95 * marker)
          ctx.fill()
        } else {
          ctx.arc(p.x[index]!, p.y[index]!, 4, 0, Math.PI * 2)
          ctx.lineWidth = 1.5
          ctx.strokeStyle = rgba(ink, 0.95 * marker)
          ctx.stroke()
        }
      }
    }
  }

  const drawRef = useRef(draw)
  drawRef.current = draw

  useEffect(() => {
    grid.current = null
  }, [options.density])

  // 减少动态效果时循环只画一帧：改参数、拖动磁极时手动重画。
  useEffect(() => {
    if (reduced) drawRef.current()
  })

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    /** 放开磁极，让它弹回轨道（没有动画时直接回去）。 */
    const release = () => {
      const ptr = pointer.current
      if (ptr.grabbed < 0) return
      ptr.grabbed = -1
      if (reducedRef.current) {
        offset.current.x.fill(0)
        offset.current.y.fill(0)
        drawRef.current()
      }
    }
    const onMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect()
      const ptr = pointer.current
      ptr.x = event.clientX - rect.left
      ptr.y = event.clientY - rect.top
      const p = poles.current
      const short = Math.min(rect.width, rect.height)
      const reach = (short * Math.min(50, Math.max(0, optionsRef.current.grabRadius))) / 100
      if (reach <= 0 || ptr.grabbed >= p.count) release()
      if (reach <= 0) return
      const distance = (index: number) => Math.hypot(p.x[index]! - ptr.x, p.y[index]! - ptr.y)
      // 指针甩得比磁极跟得快很多：当作甩开了，放手。
      if (ptr.grabbed >= 0 && distance(ptr.grabbed) > Math.max(reach * 2, short * RELEASE)) release()
      // 只有指针来到某个磁极附近时才抓起它；在空白处、文字上方移动不会把磁极拽过来。
      if (ptr.grabbed < 0) {
        let best = reach
        for (let index = 0; index < p.count; index++) {
          const d = distance(index)
          if (d < best) {
            best = d
            ptr.grabbed = index
          }
        }
      }
      if (reducedRef.current && ptr.grabbed >= 0) {
        // 没有动画：磁极直接到指针下。
        const o = offset.current
        o.x[ptr.grabbed] = ptr.x - (p.x[ptr.grabbed]! - o.x[ptr.grabbed]!)
        o.y[ptr.grabbed] = ptr.y - (p.y[ptr.grabbed]! - o.y[ptr.grabbed]!)
        drawRef.current()
      }
    }
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', release)
    host.addEventListener('pointercancel', release)
    return () => {
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', release)
      host.removeEventListener('pointercancel', release)
    }
  }, [])

  useFrameLoop(
    hostRef,
    ({ time, delta }) => {
      placePoles(time)
      stepSprings(delta)
      clock.current.time = time
      clock.current.flow += delta * optionsRef.current.flowSpeed * PULSE_SPEED
      drawRef.current()
    },
    { reducedMotion: 'static', staticTime: 3 },
  )

  const { background } = options
  return (
    <div ref={hostRef} className={cn('relative isolate overflow-hidden', className)} style={{ background, ...style }}>
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 block size-full" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse 75% 70% at 50% 50%, transparent 45%, ${background} 115%)` }}
      />
      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  )
}
