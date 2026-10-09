// SPDX-License-Identifier: Apache-2.0
// Paper Shaders (https://shaders.paper.design)
// Built on @paper-design/shaders-react. Parameter ranges and presets adapted from
// https://github.com/paper-design/shaders (43cd68d). Modified by Motif; see the item's provenance.
import { HalftoneCmyk } from '@paper-design/shaders-react'
import { cn, useDrawnImage, useFrameLoop, useImageElement } from '@motif/runtime'
import { useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  scene: 'sun',
  text: 'PRINT',
  type: 'ink',
  size: 0.6,
  contrast: 1,
  softness: 0.5,
  gridNoise: 0.3,
  colorBack: '#fbfaf5',
  colorC: '#00b4ff',
  colorM: '#fc519f',
  colorY: '#ffd800',
  colorK: '#231f20',
  grain: 0,
  drift: 0.06,
}
/* @motif:end */

export type HalftoneCmykPrintProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

const WIDTH = 1600
const HEIGHT = 1000
const TYPE_FONT = '400 420px "Archivo Black"'
/** 缓慢推拉一次的时长（秒）。 */
const PERIOD = 12

/** 海上日出：渐变天空、一轮太阳、海面上一道道倒影。 */
function drawSun(context: CanvasRenderingContext2D) {
  const sky = context.createLinearGradient(0, 0, 0, HEIGHT * 0.62)
  sky.addColorStop(0, '#1d4e89')
  sky.addColorStop(0.55, '#f57a7a')
  sky.addColorStop(1, '#ffd166')
  context.fillStyle = sky
  context.fillRect(0, 0, WIDTH, HEIGHT * 0.62)
  const sea = context.createLinearGradient(0, HEIGHT * 0.62, 0, HEIGHT)
  sea.addColorStop(0, '#2b6c8f')
  sea.addColorStop(1, '#0c2340')
  context.fillStyle = sea
  context.fillRect(0, HEIGHT * 0.62, WIDTH, HEIGHT * 0.38)
  const sun = context.createRadialGradient(800, 560, 40, 800, 560, 260)
  sun.addColorStop(0, '#fff6d5')
  sun.addColorStop(0.7, '#ffc145')
  sun.addColorStop(1, '#ff7b39')
  context.save()
  context.beginPath()
  context.rect(0, 0, WIDTH, HEIGHT * 0.62)
  context.clip()
  context.fillStyle = sun
  context.beginPath()
  context.arc(800, 560, 260, 0, Math.PI * 2)
  context.fill()
  context.restore()
  // 倒影：越往下越短、越淡。
  for (let row = 0; row < 9; row++) {
    const y = HEIGHT * 0.62 + 18 + row * 38
    const half = 240 - row * 22
    context.fillStyle = `rgba(255, 196, 92, ${0.85 - row * 0.08})`
    context.fillRect(800 - half, y, half * 2, 14)
  }
}

/** 色团：浅底上几团柔和的高饱和色彩。 */
function drawBloom(context: CanvasRenderingContext2D) {
  context.fillStyle = '#fff8ef'
  context.fillRect(0, 0, WIDTH, HEIGHT)
  for (const [x, y, radius, color] of [
    [420, 360, 560, '255, 64, 129'],
    [1180, 300, 500, '255, 171, 0'],
    [900, 820, 560, '41, 98, 255'],
    [1480, 880, 380, '0, 200, 150'],
  ] as const) {
    const blob = context.createRadialGradient(x, y, 0, x, y, radius)
    blob.addColorStop(0, `rgba(${color}, 1)`)
    blob.addColorStop(0.6, `rgba(${color}, 0.5)`)
    blob.addColorStop(1, `rgba(${color}, 0)`)
    context.fillStyle = blob
    context.fillRect(0, 0, WIDTH, HEIGHT)
  }
}

/** 大字：一行粗黑体，字里填从品红到黄的渐变，底下压一块青色。 */
function drawType(context: CanvasRenderingContext2D, text: string) {
  context.fillStyle = '#fbfaf5'
  context.fillRect(0, 0, WIDTH, HEIGHT)
  context.fillStyle = '#4fc3f7'
  context.fillRect(0, HEIGHT * 0.58, WIDTH, HEIGHT * 0.42)
  const fill = context.createLinearGradient(0, HEIGHT * 0.25, 0, HEIGHT * 0.75)
  fill.addColorStop(0, '#ff2d87')
  fill.addColorStop(1, '#ffc400')
  context.fillStyle = fill
  context.font = TYPE_FONT
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(text, WIDTH / 2, HEIGHT / 2, WIDTH * 0.72)
}

/**
 * CMYK 半调印刷：画面被分成青、品红、黄、黑四色网点，像放大看的印刷品；画面缓慢推拉，网点随之闪动。
 * 画面在 Canvas 上现画（海上日出、色团或一行大字），交给 Paper 的 HalftoneCmyk。
 */
export function HalftoneCmykPrint({ className, style, children, ...props }: HalftoneCmykPrintProps) {
  const options = { ...defaults, ...props }
  const host = useRef<HTMLDivElement>(null)
  const text = options.text.trim() || 'PRINT'
  const url = useDrawnImage(
    options.scene === 'type' ? `type:${text}` : options.scene,
    (context) => {
      if (options.scene === 'bloom') drawBloom(context)
      else if (options.scene === 'type') drawType(context, text)
      else drawSun(context)
    },
    { width: WIDTH, height: HEIGHT, fonts: options.scene === 'type' ? [TYPE_FONT] : [] },
  )
  // 参数每帧都在变：传图片元素而不是地址，免得每帧重新解码。
  const image = useImageElement(url)

  const [zoom, setZoom] = useState(0)
  useFrameLoop(host, ({ time }) => setZoom(Math.sin((time / PERIOD) * Math.PI * 2)), { reducedMotion: 'static', staticTime: 0 })

  return (
    <div ref={host} className={cn('relative isolate overflow-hidden', className)} style={{ background: options.colorBack, ...style }}>
      {image && (
        <HalftoneCmyk
          className="absolute inset-0 -z-10"
          width="100%"
          height="100%"
          image={image}
          fit="cover"
          // 网点留在原地，底下的画面缓慢推拉、平移。
          scale={1.04 + options.drift * (1 + zoom)}
          offsetX={zoom * options.drift * 0.5}
          type={options.type as 'ink'}
          size={options.size}
          contrast={options.contrast}
          softness={options.softness}
          gridNoise={options.gridNoise}
          colorBack={options.colorBack}
          colorC={options.colorC}
          colorM={options.colorM}
          colorY={options.colorY}
          colorK={options.colorK}
          grainOverlay={options.grain}
          grainSize={0.5}
        />
      )}
      {children}
    </div>
  )
}
