// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Eleven Labs Inc.
// Source: https://github.com/elevenlabs/ui/blob/23c31bd/apps/www/registry/elevenlabs-ui/blocks/realtime-transcriber-01/page.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  auraColors: ['#22d3ee', '#a855f7', '#fb923c', '#86efac', '#c084fc'],
  auraIntensity: 1,
  blurAmount: 3.5,
  charDelay: 0.012,
  fontSize: 20,
  partialOpacity: 0.6,
  align: 'start',
  showControls: true,
}
/* @motif:end */

export type TranscriptionStatus = 'idle' | 'connecting' | 'connected'

export type LiveTranscriptionLabels = {
  title: string
  description: string
  start: string
  stop: string
  connecting: string
  listening: string
}

const DEFAULT_LABELS: LiveTranscriptionLabels = {
  title: 'Realtime Speech to Text',
  description: 'Transcribe your voice in real-time with high accuracy',
  start: 'Start Transcribing',
  stop: 'Stop',
  connecting: 'Connecting...',
  listening: 'Say something aloud...',
}

export type LiveTranscriptionAuraProps = Partial<typeof defaults> & {
  /** 连接状态：idle 显示开始面板，connecting / connected 时亮起极光。 */
  status?: TranscriptionStatus
  /** 已确认（final）的片段，按顺序用空格连接。 */
  committed?: string[]
  /** 正在识别、还没确认的尾巴（partial）。 */
  partial?: string
  /** 出错时代替文字稿显示。 */
  error?: string
  onStart?: () => void
  onStop?: () => void
  /** Cmd/Ctrl+K 切换开始 / 停止。 */
  hotkey?: boolean
  labels?: Partial<LiveTranscriptionLabels>
  className?: string
  style?: CSSProperties
}

