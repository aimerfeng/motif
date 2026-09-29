// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Meng To
// Source: https://github.com/MengTo/threeui/blob/68802d5/src/shaders/laser/LaserVariants.tsx
// Modified by Motif; see the item's provenance.
import { bindFullscreenQuad, cn, createProgram, releaseContext, useCanvasSize, useFrameLoop, usePrefersReducedMotion } from '@motif/runtime'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { LASER_FRAGMENT_SHADER, LASER_VERTEX_SHADER } from './shaders'

/* @motif:defaults */
export const defaults = {
  variant: 'atmospheric-blade',
  speed: 1,
  size: 1,
  length: 1,
  density: 1,
  hue: 0,
  saturation: 1,
  brightness: 1,
}
/* @motif:end */

export type LaserProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

type LaserVariant = 'atmospheric-blade' | 'vanishing-array' | 'prism-aperture' | 'halftone-relay'

const VARIANT_INDEX: Record<LaserVariant, number> = {
  'atmospheric-blade': 0,
  'vanishing-array': 1,
  'prism-aperture': 2,
  'halftone-relay': 3,
}

type Uniform = 'u_resolution' | 'u_pointer' | 'u_time' | 'u_variant' | 'u_size' | 'u_length' | 'u_density' | 'u_hue' | 'u_saturation' | 'u_brightness'
const UNIFORMS: Uniform[] = ['u_resolution', 'u_pointer', 'u_time', 'u_variant', 'u_size', 'u_length', 'u_density', 'u_hue', 'u_saturation', 'u_brightness']

interface GLState {
  gl: WebGLRenderingContext
  uniforms: Record<Uniform, WebGLUniformLocation | null>
  dispose: () => void
}

const STATIC_TIME = 2.75

/** 四种激光场景：大气光刃、消失点光阵、棱镜光圈、半调中继。同一个片元着色器，用 variant 切换。 */
export function Laser({ className, style, children, ...props }: LaserProps) {
  const options = { ...defaults, ...props }
  const optionsRef = useRef(options)
  optionsRef.current = options
  const reduced = usePrefersReducedMotion()
  const reducedRef = useRef(reduced)
  reducedRef.current = reduced

  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<GLState | null>(null)
  const pointer = useRef({ targetX: 0, targetY: 0, x: 0, y: 0 })
  const lastTime = useRef(STATIC_TIME)

  const draw = (time: number) => {
    lastTime.current = time
    const state = glRef.current
    const canvas = canvasRef.current
    if (!state || !canvas) return
    const { gl, uniforms } = state
    const o = optionsRef.current
    const p = pointer.current
    const ease = reducedRef.current ? 1 : 0.055
    p.x += (p.targetX - p.x) * ease
    p.y += (p.targetY - p.y) * ease
    const variant = (o.variant in VARIANT_INDEX ? o.variant : 'atmospheric-blade') as LaserVariant
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height)
    gl.uniform2f(uniforms.u_pointer, p.x, p.y)
    gl.uniform1f(uniforms.u_time, time)
    gl.uniform1f(uniforms.u_variant, VARIANT_INDEX[variant])
    gl.uniform1f(uniforms.u_size, o.size)
    gl.uniform1f(uniforms.u_length, o.length)
    gl.uniform1f(uniforms.u_density, o.density)
    gl.uniform1f(uniforms.u_hue, o.hue)
    gl.uniform1f(uniforms.u_saturation, o.saturation)
    gl.uniform1f(uniforms.u_brightness, o.brightness)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
  const drawRef = useRef(draw)
  drawRef.current = draw

  // 尺寸变化或参数变化时立刻重画一帧，暂停和静态模式下也能即时反映。
  useCanvasSize(canvasRef, { maxDpr: 1.5, onResize: () => drawRef.current(lastTime.current) })
  const signature = JSON.stringify(options)
  useEffect(() => {
    drawRef.current(lastTime.current)
  }, [signature])

  useEffect(() => {
    const canvas = canvasRef.current!
    const host = hostRef.current!
    let disposed = false

    const setup = () => {
      const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'high-performance', premultipliedAlpha: false })
      if (!gl) return
      const program = createProgram(gl, LASER_VERTEX_SHADER, LASER_FRAGMENT_SHADER)
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
    const onPointer = (event: PointerEvent) => {
      const bounds = host.getBoundingClientRect()
      pointer.current.targetX = ((event.clientX - bounds.left) / Math.max(1, bounds.width)) * 2 - 1
      pointer.current.targetY = -(((event.clientY - bounds.top) / Math.max(1, bounds.height)) * 2 - 1)
      if (reducedRef.current) drawRef.current(lastTime.current)
    }
    const onLeave = () => {
      pointer.current.targetX = 0
      pointer.current.targetY = 0
      if (reducedRef.current) drawRef.current(lastTime.current)
    }

    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)
    host.addEventListener('pointermove', onPointer, { passive: true })
    host.addEventListener('pointerleave', onLeave, { passive: true })
    setup()

    return () => {
      disposed = true
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      host.removeEventListener('pointermove', onPointer)
      host.removeEventListener('pointerleave', onLeave)
      const state = glRef.current
      glRef.current = null
      if (state) {
        state.dispose()
        releaseContext(state.gl)
      }
    }
  }, [])

  useFrameLoop(hostRef, ({ time }) => draw(time + STATIC_TIME), { speed: options.speed, reducedMotion: 'static', staticTime: 0 })

  return (
    <div ref={hostRef} className={cn('relative isolate overflow-hidden', className)} style={{ background: '#020305', ...style }}>
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 block h-full w-full" />
      {children}
    </div>
  )
}
