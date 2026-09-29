// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Meng To
// Source: https://github.com/MengTo/threeui/blob/68802d5/src/shaders/typography-vortex/TypographyVortexCanvas.tsx
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop, usePrefersReducedMotion } from '@motif/runtime'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { createTypographyVortexRenderer } from './vortex-renderer'

/* @motif:defaults */
export const defaults = {
  phrase: 'MOTIF / DESIGN IN MOTION / ',
  mode: 'dark',
  speed: 1,
  ringGrowth: 1.21,
  opacity: 1,
  dissolveRadius: 1,
  particleAmount: 1,
  suctionDuration: 920,
}
/* @motif:end */

export type TypographyVortexProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 一圈圈旋转的文字环，指针经过时溶解成尘埃，点击时被吸向一点。 */
export function TypographyVortex({ className, style, children, ...props }: TypographyVortexProps) {
  const reduced = usePrefersReducedMotion()
  const options = { ...defaults, ...props }
  const optionsRef = useRef({ ...options, mode: options.mode === 'light' ? ('light' as const) : ('dark' as const), reduced })
  optionsRef.current = { ...options, mode: options.mode === 'light' ? 'light' : 'dark', reduced }

  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<ReturnType<typeof createTypographyVortexRenderer> | null>(null)

  useEffect(() => {
    const renderer = createTypographyVortexRenderer(hostRef.current!, canvasRef.current!, () => optionsRef.current)
    rendererRef.current = renderer
    return () => {
      rendererRef.current = null
      renderer.dispose()
    }
  }, [])

  // 速度只作用于环的旋转（渲染器内部乘 speed），粒子按真实时间运动，所以循环本身不变速。
  useFrameLoop(hostRef, ({ time }) => rendererRef.current?.render(time * 1000), { reducedMotion: 'static', staticTime: 6 })

  return (
    <div ref={hostRef} className={cn('relative isolate overflow-hidden', className)} style={style}>
      <canvas ref={canvasRef} role="img" aria-label={options.phrase} className="absolute inset-0 -z-10 block h-full w-full" />
      {children}
    </div>
  )
}
