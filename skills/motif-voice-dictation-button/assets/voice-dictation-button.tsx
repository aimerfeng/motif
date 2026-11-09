// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Eleven Labs Inc.
// Source: https://github.com/elevenlabs/ui/blob/23c31bd/apps/www/registry/elevenlabs-ui/ui/speech-input.tsx
// Source: https://github.com/elevenlabs/ui/blob/23c31bd/apps/www/registry/elevenlabs-ui/ui/voice-button.tsx
// Source: https://github.com/elevenlabs/ui/blob/23c31bd/apps/www/registry/elevenlabs-ui/ui/live-waveform.tsx
// Modified by Motif; see the item's provenance.
import { cn, useCanvasSize, useFrameLoop, usePrefersReducedMotion } from '@/lib/motif-runtime'
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#f4f4f5',
  size: 'default',
  showTranscript: true,
  showTimer: true,
  shortcut: true,
  feedbackDuration: 1500,
  barDensity: 'fine',
  radius: 6,
}
/* @motif:end */

export type VoiceDictationState = 'idle' | 'recording' | 'processing' | 'success' | 'error'

export type VoiceDictationButtonProps = Partial<typeof defaults> & {
  /** 当前状态，由外部的语音识别驱动。 */
  state?: VoiceDictationState
  /** 已识别的文字（committed + partial）。 */
  transcript?: string
  /** 还没有文字时的占位。 */
  placeholder?: string
  /** 点击麦克风（或快捷键）开始录音。 */
  onStart?: () => void
  /** 点击停止（或快捷键）结束录音。 */
  onStop?: () => void
  /** 点击取消，丢弃本次录音。 */
  onCancel?: () => void
  /** 每帧读取的真实电平（0..1，每根柱子一个）；不传时用合成的声谱。 */
  levels?: () => number[]
  className?: string
  style?: CSSProperties
}

const SIZES = { sm: 32, default: 36, lg: 40 } as const
const DENSITY = { fine: { barWidth: 2, barGap: 1 }, regular: { barWidth: 3, barGap: 1 }, bold: { barWidth: 4, barGap: 2 } } as const

function MicIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="9" y="2" width="6" height="13" rx="3" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      <path d="M12 18v4" />
    </svg>
  )
}
function SquareIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2.5" />
    </svg>
  )
}
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" className={className} aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

/** 合成一个说话时的声谱：低频强、高频弱，随音节起伏。 */
function voiceSpectrum(time: number, count: number): number[] {
  const syllable = 0.35 + 0.65 * Math.abs(Math.sin(time * 3.1) * Math.sin(time * 1.37 + 0.6))
  const out: number[] = []
  for (let i = 0; i < count; i++) {
    const f = i / Math.max(1, count - 1)
    const shape = 1 - f * 0.75
    const jitter = 0.55 + 0.45 * Math.sin(time * (7 + i * 0.9) + i * 2.3) * Math.cos(time * 4.3 - i * 1.1)
    out.push(Math.max(0.05, Math.min(1, shape * jitter * syllable * 1.8)))
  }
  return out
}

