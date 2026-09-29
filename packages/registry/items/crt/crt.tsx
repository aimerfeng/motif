// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Meng To
// Source: https://github.com/MengTo/threeui/blob/68802d5/src/shaders/crt/crtRenderer.ts
// Modified by Motif; see the item's provenance.
import { bindFullscreenQuad, cn, createProgram, releaseContext, useCanvasSize, useFrameLoop, usePrefersReducedMotion } from '@motif/runtime'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { CRT_FRAGMENT_SHADER, CRT_VERTEX_SHADER } from './shaders'
import { CRT_SCREENS, CRT_STYLES, type CrtStyle, type CrtVariant } from './screens'

/* @motif:defaults */
export const defaults = {
  variant: 'terminal',
  speed: 1,
  typeSpeed: 1,
  motion: 1,
  brightness: 1,
  saturation: 1,
  hue: 0,
}
/* @motif:end */

export type CrtProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

type Segment = { t: string; c: 'p' | 'd' | 'a' | 'h' }
const segment = (text: string, color: Segment['c'] = 'p'): Segment => ({ t: text, c: color })
const dots = (count: number) => '·'.repeat(count)

// 终端画面上的启动日志。
const LOG: Segment[][] = [
  [segment('NODE-7 MAINFRAME  v9.1.1'), segment('   (c) 2199 Orbital Works', 'd')],
  [segment('SIGNAL Broadcast  Rev M  S/N NX-0101-0011', 'd')],
  [],
  [segment('Probing grid nodes '), segment(`${dots(14)} `, 'd'), segment('OK', 'a')],
  [segment('Neural link  0x000-0x0FF '), segment(`${dots(11)} `, 'd'), segment('ONLINE '), segment('OK', 'a')],
  [segment('Pinging peer signatures '), segment(`${dots(6)} `, 'd'), segment('3 found')],
  [segment('nav0  OPERATOR UPLINK SECURE ', 'd'), segment(`${dots(6)} `, 'd'), segment('READY', 'a')],
  [segment('vis0  SIGNAL DECRYPT 256bit ', 'd'), segment('READY', 'a')],
  [segment('net0  HARDLINE CONNECTION MAX ', 'd'), segment(`${dots(4)} `, 'd'), segment('LINK', 'a')],
  [segment('ext0  DATA EXTRACTION ', 'd'), segment(`${dots(4)} `, 'd'), segment('READY', 'a')],
  [segment('Mounting /dev/mind -> ROOT: '), segment(`${dots(6)} `, 'd'), segment('OK', 'a')],
  [segment('Loading calibration program '), segment(`${dots(4)} `, 'd'), segment('OK', 'a')],
  [segment('Starting [ cpu mem net io ] '), segment(`${dots(4)} `, 'd'), segment('OK', 'a')],
  [segment('Locating the archive sector '), segment(`${dots(6)} `, 'd'), segment('99.9%')],
  [],
  [segment('SYSTEM ANOMALY  '), segment('detected.', 'h')],
  [segment('operator unit-07   status idle ', 'd'), segment('z', 'd'), segment('Z', 'd')],
  [],
  [segment('awaiting input: ')],
]
const COLORS = {
  p: { fill: '#8df0b4', glow: 'rgba(28,236,132,0.95)' },
  d: { fill: '#4f9a76', glow: 'rgba(28,236,132,0.45)' },
  a: { fill: '#ffba5e', glow: 'rgba(255,150,52,0.95)' },
  h: { fill: '#eafff3', glow: 'rgba(120,255,190,0.95)' },
}
const lineLength = (line: Segment[]) => line.reduce((total, item) => total + item.t.length, 0)
const TOTAL = LOG.reduce((total, line) => total + lineLength(line), 0)
const MAX_CHARS = Math.max(...LOG.map(lineLength))
const TYPE_RATE = 60 // 字符/秒（typeSpeed = 1）
const HOLD_SECONDS = 6
const STATIC_TIME = 3
const MONO = 'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace'

