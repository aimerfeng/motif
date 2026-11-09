// SPDX-License-Identifier: Apache-2.0
// Paper Shaders (https://shaders.paper.design)
// Source: https://github.com/paper-design/shaders/blob/43cd68d/packages/shaders-react/src/shaders/image-dithering.tsx
// Built on @paper-design/shaders-react. Modified by Motif; see the item's provenance.
import { ImageDithering } from '@paper-design/shaders-react'
import { cn, useDrawnImage, useFrameLoop, useImageElement } from '@motif/runtime'
import { useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  artwork: 'landscape',
  type: '8x8',
  size: 2,
  colorSteps: 2,
  colorBack: '#000c38',
  colorFront: '#94ffaf',
  colorHighlight: '#eaff94',
  originalColors: false,
  inverted: false,
  drift: 0.08,
}
/* @motif:end */

export type DitheredImageProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

const WIDTH = 1600
const HEIGHT = 1000
/** 缓慢平移一个来回的时长（秒）。 */
const PERIOD = 12

/** 山景：渐变天空、一轮落日、三层由远及近的山脊。 */
function drawLandscape(context: CanvasRenderingContext2D) {
  const sky = context.createLinearGradient(0, 0, 0, HEIGHT)
  sky.addColorStop(0, '#1b2a4a')
  sky.addColorStop(0.5, '#e98a6b')
  sky.addColorStop(1, '#ffe2a8')
  context.fillStyle = sky
  context.fillRect(0, 0, WIDTH, HEIGHT)
  const sun = context.createRadialGradient(1050, 470, 20, 1050, 470, 200)
  sun.addColorStop(0, '#fffbe8')
  sun.addColorStop(1, '#ffc46b')
  context.fillStyle = sun
  context.beginPath()
  context.arc(1050, 470, 170, 0, Math.PI * 2)
  context.fill()
  const ridges: [number, number, number, string][] = [
    [560, 120, 0.004, '#8a5a78'],
    [680, 140, 0.0031, '#4b3460'],
    [820, 110, 0.0024, '#1c1430'],
  ]
  for (const [base, amp, freq, color] of ridges) {
    context.fillStyle = color
    context.beginPath()
    context.moveTo(0, HEIGHT)
    for (let x = 0; x <= WIDTH; x += 8) {
      const y = base - amp * (0.6 * Math.sin(x * freq + base) + 0.4 * Math.sin(x * freq * 2.7 + 1.3))
      context.lineTo(x, y)
    }
    context.lineTo(WIDTH, HEIGHT)
    context.closePath()
    context.fill()
  }
}

/** 静物：一颗受光的球体落在台面上，背后一道柔和的光。 */
function drawStill(context: CanvasRenderingContext2D) {
  const wall = context.createRadialGradient(560, 300, 50, 700, 450, 1100)
  wall.addColorStop(0, '#d8d4cc')
  wall.addColorStop(1, '#2a2a30')
  context.fillStyle = wall
  context.fillRect(0, 0, WIDTH, HEIGHT)
  const table = context.createLinearGradient(0, 700, 0, HEIGHT)
  table.addColorStop(0, '#6d6458')
  table.addColorStop(1, '#1d1a17')
  context.fillStyle = table
  context.fillRect(0, 700, WIDTH, HEIGHT - 700)
  const shadow = context.createRadialGradient(900, 790, 10, 900, 790, 360)
  shadow.addColorStop(0, 'rgba(0, 0, 0, 0.75)')
  shadow.addColorStop(1, 'rgba(0, 0, 0, 0)')
  context.fillStyle = shadow
  context.beginPath()
  context.ellipse(900, 790, 360, 70, 0, 0, Math.PI * 2)
  context.fill()
  const ball = context.createRadialGradient(700, 380, 20, 800, 500, 330)
  ball.addColorStop(0, '#ffffff')
  ball.addColorStop(0.35, '#c9b8a6')
  ball.addColorStop(1, '#2b231d')
  context.fillStyle = ball
  context.beginPath()
  context.arc(800, 500, 290, 0, Math.PI * 2)
  context.fill()
}

/** 色团：几团高饱和的色块，适合「保留原色」的多色抖动。 */
function drawSpectrum(context: CanvasRenderingContext2D) {
  context.fillStyle = '#101018'
  context.fillRect(0, 0, WIDTH, HEIGHT)
  for (const [x, y, radius, color] of [
    [480, 380, 520, '255, 72, 120'],
    [1150, 320, 480, '255, 190, 40'],
    [880, 820, 540, '40, 120, 255'],
    [1450, 860, 360, '0, 210, 160'],
  ] as const) {
    const blob = context.createRadialGradient(x, y, 0, x, y, radius)
    blob.addColorStop(0, `rgba(${color}, 1)`)
    blob.addColorStop(1, `rgba(${color}, 0)`)
    context.fillStyle = blob
    context.fillRect(0, 0, WIDTH, HEIGHT)
  }
}

/**
 * 抖动像素画：把一张图变成有序（Bayer 2×2/4×4/8×8）或随机抖动，双色、三色或多色调色板，像 1-bit 老屏幕或孔版印刷。
 * 图在 Canvas 上现画，交给 Paper 的 ImageDithering；画面在抖动网格下缓慢平移。
 */
export function DitheredImage({ className, style, children, ...props }: DitheredImageProps) {
  const options = { ...defaults, ...props }
  const host = useRef<HTMLDivElement>(null)
  const url = useDrawnImage(
    options.artwork,
    (context) => {
      if (options.artwork === 'still') drawStill(context)
      else if (options.artwork === 'spectrum') drawSpectrum(context)
      else drawLandscape(context)
    },
    { width: WIDTH, height: HEIGHT },
  )
  // 参数每帧都在变：传图片元素而不是地址，免得每帧重新解码。
  const image = useImageElement(url)

  const [pan, setPan] = useState(0)
  useFrameLoop(host, ({ time }) => setPan(Math.sin((time / PERIOD) * Math.PI * 2)), { reducedMotion: 'static', staticTime: 0 })

  return (
    <div ref={host} className={cn('relative isolate overflow-hidden', className)} style={{ background: options.colorBack, ...style }}>
      {image && (
        <ImageDithering
          className="absolute inset-0 -z-10"
          width="100%"
          height="100%"
          image={image}
          fit="cover"
          // 抖动网格固定在屏幕上，底下的图缓慢平移，像素随之闪动。
          scale={1.08 + options.drift}
          offsetX={pan * options.drift * 0.5}
          type={options.type as '8x8'}
          size={options.size}
          colorSteps={options.colorSteps}
          colorBack={options.colorBack}
          colorFront={options.colorFront}
          colorHighlight={options.colorHighlight}
          originalColors={options.originalColors}
          inverted={options.inverted}
        />
      )}
      {children}
    </div>
  )
}
