// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Meng To
// Source: https://github.com/MengTo/threeui/blob/68802d5/src/shaders/stream-convergence/StreamConvergenceBackground.tsx
// Modified by Motif; see the item's provenance.
import { bindFullscreenQuad, cn, createProgram, releaseContext, useCanvasSize, useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { STREAM_CONVERGENCE_FRAGMENT_SHADER, STREAM_CONVERGENCE_VERTEX_SHADER } from './shaders'

/* @motif:defaults */
export const defaults = {
  speed: 1,
  fidelity: 0.3,
  scale: 1.1,
  hue: 0,
  saturation: 0.9,
  brightness: 1,
  opacity: 1,
}
/* @motif:end */

export type StreamConvergenceProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

type Uniform = 'u_resolution' | 'u_time' | 'u_interactive_fidelity'
const UNIFORMS: Uniform[] = ['u_resolution', 'u_time', 'u_interactive_fidelity']

interface GLState {
  gl: WebGLRenderingContext
  uniforms: Record<Uniform, WebGLUniformLocation | null>
  dispose: () => void
}

/** 三道色散分离的波前斜穿一片流动的暗场，四周渐隐成暗角。 */
export function StreamConvergence({ className, style, children, ...props }: StreamConvergenceProps) {
  const options = { ...defaults, ...props }
  const optionsRef = useRef(options)
  optionsRef.current = options

  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<GLState | null>(null)
  const lastTime = useRef(0)

  const draw = (time: number) => {
    const state = glRef.current
    const canvas = canvasRef.current
    if (!state || !canvas) return
    lastTime.current = time
    const { gl, uniforms } = state
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height)
    // 上游把毫秒乘以 0.0003；这里的 time 已经是秒，等价于 time * 0.3。
    gl.uniform1f(uniforms.u_time, time * 0.3)
    gl.uniform1f(uniforms.u_interactive_fidelity, optionsRef.current.fidelity)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
  const drawRef = useRef(draw)
  drawRef.current = draw

  useCanvasSize(canvasRef, { maxDpr: 1.5, onResize: () => drawRef.current(lastTime.current) })

  useEffect(() => {
    const canvas = canvasRef.current!
    let disposed = false

    const setup = () => {
      const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'high-performance' })
      if (!gl) return
      const program = createProgram(gl, STREAM_CONVERGENCE_VERTEX_SHADER, `precision highp float;\n${STREAM_CONVERGENCE_FRAGMENT_SHADER}`)
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
      drawRef.current(lastTime.current)
    }

    const onLost = (event: Event) => {
      event.preventDefault()
      glRef.current = null
    }
    const onRestored = () => {
      if (!disposed) setup()
    }
    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)
    setup()

    return () => {
      disposed = true
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      const state = glRef.current
      glRef.current = null
      if (state) {
        state.dispose()
        releaseContext(state.gl)
      }
    }
  }, [])

  useFrameLoop(hostRef, ({ time }) => draw(time), { speed: options.speed, reducedMotion: 'static', staticTime: 5 })

  // 色相、饱和度、亮度沿用上游做法：用 CSS 滤镜作用在画布上，不必改着色器。
  const filter = `hue-rotate(${options.hue}deg) saturate(${options.saturation}) brightness(${options.brightness})`

  return (
    <div ref={hostRef} className={cn('relative isolate overflow-hidden bg-black', className)} style={style}>
      <canvas ref={canvasRef} className="absolute inset-0 -z-10 block h-full w-full" style={{ opacity: options.opacity, filter, transform: `scale(${options.scale})` }} />
      {children}
    </div>
  )
}
