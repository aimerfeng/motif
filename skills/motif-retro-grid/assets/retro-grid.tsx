// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/retro-grid.tsx
// Modified by Motif; see the item's provenance.
import { bindFullscreenQuad, cn, createProgram, releaseContext, useCanvasSize, useFrameLoop } from '@/lib/motif-runtime'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { FRAGMENT_SHADER, VERTEX_SHADER } from './shaders'

/* @motif:defaults */
export const defaults = {
  angle: 68,
  cellSize: 60,
  lineWidth: 1,
  lineColor: '#8b8bff',
  opacity: 0.6,
  glowColor: '#5b21b6',
  glowAmount: 0.6,
  fade: 0.7,
  speed: 1,
}
/* @motif:end */

export type RetroGridProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

type Uniform = 'u_angle' | 'u_cell_size' | 'u_container_size' | 'u_device_pixel_ratio' | 'u_line_color' | 'u_line_width' | 'u_scroll' | 'u_viewport_size'
const UNIFORMS: Uniform[] = ['u_angle', 'u_cell_size', 'u_container_size', 'u_device_pixel_ratio', 'u_line_color', 'u_line_width', 'u_scroll', 'u_viewport_size']

interface GLState {
  gl: WebGLRenderingContext
  uniforms: Record<Uniform, WebGLUniformLocation | null>
  dispose: () => void
}

/** #rrggbb 或 #rrggbbaa 转成 0–1 的 RGBA。 */
function parseColor(hex: string): [number, number, number, number] {
  const value = hex.replace('#', '')
  const channel = (index: number) => parseInt(value.slice(index * 2, index * 2 + 2), 16) / 255
  return [channel(0), channel(1), channel(2), value.length >= 8 ? channel(3) : 1]
}

/** 透视倾斜的无限网格缓缓向观察者滚来，远处逐级合并线条。放在需要 position: relative 的容器里，尺寸由 className 决定。 */
export function RetroGrid({ className, style, children, ...props }: RetroGridProps) {
  const options = { ...defaults, ...props }
  const optionsRef = useRef(options)
  optionsRef.current = options

  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<GLState | null>(null)
  const lastTime = useRef(0)
  const [unsupported, setUnsupported] = useState(false)

  const draw = (time: number) => {
    const state = glRef.current
    const canvas = canvasRef.current
    if (!state || !canvas) return
    lastTime.current = time
    const { gl, uniforms } = state
    const o = optionsRef.current
    const dpr = canvas.clientWidth > 0 ? canvas.width / canvas.clientWidth : 1
    const width = canvas.width / dpr
    const height = canvas.height / dpr
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.uniform1f(uniforms.u_angle, Math.min(89, Math.max(1, o.angle)))
    gl.uniform1f(uniforms.u_cell_size, Math.max(1, o.cellSize))
    gl.uniform2f(uniforms.u_container_size, width, height)
    gl.uniform2f(uniforms.u_viewport_size, width, height)
    gl.uniform1f(uniforms.u_device_pixel_ratio, dpr)
    gl.uniform4fv(uniforms.u_line_color, parseColor(o.lineColor))
    gl.uniform1f(uniforms.u_line_width, o.lineWidth)
    // 时间已经乘过 speed，所以 speed 的单位就是「每秒滚过几格」。
    gl.uniform1f(uniforms.u_scroll, time * Math.max(1, o.cellSize))
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
  const drawRef = useRef(draw)
  drawRef.current = draw

  useCanvasSize(canvasRef, { maxDpr: 2, onResize: () => drawRef.current(lastTime.current) })

  useEffect(() => {
    const canvas = canvasRef.current!
    let disposed = false

    const setup = () => {
      const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true })
      // 着色器用 fwidth 做抗锯齿，需要标准导数扩展。
      if (!gl || !gl.getExtension('OES_standard_derivatives')) {
        setUnsupported(true)
        return
      }
      try {
        const program = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER)
        gl.useProgram(program)
        const releaseQuad = bindFullscreenQuad(gl, program, 'a_position')
        const uniforms = Object.fromEntries(UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)])) as GLState['uniforms']
        glRef.current = {
          gl,
          uniforms,
          dispose: () => {
            releaseQuad()
            gl.deleteProgram(program)
          },
        }
        setUnsupported(false)
        drawRef.current(lastTime.current)
      } catch {
        setUnsupported(true)
      }
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

  useFrameLoop(hostRef, ({ time }) => draw(time), { speed: options.speed, reducedMotion: 'static', staticTime: 0 })

  return (
    <div ref={hostRef} className={cn('relative isolate overflow-hidden bg-background', className)} style={style}>
      {options.glowAmount > 0 && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ opacity: options.glowAmount, background: `radial-gradient(ellipse 70% 42% at 50% 40%, ${options.glowColor}, transparent 72%)` }}
        />
      )}
      {unsupported ? (
        // 没有 WebGL 时退回一张静态的透视网格。
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden" style={{ opacity: options.opacity, perspective: '200px' }}>
          <div className="absolute inset-0" style={{ transform: `rotateX(${options.angle}deg)` }}>
            <div
              className="absolute inset-[0%_0px] -ml-[200%] h-[300vh] w-[600vw] origin-[100%_0_0]"
              style={{
                backgroundImage: `linear-gradient(to right, ${options.lineColor} 1px, transparent 0), linear-gradient(to bottom, ${options.lineColor} 1px, transparent 0)`,
                backgroundSize: `${options.cellSize}px ${options.cellSize}px`,
                transform: 'translateY(-25%)',
              }}
            />
          </div>
        </div>
      ) : (
        <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 block h-full w-full" style={{ opacity: options.opacity }} />
      )}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-linear-to-t from-background to-transparent to-90%" style={{ opacity: options.fade }} />
      {children && <div className="relative">{children}</div>}
    </div>
  )
}
