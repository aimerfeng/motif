// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Eduardo Calvo
// Source: https://github.com/educlopez/smoothui/blob/b6312bc/packages/smoothui/components/orb/index.tsx
// Modified by Motif; see the item's provenance.
import { cn, createProgram, releaseContext, useCanvasSize, useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, useState } from 'react'
import { FRAGMENT, VERTEX } from './shaders'

/**
 * A configurable WebGL2 orb: a lit sphere with colour marbling inside it.
 *
 * Two ideas carry the whole thing.
 *
 * The loop is seamless by construction, not by crossfade. Every point walks a
 * circle in a flow field whose angle advances by exactly one turn per loop, so
 * the displacement returns to where it started. Neighbouring points begin at
 * different angles, and that is what reads as swirling — offset the whole
 * domain by one shared vector instead and you get a pulse.
 *
 * Colour is mixed in OkLab. The midpoint between two stops stays clean instead
 * of going muddy through sRGB, each picked colour reproduces exactly at its own
 * stop, and the hue ripple is a real rotation in the a/b plane.
 *
 * Everything else is lighting on a sphere impostor: the normal is derived per
 * pixel from the distance to the centre, which is what lets a rim, a highlight
 * and a shaded side exist at all. A radial gradient has no surface, and that is
 * the entire difference between this and a coloured circle.
 *
 * Contains two public-domain pieces of prior art, marked at their definitions:
 * the MurmurHash3 finalizer (Austin Appleby) and the OkLab transform matrices
 * (Björn Ottosson).
 */

export interface OrbProps {
  /**
   * Rim dispersion. Splits the palette lookup per channel toward the edge, the
   * way a lens fringes.
   */
  aberration?: number
  /** Which colour dominates. `0.5` is even; below favours the first stop. */
  balance?: number
  /** Interior cell size. Small is busy, large is one slow swell. */
  blobScale?: number
  /** Hue ripple through the palette. */
  chroma?: number
  className?: string
  /** Two to four stops. Two read as a material, four as iridescent. */
  colors?: string[]
  /** Lightness contrast around the midpoint. */
  contrast?: number
  /** Seconds for one full, seamless loop. */
  duration?: number
  /** How far the flow field carries the field over a loop. */
  flow?: number
  /** A halo cast outside the silhouette. `0` is none. */
  glow?: number
  /** Film grain. Also hides the banding large soft gradients show. */
  grain?: number
  /** Internal scatter, offset away from the highlight. Fake subsurface. */
  inner?: number
  /** Fresnel-driven hue rotation — thin-film sheen. */
  iridescence?: number
  /** Light direction, x. */
  lightX?: number
  /** Light direction, y. */
  lightY?: number
  /** Freeze on the current frame. */
  paused?: boolean
  /** Bends the noise lookup by the surface normal. */
  refraction?: number
  /** Fresnel edge brightness. This is what reads as glass. */
  rim?: number
  /** Blends the palette toward plain diffuse shading. */
  shading?: number
  /** Rotates the palette. */
  shift?: number
  /** Rendered size. Numbers are pixels. */
  size?: number | string
  /** Edge feather. `0` still resolves to about 1.5 device pixels. */
  softness?: number
  /** Specular highlight strength. */
  specular?: number
  /** Strength of the second, nested warp — marbling rather than blobs. */
  turbulence?: number
  /** Silhouette deformation, so the orb is a drop rather than a ball. */
  wobble?: number
}

/** The editor's own defaults, which are a good orb rather than a neutral one. */
const DEFAULTS = {
  aberration: 0.8,
  balance: 0.5,
  blobScale: 3,
  chroma: 1,
  colors: ['#f25aed', '#ffffff'],
  contrast: 1,
  duration: 7,
  flow: 0.6,
  glow: 0,
  grain: 0.6,
  inner: 0.38,
  iridescence: 0,
  lightX: -0.6,
  lightY: -1,
  paused: false,
  refraction: 0.25,
  rim: 1.3,
  shading: 0.05,
  shift: 0.23,
  softness: 0.005,
  specular: 0.2,
  turbulence: 0.4,
  wobble: 0,
}

