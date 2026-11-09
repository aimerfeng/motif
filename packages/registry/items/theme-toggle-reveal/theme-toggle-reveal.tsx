// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/animated-theme-toggler.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { useCallback, useEffect, useRef, useState, type ComponentPropsWithoutRef } from 'react'
import { flushSync } from 'react-dom'

/* @motif:defaults */
export const defaults = {
  variant: 'circle',
  duration: 400,
  fromCenter: false,
  iconSize: 24,
}
/* @motif:end */

export type TransitionVariant = 'circle' | 'square' | 'triangle' | 'diamond' | 'hexagon' | 'rectangle' | 'star'

export type ThemeToggleRevealProps = Partial<typeof defaults> &
  Omit<ComponentPropsWithoutRef<'button'>, keyof typeof defaults> & {
    /**
     * Controlled theme value. When provided, the parent owns persistence
     * (e.g. `next-themes`) and this component will not write to localStorage.
     */
    theme?: 'light' | 'dark'
    /** Called on toggle. Pair with `theme` for controlled usage. */
    onThemeChange?: (theme: 'light' | 'dark') => void
  }

function polygonCollapsed(point: string, vertexCount: number): string {
  const pairs = Array.from({ length: vertexCount }, () => point).join(', ')
  return `polygon(${pairs})`
}

// All coordinates are percentages of the snapshot reference box: Chrome 150
// renders absolute px clip-path coordinates on ::view-transition-new(root)
// unscaled on fractional display scales (e.g. Windows 150%) for the first
// transition after load, so px values land at the wrong position (#989).
export function getThemeTransitionClipPaths(
  variant: TransitionVariant,
  cx: number,
  cy: number,
  maxRadius: number,
  viewportWidth: number,
  viewportHeight: number,
): [string, string] {
  const toX = (x: number) => `${(x / viewportWidth) * 100}%`
  const toY = (y: number) => `${(y / viewportHeight) * 100}%`
  const point = (x: number, y: number) => `${toX(x)} ${toY(y)}`
  // circle() percentage radii resolve against hypot(w, h) / sqrt(2) of the reference box.
  const toRadius = (r: number) => `${(r / (Math.hypot(viewportWidth, viewportHeight) / Math.SQRT2)) * 100}%`

  switch (variant) {
    case 'circle':
      return [`circle(0% at ${point(cx, cy)})`, `circle(${toRadius(maxRadius)} at ${point(cx, cy)})`]
    case 'square': {
      const halfW = Math.max(cx, viewportWidth - cx)
      const halfH = Math.max(cy, viewportHeight - cy)
      const halfSide = Math.max(halfW, halfH) * 1.05
      const end = [
        point(cx - halfSide, cy - halfSide),
        point(cx + halfSide, cy - halfSide),
        point(cx + halfSide, cy + halfSide),
        point(cx - halfSide, cy + halfSide),
      ].join(', ')
      return [polygonCollapsed(point(cx, cy), 4), `polygon(${end})`]
    }
    case 'triangle': {
      const scale = maxRadius * 2.2
      const dx = (Math.sqrt(3) / 2) * scale
      const verts = [point(cx, cy - scale), point(cx + dx, cy + 0.5 * scale), point(cx - dx, cy + 0.5 * scale)].join(', ')
      return [polygonCollapsed(point(cx, cy), 3), `polygon(${verts})`]
    }
    case 'diamond': {
      // Slightly larger than the view-transition circle radius so axis-aligned coverage matches the circle reveal.
      const R = maxRadius * Math.SQRT2
      const end = [point(cx, cy - R), point(cx + R, cy), point(cx, cy + R), point(cx - R, cy)].join(', ')
      return [polygonCollapsed(point(cx, cy), 4), `polygon(${end})`]
    }
    case 'hexagon': {
      const R = maxRadius * Math.SQRT2
      const verts: string[] = []
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 3
        verts.push(point(cx + R * Math.cos(a), cy + R * Math.sin(a)))
      }
      return [polygonCollapsed(point(cx, cy), 6), `polygon(${verts.join(', ')})`]
    }
    case 'rectangle': {
      const halfW = Math.max(cx, viewportWidth - cx)
      const halfH = Math.max(cy, viewportHeight - cy)
      const end = [
        point(cx - halfW, cy - halfH),
        point(cx + halfW, cy - halfH),
        point(cx + halfW, cy + halfH),
        point(cx - halfW, cy + halfH),
      ].join(', ')
      return [polygonCollapsed(point(cx, cy), 4), `polygon(${end})`]
    }
    case 'star': {
      // Small overscan so the last frames never leave a 1px seam before the transition group ends.
      const R = maxRadius * Math.SQRT2 * 1.03
      const innerRatio = 0.42
      const starPolygon = (radius: number) => {
        const verts: string[] = []
        for (let i = 0; i < 5; i++) {
          const outerA = -Math.PI / 2 + (i * 2 * Math.PI) / 5
          verts.push(point(cx + radius * Math.cos(outerA), cy + radius * Math.sin(outerA)))
          const innerA = outerA + Math.PI / 5
          verts.push(point(cx + radius * innerRatio * Math.cos(innerA), cy + radius * innerRatio * Math.sin(innerA)))
        }
        return `polygon(${verts.join(', ')})`
      }
      const startR = Math.max(2, R * 0.025)
      return [starPolygon(startR), starPolygon(R)]
    }
    default:
      return [`circle(0% at ${point(cx, cy)})`, `circle(${toRadius(maxRadius)} at ${point(cx, cy)})`]
  }
}

