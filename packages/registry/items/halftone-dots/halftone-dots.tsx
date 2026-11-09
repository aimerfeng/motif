// SPDX-License-Identifier: Apache-2.0
// Paper Shaders (https://shaders.paper.design)
// Source: https://github.com/paper-design/shaders/blob/43cd68d/packages/shaders-react/src/shaders/halftone-dots.tsx
// Modified by Motif; see the item's provenance.
import { HalftoneDots } from '@paper-design/shaders-react'
import { cn, useDrawnImage, useFrameLoop, useImageElement } from '@motif/runtime'
import { useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  artwork: 'orb',
  type: 'gooey',
  grid: 'hex',
  size: 0.5,
  radius: 1.25,
  contrast: 0.4,
  grainMixer: 0.2,
  colorFront: '#2b2b2b',
  colorBack: '#f2f1e8',
  originalColors: false,
}
/* @motif:end */

export type HalftoneDotsImageProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

const WIDTH = 1600
const HEIGHT = 1000
const TYPE_FONT = '400 460px "Archivo Black"'
/** 缓慢推拉一次的时长（秒）。 */
const PERIOD = 12

/** 光球：渐变背景上一颗侧光照亮的球，明暗过渡平滑。 */
function drawOrb(context: CanvasRenderingContext2D) {
  const back = context.createLinearGradient(0, 0, WIDTH, HEIGHT)
  back.addColorStop(0, '#e0e0e0')
  back.addColorStop(1, '#6a6a6a')
  context.fillStyle = back
  context.fillRect(0, 0, WIDTH, HEIGHT)
  const orb = context.createRadialGradient(660, 360, 30, 800, 500, 400)
  orb.addColorStop(0, '#ffffff')
  orb.addColorStop(0.5, '#8a8a8a')
  orb.addColorStop(1, '#101010')
  context.fillStyle = orb
  context.beginPath()
  context.arc(800, 500, 380, 0, Math.PI * 2)
  context.fill()
}

/** 沙丘：几层起伏的山脊，从浅到深，配一轮暖色太阳。 */
function drawDunes(context: CanvasRenderingContext2D) {
  const sky = context.createLinearGradient(0, 0, 0, HEIGHT)
  sky.addColorStop(0, '#2b4a7a')
  sky.addColorStop(0.6, '#f0a868')
  context.fillStyle = sky
  context.fillRect(0, 0, WIDTH, HEIGHT)
  context.fillStyle = '#ffe9b0'
  context.beginPath()
  context.arc(1080, 420, 170, 0, Math.PI * 2)
  context.fill()
  const layers = ['#d9824a', '#a8513a', '#6b2f2c', '#2a1520']
  layers.forEach((color, index) => {
    const base = 520 + index * 130
    context.fillStyle = color
    context.beginPath()
    context.moveTo(0, HEIGHT)
    for (let x = 0; x <= WIDTH; x += 40) {
      context.lineTo(x, base + Math.sin(x / (260 + index * 60) + index * 1.7) * (70 - index * 10))
    }
    context.lineTo(WIDTH, HEIGHT)
    context.closePath()
    context.fill()
  })
}

/** 大字：浅底上一行粗黑体，字里是从黑到灰的渐变。 */
function drawType(context: CanvasRenderingContext2D) {
  context.fillStyle = '#f4f4f4'
  context.fillRect(0, 0, WIDTH, HEIGHT)
  const fill = context.createLinearGradient(0, HEIGHT * 0.25, 0, HEIGHT * 0.75)
  fill.addColorStop(0, '#000000')
  fill.addColorStop(1, '#7a7a7a')
  context.fillStyle = fill
  context.font = TYPE_FONT
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText('DOTS', WIDTH / 2, HEIGHT / 2, WIDTH * 0.8)
}

/**
 * 网点印刷：用一种油墨把画面重新印成网点（经典、粘连、孔洞、柔光），排在方格或蜂窝网格上。
 * 画面在 Canvas 上现画，交给 Paper 的 HalftoneDots；画面在网点下缓慢推拉。
 */
export function HalftoneDotsImage({ className, style, children, ...props }: HalftoneDotsImageProps) {
  const options = { ...defaults, ...props }
  const host = useRef<HTMLDivElement>(null)
  const url = useDrawnImage(
    options.artwork,
    (context) => {
      if (options.artwork === 'dunes') drawDunes(context)
      else if (options.artwork === 'type') drawType(context)
      else drawOrb(context)
    },
    { width: WIDTH, height: HEIGHT, fonts: options.artwork === 'type' ? [TYPE_FONT] : [] },
  )
  // 参数每帧都在变：传图片元素而不是地址，免得每帧重新解码。
  const image = useImageElement(url)

  const [zoom, setZoom] = useState(0)
  useFrameLoop(host, ({ time }) => setZoom(Math.sin((time / PERIOD) * Math.PI * 2)), { reducedMotion: 'static', staticTime: 0 })

  return (
    <div ref={host} className={cn('relative isolate overflow-hidden', className)} style={{ background: options.colorBack, ...style }}>
      {image && (
        <HalftoneDots
          className="absolute inset-0 -z-10"
          width="100%"
          height="100%"
          image={image}
          fit="cover"
          // 网点留在原地，底下的画面缓慢推拉、平移。
          scale={1.1 + 0.08 * (1 + zoom)}
          offsetX={zoom * 0.04}
          type={options.type as 'gooey'}
          grid={options.grid as 'hex'}
          size={options.size}
          radius={options.radius}
          contrast={options.contrast}
          originalColors={options.originalColors}
          grainMixer={options.grainMixer}
          grainOverlay={0.2}
          grainSize={0.5}
          colorFront={options.colorFront}
          colorBack={options.colorBack}
        />
      )}
      {children}
    </div>
  )
}
