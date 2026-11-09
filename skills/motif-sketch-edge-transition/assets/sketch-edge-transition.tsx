// SPDX-License-Identifier: MIT
// Copyright (c) 2017-present gl-transitions contributors
// Source: https://github.com/gl-transitions/gl-transitions/blob/902218a/transitions/EdgeTransition.glsl
// Modified by Motif; see the item's provenance.
import { bindFullscreenQuad, cn, createProgram, releaseContext, useCanvasSize, useFrameLoop } from '@/lib/motif-runtime'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { ART_HEIGHT, ART_WIDTH, drawArtwork, type Scheme } from './artwork'
import { EDGE } from './shaders'

/* @motif:defaults */
export const defaults = {
  edgeThickness: 0.001,
  edgeBrightness: 8,
  duration: 2,
  pause: 1.2,
  palette: 'dusk',
}
/* @motif:end */

export type SketchEdgeTransitionProps = Partial<typeof defaults> & {
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
 * GLSL ES 1.0 不认 `vec3[9] c` 这种数组参数写法，编译时换成等价的 `vec3 c[9]`。
 */
const FRAGMENT = `
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

${EDGE.replace(/[^\p{ASCII}]/gu, '').replace('vec3[9] c', 'vec3 c[9]')}

void main() {
  gl_FragColor = transition(_uv);
}
`

const UNIFORMS = ['uFrom', 'uTo', 'progress', 'ratio', 'texAspect', 'edge_thickness', 'edge_brightness'] as const

interface GLState {
  gl: WebGLRenderingContext
  program: WebGLProgram
  uniforms: Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null>
  textures: WebGLTexture[]
  palette: string
  quad: () => void
}

/** 画面先溶解成自身的发光线稿，下一幅画再从线稿里描出来并填满颜色。画面由 Canvas 2D 现场绘制。 */
export function SketchEdgeTransition({ className, style, children, ...props }: SketchEdgeTransitionProps) {
  const options = { ...defaults, ...props }
  const optionsRef = useRef(options)
  optionsRef.current = options

  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<GLState | null>(null)
  const lastTime = useRef(0)

  const uploadArtwork = (state: GLState, palette: string) => {
    const { gl } = state
    drawArtwork(palette as Scheme).forEach((canvas, index) => {
      gl.bindTexture(gl.TEXTURE_2D, state.textures[index]!)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas)
    })
    state.palette = palette
  }

  const draw = (time: number) => {
    const state = stateRef.current
    const canvas = canvasRef.current
    if (!state || !canvas) return
    lastTime.current = time
    const o = optionsRef.current
    const { gl, uniforms: u } = state
    if (state.palette !== o.palette) uploadArtwork(state, o.palette)

    // 时间线：停留 pause 秒，然后用 duration 秒转场；三幅画面依次轮播。
    const period = Math.max(0.05, o.pause + o.duration)
    const cycle = Math.floor(time / period)
    const local = time - cycle * period
    const progress = local < o.pause ? 0 : Math.min(1, (local - o.pause) / Math.max(0.05, o.duration))
    const from = cycle % 3
    const to = (cycle + 1) % 3

    gl.useProgram(state.program)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, state.textures[from]!)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, state.textures[to]!)
    gl.uniform1i(u.uFrom, 0)
    gl.uniform1i(u.uTo, 1)
    gl.uniform1f(u.progress, progress)
    gl.uniform1f(u.ratio, canvas.width / Math.max(1, canvas.height))
    gl.uniform1f(u.texAspect, ART_WIDTH / ART_HEIGHT)
    gl.uniform1f(u.edge_thickness, o.edgeThickness)
    gl.uniform1f(u.edge_brightness, o.edgeBrightness)
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
      const program = createProgram(gl, VERTEX, FRAGMENT)
      gl.useProgram(program)
      const quad = bindFullscreenQuad(gl, program)
      const uniforms = {} as GLState['uniforms']
      for (const name of UNIFORMS) uniforms[name] = gl.getUniformLocation(program, name)
      const textures = [0, 1, 2].map(() => {
        const texture = gl.createTexture()!
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        return texture
      })
      const state: GLState = { gl, program, uniforms, textures, palette: '', quad }
      stateRef.current = state
      uploadArtwork(state, optionsRef.current.palette)
      drawRef.current(lastTime.current)
    }
    const teardown = () => {
      const state = stateRef.current
      stateRef.current = null
      if (!state) return
      state.quad()
      state.gl.deleteProgram(state.program)
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
