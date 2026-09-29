// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Meng To
// Source: https://github.com/MengTo/threeui/blob/68802d5/src/shaders/ribbon-field/RibbonFieldBackground.tsx
// Modified by Motif; see the item's provenance.
import { bindFullscreenQuad, cn, createProgram, releaseContext, useCanvasSize, useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { RIBBON_FIELD_FRAGMENT_SHADER, RIBBON_FIELD_VERTEX_SHADER } from './shaders'

/* @motif:defaults */
export const defaults = {
  speed: 1,
  dotSize: 7,
  pointerAmount: 1,
  smoothing: 0.035,
  hue: 0,
  saturation: 1,
  brightness: 1.8,
  opacity: 1,
}
/* @motif:end */

export type RibbonFieldProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

type Uniform = 'resolution' | 'time' | 'pointer' | 'dotSize'
const UNIFORMS: Uniform[] = ['resolution', 'time', 'pointer', 'dotSize']

interface GLState {
  gl: WebGLRenderingContext
  uniforms: Record<Uniform, WebGLUniformLocation | null>
  dispose: () => void
}

/** 青、靛、紫三条光带穿过 7px 点阵，指针让光带轻轻漂移。 */
export function RibbonField({ className, style, children, ...props }: RibbonFieldProps) {
  const options = { ...defaults, ...props }
  const optionsRef = useRef(options)
  optionsRef.current = options

  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<GLState | null>(null)
  const pointer = useRef({ targetX: 0.72, targetY: 0.42, x: 0.72, y: 0.42 })
  const lastTime = useRef(0)
  const dprRef = useRef(1)

  const draw = (time: number, delta: number) => {
    const state = glRef.current
    const canvas = canvasRef.current
    if (!state || !canvas) return
    lastTime.current = time
    const { gl, uniforms } = state
    const o = optionsRef.current
    const p = pointer.current
    // 按帧间隔换算缓动系数，高刷屏和低帧率下手感一致。
    const follow = 1 - Math.pow(1 - o.smoothing, delta * 60)
    p.x += (p.targetX - p.x) * follow
    p.y += (p.targetY - p.y) * follow
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height)
    gl.uniform1f(uniforms.time, time)
    gl.uniform2f(uniforms.pointer, p.x, p.y)
    gl.uniform1f(uniforms.dotSize, o.dotSize * dprRef.current)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
  const drawRef = useRef(draw)
  drawRef.current = draw

  useCanvasSize(canvasRef, {
    maxDpr: 1.5,
    onResize: ({ dpr }) => {
      dprRef.current = dpr
      drawRef.current(lastTime.current, 0)
    },
  })

  useEffect(() => {
    const canvas = canvasRef.current!
    const host = hostRef.current!
    let disposed = false

    const setup = () => {
      const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'high-performance' })
      if (!gl) return
      const program = createProgram(gl, RIBBON_FIELD_VERTEX_SHADER, RIBBON_FIELD_FRAGMENT_SHADER)
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
      drawRef.current(lastTime.current, 0)
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
      const ny = 1 - (event.clientY - bounds.top) / Math.max(1, bounds.height)
      pointer.current.targetX = 0.72 + (nx - 0.72) * amount
      pointer.current.targetY = 0.42 + (ny - 0.42) * amount
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

  useFrameLoop(hostRef, ({ time, delta }) => draw(time, delta), { speed: options.speed, reducedMotion: 'static', staticTime: 7 })

  // 色相、饱和度、亮度沿用上游做法：用 CSS 滤镜作用在画布上，不必改着色器。
  const filter = `hue-rotate(${options.hue}deg) saturate(${options.saturation}) brightness(${options.brightness})`

  return (
    <div ref={hostRef} className={cn('relative isolate overflow-hidden bg-black', className)} style={style}>
      <canvas ref={canvasRef} className="absolute inset-0 -z-10 block h-full w-full" style={{ opacity: options.opacity, filter }} />
      {children}
    </div>
  )
}
