// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Eduardo Calvo
// Source: https://github.com/educlopez/smoothui/blob/b6312bc/packages/smoothui/components/svg-clip-mask/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import { type CSSProperties, type ReactNode, type RefObject, useEffect, useId, useRef, useState } from 'react'

/* @motif:defaults */
export const defaults = {
  shape: 'blob',
  animate: 'morph',
  duration: 4,
  ease: [0.645, 0.045, 0.355, 1],
}
/* @motif:end */

/** Motion scroll offset tuple, typed from `useScroll` itself. */
export type ScrollOffset = NonNullable<Parameters<typeof useScroll>[0]>['offset']

const TRANSITION_DURATION = 0.3
// The mask has to finish opening while the frame is still in view; the full
// enter-to-exit range parks the fully-revealed state off-screen.
const DEFAULT_SCROLL_OFFSET: ScrollOffset = ['start 0.9', 'end 0.6']

const PRESET_PATHS = {
  arch: 'M0,1 L0,0.4 C0,0.18 0.18,0 0.5,0 C0.82,0 1,0.18 1,0.4 L1,1 Z',
  blob: 'M0.5,0.02 C0.75,0.02 0.98,0.25 0.98,0.5 C0.98,0.75 0.75,0.98 0.5,0.98 C0.25,0.98 0.02,0.75 0.02,0.5 C0.02,0.25 0.25,0.02 0.5,0.02 Z',
  diamond: 'M0.5,0 L1,0.5 L0.5,1 L0,0.5 Z',
  wave: 'M0,0.3 C0.25,0.05 0.75,0.55 1,0.3 L1,1 L0,1 Z',
} as const

/**
 * Built-in morph sets, one per preset shape. Every path in a set keeps the
 * command structure of its preset so the browser interpolates the numbers
 * instead of snapping. The blob and wave sets come from the upstream demo.
 */
const MORPH_SETS: Record<keyof typeof PRESET_PATHS, string[]> = {
  blob: [
    PRESET_PATHS.blob,
    'M0.5,0.1 C0.85,0.05 0.95,0.35 0.9,0.55 C0.95,0.85 0.65,0.95 0.5,0.9 C0.15,0.98 0.05,0.65 0.1,0.45 C0.05,0.15 0.35,0.05 0.5,0.1 Z',
    'M0.55,0.04 C0.8,0.1 0.92,0.3 0.96,0.52 C0.9,0.8 0.7,0.94 0.46,0.96 C0.2,0.9 0.06,0.7 0.04,0.48 C0.1,0.2 0.3,0.02 0.55,0.04 Z',
  ],
  arch: [
    PRESET_PATHS.arch,
    'M0,1 L0,0.55 C0,0.3 0.22,0.1 0.5,0.1 C0.78,0.1 1,0.3 1,0.55 L1,1 Z',
    'M0,1 L0,0.3 C0.05,0.1 0.3,0 0.6,0.02 C0.85,0.04 1,0.25 1,0.48 L1,1 Z',
  ],
  diamond: [PRESET_PATHS.diamond, 'M0.62,0 L1,0.62 L0.38,1 L0,0.38 Z', 'M0.5,0.08 L0.92,0.5 L0.5,0.92 L0.08,0.5 Z', 'M0.38,0 L1,0.38 L0.62,1 L0,0.62 Z'],
  wave: [
    'M0,0.42 C0.25,0.00 0.75,0.72 1,0.36 L1,1 L0,1 Z',
    'M0,0.10 C0.25,0.70 0.75,0.04 1,0.58 L1,1 L0,1 Z',
    'M0,0.55 C0.25,0.08 0.75,0.66 1,0.06 L1,1 L0,1 Z',
    'M0,0.06 C0.25,0.62 0.75,0.00 1,0.48 L1,1 L0,1 Z',
    'M0,0.48 C0.25,0.02 0.75,0.60 1,0.20 L1,1 L0,1 Z',
  ],
}

export type SvgClipMaskShape = 'blob' | 'arch' | 'diamond' | 'wave' | 'custom'
export type SvgClipMaskAnimate = 'none' | 'morph' | 'scroll' | 'hover'

