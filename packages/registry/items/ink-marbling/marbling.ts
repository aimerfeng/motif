/**
 * 墨流纹的模型：Aubrey Jaffer《Mathematical Marbling》里的几种精确变换。
 *
 * 每次落墨、梳理都记成一个「操作」。画面上一点的颜色，是把这一点按操作从新到旧逐个求逆，
 * 直到它落进某一滴墨的圆盘里：那滴墨的颜色就是答案。这些变换都有闭式逆变换（或一维牛顿迭代），
 * 所以图案在任何分辨率下都是精确的，不会像网格模拟那样越搅越糊。
 *
 * 坐标：画面中心为原点，y 向下，单位是 sqrt(宽 × 高)，画面面积恒为 1，构图不随尺寸变化。
 */

/**
 * 操作缓冲的容量。最旧的操作移出缓冲后，还能走到它的像素就落到「底墨」上（见 GROUND_CELL），
 * 所以落墨总是优先盖住最旧的区域。每轮落墨盖住约 0.95 的面积，旧墨所占的面积按 e^(-累计面积) 缩小：
 * 留住 5 轮以上，走到底墨的地方才少到看不出接缝。逆推时绝大多数像素在最近的几十个操作里就找到了墨，
 * 容量大一些几乎不增加开销。
 */
export const MAX_OPS = 512

/**
 * 水盘起初铺着一层底墨：按逆推到底的坐标分成这么大的方格，每格轮流取一种墨色。
 * 用清水（纸色）当底的话，最早的那层水被梳成细丝后，会在墨纹里留下一片片亮白的噪点。
 */
export const GROUND_CELL = 0.12

export const OP_DROP = 0
export const OP_COMB = 1
export const OP_WAVE = 2
export const OP_SWIRL = 3
export const OP_STROKE = 4

export type CombPattern = 'chevron' | 'wave' | 'stone' | 'swirl'

export interface MarblingConfig {
  /** 一簇墨的总半径（单位长度的分数）。 */
  dropSize: number
  /** 每秒落几簇墨。 */
  dropRate: number
  pattern: CombPattern
  /** 梳齿间距。 */
  spacing: number
  /** 梳理强度倍率。 */
  strength: number
  /** 画面宽高比。 */
  aspect: number
}

interface Op {
  /** 递增的编号：缓存记下它画到了哪个操作。 */
  id: number
  type: number
  /**
   * drop:   cx, cy, r, 颜色槽（-1 为清水）, 纹理种子
   * comb:   mx, my, 齿距, 偏移, 位移, 衰减
   * wave:   mx, my, 振幅, 波数, 相位
   * swirl:  cx, cy, 转角, 1/衰减
   * stroke: ax, ay, mx, my, 长度, 横向衰减, 纵向窗口
   */
  v: number[]
  start: number
  duration: number
  /** 随时间变化的那个值在 v 里的下标；-1 表示静态操作。 */
  field: number
  target: number
  /** 0：墨滴扩散（先快后慢）；1：缓入缓出。 */
  ease: number
  live: boolean
}

interface Action {
  time: number
  run: (time: number) => void
}

/** 可复现的伪随机数（mulberry32）。 */
export function createRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 墨滴扩散：面积先快后慢地长到满，半径因此在开头几乎是「溅开」的。 */
const spread = (p: number) => Math.sqrt(1 - (1 - p) ** 3)
const inOut = (p: number) => 0.5 - 0.5 * Math.cos(Math.PI * p)

const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}
const smoothSlope = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return (6 * t * (1 - t)) / (e1 - e0)
}
/** 笔触沿方向的窗口：[0, L] 内为 1，前后各用 w 平滑降到 0。 */
const strokeWindow = (a: number, L: number, w: number) => smooth(-w, 0, a) * (1 - smooth(L, L + w, a))
const strokeWindowSlope = (a: number, L: number, w: number) => smoothSlope(-w, 0, a) * (1 - smooth(L, L + w, a)) - smooth(-w, 0, a) * smoothSlope(L, L + w, a)

