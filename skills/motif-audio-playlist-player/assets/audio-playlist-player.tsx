// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Eleven Labs Inc.
// Source: https://github.com/elevenlabs/ui/blob/23c31bd/apps/www/registry/elevenlabs-ui/ui/audio-player.tsx
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop } from '@/lib/motif-runtime'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react'

/* @motif:defaults */
export const defaults = {
  layout: 'playlist',
  accent: '#fafafa',
  radius: 14,
  speedControl: 'menu',
  listWidth: 256,
}
/* @motif:end */

export interface Track {
  id: string
  name: string
  /** 可选的音频地址；不给时用一个静音的模拟时钟播放 duration 秒（预览用）。 */
  src?: string
  /** 模拟播放的时长（秒），没有 src 时使用。 */
  duration?: number
}

export type AudioPlaylistPlayerProps = Partial<typeof defaults> & {
  tracks?: Track[]
  /** 初始选中的曲目。 */
  defaultTrackId?: string
  /** 挂载后立即开始播放（演示用）。 */
  autoPlay?: boolean
  className?: string
  style?: CSSProperties
}

function formatTime(seconds: number) {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  const formattedMins = mins < 10 ? `0${mins}` : mins
  const formattedSecs = secs < 10 ? `0${secs}` : secs

  return hrs > 0 ? `${hrs}:${formattedMins}:${formattedSecs}` : `${mins}:${formattedSecs}`
}

/** 按亮度挑选叠在强调色上的文字颜色。 */
function inkFor(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return '#0a0a0a'
  const n = parseInt(m[1], 16)
  const lin = (c: number) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.4 ? '#0a0a0a' : '#fafafa'
}

interface AudioPlayerItem {
  id: string
  src?: string
  data: Track
}

interface AudioPlayerApi {
  ref: RefObject<HTMLAudioElement | null>
  activeItem: AudioPlayerItem | null
  duration: number | undefined
  isPlaying: boolean
  playbackRate: number
  isItemActive: (id: string | null) => boolean
  play: (item?: AudioPlayerItem | null) => void
  pause: () => void
  seek: (time: number) => void
  setPlaybackRate: (rate: number) => void
}

const AudioPlayerContext = createContext<AudioPlayerApi | null>(null)

export function useAudioPlayer(): AudioPlayerApi {
  const api = useContext(AudioPlayerContext)
  if (!api) throw new Error('useAudioPlayer cannot be called outside of AudioPlayerProvider')
  return api
}

const AudioPlayerTimeContext = createContext<number | null>(null)

export const useAudioPlayerTime = () => {
  const time = useContext(AudioPlayerTimeContext)
  if (time === null) throw new Error('useAudioPlayerTime cannot be called outside of AudioPlayerProvider')
  return time
}

/**
 * 播放状态容器：有 src 的曲目用 <audio> 播放；没有 src 的用模拟时钟（由 useFrameLoop 推进）。
 * 播完一首会自动接下一首。
 */
