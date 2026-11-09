import { useRef, type ReactNode, type RefObject } from 'react'
import { cn, useFrameLoop } from '@motif/runtime'

type Pt = readonly [number, number]
type Anchor = 'start' | 'middle' | 'end'

interface UserNode {
  city: string
  device: string
  icon: 'browser' | 'phone' | 'terminal' | 'server'
  at: Pt
  label: Pt
  anchor: Anchor
}

interface PopNode {
  code: string
  city: string
  box: readonly [number, number, number, number]
  codeAt: Pt
  cityAt?: Pt
  chipAt: Pt
  anchor: Anchor
}

interface Dim {
  a: Pt
  b: Pt
  label: string
  /** 两条界线，各自从哪画到哪。 */
  ext: readonly [Pt, Pt, Pt, Pt]
  vertical?: boolean
}

interface Geometry {
  width: number
  height: number
  /** 包的速度（视图单位 / 秒）：窄版图更小，速度也相应放慢。 */
  speed: number
  users: UserNode[]
  pops: PopNode[]
  access: Pt[][]
  backhaul: Pt[][]
  wires: Pt[][]
  junctions: Pt[]
  shield: Pt
  origin: readonly [number, number, number, number]
  originLabel: Pt
  originAnchor: Anchor
  dims: Dim[]
  balloons: { n: number; at: Pt; to: Pt }[]
}

const USERS = [
  { city: 'Berlin', device: 'browser', icon: 'browser' },
  { city: 'Toronto', device: 'iOS app', icon: 'phone' },
  { city: 'Jakarta', device: 'POS till', icon: 'terminal' },
  { city: 'São Paulo', device: 'webhook', icon: 'server' },
] as const

const POPS = [
  { code: 'FRA', city: 'Frankfurt' },
  { code: 'YYZ', city: 'Toronto' },
  { code: 'SIN', city: 'Singapore' },
  { code: 'GRU', city: 'São Paulo' },
] as const

/* 宽版：用户 → 边缘节点 → 区域护盾 → 源站，从左往右读。 */
const WIDE_Y = [96, 184, 272, 360]
const WIDE: Geometry = {
  width: 640,
  height: 444,
  speed: 170,
  users: USERS.map((u, i) => ({ ...u, at: [40, WIDE_Y[i]!] as Pt, label: [72, WIDE_Y[i]! - 10] as Pt, anchor: 'start' as Anchor })),
  pops: POPS.map((p, i) => ({
    ...p,
    box: [232, WIDE_Y[i]! - 30, 108, 60] as const,
    codeAt: [246, WIDE_Y[i]! + 1] as Pt,
    cityAt: [246, WIDE_Y[i]! + 18] as Pt,
    chipAt: [330, WIDE_Y[i]! - 14] as Pt,
    anchor: 'start' as Anchor,
  })),
  access: WIDE_Y.map((y) => [[62, y] as Pt, [232, y] as Pt]),
  backhaul: WIDE_Y.map((y) => [[340, y] as Pt, [414, y] as Pt, [414, 228] as Pt, [490, 228] as Pt]),
  wires: [...WIDE_Y.map((y) => [[340, y] as Pt, [414, y] as Pt]), [[414, 96], [414, 360]], [[414, 228], [490, 228]]],
  junctions: [
    [414, 184],
    [414, 272],
    [414, 228],
  ],
  shield: [452, 228],
  origin: [490, 164, 124, 128],
  originLabel: [490, 314],
  originAnchor: 'start',
  dims: [
    { a: [40, 36], b: [232, 36], label: 'p50 11 ms', ext: [[40, 28], [40, 74], [232, 28], [232, 60]] },
    { a: [340, 36], b: [490, 36], label: '+84 ms on a miss', ext: [[340, 28], [340, 60], [490, 28], [490, 156]] },
    { a: [40, 420], b: [614, 420], label: 'straight to origin, no edge: 95 ms', ext: [[40, 376], [40, 428], [614, 344], [614, 428]] },
  ],
  balloons: [
    { n: 1, at: [196, 64], to: [196, 96] },
    { n: 2, at: [374, 138], to: [342, 155] },
    { n: 3, at: [452, 186], to: [452, 215] },
    { n: 4, at: [626, 146], to: [612, 166] },
  ],
}

