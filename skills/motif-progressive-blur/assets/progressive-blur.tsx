// SPDX-License-Identifier: MIT
// Copyright (c) 2024 ibelick
// Source: https://github.com/ibelick/motion-primitives/blob/120f64f/components/core/progressive-blur.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { type HTMLMotionProps, motion } from 'motion/react'
import type { CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  direction: 'bottom',
  blurIntensity: 0.5,
  blurLayers: 8,
  extent: 75,
}
/* @motif:end */

export const GRADIENT_ANGLES = {
  top: 0,
  right: 90,
  bottom: 180,
  left: 270,
}

type Direction = keyof typeof GRADIENT_ANGLES

// extent 是模糊区域沿方向所占的比例（%），区域贴在该方向的边缘。
const EDGE: Record<Direction, (extent: number) => CSSProperties> = {
  top: (e) => ({ position: 'absolute', top: 0, left: 0, width: '100%', height: `${e}%` }),
  bottom: (e) => ({ position: 'absolute', bottom: 0, left: 0, width: '100%', height: `${e}%` }),
  left: (e) => ({ position: 'absolute', top: 0, left: 0, height: '100%', width: `${e}%` }),
  right: (e) => ({ position: 'absolute', top: 0, right: 0, height: '100%', width: `${e}%` }),
}

type Options = {
  direction: Direction
  blurLayers: number
  blurIntensity: number
  extent: number
}

export type ProgressiveBlurProps = Partial<Options> & {
  className?: string
  style?: CSSProperties
} & Omit<HTMLMotionProps<'div'>, 'style' | keyof Options>

export function ProgressiveBlur({ className, style, ...rest }: ProgressiveBlurProps) {
  const { direction, blurLayers, blurIntensity, extent, ...props } = { ...defaults, ...rest } as Options &
    Omit<HTMLMotionProps<'div'>, 'style' | keyof Options>
  const layers = Math.max(blurLayers, 2)
  const segmentSize = 1 / (blurLayers + 1)

  return (
    <div className={cn('pointer-events-none', className)} style={{ ...EDGE[direction](extent), ...style }}>
      {Array.from({ length: layers }).map((_, index) => {
        const angle = GRADIENT_ANGLES[direction]
        const gradientStops = [index * segmentSize, (index + 1) * segmentSize, (index + 2) * segmentSize, (index + 3) * segmentSize].map(
          (pos, posIndex) => `rgba(255, 255, 255, ${posIndex === 1 || posIndex === 2 ? 1 : 0}) ${pos * 100}%`,
        )

        const gradient = `linear-gradient(${angle}deg, ${gradientStops.join(', ')})`

        return (
          <motion.div
            key={index}
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            style={{
              maskImage: gradient,
              WebkitMaskImage: gradient,
              backdropFilter: `blur(${index * blurIntensity}px)`,
              WebkitBackdropFilter: `blur(${index * blurIntensity}px)`,
            }}
            {...props}
          />
        )
      })}
    </div>
  )
}