export function AudioPlayerProvider({
  children,
  hostRef,
  queue,
  initial,
  autoPlay,
}: {
  children: ReactNode
  hostRef: RefObject<HTMLElement | null>
  queue: Track[]
  initial: Track | null
  autoPlay?: boolean
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const toItem = (t: Track | null): AudioPlayerItem | null => (t ? { id: t.id, src: t.src, data: t } : null)
  const [activeItem, setActiveItem] = useState<AudioPlayerItem | null>(() => toItem(initial))
  const [time, setTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState<number | undefined>(undefined)
  const [paused, setPaused] = useState(!autoPlay)
  const [playbackRate, setPlaybackRateState] = useState(1)
  const simTime = useRef(0)
  const state = useRef({ activeItem, paused, playbackRate, queue })
  state.current = { activeItem, paused, playbackRate, queue }

  const simulated = Boolean(activeItem) && !activeItem?.src
  const duration = simulated ? (activeItem?.data.duration ?? 180) : audioDuration

  const load = useCallback((item: AudioPlayerItem | null) => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      if (item?.src) {
        audio.src = item.src
        audio.load()
        audio.playbackRate = state.current.playbackRate
      } else {
        audio.removeAttribute('src')
      }
    }
    simTime.current = 0
    setTime(0)
    setAudioDuration(undefined)
    setActiveItem(item)
  }, [])

  const play = useCallback(
    (item?: AudioPlayerItem | null) => {
      if (item !== undefined && item?.id !== state.current.activeItem?.id) load(item)
      const target = item === undefined ? state.current.activeItem : item
      if (target?.src) void audioRef.current?.play().catch(() => setPaused(true))
      setPaused(!target)
    },
    [load],
  )

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setPaused(true)
  }, [])

  const seek = useCallback((t: number) => {
    if (state.current.activeItem?.src) {
      if (audioRef.current) audioRef.current.currentTime = t
    } else simTime.current = t
    setTime(t)
  }, [])

  const setPlaybackRate = useCallback((rate: number) => {
    if (audioRef.current) audioRef.current.playbackRate = rate
    setPlaybackRateState(rate)
  }, [])

  const isItemActive = useCallback((id: string | null) => activeItem?.id === id, [activeItem])

  const next = useCallback(() => {
    const { queue: q, activeItem: cur } = state.current
    const index = q.findIndex((t) => t.id === cur?.id)
    const following = q[(index + 1) % q.length]
    if (following) play(toItem(following))
  }, [play])

  // 上游用 requestAnimationFrame 轮询 <audio>；这里改用 useFrameLoop，同时推进模拟时钟。
  useFrameLoop(
    hostRef,
    ({ delta }) => {
      const { activeItem: cur, paused: p, playbackRate: rate } = state.current
      if (!cur || p) return
      if (cur.src) {
        if (audioRef.current) setTime(audioRef.current.currentTime)
        return
      }
      const length = cur.data.duration ?? 180
      simTime.current += delta * rate
      if (simTime.current >= length) {
        simTime.current = length
        next()
      }
      // 显示用的时间按 1/20 秒取整，避免每帧都重渲染整个播放器。
      const shown = Math.floor(simTime.current * 20) / 20
      setTime((prev) => (prev === shown ? prev : shown))
    },
    { reducedMotion: 'static' },
  )

  const api = useMemo<AudioPlayerApi>(
    () => ({
      ref: audioRef,
      activeItem,
      duration,
      isPlaying: !paused,
      playbackRate,
      isItemActive,
      play,
      pause,
      seek,
      setPlaybackRate,
    }),
    [activeItem, duration, paused, playbackRate, isItemActive, play, pause, seek, setPlaybackRate],
  )

  return (
    <AudioPlayerContext.Provider value={api}>
      <AudioPlayerTimeContext.Provider value={time}>
        <audio
          ref={audioRef}
          className="hidden"
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setAudioDuration(e.currentTarget.duration)}
          onPause={() => {
            if (state.current.activeItem?.src) setPaused(true)
          }}
          onEnded={next}
        />
        {children}
      </AudioPlayerTimeContext.Provider>
    </AudioPlayerContext.Provider>
  )
}

/* ---------- Icons (inline, lucide-like strokes) ---------- */

const PlayIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M6 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L7.5 3.64A1 1 0 0 0 6 4.5Z" />
  </svg>
)
const PauseIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="14" y="4" width="4" height="16" rx="1" />
    <rect x="6" y="4" width="4" height="16" rx="1" />
  </svg>
)
const SettingsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)
const CheckIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

const focusRing = 'outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background'
const outlineButton = cn(
  'inline-flex items-center justify-center rounded-md border bg-background shadow-xs transition-[background-color,color,opacity] hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50',
  focusRing,
)
const ghostButton = cn('inline-flex items-center justify-center rounded-md transition-[background-color,color] hover:bg-accent hover:text-accent-foreground', focusRing)

/* ---------- Progress (hand-rolled slider replacing @radix-ui/react-slider) ---------- */

