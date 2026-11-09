import { bindFullscreenQuad, cn, createProgram, releaseContext, useCanvasSize, useFrameLoop } from '@/lib/motif-runtime'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { COMPOSITE_FRAGMENT, GEOMETRY_FRAGMENT, VERTEX_SHADER } from './shaders'

/* @motif:defaults */
export const defaults = {
  sunAngle: 24,
  sunHeight: 7,
  duneHeight: 1,
  rippleScale: 1,
  wind: 0.6,
  sandColor: '#e8a865',
  shadowColor: '#3f3a66',
  grain: 0.35,
}
/* @motif:end */

export type DuneFieldProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 沙丘振幅（世界单位，沙丘间距约为 1）。 */
const DUNE_AMPLITUDE = 0.16
/** 高度场上界（以振幅为单位），与着色器里的 TOP 一致。 */
const TOP = 1.75
/** 镜头比最高的沙脊再高出这么多。 */
const CAMERA_CLEARANCE = 0.36
/** 一道风纹的宽度（世界单位）。 */
const RIPPLE_SIZE = 0.024

type GeometryUniform = 'u_res' | 'u_sun' | 'u_camH' | 'u_dune' | 'u_pass'
type CompositeUniform =
  | 'u_res'
  | 'u_sun'
  | 'u_camH'
  | 'u_dune'
  | 'u_geoA'
  | 'u_geoB'
  | 'u_time'
  | 'u_wind'
  | 'u_rippleSize'
  | 'u_sand'
  | 'u_shade'
  | 'u_grain'
  | 'u_grainScale'
const GEOMETRY_UNIFORMS: GeometryUniform[] = ['u_res', 'u_sun', 'u_camH', 'u_dune', 'u_pass']
const COMPOSITE_UNIFORMS: CompositeUniform[] = [
  'u_res',
  'u_sun',
  'u_camH',
  'u_dune',
  'u_geoA',
  'u_geoB',
  'u_time',
  'u_wind',
  'u_rippleSize',
  'u_sand',
  'u_shade',
  'u_grain',
  'u_grainScale',
]

interface Target {
  texture: WebGLTexture
  framebuffer: WebGLFramebuffer
}

interface GLState {
  gl: WebGLRenderingContext
  geometry: { program: WebGLProgram; uniforms: Record<GeometryUniform, WebGLUniformLocation | null> }
  composite: { program: WebGLProgram; uniforms: Record<CompositeUniform, WebGLUniformLocation | null> }
  /** 两张地形缓存：A 是距离、阴影、相位；B 是法线。 */
  targets: [Target, Target]
  width: number
  height: number
  /** 缓存对应的参数；变了就重新步进地形。 */
  key: string
  dispose: () => void
}

function parseHex(hex: string): [number, number, number] {
  const value = hex.replace('#', '')
  const full = value.length === 3 ? value.replace(/./g, (c) => c + c) : value
  return [0, 1, 2].map((index) => parseInt(full.slice(index * 2, index * 2 + 2), 16) / 255 || 0) as [number, number, number]
}

function createTarget(gl: WebGLRenderingContext): Target {
  const texture = gl.createTexture()!
  const framebuffer = gl.createFramebuffer()!
  return { texture, framebuffer }
}

