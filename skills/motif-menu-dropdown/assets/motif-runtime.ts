// motif-runtime: hooks shared by Motif components (https://github.com/aimerfeng/motif, MIT).
// Generated from packages/runtime/src; edit there, not here.
import { clsx, type ClassValue } from 'clsx'
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type RefObject } from 'react'
import { twMerge } from 'tailwind-merge'

// ---- cn.ts ----
/** 合并 className，后面的 Tailwind 工具类覆盖前面冲突的（与 shadcn 的 cn 相同）。 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// ---- css-vars.ts ----
export type CSSVariables = Record<`--${string}`, string | number | undefined>

/**
 * 把 CSS 自定义属性（`--accent` 等）和普通样式合成一个 style 对象。
 * React 的 CSSProperties 不认识自定义属性，这里集中做唯一一次类型转换，组件里不必再写双重断言。
 */
export function cssVars(variables: CSSVariables, style?: CSSProperties): CSSProperties {
  return { ...style, ...variables } as CSSProperties
}

// ---- reduced-motion.ts ----
const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

/** 用户是否开启了「减少动态效果」。服务端渲染时视为未开启。 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  )
}

// ---- visibility.ts ----
/**
 * 元素是否值得继续动画：在视口内（或接近视口）且页面没有被隐藏。
 * 离屏或切到后台时返回 false，调用方应暂停 requestAnimationFrame。
 */
export function useIsActive(ref: RefObject<Element | null>, rootMargin = '64px'): boolean {
  const [inView, setInView] = useState(true)
  const [pageVisible, setPageVisible] = useState(true)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry?.isIntersecting ?? true), { rootMargin })
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, rootMargin])

  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState !== 'hidden')
    update()
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])

  return inView && pageVisible
}

// ---- frame-loop.ts ----
export interface FrameInfo {
  /** 累计的动画时间（秒），只在播放时前进，暂停再恢复不会跳帧。已乘以 speed。 */
  time: number
  /** 距上一帧的时间（秒），已乘以 speed，上限 0.1 秒。 */
  delta: number
}

export interface FrameLoopOptions {
  /** 时间流速倍率。 */
  speed?: number
  /**
   * 开启「减少动态效果」时的表现：
   * - static：只渲染一帧静态画面（time = staticTime），之后不再推进；
   * - slowed：继续播放，但速度降到 1/4。
   */
  reducedMotion?: 'static' | 'slowed'
  /** static 模式下渲染哪个时刻（秒），选一帧最好看的。 */
  staticTime?: number
}

/**
 * 统一的动画循环：离屏或页面隐藏时暂停，尊重「减少动态效果」，时间可以变速。
 * onFrame 每帧调用；它通过 ref 读取，不需要 useCallback。
 */
export function useFrameLoop(ref: RefObject<Element | null>, onFrame: (frame: FrameInfo) => void, options: FrameLoopOptions = {}): void {
  const { speed = 1, reducedMotion = 'static', staticTime = 0 } = options
  const active = useIsActive(ref)
  const reduced = usePrefersReducedMotion()
  const callback = useRef(onFrame)
  callback.current = onFrame
  const speedRef = useRef(speed)
  speedRef.current = reduced && reducedMotion === 'slowed' ? speed * 0.25 : speed
  const time = useRef(0)

  const frozen = reduced && reducedMotion === 'static'

  useEffect(() => {
    if (frozen) {
      time.current = staticTime
      callback.current({ time: staticTime, delta: 0 })
      return
    }
    if (!active) return
    let frame = 0
    let last: number | null = null
    const tick = (now: number) => {
      const delta = last === null ? 0 : Math.min((now - last) / 1000, 0.1) * speedRef.current
      last = now
      time.current += delta
      callback.current({ time: time.current, delta })
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, frozen, staticTime])
}

// ---- canvas-size.ts ----
export interface CanvasSize {
  /** 画布的像素尺寸（已乘以 dpr 并受 maxPixels 限制）。 */
  width: number
  height: number
  dpr: number
}

export interface CanvasSizeOptions {
  /** 设备像素比上限，高分屏上避免渲染过多像素。 */
  maxDpr?: number
  /** 画布总像素上限（例如 4K 全屏时再降一档）。 */
  maxPixels?: number
  onResize?: (size: CanvasSize) => void
}

/**
 * 让 canvas 的绘图缓冲区跟随它的 CSS 尺寸，同时限制 DPR 和总像素数。
 * 返回一个 ref，里面始终是最新尺寸，渲染循环里直接读，不会触发重渲染。
 */
export function useCanvasSize(canvasRef: RefObject<HTMLCanvasElement | null>, options: CanvasSizeOptions = {}): RefObject<CanvasSize> {
  const { maxDpr = 2, maxPixels = 2560 * 1440 } = options
  const size = useRef<CanvasSize>({ width: 1, height: 1, dpr: 1 })
  const onResize = useRef(options.onResize)
  onResize.current = options.onResize

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const update = () => {
      const rect = canvas.getBoundingClientRect()
      let dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
      const pixels = rect.width * rect.height * dpr * dpr
      if (pixels > maxPixels) dpr *= Math.sqrt(maxPixels / pixels)
      const width = Math.max(1, Math.round(rect.width * dpr))
      const height = Math.max(1, Math.round(rect.height * dpr))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
      size.current = { width, height, dpr }
      onResize.current?.(size.current)
    }
    const observer = new ResizeObserver(update)
    observer.observe(canvas)
    update()
    return () => observer.disconnect()
  }, [canvasRef, maxDpr, maxPixels])

  return size
}

// ---- webgl.ts ----
/** 编译并链接一个着色器程序；失败时抛出带 info log 的错误，方便在预览里看到原因。 */
export function createProgram(gl: WebGLRenderingContext | WebGL2RenderingContext, vertexSource: string, fragmentSource: string): WebGLProgram {
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)
    if (!shader) throw new Error('unable to create shader')
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader) ?? 'unknown error'
      gl.deleteShader(shader)
      throw new Error(`${type === gl.VERTEX_SHADER ? 'vertex' : 'fragment'} shader: ${log}`)
    }
    return shader
  }
  const vertex = compile(gl.VERTEX_SHADER, vertexSource)
  const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource)
  const program = gl.createProgram()
  if (!program) throw new Error('unable to create program')
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  // 链接后着色器对象可以删除，程序仍然有效。
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) ?? 'unknown error'
    gl.deleteProgram(program)
    throw new Error(`program link: ${log}`)
  }
  return program
}

/**
 * 给全屏着色器绑定一个覆盖整个视口的四边形（TRIANGLE_STRIP，4 个顶点）。
 * 返回释放函数。绘制时调用 `gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)`。
 */
export function bindFullscreenQuad(gl: WebGLRenderingContext | WebGL2RenderingContext, program: WebGLProgram, attribute = 'a_pos'): () => void {
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const location = gl.getAttribLocation(program, attribute)
  gl.enableVertexAttribArray(location)
  gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0)
  return () => gl.deleteBuffer(buffer)
}

/** 卸载时主动释放 WebGL 上下文：浏览器同时只允许约 16 个，画廊里很快就会用完。 */
export function releaseContext(gl: WebGLRenderingContext | WebGL2RenderingContext): void {
  gl.getExtension('WEBGL_lose_context')?.loseContext()
}
