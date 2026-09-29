// SPDX-License-Identifier: MIT
// Copyright (c) 2017 Pavel Dobryakov
// Source: https://github.com/PavelDoGreat/WebGL-Fluid-Simulation/blob/a2d2929/script.js
// Modified by Motif; see the item's provenance.
import { cn, useCanvasSize, useFrameLoop, usePrefersReducedMotion } from '@motif/runtime'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { createFluidEngine, type FluidConfig, type FluidEngine, type Rgb } from './fluid-engine'

/* @motif:defaults */
export const defaults = {
  dyeResolution: '1024',
  simResolution: '128',
  densityDissipation: 1.2,
  velocityDissipation: 0.2,
  pressure: 0.8,
  curl: 30,
  splatRadius: 0.25,
  splatForce: 6000,
  bloom: true,
  bloomIntensity: 0.8,
  colorful: true,
  seed: 7,
}
/* @motif:end */

export type FluidSimulationProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 确定性的伪随机数发生器（mulberry32）：同一个 seed 永远给出同一串数。 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const GOLDEN = 0.6180339887498949
const fract = (value: number) => value - Math.floor(value)

/** 单色模式下的色相：由 seed 决定（黄金比例分布，相邻 seed 的色相差很大）。 */
const baseHue = (seed: number) => fract(seed * GOLDEN)

function hsvToRgb(h: number, s: number, v: number): Rgb {
  const i = Math.floor(h * 6)
  const f = h * 6 - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)
  switch (((i % 6) + 6) % 6) {
    case 0:
      return { r: v, g: t, b: p }
    case 1:
      return { r: q, g: v, b: p }
    case 2:
      return { r: p, g: v, b: t }
    case 3:
      return { r: p, g: q, b: v }
    case 4:
      return { r: t, g: p, b: v }
    default:
      return { r: v, g: p, b: q }
  }
}

/** 上游的 generateColor：饱和的色相乘 0.15，叠加多次后才不会过曝。 */
const dyeColor = (hue: number, gain = 0.15): Rgb => {
  const c = hsvToRgb(hue, 1, 1)
  return { r: c.r * gain, g: c.g * gain, b: c.b * gain }
}

const STIRRERS = 3
/** 每隔多少秒来一轮随机的大斑点。 */
const BURST_PERIOD = 3.6

interface Stirrer {
  ax: number
  ay: number
  fx: number
  fy: number
  px: number
  py: number
}

/** 虚拟指针沿李萨如曲线游走，路径完全由 seed 决定。 */
function makeStirrers(seed: number): Stirrer[] {
  const rand = mulberry32(seed * 7919 + 13)
  return Array.from({ length: STIRRERS }, () => ({
    ax: 0.26 + rand() * 0.16,
    ay: 0.2 + rand() * 0.14,
    fx: 1.1 + rand() * 0.9,
    fy: 1.0 + rand() * 0.9,
    px: rand() * Math.PI * 2,
    py: rand() * Math.PI * 2,
  }))
}

function stirrerAt(s: Stirrer, t: number): [number, number] {
  return [0.5 + s.ax * Math.sin(s.fx * t + s.px), 0.5 + s.ay * Math.sin(s.fy * t * 0.83 + s.py)]
}

interface Pointer {
  x: number
  y: number
  dx: number
  dy: number
  moved: boolean
  hue: number
}

const toConfig = (o: typeof defaults): FluidConfig => ({
  simResolution: Number(o.simResolution),
  dyeResolution: Number(o.dyeResolution),
  densityDissipation: o.densityDissipation,
  velocityDissipation: o.velocityDissipation,
  pressure: o.pressure,
  curl: o.curl,
  splatRadius: o.splatRadius,
  bloom: o.bloom,
  bloomIntensity: o.bloomIntensity,
})

