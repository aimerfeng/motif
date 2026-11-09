// SPDX-License-Identifier: MIT
// Copyright (c) 2017 Pavel Dobryakov
// Source: https://github.com/PavelDoGreat/WebGL-Fluid-Simulation/blob/a2d2929/script.js
// Modified by Motif; see the item's provenance.
import { cn, useCanvasSize, useDrawnImage, useFrameLoop, useImageElement, usePrefersReducedMotion } from '@motif/runtime'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { createInkEngine, type InkConfig, type InkEngine } from './fluid-engine'

/* @motif:defaults */
export const defaults = {
  artwork: 'nightfall',
  brushRadius: 0.25,
  heal: 0.5,
  curl: 30,
  edgeSoftness: 0.3,
  edgeTint: '#ffc58a',
  autopilot: true,
}
/* @motif:end */

export type FluidInkRevealProps = Partial<typeof defaults> & {
  /** 画面的文字说明（给读屏软件）。 */
  label?: string
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

// 上游 config 里不再开放的几项，保持上游的默认值；染料分辨率降到 512，遮罩不需要更细。
const SIM_RESOLUTION = 128
const DYE_RESOLUTION = 512
const VELOCITY_DISSIPATION = 0.2
const PRESSURE = 0.8
const SPLAT_FORCE = 6000
/** 拖动时每帧注入的墨量；自动搅动按 60fps 折算。 */
const POINTER_INK = 0.45
const AUTOPILOT_INK = 0.12
/** 用户停手多少秒后自动搅动接管。 */
const AUTOPILOT_IDLE = 2.5

const WIDTH = 1600
const HEIGHT = 1000

type Side = 'cover' | 'hidden'

/** 确定性的伪随机数发生器（mulberry32）：星星、开场斑点都由它给出，不读 Math.random。 */
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

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '')
  const full = value.length === 3 ? value.replace(/(.)/g, '$1$1') : value
  const n = Number.parseInt(full.slice(0, 6), 16)
  if (Number.isNaN(n)) return [1, 1, 1]
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

/* ---------- 画面：两张同构图的画，在 Canvas 上现画 ---------- */

/** 一道山脊：几层正弦叠出起伏，|sin| 让山尖更尖。 */
function ridgePath(context: CanvasRenderingContext2D, base: number, amp: number, k: number, phase: number) {
  context.beginPath()
  context.moveTo(0, HEIGHT)
  for (let x = 0; x <= WIDTH; x += 12) {
    const peak = 1 - Math.abs(Math.sin(x * 0.0024 * k + phase))
    const roll = Math.sin(x * 0.0061 * k + phase * 1.7) * 0.25 + Math.sin(x * 0.017 * k + phase * 2.3) * 0.08
    context.lineTo(x, base - amp * (peak * peak * 0.75 + roll + 0.2))
  }
  context.lineTo(WIDTH, HEIGHT)
  context.closePath()
}

const HORIZON = 650

