import { bindFullscreenQuad, cn, createProgram, releaseContext, useCanvasSize, useFrameLoop, usePrefersReducedMotion } from '@motif/runtime'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { CENSUS, CENSUS_SHADER, RENDER_SHADER, STEP_SHADER, VERTEX_SHADER } from './shaders'

/* @motif:defaults */
export const defaults = {
  rule: 'life',
  generationsPerSecond: 12,
  activity: 45,
  cellSize: 7,
  trailDecay: 1.4,
  aliveColor: '#dff4ff',
  trailColor: '#3168f5',
  background: '#05070d',
  brush: 3,
}
/* @motif:end */

export type LifeAutomatonProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

interface Rule {
  birth: number
  survive: number
  states: number
  /** 开局细胞汤的平均密度。 */
  seed: number
  /** 火花（自动撒下的细胞团）和画笔的密度。 */
  spark: number
  brush: number
  /**
   * 双稳态规则（昼夜）会一直粗化，直到一种相位吞掉另一种，画面要么整屏点亮、要么只剩空白。
   * 设了这个值，火花就改成两种相位的大团（岛屿和湖泊，覆盖原有的格子），
   * 按普查读回的活细胞占比决定撒哪一种、撒多快，把占比稳在这个值附近。
   */
  balance?: number
}

const bits = (...counts: number[]) => counts.reduce((mask, count) => mask | (1 << count), 0)

const RULES: Record<string, Rule> = {
  life: { birth: bits(3), survive: bits(2, 3), states: 2, seed: 0.32, spark: 0.42, brush: 0.45 },
  highlife: { birth: bits(3, 6), survive: bits(2, 3), states: 2, seed: 0.32, spark: 0.42, brush: 0.45 },
  daynight: { birth: bits(3, 6, 7, 8), survive: bits(3, 4, 6, 7, 8), states: 2, seed: 0.42, spark: 0.72, brush: 0.62, balance: 0.37 },
  brain: { birth: bits(2), survive: 0, states: 3, seed: 0.24, spark: 0.3, brush: 0.32 },
}

/** 新开一局（或网格变大）先在后台跑这么多代：第一帧就是长好的图案，而不是一片噪点。 */
const WARMUP = 120
/** 火花的频率按网格面积算，小屏幕也不低于这么多格子的份。 */
const MIN_CELLS = 9000
/** 活跃度为 100% 时，每代每这么多格子落下一团火花（生命游戏一类）。 */
const SPARK_CELLS = 44000
/** 昼夜规则：每代每这么多格子落下的岛屿或湖泊，再乘活跃度和偏离程度。 */
const ISLAND_CELLS = 9000
/** 活跃度从诞生时的满格降到 0 要几秒：一直不动的静物会暗下去。 */
const FLASH_SECONDS = 2.2
/** 一帧最多推进几代（帧率很低时不追帧）。 */
const MAX_STEPS = 4
const MAX_STAMPS = 24
/** 每隔这么多代普查一次活细胞占比（只有设了 balance 的规则需要）。 */
const CENSUS_EVERY = 6
/** 指针一次移动最多补几团；跳得比这更远就当成新的一笔。 */
const STROKE_STEPS = 8

type StepUniform =
  | 'u_state'
  | 'u_grid'
  | 'u_birth'
  | 'u_survive'
  | 'u_states'
  | 'u_advance'
  | 'u_trailDrain'
  | 'u_flashDrain'
  | 'u_stamps'
  | 'u_stampCount'
  | 'u_overwrite'
  | 'u_seed'
type RenderUniform = 'u_state' | 'u_grid' | 'u_res' | 'u_origin' | 'u_cell' | 'u_gap' | 'u_background' | 'u_alive' | 'u_trail' | 'u_light'
type CensusUniform = 'u_state' | 'u_grid'
const STEP_UNIFORMS: StepUniform[] = ['u_state', 'u_grid', 'u_birth', 'u_survive', 'u_states', 'u_advance', 'u_trailDrain', 'u_flashDrain', 'u_stamps', 'u_stampCount', 'u_overwrite', 'u_seed']
const RENDER_UNIFORMS: RenderUniform[] = ['u_state', 'u_grid', 'u_res', 'u_origin', 'u_cell', 'u_gap', 'u_background', 'u_alive', 'u_trail', 'u_light']
const CENSUS_UNIFORMS: CensusUniform[] = ['u_state', 'u_grid']

