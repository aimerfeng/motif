// SPDX-License-Identifier: MIT
// Copyright (c) 2023 Jordan-Gilliam
// Source: https://github.com/nolly-studio/cult-ui/blob/ee98a5d/apps/www/registry/default/ui/three-d-carousel.tsx
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useAnimation, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { memo, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  faces: 14,
  cylinderWidth: 1800,
  perspective: 1000,
  radius: 12,
  artwork: 'night',
  dragSensitivity: 0.05,
  spring: {
    visualDuration: 0.4,
    bounce: 0,
  },
  autoSpin: 8,
}
/* @motif:end */

export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

type UseMediaQueryOptions = {
  defaultValue?: boolean
  initializeWithValue?: boolean
}

const IS_SERVER = typeof window === 'undefined'

export function useMediaQuery(query: string, { defaultValue = false, initializeWithValue = true }: UseMediaQueryOptions = {}): boolean {
  const getMatches = (query: string): boolean => {
    if (IS_SERVER) return defaultValue
    return window.matchMedia(query).matches
  }

  const [matches, setMatches] = useState<boolean>(() => (initializeWithValue ? getMatches(query) : defaultValue))

  useIsomorphicLayoutEffect(() => {
    const matchMedia = window.matchMedia(query)
    const handleChange = () => setMatches(matchMedia.matches)
    handleChange()
    matchMedia.addEventListener('change', handleChange)
    return () => matchMedia.removeEventListener('change', handleChange)
  }, [query])

  return matches
}

export type CarouselCard = {
  id: string
  /** 无障碍名称，也显示在放大后的说明里。 */
  label: string
  /** 卡面内容；不传时用生成的城市插画。 */
  content?: ReactNode
}

const keywords = ['night', 'city', 'sky', 'sunset', 'sunrise', 'winter', 'skyscraper', 'building', 'cityscape', 'architecture', 'street', 'lights', 'downtown', 'bridge', 'harbor', 'rooftop', 'avenue', 'tower', 'rain', 'neon']

const duration = 0.15
const transition = { duration, ease: [0.32, 0.72, 0, 1] as const }
const transitionOverlay = { duration: 0.5, ease: [0.32, 0.72, 0, 1] as const }

type Palette = { sky: [string, string, string]; sun: string; far: string; near: string; window: string }
const PALETTES: Record<string, Palette[]> = {
  night: [
    { sky: ['#0b1026', '#1d2a5c', '#3b3f8f'], sun: '#f4f1de', far: '#232a52', near: '#0d1124', window: '#ffd68a' },
    { sky: ['#0a0f1f', '#18305c', '#2f6390'], sun: '#e0f2fe', far: '#1b2a4a', near: '#090d1a', window: '#7dd3fc' },
    { sky: ['#140b26', '#3a1c5c', '#7a3b8f'], sun: '#fde68a', far: '#2a1a46', near: '#0f0a1c', window: '#f9a8d4' },
  ],
  dusk: [
    { sky: ['#2b1b4a', '#c2466b', '#f6a55c'], sun: '#ffe2a8', far: '#5a2a5c', near: '#24122e', window: '#ffd27a' },
    { sky: ['#1f2a4f', '#d9615a', '#fbc27a'], sun: '#fff1c1', far: '#46304f', near: '#1c1428', window: '#ffe0a3' },
    { sky: ['#3a1f3d', '#e2725b', '#f9d67a'], sun: '#fff7d6', far: '#6a3348', near: '#2a1420', window: '#ffc06b' },
  ],
  frost: [
    { sky: ['#9fb8d8', '#d4e2f2', '#f4f7fb'], sun: '#ffffff', far: '#8aa3c2', near: '#4a5f7e', window: '#fff6d8' },
    { sky: ['#a8c3cf', '#dcebee', '#f7fafa'], sun: '#ffffff', far: '#86a6b2', near: '#3f5a66', window: '#fff1c4' },
    { sky: ['#b8b4d8', '#e2def2', '#f8f7fc'], sun: '#ffffff', far: '#9893bd', near: '#4d4a73', window: '#ffecc2' },
  ],
}

function rand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