/** 墨滴扩散的时长（秒）。 */
const EXPAND = 1.1
/** 同一簇里相邻两滴的间隔（秒）：后落的墨把先落的推成同心环。 */
const RING_GAP = 0.16
/** 一道梳理的时长（秒）。 */
const STROKE_TIME = 1.6
/** 两道梳理之间的停顿（秒）。 */
const STROKE_GAP = 0.15
/** 每轮落墨的总面积（画面面积为 1）。 */
const COVERAGE = 0.95
/** 每轮最多落几滴墨：墨滴小、簇数多时，每簇少落几滴，缓冲里才留得住足够多轮。 */
const DROP_BUDGET = 84
/** 挂载时预先跑几轮。 */
const WARM_CYCLES = 5
/** 落墨时比较几个候选位置。 */
const CANDIDATES = 12
/** 拖动笔触：横向衰减、窗口宽度和每段的长度（长度必须小于窗口的 2/3，变换才可逆）。 */
const STYLUS_FALLOFF = 0.03
const STYLUS_WINDOW = 0.09
const STYLUS_STEP = 0.04

export class Marbling {
  readonly ops: Op[] = []
  /** 第 WARM_CYCLES 轮落墨开始的时刻：可见时间 0 对应这里，此前的几轮在挂载时一次算完。 */
  readonly startTime: number
  private readonly config: MarblingConfig
  private readonly random: () => number
  private actions: Action[] = []
  private time = 0
  private cycle = 0
  private colorCursor = 0
  private nextId = 1
  /** 梳齿的相位（0–1），一个实例里固定。 */
  private readonly combOffset: number
  private halfW: number
  private halfH: number
  /** 数据有变化，需要重新上传。 */
  dirty = true

  constructor(config: MarblingConfig, seed = 0x5e1a) {
    this.config = config
    this.random = createRandom(seed)
    this.halfW = Math.sqrt(config.aspect) / 2
    this.halfH = 1 / Math.sqrt(config.aspect) / 2
    this.colorCursor = Math.floor(this.random() * 5)
    this.combOffset = this.random()
    let second = 0
    this.planCycle(0, (start) => {
      second = start
    })
    // 预先跑完前几轮：第一帧就是一张完整的墨流纹，底墨也已经被一层层新墨挤成了细丝。
    while (second === 0 && this.actions.length > 0) this.step()
    this.startTime = second
  }

  /** 一轮的时长：落墨 + 等待扩散 + 梳理 + 停顿。 */
  cycleLength(clusters = this.clusters()): number {
    return clusters / this.config.dropRate + 1.2 + this.combLength() + 0.4
  }

  private clusters(): number {
    const r = this.config.dropSize
    return Math.max(4, Math.round(COVERAGE / (Math.PI * r * r)))
  }

  private combLength(): number {
    return this.strokes().reduce((sum, stroke) => sum + stroke.duration + STROKE_GAP, 0)
  }

  private schedule(time: number, run: (time: number) => void) {
    const action = { time, run }
    let index = this.actions.length
    while (index > 0 && this.actions[index - 1]!.time > time) index--
    this.actions.splice(index, 0, action)
  }

  /** 安排一轮：落 n 簇墨，等最后一簇扩散完，再按纹样梳理，然后开始下一轮。 */
  private planCycle(start: number, onSecond?: (start: number) => void) {
    const { dropRate } = this.config
    // 第一轮多落一些：清水面要尽快被墨盖满。
    const n = Math.round(this.clusters() * (this.cycle === 0 ? 1.6 : 1))
    for (let i = 0; i < n; i++) this.schedule(start + i / dropRate, (time) => this.cluster(time))
    const combStart = start + n / dropRate + 1.2
    this.planComb(combStart)
    const next = start + this.cycleLength(n)
    this.schedule(next, () => {
      this.cycle++
      if (this.cycle === WARM_CYCLES) onSecond?.(next)
      this.planCycle(next, onSecond)
    })
  }

  private planComb(start: number) {
    let time = start
    for (const stroke of this.strokes()) {
      this.schedule(time, (at) => stroke.run(at, stroke.duration))
      time += stroke.duration + STROKE_GAP
    }
  }

