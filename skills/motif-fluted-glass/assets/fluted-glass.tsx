// SPDX-License-Identifier: Apache-2.0
// Paper Shaders (https://shaders.paper.design)
// Built on @paper-design/shaders-react. Parameter ranges and presets adapted from
// https://github.com/paper-design/shaders (43cd68d). Modified by Motif; see the item's provenance.
import { FlutedGlass } from '@paper-design/shaders-react'
import { cn, useDrawnImage, useFrameLoop, useImageElement } from '@/lib/motif-runtime'
import { useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  scene: 'sunset',
  text: 'Reeded',
  shape: 'lines',
  distortionShape: 'prism',
  size: 0.5,
  distortion: 0.5,
  angle: 0,
  blur: 0,
  edges: 0.25,
  shadows: 0.25,
  highlights: 0.1,
  drift: 0.08,
}
/* @motif:end */

export type FlutedGlassPanelProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

const WIDTH = 1600
const HEIGHT = 1000
const TYPE_FONT = '400 380px "Instrument Serif"'
/** 画面在玻璃后面来回移动一次的时长（秒）。 */
const PERIOD = 12

/** 日落：暖色天空、一轮大太阳、两层深色山影。 */
function drawSunset(context: CanvasRenderingContext2D) {
  const sky = context.createLinearGradient(0, 0, 0, HEIGHT)
  sky.addColorStop(0, '#ffd6a5')
  sky.addColorStop(0.45, '#ff8a5c')
  sky.addColorStop(0.75, '#c2457a')
  sky.addColorStop(1, '#43275f')
  context.fillStyle = sky
  context.fillRect(0, 0, WIDTH, HEIGHT)
  const glow = context.createRadialGradient(1000, 520, 120, 1000, 520, 520)
  glow.addColorStop(0, 'rgba(255, 236, 190, 0.9)')
  glow.addColorStop(1, 'rgba(255, 236, 190, 0)')
  context.fillStyle = glow
  context.fillRect(0, 0, WIDTH, HEIGHT)
  context.fillStyle = '#fff1c9'
  context.beginPath()
  context.arc(1000, 520, 190, 0, Math.PI * 2)
  context.fill()
  for (const [color, base, amplitude, phase] of [
    ['#5b2a62', 700, 70, 0.4],
    ['#2a1838', 820, 50, 2.1],
  ] as const) {
    context.fillStyle = color
    context.beginPath()
    context.moveTo(0, HEIGHT)
    for (let x = 0; x <= WIDTH; x += 20) context.lineTo(x, base - Math.sin(x * 0.0032 + phase) * amplitude - Math.sin(x * 0.009 + phase * 2) * amplitude * 0.3)
    context.lineTo(WIDTH, HEIGHT)
    context.fill()
  }
}

/** 色团：奶白底上几团柔和的高饱和色彩。 */
function drawBloom(context: CanvasRenderingContext2D) {
  context.fillStyle = '#f4eee6'
  context.fillRect(0, 0, WIDTH, HEIGHT)
  for (const [x, y, radius, color] of [
    [430, 380, 520, '255, 79, 163'],
    [1150, 330, 470, '255, 157, 46'],
    [860, 800, 520, '61, 107, 255'],
    [1450, 860, 360, '0, 196, 160'],
  ] as const) {
    const blob = context.createRadialGradient(x, y, 0, x, y, radius)
    blob.addColorStop(0, `rgba(${color}, 0.95)`)
    blob.addColorStop(0.55, `rgba(${color}, 0.55)`)
    blob.addColorStop(1, `rgba(${color}, 0)`)
    context.fillStyle = blob
    context.fillRect(0, 0, WIDTH, HEIGHT)
  }
}

/** 大字：纸色底、一个橙色圆、一行巨大的衬线字。 */
function drawType(context: CanvasRenderingContext2D, text: string) {
  context.fillStyle = '#efe8dc'
  context.fillRect(0, 0, WIDTH, HEIGHT)
  context.fillStyle = '#ff5a36'
  context.beginPath()
  context.arc(1120, 430, 250, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = '#16120e'
  context.font = TYPE_FONT
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  // 留出余量：画面放大、左右移动时字不会被切掉。
  context.fillText(text, WIDTH / 2, HEIGHT / 2 + 20, WIDTH * 0.7)
}

/**
 * 凹槽玻璃：一块带竖向凹槽的玻璃，后面的画面被切成一条条折射。画面在玻璃后面缓慢地左右移动。
 * 画面在 Canvas 上现画（日落、色团或一行大字），交给 Paper 的 FlutedGlass。
 */
export function FlutedGlassPanel({ className, style, children, ...props }: FlutedGlassPanelProps) {
  const options = { ...defaults, ...props }
  const host = useRef<HTMLDivElement>(null)
  const text = options.text.trim() || 'Reeded'
  const url = useDrawnImage(
    options.scene === 'type' ? `type:${text}` : options.scene,
    (context) => {
      if (options.scene === 'bloom') drawBloom(context)
      else if (options.scene === 'type') drawType(context, text)
      else drawSunset(context)
    },
    { width: WIDTH, height: HEIGHT, fonts: options.scene === 'type' ? [TYPE_FONT] : [] },
  )
  // 参数每帧都在变：传图片元素而不是地址，免得每帧重新解码。
  const image = useImageElement(url)

  const [offset, setOffset] = useState(0)
  useFrameLoop(host, ({ time }) => setOffset(Math.sin((time / PERIOD) * Math.PI * 2) * options.drift), { reducedMotion: 'static', staticTime: 0 })

  return (
    <div ref={host} className={cn('relative isolate overflow-hidden bg-[#1a1420]', className)} style={style}>
      {image && (
        <FlutedGlass
          className="absolute inset-0 -z-10"
          width="100%"
          height="100%"
          image={image}
          fit="cover"
          // 放大一点：凹槽的折射和左右移动都会把图片边缘带进画面。
          scale={1.08 + options.drift * 1.6}
          offsetX={offset}
          colorBack="#00000000"
          colorShadow="#000000"
          colorHighlight="#ffffff"
          shape={options.shape as 'lines'}
          distortionShape={options.distortionShape as 'prism'}
          size={options.size}
          distortion={options.distortion}
          angle={options.angle}
          blur={options.blur}
          edges={options.edges}
          shadows={options.shadows}
          highlights={options.highlights}
        />
      )}
      {children}
    </div>
  )
}
