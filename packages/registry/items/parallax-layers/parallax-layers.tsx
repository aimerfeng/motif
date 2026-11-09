// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Eduardo Calvo
// Source: https://github.com/educlopez/smoothui/blob/b6312bc/packages/smoothui/components/parallax-layers/index.tsx
// Modified by Motif; see the item's provenance.
import {
  type MotionValue,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { type CSSProperties, type ReactNode, type RefObject, useEffect, useRef, useState } from 'react'
import { cn } from '@motif/runtime'

/* @motif:defaults */
export const defaults = {
  range: 80,
  direction: 'vertical',
  pointerParallax: true,
  pointerStrength: 20,
  palette: ['#141a3d', '#f4a37c', '#8a5f8f', '#4b3768', '#1a1230'],
  layerCount: 4,
  haze: 0.5,
}
/* @motif:end */

/** Motion scroll offset tuple, typed from `useScroll` itself. */
export type ScrollOffset = NonNullable<Parameters<typeof useScroll>[0]>['offset']

const SCROLL_SPRING_CONFIG = {
  damping: 30,
  mass: 0.5,
  stiffness: 200,
} as const
const POINTER_SPRING_CONFIG = {
  damping: 20,
  mass: 0.3,
  stiffness: 150,
} as const
// Concentrated on the stretch where the scene is actually on screen: over the
// full enter-to-exit range most of the layer separation is spent off-view.
const DEFAULT_OFFSET: ScrollOffset = ['start 0.95', 'end 0.6']
const CENTER_RATIO = 0.5

export type ParallaxDirection = 'vertical' | 'horizontal' | 'both'

export interface ParallaxLayer {
  /** Optional blur, in pixels, applied to this layer for extra depth. */
  blur?: number
  content: ReactNode
  /** 0 (no movement) to 1 (maximum movement). */
  depth: number
  id: string
  opacity?: number
}

export type ParallaxLayersProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** Ref to a scrollable ancestor that drives progress instead of the window. */
  container?: RefObject<HTMLElement | null>
  /** Layers from back to front. Defaults to the generated landscape. */
  layers?: ParallaxLayer[]
}

// ---- generated landscape (replaces the photographs of the upstream example) ----

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}
const rgbToHex = (rgb: number[]) =>
  `#${rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')}`
export const mixHex = (a: string, b: string, t: number) => {
  const ca = hexToRgb(a)
  const cb = hexToRgb(b)
  return rgbToHex(ca.map((v, i) => v + ((cb[i] ?? v) - v) * t))
}
/** Relative luminance (0-1), for picking readable ink over the scene. */
export const luminance = (hex: string) => {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const samplePalette = (colors: string[], t: number) => {
  if (colors.length === 1) return colors[0] ?? '#000000'
  const x = t * (colors.length - 1)
  const i = Math.min(colors.length - 2, Math.floor(x))
  return mixHex(colors[i] ?? '#000000', colors[i + 1] ?? '#000000', x - i)
}

const ridgePath = (seed: number, roughness: number) => {
  const points: string[] = []
  for (let x = 0; x <= 1200; x += 20) {
    const u = x / 1200
    const y =
      70 -
      Math.sin(u * Math.PI * (2 + seed * 0.7) + seed * 1.9) * 34 -
      Math.sin(u * Math.PI * (5.3 + seed) + seed * 3.1) * 14 * roughness -
      Math.sin(u * Math.PI * 13.7 + seed * 5.3) * 5 * roughness
    points.push(`${x},${y.toFixed(1)}`)
  }
  return `M0,200 L${points.join(' L')} L1200,200 Z`
}

export interface LandscapeOptions {
  palette: string[]
  layerCount: number
  haze: number
  /** Overscan in px so layer edges never travel into view. */
  overscan: number
}

/** Sky, sun, ridges and haze as parallax layers, back to front. */
export function landscapeLayers({ palette, layerCount, haze, overscan }: LandscapeOptions): ParallaxLayer[] {
  const skyTop = palette[0] ?? '#141a3d'
  const horizon = palette[1] ?? skyTop
  const ridgeColors = palette.length > 2 ? palette.slice(2) : [mixHex(horizon, skyTop, 0.6)]
  const n = Math.max(1, Math.round(layerCount))
  const pad = Math.ceil(overscan) + 8
  const layers: ParallaxLayer[] = [
    {
      id: 'sky',
      depth: 0.12,
      content: (
        <div
          className="absolute"
          style={{
            inset: -pad,
            background: `linear-gradient(to bottom, ${skyTop} 0%, ${mixHex(skyTop, horizon, 0.55)} 45%, ${horizon} 72%)`,
          }}
        >
          <div
            className="absolute aspect-square rounded-full"
            style={{
              left: '62%',
              top: '30%',
              width: '18%',
              minWidth: 72,
              background: `radial-gradient(circle, ${mixHex(horizon, '#ffffff', 0.7)} 0 38%, ${mixHex(horizon, '#ffffff', 0.35)}66 52%, transparent 70%)`,
            }}
          />
        </div>
      ),
    },
  ]
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 1 : i / (n - 1)
    const color = mixHex(samplePalette(ridgeColors, t), horizon, haze * 0.6 * (1 - t))
    // Far ridges sit high, near ones low; the solid fill below covers the travel.
    const height = 64 - t * 32
    layers.push({
      id: `ridge-${i}`,
      depth: 0.22 + t * 0.6,
      content: (
        <svg
          aria-hidden="true"
          className="absolute"
          preserveAspectRatio="none"
          viewBox="0 0 1200 200"
          style={{ left: -pad, bottom: -pad, width: `calc(100% + ${pad * 2}px)`, height: `calc(${height}% + ${pad}px)` }}
        >
          <path d={ridgePath(i + 1, 0.5 + t)} fill={color} />
        </svg>
      ),
    })
    if (i === 0 && haze > 0) {
      layers.push({
        id: 'haze',
        depth: 0.3,
        opacity: haze,
        content: (
          <div
            className="absolute"
            style={{
              left: -pad,
              right: -pad,
              bottom: -pad,
              height: `calc(55% + ${pad}px)`,
              background: `linear-gradient(to top, ${horizon}00 0%, ${horizon}aa 45%, ${horizon}00 100%)`,
            }}
          />
        ),
      })
    }
  }
  return layers
}

