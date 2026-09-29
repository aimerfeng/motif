// SPDX-License-Identifier: MIT
// Copyright (c) 2021 Shu Ding
// Source: https://github.com/shuding/cobe/blob/7e94076/README.md
// Built on the cobe package. Modified by Motif; see the item's provenance.
import createGlobe, { type Arc, type Globe as CobeGlobe, type Marker } from 'cobe'
import { cn, releaseContext, useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  baseColor: '#3a4a8f',
  glowColor: '#5b6cff',
  markerColor: '#ffb86b',
  dark: 1,
  diffuse: 1.4,
  mapBrightness: 7,
  rotationSpeed: 0.12,
  tilt: 0.3,
  markerCount: 8,
  arcCount: 4,
}
/* @motif:end */

export type GlobeProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 一组分布在各大洲的城市（纬度、经度），前面的更「重要」，markerCount 从头取。 */
const CITIES: [number, number][] = [
  [51.5074, -0.1278], // London
  [40.7128, -74.006], // New York
  [35.6762, 139.6503], // Tokyo
  [1.3521, 103.8198], // Singapore
  [37.7749, -122.4194], // San Francisco
  [-33.8688, 151.2093], // Sydney
  [-23.5505, -46.6333], // Sao Paulo
  [25.2048, 55.2708], // Dubai
  [31.2304, 121.4737], // Shanghai
  [55.7558, 37.6173], // Moscow
  [28.6139, 77.209], // Delhi
  [-33.9249, 18.4241], // Cape Town
  [19.4326, -99.1332], // Mexico City
  [30.0444, 31.2357], // Cairo
  [52.52, 13.405], // Berlin
  [37.5665, 126.978], // Seoul
  [6.5244, 3.3792], // Lagos
  [43.6532, -79.3832], // Toronto
  [-34.6037, -58.3816], // Buenos Aires
  [13.7563, 100.5018], // Bangkok
  [48.8566, 2.3522], // Paris
  [-1.2921, 36.8219], // Nairobi
  [39.9042, 116.4074], // Beijing
  [64.1466, -21.9426], // Reykjavik
]

/** 弧线连接哪些城市（CITIES 的下标对），前面的先出现。 */
const LINKS: [number, number][] = [
  [1, 0],
  [0, 2],
  [4, 2],
  [3, 5],
  [7, 0],
  [8, 1],
  [6, 1],
  [9, 10],
]

/** #rrggbb -> 0–1 的 RGB，cobe 需要这种格式。 */
function toRgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1, 7), 16)
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255]
}

/** 经度朝向：让初始画面正对欧亚大陆。 */
const START_PHI = 3.6

/** 可拖动旋转的 WebGL 地球，带发光地标和飞线。children 叠在地球之上。 */
export function Globe({ className, style, children, ...props }: GlobeProps) {
  const options = { ...defaults, ...props }
  const optionsRef = useRef(options)
  optionsRef.current = options

  const hostRef = useRef<HTMLDivElement>(null)
  const mountRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<CobeGlobe | null>(null)
  const lastTime = useRef(0)
  const sizeRef = useRef({ width: 1, height: 1 })
  // cobe 只在 update 时才画，所以旋转、拖动全靠我们自己推进 phi。
  const drag = useRef({ active: false, x: 0, offset: 0, velocity: 0 })
  const shown = useRef({ markers: '', arcs: '' })

  const apply = (time: number) => {
    const globe = globeRef.current
    if (!globe) return
    lastTime.current = time
    const o = optionsRef.current
    const d = drag.current
    if (!d.active) {
      d.offset += d.velocity
      d.velocity *= 0.92
      if (Math.abs(d.velocity) < 1e-5) d.velocity = 0
    }
    const patch: Parameters<CobeGlobe['update']>[0] = {
      phi: START_PHI + time * o.rotationSpeed + d.offset,
      theta: o.tilt,
      dark: o.dark,
      diffuse: o.diffuse,
      mapBrightness: o.mapBrightness,
      baseColor: toRgb(o.baseColor),
      markerColor: toRgb(o.markerColor),
      glowColor: toRgb(o.glowColor),
      arcColor: toRgb(o.markerColor),
    }
    // 标记和弧线只有变了才重新上传。
    const markerCount = Math.round(o.markerCount)
    const arcCount = Math.round(o.arcCount)
    const markerKey = `${markerCount}`
    if (markerKey !== shown.current.markers) {
      shown.current.markers = markerKey
      patch.markers = CITIES.slice(0, markerCount).map<Marker>((location, index) => ({ location, size: index < 3 ? 0.07 : 0.05 }))
    }
    const arcKey = `${arcCount}`
    if (arcKey !== shown.current.arcs) {
      shown.current.arcs = arcKey
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
      // cobe 会把 canvas 包进自己创建的 div，所以 canvas 不交给 React 管理，
      // 每次 setup 都新建一个，teardown 时连同外壳一起移除。
      canvas = document.createElement('canvas')
      canvas.style.cssText = 'display:block;width:100%;height:100%;cursor:grab;touch-action:pan-y'
      mount.append(canvas)
      canvas.addEventListener('webglcontextlost', onLost)
      canvas.addEventListener('webglcontextrestored', onRestored)
      const { width, height } = sizeRef.current
      const o = optionsRef.current
      shown.current = { markers: '', arcs: '' }
      globeRef.current = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width,
        height,
        phi: START_PHI,
        theta: o.tilt,
        mapSamples: 20000,
        mapBrightness: o.mapBrightness,
        baseColor: toRgb(o.baseColor),
        markerColor: toRgb(o.markerColor),
        glowColor: toRgb(o.glowColor),
        dark: o.dark,
        diffuse: o.diffuse,
        arcWidth: 0.6,
        arcHeight: 0.28,
        markerElevation: 0.02,
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
      const rect = host.getBoundingClientRect()
      sizeRef.current = { width: Math.max(1, Math.round(rect.width)), height: Math.max(1, Math.round(rect.height)) }
      globeRef.current?.update(sizeRef.current)
    }
    const observer = new ResizeObserver(() => {
      measure()
      applyRef.current(lastTime.current)
    })
    observer.observe(host)
    measure()
    setup()

    const onDown = (event: PointerEvent) => {
      drag.current = { active: true, x: event.clientX, offset: drag.current.offset, velocity: 0 }
      host.setPointerCapture(event.pointerId)
      if (canvas) canvas.style.cursor = 'grabbing'
    }
    const onMove = (event: PointerEvent) => {
      const d = drag.current
      if (!d.active) return
      const delta = ((event.clientX - d.x) / Math.max(1, sizeRef.current.width)) * 2.4
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

  // 减少动态效果或暂停时循环不跑，参数变化后仍要重画一帧。
  useEffect(() => {
    applyRef.current(lastTime.current)
  })

  // 离屏和后台标签页时暂停；开启「减少动态效果」时停在初始角度，不自转。
  useFrameLoop(hostRef, ({ time }) => apply(time), { reducedMotion: 'static', staticTime: 0 })

  return (
    <div ref={hostRef} className={cn('relative isolate overflow-hidden', className)} style={style}>
      <div ref={mountRef} className="absolute inset-0 -z-10" />
      {children}
    </div>
  )
}