/* 窄版：从上往下读，手机宽度下标注字依然可读。 */
const TALL_X = [60, 140, 220, 300]
const TALL: Geometry = {
  width: 360,
  height: 524,
  speed: 120,
  users: USERS.map((u, i) => ({ ...u, at: [TALL_X[i]!, 64] as Pt, label: [TALL_X[i]!, 26] as Pt, anchor: 'middle' as Anchor })),
  pops: POPS.map((p, i) => ({
    ...p,
    box: [TALL_X[i]! - 34, 148, 68, 62] as const,
    codeAt: [TALL_X[i]!, 180] as Pt,
    chipAt: [TALL_X[i]!, 199] as Pt,
    anchor: 'middle' as Anchor,
  })),
  access: TALL_X.map((x) => [[x, 82] as Pt, [x, 148] as Pt]),
  backhaul: TALL_X.map((x) => [[x, 210] as Pt, [x, 262] as Pt, [180, 262] as Pt, [180, 340] as Pt]),
  wires: [...TALL_X.map((x) => [[x, 210] as Pt, [x, 262] as Pt]), [[60, 262], [300, 262]], [[180, 262], [180, 340]]],
  junctions: [
    [140, 262],
    [220, 262],
    [180, 262],
  ],
  shield: [180, 300],
  origin: [118, 340, 124, 128],
  originLabel: [180, 490],
  originAnchor: 'middle',
  dims: [
    { a: [12, 82], b: [12, 148], label: '11 ms', vertical: true, ext: [[6, 82], [24, 82], [6, 148], [24, 148]] },
    { a: [348, 210], b: [348, 340], label: '+84 ms', vertical: true, ext: [[338, 210], [354, 210], [246, 340], [354, 340]] },
  ],
  balloons: [
    { n: 1, at: [100, 114], to: [60, 114] },
    { n: 2, at: [180, 124], to: [175, 147] },
    { n: 3, at: [222, 300], to: [192, 300] },
    { n: 4, at: [96, 330], to: [117, 342] },
  ],
}

/* ---------- 包的时间表 ---------- */

const SLOTS = 5
const SLOT_IDS = Array.from({ length: 4 * SLOTS }, (_, i) => i)
const INTERVALS = [1.55, 1.85, 1.7, 2.05]
const PHASES = [0, 0.55, 1.1, 0.3]
const HOLD_EDGE = 0.14
const HOLD_ORIGIN = 0.22
const FADE = 0.08
/** 预滚：海报和「减少动态效果」的静帧都直接落在稳定状态，而不是第一个包刚出发的空画面。 */
const PREROLL = 9.35

/**
 * 每个节点每 9 个请求回源一次（约 11%）：比真实的 3% 多，好让虚线回源路径每隔几秒就有一个包在走，
 * 但任何时刻最多一个节点显示 MISS，和旁边「100 个里 97 个在边缘应答」的文案不打架。
 * 各节点的错位是挑过的：海报和静帧都是三个 HIT、一个包正在回源。
 */
const MISS_EVERY = 9
const MISS_OFFSET = [4, 8, 3, 2]

function isMiss(pop: number, n: number) {
  return (((n + MISS_OFFSET[pop]!) % MISS_EVERY) + MISS_EVERY) % MISS_EVERY === 0
}

function lengthOf(path: readonly Pt[]) {
  let total = 0
  for (let i = 1; i < path.length; i++) total += Math.hypot(path[i]![0] - path[i - 1]![0], path[i]![1] - path[i - 1]![1])
  return total
}

function pointAt(path: readonly Pt[], s: number): Pt {
  let left = Math.max(0, s)
  for (let i = 1; i < path.length; i++) {
    const [ax, ay] = path[i - 1]!
    const [bx, by] = path[i]!
    const seg = Math.hypot(bx - ax, by - ay)
    if (left <= seg || i === path.length - 1) {
      const t = seg === 0 ? 0 : Math.min(left / seg, 1)
      return [ax + (bx - ax) * t, ay + (by - ay) * t]
    }
    left -= seg
  }
  return path[path.length - 1]!
}

