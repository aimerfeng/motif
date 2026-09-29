// SPDX-License-Identifier: MIT
// Copyright (c) 2017-present gl-transitions contributors
// Source: https://github.com/gl-transitions/gl-transitions/blob/902218a/README.md
// Modified by Motif; see the item's provenance. (Original Motif code that supplies the demo slides.)
/** 演示用的三幅画面：全部由 Canvas 2D 现场绘制，不依赖任何图片文件。 */

export const ART_WIDTH = 1600
export const ART_HEIGHT = 1000

export const SCHEMES = ['dusk', 'mono', 'lagoon', 'candy'] as const
export type Scheme = (typeof SCHEMES)[number]

interface Look {
  from: string
  to: string
  accent: string
  accent2: string
  ink: string
}

/** 每套配色给三幅画各一组颜色：一幅深色、一幅浅色、一幅中间调，切换时反差明显。 */
const LOOKS: Record<Scheme, [Look, Look, Look]> = {
  dusk: [
    { from: '#1a0f45', to: '#e2437a', accent: '#ffb86b', accent2: '#ff6f91', ink: '#fff4e6' },
    { from: '#fff0e0', to: '#ffc2b0', accent: '#ff5a6e', accent2: '#5b3ad6', ink: '#25104f' },
    { from: '#0c2b66', to: '#25c2b3', accent: '#ffe27a', accent2: '#ffffff', ink: '#ffffff' },
  ],
  mono: [
    { from: '#08080a', to: '#2b2b33', accent: '#f4f1ea', accent2: '#ff4b2b', ink: '#f4f1ea' },
    { from: '#f4f1ea', to: '#d9d4c7', accent: '#08080a', accent2: '#ff4b2b', ink: '#08080a' },
    { from: '#ff4b2b', to: '#c81d00', accent: '#08080a', accent2: '#f4f1ea', ink: '#f4f1ea' },
  ],
  lagoon: [
    { from: '#03182e', to: '#0a6d8f', accent: '#7ff5d6', accent2: '#e8fffb', ink: '#e8fffb' },
    { from: '#e9fbf6', to: '#a8ecdd', accent: '#0a6d8f', accent2: '#ff8f6b', ink: '#03303f' },
    { from: '#ff9d6b', to: '#ff5d73', accent: '#fff2d6', accent2: '#03182e', ink: '#fff7ec' },
  ],
  candy: [
    { from: '#3b1c8c', to: '#c04cff', accent: '#ffe14d', accent2: '#4dffd2', ink: '#ffffff' },
    { from: '#fff7d6', to: '#ffd0f2', accent: '#ff4fa3', accent2: '#3b1c8c', ink: '#2b0f6b' },
    { from: '#4dffd2', to: '#3aa0ff', accent: '#ff4fa3', accent2: '#fff7d6', ink: '#0d2a66' },
  ],
}

const LATIN = '"Helvetica Neue", "Segoe UI", Arial, "Liberation Sans", sans-serif'
const CJK = '"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", "Source Han Sans SC", "WenQuanYi Micro Hei", sans-serif'

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

function background(ctx: CanvasRenderingContext2D, look: Look, angle = 0.9) {
  const w = ART_WIDTH
  const h = ART_HEIGHT
  const gradient = ctx.createLinearGradient(w / 2 - Math.cos(angle) * w * 0.6, h / 2 - Math.sin(angle) * h * 0.6, w / 2 + Math.cos(angle) * w * 0.6, h / 2 + Math.sin(angle) * h * 0.6)
  gradient.addColorStop(0, look.from)
  gradient.addColorStop(1, look.to)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, w, h)
}

/** 细颗粒，让大面积渐变不显得塑料。 */
function grain(ctx: CanvasRenderingContext2D, seed: number, alpha: number) {
  const rand = mulberry32(seed)
  ctx.save()
  for (let i = 0; i < 9000; i++) {
    ctx.globalAlpha = alpha * rand()
    ctx.fillStyle = rand() > 0.5 ? '#ffffff' : '#000000'
    ctx.fillRect(rand() * ART_WIDTH, rand() * ART_HEIGHT, 2, 2)
  }
  ctx.restore()
}

function setSpacing(ctx: CanvasRenderingContext2D, value: string) {
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = value
}