  /** 这一轮的梳理动作。随机数在安排时就取好，保证时长可以预先算出来。 */
  private strokes(): { duration: number; run: (time: number, duration: number) => void }[] {
    const { pattern, spacing } = this.config
    // 力度在下限也要梳得出纹样：只把位移在默认值附近按比例放大缩小，不让它趋近于零。
    const strength = 0.35 + 0.65 * this.config.strength
    const rand = this.random
    const flip = this.cycle % 2 === 0 ? 1 : -1
    // 梳子（只用横竖两个方向）：at 是齿在画面固定坐标轴上的位置。齿线的法向随梳理方向翻转，
    // 所以反向梳时偏移要取反，来回两遍的齿才正好错开半个齿距，梳出对称的人字而不是斜的锯齿。
    const comb = (mx: number, my: number, gap: number, at: number, falloff: number, z: number, duration = STROKE_TIME) => ({
      duration,
      run: (time: number, length: number) => this.push(OP_COMB, [mx, my, gap, at * (mx - my), 0, falloff], time, length, 4, z),
    })
    if (pattern === 'chevron') {
      // 先用宽齿横向来回梳成细条（get-gel），再用细齿上下各梳一遍，每条细条都折成人字。
      // 齿的位置每轮相同：旧墨被同一把梳子反复梳，人字只会越折越深，不会被切成台阶；
      // 宽齿的方向每轮交替，旧墨不会被越拉越斜，最后碎成噪点。
      // 位移跟着齿距走：细齿每次把墨拉过大半个齿距，人字的折角在任何齿距下都一样清楚。
      const wide = spacing * 3
      const o1 = this.combOffset * wide
      const o2 = this.combOffset * spacing
      return [
        comb(flip, 0, wide, o1, wide * 0.45, wide * strength),
        comb(-flip, 0, wide, o1 + wide / 2, wide * 0.45, wide * strength),
        comb(0, 1, spacing, o2, spacing * 0.4, 0.7 * spacing * strength),
        comb(0, -1, spacing, o2 + spacing / 2, spacing * 0.4, 0.7 * spacing * strength),
      ]
    }
    if (pattern === 'wave') {
      // 先横向梳成细条，再整体上下起伏成波浪。方向每轮交替，墨不会一直往一边跑。
      const k = (Math.PI * 2) / (0.36 + rand() * 0.12)
      const phase = rand() * Math.PI * 2
      return [
        comb(flip, 0, spacing, rand() * spacing, spacing * 0.3, (0.11 + 0.6 * spacing) * strength),
        {
          duration: STROKE_TIME * 1.1,
          run: (time, length) => this.push(OP_WAVE, [1, 0, 0, k, phase], time, length, 2, 0.055 * strength * flip),
        },
      ]
    }
    if (pattern === 'swirl') {
      // 两个反向的漩涡，沿画面的长边分在中心两侧，卷的是这一轮刚落下的墨：卷在最旧的地方的话，
      // 下一轮的墨正好落在那里，漩涡还没看清就被盖掉了。漩涡的半径跟着墨滴和齿距走，总能罩住好几簇墨，
      // 一簇簇同心环才会被卷成螺旋。
      const reach = 1.3 * this.config.dropSize + 1.7 * spacing
      const long = Math.max(this.halfW, this.halfH)
      const short = Math.min(this.halfW, this.halfH)
      const across = this.halfW >= this.halfH
      return [1, -1].map((sign) => {
        const a = sign * long * (0.34 + rand() * 0.16)
        const b = (rand() * 2 - 1) * short * 0.3
        const [x, y] = across ? [a, b] : [b, a]
        return {
          duration: STROKE_TIME * 1.2,
          run: (time: number, length: number) => this.push(OP_SWIRL, [x, y, 0, 1 / reach], time, length, 2, sign * flip * 5.2 * strength),
        }
      })
    }
    // 石纹本身不梳，只让水面轻轻起伏一下，墨纹像在水上漂；齿距越小，起伏越密。
    const k = (Math.PI * 2) / (0.3 + spacing * 5 + rand() * 0.2)
    const angle = rand() * Math.PI
    const phase = rand() * Math.PI * 2
    return [
      {
        duration: STROKE_TIME * 1.5,
        run: (time, length) => this.push(OP_WAVE, [Math.cos(angle), Math.sin(angle), 0, k, phase], time, length, 2, 0.022 * strength * flip),
      },
    ]
  }