type Uniform =
  | 'uTex' | 'uRes' | 'uTime' | 'uMotion' | 'uCurve' | 'uScan' | 'uScanDepth' | 'uTriad' | 'uGrille' | 'uChroma' | 'uBar'
  | 'uFlicker' | 'uGrain' | 'uNoise' | 'uVignette' | 'uMono' | 'uGain' | 'uHalo' | 'uSheen' | 'uRoom'
const UNIFORMS: Uniform[] = [
  'uTex', 'uRes', 'uTime', 'uMotion', 'uCurve', 'uScan', 'uScanDepth', 'uTriad', 'uGrille', 'uChroma', 'uBar',
  'uFlicker', 'uGrain', 'uNoise', 'uVignette', 'uMono', 'uGain', 'uHalo', 'uSheen', 'uRoom',
]

interface Renderer {
  resize: () => void
  render: (time: number, delta: number, frozen: boolean) => void
  dispose: () => void
  gl: WebGLRenderingContext
}

/** 一块弧面 CRT：先在 2D 画布上画出屏幕内容，再由 WebGL 加曲面、扫描线、荧光点阵和信号噪声。 */
function createRenderer(canvas: HTMLCanvasElement, getOptions: () => { variant: string; motion: number; typeSpeed: number }): Renderer | null {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, premultipliedAlpha: false })
  const textCanvas = document.createElement('canvas')
  const text = textCanvas.getContext('2d')
  if (!gl || !text) return null

  const program = createProgram(gl, CRT_VERTEX_SHADER, CRT_FRAGMENT_SHADER)
  gl.useProgram(program)
  const releaseQuad = bindFullscreenQuad(gl, program, 'aPos')
  const u = Object.fromEntries(UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)])) as Record<Uniform, WebGLUniformLocation | null>
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.uniform1i(u.uTex, 0)

  let width = 1
  let height = 1
  let fontSize = 14
  let lineHeight = 20
  let startY = 0
  let charWidth = 8
  let caretX = 0
  let caretY = 0
  let typed = 0
  let done = false
  let hold = 0
  let textDirty = true
  let lastTextAt = -1e9
  let lastReveal = -1
  let lastBlink = -1
  let variant: CrtVariant = 'terminal'
  let style: CrtStyle = CRT_STYLES.terminal

  const applyStyle = () => {
    gl.useProgram(program)
    gl.uniform2f(u.uCurve, style.curve[0], style.curve[1])
    gl.uniform1f(u.uScanDepth, style.scanDepth)
    gl.uniform1f(u.uGrille, style.grille)
    gl.uniform1f(u.uChroma, style.chroma)
    gl.uniform1f(u.uBar, style.bar)
    gl.uniform1f(u.uFlicker, style.flicker)
    gl.uniform1f(u.uGrain, style.grain)
    gl.uniform1f(u.uNoise, style.noise)
    gl.uniform1f(u.uVignette, style.vignette)
    gl.uniform1f(u.uMono, style.mono)
    gl.uniform1f(u.uGain, style.gain)
    gl.uniform1f(u.uHalo, style.halo)
    gl.uniform3f(u.uSheen, style.sheen[0], style.sheen[1], style.sheen[2])
    gl.uniform3f(u.uRoom, style.room[0], style.room[1], style.room[2])
    const filter = style.filtering === 'nearest' ? gl.NEAREST : gl.LINEAR
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
  }

  const layout = () => {
    startY = height * 0.135
    lineHeight = (height * 0.74) / LOG.length
    fontSize = Math.max(5, Math.min(lineHeight * 0.8, (width * 0.88) / (Math.max(MAX_CHARS, 1) * 0.62)))
    text.font = `600 ${fontSize.toFixed(2)}px ${MONO}`
    charWidth = text.measureText('M').width || fontSize * 0.6
  }

  const setStyle = (key: Segment['c'], glow: boolean) => {
    const color = COLORS[key]
    text.fillStyle = color.fill
    text.shadowColor = glow ? color.glow : 'transparent'
    text.shadowBlur = glow ? fontSize * 0.38 : 0
  }

  /** 每个字形画两遍：先带阴影得到荧光晕，再关掉阴影补一遍，让笔画核心保持清晰。 */
  const drawScreen = (reveal: number) => {
    text.setTransform(1, 0, 0, 1, 0, 0)
    text.fillStyle = '#03100a'
    text.fillRect(0, 0, width, height)
    text.textAlign = 'left'
    text.textBaseline = 'top'
    text.font = `600 ${fontSize.toFixed(2)}px ${MONO}`
    let remaining = reveal
    let y = startY
    const left = Math.floor((width - MAX_CHARS * charWidth) / 2)
    caretX = left
    caretY = startY
    for (const line of LOG) {
      const length = lineLength(line)
      const visible = reveal === Infinity ? Infinity : Math.min(remaining, length)
      let x = left
      let drawn = 0
      for (const item of line) {
        let value = item.t
        if (visible !== Infinity) {
          const rest = visible - drawn
          if (rest <= 0) break
          if (rest < value.length) value = value.slice(0, rest)
        }
        if (value.length) {
          setStyle(item.c, true)
          text.fillText(value, x, y)
          setStyle(item.c, false)
          text.fillText(value, x, y)
          x += charWidth * value.length
        }
        drawn += item.t.length
        if (visible !== Infinity && drawn >= visible) break
      }
      caretX = x
      caretY = y
      if (visible !== Infinity) remaining -= visible
      y += lineHeight
      if (visible !== Infinity && remaining <= 0) break
    }
  }

  const drawCursor = () => {
    text.shadowColor = COLORS.p.glow
    text.shadowBlur = fontSize * 0.42
    text.fillStyle = '#bdf8d2'
    text.fillRect(caretX, caretY + fontSize * 0.06, Math.max(charWidth * 0.92, 4), fontSize * 0.96)
    text.shadowBlur = 0
    text.fillRect(caretX, caretY + fontSize * 0.06, Math.max(charWidth * 0.92, 4), fontSize * 0.96)
  }

  const uploadTexture = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
    textDirty = false
  }

  const resize = () => {
    const bufferWidth = canvas.width
    const bufferHeight = canvas.height
    const cssWidth = Math.max(1, canvas.clientWidth)
    const cssHeight = Math.max(1, canvas.clientHeight)
    const surface = style.surface
    const screenWidth = surface.mode === 'fixed' ? surface.width : surface.mode === 'cap' ? Math.min(bufferWidth, surface.width) : bufferWidth
    const screenHeight = surface.mode === 'fixed' ? surface.height : Math.max(1, Math.round((screenWidth * bufferHeight) / bufferWidth))
    if (textCanvas.width !== screenWidth || textCanvas.height !== screenHeight) {
      textCanvas.width = screenWidth
      textCanvas.height = screenHeight
      width = screenWidth
      height = screenHeight
      layout()
      lastReveal = -1
      lastBlink = -1
      lastTextAt = -1e9
      textDirty = true
    }
    gl.useProgram(program)
    gl.viewport(0, 0, bufferWidth, bufferHeight)
    gl.uniform2f(u.uRes, bufferWidth, bufferHeight)
    gl.uniform1f(u.uScan, Math.max(120, Math.min(cssHeight * style.scanDensity, 900)))
    gl.uniform1f(u.uTriad, Math.max(2, (style.triadCss * bufferWidth) / cssWidth))
  }

  applyStyle()

  return {
    gl,
    resize,
    render(time, delta, frozen) {
      const options = getOptions()
      const requested = (options.variant in CRT_STYLES ? options.variant : 'terminal') as CrtVariant
      if (requested !== variant) {
        variant = requested
        style = CRT_STYLES[variant]
        applyStyle()
        typed = 0
        done = false
        hold = 0
        lastReveal = -1
        lastBlink = -1
        lastTextAt = -1e9
        textDirty = true
        resize()
      }
      if (variant === 'terminal') {
        // 打字 → 停留 → 重来，循环播放；减少动态效果时直接显示完整日志。
        if (frozen) {
          typed = TOTAL
          done = true
        } else if (!done) {
          typed += delta * TYPE_RATE * options.typeSpeed
          if (typed >= TOTAL) {
            typed = TOTAL
            done = true
            hold = HOLD_SECONDS
          }
        } else if ((hold -= delta) <= 0) {
          typed = 0
          done = false
        }
        const reveal = done ? Infinity : Math.floor(typed)
        const blink = Math.floor(time / 0.42) % 2 === 0 ? 1 : 0
        if (reveal !== lastReveal || blink !== lastBlink) {
          drawScreen(reveal)
          if (blink) drawCursor()
          lastReveal = reveal
          lastBlink = blink
          textDirty = true
        }
      } else if (time - lastTextAt >= style.redrawMs / 1000 || textDirty || time < lastTextAt) {
        CRT_SCREENS[variant](text, width, height, time)
        lastTextAt = time
        textDirty = true
      }
      if (textDirty) uploadTexture()
      gl.useProgram(program)
      gl.uniform1f(u.uTime, time)
      gl.uniform1f(u.uMotion, options.motion)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    },
    dispose() {
      releaseQuad()
      gl.deleteTexture(texture)
      gl.deleteProgram(program)
    },
  }
}

