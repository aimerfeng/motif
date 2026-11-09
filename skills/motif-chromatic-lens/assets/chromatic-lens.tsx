// SPDX-License-Identifier: Apache-2.0
// Paper Shaders (https://shaders.paper.design)
// Source: https://github.com/paper-design/shaders (43cd68d). Built on @paper-design/shaders-react;
// parameter ranges and presets from lens-distortion. Modified by Motif; see the item's provenance.
import { LensDistortion } from '@paper-design/shaders-react'
import { cn, useDrawnImage, useFrameLoop, useImageElement } from '@/lib/motif-runtime'
import { useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  artwork: 'poster',
  spread: 0.6,
  angle: 0,
  perspective: 0.1,
  count: 35,
  dispersion: 1,
  swirl: 0.35,
  lensBulge: 0,
  lensCircle: 0,
  noise: 0,
  pan: 0.12,
}
/* @motif:end */

export type ChromaticLensProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

const WIDTH = 1200
const HEIGHT = 1200
/** 海报在镜头后面来回平移一次的时长（秒）。 */
const PERIOD = 12

/** 海报：深色底、几何色块和条纹，适合看色散。 */
function drawPoster(context: CanvasRenderingContext2D) {
  context.fillStyle = '#101018'
  context.fillRect(0, 0, WIDTH, HEIGHT)
  context.fillStyle = '#f2ede3'
  for (let i = 0; i < 9; i++) context.fillRect(120 + i * 110, 120, 40, 360)
  context.fillStyle = '#ff4f3a'
  context.beginPath()
  context.arc(760, 700, 300, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = '#f2ede3'
  context.beginPath()
  context.arc(760, 700, 140, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = '#2f5bff'
  context.fillRect(140, 620, 320, 460)
  context.fillStyle = '#ffd23f'
  context.beginPath()
  context.moveTo(140, 1080)
  context.lineTo(460, 620)
  context.lineTo(460, 1080)
  context.fill()
}

/** 日出：渐变天空、白色太阳、水面横纹。 */
function drawSunrise(context: CanvasRenderingContext2D) {
  const sky = context.createLinearGradient(0, 0, 0, HEIGHT)
  sky.addColorStop(0, '#1b1446')
  sky.addColorStop(0.5, '#e8507a')
  sky.addColorStop(0.62, '#ffb35c')
  sky.addColorStop(1, '#2a1240')
  context.fillStyle = sky
  context.fillRect(0, 0, WIDTH, HEIGHT)
  context.fillStyle = '#fff4d6'
  context.beginPath()
  context.arc(WIDTH / 2, 640, 220, Math.PI, 0)
  context.fill()
  context.fillStyle = '#ffe0a8'
  for (let i = 0; i < 10; i++) {
    const y = 680 + i * 46
    const half = 260 - i * 22
    context.fillRect(WIDTH / 2 - half, y, half * 2, 10 + i)
  }
}

/**
 * 色散镜头：把画面拆成一层层光谱色的残影，并像鱼眼或枕形镜头那样弯曲它；
 * 海报在镜头后缓慢平移。画面在 Canvas 上现画，交给 Paper 的 LensDistortion。
 */
export function ChromaticLens({ className, style, children, ...props }: ChromaticLensProps) {
  const options = { ...defaults, ...props }
  const host = useRef<HTMLDivElement>(null)
  const url = useDrawnImage(
    options.artwork,
    (context) => {
      if (options.artwork === 'sunrise') drawSunrise(context)
      else drawPoster(context)
    },
    { width: WIDTH, height: HEIGHT },
  )
  // 参数每帧都在变：传图片元素而不是地址，免得每帧重新解码。
  const image = useImageElement(url)

  const [imageX, setImageX] = useState(0)
  useFrameLoop(host, ({ time }) => setImageX(Math.sin((time / PERIOD) * Math.PI * 2) * options.pan), { reducedMotion: 'static', staticTime: 0 })

  return (
    <div ref={host} className={cn('relative isolate overflow-hidden bg-[#08080c]', className)} style={style}>
      {image && (
        <LensDistortion
          className="absolute inset-0 -z-10"
          width="100%"
          height="100%"
          image={image}
          fit="cover"
          imageX={imageX}
          spread={options.spread}
          angle={options.angle}
          perspective={options.perspective}
          count={Math.round(options.count)}
          dispersion={options.dispersion}
          swirl={options.swirl}
          lensBulge={options.lensBulge}
          lensCircle={options.lensCircle}
          noise={options.noise}
        />
      )}
      {children}
    </div>
  )
}