function sizeTarget(gl: WebGLRenderingContext, target: Target, width: number, height: number) {
  gl.bindTexture(gl.TEXTURE_2D, target.texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  // 缓存里是打包的数值，只能逐像素读，不能插值。
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
}

/**
 * 沙丘：低垂的太阳斜照一片被风塑形的沙丘，沙脊投下柔和的长影，近处的风纹顺风缓缓迁移。
 * 地形只在尺寸、太阳或沙丘高度变化时光线步进一次，之后每帧只给随风迁移的风纹着色。children 叠在画面之上。
 */
export function DuneField({ className, style, children, ...props }: DuneFieldProps) {
  const options = { ...defaults, ...props }
  const optionsRef = useRef(options)
  optionsRef.current = options

  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<GLState | null>(null)
  const lastTime = useRef(0)

  const draw = (time: number) => {
    const state = glRef.current
    const canvas = canvasRef.current
    if (!state || !canvas) return
    lastTime.current = time
    const { gl } = state
    const o = optionsRef.current
    const width = canvas.width
    const height = canvas.height

    const azimuth = (o.sunAngle * Math.PI) / 180
    const elevation = (o.sunHeight * Math.PI) / 180
    const sun: [number, number, number] = [Math.sin(azimuth) * Math.cos(elevation), Math.sin(elevation), Math.cos(azimuth) * Math.cos(elevation)]
    const dune = DUNE_AMPLITUDE * o.duneHeight
    const camH = dune * TOP + CAMERA_CLEARANCE

    if (state.width !== width || state.height !== height) {
      for (const target of state.targets) sizeTarget(gl, target, width, height)
      state.width = width
      state.height = height
      state.key = ''
    }

    const key = [o.sunAngle, o.sunHeight, o.duneHeight].join('|')
    if (state.key !== key) {
      const { program, uniforms } = state.geometry
      gl.useProgram(program)
      gl.viewport(0, 0, width, height)
      gl.uniform2f(uniforms.u_res, width, height)
      gl.uniform3f(uniforms.u_sun, ...sun)
      gl.uniform1f(uniforms.u_camH, camH)
      gl.uniform1f(uniforms.u_dune, dune)
      state.targets.forEach((target, pass) => {
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer)
        gl.uniform1f(uniforms.u_pass, pass)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      })
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      state.key = key
    }

    const { program, uniforms } = state.composite
    gl.useProgram(program)
    gl.viewport(0, 0, width, height)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, state.targets[0].texture)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, state.targets[1].texture)
    gl.uniform1i(uniforms.u_geoA, 0)
    gl.uniform1i(uniforms.u_geoB, 1)
    gl.uniform2f(uniforms.u_res, width, height)
    gl.uniform3f(uniforms.u_sun, ...sun)
    gl.uniform1f(uniforms.u_camH, camH)
    gl.uniform1f(uniforms.u_dune, dune)
    gl.uniform1f(uniforms.u_time, time)
    gl.uniform1f(uniforms.u_wind, o.wind)
    gl.uniform1f(uniforms.u_rippleSize, RIPPLE_SIZE * o.rippleScale)
    gl.uniform3f(uniforms.u_sand, ...parseHex(o.sandColor))
    gl.uniform3f(uniforms.u_shade, ...parseHex(o.shadowColor))
    gl.uniform1f(uniforms.u_grain, o.grain)
    // 颗粒按 CSS 像素算，高分屏上不会变得过细。
    gl.uniform1f(uniforms.u_grainScale, Math.max(1, width / Math.max(1, canvas.clientWidth)))
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
  const drawRef = useRef(draw)
  drawRef.current = draw

  // 尺寸变化时立刻重画一帧（暂停或静态模式下也不会出现拉伸的旧画面）。
  useCanvasSize(canvasRef, { maxDpr: 1.5, maxPixels: 1920 * 1200, onResize: () => drawRef.current(lastTime.current) })

  useEffect(() => {
    const canvas = canvasRef.current!
    let disposed = false

    const setup = () => {
      const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' })
      if (!gl) return
      const geometryProgram = createProgram(gl, VERTEX_SHADER, GEOMETRY_FRAGMENT)
      const compositeProgram = createProgram(gl, VERTEX_SHADER, COMPOSITE_FRAGMENT)
      // 两个程序各绑一份四边形：顶点属性的位置即使不同，也各自指向自己的缓冲。
      const releaseGeometryQuad = bindFullscreenQuad(gl, geometryProgram)
      const releaseCompositeQuad = bindFullscreenQuad(gl, compositeProgram)
      const targets: [Target, Target] = [createTarget(gl), createTarget(gl)]
      glRef.current = {
        gl,
        geometry: {
          program: geometryProgram,
          uniforms: Object.fromEntries(GEOMETRY_UNIFORMS.map((name) => [name, gl.getUniformLocation(geometryProgram, name)])) as GLState['geometry']['uniforms'],
        },
        composite: {
          program: compositeProgram,
          uniforms: Object.fromEntries(COMPOSITE_UNIFORMS.map((name) => [name, gl.getUniformLocation(compositeProgram, name)])) as GLState['composite']['uniforms'],
        },
        targets,
        width: 0,
        height: 0,
        key: '',
        dispose: () => {
          releaseGeometryQuad()
          releaseCompositeQuad()
          for (const target of targets) {
            gl.deleteFramebuffer(target.framebuffer)
            gl.deleteTexture(target.texture)
          }
          gl.deleteProgram(geometryProgram)
          gl.deleteProgram(compositeProgram)
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

  useFrameLoop(hostRef, ({ time }) => draw(time), { reducedMotion: 'static', staticTime: 2 })

  return (
    <div ref={hostRef} className={cn('relative isolate overflow-hidden', className)} style={{ background: options.shadowColor, ...style }}>
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 -z-10 block h-full w-full" />
      {children}
    </div>
  )
}
