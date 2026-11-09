// SPDX-License-Identifier: MIT
// Copyright (c) 2023 onWidget
// Source: https://github.com/arthelokyo/astrowind/blob/14e1a69/src/components/widgets/Hero.astro
// Modified by Motif; see the item's provenance.
import { motion, useReducedMotion } from 'motion/react'
import { useId } from 'react'

/* 上游各区块的 Unsplash 照片在这里换成现画的 SVG：首屏的屋顶与太阳、步骤旁的服务范围图、省钱估算的回本曲线。 */

/* ---------- 首屏：屋顶、光伏板与太阳 ---------- */

// 屋面是一个平行四边形：屋脊左端 R0、屋脊右端 R1、屋檐左端 E0。
const R0 = [196, 176] as const
const R1 = [392, 176] as const
const E0 = [284, 250] as const

function onRoof(u: number, v: number) {
  const x = R0[0] + u * (R1[0] - R0[0]) + v * (E0[0] - R0[0])
  const y = R0[1] + u * (R1[1] - R0[1]) + v * (E0[1] - R0[1])
  return `${x.toFixed(1)},${y.toFixed(1)}`
}

function panelPolygons(cols: number, rows: number) {
  const polys: string[] = []
  const u0 = 0.07
  const u1 = 0.93
  const v0 = 0.14
  const v1 = 0.86
  const gap = 0.012
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ua = u0 + ((u1 - u0) * c) / cols + gap
      const ub = u0 + ((u1 - u0) * (c + 1)) / cols - gap
      const va = v0 + ((v1 - v0) * r) / rows + gap * 2
      const vb = v0 + ((v1 - v0) * (r + 1)) / rows - gap * 2
      polys.push([onRoof(ua, va), onRoof(ub, va), onRoof(ub, vb), onRoof(ua, vb)].join(' '))
    }
  }
  return polys
}

const PANELS = panelPolygons(5, 2)
const RAYS = Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2)

export function RoofIllustration({ className }: { className?: string }) {
  const reduced = useReducedMotion()
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 560 400" className={className} role="img" aria-label="A house with ten solar panels on its roof under the midday sun">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--tint)" />
          <stop offset="1" stopColor="var(--card)" />
        </linearGradient>
        <linearGradient id={`${id}-panel`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1e3a8a" />
          <stop offset="1" stopColor="#172554" />
        </linearGradient>
        <clipPath id={`${id}-roof`}>
          <polygon points={`${onRoof(0, 0)} ${onRoof(1, 0)} ${onRoof(1, 1)} ${onRoof(0, 1)}`} />
        </clipPath>
      </defs>

      <rect width="560" height="400" fill={`url(#${id}-sky)`} />

      {/* 太阳：光芒缓慢转动 */}
      <g transform="translate(446 96)">
        <motion.g
          animate={reduced ? undefined : { rotate: 360 }}
          transition={{ duration: 48, ease: 'linear', repeat: Infinity }}
          stroke="var(--primary)"
          strokeWidth="5"
          strokeLinecap="round"
        >
          {RAYS.map((a) => (
            <line key={a} x1={Math.cos(a) * 54} y1={Math.sin(a) * 54} x2={Math.cos(a) * 70} y2={Math.sin(a) * 70} />
          ))}
        </motion.g>
        <circle r="42" fill="var(--primary)" />
        <circle r="42" fill="#ffffff" opacity="0.18" />
      </g>

      {/* 远处的山丘与地面 */}
      <path d="M0 318c70-34 150-44 236-26 82 17 150 4 214-22 44-18 80-20 110-12V400H0z" fill="var(--primary)" opacity="0.14" />
      <path d="M0 350h560v50H0z" fill="var(--border)" />

      {/* 树 */}
      <rect x="78" y="292" width="8" height="60" rx="3" fill="#78716c" />
      <circle cx="82" cy="282" r="30" fill="#16a34a" opacity="0.85" />
      <circle cx="98" cy="300" r="18" fill="#15803d" opacity="0.85" />

      {/* 房子：山墙在左，长坡屋面在右 */}
      <polygon points="120,250 196,176 284,250 284,352 120,352" fill="var(--card)" stroke="var(--heading)" strokeOpacity="0.18" strokeWidth="2" />
      <polygon points="284,250 478,250 478,352 284,352" fill="var(--card)" stroke="var(--heading)" strokeOpacity="0.18" strokeWidth="2" />
      <polygon points="284,250 478,250 478,352 284,352" fill="var(--heading)" opacity="0.05" />
      <polygon points={`${onRoof(-0.04, -0.02)} ${onRoof(1.04, -0.02)} ${onRoof(1.04, 1.08)} ${onRoof(-0.04, 1.08)}`} fill="#475569" />
      <path d={`M${onRoof(-0.04, -0.02)} L${onRoof(1.04, -0.02)}`} stroke="#334155" strokeWidth="6" strokeLinecap="round" />

      {/* 光伏板 + 扫过的反光 */}
      <g>
        {PANELS.map((points) => (
          <polygon key={points} points={points} fill={`url(#${id}-panel)`} stroke="#93c5fd" strokeOpacity="0.55" strokeWidth="1.2" />
        ))}
      </g>
      <g clipPath={`url(#${id}-roof)`}>
        <g transform="skewX(-28)">
          <motion.rect
            x="150"
            y="150"
            width="46"
            height="140"
            fill="#ffffff"
            opacity="0.22"
            initial={false}
            animate={reduced ? { x: 260 } : { x: [0, 420] }}
            transition={reduced ? { duration: 0 } : { duration: 2.6, ease: 'easeInOut', repeat: Infinity, repeatDelay: 2.2 }}
          />
        </g>
      </g>

      {/* 窗、门、圆窗 */}
      <circle cx="202" cy="232" r="11" fill="var(--tint)" stroke="var(--heading)" strokeOpacity="0.2" strokeWidth="2" />
      <rect x="182" y="290" width="40" height="62" rx="3" fill="var(--primary)" opacity="0.85" />
      <circle cx="214" cy="322" r="2.5" fill="var(--primary-foreground)" />
      <rect x="312" y="276" width="56" height="42" rx="3" fill="var(--tint)" stroke="var(--heading)" strokeOpacity="0.2" strokeWidth="2" />
      <rect x="396" y="276" width="56" height="42" rx="3" fill="var(--tint)" stroke="var(--heading)" strokeOpacity="0.2" strokeWidth="2" />
      <path d="M340 276v42M424 276v42" stroke="var(--heading)" strokeOpacity="0.2" strokeWidth="2" />

      {/* 逆变器与电表 */}
      <rect x="488" y="292" width="26" height="36" rx="4" fill="var(--card)" stroke="var(--heading)" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M501 300l-5 9h7l-4 9" stroke="var(--primary)" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M478 310h10" stroke="var(--heading)" strokeOpacity="0.25" strokeWidth="2" />
    </svg>
  )
}