interface Leg {
  path: readonly Pt[]
  reverse: boolean
  kind: 'request' | 'response'
  start: number
  duration: number
  length: number
}

/** 一个请求的完整行程：去边缘 →（未命中时）去源站再回来 → 回用户。 */
function legsFor(geometry: Geometry, pop: number, miss: boolean): { legs: Leg[]; arrive: number; total: number } {
  const access = geometry.access[pop]!
  const backhaul = geometry.backhaul[pop]!
  const la = lengthOf(access)
  const lb = lengthOf(backhaul)
  const da = la / geometry.speed
  const db = lb / geometry.speed
  const legs: Leg[] = [{ path: access, reverse: false, kind: 'request', start: 0, duration: da, length: la }]
  let t = da + HOLD_EDGE
  if (miss) {
    legs.push({ path: backhaul, reverse: false, kind: 'request', start: t, duration: db, length: lb })
    t += db + HOLD_ORIGIN
    legs.push({ path: backhaul, reverse: true, kind: 'response', start: t, duration: db, length: lb })
    t += db + HOLD_EDGE * 0.5
  }
  legs.push({ path: access, reverse: true, kind: 'response', start: t, duration: da, length: la })
  return { legs, arrive: da, total: t + da }
}

interface SlotRefs {
  group: SVGGElement | null
  trail: SVGLineElement | null
  ring: SVGCircleElement | null
  diamond: SVGRectElement | null
}

/* ---------- 图形零件 ---------- */

function DeviceGlyph({ icon, at }: { icon: UserNode['icon']; at: Pt }) {
  const [x, y] = at
  const shapes: Record<UserNode['icon'], ReactNode> = {
    browser: (
      <>
        <rect x={-12} y={-9} width={24} height={18} />
        <path d="M-12 -4.5H12" />
        <path d="M-9 -6.8h.01M-6.5 -6.8h.01M-4 -6.8h.01" strokeLinecap="round" strokeWidth={1.6} />
      </>
    ),
    phone: (
      <>
        <rect x={-6.5} y={-11} width={13} height={22} rx={2} />
        <path d="M-2.5 7.5h5" />
      </>
    ),
    terminal: (
      <>
        <rect x={-9} y={-11} width={18} height={22} />
        <rect x={-6} y={-8} width={12} height={6} />
        <path d="M-5 2.5h.01M0 2.5h.01M5 2.5h.01M-5 6.5h.01M0 6.5h.01M5 6.5h.01" strokeLinecap="round" strokeWidth={1.8} />
      </>
    ),
    server: (
      <>
        <rect x={-11} y={-10} width={22} height={9} />
        <rect x={-11} y={1} width={22} height={9} />
        <path d="M-7.5 -5.5h.01M-7.5 5.5h.01" strokeLinecap="round" strokeWidth={1.8} />
        <path d="M2 -5.5h6M2 5.5h6" />
      </>
    ),
  }
  return (
    <g transform={`translate(${x} ${y})`} className="fill-none stroke-ink" strokeWidth={1.2}>
      {shapes[icon]}
    </g>
  )
}

function Rack({ box, ledRefs }: { box: Geometry['origin']; ledRefs: RefObject<(SVGCircleElement | null)[]> }) {
  const [x, y, w, h] = box
  const unit = (h - 16) / 4
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} className="fill-paper stroke-ink" strokeWidth={1.4} />
      <rect x={x + 5} y={y + 5} width={w - 10} height={h - 10} className="fill-none stroke-hair" strokeWidth={1} />
      {[0, 1, 2, 3].map((i) => {
        const uy = y + 8 + i * unit
        return (
          <g key={i}>
            <rect x={x + 10} y={uy + 3} width={w - 20} height={unit - 6} className="fill-none stroke-rule" strokeWidth={1} />
            <circle
              ref={(el) => {
                ledRefs.current[i] = el
              }}
              cx={x + 19}
              cy={uy + unit / 2}
              r={2.6}
              className="fill-ink"
              opacity={0.25}
            />
            {[0, 1, 2, 3, 4, 5].map((j) => (
              <path key={j} d={`M${x + w - 46 + j * 5.5} ${uy + 8}v${unit - 16}`} className="stroke-hair" strokeWidth={1} />
            ))}
          </g>
        )
      })}
    </g>
  )
}

