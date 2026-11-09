// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Eduardo Calvo
// Source: https://github.com/educlopez/smoothui/blob/b6312bc/packages/smoothui/components/aurora-curtain/index.tsx
// Modified by Motif; see the item's provenance.
import { bindFullscreenQuad, cn, createProgram, releaseContext, useCanvasSize, useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { FRAGMENT_SHADER, VERTEX_SHADER } from './shaders'

/* @motif:defaults */
export const defaults = {
  colors: ['#66d37a', '#52d0d2', '#c978e2'],
  bands: 4,
  blur: 0.5,
  intensity: 1,
  noise: 0,
  speed: 1,
  direction: 'up',
}
/* @motif:end */

export type AuroraDirection = 'up' | 'down'

export type AuroraCurtainProps = Partial<typeof defaults> & {
  /** Freezes the animation on the current frame. */
  paused?: boolean
  /** Foreground content, always painted above the decorative curtain. */
  children?: ReactNode
  /** Extra classes for the positioned wrapper element. */
  className?: string
  style?: CSSProperties
}

type Rgb = [number, number, number]

type Uniform = 'uRes' | 'uTime' | 'uBands' | 'uSpeed' | 'uBlur' | 'uIntensity' | 'uDirection' | 'uGrain' | 'uSeed' | 'uPixel' | 'uColorCount' | 'uColors'
const UNIFORMS: Uniform[] = ['uRes', 'uTime', 'uBands', 'uSpeed', 'uBlur', 'uIntensity', 'uDirection', 'uGrain', 'uSeed', 'uPixel', 'uColorCount', 'uColors']

interface GLState {
  gl: WebGL2RenderingContext
  uniforms: Record<Uniform, WebGLUniformLocation | null>
  dispose: () => void
}

// 着色器很重（每条光带每像素 8 次值噪声），像素比上限压到 1.5。
const MAX_DPR = 1.5
const MAX_COLORS = 6
const MAX_BANDS = 8
const MIN_BANDS = 1
const GRAIN_SEED_CYCLE = 977
const RGB_MAX = 255

/**
 * sRGB conversions of the three oklch literals upstream uses by default, used
 * only when the document cannot be probed for computed colours.
 * oklch(0.78 0.16 148) · oklch(0.79 0.11 196) · oklch(0.70 0.17 318)
 */
const FALLBACK_COLORS: Rgb[] = [
  [0.399, 0.826, 0.48],
  [0.323, 0.817, 0.822],
  [0.79, 0.471, 0.886],
]

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

const toCssColor = (input: string) => (input.trim().startsWith('--') ? `var(${input.trim()})` : input.trim())

const resolveCssColors = (inputs: string[], host: HTMLElement): Rgb[] => {
  const probe = document.createElement('span')
  probe.style.display = 'none'
  host.append(probe)

  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const context = canvas.getContext('2d', { willReadFrequently: true })

  const resolved = inputs.map((input, index) => {
    const fallback = FALLBACK_COLORS[index % FALLBACK_COLORS.length]!
    if (!context) {
      return fallback
    }
    probe.style.color = ''
    probe.style.color = toCssColor(input)
    const computed = window.getComputedStyle(probe).color
    if (!computed) {
      return fallback
    }
    context.clearRect(0, 0, 1, 1)
    context.fillStyle = '#000000'
    context.fillStyle = computed
    context.fillRect(0, 0, 1, 1)
    const { data } = context.getImageData(0, 0, 1, 1)
    return [data[0]! / RGB_MAX, data[1]! / RGB_MAX, data[2]! / RGB_MAX] as Rgb
  })

  probe.remove()
  return resolved
}

/** 北极光：几条光带在一个 WebGL2 片元着色器里折叠、起伏、漂移，叠在内容后面；没有 WebGL2 时退回 CSS 渐变。 */
export function AuroraCurtain({ paused = false, children, className, style, ...props }: AuroraCurtainProps) {
  const options = { ...defaults, ...props }
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<GLState | null>(null)
  const lastTime = useRef(0)
  const grainSeed = useRef(0)
  const [isSupported, setIsSupported] = useState(true)
  const [resolvedColors, setResolvedColors] = useState<Rgb[]>(FALLBACK_COLORS)

  const colorKey = options.colors.join('|')

  // 参数每次渲染写进 ref，绘制时读取，改参数不重建 WebGL 上下文。
  const settings = {
    bands: clamp(Math.round(options.bands), MIN_BANDS, MAX_BANDS),
    blur: clamp(options.blur, 0, 1),
    colors: resolvedColors,
    direction: options.direction === 'down' ? 1 : 0,
    grain: clamp(options.noise, 0, 1),
    intensity: clamp(options.intensity, 0, 1),
  }
  const settingsRef = useRef(settings)
  settingsRef.current = settings
  const palette = useRef(new Float32Array(MAX_COLORS * 3))
  const pixelRatio = useRef(1)

  const draw = (time: number) => {
    const state = glRef.current
    const canvas = canvasRef.current
    if (!state || !canvas) return
    lastTime.current = time
    const { gl, uniforms } = state
    const s = settingsRef.current
    const colorCount = clamp(s.colors.length, 1, MAX_COLORS)
    for (let i = 0; i < colorCount; i++) {
      const rgb = s.colors[i] ?? FALLBACK_COLORS[0]!
      palette.current[i * 3] = rgb[0]
      palette.current[i * 3 + 1] = rgb[1]
      palette.current[i * 3 + 2] = rgb[2]
    }
    // A frame counter, not Math.random: deterministic, and it re-seeds the
    // grain hash so the pattern never freezes on screen.
    grainSeed.current = (grainSeed.current + 1) % GRAIN_SEED_CYCLE
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.uniform2f(uniforms.uRes, canvas.width, canvas.height)
    gl.uniform1f(uniforms.uTime, time)
    gl.uniform1f(uniforms.uBands, s.bands)
    // 速度由 useFrameLoop 乘进 time，着色器里的倍率固定为 1，调速时画面不会跳。
    gl.uniform1f(uniforms.uSpeed, 1)
    gl.uniform1f(uniforms.uBlur, s.blur)
    gl.uniform1f(uniforms.uIntensity, s.intensity)
    gl.uniform1f(uniforms.uDirection, s.direction)
    gl.uniform1f(uniforms.uGrain, s.grain)
    gl.uniform1f(uniforms.uSeed, grainSeed.current)
    gl.uniform1f(uniforms.uPixel, pixelRatio.current)
    gl.uniform1i(uniforms.uColorCount, colorCount)
    gl.uniform3fv(uniforms.uColors, palette.current)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
  const drawRef = useRef(draw)
  drawRef.current = draw

  // 尺寸变化时立刻重画一帧（暂停或静态模式下也不会出现拉伸的旧画面）。
  useCanvasSize(canvasRef, {
    maxDpr: MAX_DPR,
    onResize: ({ dpr }) => {
      pixelRatio.current = dpr
      drawRef.current(lastTime.current)
    },
  })

  useEffect(() => {
    const host = hostRef.current
    if (!host) {
      return
    }
    setResolvedColors(resolveCssColors(colorKey.split('|'), host))
  }, [colorKey])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let disposed = false

    const setup = () => {
      const gl = canvas.getContext('webgl2', { alpha: true, antialias: false, premultipliedAlpha: true })
      if (!gl) {
        setIsSupported(false)
        return
      }
      const program = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER)
      gl.useProgram(program)
      const releaseQuad = bindFullscreenQuad(gl, program, 'aPosition')
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
      const uniforms = Object.fromEntries(UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)])) as GLState['uniforms']
      glRef.current = {
        gl,
        uniforms,
        dispose: () => {
          releaseQuad()
          gl.deleteProgram(program)
        },
      }
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
        state.dispose()
        releaseContext(state.gl)
      }
    }
  }, [])

  // 参数或颜色变了而循环没在跑（暂停、减少动态效果、离屏）时也重画一帧。
  useEffect(() => {
    drawRef.current(lastTime.current)
  }, [settings.bands, settings.blur, settings.direction, settings.grain, settings.intensity, resolvedColors])

  useFrameLoop(
    hostRef,
    ({ time }) => {
      if (!paused) draw(time)
    },
    { speed: paused ? 0 : options.speed, reducedMotion: 'static', staticTime: 6 },
  )

  const fallbackBackground = options.colors
    .map((color, index) => {
      const x = 14 + index * (72 / Math.max(options.colors.length, 1))
      const y = options.direction === 'up' ? 108 : -8
      return `radial-gradient(58% 96% at ${x}% ${y}%, ${toCssColor(color)} 0%, transparent 68%)`
    })
    .join(', ')

  return (
    <div className={cn('relative isolate overflow-hidden', className)} ref={hostRef} style={style}>
      {isSupported ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <canvas className="block h-full w-full" ref={canvasRef} />
        </div>
      ) : (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-70 blur-2xl" style={{ backgroundImage: fallbackBackground }} />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