/* ---------- 步骤旁：抽象的服务范围图 ---------- */

const W = 480
const H = 400
export const DEPOTS = [
  { name: 'Alder Creek', x: 130, y: 132 },
  { name: 'Marlow', x: 318, y: 96 },
  { name: 'Easton Bay', x: 262, y: 266 },
] as const

type Dot = { x: number; y: number; level: number }

function buildDots(): Dot[] {
  const dots: Dot[] = []
  const step = 20
  for (let row = 0; row * step * 0.87 < H - 10; row++) {
    const y = 14 + row * step * 0.87
    for (let col = 0; col * step < W - 10; col++) {
      const x = 14 + col * step + (row % 2 ? step / 2 : 0)
      // 右下角是海湾，左上角留一道河，形成像地图的轮廓。
      const bay = (x - 500) ** 2 + (y - 420) ** 2 < 175 ** 2
      const river = Math.abs(y - (24 + x * 0.48 + Math.sin(x / 34) * 14)) < 7 && x < 220
      if (bay || river) continue
      let level = 0
      for (const depot of DEPOTS) {
        const d2 = (x - depot.x) ** 2 + (y - depot.y) ** 2
        level = Math.max(level, Math.exp(-d2 / (2 * 78 ** 2)))
      }
      dots.push({ x, y, level })
    }
  }
  return dots
}

const DOTS = buildDots()

export function CoverageMap({ brand }: { brand: string }) {
  return (
    <figure className="relative w-full overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-lg">
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`Map of the three ${brand} depots and the area each one covers`}>
          <rect width={W} height={H} fill="var(--tint)" />
          {DOTS.map((dot) => {
            const covered = dot.level > 0.42
            const near = dot.level > 0.2
            return (
              <circle
                key={`${dot.x}-${dot.y}`}
                cx={dot.x}
                cy={dot.y}
                r={covered ? 5.4 : 4.4}
                fill={near ? 'var(--primary)' : 'var(--heading)'}
                opacity={covered ? 0.55 + dot.level * 0.45 : near ? 0.32 : 0.1}
              />
            )
          })}
          {DEPOTS.map((depot) => (
            <g key={depot.name} transform={`translate(${depot.x} ${depot.y})`}>
              <circle r="15" fill="var(--card)" stroke="var(--primary)" strokeWidth="3" />
              <circle r="5" fill="var(--heading)" />
            </g>
          ))}
        </svg>
        {DEPOTS.map((depot) => (
          <span
            key={depot.name}
            className="absolute -translate-x-1/2 translate-y-5 rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap text-foreground shadow-sm"
            style={{ left: `${(depot.x / W) * 100}%`, top: `${(depot.y / H) * 100}%` }}
          >
            {depot.name}
          </span>
        ))}
      </div>
      <figcaption className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border px-4 py-3 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-primary" aria-hidden />
          Same-week site visit
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-primary opacity-40" aria-hidden />
          Within two weeks
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5 rounded-full border-2 border-primary bg-card" aria-hidden />
          Depot
        </span>
      </figcaption>
    </figure>
  )
}

