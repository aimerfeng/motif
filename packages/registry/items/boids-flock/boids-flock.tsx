// SPDX-License-Identifier: MIT
// Copyright (c) Animata
// Source: https://github.com/codse/animata/blob/36674e4/animata/background/boids-ecosystem.tsx
// Modified by Motif; see the item's provenance.
import { cn, useCanvasSize, useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from 'react'

/* @motif:defaults */
export const defaults = {
  count: 120,
  perception: 36,
  maxSpeed: 1.8,
  palette: ['#f5f5f4', '#fde68a', '#93c5fd', '#fca5a5'],
  background: '#0b0b12',
  agentShape: 'triangle',
  trailFade: 0.87,
  cursorRadius: 90,
  attractorStrength: 0.05,
}
/* @motif:end */

export interface BoidAgent {
  x: number
  y: number
  vx: number
  vy: number
  /** 在配色里的序号，配色变了直接换色。 */
  color: number
}

/**
 * Force point that pulls boids toward (x, y). Coordinates are normalized 0..1
 * across the canvas, so callers don't need to know the canvas pixel size.
 */
export interface BoidAttractor {
  x: number
  y: number
  /** 0 = no pull, 0.05 = gentle, 0.15 = strong. Defaults to attractorStrength. */
  strength?: number
  /** Pixel radius of influence. Default 220. */
  radius?: number
}

export type BoidsFlockProps = Partial<typeof defaults> & {
  /** Force points the flock is drawn toward. Read live, safe to mutate in place. */
  attractors?: BoidAttractor[]
  /** Receives the live agents array. Mutated in place by the simulation; do not drive React state from it. */
  agentsRef?: RefObject<BoidAgent[] | null>
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 上游每帧推进一步；这里固定 60 Hz，刷新率不同看起来也一样。 */
const STEP = 1 / 60
const MAX_STEPS = 4
/** 预先模拟的步数：第一帧就已经成群。 */
const WARMUP = 240
const SEED = 0xb01d

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

/** #rrggbb(aa) 加透明度。 */
function withAlpha(hex: string, alpha: number): string {
  const v = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) || 0)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** 一群小三角对齐、聚拢、保持间距地盘旋，指针靠近时四散。尺寸由 className 决定，children 叠在上面。 */
export function BoidsFlock({ attractors, agentsRef, className, style, children, ...props }: BoidsFlockProps) {
  const options = { ...defaults, ...props }
  // All non-`count` props are read from this ref each frame, so prop changes don't tear down the simulation.
  const liveRef = useRef({ ...options, attractors })
  liveRef.current = { ...options, attractors }

  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cursorRef = useRef({ x: 0, y: 0, active: false })
  const agents = useRef<BoidAgent[]>([])
  const bounds = useRef({ w: 0, h: 0 })
  const accumulator = useRef(0)

  const step = () => {
    const { cursorRadius: cr, attractors: atts, perception, maxSpeed, attractorStrength } = liveRef.current
    const { w: W, h: H } = bounds.current
    const list = agents.current
    for (const a of list) {
      let ax = 0
      let ay = 0
      let sx = 0
      let sy = 0
      let cx = 0
      let cy = 0
      let n = 0

      for (const b of list) {
        if (a === b) continue
        const dx = b.x - a.x
        const dy = b.y - a.y
        const d2 = dx * dx + dy * dy
        if (d2 < perception * perception) {
          ax += b.vx
          ay += b.vy
          cx += b.x
          cy += b.y
          if (d2 < 18 * 18 && d2 > 0.0001) {
            const d = Math.sqrt(d2)
            sx -= dx / d
            sy -= dy / d
          }
          n++
        }
      }
      if (n > 0) {
        a.vx += (ax / n - a.vx) * 0.04
        a.vy += (ay / n - a.vy) * 0.04
        a.vx += (cx / n - a.x) * 0.0006
        a.vy += (cy / n - a.y) * 0.0006
        a.vx += sx * 0.06
        a.vy += sy * 0.06
      }

      if (atts?.length) {
        for (const att of atts) {
          const dx = att.x * W - a.x
          const dy = att.y * H - a.y
          const d = Math.hypot(dx, dy) || 1
          const radius = att.radius ?? 220
          if (d < radius) {
            const f = ((radius - d) / radius) * (att.strength ?? attractorStrength)
            a.vx += (dx / d) * f
            a.vy += (dy / d) * f
          }
        }
      }

      if (cursorRef.current.active) {
        const dx = a.x - cursorRef.current.x
        const dy = a.y - cursorRef.current.y
        const d = Math.hypot(dx, dy)
        if (d < cr && d > 0) {
          const f = (cr - d) / cr
          a.vx += (dx / d) * f * 0.6
          a.vy += (dy / d) * f * 0.6
        }
      }

      const sp = Math.hypot(a.vx, a.vy)
      if (sp > maxSpeed) {
        a.vx = (a.vx / sp) * maxSpeed
        a.vy = (a.vy / sp) * maxSpeed
      }
      a.x += a.vx
      a.y += a.vy

      if (a.x < 0) a.x += W
      if (a.x > W) a.x -= W
      if (a.y < 0) a.y += H
      if (a.y > H) a.y -= H
    }
  }

  const draw = (fade: number) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const { background, palette, agentShape } = liveRef.current
    const { dpr } = size.current
    const { w: W, h: H } = bounds.current
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.globalAlpha = 1
    ctx.fillStyle = withAlpha(background, fade)
    ctx.fillRect(0, 0, W, H)

    const colors = palette.length > 0 ? palette : ['#ffffff']
    ctx.globalAlpha = 0.88
    for (const a of agents.current) {
      ctx.fillStyle = colors[a.color % colors.length]!
      if (agentShape === 'dot') {
        ctx.beginPath()
        ctx.arc(a.x, a.y, 1.8, 0, Math.PI * 2)
        ctx.fill()
      } else {
        const angle = Math.atan2(a.vy, a.vx)
        ctx.save()
        ctx.translate(a.x, a.y)
        ctx.rotate(angle)
        ctx.beginPath()
        ctx.moveTo(6, 0)
        ctx.lineTo(-4, 3)
        ctx.lineTo(-4, -3)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      }
    }
    ctx.globalAlpha = 1
  }
  const drawRef = useRef(draw)
  drawRef.current = draw

  /** 播种并预先模拟，最后一段连尾迹一起画出来。 */
  const reset = () => {
    const { width, height, dpr } = size.current
    const W = width / dpr
    const H = height / dpr
    bounds.current = { w: W, h: H }
    const rand = createRandom(SEED)
    const count = Math.max(1, Math.round(liveRef.current.count))
    const list: BoidAgent[] = []
    for (let i = 0; i < count; i++) {
      const a = rand() * Math.PI * 2
      const s = 0.6 + rand() * 0.6
      list.push({ x: rand() * W, y: rand() * H, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color: Math.floor(rand() * 60) })
    }
    agents.current = list
    if (agentsRef) agentsRef.current = list
    const warmup = W > 1 && H > 1 ? WARMUP : 0
    for (let i = 0; i < warmup; i++) {
      step()
      if (i >= warmup - 30) draw(i === warmup - 30 ? 1 : liveRef.current.trailFade)
    }
    if (warmup === 0) draw(1)
    accumulator.current = 0
  }
  const resetRef = useRef(reset)
  resetRef.current = reset

  const size = useCanvasSize(canvasRef, {
    maxDpr: 1.5,
    onResize: ({ width, height, dpr }) => {
      const W = width / dpr
      const H = height / dpr
      const prev = bounds.current
      if (prev.w <= 1 || prev.h <= 1 || agents.current.length === 0) {
        resetRef.current()
        return
      }
      // 尺寸变了按比例挪动位置，鸟群不重来。
      for (const a of agents.current) {
        a.x *= W / prev.w
        a.y *= H / prev.h
      }
      bounds.current = { w: W, h: H }
      drawRef.current(1)
    },
  })

  useEffect(() => {
    resetRef.current()
    return () => {
      if (agentsRef) agentsRef.current = null
    }
  }, [options.count, agentsRef])

  useFrameLoop(
    hostRef,
    ({ delta }) => {
      accumulator.current += delta
      let steps = 0
      while (accumulator.current >= STEP && steps < MAX_STEPS) {
        step()
        draw(liveRef.current.trailFade)
        accumulator.current -= STEP
        steps++
      }
      if (steps === MAX_STEPS) accumulator.current = 0
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  // 指针只在 host 上监听；叠在上面的 children 不拦截指针。
  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      cursorRef.current.x = x
      cursorRef.current.y = y
      cursorRef.current.active = x >= 0 && x <= r.width && y >= 0 && y <= r.height
    }
    const onLeave = () => {
      cursorRef.current.active = false
    }
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onLeave)
    return () => {
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onLeave)
    }
  }, [])

  return (
    <div ref={hostRef} className={cn('relative h-full w-full overflow-hidden', className)} style={style}>
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 block h-full w-full" style={{ background: options.background }} />
      {children && <div className="pointer-events-none relative z-10 flex h-full items-center justify-center">{children}</div>}
    </div>
  )
}
