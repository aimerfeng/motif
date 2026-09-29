// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Meng To
// Source: https://github.com/MengTo/threeui/blob/68802d5/src/shaders/bell-field/BellFieldBackground.tsx
// Modified by Motif; see the item's provenance.
import { bindFullscreenQuad, cn, createProgram, releaseContext, useCanvasSize, useFrameLoop, usePrefersReducedMotion } from '@/lib/motif-runtime'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { BELL_FIELD_FRAGMENT_SHADER, BELL_FIELD_VERTEX_SHADER } from './shaders'

/* @motif:defaults */
export const defaults = {
  speed: 1,
  strikeDuration: 2400,
  pointerAmount: 1,
  emberAmount: 1,
  hue: 0,
  saturation: 1,
  brightness: 1.4,
}
/* @motif:end */

export type BellFieldProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

type Uniform = 'u_resolution' | 'u_time' | 'u_mouse' | 'u_strike'
const UNIFORMS: Uniform[] = ['u_resolution', 'u_time', 'u_mouse', 'u_strike']

interface GLState {
  gl: WebGLRenderingContext
  uniforms: Record<Uniform, WebGLUniformLocation | null>
  dispose: () => void
}

/** 火星以归一化坐标存放，尺寸变化时不需要重新分布。 */
type Ember = { x: number; y: number; r: number; vy: number; vx: number; ph: number; sp: number; hot: boolean }

const MAX_EMBERS = 90
const STRIKE_FIRST = 1.7
const STRIKE_EVERY = 8.2
const STATIC_TIME = 2.7

function seeded(index: number, salt: number) {
  return Math.abs(Math.sin(index * 91.173 + salt * 17.719) * 43758.5453) % 1
}

const EMBERS: Ember[] = Array.from({ length: MAX_EMBERS }, (_, i) => ({
  x: seeded(i, 1),
  y: seeded(i, 2),
  r: 0.4 + seeded(i, 3) * 1.4,
  vy: -(0.1 + seeded(i, 4) * 0.26),
  vx: (seeded(i, 5) - 0.5) * 0.08,
  ph: seeded(i, 6) * Math.PI * 2,
  sp: 0.5 + seeded(i, 7) * 1.4,
  hot: seeded(i, 8) < 0.36,
}))

