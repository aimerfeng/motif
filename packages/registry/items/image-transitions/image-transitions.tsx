// SPDX-License-Identifier: MIT
// Copyright (c) 2017-present gl-transitions contributors
// Source: https://github.com/gl-transitions/gl-transitions/blob/902218a/README.md
// Modified by Motif; see the item's provenance.
import { bindFullscreenQuad, cn, createProgram, releaseContext, useCanvasSize, useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { ART_HEIGHT, ART_WIDTH, drawArtwork, type Scheme } from './artwork'
import { TRANSITIONS, type TransitionDef } from './shaders'

/* @motif:defaults */
export const defaults = {
  transition: 'crosswarp',
  duration: 1.6,
  pause: 1.2,
  easing: [0.65, 0, 0.35, 1],
  scheme: 'dusk',
  slides: '2',
}
/* @motif:end */

export type ImageTransitionsProps = Partial<typeof defaults> & {
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

/**
 * gl-transitions 的约定：transition(uv) 里可以用 progress、ratio、getFromColor、getToColor。
 * 画面用 cover 方式铺满（按画布宽高比裁切），所以任何比例下都不会拉伸。
 */
const fragmentSource = (transition: TransitionDef) => `
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

${transition.glsl.replace(/[^\p{ASCII}]/gu, '')}

void main() {
  gl_FragColor = transition(_uv);
}
`

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
  textures: WebGLTexture[]
  programs: Map<string, { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> }>
  scheme: string
  quad: (() => void) | null
}

/** 在两三幅画面之间循环切换，每次用一种 WebGL 转场。画面由 Canvas 2D 现场绘制。 */
export function ImageTransitions({ className, style, children, ...props }: ImageTransitionsProps) {
  const options = { ...defaults, ...props }
  const optionsRef = useRef(options)
  optionsRef.current = options

  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<GLState | null>(null)
  const lastTime = useRef(0)

  const uploadArtwork = (state: GLState, scheme: string) => {
    const { gl } = state
    const art = drawArtwork(scheme as Scheme)
    art.forEach((canvas, index) => {
      gl.bindTexture(gl.TEXTURE_2D, state.textures[index]!)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas)
    })
    state.scheme = scheme
  }

  const programFor = (state: GLState, id: string) => {
    const key = id in TRANSITIONS ? id : 'crosswarp'
    let entry = state.programs.get(key)
    if (!entry) {
      const { gl } = state
      const def = TRANSITIONS[key]!
      const program = createProgram(gl, VERTEX, fragmentSource(def))
      gl.useProgram(program)
      // 所有程序只有 a_pos 一个属性（位置都是 0），四边形只需绑定一次。
      if (!state.quad) state.quad = bindFullscreenQuad(gl, program)
      const uniforms: Record<string, WebGLUniformLocation | null> = {}
      for (const name of ['uFrom', 'uTo', 'progress', 'ratio', 'texAspect', ...Object.keys(def.uniforms)]) uniforms[name] = gl.getUniformLocation(program, name)
      entry = { program, uniforms }
      state.programs.set(key, entry)
    }
    return { entry, def: TRANSITIONS[key]! }
  }

  const draw = (time: number) => {
    const state = stateRef.current
    const canvas = canvasRef.current
    if (!state || !canvas) return
    lastTime.current = time
    const o = optionsRef.current
    const { gl } = state
    if (state.scheme !== o.scheme) uploadArtwork(state, o.scheme)

    // 时间线：停留 pause 秒，然后用 duration 秒转场，如此循环。
    const count = o.slides === '3' ? 3 : 2
    const period = Math.max(0.05, o.pause + o.duration)
    const cycle = Math.floor(time / period)
    const local = time - cycle * period
    const raw = local < o.pause ? 0 : Math.min(1, (local - o.pause) / Math.max(0.05, o.duration))
    const [x1, y1, x2, y2] = o.easing as [number, number, number, number]
    const progress = bezier(x1, y1, x2, y2, raw)
    const from = cycle % count
    const to = (cycle + 1) % count

    const { entry, def } = programFor(state, o.transition)
    gl.useProgram(entry.program)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, state.textures[from]!)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, state.textures[to]!)
    const u = entry.uniforms
    gl.uniform1i(u.uFrom!, 0)
    gl.uniform1i(u.uTo!, 1)
    gl.uniform1f(u.progress!, progress)
    gl.uniform1f(u.ratio!, canvas.width / Math.max(1, canvas.height))
    gl.uniform1f(u.texAspect!, ART_WIDTH / ART_HEIGHT)
    for (const [name, value] of Object.entries(def.uniforms)) {
      const location = u[name]
      if (location === null || location === undefined) continue
      if (typeof value === 'boolean') gl.uniform1i(location, value ? 1 : 0)
      else if (typeof value === 'number') gl.uniform1f(location, value)
      else gl.uniform2f(location, value[0], value[1])
    }
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
