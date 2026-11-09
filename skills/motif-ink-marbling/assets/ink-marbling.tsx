import { bindFullscreenQuad, cn, createProgram, releaseContext, useCanvasSize, useFrameLoop, usePrefersReducedMotion } from '@/lib/motif-runtime'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { MAX_OPS, Marbling, type CombPattern } from './marbling'
import { FRAGMENT_SHADER, VERTEX_SHADER } from './shaders'

/* @motif:defaults */
export const defaults = {
  palette: ['#1d3150', '#b5452f', '#d99b3c', '#2f6a62', '#23232b'],
  paper: '#f1e9d8',
  inkOpacity: 0.94,
  combPattern: 'wave',
  combSpacing: 8,
  combStrength: 1,
  dropSize: 10,
  dropRate: 4,
}
/* @motif:end */

export type InkMarblingProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 缓存比画面四周各宽出这么多：梳理和波浪会把画面外的墨拉进来。 */
const MARGIN = 0.1
/** 缓存分几帧画完，避免一帧里做完整的逆推。 */
const STRIPS = 4
/** 有这么多个操作静止下来、还没进缓存时，就重画缓存。 */
const REFRESH_AFTER = 8
/** 拖动时每移动这么远（单位长度）就拉一笔。 */
const DRAG_STEP = 0.012

type Uniform =
  | 'u_ops'
  | 'u_cache'
  | 'u_first'
  | 'u_end'
  | 'u_total'
  | 'u_useCache'
  | 'u_size'
  | 'u_cacheSize'
  | 'u_unit'
  | 'u_palette'
  | 'u_paletteSize'
  | 'u_paper'
  | 'u_opacity'
  | 'u_grain'
const UNIFORMS: Uniform[] = ['u_ops', 'u_cache', 'u_first', 'u_end', 'u_total', 'u_useCache', 'u_size', 'u_cacheSize', 'u_unit', 'u_palette', 'u_paletteSize', 'u_paper', 'u_opacity', 'u_grain']

interface Cache {
  texture: WebGLTexture
  framebuffer: WebGLFramebuffer
  /** 缓存画到了哪个操作（编号）。 */
  serial: number
  /** 下一条要画的横条；等于 STRIPS 表示画完了。 */
  strip: number
}

interface GLState {
  gl: WebGL2RenderingContext
  uniforms: Record<Uniform, WebGLUniformLocation | null>
  opsTexture: WebGLTexture
  opsData: Float32Array
  front: Cache
  back: Cache
  cacheWidth: number
  cacheHeight: number
  /** 前缓存是否可用；尺寸、配色变化或换了一套模拟后要整张重画。 */
  valid: boolean
  dispose: () => void
}

interface Simulation {
  sim: Marbling
  key: string
  aspect: number
  /** 这套模拟从哪个可见时刻开始。 */
  base: number
}

function parseHex(hex: string): [number, number, number] {
  const value = hex.replace('#', '')
  return [0, 1, 2].map((index) => parseInt(value.slice(index * 2, index * 2 + 2), 16) / 255) as [number, number, number]
}

function createCache(gl: WebGL2RenderingContext): Cache {
  const texture = gl.createTexture()!
  const framebuffer = gl.createFramebuffer()!
  return { texture, framebuffer, serial: 0, strip: STRIPS }
}

function sizeCache(gl: WebGL2RenderingContext, cache: Cache, width: number, height: number) {
  gl.bindTexture(gl.TEXTURE_2D, cache.texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.bindFramebuffer(gl.FRAMEBUFFER, cache.framebuffer)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, cache.texture, 0)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  cache.strip = STRIPS
}

/**
 * 墨流纹：墨滴落在水面上一圈圈推开，再被梳子梳成人字、波浪或漩涡。用的是 Jaffer 的精确变换，
 * 任何分辨率下都清晰。拖动可以亲手梳墨，点一下落一滴。children 叠在纹样之上。
 */