  /** 一簇墨：同一处先后落 1–3 滴，后落的把先落的推成环，中间偶尔夹一圈清水。 */
  private cluster(time: number) {
    const rand = this.random
    const { pattern } = this.config
    const [x, y] = this.pickSpot(1)
    const radius = this.config.dropSize * (0.78 + rand() * 0.44)
    // 每簇平均几滴：簇数多（墨滴小）时按每轮的墨滴预算，把一部分簇换成少一滴的。
    const budget = DROP_BUDGET / this.clusters()
    const fewer = (base: number, least: number) => Math.min(1, Math.max(0, (base - budget) / (base - least)))
    const roll = rand()
    let count: number
    let shares: number[]
    let clear = -1
    if (pattern === 'stone') {
      // 石纹：每块「石头」先落一圈细的脉络色，石头互相挤压时这圈就成了石缝里的纹脉；有些脉络是清水，
      // 成了石头之间的白缝。齿距越小，脉络越细。
      const vein = Math.min(0.4, Math.max(0.14, 0.04 + 2.4 * this.config.spacing))
      const two = fewer(2.45, 2)
      count = roll < two + (1 - two) * 0.55 ? 2 : 3
      shares = count === 2 ? [vein, 1 - vein] : [vein * 0.85, 0.7 - vein * 0.85, 0.3]
      if (rand() < 0.35) clear = 0
    } else {
      const one = fewer(1.85, 1)
      count = roll < one + (1 - one) * 0.4 ? 1 : roll < one + (1 - one) * 0.75 ? 2 : 3
      shares = count === 1 ? [1] : count === 2 ? [0.58, 0.42] : [0.46, 0.14, 0.4]
      // 三滴时中间常夹一圈清水；两滴时偶尔是清水心，梳开后成一道道只有轮廓的细线。
      if ((count === 3 && rand() < 0.55) || (count === 2 && rand() < 0.3)) clear = 1
    }
    for (let j = 0; j < count; j++) {
      const slot = j === clear ? -1 : this.colorCursor++
      const r = radius * Math.sqrt(shares[j]!)
      const seed = Math.floor(rand() * 997)
      this.schedule(time + j * RING_GAP, (at) => this.push(OP_DROP, [x, y, 0, slot, seed], at, EXPAND, 2, r))
    }
  }

  /** 在画面（略放宽）里取几个候选点，挑逆推最深、也就是墨最旧的那一个。 */
  private pickSpot(margin: number): [number, number] {
    const rand = this.random
    const w = this.halfW * margin + 0.04
    const h = this.halfH * margin + 0.04
    let best: [number, number] = [0, 0]
    let bestDepth = -1
    for (let i = 0; i < CANDIDATES; i++) {
      const x = (rand() * 2 - 1) * w
      const y = (rand() * 2 - 1) * h
      const depth = this.depthAt(x, y)
      if (depth > bestDepth) {
        bestDepth = depth
        best = [x, y]
      }
    }
    return best
  }

  private push(type: number, v: number[], start: number, duration: number, field: number, target: number) {
    const live = duration > 0 && field >= 0
    const values = v.slice()
    while (values.length < 7) values.push(0)
    if (!live && field >= 0) values[field] = target
    this.ops.push({ id: this.nextId++, type, v: values, start, duration, field, target, ease: type === OP_DROP ? 0 : 1, live })
    if (this.ops.length > MAX_OPS) this.ops.shift()
    this.updateOp(this.ops[this.ops.length - 1]!, this.time)
    this.dirty = true
  }

  private updateOp(op: Op, time: number) {
    if (!op.live) return
    const p = Math.min(1, Math.max(0, (time - op.start) / op.duration))
    op.v[op.field] = op.target * (op.ease === 0 ? spread(p) : inOut(p))
    if (p >= 1) op.live = false
    this.dirty = true
  }

  private step() {
    const action = this.actions.shift()
    if (!action) return
    this.setTime(action.time)
    action.run(action.time)
  }

  private setTime(time: number) {
    this.time = time
    for (let i = this.ops.length - 1; i >= 0; i--) {
      const op = this.ops[i]!
      if (op.live) this.updateOp(op, time)
    }
  }

  /** 推进到某个时刻（只能往前）。 */
  advanceTo(time: number) {
    if (time < this.time) return
    while (this.actions.length > 0 && this.actions[0]!.time <= time) this.step()
    this.setTime(time)
  }

  /** 拖动：沿 a→b 拉一笔，分成可逆的小段。 */
  stroke(ax: number, ay: number, bx: number, by: number) {
    const dx = bx - ax
    const dy = by - ay
    const length = Math.hypot(dx, dy)
    if (length < 1e-5) return
    const mx = dx / length
    const my = dy / length
    const segments = Math.ceil(length / STYLUS_STEP)
    const step = length / segments
    for (let i = 0; i < segments; i++) {
      this.push(OP_STROKE, [ax + mx * step * i, ay + my * step * i, mx, my, step, STYLUS_FALLOFF, STYLUS_WINDOW], this.time, 0, -1, 0)
    }
  }

  /** 点一下：在这里落一簇墨（两滴，成一个环）。instant 时直接画成扩散完的样子（减少动态效果）。 */
  dropAt(x: number, y: number, instant = false) {
    const radius = this.config.dropSize * 0.85
    const slotA = this.colorCursor++
    const slotB = this.colorCursor++
    const duration = instant ? 0 : EXPAND
    this.push(OP_DROP, [x, y, 0, slotA, 17], this.time, duration, 2, radius * Math.sqrt(0.6))
    if (instant) this.push(OP_DROP, [x, y, 0, slotB, 29], this.time, 0, 2, radius * Math.sqrt(0.4))
    else this.schedule(this.time + RING_GAP, (at) => this.push(OP_DROP, [x, y, 0, slotB, 29], at, EXPAND, 2, radius * Math.sqrt(0.4)))
  }

