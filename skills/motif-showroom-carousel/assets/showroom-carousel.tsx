// SPDX-License-Identifier: MIT
// Copyright (c) 2017-present gl-transitions contributors
// Source: https://github.com/gl-transitions/gl-transitions/blob/902218a/transitions/swap.glsl
// Modified by Motif; see the item's provenance.
import { bindFullscreenQuad, cn, createProgram, releaseContext, useCanvasSize, useFrameLoop, usePrefersReducedMotion } from '@/lib/motif-runtime'
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { ART_HEIGHT, ART_WIDTH, drawArtwork } from './artwork'
import { DOORWAY, SWAP } from './shaders'

/* @motif:defaults */
export const defaults = {
  variant: 'swap',
  reflection: 0.4,
  perspective: 0.2,
  depth: 3,
  floorColor: '#000000',
  duration: 1.2,
  autoplayInterval: 3.5,
  easing: [0.65, 0, 0.35, 1],
}
/* @motif:end */

export interface ShowroomSlide {
  title: string
  caption?: string
  /** 可选图片地址；不给就用内置的产品画面。 */
  image?: string
}

export type ShowroomCarouselProps = Partial<typeof defaults> & {
  slides?: ShowroomSlide[]
  /** 自动轮播；悬停或聚焦时暂停。 */
  autoplay?: boolean
  className?: string
  style?: CSSProperties
}

const DEFAULT_SLIDES: ShowroomSlide[] = [
  { title: 'Halo One', caption: 'Room-filling sound in a 14 cm column.' },
  { title: 'Arc Studio', caption: 'Closed-back headphones, 40 h battery.' },
  { title: 'Tern 40', caption: 'Titanium case, sapphire crystal, 10 bar.' },
  { title: 'Lumen M2', caption: '26 MP full-frame body with a 35 mm f/1.8.' },
]

const VERTEX = `
attribute vec2 a_pos;
varying vec2 _uv;
void main() {
  _uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

/**
 * gl-transitions 的约定（progress、ratio、getFromColor、getToColor）。
 * 展台：把画面缩小放在上方，下面露出地板，静止时也能看到倒影。
 */
const fragmentSource = (glsl: string) => `
precision highp float;
varying vec2 _uv;
uniform sampler2D uFrom;
uniform sampler2D uTo;
uniform float progress;
uniform float ratio;
uniform float fromAspect;
uniform float toAspect;

vec2 coverUv(vec2 uv, float aspect) {
  float r = ratio / aspect;
  vec2 s = r > 1.0 ? vec2(1.0, 1.0 / r) : vec2(r, 1.0);
  return (uv - 0.5) * s + 0.5;
}
vec4 getFromColor(vec2 uv) { return texture2D(uFrom, coverUv(vec2(uv.x, 1.0 - uv.y), fromAspect)); }
vec4 getToColor(vec2 uv) { return texture2D(uTo, coverUv(vec2(uv.x, 1.0 - uv.y), toAspect)); }

${glsl}

const float STAGE_ZOOM = 1.5;
const float STAGE_TOP = 0.07;

