// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Urvish Mali
// Source: https://github.com/iurvish/uselayouts/blob/678a478/registry/default/example/infinite-grid.tsx
// Modified by Motif; see the item's provenance.
'use client'

import { cn, usePrefersReducedMotion } from '@/lib/motif-runtime'
import React, { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useRef } from 'react'

/* @motif:defaults */
export const defaults = {
  columns: 4,
  gap: 2.5,
  cardWidth: 24,
  radius: 0,
  palette: ['#c69c72', '#7f9583', '#c0583f', '#55708f'],
  liquidBlobs: true,
  momentum: 0.95,
}
/* @motif:end */

/** 生成的卡片插画：上游用的是商品照片，条目里不能放图片，改成按调色板现画的器物。 */
export type CardArtShape = 'sphere' | 'vase' | 'stool' | 'lamp' | 'ring' | 'cube' | 'speaker' | 'arch'

export interface GridItem {
  id: string | number
  title: string
  subtitle?: string
  /** 你自己的图片地址；不给时用 art 生成插画。 */
  imageUrl?: string
  art?: CardArtShape
  category?: string
  customContent?: React.ReactNode
}

/** 演示自动播放、键盘或外部控件用来平移画布。 */
export interface InfiniteGridHandle {
  /** 平移目标位置（像素），画布带缓动跟上。 */
  panBy: (dx: number, dy: number) => void
  /** 给一个初速度（像素 / 帧），松手后按 momentum 衰减滑行。 */
  fling: (vx: number, vy: number) => void
}

export type LiquidGlassInfiniteGridProps = Partial<typeof defaults> &
  Omit<React.HTMLAttributes<HTMLElement>, 'children'> & {
    items?: GridItem[]
    onItemClick?: (item: GridItem) => void
    cardClassName?: string
    itemClassName?: string
    controlRef?: React.Ref<InfiniteGridHandle>
  }

export const DEFAULT_GRID_ITEMS: GridItem[] = [
  { id: 's-01', title: 'S-01 CERAMIC SPHERE', subtitle: '$140.00', art: 'sphere' },
  { id: 'v-02', title: 'V-02 STONEWARE VASE', subtitle: '$220.00', art: 'vase' },
  { id: 't-03', title: 'T-03 OAK TRIPOD STOOL', subtitle: '$380.00', art: 'stool' },
  { id: 'l-04', title: 'L-04 CONE TABLE LAMP', subtitle: '$260.00', art: 'lamp' },
  { id: 'r-05', title: 'R-05 CAST BRASS RING', subtitle: '$95.00', art: 'ring' },
  { id: 'b-06', title: 'B-06 BLOCK SIDE TABLE', subtitle: '$540.00', art: 'cube' },
  { id: 'p-07', title: 'P-07 PILL SPEAKER', subtitle: '$310.00', art: 'speaker' },
  { id: 'a-08', title: 'A-08 ARCH MIRROR', subtitle: '$460.00', art: 'arch' },
]

const MONO = "'Geist Mono Variable', ui-monospace, SFMono-Regular, monospace"

function mix(hex: string, target: string, amount: number): string {
  const parse = (value: string) => {
    const h = value.replace('#', '')
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
  }
  const a = parse(hex)
  const b = parse(target)
  return `#${a.map((channel, i) => Math.round(channel + (b[i]! - channel) * amount).toString(16).padStart(2, '0')).join('')}`
}

