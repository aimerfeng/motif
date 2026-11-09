// SPDX-License-Identifier: MIT
// Copyright (c) 2017-present gl-transitions contributors
// Source: https://github.com/gl-transitions/gl-transitions/blob/902218a/README.md
// Modified by Motif; see the item's provenance. (Original Motif code that supplies the card artwork.)
/** 卡片的两幅画面（正面、切换后的另一面），全部由 Canvas 2D 现场绘制，不依赖图片文件。 */

export const ART_WIDTH = 800
export const ART_HEIGHT = 1000

export type Artwork = 'can' | 'peaks' | 'poster'

const LATIN = '"Helvetica Neue", "Segoe UI", Arial, "Liberation Sans", sans-serif'
const W = ART_WIDTH
const H = ART_HEIGHT

function linear(ctx: CanvasRenderingContext2D, y0: number, y1: number, stops: string[]) {
  const g = ctx.createLinearGradient(0, y0, 0, y1)
  stops.forEach((color, i) => g.addColorStop(i / Math.max(1, stops.length - 1), color))
  return g
}

function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color: string, weight = 700) {
  ctx.fillStyle = color
  ctx.font = `${weight} ${size}px ${LATIN}`
  ctx.fillText(text, x, y)
}

/** 饮料罐：正面是品牌面，另一面是换了口味和配色的背面。 */
function drawCan(ctx: CanvasRenderingContext2D, alt: boolean) {
  const bg = alt ? ['#0f4c4a', '#1f8a7a'] : ['#ffb44d', '#ff6a3d']
  const body = alt ? ['#f6efe1', '#e4d8bf'] : ['#2a1238', '#4b1f5c']
  const ink = alt ? '#0f4c4a' : '#ffd9a3'
  ctx.fillStyle = linear(ctx, 0, H, bg)
  ctx.fillRect(0, 0, W, H)
  // 背景上的大圆弧
  ctx.strokeStyle = alt ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.22)'
  ctx.lineWidth = 26
  for (let i = 0; i < 4; i++) {
    ctx.beginPath()
    ctx.arc(W / 2, H * 0.52, 250 + i * 70, 0, Math.PI * 2)
    ctx.stroke()
  }
  // 阴影
  ctx.fillStyle = 'rgba(0,0,0,0.22)'
  ctx.beginPath()
  ctx.ellipse(W / 2, H * 0.86, 190, 30, 0, 0, Math.PI * 2)
  ctx.fill()
  // 罐身
  const x = W / 2 - 170
  const top = H * 0.18
  const bottom = H * 0.84
  const side = ctx.createLinearGradient(x, 0, x + 340, 0)
  side.addColorStop(0, body[1]!)
  side.addColorStop(0.35, body[0]!)
  side.addColorStop(0.6, body[0]!)
  side.addColorStop(1, body[1]!)
  ctx.fillStyle = side
  ctx.beginPath()
  ctx.roundRect(x, top, 340, bottom - top, 46)
  ctx.fill()
  // 顶盖
  ctx.fillStyle = '#c9ccd2'
  ctx.beginPath()
  ctx.ellipse(W / 2, top + 10, 160, 26, 0, 0, Math.PI * 2)
  ctx.fill()
  // 高光
  ctx.fillStyle = 'rgba(255,255,255,0.18)'
  ctx.fillRect(x + 64, top + 40, 22, bottom - top - 90)

  ctx.textAlign = 'center'
  if (!alt) {
    ctx.fillStyle = '#ff8a3d'
    ctx.beginPath()
    ctx.arc(W / 2, H * 0.43, 92, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#ffd36b'
    ctx.beginPath()
    ctx.arc(W / 2, H * 0.43, 54, 0, Math.PI * 2)
    ctx.fill()
    label(ctx, 'SOLSTICE', W / 2, H * 0.62, 58, ink, 900)
    label(ctx, 'BLOOD ORANGE · 330ML', W / 2, H * 0.67, 22, ink, 600)
  } else {
    label(ctx, 'YUZU', W / 2, H * 0.36, 70, ink, 900)
    label(ctx, '& SEA SALT', W / 2, H * 0.41, 26, ink, 700)
    ctx.fillStyle = ink
    for (let i = 0; i < 5; i++) {
      ctx.globalAlpha = 0.85
      ctx.fillRect(W / 2 - 110, H * 0.47 + i * 34, 220 - (i % 3) * 40, 12)
    }
    ctx.globalAlpha = 1
    label(ctx, '40 KCAL', W / 2, H * 0.71, 30, ink, 800)
  }
  ctx.textAlign = 'left'
}