/** 弧面 CRT 显示器：终端启动日志、电影倒计时片头、信号故障蓝屏、8 位街机标题画面。 */
export function Crt({ className, style, children, ...props }: CrtProps) {
  const options = { ...defaults, ...props }
  const optionsRef = useRef(options)
  optionsRef.current = options
  const reduced = usePrefersReducedMotion()
  const reducedRef = useRef(reduced)
  reducedRef.current = reduced

  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<Renderer | null>(null)
  const lastTime = useRef(STATIC_TIME)

  const renderOnce = (time: number, delta: number) => {
    lastTime.current = time
    rendererRef.current?.render(time, delta, reducedRef.current)
  }
  const renderRef = useRef(renderOnce)
  renderRef.current = renderOnce

  useCanvasSize(canvasRef, {
    maxDpr: 1.5,
    maxPixels: 2_400_000,
    onResize: () => {
      rendererRef.current?.resize()
      renderRef.current(lastTime.current, 0)
    },
  })

  // 参数变化时立刻重画（暂停或静态模式下也能看到）。
  const signature = `${options.variant}|${options.motion}`
  useEffect(() => {
    renderRef.current(lastTime.current, 0)
  }, [signature])

  useEffect(() => {
    const canvas = canvasRef.current!
    let disposed = false

    const setup = () => {
      const renderer = createRenderer(canvas, () => optionsRef.current)
      if (!renderer) return
      rendererRef.current = renderer
      renderer.resize()
      renderRef.current(lastTime.current, 0)
    }
    const onLost = (event: Event) => {
      event.preventDefault()
      rendererRef.current = null
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
      const renderer = rendererRef.current
      rendererRef.current = null
      if (renderer) {
        renderer.dispose()
        releaseContext(renderer.gl)
      }
    }
  }, [])

  useFrameLoop(hostRef, ({ time, delta }) => renderOnce(time, delta), { speed: options.speed, reducedMotion: 'static', staticTime: STATIC_TIME })

  const filter = options.hue === 0 && options.saturation === 1 && options.brightness === 1 ? undefined : `hue-rotate(${options.hue}deg) saturate(${options.saturation}) brightness(${options.brightness})`
  return (
    <div ref={hostRef} className={cn('relative isolate overflow-hidden', className)} style={{ background: (CRT_STYLES as Record<string, CrtStyle | undefined>)[options.variant]?.background ?? '#03100a', filter, ...style }}>
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 -z-10 block h-full w-full" />
      {children}
    </div>
  )
}