export const AudioPlayerProgress = ({ className, accent }: { className?: string; accent: string }) => {
  const player = useAudioPlayer()
  const time = useAudioPlayerTime()
  const wasPlayingRef = useRef(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const max = player.duration ?? 0
  const disabled = player.duration === undefined || !Number.isFinite(player.duration) || Number.isNaN(player.duration)
  const ratio = max > 0 ? Math.min(1, Math.max(0, time / max)) : 0

  const seekTo = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return
    const t = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)) * max
    player.seek(Math.round(t / 0.25) * 0.25)
  }

  const onKeyDown = (e: ReactKeyboardEvent) => {
    const step = e.shiftKey ? 10 : 5
    if (e.key === ' ') {
      e.preventDefault()
      if (!player.isPlaying) player.play()
      else player.pause()
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      player.seek(Math.min(max, time + step))
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      player.seek(Math.max(0, time - step))
    } else if (e.key === 'Home') {
      e.preventDefault()
      player.seek(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      player.seek(max)
    }
  }

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={Math.round(max)}
      aria-valuenow={Math.round(time)}
      aria-valuetext={`${formatTime(time)} of ${formatTime(max)}`}
      aria-disabled={disabled || undefined}
      data-disabled={disabled ? '' : undefined}
      className={cn(
        'group/player relative flex h-4 touch-none items-center rounded-full outline-none select-none data-[disabled]:opacity-50',
        'focus-visible:ring-2 focus-visible:ring-ring/50',
        className,
      )}
      onPointerDown={(e) => {
        if (disabled) return
        wasPlayingRef.current = player.isPlaying
        player.pause()
        e.currentTarget.setPointerCapture(e.pointerId)
        seekTo(e.clientX)
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) seekTo(e.clientX)
      }}
      onPointerUp={(e) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
        e.currentTarget.releasePointerCapture(e.pointerId)
        if (wasPlayingRef.current) player.play()
      }}
      onKeyDown={onKeyDown}
    >
      <div className="relative h-[4px] w-full grow overflow-hidden rounded-full bg-muted">
        <div className="absolute inset-y-0 left-0 h-full" style={{ width: `${ratio * 100}%`, background: accent }} />
      </div>
      <div
        className="pointer-events-none absolute top-1/2 flex h-0 w-0 items-center justify-center opacity-0 transition-opacity group-hover/player:opacity-100 group-focus-visible/player:opacity-100"
        style={{ left: `${ratio * 100}%` }}
        data-slot="slider-thumb"
      >
        <div className="absolute size-3 rounded-full bg-foreground" />
      </div>
    </div>
  )
}

export const AudioPlayerTime = ({ className, ...otherProps }: HTMLAttributes<HTMLSpanElement>) => {
  const time = useAudioPlayerTime()
  return (
    <span {...otherProps} className={cn('text-sm text-muted-foreground tabular-nums', className)}>
      {formatTime(time)}
    </span>
  )
}

export const AudioPlayerDuration = ({ className, ...otherProps }: HTMLAttributes<HTMLSpanElement>) => {
  const player = useAudioPlayer()
  return (
    <span {...otherProps} className={cn('text-sm text-muted-foreground tabular-nums', className)}>
      {player.duration !== null && player.duration !== undefined && !Number.isNaN(player.duration) ? formatTime(player.duration) : '--:--'}
    </span>
  )
}

export function AudioPlayerButton({ item, className, disabled }: { item?: AudioPlayerItem; className?: string; disabled?: boolean }) {
  const player = useAudioPlayer()
  const playing = item ? player.isItemActive(item.id) && player.isPlaying : player.isPlaying
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={playing ? 'Pause' : 'Play'}
      className={cn(outlineButton, 'relative', className)}
      onClick={() => {
        if (playing) player.pause()
        else player.play(item)
      }}
    >
      {playing ? <PauseIcon className="size-4" /> : <PlayIcon className="size-4" />}
    </button>
  )
}

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const

/** 倍速菜单（替代 radix DropdownMenu）：Enter / Space / ↓ 打开，↑↓ 移动，Esc 关闭。 */
export function AudioPlayerSpeed({ speeds = PLAYBACK_SPEEDS, className }: { speeds?: readonly number[]; className?: string }) {
  const player = useAudioPlayer()
  const currentSpeed = player.playbackRate
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    if (!open) return
    const index = Math.max(0, speeds.indexOf(currentSpeed))
    itemRefs.current[index]?.focus()
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const close = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  const onMenuKey = (e: ReactKeyboardEvent) => {
    const items = itemRefs.current.filter(Boolean) as HTMLButtonElement[]
    const index = items.indexOf(document.activeElement as HTMLButtonElement)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      items[(index + 1) % items.length]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      items[(index - 1 + items.length) % items.length]?.focus()
    } else if (e.key === 'Home') {
      e.preventDefault()
      items[0]?.focus()
    } else if (e.key === 'End') {
      e.preventDefault()
      items[items.length - 1]?.focus()
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      e.preventDefault()
      close()
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Playback speed"
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(ghostButton, 'size-9', className)}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setOpen(true)
          }
        }}
      >
        <SettingsIcon className="size-4" />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Playback speed"
          className="absolute right-0 bottom-full z-50 mb-1 max-h-64 min-w-[120px] overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
          onKeyDown={onMenuKey}
        >
          {speeds.map((speed, i) => (
            <button
              key={speed}
              ref={(el) => {
                itemRefs.current[i] = el
              }}
              type="button"
              role="menuitemradio"
              aria-checked={currentSpeed === speed}
              tabIndex={-1}
              className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
              onClick={() => {
                player.setPlaybackRate(speed)
                close()
              }}
            >
              <span className={speed === 1 ? '' : 'font-mono'}>{speed === 1 ? 'Normal' : `${speed}x`}</span>
              {currentSpeed === speed && <CheckIcon className="size-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function AudioPlayerSpeedButtonGroup({ speeds = [0.5, 1, 1.5, 2], accent, className }: { speeds?: readonly number[]; accent: string; className?: string }) {
  const player = useAudioPlayer()
  const currentSpeed = player.playbackRate
  const ink = inkFor(accent)
  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)} role="group" aria-label="Playback speed controls">
      {speeds.map((speed) => {
        const active = currentSpeed === speed
        return (
          <button
            key={speed}
            type="button"
            aria-pressed={active}
            onClick={() => player.setPlaybackRate(speed)}
            className={cn(active ? cn('inline-flex items-center justify-center rounded-md', focusRing) : outlineButton, 'h-8 min-w-[50px] px-2 font-mono text-xs')}
            style={active ? { background: accent, color: ink } : undefined}
          >
            {speed}x
          </button>
        )
      })}
    </div>
  )
}