/** 上游 LiveWaveform 的 static 模式：柱子对称排列，处理中是一段缓慢的波，结束后淡出。 */
function useWaveform(
  hostRef: RefObject<HTMLElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  opts: { active: boolean; processing: boolean; color: string; barWidth: number; barGap: number; levels?: () => number[] },
) {
  const reduced = usePrefersReducedMotion()
  const size = useCanvasSize(canvasRef, { maxDpr: 2 })
  const optsRef = useRef(opts)
  optsRef.current = opts
  const bars = useRef<number[]>([])
  const lastActive = useRef<number[]>([])
  const transition = useRef(0)
  const fade = useRef(1)
  const processingTime = useRef(0)

  useFrameLoop(
    hostRef,
    ({ time, delta }) => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return
      const { active, processing, color, barWidth, barGap, levels } = optsRef.current
      const { width, height, dpr } = size.current
      const w = width / dpr
      const h = height / dpr
      const step = barWidth + barGap
      const barCount = Math.floor(w / step)
      const half = Math.floor(barCount / 2)
      const t = reduced ? 1.2 : time

      if (active) {
        const data = levels?.() ?? voiceSpectrum(t, half)
        const next: number[] = []
        for (let i = half - 1; i >= 0; i--) next.push(Math.max(0.05, data[Math.floor((i / half) * data.length)] ?? 0.05))
        for (let i = 0; i < half; i++) next.push(Math.max(0.05, data[Math.floor((i / half) * data.length)] ?? 0.05))
        bars.current = next
        lastActive.current = next
        transition.current = 0
        processingTime.current = 0
        fade.current = 1
      } else if (processing) {
        processingTime.current += reduced ? 0 : delta * 1.8
        transition.current = reduced ? 1 : Math.min(1, transition.current + delta * 1.2)
        const pt = processingTime.current
        const next: number[] = []
        for (let i = 0; i < barCount; i++) {
          const n = (i - half) / Math.max(1, half)
          const centerWeight = 1 - Math.abs(n) * 0.4
          const wave = Math.sin(pt * 1.5 + n * 3) * 0.25 + Math.sin(pt * 0.8 - n * 2) * 0.2 + Math.cos(pt * 2 + n) * 0.15
          let value = (0.2 + wave) * centerWeight
          if (lastActive.current.length > 0 && transition.current < 1) {
            const last = lastActive.current[Math.min(i, lastActive.current.length - 1)] ?? 0
            value = last * (1 - transition.current) + value * transition.current
          }
          next.push(Math.max(0.05, Math.min(1, value)))
        }
        bars.current = next
        fade.current = 1
      } else if (bars.current.length > 0) {
        fade.current = reduced ? 0 : Math.max(0, fade.current - delta * 1.8)
        if (fade.current === 0) bars.current = []
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = color
      const centerY = h / 2
      for (let i = 0; i < barCount && i < bars.current.length; i++) {
        const value = (bars.current[i] ?? 0.1) * fade.current
        const barHeight = Math.max(2, value * h * 0.8)
        ctx.globalAlpha = (0.4 + value * 0.6) * fade.current
        ctx.beginPath()
        ctx.roundRect(i * step, centerY - barHeight / 2, barWidth, barHeight, 4)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    },
    { reducedMotion: 'slowed' },
  )
}

function formatTime(seconds: number) {
  const s = Math.floor(seconds)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/**
 * 语音输入按钮：idle 时只是一个麦克风；录音时展开成胶囊（取消、转写预览、波形 + 计时、停止）；
 * 停止后进入 processing，最后用对勾或叉号反馈 feedbackDuration 毫秒。
 */
export function VoiceDictationButton({
  state = 'idle',
  transcript = '',
  placeholder = 'Listening...',
  onStart,
  onStop,
  onCancel,
  levels,
  className,
  style,
  ...props
}: VoiceDictationButtonProps) {
  const { accent, size, showTranscript, showTimer, shortcut, feedbackDuration, barDensity, radius } = { ...defaults, ...props }
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()

  const isRecording = state === 'recording'
  const isProcessing = state === 'processing'
  const isSuccess = state === 'success'
  const isError = state === 'error'

  // 反馈和计时都按帧循环里的 performance.now 计算（截图时也是同一条时间线），不用 setTimeout。
  const [showFeedback, setShowFeedback] = useState(false)
  const feedbackAt = useRef(0)
  const startedAt = useRef(0)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (isSuccess || isError) {
      feedbackAt.current = performance.now()
      setShowFeedback(true)
    } else setShowFeedback(false)
  }, [isSuccess, isError])

  useEffect(() => {
    if (isRecording) {
      startedAt.current = performance.now()
      setElapsed(0)
    }
  }, [isRecording])

  const dims = SIZES[size as keyof typeof SIZES] ?? SIZES.default
  const density = DENSITY[barDensity as keyof typeof DENSITY] ?? DENSITY.fine

  useFrameLoop(
    rootRef,
    () => {
      const now = performance.now()
      if (isRecording) {
        const next = Math.floor((now - startedAt.current) / 1000)
        setElapsed((prev) => (prev === next ? prev : next))
      }
      if (showFeedback && now - feedbackAt.current > feedbackDuration) setShowFeedback(false)
    },
    { reducedMotion: 'slowed' },
  )

  useWaveform(rootRef, canvasRef, {
    active: isRecording,
    processing: isProcessing || isSuccess,
    color: accent,
    barWidth: density.barWidth,
    barGap: density.barGap,
    levels,
  })

  // 上游演示里的 ⌥Space：idle 时开始，录音时停止。
  const handlers = useRef({ state, onStart, onStop })
  handlers.current = { state, onStart, onStop }
  useEffect(() => {
    if (!shortcut) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey || e.code !== 'Space') return
      e.preventDefault()
      const h = handlers.current
      if (h.state === 'recording') h.onStop?.()
      else if (h.state === 'idle') h.onStart?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [shortcut])

  const open = isRecording || isProcessing || showFeedback
  const showWaveform = open
  const showTrailing = !showWaveform && shortcut
  const displayText = transcript || placeholder
  const showPlaceholder = !transcript.trim()
  const inner = Math.max(2, radius - 3)
  const ease = reduced ? 'duration-0' : 'duration-200 ease-out'

  const press = () => {
    if (isRecording) onStop?.()
    else if (state === 'idle' || showFeedback || isSuccess || isError) onStart?.()
  }

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label="Voice input"
      className={cn(
        'relative inline-flex items-center overflow-hidden transition-[background-color,box-shadow]',
        ease,
        open ? 'bg-background shadow-[inset_0_0_0_1px_var(--color-input),0_1px_2px_0_rgba(0,0,0,0.05)] dark:bg-muted' : '',
        className,
      )}
      style={{ borderRadius: radius, ...style }}
    >
      {/* SpeechInputCancelButton */}
      <button
        type="button"
        inert={isRecording ? undefined : true}
        aria-hidden={!isRecording}
        onClick={() => onCancel?.()}
        aria-label="Cancel recording"
        className={cn(
          'flex shrink-0 items-center justify-center text-muted-foreground outline-none transition-[opacity,transform,width,color,background-color] hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
          ease,
          isRecording ? 'scale-[80%] opacity-100' : 'pointer-events-none scale-100 opacity-0',
        )}
        style={{ width: isRecording ? dims : 0, height: dims, borderRadius: inner }}
      >
        <XIcon className="h-3 w-3" />
      </button>

      {/* SpeechInputPreview */}
      {showTranscript && (
        <div
          inert={open ? undefined : true}
          aria-hidden={!open}
          aria-live="polite"
          title={displayText}
          className={cn(
            'relative self-stretch text-sm transition-[opacity,transform,width]',
            ease,
            showPlaceholder ? 'text-muted-foreground italic' : 'text-muted-foreground',
            open ? 'w-20 opacity-100 sm:w-28' : 'w-0 opacity-0',
          )}
        >
          <div className="absolute inset-y-0 -right-1 -left-1 [mask-image:linear-gradient(to_right,transparent,black_10px,black_calc(100%-10px),transparent)]">
            <p className="absolute top-0 right-0 bottom-0 flex h-full min-w-full items-center px-1 whitespace-nowrap">{displayText}</p>
          </div>
        </div>
      )}

      {/* VoiceButton 的波形框：idle 时显示快捷键，录音 / 处理 / 反馈时显示波形 */}
      <div
        className={cn(
          'relative box-content flex shrink-0 items-center justify-center overflow-hidden border transition-[width,opacity,margin,background-color]',
          ease,
          showWaveform || showTrailing ? 'ml-1.5 opacity-100' : 'ml-0 w-0 border-0 opacity-0',
          showWaveform ? 'w-20' : showTrailing ? 'w-14' : '',
          isRecording ? 'border-border' : 'border-border bg-muted/50',
        )}
        style={{ height: 20, borderRadius: Math.min(inner, 6), backgroundColor: isRecording ? `color-mix(in oklab, ${accent} 10%, transparent)` : undefined }}
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className={cn('absolute inset-0 block h-full w-full transition-opacity', ease, showWaveform ? 'opacity-100' : 'opacity-0')}
        />
        {showTrailing && <span className="select-none px-1.5 font-mono text-[10px] font-medium text-muted-foreground">⌥Space</span>}
        {isSuccess && showFeedback && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80" role="status" aria-label="Transcribed">
            <CheckIcon className="size-3.5" />
          </div>
        )}
        {isError && showFeedback && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 text-destructive" role="status" aria-label="Transcription failed">
            <XIcon className="size-3.5" />
          </div>
        )}
      </div>

      {/* 计时 */}
      {showTimer && (
        <span
          aria-hidden={!open}
          className={cn(
            'shrink-0 overflow-hidden text-right font-mono text-[11px] tabular-nums text-muted-foreground transition-[width,opacity]',
            ease,
            open ? 'w-9 opacity-100' : 'w-0 opacity-0',
          )}
        >
          {formatTime(elapsed)}
        </span>
      )}

      {/* SpeechInputRecordButton */}
      <button
        type="button"
        onClick={press}
        disabled={isProcessing}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        aria-pressed={isRecording}
        className={cn(
          'relative flex shrink-0 items-center justify-center text-foreground outline-none transition-[transform,background-color] hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default',
          ease,
          open && 'scale-[80%]',
        )}
        style={{ width: dims, height: dims, borderRadius: inner }}
      >
        <span
          className={cn('absolute h-4 w-4 rounded-full transition-[transform,background-color]', ease, isProcessing ? 'scale-90' : 'scale-[60%] bg-transparent', isProcessing && !reduced && 'animate-pulse')}
          style={isProcessing ? { backgroundColor: accent } : undefined}
        />
        <SquareIcon
          className={cn('absolute h-4 w-4 text-destructive transition-[transform,opacity]', ease, isRecording ? 'scale-100 opacity-100' : 'scale-[60%] opacity-0')}
        />
        <MicIcon className={cn('absolute h-4 w-4 transition-[transform,opacity]', ease, !isRecording && !isProcessing ? 'scale-100 opacity-100' : 'scale-[60%] opacity-0')} />
      </button>
    </div>
  )
}
