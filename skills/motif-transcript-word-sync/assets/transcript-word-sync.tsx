// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Eleven Labs Inc.
// Source: https://github.com/elevenlabs/ui/blob/23c31bd/apps/www/registry/elevenlabs-ui/ui/transcript-viewer.tsx
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop, usePrefersReducedMotion } from '@/lib/motif-runtime'
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'

/* @motif:defaults */
export const defaults = {
  highlight: '#fafafa',
  accent: '#fafafa',
  fontSize: 20,
  unspokenOpacity: 0.5,
  rate: 1,
  clickToSeek: true,
  autoScroll: true,
  showScrubBar: true,
}
/* @motif:end */

/** ElevenLabs 风格的逐字对齐数据（替代 @elevenlabs/elevenlabs-js 的类型）。 */
export type CharacterAlignment = {
  characters: string[]
  characterStartTimesSeconds: number[]
  characterEndTimesSeconds: number[]
}

/** 简单的逐词时间（秒）。 */
export type WordTiming = { text: string; startTime: number; endTime: number }

type BaseSegment = { segmentIndex: number; text: string }
export type TranscriptWord = BaseSegment & { kind: 'word'; wordIndex: number; startTime: number; endTime: number }
type GapSegment = BaseSegment & { kind: 'gap' }
export type TranscriptSegment = TranscriptWord | GapSegment

type ComposeSegmentsResult = { segments: TranscriptSegment[]; words: TranscriptWord[] }

export type TranscriptWordSyncProps = Partial<typeof defaults> & {
  /** 逐词时间。与 alignment 二选一。 */
  words?: WordTiming[]
  /** ElevenLabs 逐字对齐数据。 */
  alignment?: CharacterAlignment
  /** 可选的音频；不给时用静音的模拟时钟播放（预览用）。 */
  audioSrc?: string
  hideAudioTags?: boolean
  /** 挂载后立即播放（只对模拟时钟有效；真实音频受浏览器自动播放策略限制）。 */
  autoPlay?: boolean
  /** 播完从头再来（模拟时钟）。 */
  loop?: boolean
  /** 初始播放位置（秒）。 */
  defaultTime?: number
  className?: string
  style?: CSSProperties
}

function composeSegments(alignment: CharacterAlignment, options: { hideAudioTags?: boolean } = {}): ComposeSegmentsResult {
  const { characters, characterStartTimesSeconds: starts, characterEndTimesSeconds: ends } = alignment

  const segments: TranscriptSegment[] = []
  const words: TranscriptWord[] = []

  let wordBuffer = ''
  let whitespaceBuffer = ''
  let wordStart = 0
  let wordEnd = 0
  let segmentIndex = 0
  let wordIndex = 0
  let insideAudioTag = false

  const hideAudioTags = options.hideAudioTags ?? false

  const flushWhitespace = () => {
    if (!whitespaceBuffer) return
    segments.push({ kind: 'gap', segmentIndex: segmentIndex++, text: whitespaceBuffer })
    whitespaceBuffer = ''
  }

  const flushWord = () => {
    if (!wordBuffer) return
    const word: TranscriptWord = {
      kind: 'word',
      segmentIndex: segmentIndex++,
      wordIndex: wordIndex++,
      text: wordBuffer,
      startTime: wordStart,
      endTime: wordEnd,
    }
    segments.push(word)
    words.push(word)
    wordBuffer = ''
  }

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i]
    const start = starts[i] ?? 0
    const end = ends[i] ?? start

    if (hideAudioTags) {
      if (char === '[') {
        flushWord()
        whitespaceBuffer = ''
        insideAudioTag = true
        continue
      }
      if (insideAudioTag) {
        if (char === ']') insideAudioTag = false
        continue
      }
    }

    if (/\s/.test(char)) {
      flushWord()
      whitespaceBuffer += char
      continue
    }

    if (whitespaceBuffer) flushWhitespace()

    if (!wordBuffer) {
      wordBuffer = char
      wordStart = start
      wordEnd = end
    } else {
      wordBuffer += char
      wordEnd = end
    }
  }

  flushWord()
  flushWhitespace()

  return { segments, words }
}