/** 生成的城市插画：渐变天空 + 月亮 / 太阳 + 两层楼群和亮着的窗。 */
function CityArt({ index, artwork }: { index: number; artwork: string }) {
  const set = PALETTES[artwork] ?? PALETTES.night!
  const p = set[index % set.length]!
  const uid = `${artwork}-${index}`
  const towers = useMemo(() => {
    const far: { x: number; w: number; h: number }[] = []
    const near: { x: number; w: number; h: number; win: [number, number][] }[] = []
    let x = -4
    for (let k = 0; x < 104; k++) {
      const w = 8 + rand(index * 31 + k) * 10
      far.push({ x, w, h: 30 + rand(index * 17 + k * 3) * 34 })
      x += w + 1
    }
    x = -6
    for (let k = 0; x < 106; k++) {
      const w = 11 + rand(index * 13 + k * 7) * 12
      const h = 18 + rand(index * 7 + k * 11) * 40
      const win: [number, number][] = []
      for (let r = 0; r < Math.floor(h / 6); r++) {
        for (let c = 0; c < Math.floor(w / 4); c++) {
          if (rand(index * 101 + k * 37 + r * 5 + c) > 0.62) win.push([x + 1.6 + c * 4, 100 - h + 3 + r * 6])
        }
      }
      near.push({ x, w, h, win })
      x += w + 0.6
    }
    return { far, near }
  }, [index])
  const sunX = 20 + rand(index * 3) * 60
  const sunY = 18 + rand(index * 5) * 18

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky[0]} />
          <stop offset="0.6" stopColor={p.sky[1]} />
          <stop offset="1" stopColor={p.sky[2]} />
        </linearGradient>
        <radialGradient id={`glow-${uid}`}>
          <stop offset="0" stopColor={p.sun} stopOpacity="0.55" />
          <stop offset="1" stopColor={p.sun} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#sky-${uid})`} />
      <circle cx={sunX} cy={sunY} r="18" fill={`url(#glow-${uid})`} />
      <circle cx={sunX} cy={sunY} r="6" fill={p.sun} />
      {towers.far.map((t, k) => (
        <rect key={`f${k}`} x={t.x} y={100 - t.h} width={t.w} height={t.h} fill={p.far} />
      ))}
      {towers.near.map((t, k) => (
        <g key={`n${k}`}>
          <rect x={t.x} y={100 - t.h} width={t.w} height={t.h} fill={p.near} />
          {t.win.map(([wx, wy], j) => (
            <rect key={j} x={wx} y={wy} width="1.8" height="2.4" fill={p.window} opacity="0.9" />
          ))}
        </g>
      ))}
    </svg>
  )
}

type Options = typeof defaults

const Carousel = memo(
  ({
    handleClick,
    controls,
    cards,
    isCarouselActive,
    options,
    reduced,
    labelledBy,
  }: {
    handleClick: (index: number) => void
    controls: ReturnType<typeof useAnimation>
    cards: CarouselCard[]
    isCarouselActive: boolean
    options: Options
    reduced: boolean
    labelledBy?: string
  }) => {
    const isScreenSizeSm = useMediaQuery('(max-width: 640px)')
    const cylinderWidth = isScreenSizeSm ? Math.round(options.cylinderWidth * 0.61) : options.cylinderWidth
    const faceCount = cards.length
    const faceWidth = cylinderWidth / faceCount
    const radius = cylinderWidth / (2 * Math.PI)
    const rotation = useMotionValue(0)
    const transform = useTransform(rotation, (value) => `rotate3d(0, 1, 0, ${value}deg)`)
    const host = useRef<HTMLDivElement>(null)
    const busy = useRef(false)
    const springTransition = { type: 'spring' as const, visualDuration: options.spring.visualDuration, bounce: options.spring.bounce }

    useFrameLoop(
      host,
      ({ delta }) => {
        if (!isCarouselActive || busy.current || options.autoSpin === 0) return
        rotation.set(rotation.get() + options.autoSpin * delta)
      },
      { reducedMotion: 'static' },
    )

    const settle = (target: number) => {
      busy.current = true
      void controls.start({ rotateY: target, transition: reduced ? { duration: 0 } : springTransition }).then(() => {
        busy.current = false
      })
    }

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (!isCarouselActive) return
      const step = 360 / faceCount
      if (event.key === 'ArrowLeft') settle(Math.round(rotation.get() / step) * step - step)
      else if (event.key === 'ArrowRight') settle(Math.round(rotation.get() / step) * step + step)
      else return
      event.preventDefault()
    }

    return (
      <div
        ref={host}
        className="flex h-full items-center justify-center bg-background"
        style={{ perspective: `${options.perspective}px`, transformStyle: 'preserve-3d', willChange: 'transform' }}
      >
        <motion.div
          role="group"
          aria-roledescription="carousel"
          aria-labelledby={labelledBy}
          aria-label={labelledBy ? undefined : 'Cylinder carousel. Drag or use the arrow keys to spin.'}
          tabIndex={0}
          onKeyDown={onKeyDown}
          drag={isCarouselActive ? 'x' : false}
          dragSnapToOrigin={false}
          className="relative flex h-full origin-center cursor-grab justify-center rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
          style={{ transform, rotateY: rotation, width: cylinderWidth, transformStyle: 'preserve-3d' }}
          onDragStart={() => {
            busy.current = true
            controls.stop()
          }}
          onDrag={(_, info) => isCarouselActive && rotation.set(rotation.get() + info.offset.x * options.dragSensitivity)}
          onDragEnd={(_, info) => {
            if (isCarouselActive) settle(rotation.get() + info.velocity.x * options.dragSensitivity)
            else busy.current = false
          }}
          animate={controls}
        >
          {cards.map((card, i) => (
            <motion.div
              key={`key-${card.id}-${i}`}
              role="button"
              tabIndex={isCarouselActive ? 0 : -1}
              aria-label={`Open ${card.label}`}
              className="absolute flex h-full origin-center items-center justify-center rounded-xl bg-background p-2 outline-none focus-visible:[&>div]:ring-2 focus-visible:[&>div]:ring-ring"
              style={{ width: `${faceWidth}px`, transform: `rotateY(${i * (360 / faceCount)}deg) translateZ(${radius}px)` }}
              onClick={() => handleClick(i)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  event.stopPropagation()
                  handleClick(i)
                }
              }}
            >
              <motion.div
                layoutId={`img-${card.id}`}
                className="pointer-events-none aspect-square w-full overflow-hidden"
                style={{ borderRadius: options.radius }}
                initial={reduced ? false : { filter: 'blur(4px)' }}
                layout="position"
                animate={{ filter: 'blur(0px)' }}
                transition={transition}
              >
                {card.content ?? <CityArt index={i} artwork={options.artwork} />}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    )
  },
)
Carousel.displayName = 'Carousel'

