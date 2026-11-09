// SPDX-License-Identifier: MIT
// Copyright (c) 2017-present gl-transitions contributors
// Source: https://github.com/gl-transitions/gl-transitions/blob/902218a/README.md
// Modified by Motif; see the item's provenance. (Original Motif code that supplies the demo slides.)
/** 演示用的产品画面：全部由 Canvas 2D 现场绘制，不依赖任何图片文件（Motif 原创代码）。 */

export const ART_WIDTH = 1600
export const ART_HEIGHT = 1000

type Painter = (ctx: CanvasRenderingContext2D) => void

/** 影棚背景：中间亮、四周暗，底部有一圈接触阴影，产品像是摆在展台上。 */
function studio(ctx: CanvasRenderingContext2D, inner: string, outer: string) {
  const w = ART_WIDTH
  const h = ART_HEIGHT
  const g = ctx.createRadialGradient(w * 0.5, h * 0.42, 40, w * 0.5, h * 0.5, w * 0.7)
  g.addColorStop(0, inner)
  g.addColorStop(1, outer)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

function shadow(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number) {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx)
  g.addColorStop(0, 'rgba(0,0,0,0.55)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(1, 0.16)
  ctx.translate(-cx, -cy)
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(cx, cy, rx, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** 智能音箱：圆角柱体 + 织物横纹 + 顶部光环。 */
const speaker: Painter = (ctx) => {
  studio(ctx, '#3a3f4a', '#0d0f14')
  shadow(ctx, 800, 860, 300)
  const body = ctx.createLinearGradient(590, 0, 1010, 0)
  body.addColorStop(0, '#1d2028')
  body.addColorStop(0.35, '#5a606d')
  body.addColorStop(0.6, '#3b404b')
  body.addColorStop(1, '#14161c')
  roundRect(ctx, 590, 250, 420, 610, 120)
  ctx.fillStyle = body
  ctx.fill()
  ctx.save()
  ctx.clip()
  ctx.globalAlpha = 0.18
  ctx.fillStyle = '#000'
  for (let y = 300; y < 860; y += 14) ctx.fillRect(590, y, 420, 5)
  ctx.restore()
  const ring = ctx.createLinearGradient(600, 0, 1000, 0)
  ring.addColorStop(0, 'rgba(255,170,90,0)')
  ring.addColorStop(0.5, 'rgba(255,190,120,0.95)')
  ring.addColorStop(1, 'rgba(255,170,90,0)')
  ctx.fillStyle = ring
  ctx.fillRect(640, 268, 320, 10)
}

/** 头戴耳机：头梁弧线 + 两只耳罩。 */
const headphones: Painter = (ctx) => {
  studio(ctx, '#e9e2d6', '#9c8f7e')
  shadow(ctx, 800, 850, 360)
  ctx.lineCap = 'round'
  ctx.strokeStyle = '#2b2724'
  ctx.lineWidth = 46
  ctx.beginPath()
  ctx.arc(800, 560, 290, Math.PI * 1.05, Math.PI * 1.95)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.arc(800, 560, 300, Math.PI * 1.2, Math.PI * 1.6)
  ctx.stroke()
  for (const x of [510, 1090]) {
    const cup = ctx.createLinearGradient(x - 110, 0, x + 110, 0)
    cup.addColorStop(0, '#1e1b19')
    cup.addColorStop(0.45, '#57504a')
    cup.addColorStop(1, '#1a1715')
    roundRect(ctx, x - 110, 520, 220, 320, 100)
    ctx.fillStyle = cup
    ctx.fill()
    roundRect(ctx, x - 70, 560, 140, 240, 70)
    ctx.fillStyle = 'rgba(200,120,70,0.55)'
    ctx.fill()
  }
}

/** 腕表：表带 + 圆形表盘 + 指针。 */
const watch: Painter = (ctx) => {
  studio(ctx, '#1f4d4a', '#06141a')
  shadow(ctx, 800, 880, 260)
  ctx.fillStyle = '#0c1f22'
  roundRect(ctx, 700, 120, 200, 760, 60)
  ctx.fill()
  const bezel = ctx.createLinearGradient(560, 260, 1040, 740)
  bezel.addColorStop(0, '#d7dee0')
  bezel.addColorStop(0.5, '#6f7b80')
  bezel.addColorStop(1, '#e8eef0')
  ctx.fillStyle = bezel
  ctx.beginPath()
  ctx.arc(800, 500, 250, 0, Math.PI * 2)
  ctx.fill()
  const dial = ctx.createRadialGradient(760, 440, 20, 800, 500, 220)
  dial.addColorStop(0, '#1c5a55')
  dial.addColorStop(1, '#082a2b')
  ctx.fillStyle = dial
  ctx.beginPath()
  ctx.arc(800, 500, 218, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#d8f5ec'
  ctx.lineCap = 'round'
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    ctx.lineWidth = i % 3 === 0 ? 10 : 5
    ctx.beginPath()
    ctx.moveTo(800 + Math.cos(a) * 190, 500 + Math.sin(a) * 190)
    ctx.lineTo(800 + Math.cos(a) * 165, 500 + Math.sin(a) * 165)
    ctx.stroke()
  }
  ctx.lineWidth = 12
  ctx.beginPath()
  ctx.moveTo(800, 500)
  ctx.lineTo(800 + Math.cos(-2.1) * 120, 500 + Math.sin(-2.1) * 120)
  ctx.stroke()
  ctx.lineWidth = 7
  ctx.beginPath()
  ctx.moveTo(800, 500)
  ctx.lineTo(800 + Math.cos(-0.5) * 170, 500 + Math.sin(-0.5) * 170)
  ctx.stroke()
  ctx.fillStyle = '#ff8a5b'
  ctx.beginPath()
  ctx.arc(800, 500, 14, 0, Math.PI * 2)
  ctx.fill()
}

/** 无反相机：机身 + 镜头圈。 */
const camera: Painter = (ctx) => {
  studio(ctx, '#d65a3f', '#4a120c')
  shadow(ctx, 800, 820, 420)
  const body = ctx.createLinearGradient(0, 380, 0, 800)
  body.addColorStop(0, '#2f2f33')
  body.addColorStop(1, '#111114')
  roundRect(ctx, 420, 400, 760, 400, 56)
  ctx.fillStyle = body
  ctx.fill()
  roundRect(ctx, 480, 340, 200, 80, 20)
  ctx.fillStyle = '#2a2a2e'
  ctx.fill()
  ctx.fillStyle = '#c9c9cf'
  roundRect(ctx, 420, 470, 760, 26, 0)
  ctx.globalAlpha = 0.2
  ctx.fill()
  ctx.globalAlpha = 1
  for (const [r, c] of [
    [210, '#0b0b0d'],
    [180, '#3a3a40'],
    [150, '#0e0e12'],
    [96, '#1b2a44'],
  ] as const) {
    ctx.fillStyle = c
    ctx.beginPath()
    ctx.arc(860, 600, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.beginPath()
  ctx.arc(825, 565, 22, 0, Math.PI * 2)
  ctx.fill()
}

export const ARTWORK: Painter[] = [speaker, headphones, watch, camera]

export function drawArtwork(index: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = ART_WIDTH
  canvas.height = ART_HEIGHT
  const ctx = canvas.getContext('2d')!
  ARTWORK[((index % ARTWORK.length) + ARTWORK.length) % ARTWORK.length]!(ctx)
  return canvas
}