function DimShape({ dim }: { dim: Dim }) {
  const [ax, ay] = dim.a
  const [bx, by] = dim.b
  const [e1, e2, e3, e4] = dim.ext
  const mx = (ax + bx) / 2
  const my = (ay + by) / 2
  const arrow = 6
  const head = (x: number, y: number, dx: number, dy: number) =>
    `M${x} ${y}L${x + dx * arrow - dy * 2.2} ${y + dy * arrow + dx * 2.2}L${x + dx * arrow + dy * 2.2} ${y + dy * arrow - dx * 2.2}Z`
  const dx = Math.sign(bx - ax)
  const dy = Math.sign(by - ay)
  const pad = dim.label.length * 3.6 + 6
  return (
    <g className="text-rule">
      <path d={`M${e1[0]} ${e1[1]}L${e2[0]} ${e2[1]}M${e3[0]} ${e3[1]}L${e4[0]} ${e4[1]}`} className="stroke-hair" strokeWidth={1} />
      {dim.vertical ? (
        <path d={`M${ax} ${ay}L${ax} ${my - pad}M${bx} ${my + pad}L${bx} ${by}`} className="stroke-rule" strokeWidth={1} />
      ) : (
        <path d={`M${ax} ${ay}L${mx - pad} ${ay}M${mx + pad} ${by}L${bx} ${by}`} className="stroke-rule" strokeWidth={1} />
      )}
      <path d={head(ax, ay, dx, dy)} className="fill-rule" />
      <path d={head(bx, by, -dx, -dy)} className="fill-rule" />
      <text
        x={mx}
        y={my}
        textAnchor="middle"
        dominantBaseline="central"
        transform={dim.vertical ? `rotate(-90 ${mx} ${my})` : undefined}
        className="fill-ink-soft font-bp-mono"
        fontSize={10.5}
        letterSpacing="0.06em"
      >
        {dim.label.toUpperCase()}
      </text>
    </g>
  )
}

/* ---------- 图 ---------- */