/* ---------- Blocks (music-player-01 / music-player-02) ---------- */

/** 正在播放的曲目：三根跳动的竖条；用自己的帧循环直接改 transform，不触发 React 渲染。 */
function Equalizer({ accent }: { accent: string }) {
  const hostRef = useRef<HTMLSpanElement>(null)
  const bars = useRef<(HTMLSpanElement | null)[]>([])
  useFrameLoop(
    hostRef,
    ({ time }) => {
      bars.current.forEach((bar, i) => {
        if (bar) bar.style.transform = `scaleY(${(0.35 + 0.65 * Math.abs(Math.sin(time * (5.1 + i * 1.7) + i * 1.3))).toFixed(3)})`
      })
    },
    { reducedMotion: 'static', staticTime: 0.4 },
  )
  return (
    <span ref={hostRef} className="flex h-3.5 items-end gap-[2px]" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          ref={(el) => {
            bars.current[i] = el
          }}
          className="h-full w-[3px] origin-bottom rounded-[1px]"
          style={{ background: accent }}
        />
      ))}
    </span>
  )
}

const SongListItem = ({ song, trackNumber, accent }: { song: Track; trackNumber: number; accent: string }) => {
  const player = useAudioPlayer()
  const isActive = player.isItemActive(song.id)
  const isCurrentlyPlaying = isActive && player.isPlaying

  return (
    <div className="group/song relative">
      <button
        type="button"
        aria-current={isActive ? 'true' : undefined}
        aria-label={`${isCurrentlyPlaying ? 'Pause' : 'Play'} ${song.name}`}
        className={cn(
          'inline-flex h-10 w-full items-center justify-start rounded-md px-3 font-normal transition-[background-color,color] @sm:h-9 @sm:px-2',
          isActive ? 'bg-secondary text-secondary-foreground' : 'hover:bg-accent hover:text-accent-foreground',
          focusRing,
        )}
        onClick={() => {
          if (isCurrentlyPlaying) player.pause()
          else player.play({ id: song.id, src: song.src, data: song })
        }}
      >
        <div className="flex w-full min-w-0 items-center gap-3">
          <div className="relative flex w-5 shrink-0 items-center justify-center">
            {isCurrentlyPlaying ? (
              <>
                <span className="group-hover/song:invisible">
                  <Equalizer accent={accent} />
                </span>
                <PauseIcon className="invisible absolute h-4 w-4 group-hover/song:visible @sm:h-3.5 @sm:w-3.5" />
              </>
            ) : (
              <>
                <span className="text-sm text-muted-foreground tabular-nums group-hover/song:invisible">{trackNumber}</span>
                <PlayIcon className="invisible absolute h-4 w-4 group-hover/song:visible @sm:h-3.5 @sm:w-3.5" />
              </>
            )}
          </div>
          <span className="truncate text-left text-sm">{song.name}</span>
        </div>
      </button>
    </div>
  )
}

function SpeedControl({ mode, accent }: { mode: string; accent: string }) {
  if (mode === 'menu') return <AudioPlayerSpeed className="shrink-0" />
  if (mode === 'buttons') return <AudioPlayerSpeedButtonGroup accent={accent} className="mt-4" />
  return null
}