/** 受 Chladni 图形启发的钟体振动场：节线金属纹理、定时敲击的冲击环、指针牵引，以及升起的铸造火星。 */
export function BellField({ className, style, children, ...props }: BellFieldProps) {
  const options = { ...defaults, ...props }
  const optionsRef = useRef(options)
  optionsRef.current = options
  const reduced = usePrefersReducedMotion()

  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const emberRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<GLState | null>(null)
  const pointer = useRef({ targetX: 0.5, targetY: 0.5, x: 0.5, y: 0.5 })
  const embers = useRef(EMBERS.map((ember) => ({ ...ember })))
  const lastTime = useRef(STATIC_TIME)
  const clickStrike = useRef(-1e9)

  const drawEmbers = (time: number, delta: number) => {
    const canvas = emberRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    const o = optionsRef.current
    const width = Math.max(1, canvas.clientWidth)
    const height = Math.max(1, canvas.clientHeight)
    const dpr = canvas.width / width
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    context.clearRect(0, 0, width, height)
    const count = Math.max(0, Math.min(MAX_EMBERS, Math.round(58 * o.emberAmount)))
    // 上游按「每帧多少像素」移动；这里换算成每秒（60 帧），并用 delta 推进。
    const step = delta * 60
    for (let index = 0; index < count; index += 1) {
      const ember = embers.current[index]!
      ember.y += (ember.vy * step) / height
      ember.x += ((ember.vx + Math.sin(time * ember.sp * 0.5 + ember.ph) * 0.13) * step) / width
      if (ember.y < -0.01) {
        ember.y = 1.01
        ember.x = Math.random()
      }
      if (ember.x < -0.01) ember.x = 1.01
      if (ember.x > 1.01) ember.x = -0.01
      const twinkle = 0.5 + 0.5 * Math.sin(time * ember.sp + ember.ph)
      context.beginPath()
      context.arc(ember.x * width, ember.y * height, ember.r, 0, Math.PI * 2)
      context.fillStyle = ember.hot ? `rgba(231, 193, 101, ${0.06 + twinkle * 0.34})` : `rgba(143, 203, 185, ${0.04 + twinkle * 0.24})`
      context.fill()
    }
  }

  const draw = (time: number, delta: number) => {
    lastTime.current = time
    drawEmbers(time, delta)
    const state = glRef.current
    const canvas = canvasRef.current
    if (!state || !canvas) return
    const { gl, uniforms } = state
    const o = optionsRef.current
    const p = pointer.current
    p.x += (p.targetX - p.x) * 0.04
    p.y += (p.targetY - p.y) * 0.04
    // 定时敲击：第一次在 1.7 秒，之后每 8.2 秒一次；点击也会立即敲一下。
    const scheduled = time >= STRIKE_FIRST ? STRIKE_FIRST + Math.floor((time - STRIKE_FIRST) / STRIKE_EVERY) * STRIKE_EVERY : -1e9
    const lastStrike = Math.max(scheduled, clickStrike.current)
    const age = Math.min(1, Math.max(0, (time - lastStrike) / (o.strikeDuration / 1000)))
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height)
    gl.uniform1f(uniforms.u_time, time)
    gl.uniform1f(uniforms.u_strike, age)
    gl.uniform2f(uniforms.u_mouse, p.x * canvas.width, p.y * canvas.height)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
  const drawRef = useRef(draw)
  drawRef.current = draw

  const redraw = () => drawRef.current(lastTime.current, 0)
  useCanvasSize(canvasRef, { maxDpr: 1.5, onResize: redraw })
  useCanvasSize(emberRef, { maxDpr: 1.5, onResize: redraw })

  useEffect(() => {
    const canvas = canvasRef.current!
    const host = hostRef.current!
    let disposed = false

    const setup = () => {
      const gl = canvas.getContext('webgl', { alpha: false, antialias: false })
      if (!gl) return
      const program = createProgram(gl, BELL_FIELD_VERTEX_SHADER, BELL_FIELD_FRAGMENT_SHADER)
      gl.useProgram(program)
      const releaseQuad = bindFullscreenQuad(gl, program, 'position')
      const uniforms = Object.fromEntries(UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)])) as GLState['uniforms']
      glRef.current = {
        gl,
        uniforms,
        dispose: () => {
          releaseQuad()
          gl.deleteProgram(program)
        },
      }
      redraw()
    }

    const onLost = (event: Event) => {
      event.preventDefault()
      glRef.current = null
    }
    const onRestored = () => {
      if (!disposed) setup()
    }
    const onPointer = (event: PointerEvent) => {
      const bounds = host.getBoundingClientRect()
      const amount = optionsRef.current.pointerAmount
      const nx = (event.clientX - bounds.left) / Math.max(1, bounds.width)
      const ny = (event.clientY - bounds.top) / Math.max(1, bounds.height)
      pointer.current.targetX = 0.5 + (nx - 0.5) * amount
      pointer.current.targetY = 0.5 + (ny - 0.5) * amount
    }
    const onDown = () => {
      clickStrike.current = lastTime.current
    }

    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)
    host.addEventListener('pointermove', onPointer, { passive: true })
    host.addEventListener('pointerdown', onDown)
    setup()

    return () => {
      disposed = true
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      host.removeEventListener('pointermove', onPointer)
      host.removeEventListener('pointerdown', onDown)
      const state = glRef.current
      glRef.current = null
      if (state) {
        state.dispose()
        releaseContext(state.gl)
      }
    }
  }, [])

  useFrameLoop(hostRef, ({ time, delta }) => draw(reduced ? STATIC_TIME : time + STATIC_TIME, delta), {
    speed: options.speed,
    reducedMotion: 'static',
    staticTime: STATIC_TIME,
  })

  const filter = `hue-rotate(${options.hue}deg) saturate(${options.saturation}) brightness(${options.brightness})`
  return (
    <div ref={hostRef} className={cn('relative isolate overflow-hidden', className)} style={{ background: '#08100f', filter, ...style }}>
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 -z-20 block h-full w-full" />
      <canvas ref={emberRef} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 block h-full w-full" />
      {children}
    </div>
  )
}
