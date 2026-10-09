// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Meng To
// Source: https://github.com/MengTo/threeui/blob/68802d5/src/shaders/liquid-form/LiquidFormBackground.tsx
// Modified by Motif; see the item's provenance.
import { bindFullscreenQuad, cn, createProgram, releaseContext, useCanvasSize, useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { VELOX_FRAGMENT_SHADER, VELOX_VERTEX_SHADER } from './shaders'

/* @motif:defaults */
export const defaults = {
  speed: 1,
  morph: 1,
  noiseScale: 1,
  mouseAmount: 0.15,
  metal: 1.2,
  camera: 5.5,
  tintHue: 220,
  tintAmount: 0,
  background: '#0b0b0e',
}
/* @motif:end */

export type LiquidFormProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

type Uniform = 'u_res' | 'u_time' | 'u_mouse' | 'u_morph' | 'u_noise_scale' | 'u_mouse_amount' | 'u_metal' | 'u_camera'
const UNIFORMS: Uniform[] = ['u_res', 'u_time', 'u_mouse', 'u_morph', 'u_noise_scale', 'u_mouse_amount', 'u_metal', 'u_camera']

interface GLState {
  gl: WebGLRenderingContext
  uniforms: Record<Uniform, WebGLUniformLocation | null>
  dispose: () => void
}

/** 居中的一团光线步进液态银，表面随噪声缓慢变形，指针移动时反射跟着偏转。 */
export function LiquidForm({ className, style, children, ...props }: LiquidFormProps) {
  const options = { ...defaults, ...props }
  const optionsRef = useRef(options)
  optionsRef.current = options

  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<GLState | null>(null)
  const pointer = useRef({ targetX: 0, targetY: 0, x: 0, y: 0 })
  const lastTime = useRef(0)

  const draw = (time: number) => {
    const state = glRef.current
    const canvas = canvasRef.current
    if (!state || !canvas) return
    lastTime.current = time
    const { gl, uniforms } = state
    const o = optionsRef.current
    const p = pointer.current
    p.x += (p.targetX - p.x) * 0.05
    p.y += (p.targetY - p.y) * 0.05
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(uniforms.u_res, canvas.width, canvas.height)
    gl.uniform1f(uniforms.u_time, time)
    gl.uniform2f(uniforms.u_mouse, p.x, p.y)
    gl.uniform1f(uniforms.u_morph, o.morph)
    gl.uniform1f(uniforms.u_noise_scale, o.noiseScale)
    gl.uniform1f(uniforms.u_mouse_amount, o.mouseAmount)
    gl.uniform1f(uniforms.u_metal, o.metal)
    gl.uniform1f(uniforms.u_camera, o.camera)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
  const drawRef = useRef(draw)
  drawRef.current = draw

  // 尺寸变化时立刻重画一帧（暂停或静态模式下也不会出现拉伸的旧画面）。
  useCanvasSize(canvasRef, { maxDpr: 1.5, onResize: () => drawRef.current(lastTime.current) })

  useEffect(() => {
    const canvas = canvasRef.current!
    const host = hostRef.current!
    let disposed = false

    const setup = () => {
      const gl = canvas.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'high-performance' })
      if (!gl) return
      const program = createProgram(gl, VELOX_VERTEX_SHADER, VELOX_FRAGMENT_SHADER)
      gl.useProgram(program)
      const releaseQuad = bindFullscreenQuad(gl, program)
      const uniforms = Object.fromEntries(UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)])) as GLState['uniforms']
      glRef.current = {
        gl,
        uniforms,
        dispose: () => {
          releaseQuad()
          gl.deleteProgram(program)
        },
      }
      drawRef.current(lastTime.current)
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
      pointer.current.targetX = ((event.clientX - bounds.left) / Math.max(1, bounds.width)) * 2 - 1
      pointer.current.targetY = -(((event.clientY - bounds.top) / Math.max(1, bounds.height)) * 2 - 1)
    }

    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)
    host.addEventListener('pointermove', onPointer, { passive: true })
    setup()

    return () => {
      disposed = true
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      host.removeEventListener('pointermove', onPointer)
      const state = glRef.current
      glRef.current = null
      if (state) {
        state.dispose()
        releaseContext(state.gl)
      }
    }
  }, [])

  useFrameLoop(hostRef, ({ time }) => draw(time), { speed: options.speed, reducedMotion: 'static', staticTime: 2.4 })

  // 着色器输出的是银色；色调用 CSS 滤镜叠加，tintAmount 为 0 时与原作完全一致。
  const tint = options.tintAmount > 0 ? `sepia(${options.tintAmount}) saturate(${1 + options.tintAmount * 5}) hue-rotate(${options.tintHue - 35}deg)` : undefined

  return (
    <div
      ref={hostRef}
      className={cn('relative isolate overflow-hidden', className)}
      // 背景在液态银后面略微提亮，形体和背景分得开。
      style={{ background: `radial-gradient(55% 55% at 50% 48%, color-mix(in oklab, ${options.background}, white 7%), ${options.background})`, ...style }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 -z-10 block h-full w-full" style={{ filter: tint }} />
      {children}
    </div>
  )
}