type Locations<K extends string> = Record<K, WebGLUniformLocation | null>

/** 一对来回乒乓的状态纹理。 */
interface Targets {
  textures: [WebGLTexture, WebGLTexture]
  framebuffers: [WebGLFramebuffer, WebGLFramebuffer]
}

/**
 * 活细胞占比的普查：GPU 先把网格缩成 CENSUS × CENSUS 的小图，再直接读回这 256 字节。
 * 读回要等 GPU 做完这一帧已经排下的几遍模拟，网格很小、每隔几代才一次，等待可以忽略；
 * 换成像素缓冲加栅栏的异步读法，Chromium 反而每次都报读回副本被丢弃的性能警告。
 */
interface Census {
  program: WebGLProgram
  uniforms: Locations<CensusUniform>
  texture: WebGLTexture
  framebuffer: WebGLFramebuffer
  pixels: Uint8Array
}

interface GLState {
  gl: WebGL2RenderingContext
  step: { program: WebGLProgram; uniforms: Locations<StepUniform> }
  render: { program: WebGLProgram; uniforms: Locations<RenderUniform> }
  census: Census
  targets: Targets
  /** 当前状态在哪张纹理里。 */
  front: number
  cols: number
  rows: number
  dispose: () => void
}

interface Simulation {
  key: string
  generation: number
  /** 还没推进的零头代数。 */
  pending: number
  passes: number
  /** 攒着的火花：每代按速率累加，攒满 1 落一团。 */
  sparks: number
  /** 最近一次普查到的活细胞占比；这一局还没普查过时为 null。 */
  share: number | null
  /** 上次普查在第几代。 */
  censusAt: number
  random: () => number
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

function parseHex(hex: string): [number, number, number] {
  const value = hex.replace('#', '')
  return [0, 1, 2].map((index) => parseInt(value.slice(index * 2, index * 2 + 2), 16) / 255) as [number, number, number]
}

function luminance([r, g, b]: [number, number, number]): number {
  const linear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
}

/** 可复现的伪随机数（mulberry32）：同样的规则总是长出同样的图案，海报也稳定。 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** FNV-1a：把规则名变成随机数种子。 */
const seedOf = (text: string) => [...text].reduce((hash, char) => Math.imul(hash ^ char.charCodeAt(0), 16777619), 2166136261)

/** 初始的细胞汤：密度按一层低频噪声起伏，有疏有密，长出来的图案更有层次。 */
function seedSoup(cols: number, rows: number, density: number, random: () => number): Uint8Array {
  const lattice = 14
  const lw = Math.ceil(cols / lattice) + 2
  const lh = Math.ceil(rows / lattice) + 2
  const nodes = Float32Array.from({ length: lw * lh }, () => random())
  const data = new Uint8Array(cols * rows * 4)
  for (let y = 0; y < rows; y++) {
    const gy = y / lattice
    const y0 = Math.floor(gy)
    const ty = gy - y0
    const sy = ty * ty * (3 - 2 * ty)
    for (let x = 0; x < cols; x++) {
      const gx = x / lattice
      const x0 = Math.floor(gx)
      const tx = gx - x0
      const sx = tx * tx * (3 - 2 * tx)
      const top = nodes[y0 * lw + x0]! + (nodes[y0 * lw + x0 + 1]! - nodes[y0 * lw + x0]!) * sx
      const bottom = nodes[(y0 + 1) * lw + x0]! + (nodes[(y0 + 1) * lw + x0 + 1]! - nodes[(y0 + 1) * lw + x0]!) * sx
      const noise = top + (bottom - top) * sy
      const p = Math.min(0.92, density * (0.45 + 1.1 * noise))
      if (random() < p) {
        const i = (y * cols + x) * 4
        data[i] = 255
        data[i + 1] = 255
      }
    }
  }
  return data
}

function createTexture(gl: WebGL2RenderingContext, width: number, height: number, data: Uint8Array | null): WebGLTexture {
  const texture = gl.createTexture()!
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  return texture
}

function createFramebuffer(gl: WebGL2RenderingContext, texture: WebGLTexture): WebGLFramebuffer {
  const framebuffer = gl.createFramebuffer()!
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  return framebuffer
}

/** 一对 cols × rows 的状态纹理，data 放进第一张（为 null 时全是死细胞）。 */
function createTargets(gl: WebGL2RenderingContext, cols: number, rows: number, data: Uint8Array | null): Targets {
  const textures = [createTexture(gl, cols, rows, data), createTexture(gl, cols, rows, null)] as [WebGLTexture, WebGLTexture]
  return { textures, framebuffers: [createFramebuffer(gl, textures[0]), createFramebuffer(gl, textures[1])] }
}

function deleteTargets(gl: WebGL2RenderingContext, targets: Targets) {
  targets.textures.forEach((texture) => gl.deleteTexture(texture))
  targets.framebuffers.forEach((framebuffer) => gl.deleteFramebuffer(framebuffer))
}

/**
 * 生命游戏：GPU 上逐代演化的元胞自动机（生命游戏、高生命、昼夜、布赖恩之脑），活细胞发光，
 * 熄灭后留下慢慢褪去的荧光余辉。指针划过时撒下新的细胞，点一下种下一团。children 叠在网格之上。
 */
export function LifeAutomaton({ className, style, children, ...props }: LifeAutomatonProps) {
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
  const stamps = useRef({ data: new Float32Array(MAX_STAMPS * 4), count: 0, overwrite: 0 })

  const ruleOf = () => RULES[optionsRef.current.rule] ?? RULES.life!

  /** 网格在画布上的摆放：格子的像素大小，以及让网格居中的原点。 */
  const layout = () => {
    const canvas = canvasRef.current!
    const dpr = canvas.width / Math.max(1, canvas.clientWidth)
    const cell = Math.max(1, optionsRef.current.cellSize * dpr)
    const cols = Math.max(2, Math.ceil(canvas.width / cell))
    const rows = Math.max(2, Math.ceil(canvas.height / cell))
    return { cell, cols, rows, origin: [(canvas.width - cols * cell) / 2, (canvas.height - rows * cell) / 2] as const }
  }

  /** 排一团细胞，下一遍模拟时落下；overwrite 的团里没选中的格子会被清空。 */
  const pushStamp = (x: number, y: number, radius: number, density: number, overwrite = false) => {
    const queue = stamps.current
    if (queue.count >= MAX_STAMPS) return
    queue.data.set([x, y, radius, density], queue.count * 4)
    if (overwrite) queue.overwrite |= 1 << queue.count
    queue.count++
  }

  /** 跑一遍模拟着色器：advance 时推进一代，余辉和活跃度按 dt 秒衰减，顺带落下排队的细胞团。 */
  const pass = (state: GLState, sim: Simulation, advance: boolean, dt: number) => {
    const { gl } = state
    const { program, uniforms } = state.step
    const rule = ruleOf()
    const queue = stamps.current
    gl.useProgram(program)
    gl.bindFramebuffer(gl.FRAMEBUFFER, state.targets.framebuffers[1 - state.front]!)
    gl.viewport(0, 0, state.cols, state.rows)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, state.targets.textures[state.front]!)
    gl.uniform1i(uniforms.u_state, 0)
    gl.uniform2i(uniforms.u_grid, state.cols, state.rows)
    gl.uniform1i(uniforms.u_birth, rule.birth)
    gl.uniform1i(uniforms.u_survive, rule.survive)
    gl.uniform1i(uniforms.u_states, rule.states)
    gl.uniform1i(uniforms.u_advance, advance ? 1 : 0)
    // 余辉 trailDecay 秒、活跃度 FLASH_SECONDS 秒从满格线性降到 0（单位 1/255）。
    gl.uniform1f(uniforms.u_trailDrain, (255 * dt) / Math.max(0.05, optionsRef.current.trailDecay))
    gl.uniform1f(uniforms.u_flashDrain, (255 * dt) / FLASH_SECONDS)
    gl.uniform4fv(uniforms.u_stamps, queue.data)
    gl.uniform1i(uniforms.u_stampCount, queue.count)
    gl.uniform1i(uniforms.u_overwrite, queue.overwrite)
    gl.uniform1ui(uniforms.u_seed, Math.imul(sim.passes++, 0x9e3779b1) >>> 0)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    state.front = 1 - state.front
    queue.count = 0
    queue.overwrite = 0
  }

