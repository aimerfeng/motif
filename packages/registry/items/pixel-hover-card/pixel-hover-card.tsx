// SPDX-License-Identifier: MIT
// Copyright (c) 2017-present gl-transitions contributors
// Source: https://github.com/gl-transitions/gl-transitions/blob/902218a/README.md
// Modified by Motif; see the item's provenance.
import { bindFullscreenQuad, cn, createProgram, releaseContext, useCanvasSize, useFrameLoop, usePrefersReducedMotion } from '@motif/runtime'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { ART_HEIGHT, ART_WIDTH, drawArtwork } from './artwork'
import { SHADERS, type CellShape } from './shaders'

/* @motif:defaults */
export const defaults = {
  cellShape: 'square',
  cells: 20,
  steps: 50,
  duration: 0.7,
  easing: [0.65, 0, 0.35, 1],
  radius: 16,
  trigger: 'hover',
  artwork: 'can',
}
/* @motif:end */

export type PixelHoverCardProps = Partial<typeof defaults> & {
  /** 受控：传入时忽略悬停 / 点击，直接决定显示哪一面。 */
  active?: boolean
  /** 读屏用的描述。 */
  label?: string
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

const VERTEX = `
attribute vec2 a_pos;
varying vec2 _uv;
void main() {
  _uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

/** gl-transitions 的约定：transition(uv) 里可用 progress、ratio、getFromColor、getToColor；画面按 cover 方式铺满。 */
const fragmentSource = (glsl: string) => `
precision highp float;
varying vec2 _uv;
uniform sampler2D uFrom;
uniform sampler2D uTo;
uniform float progress;
uniform float ratio;
uniform float texAspect;

vec2 coverUv(vec2 uv) {
  float r = ratio / texAspect;
  vec2 s = r > 1.0 ? vec2(1.0, 1.0 / r) : vec2(r, 1.0);
  return (uv - 0.5) * s + 0.5;
}
vec4 getFromColor(vec2 uv) { return texture2D(uFrom, coverUv(vec2(uv.x, 1.0 - uv.y))); }
vec4 getToColor(vec2 uv) { return texture2D(uTo, coverUv(vec2(uv.x, 1.0 - uv.y))); }

${glsl.replace(/[^\p{ASCII}]/gu, '')}

void main() {
  gl_FragColor = transition(_uv);
}
`

const UNIFORMS = ['uFrom', 'uTo', 'progress', 'ratio', 'texAspect', 'squaresMin', 'steps', 'horizontalHexagons', 'pixelSize'] as const

/** CSS cubic-bezier(x1, y1, x2, y2) 的求值：先按 x 二分找参数，再取 y。 */
function bezier(x1: number, y1: number, x2: number, y2: number, t: number): number {
  if (t <= 0) return 0
  if (t >= 1) return 1
  const cx = 3 * x1
  const bx = 3 * (x2 - x1) - cx
  const ax = 1 - cx - bx
  const cy = 3 * y1
  const by = 3 * (y2 - y1) - cy
  const ay = 1 - cy - by
  let lo = 0
  let hi = 1
  let s = t
  for (let i = 0; i < 24; i++) {
    const x = ((ax * s + bx) * s + cx) * s
    if (Math.abs(x - t) < 1e-5) break
    if (x < t) lo = s
    else hi = s
    s = (lo + hi) / 2
  }
  return ((ay * s + by) * s + cy) * s
}

interface GLState {
  gl: WebGLRenderingContext
  textures: [WebGLTexture, WebGLTexture]
  programs: Map<string, { program: WebGLProgram; uniforms: Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null> }>
  artwork: string
  quad: (() => void) | null
}

/** 悬停 / 聚焦（或点击）时，画面碎成方格、六边形或马赛克，再拼成另一面；离开时倒放回来。 */
export function PixelHoverCard({ active, label = 'Product image', className, style, children, ...props }: PixelHoverCardProps) {
  const options = { ...defaults, ...props }
  const optionsRef = useRef(options)
  optionsRef.current = options

  const [hovered, setHovered] = useState(false)
  const [toggled, setToggled] = useState(false)
  const clickMode = options.trigger === 'click'
  const target = active ?? (clickMode ? toggled : hovered)
  const targetRef = useRef(target)
  targetRef.current = target
  const reduced = usePrefersReducedMotion()

  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<GLState | null>(null)
  // raw：线性进度（0 正面，1 另一面），按 duration 匀速追向目标，显示时再套缓动。
  const raw = useRef(target ? 1 : 0)
  const drawn = useRef(-1)

  const programFor = (state: GLState, shape: string) => {
    const key: CellShape = shape in SHADERS ? (shape as CellShape) : 'square'
    let entry = state.programs.get(key)
    if (!entry) {
      const { gl } = state
      const program = createProgram(gl, VERTEX, fragmentSource(SHADERS[key]))
      gl.useProgram(program)
      if (!state.quad) state.quad = bindFullscreenQuad(gl, program)
      const uniforms = {} as Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null>
      for (const name of UNIFORMS) uniforms[name] = gl.getUniformLocation(program, name)
      entry = { program, uniforms }
      state.programs.set(key, entry)
    }
    return entry
  }

  const draw = (force = false) => {
    const state = stateRef.current
    const canvas = canvasRef.current
    if (!state || !canvas) return
    const o = optionsRef.current
    const { gl } = state
    if (state.artwork !== o.artwork) {
      const art = drawArtwork(o.artwork)
      art.forEach((image, index) => {
        gl.bindTexture(gl.TEXTURE_2D, state.textures[index]!)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      })
      state.artwork = o.artwork
      force = true
    }
    const [x1, y1, x2, y2] = o.easing as [number, number, number, number]
    const progress = bezier(x1, y1, x2, y2, raw.current)
    if (!force && progress === drawn.current) return
    drawn.current = progress

    const entry = programFor(state, o.cellShape)
    const u = entry.uniforms
    const ratio = canvas.width / Math.max(1, canvas.height)
    const cells = Math.max(1, Math.round(o.cells))
    gl.useProgram(entry.program)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, state.textures[0])
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, state.textures[1])
    gl.uniform1i(u.uFrom, 0)
    gl.uniform1i(u.uTo, 1)
    gl.uniform1f(u.progress, progress)
    gl.uniform1f(u.ratio, ratio)
    gl.uniform1f(u.texAspect, ART_WIDTH / ART_HEIGHT)
    // 方格：纵向格数按宽高比折算，格子保持正方形。
    gl.uniform2i(u.squaresMin, cells, Math.max(1, Math.round(cells / ratio)))
    gl.uniform1i(u.steps, Math.round(o.steps))
    gl.uniform1f(u.horizontalHexagons, cells)
    // AdvancedMosaic：每格边长 = pixelSize * 0.005，换算成「最粗时横向 cells 格」。
    gl.uniform1f(u.pixelSize, 200 / cells)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
  const drawRef = useRef(draw)
  drawRef.current = draw

  useCanvasSize(canvasRef, { maxDpr: 1.5, onResize: () => drawRef.current(true) })

  useEffect(() => {
    const canvas = canvasRef.current!
    let disposed = false
    const setup = () => {
      const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'high-performance' })
      if (!gl) return
      const make = () => {
        const texture = gl.createTexture()!
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        return texture
      }
      stateRef.current = { gl, textures: [make(), make()], programs: new Map(), artwork: '', quad: null }
      drawRef.current(true)
    }
    const teardown = () => {
      const state = stateRef.current
      stateRef.current = null
      if (!state) return
      state.quad?.()
      for (const { program } of state.programs.values()) state.gl.deleteProgram(program)
      for (const texture of state.textures) state.gl.deleteTexture(texture)
      releaseContext(state.gl)
    }
    const onLost = (event: Event) => {
      event.preventDefault()
      stateRef.current = null
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
      teardown()
    }
  }, [])

  // 参数变化时重画；减少动态效果时没有逐帧循环，直接跳到目标面（不做像素化）。
  useEffect(() => {
    if (reduced) raw.current = target ? 1 : 0
    drawRef.current(true)
  })

  useFrameLoop(
    hostRef,
    ({ delta }) => {
      const goal = targetRef.current ? 1 : 0
      const step = delta / Math.max(0.05, optionsRef.current.duration)
      raw.current = goal > raw.current ? Math.min(goal, raw.current + step) : Math.max(goal, raw.current - step)
      draw()
    },
    { reducedMotion: 'static' },
  )

  return (
    <div
      ref={hostRef}
      role={clickMode ? 'button' : 'img'}
      aria-label={label}
      aria-pressed={clickMode ? target : undefined}
      tabIndex={0}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      onClick={() => setToggled((v) => !v)}
      onKeyDown={(event) => {
        if (clickMode && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault()
          setToggled((v) => !v)
        }
      }}
      className={cn(
        'relative isolate aspect-[4/5] cursor-pointer overflow-hidden bg-black outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
      style={{ borderRadius: options.radius, ...style }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 -z-10 block h-full w-full" />
      {children}
    </div>
  )
}