function CardArt({ shape, color, radius }: { shape: CardArtShape; color: string; radius: number }) {
  const id = useId().replace(/:/g, '')
  const light = mix(color, '#ffffff', 0.4)
  const dark = mix(color, '#000000', 0.32)
  const fill = `url(#${id}-body)`
  const shadow = (
    <ellipse cx="100" cy="164" rx="56" ry="9" fill={`url(#${id}-shadow)`} />
  )

  let body: React.ReactNode
  switch (shape) {
    case 'sphere':
      body = <circle cx="100" cy="102" r="54" fill={`url(#${id}-ball)`} />
      break
    case 'vase':
      body = (
        <>
          <path d="M88 44 L112 44 Q110 62 117 72 Q148 98 141 132 Q137 158 122 164 L78 164 Q63 158 59 132 Q52 98 83 72 Q90 62 88 44 Z" fill={fill} />
          <ellipse cx="100" cy="44" rx="12" ry="3.5" fill={dark} />
        </>
      )
      break
    case 'stool':
      body = (
        <>
          <rect x="96" y="92" width="8" height="70" rx="3" fill={mix(color, '#000000', 0.45)} />
          <path d="M62 92 L52 164 L60 164 L72 92 Z" fill={dark} />
          <path d="M138 92 L148 164 L140 164 L128 92 Z" fill={dark} />
          <path d="M48 76 L152 76 L152 90 A52 13 0 0 1 48 90 Z" fill={fill} />
          <ellipse cx="100" cy="76" rx="52" ry="13" fill={light} />
        </>
      )
      break
    case 'lamp':
      body = (
        <>
          <rect x="97.5" y="110" width="5" height="48" fill={dark} />
          <ellipse cx="100" cy="160" rx="28" ry="6" fill={dark} />
          <path d="M72 62 L128 62 L152 112 L48 112 Z" fill={fill} />
          <ellipse cx="100" cy="62" rx="28" ry="5" fill={light} />
          <ellipse cx="100" cy="112" rx="52" ry="6" fill={mix(color, '#000000', 0.18)} />
        </>
      )
      break
    case 'ring':
      body = <circle cx="100" cy="100" r="44" fill="none" stroke={fill} strokeWidth="22" />
      break
    case 'cube':
      body = (
        <>
          <path d="M100 52 L150 78 L100 104 L50 78 Z" fill={light} />
          <path d="M50 78 L100 104 L100 162 L50 136 Z" fill={color} />
          <path d="M100 104 L150 78 L150 136 L100 162 Z" fill={dark} />
        </>
      )
      break
    case 'speaker':
      body = (
        <>
          <rect x="60" y="44" width="80" height="120" rx="40" fill={fill} />
          <circle cx="100" cy="122" r="20" fill={dark} opacity="0.55" />
          <circle cx="100" cy="72" r="6" fill={dark} opacity="0.55" />
        </>
      )
      break
    case 'arch':
      body = (
        <>
          <path d="M58 164 L58 98 A42 42 0 0 1 142 98 L142 164 Z" fill={fill} />
          <path d="M68 156 L68 100 A32 32 0 0 1 132 100 L132 156 Z" fill={mix(color, '#ffffff', 0.72)} />
          <path d="M84 156 L120 82 L128 92 L96 156 Z" fill="#ffffff" opacity="0.45" />
        </>
      )
      break
  }

  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" style={{ backgroundColor: mix(color, '#ffffff', 0.84), borderRadius: radius }} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" stopColor={light} />
          <stop offset="0.55" stopColor={color} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <radialGradient id={`${id}-ball`} cx="0.36" cy="0.32" r="0.75">
          <stop offset="0" stopColor={mix(color, '#ffffff', 0.55)} />
          <stop offset="0.5" stopColor={color} />
          <stop offset="1" stopColor={dark} />
        </radialGradient>
        <radialGradient id={`${id}-shadow`}>
          <stop offset="0" stopColor={mix(color, '#000000', 0.6)} stopOpacity="0.32" />
          <stop offset="1" stopColor={mix(color, '#000000', 0.6)} stopOpacity="0" />
        </radialGradient>
      </defs>
      {shadow}
      {body}
    </svg>
  )
}

export interface LiquidGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  item: GridItem
  color?: string
  radius?: number
  aspectRatio?: string
  imageClassName?: string
}

export const LiquidGlassCard = forwardRef<HTMLDivElement, LiquidGlassCardProps>(
  ({ item, className, imageClassName, aspectRatio = '1 / 1', color = defaults.palette[0]!, radius = defaults.radius, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('group flex w-full flex-col items-center gap-[18px] select-none', className)} {...props}>
        {item.customContent ? (
          item.customContent
        ) : (
          <>
            <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden" style={{ aspectRatio, borderRadius: radius }}>
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  decoding="async"
                  draggable={false}
                  referrerPolicy="no-referrer"
                  className={cn(
                    'pointer-events-none h-full w-full object-contain object-center transition-transform duration-200 ease-out select-none group-hover:scale-105 motion-reduce:transition-none',
                    imageClassName,
                  )}
                />
              ) : (
                <div
                  className={cn(
                    'pointer-events-none h-full w-full transition-transform duration-200 ease-out group-hover:scale-105 motion-reduce:transition-none',
                    imageClassName,
                  )}
                >
                  <CardArt shape={item.art ?? 'sphere'} color={color} radius={radius} />
                </div>
              )}
            </div>

            <div className="pointer-events-none flex w-full flex-col items-center text-center [overflow-wrap:anywhere]" style={{ fontFamily: MONO }}>
              <p className="text-[13px] leading-[1.2em] font-medium tracking-tight text-neutral-950 uppercase">{item.title}</p>
              {item.subtitle && <p className="mt-0.5 text-[13px] leading-[1.2em] font-normal text-neutral-500 uppercase">{item.subtitle}</p>}
            </div>
          </>
        )}
      </div>
    )
  },
)
LiquidGlassCard.displayName = 'LiquidGlassCard'

