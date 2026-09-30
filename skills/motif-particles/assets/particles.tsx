// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/particles.tsx
// Modified by Motif; see the item's provenance.
import { cn, useCanvasSize, useFrameLoop } from '@/lib/motif-runtime'
import { useEffect, useRef, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  quantity: 240,
  size: 2,
  colors: ['#ffffff', '#a5b4fc', '#f0abfc'],
  vx: 0,
  vy: -8,
  pointerPull: 1,
  ease: 50,
  seed: 7,
}
/* @motif:end */

export type ParticlesProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
}

interface Particle {
  x: number
  y: number
  translateX: number
  translateY: number
  radius: number
  targetAlpha: number
  /** 自身的随机漂移，单位像素每秒。 */
  dx: number
  dy: number
  magnetism: number
  color: number
  /** 已存在的秒数，新生成的粒子用它淡入。 */
  age: number
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

function parseRgb(hex: string): string {
  const value = hex.replace('#', '')
  const channel = (index: number) => parseInt(value.slice(index * 2, index * 2 + 2), 16)
  return `${channel(0)}, ${channel(1)}, ${channel(2)}`
}

/** 漂浮、明暗交替的细小光点，随指针轻微位移。指针事件穿透，尺寸由 className 决定（如 absolute inset-0）。 */
export function Particles({ className, style, ...props }: ParticlesProps) {
  const options = { ...defaults, ...props }
  const optionsRef = useRef(options)
  optionsRef.current = options

  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const random = useRef(createRandom(options.seed))
  const area = useRef({ width: 0, height: 0, dpr: 1 })
  // 指针相对画布中心的位置（CSS 像素）。
  const mouse = useRef({ x: 0, y: 0 })

  const spawn = (age: number): Particle => {
    const rand = random.current
    const { width, height } = area.current
    return {
      x: rand() * width,
      y: rand() * height,
      translateX: 0,
      translateY: 0,
      radius: optionsRef.current.size * (0.5 + rand()),
      targetAlpha: 0.25 + rand() * 0.7,
      dx: (rand() - 0.5) * 6,
      dy: (rand() - 0.5) * 6,
      magnetism: 0.1 + rand() * 4,
      color: Math.floor(rand() * 1000),
      age,
    }
  }

  const reset = () => {
    random.current = createRandom(optionsRef.current.seed)
    particles.current = Array.from({ length: optionsRef.current.quantity }, () => spawn(1))
  }

  const step = (delta: number) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const o = optionsRef.current
    const { width, height, dpr } = area.current
    const list = particles.current

    // 数量变化时增减粒子，不重建其余粒子。
    while (list.length < o.quantity) list.push(spawn(0))
    if (list.length > o.quantity) list.length = o.quantity

    const palette = o.colors.map(parseRgb)
    const follow = 1 - Math.pow(1 - 1 / Math.max(1, o.ease), delta * 60)
    const pull = o.pointerPull / 50

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)

    for (let index = 0; index < list.length; index++) {
      let p = list[index]!
      p.age += delta
      p.x += (p.dx + o.vx) * delta
      p.y += (p.dy + o.vy) * delta
      p.translateX += (mouse.current.x * p.magnetism * pull - p.translateX) * follow
      p.translateY += (mouse.current.y * p.magnetism * pull - p.translateY) * follow

      // 靠近边缘时淡出，新生成的粒子用一秒淡入。
      const edge = Math.min(p.x + p.translateX - p.radius, width - p.x - p.translateX - p.radius, p.y + p.translateY - p.radius, height - p.y - p.translateY - p.radius)
      const alpha = p.targetAlpha * Math.min(1, Math.max(0, edge / 20)) * Math.min(1, p.age)

      if (p.x < -p.radius || p.x > width + p.radius || p.y < -p.radius || p.y > height + p.radius) {
        p = spawn(0)
        list[index] = p
        continue
      }
      ctx.beginPath()
      ctx.arc(p.x + p.translateX, p.y + p.translateY, p.radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${palette[p.color % palette.length]}, ${alpha})`
      ctx.fill()
    }
  }
  const stepRef = useRef(step)
  stepRef.current = step
  const resetRef = useRef(reset)
  resetRef.current = reset

  useCanvasSize(canvasRef, {
    maxDpr: 2,
    onResize: ({ width, height, dpr }) => {
      area.current = { width: width / dpr, height: height / dpr, dpr }
      reset()
      stepRef.current(0)
    },
  })

  // 种子变化时整体重新生成。
  useEffect(() => {
    resetRef.current()
    stepRef.current(0)
  }, [options.seed])

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left - rect.width / 2
      const y = event.clientY - rect.top - rect.height / 2
      if (Math.abs(x) <= rect.width / 2 && Math.abs(y) <= rect.height / 2) mouse.current = { x, y }
    }
    window.addEventListener('pointermove', onPointer, { passive: true })
    return () => window.removeEventListener('pointermove', onPointer)
  }, [])

  useFrameLoop(hostRef, ({ delta }) => step(delta), { reducedMotion: 'static', staticTime: 0 })

  return (
    <div ref={hostRef} aria-hidden className={cn('pointer-events-none overflow-hidden', className)} style={style}>
      <canvas ref={canvasRef} className="block size-full" />
    </div>
  )
}