/** 「入夜」：同一片湖山，白天与夜晚。 */
function drawNightfall(context: CanvasRenderingContext2D, side: Side) {
  const night = side === 'hidden'
  const sky = context.createLinearGradient(0, 0, 0, HORIZON)
  if (night) {
    sky.addColorStop(0, '#060920')
    sky.addColorStop(0.6, '#1c1a50')
    sky.addColorStop(1, '#55366f')
  } else {
    sky.addColorStop(0, '#8cc0e3')
    sky.addColorStop(0.65, '#cfe5f1')
    sky.addColorStop(1, '#f7efe1')
  }
  context.fillStyle = sky
  context.fillRect(0, 0, WIDTH, HORIZON)

  if (night) {
    const rand = mulberry32(42)
    for (let i = 0; i < 220; i++) {
      const x = rand() * WIDTH
      const y = rand() * (HORIZON - 120)
      const r = 0.6 + rand() * rand() * 2.2
      context.globalAlpha = 0.35 + rand() * 0.65
      context.fillStyle = '#fdf8ea'
      context.beginPath()
      context.arc(x, y, r, 0, Math.PI * 2)
      context.fill()
    }
    context.globalAlpha = 1
  }

  // 太阳 / 月亮在同一个位置。
  const cx = 1140
  const cy = 300
  const glow = context.createRadialGradient(cx, cy, 20, cx, cy, 260)
  glow.addColorStop(0, night ? 'rgba(246,238,214,0.45)' : 'rgba(255,246,222,0.9)')
  glow.addColorStop(1, 'rgba(255,246,222,0)')
  context.fillStyle = glow
  context.fillRect(cx - 260, cy - 260, 520, 520)
  context.fillStyle = night ? '#f4eedb' : '#fffaf0'
  context.beginPath()
  context.arc(cx, cy, night ? 62 : 72, 0, Math.PI * 2)
  context.fill()
  if (night) {
    context.fillStyle = 'rgba(180,170,150,0.35)'
    for (const [dx, dy, r] of [[-18, -12, 14], [16, 10, 10], [-4, 24, 8], [22, -20, 6]] as const) {
      context.beginPath()
      context.arc(cx + dx, cy + dy, r, 0, Math.PI * 2)
      context.fill()
    }
  }

  const ranges = [
    { base: 560, amp: 190, k: 1, phase: 0.6, day: '#9cb7cb', night: '#4a4386' },
    { base: 610, amp: 130, k: 1.4, phase: 2.1, day: '#6d91ab', night: '#302c66' },
    { base: HORIZON, amp: 70, k: 2.1, phase: 4.2, day: '#4b7774', night: '#1a1b44' },
  ]
  for (const range of ranges) {
    ridgePath(context, range.base, range.amp, range.k, range.phase)
    context.fillStyle = night ? range.night : range.day
    context.fill()
  }

  // 湖面和倒影。
  const lake = context.createLinearGradient(0, HORIZON, 0, HEIGHT)
  lake.addColorStop(0, night ? '#221f55' : '#bcd8e7')
  lake.addColorStop(1, night ? '#0a0b26' : '#76a1bb')
  context.fillStyle = lake
  context.fillRect(0, HORIZON, WIDTH, HEIGHT - HORIZON)
  context.save()
  context.beginPath()
  context.rect(0, HORIZON, WIDTH, HEIGHT - HORIZON)
  context.clip()
  context.translate(0, HORIZON * 2)
  context.scale(1, -1)
  context.globalAlpha = 0.3
  for (const range of ranges) {
    ridgePath(context, range.base, range.amp, range.k, range.phase)
    context.fillStyle = night ? range.night : range.day
    context.fill()
  }
  context.restore()

  context.fillStyle = night ? 'rgba(246,231,190,0.75)' : 'rgba(255,255,255,0.7)'
  for (let i = 0; i < 9; i++) {
    const y = HORIZON + 30 + i * 30
    const half = 70 - i * 6
    context.globalAlpha = 1 - i * 0.09
    context.fillRect(cx - half + (i % 2) * 12, y, half * 2, 4)
  }
  context.globalAlpha = 1

  // 近岸、松树和小屋：夜里屋里亮着灯。
  context.fillStyle = night ? '#0b0c22' : '#2f5046'
  context.beginPath()
  context.moveTo(0, 820)
  context.bezierCurveTo(260, 800, 560, 880, 760, HEIGHT)
  context.lineTo(0, HEIGHT)
  context.closePath()
  context.fill()

  context.fillStyle = night ? '#06071a' : '#21403a'
  for (const [x, size] of [[70, 150], [150, 190], [230, 130], [560, 120], [620, 90]] as const) {
    const ground = 830 + (x > 500 ? 70 : 0)
    context.beginPath()
    context.moveTo(x, ground - size)
    context.lineTo(x + size * 0.32, ground)
    context.lineTo(x - size * 0.32, ground)
    context.closePath()
    context.fill()
  }

  const hx = 350
  const hy = 860
  context.fillStyle = night ? '#121330' : '#b4553d'
  context.fillRect(hx, hy - 70, 130, 70)
  context.fillStyle = night ? '#090a1f' : '#5c2f27'
  context.beginPath()
  context.moveTo(hx - 14, hy - 66)
  context.lineTo(hx + 65, hy - 128)
  context.lineTo(hx + 144, hy - 66)
  context.closePath()
  context.fill()
  if (night) {
    const lamp = context.createRadialGradient(hx + 45, hy - 38, 4, hx + 45, hy - 38, 90)
    lamp.addColorStop(0, 'rgba(255,200,110,0.55)')
    lamp.addColorStop(1, 'rgba(255,200,110,0)')
    context.fillStyle = lamp
    context.fillRect(hx - 60, hy - 140, 220, 200)
  }
  context.fillStyle = night ? '#ffcf7a' : '#3b2a26'
  context.fillRect(hx + 30, hy - 52, 30, 26)
  context.fillRect(hx + 80, hy - 52, 30, 26)
}

