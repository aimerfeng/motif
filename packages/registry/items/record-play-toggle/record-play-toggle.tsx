// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Eduardo Calvo
// Source: https://github.com/educlopez/smoothui/blob/b6312bc/packages/smoothui/components/music-toggle/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { AnimatePresence, motion, useAnimationFrame, useMotionValue, useReducedMotion } from 'motion/react'
import { type CSSProperties, type KeyboardEvent, useCallback, useState } from 'react'

/* @motif:defaults */
export const defaults = {
  playing: true,
  progress: 0.35,
  size: 96,
  bars: 24,
  accent: '#ec4899',
  labelColor: '#ec4899',
  spinSpeed: 1,
}
/* @motif:end */

const RING_RADIUS = 46
const RING_VIEWBOX = 100
const RING_STROKE_WIDTH = 4
const ROTATION_DEG_PER_MS = 360 / 15_000
const SEEK_STEP = 0.05
const BAR_MIN_SCALE = 0.2
const BAR_MAX_SCALE = 1
const BAR_BASE_DURATION = 0.6
const BAR_DURATION_JITTER = 0.5
const HASH_MULTIPLIER = 12.9898
const HASH_SCALE = 43_758.5453
const SPRING = { bounce: 0.1, duration: 0.25, type: 'spring' as const }
const MOVEMENT_EASE: [number, number, number, number] = [0.645, 0.045, 0.355, 1]

export type RecordPlayToggleProps = Partial<typeof defaults> & {
  /** Called when the seek slider is used to change progress */
  onSeek?: (progress: number) => void
  /** Called whenever the playing state changes */
  onPlayingChange?: (playing: boolean) => void
  /** Track artist, shown under the title */
  artist?: string
  /** Track title, shown above the artist and read by assistive tech */
  title?: string
  className?: string
  style?: CSSProperties
}

const hashUnit = (seed: number) => {
  const x = Math.sin(seed * HASH_MULTIPLIER) * HASH_SCALE
  return x - Math.floor(x)
}

const clampUnit = (value: number) => Math.min(1, Math.max(0, value))

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
      <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
      <rect x="5" y="4" width="5" height="16" rx="1.2" />
      <rect x="14" y="4" width="5" height="16" rx="1.2" />
    </svg>
  )
}

