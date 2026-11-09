// SPDX-License-Identifier: MIT
// Copyright (c) Animata
// Source: https://github.com/codse/animata/blob/36674e4/animata/button/ai-button.tsx
// Modified by Motif; see the item's provenance.
import { useRef, useState, type CSSProperties } from 'react'
import { cn, useCanvasSize, useFrameLoop } from '@/lib/motif-runtime'

/* @motif:defaults */
export const defaults = {
  label: 'Generate thumbnails',
  gradient: ['#93c5fd', '#3b82f6', '#a855f7'],
  starColors: ['#7c3aed', '#bae6fd', '#a78bfa', '#93c5fd', '#0284c7', '#fafafa', '#38bdf8'],
  starCount: 20,
  pullStrength: 1,
  twinkleSpeed: 1,
  hoverScale: 1.1,
}
/* @motif:end */

export type AiSparkleButtonProps = Partial<typeof defaults> & {
  /** 从外部控制悬停状态（例如演示里的自动播放）；不传时跟随真实指针。 */
  active?: boolean
  onClick?: () => void
  className?: string
  style?: CSSProperties
}

const SPARKLE_PATH =
  'M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z'

function Sparkle({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <path d={SPARKLE_PATH} />
    </svg>
  )
}

function luminance(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return 0.2
  const n = parseInt(m[1]!, 16)
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * ch[0]! + 0.7152 * ch[1]! + 0.0722 * ch[2]!
}

function gradientOf(colors: string[], alpha = 1) {
  const first = colors[0] ?? '#3b82f6'
  const list = colors.length > 1 ? colors : [first, first]
  const stops = list.map((c, i) => {
    // 三色时中间一站放在 40%，与上游 via-40% 一致。
    const at = list.length === 3 && i === 1 ? 40 : (i / (list.length - 1)) * 100
    const col = alpha < 1 ? `color-mix(in srgb, ${c} ${alpha * 100}%, transparent)` : c
    return `${col} ${at}%`
  })
  return `linear-gradient(to right, ${stops.join(', ')})`
}

