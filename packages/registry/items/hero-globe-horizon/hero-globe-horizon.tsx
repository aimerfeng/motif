// SPDX-License-Identifier: MIT
// Copyright (c) 2021 Shu Ding
// Source: https://github.com/shuding/cobe/blob/7e94076/README.md
// Built on the cobe package. Modified by Motif; see the item's provenance.
import createGlobe, { type Arc, type Globe as CobeGlobe, type Marker } from 'cobe'
import { motion, useReducedMotion } from 'motion/react'
import { cn, releaseContext, useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  headline: 'Settle payouts in 190 countries before lunch',
  accent: '#ffb86b',
  glowColor: '#5b6cff',
  dark: true,
  globeScale: 0.75,
  horizon: 0.6,
  arcCount: 6,
  rotationSpeed: 0.08,
}
/* @motif:end */

export type HeroGlobeHorizonProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
}

/** 城市（纬度、经度），以北半球为主，因为地平线只露出球体上半部分。 */
const CITIES: [number, number][] = [
  [51.5074, -0.1278], // London
  [40.7128, -74.006], // New York
  [35.6762, 139.6503], // Tokyo
  [37.7749, -122.4194], // San Francisco
  [52.52, 13.405], // Berlin
  [25.2048, 55.2708], // Dubai
  [1.3521, 103.8198], // Singapore
  [19.4326, -99.1332], // Mexico City
  [28.6139, 77.209], // Delhi
  [64.1466, -21.9426], // Reykjavik
  [43.6532, -79.3832], // Toronto
  [37.5665, 126.978], // Seoul
]

const LINKS: [number, number][] = [
  [1, 0],
  [0, 4],
  [3, 1],
  [4, 5],
  [10, 9],
  [9, 0],
  [5, 8],
  [7, 1],
]

function toRgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1, 7), 16)
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255]
}

