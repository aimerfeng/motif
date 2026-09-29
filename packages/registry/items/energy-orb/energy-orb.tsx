// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Meng To
// Source: https://github.com/MengTo/threeui/blob/68802d5/src/shaders/energy-orb/EnergyOrb.tsx
// Modified by Motif; see the item's provenance.
import { bindFullscreenQuad, cn, createProgram, releaseContext, useCanvasSize, useFrameLoop, usePrefersReducedMotion } from '@motif/runtime'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { NXA_ENERGY_ORB_CONFIGURABLE_FRAGMENT_SHADER, NXA_ENERGY_ORB_VERTEX_SHADER } from './shaders'

/* @motif:defaults */
export const defaults = {
  speed: 1,
  scale: 1.12,
  smokeScale: 1,
  smokeStrength: 1,
  glow: 1.25,
  hue: 0,
  saturation: 1,
  brightness: 1,
  starDensity: 1,
}
/* @motif:end */

export type EnergyOrbProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

type Uniform = 'uT' | 'uR' | 'uSmokeScale' | 'uSmokeStrength' | 'uSmokeSpeed' | 'uHue' | 'uSaturation' | 'uGlow'
const UNIFORMS: Uniform[] = ['uT', 'uR', 'uSmokeScale', 'uSmokeStrength', 'uSmokeSpeed', 'uHue', 'uSaturation', 'uGlow']

interface GLState {
  gl: WebGLRenderingContext
  uniforms: Record<Uniform, WebGLUniformLocation | null>
  dispose: () => void
}

type Star = { x: number; y: number; depth: number; phase: number; drift: number; size: number }

function seeded(index: number, salt: number) {
  return Math.abs(Math.sin(index * 91.173 + salt * 17.719) * 43758.5453) % 1
}

const STARS: Star[] = Array.from({ length: 180 }, (_, index) => ({
  x: seeded(index, 1),
  y: seeded(index, 2),
  depth: 0.25 + seeded(index, 3) * 0.75,
  phase: seeded(index, 4) * Math.PI * 2,
  drift: 0.35 + seeded(index, 5) * 0.65,
  size: 0.45 + seeded(index, 6) * 1.15,
}))

const fract = (value: number) => value - Math.floor(value)

const STATIC_TIME = 14

/** 分形噪声烟雾组成的能量球体，外围有柔和辉光，背后是有景深的星点。 */
export function EnergyOrb({ className, style, children, ...props }: EnergyOrbProps) {
  const options = { ...defaults, ...props }
  const optionsRef = useRef(options)
  optionsRef.current = options
  const reduced = usePrefersReducedMotion()

  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<GLState | null>(null)
  const clock = useRef({ orb: 0, star: 0 })
  const lastFrame = useRef({ orb: STATIC_TIME, star: STATIC_TIME })

  const drawStars = (starTime: number) => {
    const canvas = starRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    const o = optionsRef.current
    const width = Math.max(1, canvas.clientWidth)
    const height = Math.max(1, canvas.clientHeight)
    const dpr = canvas.width / width
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.clearRect(0, 0, canvas.width, canvas.height)
    const count = Math.min(STARS.length, Math.round(((width * height) / 4200) * o.starDensity))
    if (!count) return
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    context.globalCompositeOperation = 'screen'
    const hue = fract((252 + o.hue) / 360) * 360
    for (let index = 0; index < count; index += 1) {
      const star = STARS[index]!
      const x = fract(star.x + starTime * 0.0022 * star.drift) * width
      const y = fract(star.y - starTime * 0.0008 * star.depth + 1) * height
      const twinkle = 0.58 + Math.sin(starTime * (0.8 + star.depth) + star.phase) * 0.24
      const alpha = Math.max(0.08, twinkle * (0.22 + star.depth * 0.48))
      const radius = Math.max(0.35, star.size * star.depth)
      context.fillStyle = `hsla(${hue}, 84%, ${72 + star.depth * 20}%, ${alpha})`
      context.beginPath()
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fill()
    }
    context.globalCompositeOperation = 'source-over'
  }

  const draw = (orbTime: number, starTime: number) => {
    lastFrame.current = { orb: orbTime, star: starTime }
    drawStars(starTime)
    const state = glRef.current
    const canvas = canvasRef.current
    if (!state || !canvas) return
    const { gl, uniforms } = state
    const o = optionsRef.current
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(uniforms.uR, canvas.width, canvas.height)
    gl.uniform1f(uniforms.uT, orbTime)
    gl.uniform1f(uniforms.uSmokeScale, o.smokeScale)
    gl.uniform1f(uniforms.uSmokeStrength, o.smokeStrength)
    gl.uniform1f(uniforms.uSmokeSpeed, 1)
    gl.uniform1f(uniforms.uHue, (o.hue * Math.PI) / 180)
    gl.uniform1f(uniforms.uSaturation, o.saturation)
    gl.uniform1f(uniforms.uGlow, o.glow)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
  const drawRef = useRef(draw)
  drawRef.current = draw

  const redraw = () => drawRef.current(lastFrame.current.orb, lastFrame.current.star)
  useCanvasSize(canvasRef, { maxDpr: 2, onResize: redraw })
  useCanvasSize(starRef, { maxDpr: 1.5, onResize: redraw })

  useEffect(() => {
    const canvas = canvasRef.current!
    let disposed = false

    const setup = () => {
      const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false })
      if (!gl) return
      const program = createProgram(gl, NXA_ENERGY_ORB_VERTEX_SHADER, NXA_ENERGY_ORB_CONFIGURABLE_FRAGMENT_SHADER)
      gl.useProgram(program)
      const releaseQuad = bindFullscreenQuad(gl, program, 'p')
      const uniforms = Object.fromEntries(UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)])) as GLState['uniforms']
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
      gl.clearColor(0, 0, 0, 0)
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

  useFrameLoop(
    hostRef,
    ({ delta }) => {
      if (reduced) {
        draw(STATIC_TIME, STATIC_TIME)
        return
      }
      const c = clock.current
      c.orb += delta * optionsRef.current.speed
      c.star += delta
      draw(c.orb + STATIC_TIME, c.star + STATIC_TIME)
    },
    { speed: 1, reducedMotion: 'static', staticTime: STATIC_TIME },
  )

  return (
    <div ref={hostRef} className={cn('relative isolate overflow-hidden', className)} style={{ background: '#05030e', ...style }}>
      <canvas ref={starRef} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20 block h-full w-full" />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 block h-full w-full"
        style={{ transform: `scale(${options.scale})`, filter: options.brightness === 1 ? undefined : `brightness(${options.brightness})` }}
      />
      {children}
    </div>
  )
}