/** 深色：落日、百叶窗和同心圆，配 MOTIF。 */
function drawSun(ctx: CanvasRenderingContext2D, look: Look) {
  const w = ART_WIDTH
  const h = ART_HEIGHT
  background(ctx, look, 1.4)
  const cx = w * 0.66
  const cy = h * 0.44
  const r = h * 0.3

  const halo = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 2.4)
  halo.addColorStop(0, `${look.accent}66`)
  halo.addColorStop(1, `${look.accent}00`)
  ctx.fillStyle = halo
  ctx.fillRect(0, 0, w, h)

  ctx.strokeStyle = `${look.ink}30`
  ctx.lineWidth = 2
  for (let i = 1; i <= 5; i++) {
    ctx.beginPath()
    ctx.arc(cx, cy, r + i * 46, 0, Math.PI * 2)
    ctx.stroke()
  }

  const disc = ctx.createLinearGradient(0, cy - r, 0, cy + r)
  disc.addColorStop(0, look.accent)
  disc.addColorStop(1, look.accent2)
  ctx.fillStyle = disc
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()

  // 圆盘下半部分被越来越粗的横条切开。
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r + 2, 0, Math.PI * 2)
  ctx.clip()
  const bar = ctx.createLinearGradient(0, cy, 0, cy + r)
  bar.addColorStop(0, look.from)
  bar.addColorStop(1, look.to)
  for (let i = 0; i < 6; i++) {
    const y = cy + r * 0.12 + i * r * 0.17
    ctx.fillStyle = bar
    ctx.fillRect(cx - r - 4, y, r * 2 + 8, 4 + i * 4)
  }
  ctx.restore()

  ctx.fillStyle = look.ink
  ctx.textBaseline = 'alphabetic'
  setSpacing(ctx, '-0.02em')
  ctx.font = `800 ${h * 0.3}px ${LATIN}`
  ctx.fillText('MOTIF', w * 0.055, h * 0.9)
  setSpacing(ctx, '0.3em')
  ctx.font = `600 ${h * 0.03}px ${LATIN}`
  ctx.globalAlpha = 0.8
  ctx.fillText('EFFECTS  /  OPEN SOURCE', w * 0.06, h * 0.1)
  ctx.globalAlpha = 1
  setSpacing(ctx, '0px')
  grain(ctx, 11, 0.05)
}

/** 浅色：圆点网格、叠印的大圆和「母题」。 */
function drawGlyph(ctx: CanvasRenderingContext2D, look: Look) {
  const w = ART_WIDTH
  const h = ART_HEIGHT
  background(ctx, look, 0.5)

  ctx.fillStyle = look.ink
  ctx.globalAlpha = 0.16
  for (let x = 0; x < 20; x++) {
    for (let y = 0; y < 13; y++) {
      ctx.beginPath()
      ctx.arc(w * 0.05 + x * (w * 0.9) / 19, h * 0.08 + y * (h * 0.84) / 12, 5, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.globalAlpha = 1

  ctx.save()
  ctx.globalCompositeOperation = 'multiply'
  const discs: [number, number, number, string][] = [
    [0.3, 0.55, 0.3, look.accent],
    [0.5, 0.42, 0.26, look.accent2],
    [0.7, 0.6, 0.22, look.accent],
  ]
  for (const [x, y, r, color] of discs) {
    ctx.fillStyle = color
    ctx.globalAlpha = 0.85
    ctx.beginPath()
    ctx.arc(w * x, h * y, h * r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()

  ctx.fillStyle = look.ink
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'center'
  ctx.font = `900 ${h * 0.5}px ${CJK}`
  ctx.fillText('母题', w * 0.5, h * 0.72)
  ctx.textAlign = 'left'
  setSpacing(ctx, '0.3em')
  ctx.font = `700 ${h * 0.03}px ${LATIN}`
  ctx.fillText('MOTIF  ·  EST. 2026', w * 0.06, h * 0.93)
  setSpacing(ctx, '0px')
  grain(ctx, 23, 0.06)
}

/** 中间调：四分之一圆弧层叠，五个圆里各站一个字母。 */
function drawArcs(ctx: CanvasRenderingContext2D, look: Look) {
  const w = ART_WIDTH
  const h = ART_HEIGHT
  background(ctx, look, 2.2)

  ctx.lineCap = 'butt'
  for (let i = 0; i < 9; i++) {
    ctx.strokeStyle = i % 2 === 0 ? look.accent : look.accent2
    ctx.globalAlpha = 0.2 + (i % 3) * 0.12
    ctx.lineWidth = 34
    ctx.beginPath()
    ctx.arc(w, h, h * 0.2 + i * 80, Math.PI, Math.PI * 1.5)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  const letters = ['M', 'O', 'T', 'I', 'F']
  const size = h * 0.15
  const gap = size * 1.25
  const startX = w / 2 - (gap * (letters.length - 1)) / 2
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  letters.forEach((letter, i) => {
    const x = startX + i * gap
    const y = h * 0.5 + (i % 2 === 0 ? -1 : 1) * h * 0.05
    ctx.fillStyle = i % 2 === 0 ? look.ink : look.accent
    ctx.beginPath()
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = look.from
    ctx.font = `800 ${size * 0.58}px ${LATIN}`
    ctx.fillText(letter, x, y + size * 0.03)
  })
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = look.ink
  setSpacing(ctx, '0.3em')
  ctx.font = `700 ${h * 0.03}px ${LATIN}`
  ctx.fillText('母题  ·  MOTIF', w * 0.06, h * 0.93)
  setSpacing(ctx, '0px')
  grain(ctx, 37, 0.05)
}

/** 画出一套配色的三幅画，返回三块画布。 */
export function drawArtwork(scheme: Scheme): HTMLCanvasElement[] {
  const looks = LOOKS[scheme] ?? LOOKS.dusk
  const painters = [drawSun, drawGlyph, drawArcs]
  return painters.map((paint, index) => {
    const canvas = document.createElement('canvas')
    canvas.width = ART_WIDTH
    canvas.height = ART_HEIGHT
    const ctx = canvas.getContext('2d')
    if (ctx) paint(ctx, looks[index]!)
    return canvas
  })
}
