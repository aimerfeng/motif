// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/icon-cloud.tsx
// Modified by Motif; see the item's provenance.
import { cn, useCanvasSize, useFrameLoop, usePrefersReducedMotion } from '@motif/runtime'
import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  count: 30,
  radius: 100,
  tileSize: 40,
  tileStyle: 'glyph',
  palette: ['#60a5fa', '#f472b6', '#fbbf24', '#34d399', '#a78bfa', '#fb923c', '#22d3ee'],
  depthFade: 1,
  autoRotate: 1,
  dragSensitivity: 1,
  showControl: true,
}
/* @motif:end */

/** 一枚图标：24×24 视框里的填充路径（按 evenodd 填充）；color 缺省时按顺序取 palette。 */
export interface IconGlyph {
  d: string
  color?: string
}

export type IconSphereProps = Partial<typeof defaults> & {
  /** 矢量图标。icons 和 images 都不给时，画上游的编号圆点。 */
  icons?: IconGlyph[]
  /** 图片地址（同源或允许跨域），裁成圆形。 */
  images?: string[]
  className?: string
  style?: CSSProperties
}

interface Icon {
  x: number
  y: number
  z: number
  scale: number
  opacity: number
  id: number
}

interface TargetRotation {
  x: number
  y: number
  startX: number
  startY: number
  distance: number
  startTime: number
  duration: number
}

// 上游的画布固定 400×400（球半径 100、图标 40）：坐标仍按这个逻辑尺寸算，绘制时再按实际像素缩放。
const SIZE = 400
// 离屏图标按两倍分辨率画，高分屏和放大截图时不糊。
const TILE_RES = 2

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/** 徽章、编号上的字色：按底色亮度在白色和近黑之间选对比度更高的一个。 */
function inkFor(hex: string): string {
  const value = parseInt(hex.slice(1, 7), 16)
  const channel = (shift: number) => {
    const c = ((value >> shift) & 255) / 255
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  const l = 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0)
  return 1.05 / (l + 0.05) >= (l + 0.05) / 0.05 ? '#ffffff' : '#0b0b0f'
}

