// SPDX-License-Identifier: MIT
// Copyright (c) 2017-present gl-transitions contributors
// Source: https://github.com/gl-transitions/gl-transitions/blob/902218a/transitions/BookFlip.glsl
// Modified by Motif; see the item's provenance. (Original Motif code that draws the demo pages.)
/** 画册的每一页都由 Canvas 2D 现场绘制，不依赖任何图片文件。每张纹理是一个跨页（左右两页）。 */

export const PAGE_WIDTH = 700
export const PAGE_HEIGHT = 875
export const SPREAD_WIDTH = PAGE_WIDTH * 2
export const SPREAD_HEIGHT = PAGE_HEIGHT

const PAPER = '#f4efe6'
const INK = '#1d1b18'
const MUTED = '#776f65'
const SERIF = 'Georgia, "Times New Roman", "Songti SC", serif'
const SANS = '"Helvetica Neue", "Segoe UI", Arial, sans-serif'

const LOOKS = [
  { name: 'Boiled-wool chore coat', tone: 'Ochre, undyed', note: 'Cut roomy through the shoulder and finished with horn buttons. Boiled wool sheds rain and keeps its shape after a season on the hook.' },
  { name: 'Fisherman rib knit', tone: 'Slate', note: 'Knitted in Porto from a single ply of island wool. The rib runs long so it can be folded at the cuff or worn loose.' },
  { name: 'Waxed field jacket', tone: 'Kelp', note: 'Four bellows pockets and a corduroy collar. Rewax once a year; the creases are meant to stay.' },
  { name: 'Pleated wide trouser', tone: 'Ink', note: 'Two deep pleats and a high rise in heavy cotton twill. Made to sit on the shoe and move with a long stride.' },
  { name: 'Brushed flannel shirt', tone: 'Rust', note: 'A soft overshirt with a hidden placket. Brushed on both faces so it layers under a coat without catching.' },
  { name: 'Double-faced cape', tone: 'Fog', note: 'One cloth, two colors, no lining. Hand-finished edges and a single toggle at the throat.' },
]

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6)
  const n = Number.parseInt(full, 16)
  if (Number.isNaN(n)) return [128, 128, 128]
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** amount > 0 混向白色，< 0 混向黑色。 */
function shade(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex)
  const t = amount < 0 ? 0 : 255
  const k = Math.abs(amount)
  return `rgb(${Math.round(r + (t - r) * k)}, ${Math.round(g + (t - g) * k)}, ${Math.round(b + (t - b) * k)})`
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, width: number, lineHeight: number) {
  let line = ''
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > width && line) {
      ctx.fillText(line, x, y)
      line = word
      y += lineHeight
    } else line = next
  }
  if (line) ctx.fillText(line, x, y)
}

function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) {
  let cursor = x
  for (const char of text) {
    ctx.fillText(char, cursor, y)
    cursor += ctx.measureText(char).width + spacing
  }
}

/** 虚构的品牌标记：一个圆里一道地平线和半个太阳。 */
function mark(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x - r, y + r * 0.2)
  ctx.lineTo(x + r, y + r * 0.2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(x, y + r * 0.2, r * 0.45, Math.PI, 0)
  ctx.fill()
  ctx.restore()
}

function folio(ctx: CanvasRenderingContext2D, index: number, side: 'left' | 'right') {
  ctx.fillStyle = MUTED
  ctx.font = `500 15px ${SANS}`
  ctx.textAlign = side === 'left' ? 'left' : 'right'
  ctx.fillText(String(index + 1).padStart(2, '0'), side === 'left' ? 56 : PAGE_WIDTH - 56, PAGE_HEIGHT - 44)
  ctx.textAlign = side === 'left' ? 'right' : 'left'
  ctx.fillText('MAISON OSTRA  AW27', side === 'left' ? PAGE_WIDTH - 56 : 56, PAGE_HEIGHT - 44)
  ctx.textAlign = 'left'
}

function titlePage(ctx: CanvasRenderingContext2D, colors: string[]) {
  ctx.fillStyle = INK
  ctx.font = `600 16px ${SANS}`
  spaced(ctx, 'MAISON OSTRA', 64, 96, 6)
  ctx.font = `400 92px ${SERIF}`
  ctx.fillText('Autumn', 60, 400)
  ctx.fillText('Winter 27', 60, 500)
  ctx.font = `italic 400 40px ${SERIF}`
  ctx.fillStyle = MUTED
  ctx.fillText('The coast lookbook', 64, 572)
  colors.forEach((color, i) => {
    ctx.fillStyle = color
    ctx.fillRect(64 + i * 52, 640, 40, 40)
  })
  ctx.fillStyle = INK
  ctx.font = `400 17px ${SANS}`
  ctx.fillText('Issue 04. Six looks, one shoreline.', 64, 780)
  mark(ctx, PAGE_WIDTH - 96, 92, 26, INK)
}