/* 静物：草图（铅笔线稿）和完成的画，构图相同。 */
const TABLE = 700
const VASE_X = 780
const SPHERE = { x: 1150, y: 610, r: 90 }

function vasePath(context: CanvasRenderingContext2D) {
  const cx = VASE_X
  context.beginPath()
  context.moveTo(cx - 60, 300)
  context.quadraticCurveTo(cx - 40, 330, cx - 44, 370)
  context.bezierCurveTo(cx - 60, 420, cx - 175, 450, cx - 168, 560)
  context.bezierCurveTo(cx - 160, 640, cx - 110, 680, cx - 92, TABLE)
  context.lineTo(cx + 92, TABLE)
  context.bezierCurveTo(cx + 110, 680, cx + 160, 640, cx + 168, 560)
  context.bezierCurveTo(cx + 175, 450, cx + 60, 420, cx + 44, 370)
  context.quadraticCurveTo(cx + 40, 330, cx + 60, 300)
  context.closePath()
}

function spherePath(context: CanvasRenderingContext2D) {
  context.beginPath()
  context.arc(SPHERE.x, SPHERE.y, SPHERE.r, 0, Math.PI * 2)
}

const CUBE = {
  front: [[330, 520], [530, 520], [530, TABLE], [330, TABLE]],
  top: [[330, 520], [395, 465], [595, 465], [530, 520]],
  side: [[530, 520], [595, 465], [595, 645], [530, TABLE]],
} as const

function polygon(context: CanvasRenderingContext2D, points: readonly (readonly [number, number])[]) {
  context.beginPath()
  points.forEach(([x, y], i) => (i === 0 ? context.moveTo(x, y) : context.lineTo(x, y)))
  context.closePath()
}

function shadowPaths(context: CanvasRenderingContext2D) {
  context.beginPath()
  context.ellipse(VASE_X + 150, TABLE + 18, 190, 26, 0, 0, Math.PI * 2)
  context.ellipse(SPHERE.x + 70, TABLE + 14, 120, 18, 0, 0, Math.PI * 2)
  context.ellipse(560, TABLE + 16, 140, 20, 0, 0, Math.PI * 2)
}

/** 在当前裁剪区里画一片斜向排线。 */
function hatch(context: CanvasRenderingContext2D, gap: number, alpha: number) {
  context.strokeStyle = `rgba(46,43,39,${alpha})`
  context.lineWidth = 1.4
  context.beginPath()
  for (let x = -HEIGHT; x < WIDTH; x += gap) {
    context.moveTo(x, HEIGHT)
    context.lineTo(x + HEIGHT, 0)
  }
  context.stroke()
}