/** #rrggbb + 透明度 → rgba()；强度放大后透明度封顶在 1。 */
function rgba(hex: string, alpha: number): string {
  const n = Number.parseInt(hex.slice(1, 7), 16) || 0
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${Math.min(1, Math.max(0, alpha)).toFixed(3)})`
}

const TranscriptCharacter = memo(function TranscriptCharacter({ char, delay, partialColor }: { char: string; delay: number; partialColor?: string }) {
  // 延迟只在挂载时定下来：之后再改 animation-delay 会让已经出现的字退回起始帧。
  const [mountDelay] = useState(delay)
  return (
    <span className="lta-char" style={{ '--lta-delay': `${mountDelay}s`, color: partialColor } as CSSProperties}>
      {char}
    </span>
  )
})

// 背景极光：结构、渐变和模糊值照搬上游，颜色换成 palette，vh / vw 换成面板的百分比。
const BackgroundAura = memo(function BackgroundAura({ status, isConnected, colors, intensity }: { status: TranscriptionStatus; isConnected: boolean; colors: string[]; intensity: number }) {
  const isActive = status === 'connecting' || isConnected
  const list = colors.length > 0 ? colors : defaults.auraColors
  const c = (index: number, alpha: number) => rgba(list[index % list.length]!, alpha * intensity)

  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out', isActive ? 'opacity-100' : 'opacity-0')}>
      {/* Center bottom pool - main glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: '130%',
          height: '20%',
          background: `radial-gradient(ellipse 100% 100% at 50% 100%, ${c(0, 0.5)} 0%, ${c(1, 0.4)} 35%, ${c(2, 0.5)} 70%, transparent 100%)`,
          filter: 'blur(80px)',
        }}
      />

      {/* Pulsing layer */}
      <div
        className={cn('absolute bottom-0 left-1/2 -translate-x-1/2 animate-pulse motion-reduce:animate-none', isConnected ? 'opacity-100' : 'opacity-80')}
        style={{
          width: '100%',
          height: '18%',
          background: `radial-gradient(ellipse 100% 100% at 50% 100%, ${c(3, 0.5)} 0%, ${c(4, 0.4)} 50%, transparent 100%)`,
          filter: 'blur(60px)',
          animationDuration: '4s',
        }}
      />

      {/* Left corner bloom */}
      <div
        className="absolute bottom-0 left-0"
        style={{
          width: '25%',
          height: '30%',
          background: `radial-gradient(circle at 0% 100%, ${c(0, 0.5)} 0%, ${c(3, 0.3)} 30%, transparent 60%)`,
          filter: 'blur(70px)',
        }}
      />

      {/* Left rising glow - organic curve */}
      <div
        className="lta-glow-rise absolute bottom-0 -left-8"
        style={{
          width: '20%',
          height: '45%',
          background: `radial-gradient(ellipse 50% 100% at 10% 100%, ${c(0, 0.4)} 0%, ${c(3, 0.25)} 25%, transparent 60%)`,
          filter: 'blur(60px)',
        }}
      />

      {/* Right corner bloom */}
      <div
        className="absolute right-0 bottom-0"
        style={{
          width: '25%',
          height: '30%',
          background: `radial-gradient(circle at 100% 100%, ${c(2, 0.5)} 0%, ${c(2, 0.3)} 30%, transparent 60%)`,
          filter: 'blur(70px)',
        }}
      />

      {/* Right rising glow - organic curve */}
      <div
        className="lta-glow-rise-reverse absolute -right-8 bottom-0"
        style={{
          width: '20%',
          height: '45%',
          background: `radial-gradient(ellipse 50% 100% at 90% 100%, ${c(2, 0.4)} 0%, ${c(4, 0.25)} 25%, transparent 60%)`,
          filter: 'blur(60px)',
        }}
      />

      {/* Shimmer overlay */}
      <div
        className="lta-shimmer-band absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: '100%',
          height: '15%',
          background: `linear-gradient(90deg, ${c(0, 0.3)} 0%, ${c(1, 0.3)} 30%, ${c(2, 0.3)} 60%, ${c(3, 0.3)} 100%)`,
          filter: 'blur(30px)',
        }}
      />
    </div>
  )
})

function ShimmeringText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cn('lta-shimmer-text', className)} style={{ '--lta-spread': `${text.length * 2}px` } as CSSProperties}>
      {text}
    </span>
  )
}

function Kbd({ isMac, className }: { isMac: boolean; className?: string }) {
  return <kbd className={cn('border-background/20 bg-background/10 h-5 items-center rounded border px-1.5 font-mono text-xs', className)}>{isMac ? '⌘K' : 'Ctrl+K'}</kbd>
}

function BottomControls({ isConnected, hasError, isMac, label, onStop }: { isConnected: boolean; hasError: boolean; isMac: boolean; label: string; onStop?: () => void }) {
  const reduced = useReducedMotion()
  const offset = reduced ? 0 : 10
  return (
    <AnimatePresence mode="popLayout">
      {isConnected && !hasError && (
        <motion.div
          key="bottom-controls"
          initial={{ opacity: 0, y: offset }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.1 } }}
          exit={{ opacity: 0, y: offset, transition: { duration: 0.1 } }}
          className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2"
        >
          <button
            type="button"
            onClick={onStop}
            className="bg-foreground text-background border-foreground/10 focus-visible:ring-ring focus-visible:ring-offset-background inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium shadow-lg transition-opacity outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            {label}
            <Kbd isMac={isMac} className="inline-flex" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="8" y="8" width="13" height="13" rx="2" />
      <path d="M4 16V5a1 1 0 0 1 1-1h11" />
    </svg>
  )
}

function TranscriberTranscript({
  committed,
  partial,
  error,
  isConnected,
  blurAmount,
  charDelay,
  fontSize,
  partialOpacity,
  align,
}: {
  committed: string[]
  partial: string
  error: string
  isConnected: boolean
  blurAmount: number
  charDelay: number
  fontSize: number
  partialOpacity: number
  align: string
}) {
  const committedText = committed.join(' ')
  const transcript = error || (committedText && partial ? `${committedText} ${partial}` : committedText || partial)
  const committedLength = error ? transcript.length : committedText.length
  const isPartial = !error && Boolean(partial)
  const characters = useMemo(() => transcript.split(''), [transcript])

  // 上一次渲染时已经有多少个字：新出现的字从这里开始错开浮现。
  const previousNumChars = useRef(0)
  const prev = Math.min(previousNumChars.current, characters.length)
  useEffect(() => {
    previousNumChars.current = characters.length
  }, [characters.length])

  // 自动滚到底，让最新一行留在视野里；读者往上翻时不打扰他。
  const scrollRef = useRef<HTMLDivElement>(null)
  const stickToBottom = useRef(true)
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (isConnected && el && stickToBottom.current) el.scrollTop = el.scrollHeight
  }, [transcript, isConnected, fontSize])

  const partialColor = `color-mix(in oklab, var(--foreground) ${Math.round(partialOpacity * 100)}%, transparent)`

  return (
    <div className="absolute inset-0 flex flex-col">
      <div
        ref={scrollRef}
        onScroll={(event) => {
          const el = event.currentTarget
          stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48
        }}
        className="lta-scroll flex-1 overflow-y-auto"
      >
        <div className="flex min-h-full w-full flex-col justify-end px-2 pt-16 pb-16 sm:px-12">
          <div
            aria-hidden
            className={cn('text-foreground/90 w-full leading-relaxed font-light', error && 'text-destructive', align === 'center' ? 'text-center' : 'text-start')}
            style={{ fontSize, '--lta-blur': `${blurAmount}px` } as CSSProperties}
          >
            {characters.map((char, index) => {
              const delay = index >= prev ? (index - prev + 1) * charDelay : 0
              return <TranscriptCharacter key={index} char={char} delay={delay} partialColor={!error && index >= committedLength ? partialColor : undefined} />
            })}
          </div>
        </div>
      </div>
      {transcript && !error && !isPartial && (
        <button
          type="button"
          className="hover:bg-accent focus-visible:ring-ring absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-md opacity-0 transition-opacity outline-none hover:opacity-60 focus-visible:opacity-60 focus-visible:ring-2"
          onClick={() => {
            void navigator.clipboard?.writeText(transcript).catch(() => {})
          }}
          aria-label="Copy transcript"
        >
          <CopyIcon />
        </button>
      )}
    </div>
  )
}

/**
 * 整屏的实时转写界面。受控组件：状态、已确认片段和 partial 由任意语音识别源提供，
 * 组件只负责逐字浮现、未确认尾巴变暗、跟随最新一行和底部极光。
 */
export function LiveTranscriptionAura({ status = 'idle', committed = [], partial = '', error = '', onStart, onStop, hotkey = true, labels, className, style, ...props }: LiveTranscriptionAuraProps) {
  const { auraColors, auraIntensity, blurAmount, charDelay, fontSize, partialOpacity, align, showControls } = { ...defaults, ...props }
  const text = { ...DEFAULT_LABELS, ...labels }
  const connectionState = status

  const [isMac, setIsMac] = useState(true)
  useEffect(() => {
    setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent))
  }, [])

  const toggle = useRef<() => void>(() => {})
  toggle.current = () => {
    if (connectionState === 'idle') onStart?.()
    else onStop?.()
  }

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    if (!hotkey) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey) && e.target instanceof HTMLElement && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault()
        toggle.current()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hotkey])

  const isConnected = connectionState === 'connected'
  const displayText = error || committed.join(' ') || partial
  const hasContent = Boolean(displayText) && isConnected

  return (
    <div className={cn('bg-background text-foreground relative isolate flex h-full w-full flex-col items-center justify-center overflow-hidden', className)} style={style}>
      <BackgroundAura status={connectionState} isConnected={isConnected} colors={auraColors} intensity={auraIntensity} />

      {/* 读屏只播报确认过的片段：partial 每个字都在变，逐字播报会很吵。 */}
      <div role="log" aria-live="polite" aria-label="Transcript" className="sr-only">
        {isConnected && committed.map((segment, index) => <p key={index}>{segment}</p>)}
        {error && <p role="alert">{error}</p>}
      </div>

      <div className="relative mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center gap-8 overflow-hidden px-4 py-12 sm:px-8">
        {/* Main transcript area */}
        <div className="relative flex min-h-[280px] w-full flex-1 items-center justify-center overflow-hidden">
          {/* Transcript - shown when there's content */}
          <div className={cn('absolute inset-0 transition-opacity duration-250', hasContent ? 'opacity-100' : 'pointer-events-none opacity-0')}>
            {hasContent && (
              <TranscriberTranscript
                committed={committed}
                partial={partial}
                error={error}
                isConnected={isConnected}
                blurAmount={blurAmount}
                charDelay={charDelay}
                fontSize={fontSize}
                partialOpacity={partialOpacity}
                align={align}
              />
            )}
          </div>

          {/* Status text - shown when no content */}
          <div aria-live="polite" className={cn('absolute inset-0 flex items-center justify-center transition-opacity duration-250', !hasContent ? 'opacity-100' : 'pointer-events-none opacity-0')}>
            <div className={cn('absolute transition-opacity duration-250', connectionState === 'connecting' ? 'opacity-100' : 'pointer-events-none opacity-0')}>
              {connectionState === 'connecting' && <ShimmeringText text={text.connecting} className="text-2xl font-light tracking-wide whitespace-nowrap" />}
            </div>
            <div className={cn('absolute transition-opacity duration-250', isConnected && !hasContent ? 'opacity-100' : 'pointer-events-none opacity-0')}>
              {isConnected && !hasContent && <ShimmeringText text={text.listening} className="text-2xl font-light tracking-wide whitespace-nowrap sm:text-3xl" />}
            </div>
          </div>

          {/* Start button - only shown when not connected */}
          <div inert={connectionState !== 'idle'} className={cn('absolute inset-0 flex items-center justify-center transition-opacity duration-250', connectionState === 'idle' ? 'opacity-100' : 'pointer-events-none opacity-0')}>
            <div className="flex w-full max-w-sm flex-col gap-4 px-4 sm:px-8">
              <div className="flex flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-2 text-center">
                  <h2 className="text-2xl font-semibold tracking-tight">{text.title}</h2>
                  <p className="text-muted-foreground text-sm">{text.description}</p>
                </div>

                <button
                  type="button"
                  onClick={onStart}
                  className="bg-foreground/95 text-background hover:bg-foreground/90 focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-10 w-full items-center justify-center gap-3 rounded-md px-6 text-sm font-medium shadow-xs transition-[background-color] outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                >
                  <span>{text.start}</span>
                  <Kbd isMac={isMac} className="hidden gap-1 sm:inline-flex" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {showControls && <BottomControls isConnected={isConnected} hasError={Boolean(error)} isMac={isMac} label={text.stop} onStop={onStop} />}
      </div>
    </div>
  )
}