function plate(ctx: CanvasRenderingContext2D, look: number, colors: string[]) {
  const a = colors[look % colors.length]!
  const b = colors[(look + 1) % colors.length]!
  const x = 56
  const y = 56
  const w = PAGE_WIDTH - 112
  const h = PAGE_HEIGHT - 210
  const sky = ctx.createLinearGradient(0, y, 0, y + h)
  sky.addColorStop(0, shade(a, 0.35))
  sky.addColorStop(0.62, a)
  sky.addColorStop(0.62, shade(a, -0.25))
  sky.addColorStop(1, shade(a, -0.45))
  ctx.fillStyle = sky
  ctx.fillRect(x, y, w, h)

  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()
  // 太阳
  ctx.fillStyle = shade(b, 0.2)
  ctx.beginPath()
  ctx.arc(x + w * (look % 2 ? 0.28 : 0.72), y + h * 0.3, w * 0.13, 0, Math.PI * 2)
  ctx.fill()
  // 人物剪影：头、颈、外套、双腿
  const figure = luminance(a) > 0.35 ? shade(a, -0.78) : shade(b, -0.55)
  const coat = luminance(b) > 0.6 ? shade(b, -0.3) : shade(b, -0.1)
  const cx = x + w * 0.5
  const top = y + h * 0.18
  const flare = (look % 3) * 10
  ctx.fillStyle = figure
  ctx.beginPath()
  ctx.arc(cx, top + 34, 30, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillRect(cx - 11, top + 58, 22, 24)
  ctx.fillRect(cx - 42, top + 370, 30, 140)
  ctx.fillRect(cx + 12, top + 370, 30, 140)
  ctx.fillStyle = coat
  ctx.beginPath()
  ctx.moveTo(cx - 62, top + 92)
  ctx.quadraticCurveTo(cx, top + 70, cx + 62, top + 92)
  ctx.lineTo(cx + 88 + flare, top + 380)
  ctx.lineTo(cx - 88 - flare, top + 380)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = shade(b, -0.45)
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(cx, top + 120)
  ctx.lineTo(cx, top + 378)
  ctx.moveTo(cx - 34, top + 84)
  ctx.lineTo(cx, top + 160)
  ctx.lineTo(cx + 34, top + 84)
  ctx.stroke()
  ctx.restore()

  ctx.fillStyle = INK
  ctx.font = `600 15px ${SANS}`
  spaced(ctx, `LOOK ${String(look + 1).padStart(2, '0')}`, x, y + h + 46, 4)
  ctx.font = `400 26px ${SERIF}`
  ctx.fillText(LOOKS[look % LOOKS.length]!.name, x + 140, y + h + 48)
}

function notes(ctx: CanvasRenderingContext2D, look: number, colors: string[]) {
  const item = LOOKS[look % LOOKS.length]!
  ctx.fillStyle = INK
  ctx.font = `400 180px ${SERIF}`
  ctx.fillText(String(look + 1).padStart(2, '0'), 56, 250)
  ctx.font = `400 40px ${SERIF}`
  wrap(ctx, item.name, 60, 340, PAGE_WIDTH - 120, 48)
  ctx.font = `italic 400 22px ${SERIF}`
  ctx.fillStyle = MUTED
  ctx.fillText(item.tone, 60, 420)
  ctx.fillStyle = INK
  ctx.font = `400 20px ${SANS}`
  wrap(ctx, item.note, 60, 490, PAGE_WIDTH - 200, 32)
  ctx.fillStyle = MUTED
  ctx.font = `600 13px ${SANS}`
  spaced(ctx, 'CLOTH', 60, 690, 3)
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = colors[(look + i) % colors.length]!
    ctx.beginPath()
    ctx.arc(76 + i * 46, 728, 16, 0, Math.PI * 2)
    ctx.fill()
  }
}

function colophon(ctx: CanvasRenderingContext2D) {
  mark(ctx, PAGE_WIDTH / 2, PAGE_HEIGHT / 2 - 80, 40, INK)
  ctx.fillStyle = INK
  ctx.textAlign = 'center'
  ctx.font = `italic 400 36px ${SERIF}`
  ctx.fillText('Made slowly, worn for years.', PAGE_WIDTH / 2, PAGE_HEIGHT / 2 + 30)
  ctx.fillStyle = MUTED
  ctx.font = `400 17px ${SANS}`
  ctx.fillText('Photographed in Brest. Sewn in Porto.', PAGE_WIDTH / 2, PAGE_HEIGHT / 2 + 76)
  ctx.textAlign = 'left'
}

function drawPage(ctx: CanvasRenderingContext2D, index: number, count: number, colors: string[]) {
  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)
  // 纸张靠书脊一侧的轻微暗边
  const toSpine = index % 2 === 0
  const edge = ctx.createLinearGradient(toSpine ? PAGE_WIDTH : 0, 0, toSpine ? PAGE_WIDTH - 60 : 60, 0)
  edge.addColorStop(0, 'rgba(60, 45, 30, 0.10)')
  edge.addColorStop(1, 'rgba(60, 45, 30, 0)')
  ctx.fillStyle = edge
  ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)
  if (index === 0) titlePage(ctx, colors)
  else if (index === count - 1) colophon(ctx)
  else {
    const look = Math.floor((index - 1) / 2)
    if (index % 2 === 1) plate(ctx, look, colors)
    else notes(ctx, look, colors)
  }
  if (index !== 0) folio(ctx, index, toSpine ? 'left' : 'right')
}

/** 画出所有跨页：每个跨页是一张 SPREAD_WIDTH × SPREAD_HEIGHT 的画布。 */
export function drawSpreads(pageCount: number, colors: string[]): HTMLCanvasElement[] {
  const count = Math.max(2, Math.round(pageCount / 2) * 2)
  const palette = colors.length ? colors : ['#c8553d']
  const spreads: HTMLCanvasElement[] = []
  for (let s = 0; s < count / 2; s++) {
    const canvas = document.createElement('canvas')
    canvas.width = SPREAD_WIDTH
    canvas.height = SPREAD_HEIGHT
    const ctx = canvas.getContext('2d')!
    for (let side = 0; side < 2; side++) {
      ctx.save()
      ctx.translate(side * PAGE_WIDTH, 0)
      drawPage(ctx, s * 2 + side, count, palette)
      ctx.restore()
    }
    spreads.push(canvas)
  }
  return spreads
}