export type ShapeMaskMorphProps = Partial<typeof defaults> & {
  /**
   * "morph" cycles through morphPaths forever, "scroll" steps through them as
   * the container scrolls, "hover" swaps to morphPaths[1] on hover.
   */
  animate?: SvgClipMaskAnimate | string
  children?: ReactNode
  className?: string
  style?: CSSProperties
  /** Ref to a scrollable ancestor that drives "scroll" mode instead of the window. */
  container?: RefObject<HTMLElement | null>
  /** Seconds for one full "morph" loop. */
  duration?: number
  /** cubic-bezier control points for every transition. */
  ease?: number[]
  /**
   * Paths to cycle between for "morph"/"scroll"/"hover". They must all share
   * the same command structure (same sequence of M/L/C/Z and point counts).
   * Defaults to the built-in set for the chosen shape.
   */
  morphPaths?: string[]
  /** Custom path data, in objectBoundingBox (0..1) coordinates. Required when shape is "custom". */
  path?: string
  shape?: SvgClipMaskShape | string
}

const useHoverCapable = (enabled: boolean) => {
  const [isHoverCapable, setIsHoverCapable] = useState(false)

  useEffect(() => {
    if (!enabled) return
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
    setIsHoverCapable(mediaQuery.matches)
    const handleChange = (event: MediaQueryListEvent) => setIsHoverCapable(event.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [enabled])

  return isHoverCapable
}

export function ShapeMaskMorph({ children, path, morphPaths, container, className, style, ...props }: ShapeMaskMorphProps) {
  const { shape, animate, duration, ease } = { ...defaults, ...props } as Required<Pick<ShapeMaskMorphProps, 'shape' | 'animate' | 'duration' | 'ease'>>
  const clipId = useId().replace(/:/g, '')
  const shouldReduceMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const isHoverCapable = useHoverCapable(animate === 'hover')
  const [isHovered, setIsHovered] = useState(false)
  const [scrollIndex, setScrollIndex] = useState(0)
  const easeMove = ease as [number, number, number, number]

  const presetKey = (shape in PRESET_PATHS ? shape : 'blob') as keyof typeof PRESET_PATHS
  const basePath = shape === 'custom' ? (path ?? PRESET_PATHS.blob) : PRESET_PATHS[presetKey]
  const fallbackSet = shape === 'custom' ? [basePath] : MORPH_SETS[presetKey]
  const paths = morphPaths && morphPaths.length > 1 ? morphPaths : fallbackSet

  const { scrollYProgress } = useScroll({ container, offset: DEFAULT_SCROLL_OFFSET, target: ref })

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    if (shouldReduceMotion || animate !== 'scroll' || paths.length < 2) return
    const index = Math.min(paths.length - 1, Math.floor(value * paths.length))
    setScrollIndex(index)
  })

  const isMorphing = animate === 'morph' && !shouldReduceMotion && paths.length > 1

  const activeD = (() => {
    if (shouldReduceMotion || animate === 'none' || isMorphing) return paths[0]
    if (animate === 'scroll') return paths[scrollIndex] ?? paths[0]
    if (animate === 'hover') return isHoverCapable && isHovered ? (paths[1] ?? paths[0]) : paths[0]
    return paths[0]
  })()

  return (
    <div
      className={cn('relative', className)}
      style={style}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      ref={ref}
    >
      <svg aria-hidden="true" className="absolute h-0 w-0">
        <defs>
          <clipPath clipPathUnits="objectBoundingBox" id={clipId}>
            <motion.path
              // Closing the loop on the first path keeps the repeat seamless.
              key={isMorphing ? `morph-${paths.join('|')}` : 'static'}
              animate={isMorphing ? { d: [...paths, paths[0]!] } : { d: activeD }}
              // initial={false} would skip the mount animation, so the loop starts from the first path.
              initial={isMorphing ? { d: paths[0] } : false}
              transition={
                isMorphing
                  ? { duration, ease: easeMove, repeat: Number.POSITIVE_INFINITY, repeatType: 'loop' }
                  : { duration: TRANSITION_DURATION, ease: easeMove }
              }
            />
          </clipPath>
        </defs>
      </svg>
      <div className="h-full w-full" style={{ clipPath: `url(#${clipId})`, WebkitClipPath: `url(#${clipId})` }}>
        {children}
      </div>
    </div>
  )
}

export default ShapeMaskMorph
