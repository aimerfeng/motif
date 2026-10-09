// SPDX-License-Identifier: Apache-2.0
// Paper Shaders (https://shaders.paper.design)
// Built on @paper-design/shaders-react. Parameter ranges and presets adapted from
// https://github.com/paper-design/shaders (43cd68d). Modified by Motif; see the item's provenance.
import { Water } from '@paper-design/shaders-react'
import { cn, useDrawnImage, usePrefersReducedMotion } from '@/lib/motif-runtime'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  floor: 'tiles',
  tile: '#3fa9c4',
  colorHighlight: '#ffffff',
  caustic: 0.7,
  waves: 0.04,
  highlights: 0.3,
  layering: 0,
  edges: 0,
  size: 3,
  speed: 1,
}
/* @motif:end */

export type PoolWaterProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

const WIDTH = 1600
const HEIGHT = 1000

/** 可复现的伪随机数（mulberry32）：每次画出来的瓷砖深浅都一样。 */
function random(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1, 7), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

/** 在主色基础上提亮（amount > 0）或压暗（amount < 0）。 */
function shade([r, g, b]: [number, number, number], amount: number): string {
  const mix = (channel: number) => Math.round(amount >= 0 ? channel + (255 - channel) * amount : channel * (1 + amount))
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`
}

/** 泳池瓷砖：方砖、浅色勾缝，砖块深浅略有差别，中间一条深色泳道线（两端是 T 字）。 */
function drawTiles(context: CanvasRenderingContext2D, color: [number, number, number]) {
  const next = random(7)
  const tile = 50
  context.fillStyle = shade(color, 0.38)
  context.fillRect(0, 0, WIDTH, HEIGHT)
  for (let y = 0; y < HEIGHT; y += tile) {
    for (let x = 0; x < WIDTH; x += tile) {
      context.fillStyle = shade(color, (next() - 0.5) * 0.16)
      context.fillRect(x + 2, y + 2, tile - 4, tile - 4)
    }
  }
  const lane = shade(color, -0.62)
  context.fillStyle = lane
  context.fillRect(tile * 3, HEIGHT / 2 - tile / 2 + 2, WIDTH - tile * 6, tile - 4)
  context.fillRect(tile * 3, HEIGHT / 2 - tile * 2 + 2, tile - 4, tile * 4 - 4)
  context.fillRect(WIDTH - tile * 4 + 2, HEIGHT / 2 - tile * 2 + 2, tile - 4, tile * 4 - 4)
}

/** 马赛克：小方块从浅到深的渐变，夹着随机的亮块。 */
function drawMosaic(context: CanvasRenderingContext2D, color: [number, number, number]) {
  const next = random(11)
  const tile = 22
  context.fillStyle = shade(color, 0.6)
  context.fillRect(0, 0, WIDTH, HEIGHT)
  for (let y = 0; y < HEIGHT; y += tile) {
    for (let x = 0; x < WIDTH; x += tile) {
      const depth = y / HEIGHT
      const sparkle = next() < 0.06 ? 0.45 : 0
      context.fillStyle = shade(color, 0.25 - depth * 0.55 + (next() - 0.5) * 0.22 + sparkle)
      context.fillRect(x + 1.5, y + 1.5, tile - 3, tile - 3)
    }
  }
}

const FLOORS: Record<string, (context: CanvasRenderingContext2D, color: [number, number, number]) => void> = { tiles: drawTiles, mosaic: drawMosaic }

/**
 * 透过水面看池底：焦散光斑在池底游走，水波让底下的图案轻轻晃动。
 * 池底（泳池瓷砖或马赛克）在 Canvas 上现画，交给 Paper 的 Water 着色器。
 */
export function PoolWater({ className, style, children, ...props }: PoolWaterProps) {
  const options = { ...defaults, ...props }
  const reducedMotion = usePrefersReducedMotion()
  const draw = FLOORS[options.floor] ?? drawTiles

  const image = useDrawnImage(`${options.floor}|${options.tile}`, (context) => draw(context, hexToRgb(options.tile)), { width: WIDTH, height: HEIGHT })

  return (
    <div className={cn('relative isolate overflow-hidden', className)} style={{ background: shade(hexToRgb(options.tile), -0.5), ...style }}>
      {image && (
        <Water
          className="absolute inset-0 -z-10"
          width="100%"
          height="100%"
          image={image}
          fit="cover"
          // 放大一点：水波会把图片边缘拉进画面，边缘留在视口之外。
          scale={1.5}
          colorBack="#00000000"
          colorHighlight={options.colorHighlight}
          caustic={options.caustic}
          waves={options.waves}
          highlights={options.highlights}
          layering={options.layering}
          edges={options.edges}
          size={options.size}
          // 减少动态效果时停在一帧好看的静态画面上。
          speed={reducedMotion ? 0 : options.speed}
          frame={reducedMotion ? 3000 : 0}
        />
      )}
      {children}
    </div>
  )
}