  /** 按活跃度攒火花，攒满一团就在随机位置撒下。 */
  const sparkle = (state: GLState, sim: Simulation) => {
    const rule = ruleOf()
    const activity = clamp01(optionsRef.current.activity / 100)
    const cells = Math.max(state.cols * state.rows, MIN_CELLS)
    if (rule.balance === undefined) {
      // 平方：低处变化细，高处一下子热闹起来。
      sim.sparks += (cells / SPARK_CELLS) * (0.04 + 0.96 * activity * activity)
      while (sim.sparks >= 1) {
        sim.sparks--
        pushStamp(sim.random() * state.cols, sim.random() * state.rows, 3 + 2 * activity + sim.random() * 3.5, rule.spark)
      }
      return
    }
    // 占比偏得越远撒得越快、越偏向少的那一种相位；还没普查到时两种各半。
    const share = sim.share ?? rule.balance
    const drift = Math.max(0, Math.abs(rule.balance - share) - 0.06)
    const island = clamp01(0.5 + 5 * (rule.balance - share))
    // 窄屏上网格短，岛屿也跟着小，不然一团就占掉小半屏。
    const maxRadius = 0.18 * Math.min(state.cols, state.rows)
    sim.sparks += (cells / ISLAND_CELLS) * (0.025 + 0.1 * activity + 1.2 * drift)
    while (sim.sparks >= 1) {
      sim.sparks--
      const density = sim.random() < island ? rule.spark : 1 - rule.spark
      pushStamp(sim.random() * state.cols, sim.random() * state.rows, Math.min(maxRadius, 8 + sim.random() * 6), density, true)
    }
  }

