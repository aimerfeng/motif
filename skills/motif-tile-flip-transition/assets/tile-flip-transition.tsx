// SPDX-License-Identifier: MIT
// Copyright (c) 2017-present gl-transitions contributors
// Source: https://github.com/gl-transitions/gl-transitions/blob/902218a/transitions/GridFlip.glsl
// Modified by Motif; see the item's provenance.
import { bindFullscreenQuad, cn, createProgram, releaseContext, useCanvasSize, useFrameLoop } from '@/lib/motif-runtime'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { ART_HEIGHT, ART_WIDTH, drawArtwork, type Scheme } from './artwork'
import { TRANSITIONS, type TransitionId } from './shaders'

/* @motif:defaults */
export const defaults = {
  variant: 'grid-flip',
  columns: 4,
  rows: 4,
  gapWidth: 0.05,
  gapColor: '#000000',
  randomness: 0.1,
  direction: 'diagonal',
  duration: 1.8,
  pause: 1.2,
  scheme: 'dusk',
}
/* @motif:end */

export type TileFlipTransitionProps = Partial<typeof defaults> & {
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

/** gl-transitions 的约定：transition(uv) 里可以用 progress、ratio、getFromColor、getToColor。 */
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

/** 方向参数 → squareswire 的 direction 向量（uv 的 y 朝上）；TilesWave 横向方向翻 X 轴，纵向翻 Y 轴。 */
const DIRECTIONS: Record<string, [number, number]> = {
  diagonal: [1, -0.5],
  right: [1, 0],
  left: [-1, 0],
  up: [0, 1],
  down: [0, -1],
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return [0, 0, 0]
  const n = parseInt(m[1]!, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

interface Program {
  program: WebGLProgram
  uniforms: Record<string, WebGLUniformLocation | null>
}

interface GLState {
  gl: WebGLRenderingContext
  textures: WebGLTexture[]
  programs: Map<string, Program>
  scheme: string
  quad: (() => void) | null
}

const UNIFORM_NAMES = [
  'uFrom',
  'uTo',
  'progress',
  'ratio',
  'texAspect',
  'size',
  'tileCount',
  'squares',
  'pause',
  'dividerWidth',
  'bgcolor',
  'randomness',
  'flipX',
  'flipY',
  'direction',
  'smoothness',
]

/** 画面被切成网格，一块块翻过去露出下一幅画。画面由 Canvas 2D 现场绘制。 */
export function TileFlipTransition({ className, style, children, ...props }: TileFlipTransitionProps) {
  const options = { ...defaults, ...props }
  const optionsRef = useRef(options)
  optionsRef.current = options

  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<GLState | null>(null)
  const lastTime = useRef(0)

  const uploadArtwork = (state: GLState, scheme: string) => {
    const { gl } = state
    drawArtwork(scheme as Scheme).forEach((image, index) => {
      gl.bindTexture(gl.TEXTURE_2D, state.textures[index]!)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    })
    state.scheme = scheme
  }

  const programFor = (state: GLState, id: string): Program => {
    const key = (id in TRANSITIONS ? id : 'grid-flip') as TransitionId
    let entry = state.programs.get(key)
    if (!entry) {
      const { gl } = state
      const program = createProgram(gl, VERTEX, fragmentSource(TRANSITIONS[key]))
      gl.useProgram(program)
      if (!state.quad) state.quad = bindFullscreenQuad(gl, program)
      const uniforms: Record<string, WebGLUniformLocation | null> = {}
      for (const name of UNIFORM_NAMES) uniforms[name] = gl.getUniformLocation(program, name)
      entry = { program, uniforms }
      state.programs.set(key, entry)
    }
    return entry
  }

  const draw = (time: number) => {
    const state = stateRef.current
    const canvas = canvasRef.current
    if (!state || !canvas) return
    lastTime.current = time
    const o = optionsRef.current
    const { gl } = state
    if (state.scheme !== o.scheme) uploadArtwork(state, o.scheme)

    // 时间线：停留 pause 秒，然后用 duration 秒转场，三幅画依次轮播。
    const period = Math.max(0.05, o.pause + o.duration)
    const cycle = Math.floor(time / period)
    const local = time - cycle * period
    const progress = local < o.pause ? 0 : Math.min(1, (local - o.pause) / Math.max(0.05, o.duration))
    const from = cycle % 3
    const to = (cycle + 1) % 3

    const { program, uniforms: u } = programFor(state, o.variant)
    gl.useProgram(program)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, state.textures[from]!)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, state.textures[to]!)
    gl.uniform1i(u.uFrom!, 0)
    gl.uniform1i(u.uTo!, 1)
    gl.uniform1f(u.progress!, progress)
    gl.uniform1f(u.ratio!, canvas.width / Math.max(1, canvas.height))
    gl.uniform1f(u.texAspect!, ART_WIDTH / ART_HEIGHT)

    // 上游各自的 uniform：网格尺寸、分隔线、随机度、方向。
    const cols = Math.max(1, Math.round(o.columns))
    const rows = Math.max(1, Math.round(o.rows))
    for (const name of ['size', 'tileCount', 'squares']) {
      const location = u[name]
      if (location) gl.uniform2i(location, cols, rows)
    }
    const dir = DIRECTIONS[o.direction] ?? DIRECTIONS.diagonal!
    const [r, g, b] = hexToRgb(o.gapColor)
    if (u.pause) gl.uniform1f(u.pause, 0.1)
    if (u.dividerWidth) gl.uniform1f(u.dividerWidth, o.gapWidth)
    if (u.bgcolor) gl.uniform4f(u.bgcolor, r, g, b, 1)
    if (u.randomness) gl.uniform1f(u.randomness, o.randomness)
    if (u.flipX) gl.uniform1i(u.flipX, dir[0] !== 0 ? 1 : 0)
    if (u.flipY) gl.uniform1i(u.flipY, dir[0] === 0 ? 1 : 0)
    if (u.direction) gl.uniform2f(u.direction, dir[0], dir[1])
    if (u.smoothness) gl.uniform1f(u.smoothness, o.variant === 'squares-wire' ? 1.6 : 0.5)
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
      const textures = [0, 1, 2].map(() => {
        const texture = gl.createTexture()!
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        return texture
      })
      const state: GLState = { gl, textures, programs: new Map(), scheme: '', quad: null }
      stateRef.current = state
      uploadArtwork(state, optionsRef.current.scheme)
      drawRef.current(lastTime.current)
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

  // 静态模式下参数变了也要重画一帧。
  useEffect(() => {
    drawRef.current(lastTime.current)
  })

  // 减少动态效果：停在第一幅画上，不做转场。
  useFrameLoop(hostRef, ({ time }) => draw(time), { reducedMotion: 'static', staticTime: 0 })

  return (
    <div ref={hostRef} className={cn('relative isolate overflow-hidden bg-black', className)} style={style}>
      <canvas ref={canvasRef} className="absolute inset-0 -z-10 block h-full w-full" />
      {children}
    </div>
  )
}