export function InkMarbling({ className, style, children, ...props }: InkMarblingProps) {
  const options = { ...defaults, ...props }
  const optionsRef = useRef(options)
  optionsRef.current = options
  const reduced = usePrefersReducedMotion()
  const reducedRef = useRef(reduced)
  reducedRef.current = reduced

  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<GLState | null>(null)
  const simRef = useRef<Simulation | null>(null)
  const lastTime = useRef(0)
  const colorKey = useRef('')

  /** 参数或宽高比变了就换一套模拟（同样的参数总是同样的图案）。 */
  const simulation = (time: number, aspect: number): Marbling => {
    const o = optionsRef.current
    const key = [o.dropSize, o.dropRate, o.combPattern, o.combSpacing, o.combStrength].join('|')
    const current = simRef.current
    if (current && current.key === key && Math.abs(Math.log(aspect / current.aspect)) < 0.25) return current.sim
    const sim = new Marbling({
      dropSize: o.dropSize / 100,
      dropRate: o.dropRate,
      pattern: o.combPattern as CombPattern,
      spacing: o.combSpacing / 100,
      strength: o.combStrength,
      aspect,
    })
    simRef.current = { sim, key, aspect, base: time }
    if (glRef.current) glRef.current.valid = false
    return sim
  }

  const setUniforms = (state: GLState, canvas: HTMLCanvasElement) => {
    const { gl, uniforms } = state
    const o = optionsRef.current
    const colors = (o.palette.length > 0 ? o.palette : ['#1f3354']).slice(0, 5)
    const flat = new Float32Array(15)
    colors.forEach((hex, index) => flat.set(parseHex(hex), index * 3))
    gl.uniform3fv(uniforms.u_palette, flat)
    gl.uniform1i(uniforms.u_paletteSize, colors.length)
    gl.uniform3fv(uniforms.u_paper, parseHex(o.paper))
    gl.uniform1f(uniforms.u_opacity, o.inkOpacity)
    gl.uniform1f(uniforms.u_unit, Math.sqrt(canvas.width * canvas.height))
    gl.uniform2f(uniforms.u_cacheSize, state.cacheWidth, state.cacheHeight)
    gl.uniform1i(uniforms.u_ops, 0)
    gl.uniform1i(uniforms.u_cache, 1)
  }

  /** 把编号在 cache.serial 之前的操作画进缓存的第 strip 条（strip 为 -1 时一次画完）。 */
  const renderCache = (state: GLState, sim: Marbling, cache: Cache, strip: number) => {
    const { gl, uniforms } = state
    const count = sim.ops.length
    gl.bindFramebuffer(gl.FRAMEBUFFER, cache.framebuffer)
    gl.viewport(0, 0, state.cacheWidth, state.cacheHeight)
    if (strip >= 0) {
      const top = Math.floor((state.cacheHeight * strip) / STRIPS)
      const bottom = Math.floor((state.cacheHeight * (strip + 1)) / STRIPS)
      gl.enable(gl.SCISSOR_TEST)
      gl.scissor(0, top, state.cacheWidth, bottom - top)
    }
    gl.uniform1i(uniforms.u_first, Math.min(count, Math.max(0, sim.newestId - cache.serial)))
    gl.uniform1i(uniforms.u_end, count)
    gl.uniform1i(uniforms.u_total, count)
    gl.uniform1i(uniforms.u_useCache, 0)
    gl.uniform2f(uniforms.u_size, state.cacheWidth, state.cacheHeight)
    gl.uniform1f(uniforms.u_grain, 0)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    gl.disable(gl.SCISSOR_TEST)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }

  const draw = (time: number) => {
    const state = glRef.current
    const canvas = canvasRef.current
    if (!state || !canvas) return
    lastTime.current = time
    const { gl, uniforms } = state
    const o = optionsRef.current
    const sim = simulation(time, canvas.width / canvas.height)
    sim.advanceTo(sim.startTime + Math.max(0, time - simRef.current!.base))

    const colors = [o.palette.join(','), o.paper, o.inkOpacity].join('|')
    if (colors !== colorKey.current) {
      colorKey.current = colors
      state.valid = false
    }

    if (sim.dirty) {
      sim.pack(state.opsData)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, state.opsTexture)
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, MAX_OPS, 2, gl.RGBA, gl.FLOAT, state.opsData)
    }
    setUniforms(state, canvas)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, state.opsTexture)

    // 缓存：较旧、已经静止的操作只在这里逆推一次；每帧只逆推最近的几个。
    if (!state.valid) {
      state.front.serial = sim.settledId
      renderCache(state, sim, state.front, -1)
      state.back.strip = STRIPS
      state.valid = true
    } else if (state.back.strip < STRIPS) {
      renderCache(state, sim, state.back, state.back.strip)
      state.back.strip++
      if (state.back.strip === STRIPS) [state.front, state.back] = [state.back, state.front]
    } else {
      const settled = sim.settledId
      const pending = settled - state.front.serial
      if (pending >= REFRESH_AFTER || (pending > 0 && !sim.animating) || sim.newestId - state.front.serial > 48) {
        state.back.serial = settled
        state.back.strip = 0
      }
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, state.front.texture)
    gl.uniform1i(uniforms.u_first, 0)
    gl.uniform1i(uniforms.u_end, Math.min(sim.ops.length, Math.max(0, sim.newestId - state.front.serial)))
    gl.uniform1i(uniforms.u_total, sim.ops.length)
    gl.uniform1i(uniforms.u_useCache, 1)
    gl.uniform2f(uniforms.u_size, canvas.width, canvas.height)
    gl.uniform1f(uniforms.u_grain, 1.6 * Math.sqrt((canvas.width * canvas.height) / Math.max(1, canvas.clientWidth * canvas.clientHeight)))
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
  const drawRef = useRef(draw)
  drawRef.current = draw

  const resize = () => {
    const state = glRef.current
    const canvas = canvasRef.current
    if (!state || !canvas) return
    state.cacheWidth = Math.max(1, Math.round(canvas.width * (1 + 2 * MARGIN)))
    state.cacheHeight = Math.max(1, Math.round(canvas.height * (1 + 2 * MARGIN)))
    sizeCache(state.gl, state.front, state.cacheWidth, state.cacheHeight)
    sizeCache(state.gl, state.back, state.cacheWidth, state.cacheHeight)
    state.valid = false
    drawRef.current(lastTime.current)
  }
  const resizeRef = useRef(resize)
  resizeRef.current = resize

  useCanvasSize(canvasRef, { maxDpr: 1.5, maxPixels: 1920 * 1080, onResize: () => resizeRef.current() })

  useEffect(() => {
    const canvas = canvasRef.current!
    let disposed = false

    const setup = () => {
      const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' })
      if (!gl) return
      const program = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER)
      gl.useProgram(program)
      const releaseQuad = bindFullscreenQuad(gl, program)
      const uniforms = Object.fromEntries(UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)])) as GLState['uniforms']
      const opsTexture = gl.createTexture()!
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, opsTexture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, MAX_OPS, 2, 0, gl.RGBA, gl.FLOAT, null)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      const front = createCache(gl)
      const back = createCache(gl)
      glRef.current = {
        gl,
        uniforms,
        opsTexture,
        opsData: new Float32Array(MAX_OPS * 2 * 4),
        front,
        back,
        cacheWidth: 1,
        cacheHeight: 1,
        valid: false,
        dispose: () => {
          releaseQuad()
          gl.deleteTexture(opsTexture)
          for (const cache of [front, back]) {
            gl.deleteTexture(cache.texture)
            gl.deleteFramebuffer(cache.framebuffer)
          }
          gl.deleteProgram(program)
        },
      }
      // 新的上下文里数据要重新上传。
      if (simRef.current) simRef.current.sim.dirty = true
      resizeRef.current()
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

  // 拖动梳墨，点一下落墨。按在链接、按钮这类可交互的子元素上时不处理。
  useEffect(() => {
    const host = hostRef.current!
    let drag: { id: number; x: number; y: number; moved: boolean } | null = null

    const toUnits = (event: PointerEvent): [number, number] => {
      const bounds = host.getBoundingClientRect()
      const unit = Math.sqrt(Math.max(1, bounds.width * bounds.height))
      return [(event.clientX - bounds.left - bounds.width / 2) / unit, (event.clientY - bounds.top - bounds.height / 2) / unit]
    }
    const redraw = () => {
      if (reducedRef.current) drawRef.current(lastTime.current)
    }
    const onDown = (event: PointerEvent) => {
      if (event.button !== 0 || !simRef.current) return
      if (event.target instanceof Element && event.target.closest('a, button, input, textarea, select, label, summary, [role="button"], [contenteditable="true"]')) return
      const [x, y] = toUnits(event)
      drag = { id: event.pointerId, x, y, moved: false }
    }
    const onMove = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id || !simRef.current) return
      const [x, y] = toUnits(event)
      if (Math.hypot(x - drag.x, y - drag.y) < DRAG_STEP) return
      simRef.current.sim.stroke(drag.x, drag.y, x, y)
      drag = { ...drag, x, y, moved: true }
      redraw()
    }
    const onUp = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return
      if (!drag.moved && simRef.current) {
        const [x, y] = toUnits(event)
        simRef.current.sim.dropAt(x, y, reducedRef.current)
        redraw()
      }
      drag = null
    }
    const onCancel = () => {
      drag = null
    }
    host.addEventListener('pointerdown', onDown)
    host.addEventListener('pointermove', onMove, { passive: true })
    host.addEventListener('pointerup', onUp)
    host.addEventListener('pointercancel', onCancel)
    host.addEventListener('pointerleave', onCancel)
    return () => {
      host.removeEventListener('pointerdown', onDown)
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerup', onUp)
      host.removeEventListener('pointercancel', onCancel)
      host.removeEventListener('pointerleave', onCancel)
    }
  }, [])

  // 暂停或减少动态效果时，改参数也要立刻重画。
  useEffect(() => {
    drawRef.current(lastTime.current)
  }, [options.palette, options.paper, options.inkOpacity, options.dropSize, options.dropRate, options.combPattern, options.combSpacing, options.combStrength])

  useFrameLoop(hostRef, ({ time }) => draw(time), { reducedMotion: 'static', staticTime: 0 })

  return (
    <div ref={hostRef} className={cn('relative isolate overflow-hidden', className)} style={{ background: options.paper, ...style }}>
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 -z-10 block h-full w-full" />
      {children}
    </div>
  )
}
