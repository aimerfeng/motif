// SPDX-License-Identifier: MIT
// Copyright (c) 2023 Jordan-Gilliam
// Source: https://github.com/nolly-studio/cult-ui/blob/ee98a5d/apps/www/registry/default/ui/canvas-fractal-grid.tsx
// Modified by Motif; see the item's provenance.
import { cn, useCanvasSize, useFrameLoop } from '@/lib/motif-runtime'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useRef, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  dotSize: 4,
  spacing: 20,
  dotOpacity: 0.3,
  dotColor: '#6464ff',
  waveRadius: 200,
  intensity: 30,
  glowColor: '#6464ff',
  gradientColors: ['#ffd6a5', '#ffadad', '#ffc6ff', '#a0c4ff', '#bdb2ff', '#9bf6ff'],
  gradientOpacity: 0.22,
  gradientSpeed: 1,
  noise: 0.03,
}
/* @motif:end */

export type DotFieldRippleProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** #rrggbb + alpha → rgba()，替代上游对 "rgba(…, 1)" 字符串的 replace。 */
function rgba(hex: string, alpha: number): string {
  const value = parseInt(hex.replace('#', '').padEnd(6, '0').slice(0, 6), 16)
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${Math.max(0, Math.min(1, alpha))})`
}

/** 上游的三组径向渐变：每组三种颜色，从调色板里轮换取色。 */
const CENTERS = [
  [50, 50],
  [60, 40],
  [40, 60],
] as const

function gradientCss(colors: readonly string[], index: number): string {
  const n = Math.max(1, colors.length)
  const pick = (offset: number) => colors[(index + offset) % n] ?? '#000000'
  const [cx, cy] = CENTERS[index]!
  return `radial-gradient(circle at ${cx}% ${cy}%, ${pick(0)} 0%, ${pick(1)} 25%, ${pick(2)} 50%, transparent 75%)`
}

/** 点阵 + 指针附近的波纹 + 慢慢变换的径向渐变底色 + 可选颗粒。children 叠在最上层。 */
export function DotFieldRipple({ className, style, children, ...props }: DotFieldRippleProps) {
  const options = { ...defaults, ...props }
  const optionsRef = useRef(options)
  optionsRef.current = options

  const reduced = useReducedMotion()
  const noiseId = useId().replace(/:/g, '')
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const layerRefs = useRef<(HTMLDivElement | null)[]>([])
  const mouse = useRef({ x: 0.5, y: 0.5 })
  const lastTime = useRef(0)

  const drawDots = (time: number) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const o = optionsRef.current
    const { width, height, dpr } = size.current
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, width, height)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const cssWidth = width / dpr
    const cssHeight = height / dpr
    // 上游按窗口宽度做响应式缩放，这里按容器宽度。
    const scaleSize = cssWidth < 768 ? 0.75 : cssWidth < 1024 ? 0.9 : 1
    const scaleSpacing = cssWidth < 768 ? 1.5 : cssWidth < 1024 ? 1.25 : 1
    const dotSize = o.dotSize * scaleSize
    const dotSpacing = o.spacing * scaleSpacing

    const cols = Math.ceil(cssWidth / dotSpacing) + 1
    const rows = Math.ceil(cssHeight / dotSpacing) + 1
    const centerX = mouse.current.x * cssWidth
    const centerY = mouse.current.y * cssHeight
    const baseFill = rgba(o.dotColor, o.dotOpacity)
    const glowEnd = rgba(o.glowColor, 0)

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * dotSpacing
        const y = j * dotSpacing
        const distanceX = x - centerX
        const distanceY = y - centerY
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)

        let dotX = x
        let dotY = y

        if (distance < o.waveRadius) {
          const waveStrength = Math.pow(1 - distance / o.waveRadius, 2)
          const angle = Math.atan2(distanceY, distanceX)
          // 上游 time 是毫秒：time * 0.005 = 秒 * 5。
          const waveOffset = Math.sin(distance * 0.05 - time * 5) * o.intensity * waveStrength
          dotX += Math.cos(angle) * waveOffset
          dotY += Math.sin(angle) * waveOffset

          const glowRadius = dotSize * (1 + waveStrength)
          const gradient = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, glowRadius)
          gradient.addColorStop(0, rgba(o.glowColor, o.dotOpacity * (1 + waveStrength)))
          gradient.addColorStop(1, glowEnd)
          ctx.fillStyle = gradient
        } else {
          ctx.fillStyle = baseFill
        }

        ctx.beginPath()
        ctx.arc(dotX, dotY, dotSize / 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  const size = useCanvasSize(canvasRef, { maxDpr: 1.5, onResize: () => drawDots(lastTime.current) })

  /** 上游用 motion 在三组渐变之间往返插值（repeatType: reverse）；这里用三层交叉淡化，由帧循环驱动。 */
  const drawGradient = (time: number) => {
    const o = optionsRef.current
    const duration = 20 / Math.max(0.05, o.gradientSpeed)
    const cycle = (time / duration) % 2
    const p = (cycle <= 1 ? cycle : 2 - cycle) * (CENTERS.length - 1)
    layerRefs.current.forEach((layer, index) => {
      if (layer) layer.style.opacity = String(Math.max(0, 1 - Math.abs(p - index)))
    })
  }

  const placeGlow = () => {
    const glow = glowRef.current
    if (glow) {
      glow.style.left = `${mouse.current.x * 100}%`
      glow.style.top = `${mouse.current.y * 100}%`
    }
  }

  useFrameLoop(
    hostRef,
    ({ time }) => {
      lastTime.current = time
      drawGradient(time)
      drawDots(time)
      placeGlow()
    },
    { reducedMotion: 'static', staticTime: 1.2 },
  )

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const rect = hostRef.current?.getBoundingClientRect()
      if (!rect || rect.width === 0 || rect.height === 0) return
      mouse.current = { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height }
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  const o = options
  return (
    <motion.div
      ref={hostRef}
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      className={cn('relative h-full w-full overflow-hidden', className)}
      style={style}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: o.gradientOpacity }}>
        {CENTERS.map((_, index) => (
          <div
            key={index}
            ref={(node) => {
              layerRefs.current[index] = node
            }}
            className="absolute inset-0 h-full w-full"
            style={{ background: gradientCss(o.gradientColors, index), opacity: index === 0 ? 1 : 0 }}
          />
        ))}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(circle, transparent 40%, var(--background) 100%)' }} />
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 block h-full w-full" />
      {o.noise > 0 && (
        <div aria-hidden className="pointer-events-none absolute inset-0 h-full w-full mix-blend-overlay" style={{ opacity: o.noise }}>
          <svg width="100%" height="100%">
            <filter id={noiseId}>
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter={`url(#${noiseId})`} />
          </svg>
        </div>
      )}
      <div ref={glowRef} aria-hidden className="pointer-events-none absolute" style={{ left: '50%', top: '50%' }}>
        <div
          className="absolute h-40 w-40 rounded-full"
          style={{
            background: `radial-gradient(circle, ${rgba(o.glowColor, 0.2)} 0%, ${rgba(o.glowColor, 0)} 70%)`,
            transform: 'translate(-50%, -50%)',
            filter: 'blur(10px)',
          }}
        />
        <div
          className="absolute h-20 w-20 rounded-full"
          style={{
            background: `radial-gradient(circle, ${rgba(o.glowColor, 0.4)} 0%, ${rgba(o.glowColor, 0)} 70%)`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>
      {children !== undefined && <div className="relative h-full w-full">{children}</div>}
    </motion.div>
  )
}