/** 山景：白天与夜晚。 */
function drawPeaks(ctx: CanvasRenderingContext2D, alt: boolean) {
  ctx.fillStyle = linear(ctx, 0, H * 0.7, alt ? ['#070a24', '#1d2160', '#5b3a8c'] : ['#7ec9f5', '#cfe9f7', '#ffe6c2'])
  ctx.fillRect(0, 0, W, H)
  if (alt) {
    ctx.fillStyle = '#ffffff'
    let seed = 7
    for (let i = 0; i < 90; i++) {
      seed = (seed * 9301 + 49297) % 233280
      const sx = (seed / 233280) * W
      seed = (seed * 9301 + 49297) % 233280
      const sy = (seed / 233280) * H * 0.55
      ctx.globalAlpha = 0.4 + (i % 5) * 0.12
      ctx.fillRect(sx, sy, 3 + (i % 3), 3 + (i % 3))
    }
    ctx.globalAlpha = 1
    ctx.fillStyle = '#fff3d1'
    ctx.beginPath()
    ctx.arc(W * 0.7, H * 0.2, 70, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#1d2160'
    ctx.beginPath()
    ctx.arc(W * 0.7 + 30, H * 0.2 - 18, 60, 0, Math.PI * 2)
    ctx.fill()
  } else {
    ctx.fillStyle = '#fff4d6'
    ctx.beginPath()
    ctx.arc(W * 0.3, H * 0.24, 90, 0, Math.PI * 2)
    ctx.fill()
  }
  const layers: [number, number, string, string][] = alt
    ? [
        [0.5, 0.18, '#3a2f74', '#231c52'],
        [0.62, 0.14, '#221a4d', '#140f33'],
        [0.76, 0.1, '#110c2a', '#080616'],
      ]
    : [
        [0.5, 0.18, '#8fb3cf', '#6c94b5'],
        [0.62, 0.14, '#4f7f6b', '#386453'],
        [0.76, 0.1, '#2d4c3e', '#1d3329'],
      ]
  layers.forEach(([base, amp, light, dark], i) => {
    ctx.fillStyle = linear(ctx, H * (base - amp), H, [light, dark])
    ctx.beginPath()
    ctx.moveTo(0, H)
    for (let px = 0; px <= W; px += 10) {
      const t = px / W
      const ridge = Math.abs(((t * (2 + i) + i * 0.37) % 1) - 0.5) * 2
      ctx.lineTo(px, H * (base - amp * (1 - ridge) + 0.02 * Math.sin(t * 19 + i)))
    }
    ctx.lineTo(W, H)
    ctx.closePath()
    ctx.fill()
  })
  label(ctx, alt ? 'NIGHT · 21:40' : 'DAY · 07:15', 48, H - 56, 28, alt ? '#e9e6ff' : '#f2fff8', 700)
}

/** 海报：同心圆版与网格版。 */
function drawPoster(ctx: CanvasRenderingContext2D, alt: boolean) {
  ctx.fillStyle = alt ? '#111114' : '#f1ece2'
  ctx.fillRect(0, 0, W, H)
  const ink = alt ? '#f1ece2' : '#111114'
  const accent = '#ff4b2b'
  if (!alt) {
    for (let i = 7; i >= 0; i--) {
      ctx.fillStyle = i % 2 === 0 ? accent : '#f1ece2'
      if (i === 0) ctx.fillStyle = ink
      ctx.beginPath()
      ctx.arc(W / 2, H * 0.42, 40 + i * 40, 0, Math.PI * 2)
      ctx.fill()
    }
  } else {
    const n = 6
    const size = (W - 120) / n
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < n; x++) {
        const k = (x * 3 + y * 5) % 7
        ctx.fillStyle = k === 0 ? accent : k < 3 ? ink : '#2a2a30'
        const r = k === 0 ? size * 0.46 : size * 0.3
        ctx.beginPath()
        if (k % 2 === 0) ctx.arc(60 + x * size + size / 2, 60 + y * size + size / 2, r, 0, Math.PI * 2)
        else ctx.rect(60 + x * size + size / 2 - r, 60 + y * size + size / 2 - r, r * 2, r * 2)
        ctx.fill()
      }
    }
  }
  label(ctx, alt ? 'SERIES 07 / B' : 'SERIES 07 / A', 60, H - 120, 54, ink, 900)
  label(ctx, 'SCREENPRINT · 50 × 70 CM', 60, H - 70, 24, ink, 600)
}

const PAINTERS: Record<Artwork, (ctx: CanvasRenderingContext2D, alt: boolean) => void> = {
  can: drawCan,
  peaks: drawPeaks,
  poster: drawPoster,
}

/** 画出一组画面的正面和另一面，返回两块画布。 */
export function drawArtwork(artwork: string): [HTMLCanvasElement, HTMLCanvasElement] {
  const paint = PAINTERS[artwork as Artwork] ?? PAINTERS.can
  const make = (alt: boolean) => {
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    if (ctx) paint(ctx, alt)
    return canvas
  }
  return [make(false), make(true)]
}