/** 角度差折到 (-π, π]：点击转到正前方时走最短的那一圈。 */
function shortest(from: number, to: number): number {
  const diff = (((to - from) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI
  return from + diff
}

function fibonacciSphere(numIcons: number, radius: number): Icon[] {
  const icons: Icon[] = []
  const offset = 2 / numIcons
  const increment = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < numIcons; i++) {
    const y = i * offset - 1 + offset / 2
    const r = Math.sqrt(1 - y * y)
    const phi = i * increment
    const x = Math.cos(phi) * r
    const z = Math.sin(phi) * r
    icons.push({ x: x * radius, y: y * radius, z: z * radius, scale: 1, opacity: 1, id: i })
  }
  return icons
}

// 与上游相同的投影：先绕 Y 轴转，再把深度按 X 轴角度混进纵坐标。
function project(icon: Icon, rotation: { x: number; y: number }) {
  const cosX = Math.cos(rotation.x)
  const sinX = Math.sin(rotation.x)
  const cosY = Math.cos(rotation.y)
  const sinY = Math.sin(rotation.y)
  const rotatedX = icon.x * cosY - icon.z * sinY
  const rotatedZ = icon.x * sinY + icon.z * cosY
  const rotatedY = icon.y * cosX + rotatedZ * sinX
  return { x: SIZE / 2 + rotatedX, y: SIZE / 2 + rotatedY, z: rotatedZ, scale: (rotatedZ + 200) / 300 }
}

function drawGlyph(ctx: CanvasRenderingContext2D, glyph: IconGlyph, color: string, tileStyle: string, res: number) {
  ctx.clearRect(0, 0, res, res)
  let inner = res * 0.9
  let fill = color
  if (tileStyle === 'badge') {
    ctx.beginPath()
    ctx.arc(res / 2, res / 2, res / 2, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
    inner = res * 0.54
    fill = inkFor(color)
  }
  ctx.save()
  ctx.translate((res - inner) / 2, (res - inner) / 2)
  ctx.scale(inner / 24, inner / 24)
  ctx.fillStyle = fill
  ctx.fill(new Path2D(glyph.d), 'evenodd')
  ctx.restore()
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 4.6v14.8a1 1 0 0 0 1.5.86l12.2-7.4a1 1 0 0 0 0-1.72L7.5 3.74A1 1 0 0 0 6 4.6Z" />
    </svg>
  )
}

/** 一组图标沿斐波那契球面排开并缓慢转动，背面缩小变淡；可拖动旋转，点一枚图标把它转到正前方。 */
export function IconSphere({ icons, images, className, style, ...props }: IconSphereProps) {
  const options = { ...defaults, ...props }
  const optionsRef = useRef(options)
  optionsRef.current = options

  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()
  // 上游在「减少动态效果」下默认暂停；用户按过按钮后以按钮为准。
  const [pausedByUser, setPausedByUser] = useState<boolean | null>(null)
  const isPaused = pausedByUser ?? reduced
  const pausedRef = useRef(isPaused)
  pausedRef.current = isPaused
  const reducedRef = useRef(reduced)
  reducedRef.current = reduced

  const rotationRef = useRef({ x: 0, y: 0 })
  const targetRotation = useRef<TargetRotation | null>(null)
  // 拖动中时记着上一个指针位置（上游的 isDragging + lastMousePos）。
  const lastPointer = useRef<{ x: number; y: number } | null>(null)
  // 上游的初始指针在左上角，所以没有指针时球体也会斜着转。
  const mousePos = useRef({ x: 0, y: 0 })
  const iconCanvasesRef = useRef<HTMLCanvasElement[]>([])
  const imagesLoadedRef = useRef<boolean[]>([])
  const lastTime = useRef(0)

  const { count, radius, tileSize, tileStyle } = options
  const paletteKey = options.palette.join(',')
  const iconPositions = useMemo(() => fibonacciSphere(Math.max(1, Math.round(count)), radius), [count, radius])

  const draw = (time: number, delta: number) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    lastTime.current = time
    const o = optionsRef.current
    const px = canvas.width / SIZE
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.setTransform(px, 0, 0, px, 0, 0)

    const centerX = SIZE / 2
    const centerY = SIZE / 2
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY)
    const dx = mousePos.current.x - centerX
    const dy = mousePos.current.y - centerY
    const distance = Math.sqrt(dx * dx + dy * dy)
    const speed = 0.003 + (distance / maxDistance) * 0.01

    const target = targetRotation.current
    if (target) {
      const progress = Math.min(1, (time - target.startTime) / target.duration)
      const easedProgress = easeOutCubic(progress)
      rotationRef.current = {
        x: target.startX + (target.x - target.startX) * easedProgress,
        y: target.startY + (target.y - target.startY) * easedProgress,
      }
      if (progress >= 1) targetRotation.current = null
    } else if (!lastPointer.current && !pausedRef.current) {
      // 上游每帧累加一次（按 60fps 调的手感）；乘上帧间隔后，帧率不同转速也一样。
      const step = speed * o.autoRotate * delta * 60
      rotationRef.current = {
        x: rotationRef.current.x + (dy / SIZE) * step,
        y: rotationRef.current.y + (dx / SIZE) * step,
      }
    }

    const items = icons ?? images ?? []
    const useAssets = items.length > 0 && o.tileStyle !== 'number'
    const tile = o.tileSize
    const half = tile / 2
    const canvases = iconCanvasesRef.current
    const loaded = imagesLoadedRef.current
    // 从后往前画，前面的图标不会被背面的盖住。
    const projected = iconPositions.map((icon) => ({ icon, ...project(icon, rotationRef.current) })).sort((a, b) => a.z - b.z)

    for (const p of projected) {
      const opacity = Math.max(0.2, Math.min(1, (p.z + 150) / 200))
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.scale(p.scale, p.scale)
      ctx.globalAlpha = 1 - o.depthFade * (1 - opacity)

      if (useAssets) {
        const index = p.icon.id % items.length
        const source = canvases[index]
        if (source && loaded[index]) ctx.drawImage(source, -half, -half, tile, tile)
      } else {
        // 没有图标时画编号圆点（上游的占位样式）。
        const color = o.palette[p.icon.id % o.palette.length] ?? '#4444ff'
        ctx.beginPath()
        ctx.arc(0, 0, half, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
        ctx.fillStyle = inkFor(color)
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = `600 ${Math.round(tile * 0.4)}px "Geist Variable", ui-sans-serif, system-ui, sans-serif`
        ctx.fillText(`${p.icon.id + 1}`, 0, 0)
      }
      ctx.restore()
    }
  }
  const drawRef = useRef(draw)
  drawRef.current = draw

  useCanvasSize(canvasRef, { maxDpr: 2, onResize: () => drawRef.current(lastTime.current, 0) })

  // 图标或样式变化时重建离屏画布。
  useEffect(() => {
    const items: (IconGlyph | string)[] = icons ?? images ?? []
    const palette = paletteKey.split(',')
    const res = Math.ceil(tileSize * TILE_RES)
    const loaded = new Array<boolean>(items.length).fill(false)
    const pending: HTMLImageElement[] = []

    iconCanvasesRef.current = items.map((item, index) => {
      const offscreen = document.createElement('canvas')
      offscreen.width = res
      offscreen.height = res
      const offCtx = offscreen.getContext('2d')
      if (!offCtx) return offscreen
      if (typeof item === 'string') {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          offCtx.clearRect(0, 0, res, res)
          offCtx.beginPath()
          offCtx.arc(res / 2, res / 2, res / 2, 0, Math.PI * 2)
          offCtx.closePath()
          offCtx.clip()
          offCtx.drawImage(img, 0, 0, res, res)
          loaded[index] = true
          if (reducedRef.current) drawRef.current(lastTime.current, 0)
        }
        img.src = item
        pending.push(img)
      } else {
        drawGlyph(offCtx, item, item.color ?? palette[index % palette.length] ?? '#ffffff', tileStyle, res)
        loaded[index] = true
      }
      return offscreen
    })
    imagesLoadedRef.current = loaded

    return () => {
      for (const img of pending) img.onload = null
    }
  }, [icons, images, tileSize, tileStyle, paletteKey])

  // 编号用的字体加载完再补画一帧（静止状态下不会自己重画）。
  useEffect(() => {
    if (!document.fonts) return
    let cancelled = false
    void document.fonts.load('600 16px "Geist Variable"').then(() => {
      if (!cancelled) drawRef.current(lastTime.current, 0)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // 用户在「减少动态效果」下主动按了播放，就慢速转起来；否则只画一帧。
  useFrameLoop(hostRef, ({ time, delta }) => draw(time, delta), { reducedMotion: pausedByUser === false ? 'slowed' : 'static', staticTime: 0 })

  // 静止时改参数也要重画。
  useEffect(() => {
    if (reduced) drawRef.current(lastTime.current, 0)
  })

  const toLocal = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / Math.max(1, rect.width)) * SIZE,
      y: ((event.clientY - rect.top) / Math.max(1, rect.height)) * SIZE,
    }
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const { x, y } = toLocal(event)
    let hit: { icon: Icon; z: number } | null = null
    for (const icon of iconPositions) {
      const p = project(icon, rotationRef.current)
      const hitRadius = (optionsRef.current.tileSize / 2) * p.scale
      const dx = x - p.x
      const dy = y - p.y
      if (dx * dx + dy * dy < hitRadius * hitRadius && (!hit || p.z > hit.z)) hit = { icon, z: p.z }
    }

    if (hit) {
      const { icon } = hit
      const currentX = rotationRef.current.x
      const currentY = rotationRef.current.y
      const targetX = shortest(currentX, -Math.atan2(icon.y, Math.sqrt(icon.x * icon.x + icon.z * icon.z)))
      const targetY = shortest(currentY, Math.atan2(icon.x, icon.z))
      const distance = Math.sqrt(Math.pow(targetX - currentX, 2) + Math.pow(targetY - currentY, 2))
      const duration = Math.min(2, Math.max(0.8, distance))
      if (reducedRef.current && pausedByUser !== false) {
        rotationRef.current = { x: targetX, y: targetY }
      } else {
        targetRotation.current = { x: targetX, y: targetY, startX: currentX, startY: currentY, distance, startTime: lastTime.current, duration }
      }
    }

    lastPointer.current = { x: event.clientX, y: event.clientY }
    if (reducedRef.current) drawRef.current(lastTime.current, 0)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    mousePos.current = toLocal(event)
    const last = lastPointer.current
    if (!last) return
    const sensitivity = 0.002 * optionsRef.current.dragSensitivity
    rotationRef.current = {
      x: rotationRef.current.x + (event.clientY - last.y) * sensitivity,
      y: rotationRef.current.y + (event.clientX - last.x) * sensitivity,
    }
    lastPointer.current = { x: event.clientX, y: event.clientY }
    if (reducedRef.current) drawRef.current(lastTime.current, 0)
  }

  const handlePointerUp = () => {
    lastPointer.current = null
  }

  return (
    <div ref={hostRef} className={cn('relative inline-block aspect-square w-[400px] max-w-full', className)} style={style}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="block size-full touch-none rounded-lg"
        aria-label="Interactive 3D Icon Cloud"
        role="img"
      />
      {options.showControl && (
        <button
          type="button"
          onClick={() => setPausedByUser(!isPaused)}
          aria-label={isPaused ? 'Play Animation' : 'Pause Animation'}
          className="absolute top-2 right-2 inline-flex size-9 items-center justify-center rounded-md border bg-background text-foreground shadow-xs outline-none transition-[color,background-color,box-shadow] hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {isPaused ? <PlayIcon /> : <PauseIcon />}
        </button>
      )}
    </div>
  )
}