  /** 最新操作的编号。 */
  get newestId(): number {
    return this.nextId - 1
  }

  /** 编号不超过它的操作都已经静止，可以画进缓存。 */
  get settledId(): number {
    for (const op of this.ops) if (op.live) return op.id - 1
    return this.newestId
  }

  /** 还有没有正在变化的操作。 */
  get animating(): boolean {
    return this.ops.some((op) => op.live)
  }

  /**
   * 把一点按操作从新到旧求逆，返回走过了几个操作才落进墨滴（走到底墨时返回 Infinity）、
   * 那滴墨在 ops 里的下标（底墨为 -1），以及停下时的坐标。与着色器里的逆推一致（这里不需要抗锯齿用的雅可比）。
   */
  trace(x: number, y: number): { depth: number; index: number; x: number; y: number } {
    const ops = this.ops
    for (let i = ops.length - 1; i >= 0; i--) {
      const op = ops[i]!
      const v = op.v
      switch (op.type) {
        case OP_DROP: {
          const r = v[2]!
          if (r <= 0) break
          const dx = x - v[0]!
          const dy = y - v[1]!
          const l2 = dx * dx + dy * dy
          if (l2 < r * r) return { depth: ops.length - 1 - i, index: i, x, y }
          const s = Math.sqrt(1 - (r * r) / l2)
          x = v[0]! + dx * s
          y = v[1]! + dy * s
          break
        }
        case OP_COMB: {
          const mx = v[0]!
          const my = v[1]!
          const spacing = v[2]!
          const q = -my * x + mx * y - v[3]!
          const t = q - spacing * Math.floor(q / spacing)
          const f = v[4]! * Math.exp(-Math.min(t, spacing - t) / v[5]!)
          x -= f * mx
          y -= f * my
          break
        }
        case OP_WAVE: {
          const mx = v[0]!
          const my = v[1]!
          const g = v[2]! * Math.sin((x * mx + y * my) * v[3]! + v[4]!)
          x += g * my
          y -= g * mx
          break
        }
        case OP_SWIRL: {
          const dx = x - v[0]!
          const dy = y - v[1]!
          const th = v[2]! * Math.exp(-Math.hypot(dx, dy) * v[3]!)
          const c = Math.cos(th)
          const s = Math.sin(th)
          x = v[0]! + c * dx + s * dy
          y = v[1]! - s * dx + c * dy
          break
        }
        case OP_STROKE: {
          const mx = v[2]!
          const my = v[3]!
          const L = v[4]!
          const w = v[6]!
          const dx = x - v[0]!
          const dy = y - v[1]!
          const along = dx * mx + dy * my
          const across = -dx * my + dy * mx
          const F = L * Math.exp(-Math.abs(across) / v[5]!)
          if (F < 1e-6 || along <= -w || along >= L + w) break
          let a = along - F * strokeWindow(along, L, w)
          for (let k = 0; k < 3; k++) a -= (a + F * strokeWindow(a, L, w) - along) / (1 + F * strokeWindowSlope(a, L, w))
          x -= (along - a) * mx
          y -= (along - a) * my
          break
        }
      }
    }
    return { depth: Infinity, index: -1, x, y }
  }

  private depthAt(x: number, y: number): number {
    return this.trace(x, y).depth
  }

  /** 墨滴的颜色槽（-1 为清水）。 */
  slotOf(index: number): number {
    return this.ops[index]?.v[3] ?? -1
  }

  /** 按着色器的布局打包：最新的操作在第 0 列；第 0 行是 (类型, v0, v1, v2)，第 1 行是 (v3…v6)。 */
  pack(out: Float32Array): number {
    const count = this.ops.length
    for (let i = 0; i < count; i++) {
      const op = this.ops[count - 1 - i]!
      const v = op.v
      const a = i * 4
      const b = (MAX_OPS + i) * 4
      out[a] = op.type
      out[a + 1] = v[0]!
      out[a + 2] = v[1]!
      out[a + 3] = v[2]!
      out[b] = v[3]!
      out[b + 1] = v[4]!
      out[b + 2] = v[5]!
      out[b + 3] = v[6]!
    }
    this.dirty = false
    return count
  }
}