function drawSketch(context: CanvasRenderingContext2D) {
  context.fillStyle = '#f4efe6'
  context.fillRect(0, 0, WIDTH, HEIGHT)
  // 纸面颗粒。
  const rand = mulberry32(7)
  context.fillStyle = 'rgba(90,70,40,0.06)'
  for (let i = 0; i < 2400; i++) context.fillRect(rand() * WIDTH, rand() * HEIGHT, 1.6, 1.6)

  // 辅助线。
  context.strokeStyle = 'rgba(46,43,39,0.16)'
  context.lineWidth = 1.2
  context.beginPath()
  context.moveTo(VASE_X, 240)
  context.lineTo(VASE_X, 760)
  for (const y of [300, 560, TABLE]) {
    context.moveTo(240, y)
    context.lineTo(1360, y)
  }
  context.moveTo(SPHERE.x - 130, SPHERE.y)
  context.lineTo(SPHERE.x + 130, SPHERE.y)
  context.stroke()
  context.beginPath()
  context.ellipse(SPHERE.x, SPHERE.y, SPHERE.r, SPHERE.r * 0.3, 0, 0, Math.PI * 2)
  context.stroke()
  context.strokeRect(1030, 130, 360, 270)

  // 排线阴影：花瓶右侧、球的背光面、方块侧面、投影。
  context.save()
  vasePath(context)
  context.clip()
  context.beginPath()
  context.rect(VASE_X + 50, 0, 400, HEIGHT)
  context.clip()
  hatch(context, 9, 0.5)
  context.restore()

  context.save()
  spherePath(context)
  context.clip()
  context.beginPath()
  context.rect(0, 0, WIDTH, HEIGHT)
  context.arc(SPHERE.x - 34, SPHERE.y - 34, SPHERE.r, 0, Math.PI * 2, true)
  context.clip()
  hatch(context, 8, 0.55)
  context.restore()

  context.save()
  polygon(context, CUBE.side)
  context.clip()
  hatch(context, 8, 0.5)
  context.restore()

  context.save()
  shadowPaths(context)
  context.clip()
  hatch(context, 6, 0.4)
  context.restore()

  // 轮廓：每条线画两遍，略微错开，像铅笔。
  const outline = (draw: () => void) => {
    for (const [dx, dy, alpha, width] of [[0, 0, 0.85, 2.4], [1.4, -1, 0.35, 1.4]] as const) {
      context.save()
      context.translate(dx, dy)
      draw()
      context.strokeStyle = `rgba(46,43,39,${alpha})`
      context.lineWidth = width
      context.stroke()
      context.restore()
    }
  }
  outline(() => {
    context.beginPath()
    context.moveTo(200, TABLE)
    context.lineTo(1400, TABLE)
  })
  outline(() => vasePath(context))
  outline(() => {
    context.beginPath()
    context.ellipse(VASE_X, 300, 60, 12, 0, 0, Math.PI * 2)
  })
  outline(() => spherePath(context))
  outline(() => polygon(context, CUBE.front))
  outline(() => polygon(context, CUBE.top))
  outline(() => polygon(context, CUBE.side))
  outline(() => {
    context.beginPath()
    context.moveTo(1210, 130)
    context.lineTo(1210, 400)
    context.moveTo(1030, 265)
    context.lineTo(1390, 265)
  })
}