void main() {
  vec2 q = (_uv - vec2(0.5 - 0.5 / STAGE_ZOOM, 1.0 - STAGE_TOP - 1.0 / STAGE_ZOOM)) * STAGE_ZOOM;
  gl_FragColor = transition(q);
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

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.replace(/./g, (c) => c + c) : h.padEnd(6, '0')
  const n = parseInt(full.slice(0, 6), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

function luminance([r, g, b]: [number, number, number]) {
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

type Uniforms = Record<string, WebGLUniformLocation | null>
interface GLState {
  gl: WebGLRenderingContext
  textures: WebGLTexture[]
  aspects: number[]
  programs: Map<string, { program: WebGLProgram; uniforms: Uniforms }>
  quad: (() => void) | null
}

/** 时间线：from → to 的转场从 start 开始；start 为 null 表示静止在 from。 */
interface Timeline {
  from: number
  to: number
  start: number | null
  lastChange: number
}

/** 镜面展台轮播：画面在反光地板上切换（透视交换或开门），带说明文字和前后按钮。 */
export function ShowroomCarousel({ slides = DEFAULT_SLIDES, autoplay = true, className, style, ...props }: ShowroomCarouselProps) {
  const options = { ...defaults, ...props }
  const optionsRef = useRef(options)
  optionsRef.current = options
  const count = Math.max(1, slides.length)
  const slidesRef = useRef(slides)
  slidesRef.current = slides

  const reduced = usePrefersReducedMotion()
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<GLState | null>(null)
  const timeline = useRef<Timeline>({ from: 0, to: 0, start: null, lastChange: 0 })
  const lastTime = useRef(0)
  const paused = useRef(false)
  const [index, setIndex] = useState(0)
  const autoplayRef = useRef(autoplay && !reduced)
  autoplayRef.current = autoplay && !reduced

  const programFor = (state: GLState, variant: string) => {
    const key = variant === 'doorway' ? 'doorway' : 'swap'
    let entry = state.programs.get(key)
    if (!entry) {
      const { gl } = state
      const program = createProgram(gl, VERTEX, fragmentSource(key === 'doorway' ? DOORWAY : SWAP))
      gl.useProgram(program)
      if (!state.quad) state.quad = bindFullscreenQuad(gl, program)
      const uniforms: Uniforms = {}
      for (const name of ['uFrom', 'uTo', 'progress', 'ratio', 'fromAspect', 'toAspect', 'reflection', 'perspective', 'depth', 'floorColor']) uniforms[name] = gl.getUniformLocation(program, name)
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
    const tl = timeline.current
    const n = slidesRef.current.length || 1

    // 推进时间线：转场走完就落定；静止够久且没暂停就自动切下一张。
    let raw = 0
    if (tl.start !== null) {
      raw = (time - tl.start) / Math.max(0.05, o.duration)
      if (raw >= 1) {
        tl.from = tl.to
        tl.start = null
        tl.lastChange = time
        raw = 0
      }
    } else if (paused.current || !autoplayRef.current || n < 2) {
      tl.lastChange = time
    } else if (time - tl.lastChange >= o.autoplayInterval) {
      tl.to = (tl.from + 1) % n
      tl.start = time
      setIndex(tl.to)
    }
    const [x1, y1, x2, y2] = o.easing as [number, number, number, number]
    const progress = tl.start === null ? 0 : bezier(x1, y1, x2, y2, raw)

    const { gl } = state
    const entry = programFor(state, o.variant)
    gl.useProgram(entry.program)
    gl.viewport(0, 0, canvas.width, canvas.height)
    const from = tl.from % state.textures.length
    const to = (tl.start === null ? tl.from : tl.to) % state.textures.length
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, state.textures[from]!)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, state.textures[to]!)
    const u = entry.uniforms
    const [r, g, b] = hexToRgb(o.floorColor)
    gl.uniform1i(u.uFrom!, 0)
    gl.uniform1i(u.uTo!, 1)
    gl.uniform1f(u.progress!, progress)
    gl.uniform1f(u.ratio!, canvas.width / Math.max(1, canvas.height))
    gl.uniform1f(u.fromAspect!, state.aspects[from]!)
    gl.uniform1f(u.toAspect!, state.aspects[to]!)
    gl.uniform1f(u.reflection!, o.reflection)
    gl.uniform1f(u.perspective!, o.perspective)
    gl.uniform1f(u.depth!, o.depth)
    gl.uniform4f(u.floorColor!, r, g, b, 1)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
  const drawRef = useRef(draw)
  drawRef.current = draw
  useCanvasSize(canvasRef, { maxDpr: 1.5, onResize: () => drawRef.current(lastTime.current) })

  // 图片列表变了才重新上传纹理。
  const imageKey = slides.map((slide) => slide.image ?? '').join('\n')
  useEffect(() => {
    const canvas = canvasRef.current!
    let disposed = false

    const setup = () => {
      const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'high-performance' })
      if (!gl) return
      const list = slidesRef.current
      const state: GLState = { gl, textures: [], aspects: [], programs: new Map(), quad: null }
      const upload = (i: number, source: TexImageSource, aspect: number) => {
        gl.bindTexture(gl.TEXTURE_2D, state.textures[i]!)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
        state.aspects[i] = aspect
      }
      list.forEach((slide, i) => {
        const texture = gl.createTexture()!
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        state.textures.push(texture)
        upload(i, drawArtwork(i), ART_WIDTH / ART_HEIGHT)
        if (slide.image) {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => {
            if (disposed || stateRef.current !== state) return
            upload(i, img, img.naturalWidth / Math.max(1, img.naturalHeight))
            drawRef.current(lastTime.current)
          }
          img.src = slide.image
        }
      })
      if (state.textures.length === 0) return
      stateRef.current = state
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
  }, [imageKey])

  // 静态模式下参数变了也要重画一帧。
  useEffect(() => {
    drawRef.current(lastTime.current)
  })

  useFrameLoop(hostRef, ({ time }) => draw(time), { reducedMotion: 'static', staticTime: 0 })

  const go = (target: number) => {
    const tl = timeline.current
    const next = ((target % count) + count) % count
    if (tl.start !== null) tl.from = tl.to
    if (next === tl.from) {
      tl.start = null
    } else if (reduced) {
      // 减少动态效果：直接切换，不做转场。
      tl.from = next
      tl.start = null
    } else {
      tl.to = next
      tl.start = lastTime.current
    }
    tl.lastChange = lastTime.current
    setIndex(next)
    drawRef.current(lastTime.current)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      go(index + 1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      go(index - 1)
    }
  }

  const darkFloor = luminance(hexToRgb(options.floorColor)) < 0.4
  const ink = darkFloor ? '#f5f5f7' : '#111114'
  const muted = darkFloor ? 'rgba(245,245,247,0.62)' : 'rgba(17,17,20,0.64)'
  const line = darkFloor ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.16)'
  const current = slides[index % count]

  return (
    <div
      ref={hostRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Product showroom"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
      className={cn('relative flex w-full min-w-0 flex-col overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2', className)}
      style={{ backgroundColor: options.floorColor, color: ink, ...style }}
    >
      <div className="relative aspect-[16/10] w-full">
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 block h-full w-full" />
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4 px-5 pb-5 sm:px-8 sm:pb-7">
        <div aria-live={autoplay ? 'off' : 'polite'} aria-atomic="true" className="min-w-0 flex-1">
          <p className="text-xs tracking-[0.2em] uppercase" style={{ color: muted }}>
            {String((index % count) + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{current?.title}</h3>
          {current?.caption ? (
            <p className="mt-1 text-sm" style={{ color: muted }}>
              {current.caption}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {slides.map((slide, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show ${slide.title}`}
                aria-current={i === index ? 'true' : undefined}
                onClick={() => go(i)}
                className="h-1.5 rounded-full transition-[width,opacity] duration-300 outline-none focus-visible:ring-2"
                style={{ width: i === index ? 20 : 6, backgroundColor: ink, opacity: i === index ? 1 : 0.35 }}
              />
            ))}
          </div>
          {[-1, 1].map((dir) => (
            <button
              key={dir}
              type="button"
              aria-label={dir < 0 ? 'Previous slide' : 'Next slide'}
              onClick={() => go(index + dir)}
              className="grid size-9 place-items-center rounded-full border transition-[background-color] duration-200 outline-none hover:bg-current/10 focus-visible:ring-2"
              style={{ borderColor: line }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={dir < 0 ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