interface Star {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  rot: number
  spin: number
  color: string
  age: number
  dead: boolean
}

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function AiSparkleButton({ active, onClick, className, style, ...props }: AiSparkleButtonProps) {
  const options = { ...defaults, ...props }
  const { label, gradient, twinkleSpeed, hoverScale } = options
  const [hovering, setHovering] = useState(false)
  const isActive = active ?? hovering

  const buttonRef = useRef<HTMLButtonElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const size = useCanvasSize(canvasRef, { maxDpr: 2 })
  const optionsRef = useRef(options)
  optionsRef.current = options
  const activeRef = useRef(isActive)
  activeRef.current = isActive
  const sim = useRef<{ stars: Star[]; rand: () => number; spawn: number } | null>(null)

  // tsparticles 的 emitter + absorber 换成一个小循环：星星漂移、自转，被吸向中心后消失，悬停时持续补充。
  useFrameLoop(
    buttonRef,
    ({ delta }) => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return
      const { width, height, dpr } = size.current
      const w = width / dpr
      const h = height / dpr
      const o = optionsRef.current
      const colors = o.starColors.length ? o.starColors : ['#fafafa']
      // 吸收点：上游 absorber 位于按钮中间略偏左的位置。
      const ax = w * 0.45
      const ay = h * 0.5

      if (!sim.current) sim.current = { stars: [], rand: mulberry32(7), spawn: 0 }
      const s = sim.current
      const rand = s.rand
      const make = (fill: boolean): Star => {
        let x = 0
        let y = 0
        for (let i = 0; i < 8; i++) {
          x = rand() * w
          y = rand() * h
          if (Math.hypot(x - ax, y - ay) > Math.min(w, h) * 0.45) break
        }
        const ang = rand() * Math.PI * 2
        const sp = 20 + rand() * 40
        return {
          x,
          y,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          r: 1 + rand() * 3,
          rot: rand() * Math.PI * 2,
          spin: 1 + rand() * 2.5,
          color: colors[Math.floor(rand() * colors.length)] ?? '#fafafa',
          age: fill ? 1 : 0,
          dead: false,
        }
      }
      const count = Math.round(o.starCount)
      // 上游 emitter 用 fill: true，一开始就铺满数量。
      if (s.stars.length === 0) for (let i = 0; i < count; i++) s.stars.push(make(true))

      const dt = Math.min(delta, 0.05)
      for (const p of s.stars) {
        const dx = ax - p.x
        const dy = ay - p.y
        const d = Math.hypot(dx, dy) || 1
        const acc = (o.pullStrength * 9000) / (d + 12)
        p.vx += (dx / d) * acc * dt
        p.vy += (dy / d) * acc * dt
        const v = Math.hypot(p.vx, p.vy)
        const max = 160 + 80 * o.pullStrength
        if (v > max) {
          p.vx *= max / v
          p.vy *= max / v
        }
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.rot += p.spin * dt
        p.age = Math.min(1, p.age + dt * 2.5)
        if (d < 3 + p.r) p.dead = true
      }
      // 悬停时持续补充：每 0.5 秒最多 5 颗（上游 emitter rate）。
      s.spawn += dt
      const alive = s.stars.filter((p) => !p.dead)
      if (activeRef.current && s.spawn >= 0.5) {
        s.spawn = 0
        for (let i = 0; i < 5 && alive.length < count; i++) alive.push(make(false))
      }
      if (alive.length > count) alive.length = count
      s.stars = alive

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      for (const p of s.stars) {
        const d = Math.hypot(ax - p.x, ay - p.y)
        const shrink = Math.min(1, d / 18)
        const r = p.r * (0.4 + 0.6 * shrink)
        ctx.globalAlpha = 0.8 * p.age
        ctx.fillStyle = p.color
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.beginPath()
        for (let i = 0; i < 8; i++) {
          const rr = i % 2 === 0 ? r : r / 2
          const a = (i * Math.PI) / 4
          if (i === 0) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr)
          else ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr)
        }
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      }
      ctx.globalAlpha = 1
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  const meanLum = gradient.reduce((sum, c) => sum + luminance(c), 0) / Math.max(1, gradient.length)
  const ink = meanLum > 0.45 ? '#0f172a' : '#ffffff'
  const tw = Math.max(0.1, twinkleSpeed)
  const sparkle = (delay: number, duration = 2): CSSProperties => ({
    animationDelay: `${delay / tw}s`,
    animationDuration: `${duration / tw}s`,
  })

  return (
    <button
      ref={buttonRef}
      type="button"
      data-active={isActive || undefined}
      className={cn(
        'group/ai relative rounded-full p-1 transition-transform hover:scale-(--sab-scale) active:scale-105 data-active:scale-(--sab-scale) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring motion-reduce:transition-none',
        className,
      )}
      style={{ '--sab-scale': hoverScale, backgroundImage: gradientOf(gradient, 0.3), color: ink, ...style } as CSSProperties}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
      onClick={onClick}
    >
      <div className="relative flex items-center justify-center gap-2 rounded-full px-4 py-2" style={{ backgroundImage: gradientOf(gradient) }}>
        <Sparkle className="sab-sparkle size-6 -translate-y-0.5" style={sparkle(0)} />
        <Sparkle className="sab-sparkle absolute bottom-2.5 left-3.5 z-20 size-2 rotate-12" style={sparkle(1)} />
        <Sparkle className="sab-sparkle absolute left-5 top-2.5 size-1 -rotate-12" style={sparkle(1.5, 2.5)} />
        <Sparkle className="sab-sparkle absolute left-3 top-3 size-1.5" style={sparkle(0.5, 2.5)} />

        <span className="whitespace-nowrap font-semibold">{label}</span>
      </div>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute -inset-4 z-0 h-[calc(100%+2rem)] w-[calc(100%+2rem)] transition-opacity',
          isActive ? 'opacity-100' : 'opacity-0',
        )}
      />
    </button>
  )
}