const Player = ({ accent, speedControl, fallbackTitle }: { accent: string; speedControl: string; fallbackTitle?: string }) => {
  const player = useAudioPlayer()

  return (
    <div className="flex min-w-0 flex-1 items-center p-4 @sm:p-6">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-4">
          <h3 className="truncate text-base font-semibold @sm:text-lg">{player.activeItem?.data?.name ?? fallbackTitle ?? 'No track selected'}</h3>
        </div>
        <div className="flex items-center gap-3 @sm:gap-4">
          <AudioPlayerButton className="h-12 w-12 shrink-0 @sm:h-10 @sm:w-10" disabled={!player.activeItem} />
          <div className="flex min-w-0 flex-1 items-center gap-2 @sm:gap-3">
            <AudioPlayerTime className="text-xs tabular-nums" />
            <AudioPlayerProgress className="flex-1" accent={accent} />
            <AudioPlayerDuration className="text-xs tabular-nums" />
          </div>
          {speedControl === 'menu' && <SpeedControl mode="menu" accent={accent} />}
        </div>
        {speedControl === 'buttons' && <SpeedControl mode="buttons" accent={accent} />}
      </div>
    </div>
  )
}

const EXAMPLE_TRACKS: Track[] = [
  { id: '0', name: 'II - 00', duration: 142 },
  { id: '1', name: 'II - 01', duration: 168 },
  { id: '2', name: 'II - 02', duration: 121 },
  { id: '3', name: 'II - 03', duration: 197 },
  { id: '4', name: 'II - 04', duration: 154 },
  { id: '5', name: 'II - 05', duration: 133 },
]

/**
 * 播放列表播放器（ElevenLabs UI music-player-01 / -02）：左侧曲目列表，右侧标题、播放键、进度条与时间、倍速。
 * layout="single" 时只保留播放器卡片。
 */
export function AudioPlaylistPlayer({ tracks = EXAMPLE_TRACKS, defaultTrackId, autoPlay, className, style, ...props }: AudioPlaylistPlayerProps) {
  const { layout, accent, radius, speedControl, listWidth } = { ...defaults, ...props }
  const hostRef = useRef<HTMLDivElement>(null)
  const initial = tracks.find((t) => t.id === defaultTrackId) ?? (layout === 'single' ? (tracks[0] ?? null) : null)

  return (
    <div ref={hostRef} className={cn('@container w-full', className)} style={style}>
      <AudioPlayerProvider key={layout} hostRef={hostRef} queue={tracks} initial={initial} autoPlay={Boolean(autoPlay && initial)}>
        {layout === 'single' ? (
          <div className="w-full overflow-visible border bg-card p-4 text-card-foreground shadow-sm" style={{ borderRadius: radius }}>
            <SinglePlayer accent={accent} speedControl={speedControl} track={initial} />
          </div>
        ) : (
          <div className="mx-auto w-full overflow-hidden border bg-card p-0 text-card-foreground shadow-sm" style={{ borderRadius: radius }}>
            <div className="flex flex-col @xl:h-[180px] @xl:flex-row">
              <div className="flex flex-col overflow-hidden bg-muted/50 @xl:h-full @xl:w-[var(--list-w)]" style={{ '--list-w': `${listWidth}px` } as CSSProperties}>
                <div className="h-48 w-full overflow-y-auto overscroll-contain [scrollbar-width:thin] @xl:h-full">
                  <div className="space-y-1 p-3" role="list" aria-label="Tracks">
                    {tracks.map((song, index) => (
                      <div role="listitem" key={song.id}>
                        <SongListItem song={song} trackNumber={index + 1} accent={accent} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Player accent={accent} speedControl={speedControl} />
            </div>
          </div>
        )}
      </AudioPlayerProvider>
    </div>
  )
}

function SinglePlayer({ accent, speedControl, track }: { accent: string; speedControl: string; track: Track | null }) {
  const player = useAudioPlayer()
  return (
    <div className="space-y-4">
      <div>
        <h3 className="truncate text-base font-semibold">{player.activeItem?.data?.name || track?.name}</h3>
      </div>
      <div className="flex items-center gap-3">
        <AudioPlayerButton className="h-10 w-10 shrink-0" item={track ? { id: track.id, src: track.src, data: track } : undefined} />
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <AudioPlayerTime className="text-xs tabular-nums" />
          <AudioPlayerProgress className="flex-1" accent={accent} />
          <AudioPlayerDuration className="text-xs tabular-nums" />
        </div>
        {speedControl === 'menu' && <SpeedControl mode="menu" accent={accent} />}
      </div>
      {speedControl === 'buttons' && <AudioPlayerSpeedButtonGroup accent={accent} />}
    </div>
  )
}
