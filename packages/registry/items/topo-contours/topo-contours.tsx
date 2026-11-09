// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Meng To
// Source: https://github.com/MengTo/threeui/blob/68802d5/src/shaders/neuform-isolated/sources/topo-field.html
// Modified by Motif; see the item's provenance.
import { bindFullscreenQuad, cn, createProgram, releaseContext, useCanvasSize, useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { TOPO_FRAGMENT_SHADER, TOPO_VERTEX_SHADER } from './shaders'

/* @motif:defaults */
export const defaults = {
  bands: 10,
  lineWidth: 0.02,
  indexEvery: 5,
  noiseScale: 1.4,
  drift: 1,
  gridSize: 48,
  gridOpacity: 0.12,
  lineColor: '#ffffff',
  background: '#000000',
}
/* @motif:end */

export type TopoContoursProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

type Uniform =
  | 'u_resolution'
  | 'u_time'
  | 'u_dpr'
  | 'u_bands'
  | 'u_line_width'
  | 'u_noise_scale'
  | 'u_grid_size'
  | 'u_grid_opacity'
  | 'u_index_every'
  | 'u_line_color'
  | 'u_background'
const UNIFORMS: Uniform[] = [
  'u_resolution',
  'u_time',
  'u_dpr',
  'u_bands',
  'u_line_width',
  'u_noise_scale',
  'u_grid_size',
  'u_grid_opacity',
  'u_index_every',
  'u_line_color',
  'u_background',
]

interface GLState {
  gl: WebGLRenderingContext
  uniforms: Record<Uniform, WebGLUniformLocation | null>
  dispose: () => void
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.padEnd(6, '0').slice(0, 6)
  const v = Number.parseInt(full, 16)
  if (Number.isNaN(v)) return [0, 0, 0]
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255]
}

/** 细如发丝的等高线在 1px 工程网格上缓慢漂移，每隔 N 条加粗一条计曲线。 */
export function TopoContours({ className, style, children, ...props }: TopoContoursProps) {
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
    const o = optionsRef.current
    const dpr = canvas.clientWidth > 0 ? canvas.width / canvas.clientWidth : 1
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height)
    gl.uniform1f(uniforms.u_time, time)
    gl.uniform1f(uniforms.u_dpr, dpr)
    gl.uniform1f(uniforms.u_bands, o.bands)
    gl.uniform1f(uniforms.u_line_width, o.lineWidth)
    gl.uniform1f(uniforms.u_noise_scale, o.noiseScale)
    gl.uniform1f(uniforms.u_grid_size, o.gridSize)
    gl.uniform1f(uniforms.u_grid_opacity, o.gridOpacity)
    gl.uniform1f(uniforms.u_index_every, o.indexEvery)
    gl.uniform3f(uniforms.u_line_color, ...hexToRgb(o.lineColor))
    gl.uniform3f(uniforms.u_background, ...hexToRgb(o.background))
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
  const drawRef = useRef(draw)
  drawRef.current = draw

  useCanvasSize(canvasRef, { maxDpr: 2, onResize: () => drawRef.current(lastTime.current) })

  useEffect(() => {
    const canvas = canvasRef.current!
    let disposed = false

    const setup = () => {
      const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false })
      if (!gl) return
      const program = createProgram(gl, TOPO_VERTEX_SHADER, TOPO_FRAGMENT_SHADER)
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

  // 参数变化时（例如暂停或减少动态效果下）立刻重画。
  useEffect(() => {
    drawRef.current(lastTime.current)
  })

  useFrameLoop(hostRef, ({ time }) => draw(time), { speed: options.drift, reducedMotion: 'static', staticTime: 12 })

  return (
    <div ref={hostRef} className={cn('relative isolate overflow-hidden', className)} style={{ background: options.background, ...style }}>
      <div className="pointer-events-none absolute inset-0 -z-10">
        <canvas ref={canvasRef} className="block h-full w-full" />
        {/* Gradient overlay to fade bottom and top for text readability */}
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to bottom, color-mix(in srgb, ${options.background} 50%, transparent), transparent, ${options.background})` }}
        />
        <div
          className="absolute inset-0 opacity-90"
          style={{ background: `radial-gradient(circle at center, transparent 0%, ${options.background} 100%)` }}
        />
      </div>
      {children}
    </div>
  )
}