const MAX_STOPS = 4
const MAX_DPR = 2
const RGB_MAX = 255
const SRGB_KNEE = 0.040_45
const TAU = Math.PI * 2
const LIGHT_Z = 0.65
const BALANCE_BASE = 5

const UNIFORMS = [
  'uAberr',
  'uBalance',
  'uChroma',
  'uContrast',
  'uCount',
  'uFlow',
  'uGlow',
  'uGrain',
  'uInner',
  'uIrid',
  'uLab',
  'uLight',
  'uPhase',
  'uRefract',
  'uRes',
  'uRim',
  'uScaleN',
  'uShading',
  'uShift',
  'uSoft',
  'uSpec',
  'uTurb',
  'uWobble',
] as const
type Uniform = (typeof UNIFORMS)[number]

interface GLState {
  gl: WebGL2RenderingContext
  u: Record<Uniform, WebGLUniformLocation | null>
  program: WebGLProgram
}

/**
 * Any CSS colour to OkLab, in two steps because neither alone is enough.
 *
 * `getComputedStyle` resolves `var()` and named colours, but Chrome hands back
 * `oklch(0.72 0.21 322)` verbatim rather than converting it — read that as three
 * sRGB channels and a magenta comes out blue. A 1x1 2D canvas rasterises
 * whatever syntax survives into actual pixels, which is the only step that
 * cannot lie about the result.
 */
const cssToOklab = (input: string): [number, number, number] => {
  const probe = document.createElement('span')
  probe.style.color = input
  document.body.appendChild(probe)
  const resolved = getComputedStyle(probe).color
  probe.remove()

  const surface = document.createElement('canvas')
  surface.width = 1
  surface.height = 1
  const ctx = surface.getContext('2d', { willReadFrequently: true })
  if (!ctx) {
    return [1, 0, 0]
  }
  ctx.fillStyle = resolved
  ctx.fillRect(0, 0, 1, 1)
  const [r8 = 0, g8 = 0, b8 = 0] = ctx.getImageData(0, 0, 1, 1).data

  // Published colour-space constants, kept digit-for-digit against the reference.
  const [r = 0, g = 0, b = 0] = [r8, g8, b8].map((channel) => {
    const u = channel / RGB_MAX
    return u <= SRGB_KNEE ? u / 12.92 : ((u + 0.055) / 1.055) ** 2.4
  })
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s]
}