function drawPainting(context: CanvasRenderingContext2D) {
  const wall = context.createLinearGradient(0, 0, 0, TABLE)
  wall.addColorStop(0, '#1b3045')
  wall.addColorStop(1, '#2d4c66')
  context.fillStyle = wall
  context.fillRect(0, 0, WIDTH, TABLE)

  // 窗外的晚霞。
  const glass = context.createLinearGradient(0, 130, 0, 400)
  glass.addColorStop(0, '#f7c36f')
  glass.addColorStop(1, '#ee7d5a')
  context.fillStyle = glass
  context.fillRect(1030, 130, 360, 270)
  context.strokeStyle = '#e9e0cf'
  context.lineWidth = 14
  context.strokeRect(1030, 130, 360, 270)
  context.lineWidth = 8
  context.beginPath()
  context.moveTo(1210, 130)
  context.lineTo(1210, 400)
  context.moveTo(1030, 265)
  context.lineTo(1390, 265)
  context.stroke()
  const light = context.createLinearGradient(1030, 400, 900, TABLE)
  light.addColorStop(0, 'rgba(247,195,111,0.22)')
  light.addColorStop(1, 'rgba(247,195,111,0)')
  context.fillStyle = light
  context.beginPath()
  context.moveTo(1030, 400)
  context.lineTo(1390, 400)
  context.lineTo(1100, TABLE)
  context.lineTo(700, TABLE)
  context.closePath()
  context.fill()

  const table = context.createLinearGradient(0, TABLE, 0, HEIGHT)
  table.addColorStop(0, '#bb7643')
  table.addColorStop(1, '#6f3d22')
  context.fillStyle = table
  context.fillRect(0, TABLE, WIDTH, HEIGHT - TABLE)
  context.fillStyle = '#d99c66'
  context.fillRect(0, TABLE, WIDTH, 5)

  context.fillStyle = 'rgba(30,14,6,0.35)'
  shadowPaths(context)
  context.fill()

  // 方块。
  polygon(context, CUBE.front)
  context.fillStyle = '#efe6d6'
  context.fill()
  polygon(context, CUBE.top)
  context.fillStyle = '#fffaf1'
  context.fill()
  polygon(context, CUBE.side)
  context.fillStyle = '#bfb19b'
  context.fill()

  // 花瓶：横向渐变 + 两道蓝色纹样 + 高光。
  const body = context.createLinearGradient(VASE_X - 170, 0, VASE_X + 170, 0)
  body.addColorStop(0, '#f7cf5d')
  body.addColorStop(0.55, '#e9a93a')
  body.addColorStop(1, '#a96a1f')
  vasePath(context)
  context.fillStyle = body
  context.fill()
  context.save()
  vasePath(context)
  context.clip()
  context.fillStyle = '#2a5d8f'
  context.fillRect(0, 500, WIDTH, 26)
  context.fillRect(0, 548, WIDTH, 10)
  context.fillStyle = 'rgba(255,255,255,0.32)'
  context.beginPath()
  context.ellipse(VASE_X - 90, 540, 22, 80, -0.15, 0, Math.PI * 2)
  context.fill()
  context.restore()
  context.fillStyle = '#7a4a17'
  context.beginPath()
  context.ellipse(VASE_X, 300, 60, 12, 0, 0, Math.PI * 2)
  context.fill()

  // 球。
  const ball = context.createRadialGradient(SPHERE.x - 34, SPHERE.y - 38, 8, SPHERE.x, SPHERE.y, SPHERE.r)
  ball.addColorStop(0, '#ff9a76')
  ball.addColorStop(0.6, '#e2502f')
  ball.addColorStop(1, '#9c2a17')
  spherePath(context)
  context.fillStyle = ball
  context.fill()
}

function drawArtwork(context: CanvasRenderingContext2D, artwork: string, side: Side) {
  if (artwork === 'sketch') {
    if (side === 'cover') drawSketch(context)
    else drawPainting(context)
    return
  }
  drawNightfall(context, side)
}

/* ---------- 自动搅动 ---------- */

interface Stirrer {
  ax: number
  ay: number
  fx: number
  fy: number
  px: number
  py: number
}

/** 两个虚拟指针沿李萨如曲线游走。 */
const STIRRERS: Stirrer[] = [
  { ax: 0.3, ay: 0.24, fx: 0.83, fy: 1.21, px: 0.4, py: 1.3 },
  { ax: 0.26, ay: 0.28, fx: 1.13, fy: 0.74, px: 2.7, py: 0.2 },
]

function stirrerAt(s: Stirrer, t: number): [number, number] {
  return [0.5 + s.ax * Math.sin(s.fx * t + s.px), 0.5 + s.ay * Math.sin(s.fy * t + s.py)]
}

interface Pointer {
  x: number
  y: number
  dx: number
  dy: number
  moved: boolean
}

const toConfig = (o: typeof defaults): InkConfig => ({
  simResolution: SIM_RESOLUTION,
  dyeResolution: DYE_RESOLUTION,
  densityDissipation: o.heal,
  velocityDissipation: VELOCITY_DISSIPATION,
  pressure: PRESSURE,
  curl: o.curl,
  splatRadius: o.brushRadius,
  edgeSoftness: o.edgeSoftness,
  edgeTint: hexToRgb(o.edgeTint),
})