function composeFromWords(timings: WordTiming[]): ComposeSegmentsResult {
  const segments: TranscriptSegment[] = []
  const words: TranscriptWord[] = []
  timings.forEach((t, i) => {
    if (i > 0) segments.push({ kind: 'gap', segmentIndex: segments.length, text: ' ' })
    const word: TranscriptWord = { kind: 'word', segmentIndex: segments.length, wordIndex: i, text: t.text, startTime: t.startTime, endTime: t.endTime }
    segments.push(word)
    words.push(word)
  })
  return { segments, words }
}

function formatTimestamp(value: number) {
  if (!Number.isFinite(value) || value < 0) return '0:00'
  const totalSeconds = Math.floor(value)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function luminance(color: string) {
  const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(color.trim())
  if (!m) return null
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1]
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** 在白字和近黑字里选对比度更高的那个。 */
function readable(color: string) {
  const l = luminance(color)
  if (l === null) return '#0a0a0a'
  const inkL = luminance('#0a0a0a') ?? 0
  return (l + 0.05) / (inkL + 0.05) > 1.05 / (l + 0.05) ? '#0a0a0a' : '#ffffff'
}

type WordStatus = 'spoken' | 'unspoken' | 'current'

const TranscriptWords = memo(function TranscriptWords({
  segments,
  currentSegmentIndex,
  nearEnd,
  clickToSeek,
  onSeekWord,
}: {
  segments: TranscriptSegment[]
  currentSegmentIndex: number
  nearEnd: boolean
  clickToSeek: boolean
  onSeekWord: (word: TranscriptWord) => void
}) {
  return (
    <>
      {segments.map((segment) => {
        const status: WordStatus = nearEnd
          ? 'spoken'
          : segment.segmentIndex < currentSegmentIndex
            ? 'spoken'
            : segment.segmentIndex === currentSegmentIndex
              ? 'current'
              : 'unspoken'
        if (segment.kind === 'gap') {
          return (
            <span key={`gap-${segment.segmentIndex}`} data-kind="gap" data-status={status}>
              {segment.text}
            </span>
          )
        }
        return (
          <span
            key={`word-${segment.segmentIndex}`}
            data-slot="transcript-word"
            data-kind="word"
            data-status={status}
            data-current={status === 'current' ? '' : undefined}
            onClick={clickToSeek ? () => onSeekWord(segment) : undefined}
            className={cn(
              'rounded-sm px-0.5 transition-[color,background-color,opacity] duration-150 motion-reduce:transition-none',
              status === 'spoken' && 'text-foreground',
              status === 'unspoken' && 'text-foreground opacity-[var(--tws-unspoken)]',
              status === 'current' && 'bg-[var(--tws-highlight)] text-[var(--tws-highlight-ink)]',
              clickToSeek && 'cursor-pointer',
              clickToSeek && status !== 'current' && 'hover:bg-foreground/10',
            )}
          >
            {segment.text}
          </span>
        )
      })}
    </>
  )
})

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
      <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  )
}