const BLOB_CSS = `
  @keyframes fluidBlob1 {
    0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
    33% { transform: translate(8vw, -6vh) scale(1.15) rotate(45deg); }
    66% { transform: translate(-6vw, 8vh) scale(0.9) rotate(-30deg); }
  }
  @keyframes fluidBlob2 {
    0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
    33% { transform: translate(-10vw, 8vh) scale(1.2) rotate(-50deg); }
    66% { transform: translate(7vw, -5vh) scale(0.85) rotate(35deg); }
  }
  @keyframes fluidBlob3 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(5vw, 6vh) scale(1.1); }
  }
  .animate-fluid-1 { animation: fluidBlob1 22s ease-in-out infinite alternate; }
  .animate-fluid-2 { animation: fluidBlob2 26s ease-in-out infinite alternate; }
  .animate-fluid-3 { animation: fluidBlob3 18s ease-in-out infinite alternate; }
  @media (prefers-reduced-motion: reduce) {
    .animate-fluid-1, .animate-fluid-2, .animate-fluid-3 { animation: none; }
  }
`

const KEY_STEP = 160

export const LiquidGlassInfiniteGrid = forwardRef<HTMLDivElement, LiquidGlassInfiniteGridProps>(
  (
    {
      items = DEFAULT_GRID_ITEMS,
      columns = defaults.columns,
      gap = defaults.gap,
      cardWidth = defaults.cardWidth,
      momentum = defaults.momentum,
      liquidBlobs = defaults.liquidBlobs,
      palette = defaults.palette,
      radius = defaults.radius,
      onItemClick,
      className,
      style,
      cardClassName,
      itemClassName,
      controlRef,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLElement>(null)
    const gridMatrixRef = useRef<HTMLDivElement>(null)
    const singleBlockRef = useRef<HTMLDivElement>(null)

    const currentPos = useRef({ x: 0, y: 0 })
    const targetPos = useRef({ x: 0, y: 0 })
    const velocity = useRef({ vx: 0, vy: 0 })
    const blockDim = useRef({ w: 0, h: 0 })

    const isDragging = useRef(false)
    const dragStart = useRef({ x: 0, y: 0 })
    const dragStartTarget = useRef({ x: 0, y: 0 })
    const lastPointer = useRef({ x: 0, y: 0, time: 0 })
    const dragDistance = useRef(0)
    const isInitialized = useRef(false)

    // 减少动态效果：拖动仍然跟手，但不缓动、不滑行、不倾斜。
    const reduced = usePrefersReducedMotion()
    const motionRef = useRef({ momentum, reduced })
    motionRef.current = { momentum, reduced }

    useImperativeHandle(
      controlRef,
      () => ({
        panBy(dx, dy) {
          targetPos.current.x += dx
          targetPos.current.y += dy
        },
        fling(vx, vy) {
          if (motionRef.current.reduced) return
          velocity.current = { vx, vy }
        },
      }),
      [],
    )

    const measureAndCenter = useCallback(() => {
      const block = singleBlockRef.current
      const container = containerRef.current
      if (!block || !container) return
      // offsetWidth 不受网格上的 skew 影响（getBoundingClientRect 会算进倾斜后的外框）。
      const w = block.offsetWidth
      const h = block.offsetHeight
      const cw = container.clientWidth
      const ch = container.clientHeight
      if (w > 0 && h > 0 && cw > 0 && ch > 0) {
        blockDim.current = { w, h }

        if (!isInitialized.current) {
          const initX = -w + (cw - w) / 2
          const initY = -h + (ch - h) / 2
          currentPos.current = { x: initX, y: initY }
          targetPos.current = { x: initX, y: initY }
          if (gridMatrixRef.current) {
            gridMatrixRef.current.style.transform = `translate3d(${initX.toFixed(2)}px, ${initY.toFixed(2)}px, 0)`
          }
          isInitialized.current = true
        }
      }
    }, [])

    useEffect(() => {
      measureAndCenter()
      const container = containerRef.current
      const ro = new ResizeObserver(measureAndCenter)
      if (container) ro.observe(container)
      // 列数、卡片宽度等参数改变时块的尺寸会变，但容器不变，所以块本身也要观察。
      if (singleBlockRef.current) ro.observe(singleBlockRef.current)

      let rafId: number

      const renderLoop = () => {
        const { w, h } = blockDim.current
        const { momentum: decay, reduced: still } = motionRef.current

        if (still) {
          velocity.current = { vx: 0, vy: 0 }
        } else if (!isDragging.current) {
          if (Math.abs(velocity.current.vx) > 0.01 || Math.abs(velocity.current.vy) > 0.01) {
            velocity.current.vx *= decay
            velocity.current.vy *= decay
            targetPos.current.x += velocity.current.vx
            targetPos.current.y += velocity.current.vy
          }
        }

        const lerpFactor = still ? 1 : isDragging.current ? 0.16 : 0.09
        currentPos.current.x += (targetPos.current.x - currentPos.current.x) * lerpFactor
        currentPos.current.y += (targetPos.current.y - currentPos.current.y) * lerpFactor

        if (w > 0 && h > 0) {
          while (currentPos.current.x < -w * 1.75) {
            currentPos.current.x += w
            targetPos.current.x += w
            dragStartTarget.current.x += w
          }
          while (currentPos.current.x > -w * 0.25) {
            currentPos.current.x -= w
            targetPos.current.x -= w
            dragStartTarget.current.x -= w
          }
          while (currentPos.current.y < -h * 1.75) {
            currentPos.current.y += h
            targetPos.current.y += h
            dragStartTarget.current.y += h
          }
          while (currentPos.current.y > -h * 0.25) {
            currentPos.current.y -= h
            targetPos.current.y -= h
            dragStartTarget.current.y -= h
          }
        }

        const skewX = Math.max(Math.min(velocity.current.vx * 0.08, 3), -3)
        const skewY = Math.max(Math.min(velocity.current.vy * 0.08, 3), -3)

        if (gridMatrixRef.current) {
          gridMatrixRef.current.style.transform = `translate3d(${currentPos.current.x.toFixed(2)}px, ${currentPos.current.y.toFixed(2)}px, 0) skew(${skewX.toFixed(2)}deg, ${skewY.toFixed(2)}deg)`
        }

        rafId = requestAnimationFrame(renderLoop)
      }

      rafId = requestAnimationFrame(renderLoop)

      return () => {
        cancelAnimationFrame(rafId)
        ro.disconnect()
      }
    }, [measureAndCenter])

    const handlePointerDown = (e: React.PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return

      isDragging.current = true
      dragDistance.current = 0
      dragStart.current = { x: e.clientX, y: e.clientY }
      dragStartTarget.current = { ...targetPos.current }
      lastPointer.current = { x: e.clientX, y: e.clientY, time: performance.now() }
      velocity.current = { vx: 0, vy: 0 }

      if (containerRef.current) {
        containerRef.current.setPointerCapture(e.pointerId)
      }
    }

    const handlePointerMove = (e: React.PointerEvent) => {
      if (!isDragging.current) return

      const dragMultiplier = 0.85
      const dx = (e.clientX - dragStart.current.x) * dragMultiplier
      const dy = (e.clientY - dragStart.current.y) * dragMultiplier
      dragDistance.current += Math.hypot(e.movementX, e.movementY)

      const now = performance.now()
      const dt = Math.max(now - lastPointer.current.time, 1)

      const vx = ((e.clientX - lastPointer.current.x) / dt) * 12
      const vy = ((e.clientY - lastPointer.current.y) / dt) * 12

      velocity.current = {
        vx: velocity.current.vx * 0.25 + vx * 0.75,
        vy: velocity.current.vy * 0.25 + vy * 0.75,
      }

      lastPointer.current = { x: e.clientX, y: e.clientY, time: now }
      targetPos.current.x = dragStartTarget.current.x + dx
      targetPos.current.y = dragStartTarget.current.y + dy
    }

    const handlePointerUp = (e: React.PointerEvent) => {
      if (!isDragging.current) return
      isDragging.current = false

      if (containerRef.current && containerRef.current.hasPointerCapture(e.pointerId)) {
        containerRef.current.releasePointerCapture(e.pointerId)
      }
    }

    // 键盘：方向键平移一格，和滚轮一样带一点惯性。
    const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
      onKeyDown?.(e)
      if (e.defaultPrevented || e.target !== e.currentTarget) return
      const moves: Record<string, [number, number]> = {
        ArrowLeft: [KEY_STEP, 0],
        ArrowRight: [-KEY_STEP, 0],
        ArrowUp: [0, KEY_STEP],
        ArrowDown: [0, -KEY_STEP],
      }
      const move = moves[e.key]
      if (!move) return
      e.preventDefault()
      targetPos.current.x += move[0]
      targetPos.current.y += move[1]
    }

    useEffect(() => {
      const el = containerRef.current
      if (!el) return

      const onWheel = (e: WheelEvent) => {
        e.preventDefault()
        const scrollSensitivity = 0.45
        const deltaX = -e.deltaX * scrollSensitivity
        const deltaY = -e.deltaY * scrollSensitivity

        if (!motionRef.current.reduced) {
          velocity.current.vx = velocity.current.vx * 0.3 + deltaX * 0.7
          velocity.current.vy = velocity.current.vy * 0.3 + deltaY * 0.7
        }

        targetPos.current.x += deltaX
        targetPos.current.y += deltaY
      }

      el.addEventListener('wheel', onWheel, { passive: false })
      return () => el.removeEventListener('wheel', onWheel)
    }, [])

    const matrix = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
    ]

    // 补满最后一行：列数不能整除条目数时循环取条目，铺开后不会留下空洞。
    const cols = Math.max(1, Math.round(columns))
    const cellCount = items.length === 0 ? 0 : Math.ceil(items.length / cols) * cols
    const cells = Array.from({ length: cellCount }, (_, index) => ({ item: items[index % items.length]!, index }))
    const colors = palette.length > 0 ? palette : defaults.palette

    return (
      <div ref={ref} className={cn('infinite-grid-root relative h-full min-h-dvh w-full overflow-hidden bg-white', className)} style={style}>
        <style>{BLOB_CSS}</style>

        <section
          ref={containerRef}
          tabIndex={0}
          aria-label="Product canvas. Drag, scroll or use the arrow keys to pan."
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleKeyDown}
          className="relative h-full w-full cursor-grab overflow-hidden bg-white outline-none select-none focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-neutral-950 active:cursor-grabbing"
          style={{
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            backgroundColor: '#ffffff',
          }}
          {...props}
        >
          {liquidBlobs && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
              <div className="animate-fluid-1 absolute top-1/4 left-1/5 h-[45vw] w-[45vw] rounded-full bg-slate-100 blur-[90px]" />
              <div className="animate-fluid-2 absolute top-2/3 right-1/4 h-[50vw] w-[50vw] rounded-full bg-zinc-100 blur-[100px]" />
              <div className="animate-fluid-3 absolute -top-1/4 right-1/3 h-[40vw] w-[40vw] rounded-full bg-slate-50 blur-[85px]" />
            </div>
          )}

          <div
            ref={gridMatrixRef}
            className="absolute top-0 left-0"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, max-content)',
              gridTemplateRows: 'repeat(3, max-content)',
              width: 'max-content',
              willChange: 'transform',
              transform: 'translate3d(0,0,0)',
              transformOrigin: '50% 50%',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            {matrix.map((row, rowIndex) =>
              row.map((blockId, colIndex) => {
                const isCenterBlock = rowIndex === 1 && colIndex === 1
                const clickable = isCenterBlock && Boolean(onItemClick)
                return (
                  <div
                    key={`block-${blockId}`}
                    ref={isCenterBlock ? singleBlockRef : null}
                    aria-hidden={!isCenterBlock ? 'true' : undefined}
                    role={isCenterBlock ? 'list' : undefined}
                    style={{
                      display: 'grid',
                      width: 'max-content',
                      gridTemplateColumns: `repeat(${cols}, 1fr)`,
                      alignItems: 'center',
                      gap: `${gap}vw`,
                      padding: '1.25vw',
                    }}
                  >
                    {cells.map(({ item, index }) => (
                      <div
                        key={`b${blockId}-${index}`}
                        role={isCenterBlock ? 'listitem' : undefined}
                        onClick={() => {
                          if (dragDistance.current < 6) onItemClick?.(item)
                        }}
                        style={{
                          width: `max(${cardWidth}vw, 120px)`,
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                        }}
                        className={cn('select-none', itemClassName)}
                      >
                        <LiquidGlassCard
                          item={item}
                          color={colors[(index % items.length) % colors.length]}
                          radius={radius}
                          className={cn(clickable && 'cursor-pointer rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-950', cardClassName)}
                          {...(clickable
                            ? {
                                role: 'button',
                                tabIndex: 0,
                                'aria-label': [item.title, item.subtitle].filter(Boolean).join(', '),
                                onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    onItemClick?.(item)
                                  }
                                },
                              }
                            : {})}
                        />
                      </div>
                    ))}
                  </div>
                )
              }),
            )}
          </div>
        </section>
      </div>
    )
  },
)
LiquidGlassInfiniteGrid.displayName = 'LiquidGlassInfiniteGrid'

/** Docs / CLI alias — same as LiquidGlassInfiniteGrid. */
export const InfiniteGrid = LiquidGlassInfiniteGrid
export type InfiniteGridProps = LiquidGlassInfiniteGridProps

export default LiquidGlassInfiniteGrid
