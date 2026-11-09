// SPDX-License-Identifier: MIT
// Copyright (c) 2017-present gl-transitions contributors
// Source: https://github.com/gl-transitions/gl-transitions/blob/902218a/transitions/BookFlip.glsl
// Modified by Motif; see the item's provenance.
import { bindFullscreenQuad, cn, createProgram, releaseContext, useCanvasSize, useFrameLoop, usePrefersReducedMotion } from '@/lib/motif-runtime'
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { drawSpreads, SPREAD_HEIGHT, SPREAD_WIDTH } from './pages'
import { BOOK_FLIP } from './shaders'

/* @motif:defaults */
export const defaults = {
  pages: 8,
  flipDuration: 1.1,
  easing: [0.45, 0, 0.25, 1],
  autoplayInterval: 1.8,
  pageShade: 0.3,
  gutterShadow: 0.35,
  palette: ['#c8793d', '#3d5566', '#7f9a83', '#b4473a'],
  interaction: 'both',
}
/* @motif:end */

export type PageFlipLookbookProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 读屏用的书名。 */
  label?: string
}

const VERTEX = `
attribute vec2 a_pos;
varying vec2 _uv;
void main() {
  _uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

/** gl-transitions 的约定：progress、getFromColor、getToColor；外面再叠一道书脊阴影。 */
const FRAGMENT = `
precision highp float;
varying vec2 _uv;
uniform sampler2D uFrom;
uniform sampler2D uTo;
uniform float progress;
uniform float gutterShadow;

vec4 getFromColor(vec2 uv) { return texture2D(uFrom, vec2(uv.x, 1.0 - uv.y)); }
vec4 getToColor(vec2 uv) { return texture2D(uTo, vec2(uv.x, 1.0 - uv.y)); }

${BOOK_FLIP}