/** 全屏流体模拟背景：自己会流动，拖动指针可以搅动它。children 叠在流体之上。 */
export function FluidSimulation({ className, style, children, ...props }: FluidSimulationProps) {
  const options = { ...defaults, ...props }
  const optionsRef = useRef(options)
  optionsRef.current = options
  const reducedMotion = usePrefersReducedMotion()
  const reducedRef = useRef(reducedMotion)
  reducedRef.current = reducedMotion

  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<FluidEngine | null>(null)
  const pointers = useRef(new Map<number, Pointer>())
  const auto = useRef({ time: 0, burst: -1, stirrerKey: -1, stirrers: [] as Stirrer[] })
  const settled = useRef('')

  /** 一轮随机斑点：位置、方向、颜色都来自 seed 和轮次，不读 Math.random。 */
  const burst = (index: number, count: number) => {
    const engine = engineRef.current
    if (!engine) return
    const o = optionsRef.current
    const rand = mulberry32(o.seed * 104729 + index * 7 + 1)
    for (let i = 0; i < count; i++) {
      const hue = o.colorful ? rand() : fract(baseHue(o.seed) + (rand() - 0.5) * 0.08)
      const c = dyeColor(hue, 1.1)
      engine.splat(rand(), rand(), 1000 * (rand() - 0.5), 1000 * (rand() - 0.5), c)
    }
  }

  const autoplay = (time: number, dt: number, delta: number) => {
    const engine = engineRef.current
    if (!engine) return
    const o = optionsRef.current
    const state = auto.current
    const canvas = canvasRef.current
    const aspect = canvas ? canvas.width / Math.max(1, canvas.height) : 1
    if (state.stirrerKey !== o.seed) {
      state.stirrerKey = o.seed
      state.stirrers = makeStirrers(o.seed)
    }
    // 帧间隔超过一步模拟的上限时，按比例缩小力度，保持每秒注入量不变。
    const scale = delta > 0 ? dt / delta : 0
    const prev = Math.max(0, time - delta)
    state.stirrers.forEach((stirrer, index) => {
      const [x, y] = stirrerAt(stirrer, time)
      const [px, py] = stirrerAt(stirrer, prev)
      let dx = (x - px) * scale
      let dy = (y - py) * scale
      if (aspect < 1) dx *= aspect
      if (aspect > 1) dy /= aspect
      const hue = o.colorful ? fract(baseHue(o.seed) + index / STIRRERS + time * 0.06) : fract(baseHue(o.seed) + index * 0.012)
      engine.splat(x, y, dx * o.splatForce, dy * o.splatForce, dyeColor(hue, 0.11))
    })
    const index = Math.floor(time / BURST_PERIOD)
    if (index > state.burst) {
      state.burst = index
      if (index > 0) burst(index, 2 + (index % 3))
    }
  }

  const applyPointers = () => {
    const engine = engineRef.current
    if (!engine) return
    const o = optionsRef.current
    for (const pointer of pointers.current.values()) {
      if (!pointer.moved) continue
      pointer.moved = false
      engine.splat(pointer.x, pointer.y, pointer.dx * o.splatForce, pointer.dy * o.splatForce, dyeColor(pointer.hue))
    }
  }

  /** 减少动态效果：清空后放一轮斑点，快进模拟到一个好看的画面，之后只重画不再推进。 */
  const settle = () => {
    const engine = engineRef.current
    if (!engine) return
    const o = optionsRef.current
    engine.reset()
    burst(-1, 14)
    for (let i = 0; i < 150; i++) engine.step(1 / 60)
    settled.current = `${o.seed}|${o.colorful}|${o.simResolution}|${o.dyeResolution}|${o.densityDissipation}|${o.velocityDissipation}|${o.pressure}|${o.curl}|${o.splatRadius}`
  }

  const frame = (time: number, delta: number) => {
    const engine = engineRef.current
    if (!engine) return
    if (reducedRef.current) {
      const o = optionsRef.current
      const key = `${o.seed}|${o.colorful}|${o.simResolution}|${o.dyeResolution}|${o.densityDissipation}|${o.velocityDissipation}|${o.pressure}|${o.curl}|${o.splatRadius}`
      if (settled.current !== key) settle()
    } else if (delta > 0) {
      const dt = Math.min(delta, 1 / 60)
      autoplay(time, dt, delta)
      applyPointers()
      engine.step(dt)
    }
    engine.render()
  }
  const frameRef = useRef(frame)
  frameRef.current = frame
  const lastTime = useRef(0)

  useCanvasSize(canvasRef, {
    maxDpr: 1.5,
    onResize: () => {
      const engine = engineRef.current
      if (!engine) return
      engine.syncSize()
      engine.render()
    },
  })

  useEffect(() => {
    const canvas = canvasRef.current!
    const host = hostRef.current!
    let disposed = false
    const userRand = mulberry32(optionsRef.current.seed * 31 + 5)

    const setup = () => {
      const engine = createFluidEngine(canvas, () => toConfig(optionsRef.current))
      engineRef.current = engine
      if (!engine) return
      settled.current = ''
      auto.current.burst = -1
      // 开场先放一轮斑点，画面一出现就是活的。
      if (!reducedRef.current) burst(-1, 12)
      frameRef.current(lastTime.current, 0)
    }

    const onLost = (event: Event) => {
      event.preventDefault()
      engineRef.current = null
    }
    const onRestored = () => {
      if (!disposed) setup()
    }

    const local = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect()
      return { x: (event.clientX - rect.left) / Math.max(1, rect.width), y: 1 - (event.clientY - rect.top) / Math.max(1, rect.height), aspect: rect.width / Math.max(1, rect.height) }
    }
    const onDown = (event: PointerEvent) => {
      const { x, y } = local(event)
      const o = optionsRef.current
      const hue = o.colorful ? userRand() : baseHue(o.seed)
      pointers.current.set(event.pointerId, { x, y, dx: 0, dy: 0, moved: false, hue })
      host.setPointerCapture(event.pointerId)
    }
    const onMove = (event: PointerEvent) => {
      const pointer = pointers.current.get(event.pointerId)
      if (!pointer) return
      const { x, y, aspect } = local(event)
      let dx = x - pointer.x
      let dy = y - pointer.y
      if (aspect < 1) dx *= aspect
      if (aspect > 1) dy /= aspect
      pointer.x = x
      pointer.y = y
      pointer.dx = dx
      pointer.dy = dy
      pointer.moved = dx !== 0 || dy !== 0
      if (optionsRef.current.colorful) pointer.hue = fract(pointer.hue + 0.004)
      // 减少动态效果时模拟不在循环里推进，拖动时也不注入，保持静止。
    }
    const onUp = (event: PointerEvent) => {
      pointers.current.delete(event.pointerId)
      if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId)
    }

    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)
    host.addEventListener('pointerdown', onDown)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerup', onUp)
    host.addEventListener('pointercancel', onUp)
    setup()

    return () => {
      disposed = true
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      host.removeEventListener('pointerdown', onDown)
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerup', onUp)
      host.removeEventListener('pointercancel', onUp)
      const engine = engineRef.current
      engineRef.current = null
      engine?.dispose()
    }
  }, [])

  // 静态模式下参数变了要重新生成一帧。
  useEffect(() => {
    if (reducedMotion) frameRef.current(lastTime.current, 0)
  })

  useFrameLoop(
    hostRef,
    ({ time, delta }) => {
      lastTime.current = time
      frame(time, delta)
    },
    { speed: 1, reducedMotion: 'static', staticTime: 0 },
  )

  return (
    <div ref={hostRef} className={cn('relative isolate overflow-hidden bg-black', className)} style={{ touchAction: 'pan-y', ...style }}>
      <canvas ref={canvasRef} className="absolute inset-0 -z-10 block h-full w-full" />
      {children}
    </div>
  )
}