/** 相对亮度，用来给强调色按钮挑深色或浅色文字。 */
function luminance(hex: string) {
  const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const [r, g, b] = toRgb(hex).map(channel) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const START_PHI = 4.4
const THETA = 0.18
const MAX_DPR = 1.5
/** cobe 的球体半径（以画布高度的一半为 1）。 */
const GLOBE_R = 0.8

const THEMES = {
  dark: { bg: '#04060d', fg: '#f4f6ff', muted: 'rgba(222,228,255,0.68)', line: 'rgba(255,255,255,0.14)', base: [0.2, 0.25, 0.48] as [number, number, number], dark: 1, diffuse: 1.3, map: 6 },
  light: { bg: '#f5f7fc', fg: '#0b1020', muted: 'rgba(20,28,52,0.68)', line: 'rgba(11,16,32,0.14)', base: [1, 1, 1] as [number, number, number], dark: 0, diffuse: 1.4, map: 5 },
}

/** 首屏：放大的 cobe 地球从底边升起，露出上半部分像地平线，标题和按钮居中叠在上方。 */
export function HeroGlobeHorizon({ className, style, ...props }: HeroGlobeHorizonProps) {
  const options = { ...defaults, ...props }
  const optionsRef = useRef(options)
  optionsRef.current = options
  const reduced = useReducedMotion()

  const hostRef = useRef<HTMLElement>(null)
  const mountRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<CobeGlobe | null>(null)
  const lastTime = useRef(0)
  const sizeRef = useRef({ width: 1, height: 1 })
  const drag = useRef({ active: false, x: 0, offset: 0, velocity: 0 })
  const shown = useRef({ arcs: '', theme: '' })

  const apply = (time: number) => {
    const globe = globeRef.current
    if (!globe) return
    lastTime.current = time
    const o = optionsRef.current
    const theme = o.dark ? THEMES.dark : THEMES.light
    const d = drag.current
    if (!d.active) {
      d.offset += d.velocity
      d.velocity *= 0.92
      if (Math.abs(d.velocity) < 1e-5) d.velocity = 0
    }
    // 半径按宽度定（窄屏不小于高度的 0.45），scale 把 cobe 的球放大到这个半径，
    // offset 把球心推到区块下方，让球顶停在 horizon 的位置。
    const { width, height } = sizeRef.current
    const radius = Math.max(o.globeScale * width, height * 0.45)
    const scale = radius / ((GLOBE_R * height) / 2)
    const shift = o.horizon * height + radius - height / 2
    const patch: Parameters<CobeGlobe['update']>[0] = {
      phi: START_PHI + time * o.rotationSpeed + d.offset,
      theta: THETA,
      scale,
      offset: [0, (2 * shift) / scale],
      dark: theme.dark,
      diffuse: theme.diffuse,
      mapBrightness: theme.map,
      baseColor: theme.base,
      markerColor: toRgb(o.accent),
      glowColor: toRgb(o.glowColor),
      arcColor: toRgb(o.accent),
    }
    const arcCount = Math.round(o.arcCount)
    const arcKey = `${arcCount}`
    if (arcKey !== shown.current.arcs) {
      shown.current.arcs = arcKey
      const used = new Set(LINKS.slice(0, arcCount).flat())
      patch.markers = CITIES.map<Marker>((location, index) => ({ location, size: used.has(index) ? 0.009 : 0.005 }))
      patch.arcs = LINKS.slice(0, arcCount).map<Arc>(([from, to]) => ({ from: CITIES[from]!, to: CITIES[to]! }))
    }
    globe.update(patch)
  }
  const applyRef = useRef(apply)
  applyRef.current = apply

  useEffect(() => {
    const host = hostRef.current!
    const mount = mountRef.current!
    let disposed = false
    let canvas: HTMLCanvasElement | null = null

    const setup = () => {
      // cobe 会把 canvas 包进自己的 div，所以 canvas 不交给 React 管理。
      canvas = document.createElement('canvas')
      canvas.style.cssText = 'display:block;width:100%;height:100%;cursor:grab;touch-action:pan-y'
      mount.append(canvas)
      canvas.addEventListener('webglcontextlost', onLost)
      canvas.addEventListener('webglcontextrestored', onRestored)
      const { width, height } = sizeRef.current
      const o = optionsRef.current
      const theme = o.dark ? THEMES.dark : THEMES.light
      shown.current = { arcs: '', theme: '' }
      globeRef.current = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, MAX_DPR),
        width,
        height,
        phi: START_PHI,
        theta: THETA,
        mapSamples: 40000,
        mapBrightness: theme.map,
        baseColor: theme.base,
        markerColor: toRgb(o.accent),
        glowColor: toRgb(o.glowColor),
        dark: theme.dark,
        diffuse: theme.diffuse,
        arcWidth: 0.18,
        arcHeight: 0.12,
        markerElevation: 0.01,
      })
      applyRef.current(lastTime.current)
    }

    const teardown = () => {
      globeRef.current?.destroy()
      globeRef.current = null
      if (canvas) {
        canvas.removeEventListener('webglcontextlost', onLost)
        canvas.removeEventListener('webglcontextrestored', onRestored)
        const gl = (canvas.getContext('webgl2') ?? canvas.getContext('webgl')) as WebGLRenderingContext | null
        if (gl) releaseContext(gl)
        canvas = null
      }
      mount.replaceChildren()
    }

    function onLost(event: Event) {
      event.preventDefault()
      globeRef.current?.destroy()
      globeRef.current = null
    }
    function onRestored() {
      if (disposed) return
      teardown()
      setup()
    }

    const measure = () => {
      const rect = mount.getBoundingClientRect()
      sizeRef.current = { width: Math.max(1, Math.round(rect.width)), height: Math.max(1, Math.round(rect.height)) }
      globeRef.current?.update(sizeRef.current)
    }
    const observer = new ResizeObserver(() => {
      measure()
      applyRef.current(lastTime.current)
    })
    observer.observe(mount)
    measure()
    setup()

    const onDown = (event: PointerEvent) => {
      if (event.target !== canvas) return
      drag.current = { active: true, x: event.clientX, offset: drag.current.offset, velocity: 0 }
      host.setPointerCapture(event.pointerId)
      if (canvas) canvas.style.cursor = 'grabbing'
    }
    const onMove = (event: PointerEvent) => {
      const d = drag.current
      if (!d.active) return
      const delta = ((event.clientX - d.x) / Math.max(1, sizeRef.current.width)) * 1.6
      d.x = event.clientX
      d.offset += delta
      d.velocity = delta
      applyRef.current(lastTime.current)
    }
    const onUp = (event: PointerEvent) => {
      drag.current.active = false
      if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId)
      if (canvas) canvas.style.cursor = 'grab'
    }
    host.addEventListener('pointerdown', onDown)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerup', onUp)
    host.addEventListener('pointercancel', onUp)

    return () => {
      disposed = true
      observer.disconnect()
      host.removeEventListener('pointerdown', onDown)
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerup', onUp)
      host.removeEventListener('pointercancel', onUp)
      teardown()
    }
  }, [])

  useEffect(() => {
    applyRef.current(lastTime.current)
  })

  useFrameLoop(hostRef, ({ time }) => apply(time), { reducedMotion: 'static', staticTime: 0 })

  const theme = options.dark ? THEMES.dark : THEMES.light
  const ink = luminance(options.accent) > 0.4 ? '#0b1020' : '#ffffff'
  const rise = (delay: number) =>
    reduced
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 } }
      : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const } }

  return (
    <section
      ref={hostRef}
      className={cn('relative isolate flex min-h-[640px] w-full flex-col overflow-hidden', className)}
      style={{ background: theme.bg, color: theme.fg, fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif", height: '100svh', ...style }}
    >
      <div ref={mountRef} className="absolute inset-0 -z-10" />
      {/* 球顶上方一层淡淡的光晕，和 cobe 自己的 glow 接上。 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -z-10"
        style={{
          top: `${options.horizon * 100 - 30}%`,
          height: '40%',
          background: `radial-gradient(ellipse 60% 55% at 50% 100%, ${options.glowColor}33, transparent 70%)`,
        }}
      />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <span className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
            <circle cx="11" cy="11" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M2 13.5c5-3 13-3 18 0" fill="none" stroke={options.accent} strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          Meridian
        </span>
        <nav aria-label="Primary" className="hidden items-center gap-7 text-sm sm:flex" style={{ color: theme.muted }}>
          <a href="#" className="rounded focus-visible:outline-2 focus-visible:outline-offset-2">Payouts</a>
          <a href="#" className="rounded focus-visible:outline-2 focus-visible:outline-offset-2">Treasury</a>
          <a href="#" className="rounded focus-visible:outline-2 focus-visible:outline-offset-2">Pricing</a>
        </nav>
        <a href="#" className="rounded-full border px-3.5 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2" style={{ borderColor: theme.line }}>
          Sign in
        </a>
      </header>

      <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-5 pt-[7vh] text-center sm:px-8">
        <motion.p
          {...rise(0)}
          className="mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
          style={{ borderColor: theme.line, color: theme.muted }}
        >
          <span className="size-1.5 rounded-full" style={{ background: options.accent }} />
          Live in 46 currencies
        </motion.p>
        <motion.h1 {...rise(0.08)} className="text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-6xl">
          {options.headline}
        </motion.h1>
        <motion.p {...rise(0.16)} className="mt-5 max-w-xl text-pretty text-base sm:text-lg" style={{ color: theme.muted }}>
          One API for local rails, FX and compliance. Funds land in hours, with every hop traced.
        </motion.p>
        <motion.div {...rise(0.24)} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#"
            className="rounded-full px-5 py-2.5 text-sm font-medium transition-transform hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
            style={{ background: options.accent, color: ink }}
          >
            Start sending
          </a>
          <a href="#" className="rounded-full border px-5 py-2.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2" style={{ borderColor: theme.line }}>
            Talk to sales
          </a>
        </motion.div>
      </div>
    </section>
  )
}