// ---- upstream component ----

const useHoverCapable = (enabled: boolean) => {
  const [isHoverCapable, setIsHoverCapable] = useState(false)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
    setIsHoverCapable(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setIsHoverCapable(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [enabled])

  return isHoverCapable
}

interface ParallaxLayerItemProps {
  direction: ParallaxDirection
  layer: ParallaxLayer
  pointerX: MotionValue<number>
  pointerY: MotionValue<number>
  progress: MotionValue<number>
  range: number
}

const ParallaxLayerItem = ({ layer, progress, pointerX, pointerY, direction, range }: ParallaxLayerItemProps) => {
  const shouldReduceMotion = useReducedMotion()
  const { depth, blur, opacity } = layer

  const scrollX = useTransform(progress, [0, 1], [-range * depth, range * depth])
  const scrollY = useTransform(progress, [0, 1], [-range * depth, range * depth])
  const pointerOffsetX = useTransform(pointerX, (latest) => latest * depth)
  const pointerOffsetY = useTransform(pointerY, (latest) => latest * depth)

  const x = useTransform([scrollX, pointerOffsetX], (latest) => {
    const [scrollValue, pointerValue] = latest as [number, number]
    return shouldReduceMotion || direction === 'vertical' ? 0 : scrollValue + pointerValue
  })
  const y = useTransform([scrollY, pointerOffsetY], (latest) => {
    const [scrollValue, pointerValue] = latest as [number, number]
    return shouldReduceMotion || direction === 'horizontal' ? 0 : scrollValue + pointerValue
  })

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        filter: blur ? `blur(${blur}px)` : undefined,
        opacity: opacity ?? 1,
        x,
        y,
      }}
    >
      {layer.content}
    </motion.div>
  )
}

export function ParallaxLayers({ layers, container, className, style, ...props }: ParallaxLayersProps) {
  const { direction, range, pointerParallax, pointerStrength, palette, layerCount, haze } = { ...defaults, ...props }
  const ref = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const isHoverCapable = useHoverCapable(pointerParallax)

  const { scrollYProgress } = useScroll({
    container,
    offset: DEFAULT_OFFSET,
    target: ref,
  })
  const springProgress = useSpring(scrollYProgress, SCROLL_SPRING_CONFIG)

  const pointerXRaw = useMotionValue(0)
  const pointerYRaw = useMotionValue(0)
  const pointerX = useSpring(pointerXRaw, POINTER_SPRING_CONFIG)
  const pointerY = useSpring(pointerYRaw, POINTER_SPRING_CONFIG)

  useEffect(() => {
    const node = ref.current
    const isPointerActive = pointerParallax && isHoverCapable && !shouldReduceMotion

    if (!(node && isPointerActive)) {
      return
    }

    const handlePointerMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect()
      const relativeX = (event.clientX - rect.left) / rect.width - CENTER_RATIO
      const relativeY = (event.clientY - rect.top) / rect.height - CENTER_RATIO
      pointerXRaw.set(relativeX * pointerStrength)
      pointerYRaw.set(relativeY * pointerStrength)
    }

    const handlePointerLeave = () => {
      pointerXRaw.set(0)
      pointerYRaw.set(0)
    }

    node.addEventListener('pointermove', handlePointerMove)
    node.addEventListener('pointerleave', handlePointerLeave)

    return () => {
      node.removeEventListener('pointermove', handlePointerMove)
      node.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [pointerParallax, pointerStrength, isHoverCapable, shouldReduceMotion, pointerXRaw, pointerYRaw])

  const items = layers ?? landscapeLayers({ palette, layerCount, haze, overscan: range + pointerStrength })

  return (
    <div className={cn('relative', className)} ref={ref} style={style}>
      {items.map((layer) => (
        <ParallaxLayerItem
          direction={direction as ParallaxDirection}
          key={layer.id}
          layer={layer}
          pointerX={pointerX}
          pointerY={pointerY}
          progress={springProgress}
          range={range}
        />
      ))}
    </div>
  )
}