  /** 推进一代：先撒火花，再跑一遍模拟。 */
  const evolve = (state: GLState, sim: Simulation, dt: number) => {
    sparkle(state, sim)
    pass(state, sim, true, dt)
  }

  const warmUp = (state: GLState, sim: Simulation) => {
    const dt = 1 / Math.max(1, optionsRef.current.generationsPerSecond)
    for (let i = 0; i < WARMUP; i++) evolve(state, sim, dt)
  }

  /** 普查一次活细胞占比。 */
  const takeCensus = (state: GLState, sim: Simulation) => {
    const { gl, census } = state
    gl.useProgram(census.program)
    gl.bindFramebuffer(gl.FRAMEBUFFER, census.framebuffer)
    gl.viewport(0, 0, CENSUS, CENSUS)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, state.targets.textures[state.front]!)
    gl.uniform1i(census.uniforms.u_state, 0)
    gl.uniform2i(census.uniforms.u_grid, state.cols, state.rows)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    gl.readPixels(0, 0, CENSUS, CENSUS, gl.RGBA, gl.UNSIGNED_BYTE, census.pixels)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    let lit = 0
    for (let i = 0; i < census.pixels.length; i += 4) lit += census.pixels[i]!
    sim.share = lit / (255 * CENSUS * CENSUS)
    sim.censusAt = sim.generation
  }

  /**
   * 网格的行列数变了（拖窗口、手机地址栏收起、换格子大小）：不重开，旧图案按中心对齐搬进新网格；
   * 变大时新露出来的边用一片同样预热过的图案补上，看不出接缝。
   */
  const regrid = (state: GLState, sim: Simulation, cols: number, rows: number) => {
    const { gl } = state
    const old = { targets: state.targets, front: state.front, cols: state.cols, rows: state.rows }
    const grew = cols > old.cols || rows > old.rows
    state.targets = createTargets(gl, cols, rows, grew ? seedSoup(cols, rows, ruleOf().seed, sim.random) : null)
    state.front = 0
    state.cols = cols
    state.rows = rows
    if (grew) warmUp(state, sim)
    const width = Math.min(cols, old.cols)
    const height = Math.min(rows, old.rows)
    const [sx, sy] = [(old.cols - width) >> 1, (old.rows - height) >> 1]
    const [dx, dy] = [(cols - width) >> 1, (rows - height) >> 1]
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, old.targets.framebuffers[old.front]!)
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, state.targets.framebuffers[state.front]!)
    gl.blitFramebuffer(sx, sy, sx + width, sy + height, dx, dy, dx + width, dy + height, gl.COLOR_BUFFER_BIT, gl.NEAREST)
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null)
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null)
    deleteTargets(gl, old.targets)
  }

  /**
   * 换规则就重开一局，用这条规则自己的开局密度和预热；网格尺寸变了只搬图案。
   * 减少动态效果时静止画面就是预热的结果，活跃度变了也重开，画面才对得上参数。
   */
  const ensureSimulation = (state: GLState): Simulation => {
    const o = optionsRef.current
    const { cols, rows } = layout()
    const key = reducedRef.current ? `${o.rule}|${o.activity}` : o.rule
    const current = simRef.current
    if (current && current.key === key) {
      if (state.cols !== cols || state.rows !== rows) regrid(state, current, cols, rows)
      return current
    }

    const { gl } = state
    const random = mulberry32(seedOf(o.rule))
    const sim: Simulation = { key, generation: 0, pending: 0, passes: 0, sparks: 0, share: null, censusAt: 0, random }
    simRef.current = sim
    stamps.current.count = 0
    stamps.current.overwrite = 0
    deleteTargets(gl, state.targets)
    state.targets = createTargets(gl, cols, rows, seedSoup(cols, rows, ruleOf().seed, random))
    state.front = 0
    state.cols = cols
    state.rows = rows
    warmUp(state, sim)
    return sim
  }

  const render = () => {
    const state = glRef.current
    const canvas = canvasRef.current
    if (!state || !canvas) return
    ensureSimulation(state)
    const { gl } = state
    const { program, uniforms } = state.render
    const o = optionsRef.current
    const { cell, origin } = layout()
    const background = parseHex(o.background)
    gl.useProgram(program)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, state.targets.textures[state.front]!)
    gl.uniform1i(uniforms.u_state, 0)
    gl.uniform2i(uniforms.u_grid, state.cols, state.rows)
    gl.uniform2f(uniforms.u_res, canvas.width, canvas.height)
    gl.uniform2f(uniforms.u_origin, origin[0], origin[1])
    gl.uniform1f(uniforms.u_cell, cell)
    gl.uniform1f(uniforms.u_gap, Math.max(cell * 0.16, Math.min(1, cell * 0.25)))
    gl.uniform3fv(uniforms.u_background, background)
    gl.uniform3fv(uniforms.u_alive, parseHex(o.aliveColor))
    gl.uniform3fv(uniforms.u_trail, parseHex(o.trailColor))
    gl.uniform1f(uniforms.u_light, luminance(background) > 0.4 ? 1 : 0)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
  const renderRef = useRef(render)
  renderRef.current = render

  /** 按 generationsPerSecond 推进；这一帧不到一代时只衰减余辉，画笔照样立刻落下。 */
  const simulate = (delta: number) => {
    const state = glRef.current
    if (!state || !canvasRef.current) return
    const sim = ensureSimulation(state)
    sim.pending += delta * Math.max(0, optionsRef.current.generationsPerSecond)
    const due = Math.floor(sim.pending)
    sim.pending -= due
    const steps = Math.min(due, MAX_STEPS)
    if (steps === 0) {
      if (delta > 0 || stamps.current.count > 0) pass(state, sim, false, delta)
    } else {
      for (let i = 0; i < steps; i++) {
        sim.generation++
        evolve(state, sim, delta / steps)
      }
    }
    if (ruleOf().balance !== undefined && (sim.share === null || sim.generation - sim.censusAt >= CENSUS_EVERY)) takeCensus(state, sim)
  }
  const simulateRef = useRef(simulate)
  simulateRef.current = simulate

  useCanvasSize(canvasRef, { maxDpr: 1.5, onResize: () => renderRef.current() })

  useEffect(() => {
    const canvas = canvasRef.current!
    let disposed = false

    const setup = () => {
      const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' })
      if (!gl) return
      const stepProgram = createProgram(gl, VERTEX_SHADER, STEP_SHADER)
      const renderProgram = createProgram(gl, VERTEX_SHADER, RENDER_SHADER)
      const censusProgram = createProgram(gl, VERTEX_SHADER, CENSUS_SHADER)
      // 三个顶点着色器都把 a_pos 固定在 location 0，同一个四边形所有程序都能用。
      const releaseQuad = bindFullscreenQuad(gl, stepProgram)
      const locate = <K extends string>(program: WebGLProgram, names: K[]) =>
        Object.fromEntries(names.map((name) => [name, gl.getUniformLocation(program, name)])) as Locations<K>
      const censusTexture = createTexture(gl, CENSUS, CENSUS, null)
      const state: GLState = {
        gl,
        step: { program: stepProgram, uniforms: locate(stepProgram, STEP_UNIFORMS) },
        render: { program: renderProgram, uniforms: locate(renderProgram, RENDER_UNIFORMS) },
        census: {
          program: censusProgram,
          uniforms: locate(censusProgram, CENSUS_UNIFORMS),
          texture: censusTexture,
          framebuffer: createFramebuffer(gl, censusTexture),
          pixels: new Uint8Array(CENSUS * CENSUS * 4),
        },
        targets: createTargets(gl, 2, 2, null),
        front: 0,
        cols: 0,
        rows: 0,
        dispose: () => {
          releaseQuad()
          deleteTargets(gl, state.targets)
          gl.deleteTexture(state.census.texture)
          gl.deleteFramebuffer(state.census.framebuffer)
          for (const program of [stepProgram, renderProgram, censusProgram]) gl.deleteProgram(program)
        },
      }
      glRef.current = state
      // 新的上下文里状态纹理是空的，重开一局。
      simRef.current = null
      renderRef.current()
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

  // 指针划过时沿路径撒细胞，按下时种下一大团。按在链接、按钮这类可交互的子元素上时不处理。
  useEffect(() => {
    const host = hostRef.current!
    let last: [number, number] | null = null

    const toCells = (event: PointerEvent): [number, number] | null => {
      const canvas = canvasRef.current
      if (!canvas) return null
      const bounds = canvas.getBoundingClientRect()
      const dpr = canvas.width / Math.max(1, bounds.width)
      const { cell, origin } = layout()
      return [((event.clientX - bounds.left) * dpr - origin[0]) / cell, ((event.clientY - bounds.top) * dpr - origin[1]) / cell]
    }
    // 减少动态效果时网格不演化，只把新细胞画上去。
    const commit = () => {
      if (!reducedRef.current) return
      simulateRef.current(0)
      renderRef.current()
    }
    const onMove = (event: PointerEvent) => {
      const brush = optionsRef.current.brush
      const point = toCells(event)
      if (!point || brush <= 0) {
        last = null
        return
      }
      const spacing = Math.max(0.8, brush * 0.6)
      let from = last ?? point
      let distance = Math.hypot(point[0] - from[0], point[1] - from[1])
      if (distance > spacing * STROKE_STEPS) {
        // 跳得比一次能连上的距离还远（一笔结束后从别处重新开始）：当成新的一笔，不画一条横穿画面的虚线。
        from = point
        distance = 0
      } else if (last && distance < spacing * 0.5) {
        // 指针停着不动时不重复落笔。
        return
      }
      const steps = Math.min(STROKE_STEPS, Math.max(1, Math.ceil(distance / spacing)))
      for (let i = 1; i <= steps; i++) {
        const t = i / steps
        pushStamp(from[0] + (point[0] - from[0]) * t, from[1] + (point[1] - from[1]) * t, brush, ruleOf().brush)
      }
      last = point
      commit()
    }
    const onDown = (event: PointerEvent) => {
      const brush = optionsRef.current.brush
      if (event.button !== 0 || brush <= 0) return
      if (event.target instanceof Element && event.target.closest('a, button, input, textarea, select, label, summary, [role="button"], [contenteditable="true"]')) return
      const point = toCells(event)
      if (!point) return
      pushStamp(point[0], point[1], Math.max(4, brush * 2.2), ruleOf().brush)
      commit()
    }
    const onLeave = () => {
      last = null
    }
    host.addEventListener('pointermove', onMove, { passive: true })
    host.addEventListener('pointerdown', onDown)
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointercancel', onLeave)
    return () => {
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerdown', onDown)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointercancel', onLeave)
    }
  }, [])

  // 暂停或减少动态效果时，改参数也要立刻重画。
  useEffect(() => {
    renderRef.current()
  }, [options.rule, options.cellSize, options.activity, options.trailDecay, options.aliveColor, options.trailColor, options.background, reduced])

  useFrameLoop(
    hostRef,
    ({ delta }) => {
      simulate(delta)
      render()
    },
    { reducedMotion: 'static' },
  )

  return (
    <div ref={hostRef} className={cn('relative isolate overflow-hidden', className)} style={{ background: options.background, ...style }}>
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 -z-10 block h-full w-full" />
      {children}
    </div>
  )
}
