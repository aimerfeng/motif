// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Meng To
// Source: https://github.com/MengTo/threeui/blob/68802d5/src/shaders/condensation/CondensationBackground.tsx
// Modified by Motif; see the item's provenance.
import { cn, useCanvasSize, useFrameLoop } from '@/lib/motif-runtime'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { createCondensationRenderer } from './condensation-renderer'

/* @motif:defaults */
export const defaults = {
  speed: 1,
  gravity: 0.075,
  dropAmount: 1,
  maxRadius: 4.4,
  bubbleTint: '#608bc4',
  opacity: 1,
  splashRings: true,
}
/* @motif:end */

export type CondensationProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

type Renderer = ReturnType<typeof createCondensationRenderer>

/** 透明玻璃上的凝露：水珠生长、合并、下滑，在底边溅出小涟漪。 */
export function Condensation({ className, style, children, ...props }: CondensationProps) {
  const options = { ...defaults, ...props }
  const optionsRef = useRef(options)
  optionsRef.current = options

  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<Renderer | null>(null)

  const size = useCanvasSize(canvasRef, {
    maxDpr: 2,
    onResize: ({ width, height, dpr }) => {
      const renderer = rendererRef.current
      if (!renderer) return
      renderer.resize(width, height, dpr)
      renderer.render(0)
    },
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const renderer = createCondensationRenderer(canvas, () => optionsRef.current)
    rendererRef.current = renderer
    const { width, height, dpr } = size.current
    renderer.resize(width, height, dpr)
    renderer.render(0)
    return () => {
      rendererRef.current = null
      renderer.dispose()
    }
  }, [size])

  useFrameLoop(hostRef, ({ delta }) => rendererRef.current?.render(delta * 1000), {
    speed: options.speed,
    reducedMotion: 'static',
    staticTime: 0,
  })

  return (
    <div ref={hostRef} className={cn('relative isolate overflow-hidden', className)} style={{ background: 'transparent', ...style }}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 block h-full w-full"
        style={{ opacity: options.opacity }}
      />
      {children}
    </div>
  )
}