export function TranscriptWordSync({
  words: wordTimings,
  alignment,
  audioSrc,
  hideAudioTags = true,
  autoPlay = false,
  loop = false,
  defaultTime = 0,
  className,
  style,
  ...props
}: TranscriptWordSyncProps) {
  const o = { ...defaults, ...props }
  const hostRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()

  const { segments, words } = useMemo(() => {
    if (wordTimings) return composeFromWords(wordTimings)
    if (alignment) return composeSegments(alignment, { hideAudioTags })
    return { segments: [], words: [] }
  }, [wordTimings, alignment, hideAudioTags])

  // 从对齐数据估一个时长，音频元数据加载前用
  const guessedDuration = useMemo(() => {
    const ends = alignment?.characterEndTimesSeconds
    if (!wordTimings && Array.isArray(ends) && ends.length) {
      const last = ends[ends.length - 1]
      return Number.isFinite(last) ? last : 0
    }
    if (words.length) {
      const lastWord = words[words.length - 1]
      return Number.isFinite(lastWord.endTime) ? lastWord.endTime : 0
    }
    return 0
  }, [alignment, wordTimings, words])

  const [isPlaying, setIsPlaying] = useState(autoPlay && !audioSrc)
  const [duration, setDuration] = useState(guessedDuration)
  const [currentTime, setCurrentTime] = useState(defaultTime)
  const timeRef = useRef(defaultTime)
  const scrubbing = useRef(false)

  useEffect(() => {
    setDuration(guessedDuration)
  }, [guessedDuration])

  const state = useRef({ isPlaying, duration, loop, rate: o.rate, audioSrc, autoScroll: o.autoScroll })
  state.current = { isPlaying, duration, loop, rate: o.rate, audioSrc, autoScroll: o.autoScroll }

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = o.rate
  }, [o.rate])

  // 上游用 requestAnimationFrame 轮询 <audio>；这里改用 useFrameLoop，没有音频时推进模拟时钟。
  useFrameLoop(
    hostRef,
    ({ delta }) => {
      const s = state.current
      if (s.isPlaying && !scrubbing.current) {
        const audio = audioRef.current
        if (s.audioSrc && audio) {
          timeRef.current = audio.currentTime
          if (Number.isFinite(audio.duration) && audio.duration > 0 && audio.duration !== s.duration) setDuration(audio.duration)
        } else if (!s.audioSrc) {
          let t = timeRef.current + delta * s.rate
          if (t >= s.duration) {
            if (s.loop) t = 0
            else {
              t = s.duration
              setIsPlaying(false)
            }
          }
          timeRef.current = t
        }
        setCurrentTime(timeRef.current)
      }
      // 自动滚动：让当前词停在可视区上部三分之一处，带缓动
      const box = scrollRef.current
      if (s.autoScroll && box) {
        const el = box.querySelector<HTMLElement>('[data-current]')
        if (el) {
          const target = Math.max(0, Math.min(box.scrollHeight - box.clientHeight, el.offsetTop - box.clientHeight / 3))
          const diff = target - box.scrollTop
          if (Math.abs(diff) > 0.5) box.scrollTop += delta === 0 ? diff : diff * Math.min(1, delta * 6)
        }
      }
    },
    { reducedMotion: 'static' },
  )

  // 真实音频的事件同步
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !audioSrc) return
    const syncPlayback = () => setIsPlaying(!audio.paused)
    const syncTime = () => {
      timeRef.current = audio.currentTime
      setCurrentTime(audio.currentTime)
    }
    const syncDuration = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) setDuration(audio.duration)
    }
    const onStop = () => {
      syncPlayback()
      syncTime()
    }
    audio.addEventListener('play', syncPlayback)
    audio.addEventListener('pause', onStop)
    audio.addEventListener('ended', onStop)
    audio.addEventListener('seeked', syncTime)
    audio.addEventListener('durationchange', syncDuration)
    audio.addEventListener('loadedmetadata', syncDuration)
    return () => {
      audio.removeEventListener('play', syncPlayback)
      audio.removeEventListener('pause', onStop)
      audio.removeEventListener('ended', onStop)
      audio.removeEventListener('seeked', syncTime)
      audio.removeEventListener('durationchange', syncDuration)
      audio.removeEventListener('loadedmetadata', syncDuration)
    }
  }, [audioSrc])

  const seekToTime = useCallback(
    (time: number) => {
      const t = Math.min(Math.max(time, 0), state.current.duration || 0)
      timeRef.current = t
      setCurrentTime(t)
      if (audioRef.current && audioSrc) audioRef.current.currentTime = t
    },
    [audioSrc],
  )

  const seekToWord = useCallback((word: TranscriptWord) => seekToTime(word.startTime), [seekToTime])

  const play = () => {
    const audio = audioRef.current
    if (audioSrc && audio) {
      if (audio.paused) void audio.play()
      return
    }
    if (timeRef.current >= duration - 0.01) seekToTime(0)
    setIsPlaying(true)
  }
  const pause = () => {
    const audio = audioRef.current
    if (audioSrc && audio) {
      if (!audio.paused) audio.pause()
      return
    }
    setIsPlaying(false)
  }

  // 当前词：最后一个已经开始的词（上游在词间隙里也停在上一个词上）
  const currentWordIndex = useMemo(() => {
    if (!words.length) return -1
    let lo = 0
    let hi = words.length - 1
    let answer = 0
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      if (words[mid].startTime <= currentTime) {
        answer = mid
        lo = mid + 1
      } else hi = mid - 1
    }
    return answer
  }, [words, currentTime])
  const currentSegmentIndex = currentWordIndex >= 0 ? words[currentWordIndex].segmentIndex : -1
  const nearEnd = duration > 0 && currentTime >= duration - 0.01

  // 进度条拖动
  const getTimeFromClientX = (clientX: number) => {
    const track = trackRef.current
    if (!track || !duration) return null
    const rect = track.getBoundingClientRect()
    const ratio = (clientX - rect.left) / rect.width
    return duration * Math.min(Math.max(ratio, 0), 1)
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!duration) return
    event.preventDefault()
    event.currentTarget.focus()
    scrubbing.current = true
    const time = getTimeFromClientX(event.clientX)
    if (time != null) seekToTime(time)
    const handleMove = (moveEvent: PointerEvent) => {
      const next = getTimeFromClientX(moveEvent.clientX)
      if (next != null) seekToTime(next)
    }
    const handleUp = () => {
      scrubbing.current = false
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp, { once: true })
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 5
    let next: number | null = null
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = currentTime + step
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = currentTime - step
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = duration
    if (next === null) return
    event.preventDefault()
    seekToTime(next)
  }

  const clamped = Math.min(Math.max(currentTime, 0), duration || 0)
  const progress = duration > 0 ? (clamped / duration) * 100 : 0
  const lineHeight = 1.625

  return (
    <div
      ref={hostRef}
      data-slot="transcript-viewer-root"
      className={cn('w-full space-y-4 rounded-xl border bg-card p-4 text-card-foreground', className)}
      style={
        {
          '--tws-highlight': o.highlight,
          '--tws-highlight-ink': readable(o.highlight),
          '--tws-accent': o.accent,
          '--tws-unspoken': String(o.unspokenOpacity),
          ...style,
        } as CSSProperties
      }
    >
      {audioSrc ? <audio ref={audioRef} className="sr-only" controls={false} preload="metadata" src={audioSrc} /> : null}
      <div
        ref={scrollRef}
        data-slot="transcript-words"
        className={cn('relative leading-relaxed break-words', o.autoScroll && 'overflow-y-auto overscroll-contain [scrollbar-width:none]')}
        style={{
          fontSize: o.fontSize,
          maxHeight: o.autoScroll ? `${o.fontSize * lineHeight * 4}px` : undefined,
          scrollBehavior: reduced ? 'auto' : undefined,
        }}
      >
        <TranscriptWords segments={segments} currentSegmentIndex={currentSegmentIndex} nearEnd={nearEnd} clickToSeek={o.clickToSeek} onSeekWord={seekToWord} />
      </div>
      {o.showScrubBar ? (
        <div data-slot="transcript-scrub-bar" className="flex w-full items-center">
          <div className="flex flex-1 flex-col gap-1">
            <div
              ref={trackRef}
              data-slot="scrub-bar-track"
              className="relative h-2 w-full grow cursor-pointer touch-none rounded-full bg-secondary select-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              onPointerDown={handlePointerDown}
              onKeyDown={handleKeyDown}
              role="slider"
              tabIndex={0}
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration || 0)}
              aria-valuenow={Math.round(clamped)}
              aria-valuetext={`${formatTimestamp(clamped)} of ${formatTimestamp(duration)}`}
            >
              <div data-slot="scrub-bar-progress" className="absolute inset-y-0 left-0 overflow-hidden rounded-full" style={{ width: `${progress}%` }}>
                <div className="h-full w-full bg-[var(--tws-accent)]" />
              </div>
              <div
                data-slot="scrub-bar-thumb"
                className="absolute top-1/2 block h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--tws-accent)] shadow-sm transition-colors"
                style={{ left: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span data-slot="scrub-bar-time-label" className="tabular-nums">
                {formatTimestamp(clamped)}
              </span>
              <span data-slot="scrub-bar-time-label" className="tabular-nums">
                {formatTimestamp(duration - clamped)}
              </span>
            </div>
          </div>
        </div>
      ) : null}
      <button
        type="button"
        data-slot="transcript-play-pause-button"
        data-playing={isPlaying}
        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
        onClick={isPlaying ? pause : play}
        className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-4 text-sm font-medium text-foreground shadow-xs transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
      >
        {isPlaying ? (
          <>
            <PauseIcon /> Pause
          </>
        ) : (
          <>
            <PlayIcon /> Play
          </>
        )}
      </button>
    </div>
  )
}