export default function Orb({ className, size = 240, ...rest }: OrbProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // The fallback lives here rather than in the caller: a stand-in drawn by
  // whoever embeds the orb ends up painted over the canvas, which hides the
  // real thing on every machine that can render it.
  const [supported, setSupported] = useState(true)

  // Read inside the loop rather than closed over, so turning a knob pushes a
  // uniform instead of tearing down and rebuilding the GL context.
  const config = useRef({ ...DEFAULTS, ...rest })
  config.current = { ...DEFAULTS, ...rest }

  const glRef = useRef<GLState | null>(null)
  const lastTime = useRef(0)
  // 颜色换算要读 DOM 和像素，只在色值变化时做一次，不在每次渲染、每帧里做。
  const labCache = useRef<{ key: string; lab: Float32Array } | null>(null)

  const pushConfig = (state: GLState) => {
    const { gl, u } = state
    const c = config.current
    const stops = c.colors.slice(0, MAX_STOPS)
    const key = stops.join('|')
    if (labCache.current?.key !== key) {
      const lab = new Float32Array(MAX_STOPS * 3)
      for (let i = 0; i < MAX_STOPS; i++) {
        const [x, y, z] = cssToOklab(stops[Math.min(i, stops.length - 1)] ?? '#ffffff')
        lab[i * 3] = x
        lab[i * 3 + 1] = y
        lab[i * 3 + 2] = z
      }
      labCache.current = { key, lab }
    }
    gl.uniform3fv(u.uLab, labCache.current.lab)
    gl.uniform1f(u.uCount, Math.max(2, Math.min(stops.length, MAX_STOPS)))
    // The prop reads as blob size, so invert it into cell frequency.
    gl.uniform1f(u.uScaleN, 1.45 / Math.max(c.blobScale, 0.05))
    gl.uniform1f(u.uFlow, c.flow)
    gl.uniform1f(u.uTurb, c.turbulence)
    gl.uniform1f(u.uShift, c.shift)
    gl.uniform1f(u.uBalance, BALANCE_BASE ** ((0.5 - c.balance) * 2))
    gl.uniform1f(u.uChroma, c.chroma)
    gl.uniform1f(u.uContrast, c.contrast)
    gl.uniform1f(u.uRim, c.rim)
    gl.uniform1f(u.uSpec, c.specular)
    gl.uniform1f(u.uInner, c.inner)
    gl.uniform1f(u.uShading, c.shading)
    gl.uniform1f(u.uRefract, c.refraction)
    gl.uniform1f(u.uIrid, c.iridescence)
    gl.uniform1f(u.uAberr, c.aberration)
    gl.uniform1f(u.uGrain, c.grain)
    gl.uniform1f(u.uSoft, c.softness)
    gl.uniform1f(u.uWobble, c.wobble)
    gl.uniform1f(u.uGlow, c.glow)
    gl.uniform3f(u.uLight, c.lightX, c.lightY, LIGHT_Z)
  }

  const draw = (time: number) => {
    const state = glRef.current
    const canvas = canvasRef.current
    if (!state || !canvas) return
    lastTime.current = time
    const { gl, u } = state
    // time 已由 useFrameLoop 累计，每 duration 秒正好一圈，循环依然无缝。
    const phase = (time / Math.max(config.current.duration, 0.1)) % 1
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(u.uRes, canvas.width, canvas.height)
    gl.uniform1f(u.uPhase, phase * TAU)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
  const drawRef = useRef(draw)
  drawRef.current = draw
  const pushRef = useRef(pushConfig)
  pushRef.current = pushConfig

  // 尺寸变化时立刻重画一帧（暂停或静态模式下也不会出现拉伸的旧画面）。
  useCanvasSize(canvasRef, { maxDpr: MAX_DPR, onResize: () => drawRef.current(lastTime.current) })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let disposed = false

    const setup = () => {
      const gl = canvas.getContext('webgl2', {
        alpha: true,
        antialias: false, // a covering triangle has no geometric edges to sample
        depth: false,
        powerPreference: 'low-power',
        premultipliedAlpha: true,
        stencil: false,
      })
      if (!gl) {
        setSupported(false)
        return
      }
      let program: WebGLProgram
      try {
        program = createProgram(gl, VERTEX, FRAGMENT)
      } catch {
        setSupported(false)
        return
      }
      gl.useProgram(program)
      // Recoverable: a failed first attempt must not disable the orb forever.
      setSupported(true)
      gl.disable(gl.DEPTH_TEST)
      gl.disable(gl.BLEND) // the shader writes premultiplied RGBA straight out
      const u = Object.fromEntries(UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)])) as GLState['u']
      const state: GLState = { gl, u, program }
      glRef.current = state
      pushRef.current(state)
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
        state.gl.deleteProgram(state.program)
        releaseContext(state.gl)
      }
    }
  }, [])

  // Synchronize committed props even when animation is paused or reduced.
  // Keep the GPU resources stable; never convert colors on every frame.
  useEffect(() => {
    const state = glRef.current
    if (!state) return
    pushRef.current(state)
    drawRef.current(lastTime.current)
  })

  // 离屏、后台标签页时暂停；减少动态效果时停在 phase 0（与上游一致）。
  useFrameLoop(hostRef, ({ time }) => draw(time), { speed: config.current.paused ? 0 : 1, reducedMotion: 'static', staticTime: 0 })

  const dimension = typeof size === 'number' ? `${size}px` : size

  if (!supported) {
    const stops = (rest.colors ?? DEFAULTS.colors).slice(0, MAX_STOPS)
    return (
      <div
        aria-hidden="true"
        className={cn('block rounded-full', className)}
        style={{
          // Lit from the same corner as the shader, so the character does not
          // change which way it faces when it falls back.
          backgroundImage: `radial-gradient(circle at 32% 28%, ${stops.join(', ')})`,
          height: dimension,
          width: dimension,
        }}
      />
    )
  }

  return (
    <div ref={hostRef} aria-hidden="true" className={cn('block', className)} style={{ height: dimension, width: dimension }}>
      <canvas ref={canvasRef} className="block h-full w-full" tabIndex={-1} />
    </div>
  )
}