/** Inline sun / moon glyphs (replace lucide-react's Sun and Moon). */
export function SunIcon({ size }: { size: number }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4
        return <line key={i} x1={12 + Math.cos(a) * 7.5} y1={12 + Math.sin(a) * 7.5} x2={12 + Math.cos(a) * 10} y2={12 + Math.sin(a) * 10} />
      })}
    </svg>
  )
}

export function MoonIcon({ size }: { size: number }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
    </svg>
  )
}

export const ThemeToggleReveal = ({ className, theme, onThemeChange, ...rest }: ThemeToggleRevealProps) => {
  const { variant, duration, fromCenter, iconSize, ...props } = { ...defaults, ...rest }
  const shape = (variant ?? 'circle') as TransitionVariant
  const isControlled = theme !== undefined
  const [internalIsDark, setInternalIsDark] = useState(false)
  const isDark = isControlled ? theme === 'dark' : internalIsDark
  const buttonRef = useRef<HTMLButtonElement>(null)
  const isTransitioningRef = useRef(false)
  const activeAnimRef = useRef<Animation | null>(null)

  const cancelAnim = useCallback(() => {
    activeAnimRef.current?.cancel()
    activeAnimRef.current = null
  }, [])

  useEffect(() => {
    return () => {
      cancelAnim()
      const root = document.documentElement
      if (root.dataset.motifThemeVt !== 'active') return
      delete root.dataset.motifThemeVt
      root.style.removeProperty('--motif-theme-toggle-vt-duration')
      root.style.removeProperty('--motif-theme-vt-clip-from')
    }
  }, [cancelAnim])

  useEffect(() => {
    if (isControlled) return

    const updateTheme = () => {
      setInternalIsDark(document.documentElement.classList.contains('dark'))
    }

    updateTheme()

    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => observer.disconnect()
  }, [isControlled])

  const toggleTheme = useCallback(() => {
    const button = buttonRef.current
    if (!button || isTransitioningRef.current || document.documentElement.dataset.motifThemeVt === 'active') return

    // innerWidth/innerHeight (not visualViewport): percentages must resolve
    // against the snapshot reference box, which includes classic scrollbars.
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let x: number
    let y: number
    if (fromCenter) {
      x = viewportWidth / 2
      y = viewportHeight / 2
    } else {
      const { top, left, width, height } = button.getBoundingClientRect()
      x = left + width / 2
      y = top + height / 2
    }

    const maxRadius = Math.hypot(Math.max(x, viewportWidth - x), Math.max(y, viewportHeight - y))

    const applyTheme = () => {
      const newTheme = !isDark
      // Always toggle the class synchronously so the View Transitions API
      // snapshots the new theme inside the startViewTransition callback.
      document.documentElement.classList.toggle('dark')
      if (isControlled) {
        onThemeChange?.(newTheme ? 'dark' : 'light')
      } else {
        setInternalIsDark(newTheme)
        onThemeChange?.(newTheme ? 'dark' : 'light')
        try {
          localStorage.setItem('theme', newTheme ? 'dark' : 'light')
        } catch {
          // storage blocked: the theme still switches for this page view
        }
      }
    }

    // No View Transitions API, or the user asked for reduced motion: switch instantly.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (typeof document.startViewTransition !== 'function' || reduced) {
      applyTheme()
      return
    }

    const clipPath = getThemeTransitionClipPaths(shape, x, y, maxRadius, viewportWidth, viewportHeight)

    const root = document.documentElement
    root.dataset.motifThemeVt = 'active'
    root.style.setProperty('--motif-theme-toggle-vt-duration', `${duration}ms`)
    // Pin the collapsed clip-path via CSS so Firefox does not paint the new
    // theme unclipped between snapshot and the ready.then() JS animation.
    root.style.setProperty('--motif-theme-vt-clip-from', clipPath[0])
    const cleanup = () => {
      isTransitioningRef.current = false
      delete root.dataset.motifThemeVt
      root.style.removeProperty('--motif-theme-toggle-vt-duration')
      root.style.removeProperty('--motif-theme-vt-clip-from')
      cancelAnim()
    }

    isTransitioningRef.current = true
    const transition = document.startViewTransition(() => {
      flushSync(applyTheme)
    })
    if (typeof transition?.finished?.finally === 'function') {
      transition.finished.finally(cleanup).catch(() => {})
    } else {
      cleanup()
    }

    // 没有 ready Promise 的旧实现就只换主题、不做裁剪动画。
    const ready = transition?.ready as Promise<void> | undefined
    if (typeof ready?.then === 'function') {
      ready
        .then(() => {
          const anim = document.documentElement.animate(
            { clipPath },
            {
              duration,
              // Star: linear avoids easing overshoot that fights polygon interpolation at t→1; VT group duration is synced above.
              easing: shape === 'star' ? 'linear' : 'ease-in-out',
              fill: 'forwards',
              pseudoElement: '::view-transition-new(root)',
            },
          )
          activeAnimRef.current = anim
        })
        .catch(() => {})
    }
  }, [shape, fromCenter, duration, isDark, isControlled, onThemeChange, cancelAnim])

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn('outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current', className)}
      {...props}
    >
      {isDark ? <SunIcon size={iconSize} /> : <MoonIcon size={iconSize} />}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
