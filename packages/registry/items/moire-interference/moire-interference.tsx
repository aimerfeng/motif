import { bindFullscreenQuad, cn, createProgram, releaseContext, useCanvasSize, useFrameLoop, usePrefersReducedMotion } from '@motif/runtime'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { FRAGMENT_SHADER, VERTEX_SHADER } from './shaders'

/* @motif:defaults */
export const defaults = {
  pattern: 'rings',
  layers: 2,
  frequency: 11,
  rotation: 3,
  lineWidth: 0.36,
  drift: 0.6,
  pointerShift: 0.5,
  ink: '#16130f',
  paper: '#ede6da',
}
/* @motif:end */

export type MoireInterferenceProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

type Pattern = 'lines' | 'rings' | 'dots'
const PATTERN_INDEX: Record<Pattern, number> = { lines: 0, rings: 1, dots: 2 }

const DEG = Math.PI / 180
const SQRT3 = Math.sqrt(3)
const TAU = Math.PI * 2
/** 直线的基准方向：略微偏离竖直，整组光栅再随时间极慢地转。 */
const BASE_ANGLE = 0.22
/** 整组光栅的公转速度（弧度/秒，乘以 drift）。 */
const SPIN = 0.014
/** 同心圆模式里，rotation 每 1 个单位对应的圆心间距（以周期计）。 */
const RING_SPACING_PER_DEG = 2.6
/** 指针最多把顶层推开多少个周期：推开几个周期，条纹就扫过几道。 */
const SHIFT_PERIODS = { lines: 2.4, rings: 3, dots: 1.6 } as const
/** 指针横向移动时顶层额外转过的最大角度（直线、点阵）。 */
const SHIFT_TWIST = 1.4 * DEG
/** 指针跟随的缓动速率（1/秒）：60 Hz 下约每帧 6%，按真实时间算，和刷新率无关。 */
const POINTER_EASE = 4
/**
 * 指针带动条纹扫过的最快速度（周期/秒，在画面最远处计）。摩尔纹把位移放大成大片明暗交替，
 * 不封顶的话甩一下指针就是每秒好几次全屏闪烁（WCAG 2.3.1 的上限是 3 次/秒），还要给漂移留余量。
 */
const MAX_POINTER_RATE = 1.2
/** 层间夹角（或圆心距）呼吸时，画面最远处的条纹相位最多摆动多少个周期：限制自动漂移扫过的速度。 */
const MAX_BREATH_PERIODS = 2
/** 顶层的“透镜”鼓起量：让直的条纹弯成弧，并随时间呼吸。 */
const BULGE = 0.035
/** 透镜呼吸在画面最远处最多让相位摆动多少个周期。 */
const MAX_BULGE_PERIODS = 1
/** 浅墨深纸时线宽打的折扣：亮线在暗底上显得更粗，同样的比例会把画面糊成一片墨色。 */
const LIGHT_INK_THINNING = 0.3
/** 直线模式顶层的低频扭曲幅度（周期）：相位每偏一个周期，条纹就整整挪一道，所以一点点就能让条纹起伏。 */
const WARP = 1.1
/** 墨色和纸色至少要有的对比度；太接近时把墨推向黑或白，条纹不会消失。 */
const MIN_CONTRAST = 3

type Uniform =
  | 'u_res'
  | 'u_dpr'
  | 'u_pattern'
  | 'u_layers'
  | 'u_freq'
  | 'u_width'
  | 'u_xf'
  | 'u_off'
  | 'u_bulge'
  | 'u_shift'
  | 'u_warp'
  | 'u_ink'
  | 'u_paper'
const UNIFORMS: Uniform[] = ['u_res', 'u_dpr', 'u_pattern', 'u_layers', 'u_freq', 'u_width', 'u_xf', 'u_off', 'u_bulge', 'u_shift', 'u_warp', 'u_ink', 'u_paper']

interface GLState {
  gl: WebGLRenderingContext
  uniforms: Record<Uniform, WebGLUniformLocation | null>
  dispose: () => void
}

type RGB = [number, number, number]

function parseHex(hex: string): RGB {
  const value = hex.replace('#', '')
  const full = value.length === 3 ? value.replace(/./g, (c) => c + c) : value
  return [0, 1, 2].map((index) => parseInt(full.slice(index * 2, index * 2 + 2), 16) / 255 || 0) as RGB
}

function luminance([r, g, b]: RGB): number {
  const linear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
}