void main() {
  vec4 color = transition(_uv);
  float spine = exp(-abs(_uv.x - 0.5) * 34.0);
  color.rgb *= 1.0 - gutterShadow * 0.6 * spine;
  gl_FragColor = vec4(color.rgb, 1.0);
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

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

interface GLState {
  gl: WebGLRenderingContext
  program: WebGLProgram
  uniforms: Record<string, WebGLUniformLocation | null>
  textures: WebGLTexture[]
  key: string
  quad: () => void
}

/** 进行中的一次翻页：from 跨页翻到 to 跨页，progress 从 p0 走到 p1（1 = 翻完）。 */
interface Turn {
  from: number
  to: number
  p0: number
  p1: number
  start: number
  duration: number
}

interface Drag {
  pointerId: number
  x0: number
  width: number
  moved: boolean
  from: number
  to: number
  /** 从右半边拖是往后翻（progress 由 0 增加），从左半边拖是往前翻（由 1 减少）。 */
  forward: boolean | null
}

/** 双页画册：用 gl-transitions 的 BookFlip 着色器翻页，可拖动、点击两侧或用方向键翻。 */
export function PageFlipLookbook({ className, style, label = 'Lookbook', ...props }: PageFlipLookbookProps) {
  const o0 = { ...defaults, ...props }
  const optionsRef = useRef(o0)
  optionsRef.current = o0
  const reduced = usePrefersReducedMotion()

  const pageCount = Math.max(2, Math.round(o0.pages / 2) * 2)
  const spreadCount = pageCount / 2

  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<GLState | null>(null)
  const now = useRef(0)
  const view = useRef({ spread: 0, from: 0, to: 0, progress: 0, turn: null as Turn | null, drag: null as Drag | null, lastActivity: 0 })
  const [spread, setSpread] = useState(0)


  const upload = (state: GLState, key: string) => {
    const { gl } = state
    for (const texture of state.textures) gl.deleteTexture(texture)
    const o = optionsRef.current
    state.textures = drawSpreads(o.pages, o.palette).map((canvas) => {
      const texture = gl.createTexture()!
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas)
      return texture
    })
    state.key = key
  }

  const finish = (spreadIndex: number) => {
    const v = view.current
    v.spread = spreadIndex
    v.from = spreadIndex
    v.to = spreadIndex
    v.progress = 0
    v.turn = null
    v.lastActivity = now.current
    setSpread(spreadIndex)
  }

  const render = () => {
    const state = stateRef.current
    const canvas = canvasRef.current
    if (!state || !canvas) return
    const o = optionsRef.current
    const key = `${Math.max(2, Math.round(o.pages / 2) * 2)}|${o.palette.join(',')}`
    if (state.key !== key) upload(state, key)
    const v = view.current
    const last = state.textures.length - 1
    const from = Math.min(v.from, last)
    const to = Math.min(v.to, last)
    // BookFlip 在 progress = 0.5 时会除以零，避开这一点。
    let progress = v.progress
    if (Math.abs(progress - 0.5) < 1e-3) progress = 0.501
    const { gl, uniforms: u } = state
    gl.useProgram(state.program)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, state.textures[from]!)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, state.textures[to]!)
    gl.uniform1i(u.uFrom!, 0)
    gl.uniform1i(u.uTo!, 1)
    gl.uniform1f(u.progress!, progress)
    gl.uniform1f(u.pageShade!, o.pageShade)
    gl.uniform1f(u.gutterShadow!, o.gutterShadow)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
  const renderRef = useRef(render)
  renderRef.current = render

  /** 开始一次动画翻页；减少动态效果时直接跳到结果。 */
  const startTurn = (from: number, to: number, p0: number, p1: number) => {
    const v = view.current
    if (reduced) {
      finish(p1 >= 1 ? to : from)
      renderRef.current()
      return
    }
    const o = optionsRef.current
    v.from = from
    v.to = to
    v.progress = p0
    v.turn = { from, to, p0, p1, start: now.current, duration: Math.max(0.05, o.flipDuration * Math.abs(p1 - p0)) }
  }

  const go = (direction: 1 | -1) => {
    const v = view.current
    if (v.turn || v.drag) return
    v.lastActivity = now.current
    if (direction === 1 && v.spread < spreadCount - 1) startTurn(v.spread, v.spread + 1, 0, 1)
    if (direction === -1 && v.spread > 0) startTurn(v.spread - 1, v.spread, 1, 0)
  }

  useFrameLoop(
    hostRef,
    ({ time }) => {
      now.current = time
      const v = view.current
      const o = optionsRef.current
      const count = Math.max(2, Math.round(o.pages / 2) * 2) / 2
      if (v.spread > count - 1 && !v.turn) finish(count - 1)
      if (v.turn) {
        const { p0, p1, start, duration, from, to } = v.turn
        const t = clamp01((time - start) / duration)
        const [x1 = 0.45, y1 = 0, x2 = 0.25, y2 = 1] = o.easing
        v.progress = p0 + (p1 - p0) * bezier(x1, y1, x2, y2, t)
        if (t >= 1) finish(p1 >= 1 ? to : from)
      } else if (!v.drag && o.autoplayInterval > 0 && time - v.lastActivity >= o.autoplayInterval) {
        startTurn(v.spread, (v.spread + 1) % count, 0, 1)
      }
      renderRef.current()
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  useCanvasSize(canvasRef, { maxDpr: 1.5, onResize: () => renderRef.current() })

  useEffect(() => {
    const canvas = canvasRef.current!
    let disposed = false
    const setup = () => {
      const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'high-performance' })
      if (!gl) return
      const program = createProgram(gl, VERTEX, FRAGMENT)
      gl.useProgram(program)
      const quad = bindFullscreenQuad(gl, program)
      const uniforms: Record<string, WebGLUniformLocation | null> = {}
      for (const name of ['uFrom', 'uTo', 'progress', 'pageShade', 'gutterShadow']) uniforms[name] = gl.getUniformLocation(program, name)
      stateRef.current = { gl, program, uniforms, textures: [], key: '', quad }
      renderRef.current()
    }
    const teardown = () => {
      const state = stateRef.current
      stateRef.current = null
      if (!state) return
      state.quad()
      for (const texture of state.textures) state.gl.deleteTexture(texture)
      state.gl.deleteProgram(state.program)
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

  // 参数变了（尤其是静态模式下）也重画一帧。
  useEffect(() => {
    renderRef.current()
  })

  const allowDrag = o0.interaction !== 'click'
  const allowClick = o0.interaction !== 'drag'

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const v = view.current
    if (v.turn || v.drag || event.button !== 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    event.currentTarget.setPointerCapture(event.pointerId)
    const forwardSide = event.clientX - rect.left > rect.width / 2
    v.drag = {
      pointerId: event.pointerId,
      x0: event.clientX,
      width: rect.width,
      moved: false,
      from: forwardSide ? v.spread : v.spread - 1,
      to: forwardSide ? v.spread + 1 : v.spread,
      forward: forwardSide,
    }
    v.lastActivity = now.current
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const v = view.current
    const d = v.drag
    if (!d || d.pointerId !== event.pointerId || !allowDrag) return
    const dx = event.clientX - d.x0
    if (!d.moved && Math.abs(dx) < 6) return
    if (d.from < 0 || d.to > spreadCount - 1) return
    d.moved = true
    v.from = d.from
    v.to = d.to
    // 翻起的页边大致跟着指针走：页边在 x = 1 - progress。
    v.progress = d.forward ? clamp01(-dx / d.width) : clamp01(1 - dx / d.width)
    if (reduced) renderRef.current()
  }

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const v = view.current
    const d = v.drag
    if (!d || d.pointerId !== event.pointerId) return
    v.drag = null
    v.lastActivity = now.current
    if (d.moved) {
      startTurn(d.from, d.to, v.progress, v.progress > 0.5 ? 1 : 0)
    } else if (allowClick) {
      go(d.forward ? 1 : -1)
    }
  }

  const onPointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    const v = view.current
    const d = v.drag
    if (!d || d.pointerId !== event.pointerId) return
    v.drag = null
    if (d.moved) startTurn(d.from, d.to, v.progress, d.forward ? 0 : 1)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight' || event.key === 'PageDown') {
      event.preventDefault()
      go(1)
    } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
      event.preventDefault()
      go(-1)
    }
  }

  const shown = Math.min(spread, spreadCount - 1)

  return (
    <div className={cn('flex w-full flex-col items-center gap-4', className)} style={style}>
      <div
        ref={hostRef}
        role="region"
        aria-roledescription="book"
        aria-label={`${label}. Use the left and right arrow keys to turn pages.`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        className="relative w-full cursor-grab touch-pan-y overflow-hidden rounded-[3px] bg-[#f4efe6] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55),0_8px_18px_-8px_rgba(0,0,0,0.4)] outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background active:cursor-grabbing"
        style={{ aspectRatio: `${SPREAD_WIDTH} / ${SPREAD_HEIGHT}` }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />
      </div>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <PageButton direction={-1} disabled={shown === 0} onClick={() => go(-1)} />
        <span aria-live="polite" className="min-w-[9.5rem] text-center tabular-nums">
          Pages {shown * 2 + 1}–{shown * 2 + 2} of {pageCount}
        </span>
        <PageButton direction={1} disabled={shown === spreadCount - 1} onClick={() => go(1)} />
      </div>
    </div>
  )
}

function PageButton({ direction, disabled, onClick }: { direction: 1 | -1; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 1 ? 'Next pages' : 'Previous pages'}
      className="grid size-9 place-items-center rounded-full border border-border text-foreground transition-[background-color,opacity] duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-35 disabled:hover:bg-transparent"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d={direction === 1 ? 'M6 3.5 10.5 8 6 12.5' : 'M10 3.5 5.5 8 10 12.5'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
