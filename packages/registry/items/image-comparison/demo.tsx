import { useDrawnImage, useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { ImageComparison, ImageComparisonImage, ImageComparisonSlider, type ImageComparisonProps } from './image-comparison'

const W = 1200
const H = 750
const HORIZON = H * 0.63
const SUN = { x: W * 0.64, y: H * 0.545, r: 30 }

/** mulberry32：固定种子的伪随机数，每次画出来的山都一样。 */
function random(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 中点位移法生成山脊线：2^levels + 1 个点，高度归一化到 0–1。roughness 越大越崎岖。 */
function ridge(seed: number, levels: number, roughness: number): number[] {
  const next = random(seed)
  const count = 2 ** levels + 1
  const h = new Array<number>(count).fill(0)
  h[0] = next()
  h[count - 1] = next()
  let step = count - 1
  let scale = 0.9
  while (step > 1) {
    const half = step / 2
    for (let i = half; i < count; i += step) h[i] = (h[i - half]! + h[i + half]!) / 2 + (next() - 0.5) * scale
    scale *= roughness
    step = half
  }
  const min = Math.min(...h)
  const max = Math.max(...h)
  return h.map((v) => (v - min) / (max - min || 1))
}

type Layer = { seed: number; levels: number; roughness: number; top: number; height: number; color: string; dip?: number }

// 由远到近：越远越高、越淡（偏向天色），越近越暗。太阳附近的几层压出一个山口，太阳落在里面。
const LAYERS: Layer[] = [
  { seed: 11, levels: 7, roughness: 0.56, top: 0.3, height: 0.24, color: '#b0708f', dip: 0.65 },
  { seed: 29, levels: 7, roughness: 0.55, top: 0.42, height: 0.17, color: '#7b4d7f', dip: 0.8 },
  { seed: 47, levels: 6, roughness: 0.5, top: 0.5, height: 0.12, color: '#4a3163', dip: 0.5 },
  { seed: 83, levels: 6, roughness: 0.42, top: 0.56, height: 0.07, color: '#2a1d41' },
]

function drawLayer(ctx: CanvasRenderingContext2D, layer: Layer) {
  const h = ridge(layer.seed, layer.levels, layer.roughness)
  ctx.beginPath()
  ctx.moveTo(0, HORIZON + 2)
  h.forEach((value, i) => {
    const x = (i / (h.length - 1)) * W
    // 太阳附近压低山脊，让它落在山口里。
    const near = layer.dip ? Math.min(1, Math.abs(x - SUN.x) / (W * 0.22)) : 1
    const lift = layer.dip ? 1 - layer.dip * (1 - near * near) : 1
    ctx.lineTo(x, H * layer.top + (1 - value * lift) * H * layer.height + (1 - lift) * H * layer.height * 0.4)
  })
  ctx.lineTo(W, HORIZON + 2)
  ctx.closePath()
  ctx.fillStyle = layer.color
  ctx.fill()
}

/** reflected 为 true 时画的是水里的倒影：不画日轮和鸟，只留天色和光晕。 */
function drawSky(ctx: CanvasRenderingContext2D, reflected = false) {
  const sky = ctx.createLinearGradient(0, 0, 0, HORIZON)
  sky.addColorStop(0, '#1b2150')
  sky.addColorStop(0.42, '#5d4787')
  sky.addColorStop(0.74, '#d9786f')
  sky.addColorStop(1, '#ffc58c')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, W, HORIZON + 2)

  const glow = ctx.createRadialGradient(SUN.x, SUN.y, 0, SUN.x, SUN.y, 360)
  glow.addColorStop(0, 'rgba(255, 222, 168, 0.75)')
  glow.addColorStop(0.25, 'rgba(255, 176, 120, 0.32)')
  glow.addColorStop(1, 'rgba(255, 150, 120, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, HORIZON + 2)
  if (reflected) return

  ctx.fillStyle = '#fff2d6'
  ctx.beginPath()
  ctx.arc(SUN.x, SUN.y, SUN.r, 0, Math.PI * 2)
  ctx.fill()

  // 几只远处的鸟。
  ctx.strokeStyle = 'rgba(40, 24, 52, 0.55)'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  for (const [x, y, s] of [
    [W * 0.3, H * 0.22, 9],
    [W * 0.33, H * 0.25, 6],
    [W * 0.355, H * 0.205, 7],
  ] as const) {
    ctx.beginPath()
    ctx.moveTo(x - s, y - s * 0.35)
    ctx.quadraticCurveTo(x - s * 0.4, y - s * 0.55, x, y)
    ctx.quadraticCurveTo(x + s * 0.4, y - s * 0.55, x + s, y - s * 0.35)
    ctx.stroke()
  }
}

function drawLake(ctx: CanvasRenderingContext2D) {
  const water = ctx.createLinearGradient(0, HORIZON, 0, H)
  water.addColorStop(0, '#6e4a78')
  water.addColorStop(0.5, '#33244c')
  water.addColorStop(1, '#130e22')
  ctx.fillStyle = water
  ctx.fillRect(0, HORIZON, W, H - HORIZON)

  // 倒影：以地平线为轴翻转天空和山，压暗、压扁一点。
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, HORIZON, W, H - HORIZON)
  ctx.clip()
  ctx.globalAlpha = 0.42
  ctx.translate(0, HORIZON * 2)
  ctx.scale(1, -1)
  drawSky(ctx, true)
  for (const layer of LAYERS) drawLayer(ctx, layer)
  ctx.restore()

  const shade = ctx.createLinearGradient(0, HORIZON, 0, H)
  shade.addColorStop(0, 'rgba(19, 14, 34, 0.15)')
  shade.addColorStop(1, 'rgba(19, 14, 34, 0.85)')
  ctx.fillStyle = shade
  ctx.fillRect(0, HORIZON, W, H - HORIZON)

  // 太阳在水面上的碎光：越往下越宽、越淡。
  const next = random(7)
  for (let i = 0; i < 90; i++) {
    const depth = next()
    const y = HORIZON + 4 + depth * depth * (H - HORIZON) * 0.8
    const spread = 14 + depth * 120
    const x = SUN.x + (next() - 0.5) * spread * 2
    const length = 6 + next() * (18 + depth * 40)
    ctx.fillStyle = `rgba(255, 214, 160, ${(0.75 * (1 - depth)).toFixed(3)})`
    ctx.fillRect(x - length / 2, y, length, 1.5 + depth * 1.5)
  }

  // 细的水纹。
  ctx.fillStyle = 'rgba(255, 255, 255, 0.035)'
  for (let i = 0; i < 26; i++) {
    const y = HORIZON + 10 + ((i * 37) % (H - HORIZON - 10))
    ctx.fillRect(((i * 211) % W) - 80, y, 180 + ((i * 53) % 220), 1)
  }
}

/** 一棵松树的剪影：一摞锯齿三角形。 */
function pine(ctx: CanvasRenderingContext2D, x: number, base: number, height: number) {
  const tiers = 7
  ctx.beginPath()
  for (let i = 0; i < tiers; i++) {
    const top = base - height + (i / tiers) * height * 0.9
    const width = (height * 0.1 + (i / tiers) * height * 0.26) * (1 + (i % 2) * 0.08)
    ctx.moveTo(x, top)
    ctx.lineTo(x + width, top + height * 0.2)
    ctx.lineTo(x - width, top + height * 0.2)
    ctx.closePath()
  }
  ctx.rect(x - height * 0.015, base - height * 0.12, height * 0.03, height * 0.14)
  ctx.fill()
}

function drawShore(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#0d0918'
  ctx.beginPath()
  ctx.moveTo(0, H * 0.86)
  ctx.bezierCurveTo(W * 0.12, H * 0.83, W * 0.22, H * 0.9, W * 0.32, H * 0.93)
  ctx.lineTo(W * 0.32, H)
  ctx.lineTo(0, H)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(W, H * 0.9)
  ctx.bezierCurveTo(W * 0.93, H * 0.88, W * 0.88, H * 0.94, W * 0.83, H)
  ctx.lineTo(W, H)
  ctx.closePath()
  ctx.fill()
  for (const [x, height] of [
    [W * 0.035, H * 0.44],
    [W * 0.095, H * 0.32],
    [W * 0.15, H * 0.24],
    [W * 0.965, H * 0.3],
  ] as const) {
    pine(ctx, x, x > W / 2 ? H * 0.93 : H * 0.88, height)
  }
}

/** 调过色的成片：黄昏的湖。 */
function drawGraded(ctx: CanvasRenderingContext2D) {
  drawSky(ctx)
  for (const layer of LAYERS) drawLayer(ctx, layer)
  // 地平线上的一层暖雾，把远山和湖面连起来。
  const haze = ctx.createLinearGradient(0, HORIZON - 60, 0, HORIZON + 20)
  haze.addColorStop(0, 'rgba(255, 170, 140, 0)')
  haze.addColorStop(1, 'rgba(255, 170, 140, 0.2)')
  ctx.fillStyle = haze
  ctx.fillRect(0, HORIZON - 60, W, 80)
  drawLake(ctx)
  drawShore(ctx)
}

/** 同一帧的「原片」：低饱和、低反差、偏冷偏灰，像没调过的 RAW。 */
function drawUnedited(ctx: CanvasRenderingContext2D) {
  const source = document.createElement('canvas')
  source.width = W
  source.height = H
  const sctx = source.getContext('2d')
  if (!sctx) return
  drawGraded(sctx)
  ctx.filter = 'saturate(0.5) contrast(0.76) brightness(1.06)'
  ctx.drawImage(source, 0, 0)
  ctx.filter = 'none'
  ctx.fillStyle = 'rgba(120, 138, 150, 0.12)'
  ctx.fillRect(0, 0, W, H)
}

// 空闲时分割线绕起始位置来回扫：6 秒一个来回，循环视频 12 秒正好两趟。用户一碰就交还控制权。
const PERIOD = 6
const SWING = 28

export function Demo(props: Omit<ImageComparisonProps, 'children' | 'value' | 'onValueChange'>) {
  const host = useRef<HTMLDivElement>(null)
  const center = Math.min(70, Math.max(30, props.position ?? 50))
  const [auto, setAuto] = useState(center)
  const [manual, setManual] = useState(false)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = Math.round((center + SWING * Math.sin((time / PERIOD) * Math.PI * 2)) * 10) / 10
      setAuto((current) => (current === next ? current : next))
    },
    { reducedMotion: 'static', staticTime: 3.6 },
  )

  const after = useDrawnImage('lake-graded', drawGraded, { width: W, height: H })
  const before = useDrawnImage('lake-unedited', drawUnedited, { width: W, height: H })

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-6">
      <figure className="m-0 w-full max-w-[680px]">
        <ImageComparison {...props} value={manual ? undefined : auto} onValueChange={() => setManual(true)} className="shadow-[0_24px_60px_-30px_rgb(0_0_0/0.8)]">
          <ImageComparisonImage side="after" src={after || undefined} alt="Lake Kerrin at dusk, graded with warm highlights and deep violet shadows" label="After" />
          <ImageComparisonImage side="before" src={before || undefined} alt="The same frame straight out of the camera, flat and grey" label="Before" />
          <ImageComparisonSlider aria-label="Before and after" />
        </ImageComparison>
        <figcaption className="mt-3 flex items-center justify-between px-1 text-xs text-muted-foreground">
          <span>Lake Kerrin · 18:42</span>
          <span className="tabular-nums">Grade: Ember Dusk · +0.4 EV</span>
        </figcaption>
      </figure>
    </div>
  )
}