function Diagram({ geometry, speed, showDimensions, className, title }: { geometry: Geometry; speed: number; showDimensions: boolean; className?: string; title: string }) {
  const host = useRef<SVGSVGElement>(null)
  const slots = useRef<SlotRefs[]>(Array.from({ length: POPS.length * SLOTS }, () => ({ group: null, trail: null, ring: null, diamond: null })))
  const chips = useRef<(SVGTextElement | null)[]>([])
  const chipText = useRef<string[]>([])
  const flashes = useRef<(SVGRectElement | null)[]>([])
  const leds = useRef<(SVGCircleElement | null)[]>([])

  useFrameLoop(
    host,
    ({ time }) => {
      const t = time + PREROLL
      const ledLevel = [0.25, 0.25, 0.25, 0.25]
      for (let pop = 0; pop < POPS.length; pop++) {
        const interval = INTERVALS[pop]!
        const phase = PHASES[pop]!
        let latestArrival = -1
        let latestMiss = false
        for (let k = 0; k < SLOTS; k++) {
          const refs = slots.current[pop * SLOTS + k]!
          const cycle = Math.floor((t - phase - k * interval) / (SLOTS * interval))
          const n = k + cycle * SLOTS
          const start = phase + n * interval
          const local = t - start
          const miss = isMiss(pop, n)
          const plan = legsFor(geometry, pop, miss)
          if (local >= plan.arrive && start + plan.arrive > latestArrival) {
            latestArrival = start + plan.arrive
            latestMiss = miss
          }
          if (miss) {
            const atOrigin = plan.legs[1]!
            if (local > atOrigin.start + atOrigin.duration && local < atOrigin.start + atOrigin.duration + HOLD_ORIGIN + 0.1) ledLevel[pop] = 1
          }
          const leg = n >= 0 && local >= 0 ? plan.legs.find((l) => local >= l.start && local <= l.start + l.duration) : undefined
          if (!refs.group) continue
          if (!leg) {
            refs.group.setAttribute('opacity', '0')
            continue
          }
          const u = local - leg.start
          const s = (u / leg.duration) * leg.length
          const along = leg.reverse ? leg.length - s : s
          const back = leg.reverse ? Math.min(leg.length, along + 16) : Math.max(0, along - 16)
          const [x, y] = pointAt(leg.path, along)
          const [tx, ty] = pointAt(leg.path, back)
          const fade = Math.min(1, u / FADE, (leg.duration - u) / FADE)
          refs.group.setAttribute('opacity', fade.toFixed(3))
          refs.group.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`)
          refs.trail?.setAttribute('x1', (tx - x).toFixed(2))
          refs.trail?.setAttribute('y1', (ty - y).toFixed(2))
          refs.ring?.setAttribute('opacity', leg.kind === 'request' ? '1' : '0')
          refs.diamond?.setAttribute('opacity', leg.kind === 'response' ? '1' : '0')
        }
        // 边缘节点右上角显示最近一个请求是命中还是回源，到达瞬间方框闪一下。
        const status = latestArrival < 0 ? '—' : latestMiss ? 'MISS' : 'HIT'
        if (chipText.current[pop] !== status) {
          chipText.current[pop] = status
          const chip = chips.current[pop]
          if (chip) chip.textContent = status
        }
        const since = t - latestArrival
        const flash = latestArrival < 0 ? 0 : Math.max(0, 1 - since / 0.45)
        flashes.current[pop]?.setAttribute('opacity', (flash * 0.16).toFixed(3))
      }
      leds.current.forEach((led, i) => led?.setAttribute('opacity', String(ledLevel[i] ?? 0.25)))
    },
    { speed, reducedMotion: 'static', staticTime: 0 },
  )

  const g = geometry
  return (
    <svg ref={host} viewBox={`0 0 ${g.width} ${g.height}`} className={cn('h-auto w-full overflow-visible', className)} role="img" aria-label={title}>
      {/* 连线：接入线、回源支线、总线、主干 */}
      {g.access.map((path, i) => (
        <polyline key={`a${i}`} points={path.map((p) => p.join(',')).join(' ')} className="fill-none stroke-rule" strokeWidth={1.2} />
      ))}
      {g.wires.map((path, i) => (
        <polyline key={`w${i}`} points={path.map((p) => p.join(',')).join(' ')} className="fill-none stroke-rule" strokeWidth={1.2} strokeDasharray="5 4" />
      ))}
      {g.junctions.map(([x, y], i) => (
        <circle key={`j${i}`} cx={x} cy={y} r={2.8} className="fill-ink" />
      ))}

      {/* 用户端 */}
      {g.users.map((user) => (
        <g key={user.city}>
          <DeviceGlyph icon={user.icon} at={user.at} />
          <text x={user.label[0]} y={user.label[1]} textAnchor={user.anchor} className="font-bp-mono" fontSize={11}>
            <tspan className="fill-ink">{user.city.toUpperCase()}</tspan>
            {g === WIDE ? <tspan className="fill-ink-muted"> · {user.device}</tspan> : null}
          </text>
          {g === WIDE ? null : (
            <text x={user.label[0]} y={user.label[1] + 14} textAnchor="middle" className="fill-ink-muted font-bp-mono" fontSize={10}>
              {user.device}
            </text>
          )}
        </g>
      ))}

      {/* 边缘节点 */}
      {g.pops.map((pop, i) => {
        const [x, y, w, h] = pop.box
        return (
          <g key={pop.code}>
            <rect x={x} y={y} width={w} height={h} className="fill-paper stroke-ink" strokeWidth={1.4} />
            <rect
              ref={(el) => {
                flashes.current[i] = el
              }}
              x={x}
              y={y}
              width={w}
              height={h}
              className="fill-ink"
              opacity={0}
            />
            <path d={`M${x + 4} ${y + 4}h6M${x + 4} ${y + 4}v6M${x + w - 4} ${y + h - 4}h-6M${x + w - 4} ${y + h - 4}v-6`} className="fill-none stroke-hair" strokeWidth={1} />
            <text x={pop.codeAt[0]} y={pop.codeAt[1]} textAnchor={pop.anchor} className="bp-display fill-ink" fontSize={g === WIDE ? 19 : 18}>
              {pop.code}
            </text>
            {pop.cityAt ? (
              <text x={pop.cityAt[0]} y={pop.cityAt[1]} textAnchor={pop.anchor} className="fill-ink-muted font-bp-mono" fontSize={10}>
                {pop.city}
              </text>
            ) : null}
            <text
              ref={(el) => {
                chips.current[i] = el
              }}
              x={pop.chipAt[0]}
              y={pop.chipAt[1]}
              textAnchor={g === WIDE ? 'end' : 'middle'}
              className="fill-ink-soft font-bp-mono"
              fontSize={g === WIDE ? 9.5 : 10}
              letterSpacing="0.08em"
            >
              —
            </text>
          </g>
        )
      })}

      {/* 区域护盾：画成管路图里的阀门符号 */}
      <g transform={`translate(${g.shield[0]} ${g.shield[1]})`}>
        <circle r={11} className="fill-paper stroke-ink" strokeWidth={1.4} />
        <path d="M-7.8 -7.8L7.8 7.8M-7.8 7.8L7.8 -7.8" className="stroke-ink" strokeWidth={1.1} />
      </g>

      {/* 源站 */}
      <Rack box={g.origin} ledRefs={leds} />
      <text x={g.originLabel[0]} y={g.originLabel[1]} textAnchor={g.originAnchor} className="bp-display fill-ink" fontSize={15}>
        ORIGIN
      </text>
      <text x={g.originLabel[0]} y={g.originLabel[1] + 16} textAnchor={g.originAnchor} className="fill-ink-muted font-bp-mono" fontSize={10}>
        api.internal · 1 region
      </text>

      {/* 引出号 */}
      {g.balloons.map((b) => (
        <g key={b.n}>
          <path d={`M${b.at[0]} ${b.at[1]}L${b.to[0]} ${b.to[1]}`} className="stroke-rule" strokeWidth={1} />
          <circle cx={b.to[0]} cy={b.to[1]} r={1.8} className="fill-ink" />
          <circle cx={b.at[0]} cy={b.at[1]} r={9} className="fill-paper stroke-ink" strokeWidth={1.1} />
          <text x={b.at[0]} y={b.at[1]} textAnchor="middle" dominantBaseline="central" className="fill-ink font-bp-mono" fontSize={10}>
            {b.n}
          </text>
        </g>
      ))}

      {showDimensions ? g.dims.map((dim) => <DimShape key={dim.label} dim={dim} />) : null}

      {/* 包：空心圆是请求，实心菱形是响应 */}
      {SLOT_IDS.map((i) => (
        <g
          key={i}
          opacity={0}
          ref={(el) => {
            slots.current[i]!.group = el
          }}
        >
          <line
            ref={(el) => {
              slots.current[i]!.trail = el
            }}
            x1={0}
            y1={0}
            x2={0}
            y2={0}
            className="stroke-ink"
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.35}
          />
          <circle
            ref={(el) => {
              slots.current[i]!.ring = el
            }}
            r={3.8}
            className="fill-paper stroke-ink"
            strokeWidth={1.7}
          />
          <rect
            ref={(el) => {
              slots.current[i]!.diamond = el
            }}
            x={-3.6}
            y={-3.6}
            width={7.2}
            height={7.2}
            transform="rotate(45)"
            className="fill-ink"
            opacity={0}
          />
        </g>
      ))}
    </svg>
  )
}

/** 首屏的请求路径图。宽容器里横排，窄容器里竖排（两张图只显示一张，隐藏的那张不会跑帧循环）。 */
export function Topology({ speed, showDimensions }: { speed: number; showDimensions: boolean }) {
  const title = 'Request path: four users reach their nearest edge PoP; cache misses travel through a regional shield to a single origin.'
  return (
    <>
      <Diagram geometry={WIDE} speed={speed} showDimensions={showDimensions} title={title} className="hidden @2xl:block" />
      <Diagram geometry={TALL} speed={speed} showDimensions={showDimensions} title={title} className="mx-auto block max-w-[440px] @2xl:hidden" />
    </>
  )
}