export type ThreeDPhotoCarouselProps = Partial<typeof defaults> & {
  /** 自定义卡片；不传时按 faces 生成城市插画卡片。 */
  cards?: CarouselCard[]
  /** 外部控制当前放大的卡片下标（演示自动播放用），null 为关闭。 */
  activeIndex?: number | null
  onActiveIndexChange?: (index: number | null) => void
  /** 轮播区高度。 */
  height?: number | string
  labelledBy?: string
  className?: string
  style?: CSSProperties
}

/** 3D 环形轮播：卡片围成一圈，拖动带惯性旋转，点击卡片放大到浮层。 */
export function ThreeDPhotoCarousel({ cards: customCards, activeIndex, onActiveIndexChange, height = 500, labelledBy, className, style, ...props }: ThreeDPhotoCarouselProps) {
  const options = { ...defaults, ...props }
  const reduced = useReducedMotion() ?? false
  const [innerActive, setInnerActive] = useState<number | null>(null)
  const active = activeIndex !== undefined ? activeIndex : innerActive
  const isCarouselActive = active === null
  const controls = useAnimation()
  const titleId = useId()
  const cards = useMemo<CarouselCard[]>(
    () => customCards ?? Array.from({ length: Math.round(options.faces) }, (_, i) => ({ id: `${keywords[i % keywords.length]}-${i}`, label: `${keywords[i % keywords.length]} scene ${i + 1}` })),
    [customCards, options.faces],
  )
  const activeCard = active === null ? null : cards[active]

  const setActive = (index: number | null) => {
    if (activeIndex === undefined) setInnerActive(index)
    onActiveIndexChange?.(index)
  }

  const handleClick = (index: number) => {
    setActive(index)
    controls.stop()
  }

  const handleClose = () => setActive(null)

  useEffect(() => {
    if (!activeCard) return
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <motion.div layout className={cn('relative', className)} style={style}>
      <AnimatePresence mode="sync">
        {activeCard && active !== null && (
          <motion.div
            key="overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0 }}
            layoutId={`img-container-${activeCard.id}`}
            layout="position"
            onClick={handleClose}
            className="fixed inset-0 z-50 m-5 flex flex-col items-center justify-center gap-3 rounded-3xl bg-black/10 md:m-36 lg:mx-[19rem]"
            style={{ willChange: 'opacity' }}
            transition={transitionOverlay}
          >
            <motion.div
              layoutId={`img-${activeCard.id}`}
              className="aspect-square max-h-full w-[min(100%,420px)] overflow-hidden shadow-lg"
              style={{ borderRadius: Math.max(8, options.radius * 0.75), willChange: 'transform' }}
              initial={reduced ? false : { scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ delay: reduced ? 0 : 0.5, duration: reduced ? 0 : 0.5, ease: [0.25, 0.1, 0.25, 1] as const }}
            >
              {activeCard.content ?? <CityArt index={active} artwork={options.artwork} />}
            </motion.div>
            <div className="flex items-center gap-3">
              <span id={titleId} className="rounded-full bg-black/70 px-3 py-1 text-xs font-medium capitalize text-white">
                {activeCard.label}
              </span>
              <button
                type="button"
                autoFocus
                onClick={handleClose}
                aria-label="Close"
                className="grid size-7 place-items-center rounded-full bg-black/70 text-white outline-none transition-colors hover:bg-black focus-visible:ring-2 focus-visible:ring-white"
              >
                <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative w-full overflow-hidden" style={{ height }}>
        <Carousel handleClick={handleClick} controls={controls} cards={cards} isCarouselActive={isCarouselActive} options={options} reduced={reduced} labelledBy={labelledBy} />
      </div>
    </motion.div>
  )
}

export default ThreeDPhotoCarousel