/** 唱片播放键：旋转的唱片 + 环形进度（role="slider"，方向键调节）+ 跳动的波形条。只负责画面，播放状态由外部驱动。 */
export function RecordPlayToggle({ onPlayingChange, onSeek, title, artist, className, style, ...props }: RecordPlayToggleProps) {
  const { size, bars, playing: playingProp, progress, labelColor, spinSpeed, accent } = { ...defaults, ...props }
  const shouldReduceMotion = Boolean(useReducedMotion())
  const rotation = useMotionValue(0)

  // playing 参数是初始 / 外部状态；点击后组件自己切换，外部值变化时再同步。
  const [playing, setPlaying] = useState(playingProp)
  const [prevProp, setPrevProp] = useState(playingProp)
  if (prevProp !== playingProp) {
    setPrevProp(playingProp)
    setPlaying(playingProp)
  }

  const handleToggle = useCallback(() => {
    const next = !playing
    setPlaying(next)
    onPlayingChange?.(next)
  }, [playing, onPlayingChange])

  useAnimationFrame((_, delta) => {
    if (!playing || shouldReduceMotion) return
    rotation.set(rotation.get() + Math.min(delta, 100) * ROTATION_DEG_PER_MS * spinSpeed)
  })

  const handleSeekKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onSeek) return
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault()
        onSeek(clampUnit(progress + SEEK_STEP))
        break
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault()
        onSeek(clampUnit(progress - SEEK_STEP))
        break
      case 'Home':
        event.preventDefault()
        onSeek(0)
        break
      case 'End':
        event.preventDefault()
        onSeek(1)
        break
      default:
        break
    }
  }

  const circumference = 2 * Math.PI * RING_RADIUS
  const label = [title, artist].filter(Boolean).join(' — ')
  const toggleLabel = `${playing ? 'Pause' : 'Play'}${label ? ` ${label}` : ''}`

  return (
    <div className={cn('inline-flex items-center gap-3', className)} style={style}>
      <div className="relative shrink-0" style={{ height: size, width: size }}>
        <div
          aria-label={label ? `Seek ${label}` : 'Seek track'}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={Math.round(progress * 100)}
          className="pointer-events-none absolute inset-0 rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
          onKeyDown={handleSeekKeyDown}
          role="slider"
          tabIndex={onSeek ? 0 : -1}
        >
          <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${RING_VIEWBOX} ${RING_VIEWBOX}`} aria-hidden>
            <circle className="text-foreground/10" cx="50" cy="50" fill="none" r={RING_RADIUS} stroke="currentColor" strokeWidth={RING_STROKE_WIDTH} />
            <motion.circle
              animate={{ strokeDashoffset: circumference * (1 - progress) }}
              cx="50"
              cy="50"
              fill="none"
              r={RING_RADIUS}
              stroke={accent}
              strokeDasharray={circumference}
              strokeLinecap="round"
              strokeWidth={RING_STROKE_WIDTH}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.25, ease: MOVEMENT_EASE }}
            />
          </svg>
        </div>

        <motion.div aria-hidden="true" className="absolute inset-[10%] overflow-hidden rounded-full border border-border bg-muted" style={{ rotate: rotation }}>
          {/* 生成的唱片标签：上游的 cover 图片换成渐变 + 唱纹 */}
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `repeating-radial-gradient(circle at 50% 50%, transparent 0 3px, color-mix(in oklab, var(--foreground) 7%, transparent) 3px 4px), conic-gradient(from 30deg, transparent 0 20%, color-mix(in oklab, white 14%, transparent) 25%, transparent 30% 70%, color-mix(in oklab, white 10%, transparent) 75%, transparent 80%), linear-gradient(to bottom right, color-mix(in oklab, ${labelColor} 55%, transparent), color-mix(in oklab, ${labelColor} 12%, transparent))`,
            }}
          />
          <div className="absolute inset-[38%] rounded-full bg-background" />
        </motion.div>

        <button
          aria-label={toggleLabel}
          aria-pressed={playing}
          className="absolute inset-[38%] z-10 flex items-center justify-center rounded-full bg-background text-foreground shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
          onClick={handleToggle}
          type="button"
        >
          <AnimatePresence initial={false} mode="wait">
            {playing ? (
              <motion.span
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, rotate: 0, scale: 1 }}
                exit={shouldReduceMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, rotate: -45, scale: 0.6 }}
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, rotate: 45, scale: 0.6 }}
                key="pause"
                transition={shouldReduceMotion ? { duration: 0 } : SPRING}
              >
                <PauseIcon />
              </motion.span>
            ) : (
              <motion.span
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, rotate: 0, scale: 1 }}
                exit={shouldReduceMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, rotate: 45, scale: 0.6 }}
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, rotate: -45, scale: 0.6 }}
                key="play"
                transition={shouldReduceMotion ? { duration: 0 } : SPRING}
              >
                <PlayIcon />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        {title || artist ? (
          <div className="flex min-w-0 flex-col">
            {title ? <span className="truncate text-sm font-medium text-foreground">{title}</span> : null}
            {artist ? <span className="truncate text-xs text-muted-foreground">{artist}</span> : null}
          </div>
        ) : null}
        <div aria-hidden="true" className="flex h-5 items-end gap-[2px]">
          {Array.from({ length: bars }).map((_, index) => {
            const heightSeed = hashUnit(index)
            const durationSeed = hashUnit(index + 0.5)
            const delaySeed = hashUnit(index + 0.25)
            const minScale = BAR_MIN_SCALE + heightSeed * 0.15
            const maxScale = BAR_MAX_SCALE - (1 - heightSeed) * 0.3
            const duration = BAR_BASE_DURATION + durationSeed * BAR_DURATION_JITTER
            const delay = delaySeed * duration
            const animate = playing && !shouldReduceMotion ? { scaleY: [minScale, maxScale, minScale] } : { scaleY: minScale }
            const transition =
              playing && !shouldReduceMotion
                ? { delay, duration, ease: MOVEMENT_EASE, repeat: Number.POSITIVE_INFINITY, repeatType: 'mirror' as const }
                : { duration: 0 }
            return (
              <motion.span
                animate={animate}
                className="w-[2px] rounded-full bg-foreground/70"
                key={index}
                style={{ height: '100%', transformOrigin: 'bottom' }}
                transition={transition}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