/* ---------- 省钱估算：回本曲线 ---------- */

export type Estimate = {
  usage: number
  size: number
  panels: number
  price: number
  firstYear: number
  points: number[]
  payback: number | null
  total: number
}

export const YEARS = 25

/** 粗略的家用光伏模型：按 90% 用电量定装机，含固定的许可与验收费用、组件每年 0.5% 衰减、电价每年涨 3%。 */
export function estimate(bill: number, centsPerKwh: number, sunHours: number): Estimate {
  const rate = centsPerKwh / 100
  const usage = bill / rate
  const perKw = sunHours * 365 * 0.8
  const size = Math.min(16, Math.max(2, Math.round(((usage * 12 * 0.9) / perKw) * 10) / 10))
  const panels = Math.round((size * 1000) / 410)
  const price = Math.round((1500 + size * 2450) / 100) * 100
  const points: number[] = []
  let cumulative = -price
  let payback: number | null = null
  let firstYear = 0
  for (let year = 0; year <= YEARS; year++) {
    points.push(cumulative)
    if (year === YEARS) break
    const produced = Math.min(size * perKw * (1 - 0.005 * year), usage * 12)
    const saved = produced * rate * 1.03 ** year
    if (year === 0) firstYear = saved
    const next = cumulative + saved
    if (payback === null && cumulative < 0 && next >= 0) payback = year + -cumulative / saved
    cumulative = next
  }
  return { usage, size, panels, price, firstYear, points, payback, total: cumulative }
}

function niceStep(span: number) {
  const raw = span / 4
  const pow = 10 ** Math.floor(Math.log10(raw))
  const n = raw / pow
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * pow
}

export const money = (value: number) => `${value < 0 ? '−' : ''}$${Math.abs(Math.round(value)).toLocaleString('en-US')}`
const short = (value: number) => (Math.abs(value) >= 1000 ? `${value < 0 ? '−' : ''}$${Math.round(Math.abs(value) / 1000)}k` : money(value))

export function PaybackChart({ data }: { data: Estimate }) {
  const reduced = useReducedMotion()
  const id = useId().replace(/:/g, '')
  const lo = Math.min(...data.points)
  const hi = Math.max(data.points[YEARS]!, data.price * 0.3)
  const step = niceStep(hi - lo)
  const min = Math.floor(lo / step) * step
  const max = Math.ceil(hi / step) * step
  const ticks: number[] = []
  for (let t = min; t <= max + step / 2; t += step) ticks.push(t)
  const VW = 600
  const VH = 240
  const px = (year: number) => (year / YEARS) * VW
  const py = (value: number) => VH - ((value - min) / (max - min)) * VH
  const line = data.points.map((v, i) => `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(' ')
  const area = `${line} L${VW} ${py(0).toFixed(1)} L0 ${py(0).toFixed(1)} Z`
  const transition = reduced ? { duration: 0 } : { type: 'spring' as const, visualDuration: 0.45, bounce: 0.1 }

  return (
    <div className="relative pl-12">
      <div className="relative h-56 @3xl:h-64">
        {ticks.map((t) => (
          <span key={t} className="absolute -left-12 w-10 -translate-y-1/2 text-right text-xs text-muted-foreground tabular-nums" style={{ top: `${(py(t) / VH) * 100}%` }}>
            {short(t)}
          </span>
        ))}
        <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          <defs>
            <clipPath id={`${id}-above`}>
              <rect x="0" y="-20" width={VW} height={py(0) + 20} />
            </clipPath>
          </defs>
          {ticks.map((t) => (
            <line key={t} x1="0" x2={VW} y1={py(t)} y2={py(t)} stroke="var(--border)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
          <motion.path initial={false} animate={{ d: area }} transition={transition} fill="var(--primary)" opacity="0.22" clipPath={`url(#${id}-above)`} />
          <line x1="0" x2={VW} y1={py(0)} y2={py(0)} stroke="var(--heading)" strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
          <motion.path initial={false} animate={{ d: line }} transition={transition} fill="none" stroke="var(--accent-ink)" strokeWidth="3" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
        {data.payback !== null && (
          <span
            className="absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[var(--card)] bg-[var(--accent-ink)] shadow"
            style={{ left: `${(data.payback / YEARS) * 100}%`, top: `${(py(0) / VH) * 100}%` }}
            aria-hidden
          />
        )}
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground tabular-nums" aria-hidden>
        {[0, 5, 10, 15, 20, 25].map((year) => (
          <span key={year}>{year === 0 ? 'Now' : `${year}y`}</span>
        ))}
      </div>
    </div>
  )
}