function contrast(a: RGB, b: RGB): number {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** 墨色太接近纸色时，沿着远离纸色的方向（亮纸推向黑，暗纸推向白）一点点加深，直到条纹看得清。 */
function separateInk(ink: RGB, paper: RGB): RGB {
  if (contrast(ink, paper) >= MIN_CONTRAST) return ink
  const target: RGB = luminance(paper) > 0.18 ? [0, 0, 0] : [1, 1, 1]
  for (let step = 1; step <= 20; step++) {
    const t = step / 20
    const mixed = ink.map((c, index) => c + (target[index] - c) * t) as RGB
    if (contrast(mixed, paper) >= MIN_CONTRAST) return mixed
  }
  return target
}

const wrap = (value: number, period: number) => value - Math.floor(value / period) * period

/**
 * 摩尔纹干涉：两三层精细的直线、同心圆或六角点阵光栅叠在一起，彼此错开一点角度并缓慢漂移，
 * 叠出大片流动的欧普艺术条纹。指针会推动最上面一层，条纹被放大成大幅度的扫动。children 叠在画面之上。
 */
export function MoireInterference({ className, style, children, ...props }: MoireInterferenceProps) {
  const options = { ...defaults, ...props }
  const optionsRef = useRef(options)
  optionsRef.current = options

  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<GLState | null>(null)
  const pointer = useRef({ targetX: 0, targetY: 0, x: 0, y: 0 })
  const lastTime = useRef(0)
  const lastNow = useRef<number | null>(null)
  const reduced = usePrefersReducedMotion()

  const draw = (time: number) => {
    const state = glRef.current
    const canvas = canvasRef.current
    if (!state || !canvas) return
    lastTime.current = time
    // 指针按真实时间缓动：time 被 drift 缩放过，drift 为 0 时指针也要能推动顶层。
    const now = performance.now()
    const dt = lastNow.current === null ? 0 : Math.min(Math.max((now - lastNow.current) / 1000, 0), 0.1)
    lastNow.current = now

    const { gl, uniforms } = state
    const o = optionsRef.current
    const pattern: Pattern = o.pattern === 'rings' || o.pattern === 'dots' ? o.pattern : 'lines'
    const layers = Math.min(3, Math.max(2, Math.round(o.layers)))
    const freq = o.frequency / 100
    const dpr = canvas.width / Math.max(1, canvas.clientWidth)
    const halfDiagonal = Math.max(1, 0.5 * Math.hypot(canvas.clientWidth, canvas.clientHeight))
    const paper = parseHex(o.paper)
    const ink = separateInk(parseHex(o.ink), paper)

    // 指针每移动一个单位（中心到边缘），画面最远处的条纹相位走多少个周期：平移加上横向的扭转。
    const shiftPeriods = SHIFT_PERIODS[pattern] * o.pointerShift
    const twistPeriods = pattern === 'rings' ? 0 : halfDiagonal * freq * SHIFT_TWIST * o.pointerShift
    const p = pointer.current
    if (reduced) {
      p.x = 0
      p.y = 0
    } else {
      const ease = 1 - Math.exp(-POINTER_EASE * dt)
      let dx = (p.targetX - p.x) * ease
      let dy = (p.targetY - p.y) * ease
      const sweep = Math.hypot(dx * (shiftPeriods + twistPeriods), dy * shiftPeriods)
      const limit = MAX_POINTER_RATE * dt
      if (sweep > limit) {
        dx *= limit / sweep
        dy *= limit / sweep
      }
      p.x += dx
      p.y += dy
    }

    // 浅墨深纸时线宽打折；三层时每层再变细，叠起来的总墨量和两层时差不多，画面不会被墨糊满。
    const lift = Math.min(1, Math.max(0, (luminance(ink) - luminance(paper)) / 0.25))
    const inkShare = o.lineWidth * (1 - LIGHT_INK_THINNING * lift * lift * (3 - 2 * lift))
    const width = 1 - (1 - inkShare) ** (2 / layers)
    // rotation 是最外两层的夹角：三层时相邻两层各占一半，外侧那对不会转成没有条纹的斜纹。
    // 夹角缓慢呼吸，条纹随之变疏变密；幅度按画面最远处的相位摆动封顶，大画面上也不会扫得太快。
    const outerAngle = Math.max(1e-3, o.rotation * DEG)
    const angleBreath = Math.min(0.3, MAX_BREATH_PERIODS / (halfDiagonal * freq * outerAngle))
    const spread = (outerAngle / (layers - 1)) * (1 + angleBreath * Math.sin(time * 0.37))
    const ringPeriods = Math.max(1e-3, o.rotation * RING_SPACING_PER_DEG)
    const ringBreath = Math.min(0.28, MAX_BREATH_PERIODS / ringPeriods)
    const bulgeBreath = Math.min(0.5, MAX_BULGE_PERIODS / (halfDiagonal * freq * BULGE))
    const spin = BASE_ANGLE + time * SPIN
    const mid = (layers - 1) / 2

    const xf = new Float32Array(12)
    const off = new Float32Array(6)
    const bulge = new Float32Array(3)
    for (let i = 0; i < layers; i++) {
      const k = i - mid
      const top = i === layers - 1
      const twist = top && pattern !== 'rings' ? p.x * o.pointerShift * SHIFT_TWIST : 0
      const angle = spin + k * spread + twist
      // 各层周期差一点点，并且慢慢变化：两层平行时也会出现呼吸的条纹。
      const scale = 1 + k * 0.006 * Math.sin(time * 0.23 + 1.3)
      const c = Math.cos(angle) * scale
      const s = Math.sin(angle) * scale
      xf.set([c, s, -s, c], i * 4)

      if (pattern === 'rings') {
        // 圆心绕画面中心排开，间距随 rotation 变化并缓慢呼吸；整组慢慢转。
        const spacing = (ringPeriods * (1 + ringBreath * Math.sin(time * 0.37))) / freq
        const radius = layers === 2 ? spacing / 2 : spacing / SQRT3
        const theta = spin + (i * 2 * Math.PI) / layers
        off.set([Math.cos(theta) * radius, Math.sin(theta) * radius], i * 2)
      } else if (pattern === 'lines') {
        off.set([wrap(k * time * 0.12, 1), 0], i * 2)
      } else {
        off.set([wrap(k * time * 0.09, 1), wrap(k * time * 0.05, SQRT3)], i * 2)
      }
      bulge[i] = top && pattern !== 'rings' ? BULGE * (1 + bulgeBreath * Math.sin(time * 0.19)) : 0
    }

    const reach = shiftPeriods / freq

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(uniforms.u_res, canvas.width, canvas.height)
    gl.uniform1f(uniforms.u_dpr, dpr)
    gl.uniform1f(uniforms.u_pattern, PATTERN_INDEX[pattern])
    gl.uniform1f(uniforms.u_layers, layers)
    gl.uniform1f(uniforms.u_freq, freq)
    gl.uniform1f(uniforms.u_width, width)
    gl.uniform4fv(uniforms.u_xf, xf)
    gl.uniform2fv(uniforms.u_off, off)
    gl.uniform1fv(uniforms.u_bulge, bulge)
    gl.uniform2f(uniforms.u_shift, p.x * reach, p.y * reach)
    gl.uniform3f(uniforms.u_warp, pattern === 'lines' ? WARP : 0, wrap(time * 0.31, TAU), wrap(2.1 - time * 0.23, TAU))
    gl.uniform3f(uniforms.u_ink, ...ink)
    gl.uniform3f(uniforms.u_paper, ...paper)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
  const drawRef = useRef(draw)
  drawRef.current = draw

  // 尺寸或参数变化时立刻重画一帧：减少动态效果、暂停或离屏时帧循环不跑，画布上不能留着旧画面。
  useCanvasSize(canvasRef, { maxDpr: 2, onResize: () => drawRef.current(lastTime.current) })
  const signature = JSON.stringify(options)
  useEffect(() => {
    drawRef.current(lastTime.current)
  }, [signature, reduced])

  useEffect(() => {
    const canvas = canvasRef.current!
    const host = hostRef.current!
    let disposed = false

    const setup = () => {
      const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' })
      if (!gl) return
      const program = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER)
      gl.useProgram(program)
      const releaseQuad = bindFullscreenQuad(gl, program)
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
    const onPointer = (event: PointerEvent) => {
      const bounds = host.getBoundingClientRect()
      pointer.current.targetX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / Math.max(1, bounds.width)) * 2 - 1))
      pointer.current.targetY = Math.max(-1, Math.min(1, -(((event.clientY - bounds.top) / Math.max(1, bounds.height)) * 2 - 1)))
    }
    const onLeave = () => {
      pointer.current.targetX = 0
      pointer.current.targetY = 0
    }

    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)
    host.addEventListener('pointermove', onPointer, { passive: true })
    host.addEventListener('pointerleave', onLeave)
    setup()

    return () => {
      disposed = true
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      host.removeEventListener('pointermove', onPointer)
      host.removeEventListener('pointerleave', onLeave)
      const state = glRef.current
      glRef.current = null
      if (state) {
        state.dispose()
        releaseContext(state.gl)
      }
    }
  }, [])

  useFrameLoop(hostRef, ({ time }) => draw(time), { speed: options.drift, reducedMotion: 'static', staticTime: 3 })

  return (
    <div ref={hostRef} className={cn('relative isolate overflow-hidden', className)} style={{ background: options.paper, ...style }}>
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 -z-10 block h-full w-full" />
      {children}
    </div>
  )
}