/**
 * 流体墨迹揭示：两张画叠在一起，拖动指针搅起真实的流体，墨的浓度就是遮罩，
 * 在漩涡状的墨迹里露出下面那张画；停手后墨慢慢退去，画面复原。children 叠在最上面。
 */
export function FluidInkReveal({ label = 'Two artworks; stirring the ink reveals the second one', className, style, children, ...props }: FluidInkRevealProps) {
  const options = { ...defaults, ...props }
  const optionsRef = useRef(options)
  optionsRef.current = options
  const reducedMotion = usePrefersReducedMotion()
  const reducedRef = useRef(reducedMotion)
  reducedRef.current = reducedMotion

  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<InkEngine | null>(null)
  const pointers = useRef(new Map<number, Pointer>())
  const lastInput = useRef(-Infinity)
  const settled = useRef('')
  const lastTime = useRef(0)

  const coverUrl = useDrawnImage(`${options.artwork}:cover`, (context) => drawArtwork(context, options.artwork, 'cover'), { width: WIDTH, height: HEIGHT })
  const hiddenUrl = useDrawnImage(`${options.artwork}:hidden`, (context) => drawArtwork(context, options.artwork, 'hidden'), { width: WIDTH, height: HEIGHT })
  const coverImage = useImageElement(coverUrl)
  const hiddenImage = useImageElement(hiddenUrl)
  const images = useRef({ cover: coverImage, hidden: hiddenImage })
  images.current = { cover: coverImage, hidden: hiddenImage }

  /** 上游的 multipleSplats：一把随机的墨滴，位置和方向由 seed 决定。 */
  const drops = (seed: number, count: number) => {
    const engine = engineRef.current
    if (!engine) return
    const rand = mulberry32(seed)
    for (let i = 0; i < count; i++) {
      engine.splat(0.2 + rand() * 0.6, 0.2 + rand() * 0.6, 1000 * (rand() - 0.5), 1000 * (rand() - 0.5), 1)
    }
  }

  const autopilot = (time: number, dt: number, delta: number) => {
    const engine = engineRef.current
    const canvas = canvasRef.current
    if (!engine || !canvas) return
    const aspect = canvas.width / Math.max(1, canvas.height)
    // 帧间隔超过一步模拟的上限时，按比例缩小力度，保持每秒注入量不变。
    const scale = delta > 0 ? dt / delta : 0
    const prev = Math.max(0, time - delta)
    for (const stirrer of STIRRERS) {
      const [x, y] = stirrerAt(stirrer, time)
      const [px, py] = stirrerAt(stirrer, prev)
      let dx = (x - px) * scale
      let dy = (y - py) * scale
      if (aspect < 1) dx *= aspect
      if (aspect > 1) dy /= aspect
      engine.splat(x, y, dx * SPLAT_FORCE, dy * SPLAT_FORCE, AUTOPILOT_INK * Math.min(1, dt * 60))
    }
  }

  const applyPointers = (time: number) => {
    const engine = engineRef.current
    if (!engine) return
    for (const pointer of pointers.current.values()) {
      if (!pointer.moved) continue
      pointer.moved = false
      lastInput.current = time
      engine.splat(pointer.x, pointer.y, pointer.dx * SPLAT_FORCE, pointer.dy * SPLAT_FORCE, POINTER_INK)
    }
  }

  const settleKey = (o: typeof defaults) => `${o.brushRadius}|${o.heal}|${o.curl}`

  /** 减少动态效果：清空后把自动搅动快进一段，停在一个揭开了一部分的画面，之后只重画不再推进。 */
  const settle = () => {
    const engine = engineRef.current
    if (!engine) return
    engine.reset()
    const dt = 1 / 60
    for (let i = 1; i <= 200; i++) {
      autopilot(i * dt, dt, dt)
      engine.step(dt)
    }
    settled.current = settleKey(optionsRef.current)
  }

  const frame = (time: number, delta: number) => {
    const engine = engineRef.current
    if (!engine) return
    if (reducedRef.current) {
      if (settled.current !== settleKey(optionsRef.current)) settle()
    } else if (delta > 0) {
      const dt = Math.min(delta, 1 / 60)
      applyPointers(time)
      if (optionsRef.current.autopilot && time - lastInput.current > AUTOPILOT_IDLE) autopilot(time, dt, delta)
      engine.step(dt)
    }
    engine.render()
  }
  const frameRef = useRef(frame)
  frameRef.current = frame

  useCanvasSize(canvasRef, {
    maxDpr: 1.5,
    onResize: () => {
      const engine = engineRef.current
      if (!engine) return
      engine.syncSize()
      engine.render()
    },
  })

  useEffect(() => {
    const canvas = canvasRef.current!
    const host = hostRef.current!
    let disposed = false

    const setup = () => {
      const engine = createInkEngine(canvas, () => toConfig(optionsRef.current))
      engineRef.current = engine
      if (!engine) return
      const { cover, hidden } = images.current
      if (cover) engine.setImage('cover', cover)
      if (hidden) engine.setImage('hidden', hidden)
      settled.current = ''
      // 与上游一样，开场先落一把墨滴。
      if (!reducedRef.current) drops(11, 5)
      frameRef.current(lastTime.current, 0)
    }

    const onLost = (event: Event) => {
      event.preventDefault()
      engineRef.current = null
    }
    const onRestored = () => {
      if (!disposed) setup()
    }

    const local = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect()
      return { x: (event.clientX - rect.left) / Math.max(1, rect.width), y: 1 - (event.clientY - rect.top) / Math.max(1, rect.height), aspect: rect.width / Math.max(1, rect.height) }
    }
    const onDown = (event: PointerEvent) => {
      const { x, y } = local(event)
      pointers.current.set(event.pointerId, { x, y, dx: 0, dy: 0, moved: false })
      host.setPointerCapture(event.pointerId)
    }
    const onMove = (event: PointerEvent) => {
      const pointer = pointers.current.get(event.pointerId)
      if (!pointer) return
      const { x, y, aspect } = local(event)
      let dx = x - pointer.x
      let dy = y - pointer.y
      if (aspect < 1) dx *= aspect
      if (aspect > 1) dy /= aspect
      pointer.x = x
      pointer.y = y
      pointer.dx = dx
      pointer.dy = dy
      // 减少动态效果时模拟不在循环里推进，拖动时也不注入，保持静止。
      pointer.moved = dx !== 0 || dy !== 0
    }
    const onUp = (event: PointerEvent) => {
      pointers.current.delete(event.pointerId)
      if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId)
    }

    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)
    host.addEventListener('pointerdown', onDown)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerup', onUp)
    host.addEventListener('pointercancel', onUp)
    setup()

    return () => {
      disposed = true
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      host.removeEventListener('pointerdown', onDown)
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerup', onUp)
      host.removeEventListener('pointercancel', onUp)
      const engine = engineRef.current
      engineRef.current = null
      engine?.dispose()
    }
  }, [])

  // 画面画好（或换了一套）就上传；静态模式下顺便重画一帧。
  useEffect(() => {
    const engine = engineRef.current
    if (!engine) return
    if (coverImage) engine.setImage('cover', coverImage)
    if (hiddenImage) engine.setImage('hidden', hiddenImage)
    if (reducedMotion) frameRef.current(lastTime.current, 0)
  }, [coverImage, hiddenImage, reducedMotion])

  // 静态模式下参数变了要重新生成一帧。
  useEffect(() => {
    if (reducedMotion) frameRef.current(lastTime.current, 0)
  })

  useFrameLoop(
    hostRef,
    ({ time, delta }) => {
      lastTime.current = time
      frame(time, delta)
    },
    { speed: 1, reducedMotion: 'static', staticTime: 0 },
  )

  return (
    <div ref={hostRef} className={cn('relative isolate overflow-hidden bg-[#0b0b10]', className)} style={{ touchAction: 'pan-y', ...style }}>
      <canvas ref={canvasRef} role="img" aria-label={label} className="absolute inset-0 -z-10 block h-full w-full" />
      {children}
    </div>
  )
}
