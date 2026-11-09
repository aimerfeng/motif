// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Eleven Labs Inc.
// Source: https://github.com/elevenlabs/ui/blob/23c31bd/apps/www/registry/elevenlabs-ui/ui/conversation-bar.tsx
// Modified by Motif; see the item's provenance.
import { cn, useCanvasSize, useFrameLoop } from '@/lib/motif-runtime'
import { useCallback, useRef, useState, type ButtonHTMLAttributes, type ChangeEvent, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  agentName: 'Customer Support',
  accent: '#fafafa',
  surface: '#0a0a0a',
  waveColor: '#d4d4d8',
  radius: 14,
  width: 448,
  allowTyping: true,
  position: 'inline',
}
/* @motif:end */

export type ConversationStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export type VoiceCallBarProps = Partial<typeof defaults> & {
  /** Controlled connection status. Leave undefined to let the bar run its own state machine. */
  status?: ConversationStatus
  /** Called when the call button starts a session. Return a promise to show "connecting" until it settles (rejecting shows the error state). */
  onStartSession?: () => void | Promise<void>
  onEndSession?: () => void
  /** Called when the user sends a typed message. */
  onSendMessage?: (message: string) => void
  /** Controlled mute state. */
  muted?: boolean
  onMutedChange?: (muted: boolean) => void
  /** Controlled keyboard (text box) state. */
  keyboardOpen?: boolean
  onKeyboardOpenChange?: (open: boolean) => void
  /** Controlled text box value. */
  text?: string
  onTextChange?: (text: string) => void
  /** Optional live audio source for the waveform. Without one the bar draws a simulated voice level. */
  analyser?: AnalyserNode | null
  className?: string
  waveformClassName?: string
  style?: CSSProperties
}

/** Pick dark or light ink by relative luminance. */
function inkFor(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return '#fafafa'
  const n = parseInt(m[1], 16)
  const lin = (c: number) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.4 ? '#0a0a0a' : '#fafafa'
}

const icon = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const

const MicIcon = () => (
  <svg {...icon}>
    <path d="M12 19v3" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <rect x="9" y="2" width="6" height="13" rx="3" />
  </svg>
)
const MicOffIcon = () => (
  <svg {...icon}>
    <path d="M12 19v3" />
    <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
    <path d="M16.95 16.95A7 7 0 0 1 5 12v-2" />
    <path d="M18.89 13.23A7 7 0 0 0 19 12v-2" />
    <path d="m2 2 20 20" />
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
  </svg>
)
const KeyboardIcon = ({ className }: { className?: string }) => (
  <svg {...icon} className={className}>
    <path d="M10 8h.01M12 12h.01M14 8h.01M16 12h.01M18 8h.01M6 8h.01M7 16h10M8 12h.01" />
    <rect width="20" height="16" x="2" y="4" rx="2" />
  </svg>
)
const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg {...icon} className={className}>
    <path d="m6 9 6 6 6-6" />
  </svg>
)
const PhoneIcon = () => (
  <svg {...icon}>
    <path d="M13.83 16.57a1 1 0 0 0 1.21-.3l.36-.47A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.47.35a1 1 0 0 0-.29 1.23 14 14 0 0 0 6.39 6.39" />
  </svg>
)
const XIcon = () => (
  <svg {...icon}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)
const ArrowUpIcon = () => (
  <svg {...icon} width={16} height={16}>
    <path d="m5 12 7-7 7 7M12 19V5" />
  </svg>
)

function IconButton({ children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md transition-[background-color,opacity] duration-150 outline-none',
        'hover:bg-[var(--vcb-tint)] focus-visible:ring-2 focus-visible:ring-[var(--vcb-accent)] disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

/* ---------------------------------------------------------------- waveform */

interface WaveformProps {
  active: boolean
  processing: boolean
  barColor: string
  analyser?: AnalyserNode | null
  className?: string
}

const BAR_WIDTH = 3
const BAR_GAP = 1
const BAR_RADIUS = 4
const BASE_BAR_HEIGHT = 4
const FADE_WIDTH = 24
const SENSITIVITY = 1.8
const UPDATE_RATE = 0.03

/** Simulated speech spectrum for previews: syllable envelope × falling spectrum with jitter. */
function simulatedSpectrum(time: number, out: Uint8Array) {
  const syllable = Math.max(0, Math.sin(time * 7.3) * 0.6 + Math.sin(time * 3.1 + 1.3) * 0.5)
  const phrase = Math.sin(time * 0.9) > -0.6 ? 1 : 0.15
  const level = Math.min(1, (0.18 + syllable * 0.75) * phrase)
  for (let i = 0; i < out.length; i++) {
    const f = i / out.length
    const shape = Math.exp(-f * 3.2) * (0.75 + 0.25 * Math.sin(i * 0.9 + time * 11))
    const jitter = 0.8 + 0.2 * Math.sin(i * 2.7 + time * 17.3)
    out[i] = Math.round(Math.min(1, level * shape * jitter * 0.8) * 255)
  }
}

function LiveWaveform({ active, processing, barColor, analyser, className }: WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const staticBarsRef = useRef<number[]>([])
  const lastActiveDataRef = useRef<number[]>([])
  const transitionRef = useRef(0)
  const fadeRef = useRef(0)
  const lastUpdateRef = useRef(-1)
  const spectrumRef = useRef(new Uint8Array(128))
  const stateRef = useRef({ active, processing, barColor, analyser })
  stateRef.current = { active, processing, barColor, analyser }
  const size = useCanvasSize(canvasRef, { maxDpr: 2 })

  useFrameLoop(
    containerRef,
    ({ time, delta }) => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return
      const { width: pw, height: ph, dpr } = size.current
      const width = pw / dpr
      const height = ph / dpr
      const { active, processing, barColor, analyser } = stateRef.current
      const barCount = Math.floor(width / (BAR_WIDTH + BAR_GAP))
      const halfCount = Math.floor(barCount / 2)
      const frame = Math.min(delta * 60, 6)

      if (processing && !active) {
        transitionRef.current = Math.min(1, transitionRef.current + 0.02 * frame)
        fadeRef.current = 0
        const t = time * 1.8
        const data: number[] = []
        for (let i = 0; i < barCount; i++) {
          const p = halfCount > 0 ? (i - halfCount) / halfCount : 0
          const centerWeight = 1 - Math.abs(p) * 0.4
          const wave = Math.sin(t * 1.5 + p * 3) * 0.25 + Math.sin(t * 0.8 - p * 2) * 0.2 + Math.cos(t * 2 + p) * 0.15
          let value = (0.2 + wave) * centerWeight
          const last = lastActiveDataRef.current
          if (last.length > 0 && transitionRef.current < 1) {
            const prev = last[Math.min(i, last.length - 1)] || 0
            value = prev * (1 - transitionRef.current) + value * transitionRef.current
          }
          data.push(Math.max(0.05, Math.min(1, value)))
        }
        staticBarsRef.current = data
      } else if (active) {
        transitionRef.current = 0
        fadeRef.current = 0
        if (time - lastUpdateRef.current > UPDATE_RATE || time < lastUpdateRef.current) {
          lastUpdateRef.current = time
          let spectrum = spectrumRef.current
          if (analyser) {
            if (spectrum.length !== analyser.frequencyBinCount) spectrum = spectrumRef.current = new Uint8Array(analyser.frequencyBinCount)
            analyser.getByteFrequencyData(spectrum)
          } else simulatedSpectrum(time, spectrum)
          const relevant = spectrum.slice(Math.floor(spectrum.length * 0.05), Math.floor(spectrum.length * 0.4))
          const bars: number[] = []
          const at = (i: number) => Math.max(0.05, Math.min(1, (relevant[Math.floor((i / halfCount) * relevant.length)] / 255) * SENSITIVITY))
          for (let i = halfCount - 1; i >= 0; i--) bars.push(at(i))
          for (let i = 0; i < halfCount; i++) bars.push(at(i))
          staticBarsRef.current = bars
          lastActiveDataRef.current = bars
        }
      } else if (staticBarsRef.current.length > 0) {
        fadeRef.current += 0.03 * frame
        if (fadeRef.current < 1 && frame > 0) staticBarsRef.current = staticBarsRef.current.map((v) => v * (1 - fadeRef.current))
        else staticBarsRef.current = []
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)
      const step = BAR_WIDTH + BAR_GAP
      const centerY = height / 2
      const bars = staticBarsRef.current
      ctx.fillStyle = barColor
      for (let i = 0; i < barCount && i < bars.length; i++) {
        const value = bars[i] || 0.1
        const barHeight = Math.max(BASE_BAR_HEIGHT, value * height * 0.8)
        ctx.globalAlpha = 0.4 + value * 0.6
        ctx.beginPath()
        ctx.roundRect(i * step, centerY - barHeight / 2, BAR_WIDTH, barHeight, BAR_RADIUS)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      if (width > 0) {
        const gradient = ctx.createLinearGradient(0, 0, width, 0)
        const fade = Math.min(0.3, FADE_WIDTH / width)
        gradient.addColorStop(0, 'rgba(255,255,255,1)')
        gradient.addColorStop(fade, 'rgba(255,255,255,0)')
        gradient.addColorStop(1 - fade, 'rgba(255,255,255,0)')
        gradient.addColorStop(1, 'rgba(255,255,255,1)')
        ctx.globalCompositeOperation = 'destination-out'
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
        ctx.globalCompositeOperation = 'source-over'
      }
    },
    { reducedMotion: 'static', staticTime: 1.4 },
  )

  return (
    <div
      ref={containerRef}
      className={cn('relative h-full w-full', className)}
      role="img"
      aria-label={active ? 'Live audio waveform' : processing ? 'Processing audio' : 'Audio waveform idle'}
    >
      {!active && !processing && (
        <div className="absolute top-1/2 right-0 left-0 -translate-y-1/2 border-t-2 border-dotted" style={{ borderColor: 'color-mix(in oklab, currentColor 20%, transparent)' }} />
      )}
      <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />
    </div>
  )
}

/* ---------------------------------------------------------------- bar */

export function VoiceCallBar({
  status: statusProp,
  onStartSession,
  onEndSession,
  onSendMessage,
  muted: mutedProp,
  onMutedChange,
  keyboardOpen: keyboardProp,
  onKeyboardOpenChange,
  text: textProp,
  onTextChange,
  analyser,
  className,
  waveformClassName,
  style,
  ...props
}: VoiceCallBarProps) {
  const { agentName, accent, surface, waveColor, radius, width, allowTyping, position } = { ...defaults, ...props }
  const [innerStatus, setInnerStatus] = useState<ConversationStatus>('disconnected')
  const [innerMuted, setInnerMuted] = useState(false)
  const [innerKeyboard, setInnerKeyboard] = useState(false)
  const [innerText, setInnerText] = useState('')
  const sessionRef = useRef(0)

  const status = statusProp ?? innerStatus
  const isMuted = mutedProp ?? innerMuted
  const keyboardOpen = allowTyping && (keyboardProp ?? innerKeyboard)
  const textInput = textProp ?? innerText
  const isConnected = status === 'connected'
  const idle = status === 'disconnected' || status === 'error'

  const setMuted = (value: boolean) => {
    if (mutedProp === undefined) setInnerMuted(value)
    onMutedChange?.(value)
  }
  const setKeyboardOpen = (value: boolean) => {
    if (keyboardProp === undefined) setInnerKeyboard(value)
    onKeyboardOpenChange?.(value)
  }
  const setTextInput = (value: string) => {
    if (textProp === undefined) setInnerText(value)
    onTextChange?.(value)
  }

  const startConversation = useCallback(async () => {
    const id = ++sessionRef.current
    try {
      const result = onStartSession?.()
      if (result && typeof (result as Promise<void>).then === 'function') {
        setInnerStatus('connecting')
        await result
      }
      if (sessionRef.current === id) setInnerStatus('connected')
    } catch (error) {
      console.warn('Error starting conversation:', error)
      if (sessionRef.current === id) setInnerStatus('error')
    }
  }, [onStartSession])

  const handleEndSession = () => {
    sessionRef.current++
    setInnerStatus('disconnected')
    onEndSession?.()
  }

  const handleStartOrEnd = () => {
    if (status === 'connected' || status === 'connecting') handleEndSession()
    else void startConversation()
  }

  const handleSendText = () => {
    if (!textInput.trim()) return
    const message = textInput
    setTextInput('')
    onSendMessage?.(message)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendText()
    }
  }

  const ink = inkFor(surface)
  const accentInk = inkFor(accent)
  const vars = {
    '--vcb-ink': ink,
    '--vcb-accent': accent,
    '--vcb-tint': `color-mix(in oklab, ${ink} 6%, transparent)`,
    '--vcb-line': `color-mix(in oklab, ${ink} 12%, transparent)`,
  } as CSSProperties

  return (
    <div
      className={cn('flex w-full items-end justify-center p-4', position === 'floating' && 'pointer-events-none absolute inset-x-0 bottom-0 z-10', className)}
      style={{ ...vars, ...style }}
    >
      <div
        role="group"
        aria-label={`Voice conversation with ${agentName}`}
        className="pointer-events-auto m-0 w-full border shadow-lg shadow-black/25"
        style={{ maxWidth: width, borderRadius: radius, background: surface, color: ink, borderColor: 'var(--vcb-line)' }}
      >
        <div className="flex flex-col-reverse">
          <div>
            {keyboardOpen && <div className="h-px w-full" style={{ background: 'var(--vcb-line)' }} />}
            <div className="flex items-center justify-between gap-2 p-2">
              <div className="h-8 w-[120px] min-w-0 md:h-10">
                <div className="flex h-full items-center gap-2 py-1" style={{ background: 'var(--vcb-tint)', borderRadius: Math.max(4, radius - 6), color: `color-mix(in oklab, ${ink} 70%, transparent)` }}>
                  <div className="h-full flex-1">
                    <div className={cn('relative flex h-full w-full shrink-0 items-center justify-center overflow-hidden rounded-sm', waveformClassName)}>
                      <LiveWaveform
                        key={idle ? 'idle' : 'active'}
                        active={isConnected && !isMuted}
                        processing={status === 'connecting'}
                        barColor={waveColor}
                        analyser={analyser}
                        className={cn('h-full w-full transition-opacity duration-300 motion-reduce:transition-none', idle && 'opacity-0')}
                      />
                      {idle && (
                        <div className="absolute inset-0 flex items-center justify-center px-1">
                          <span className="truncate text-[10px] font-medium" style={{ color: `color-mix(in oklab, ${ink} ${status === 'error' ? 75 : 55}%, transparent)` }}>
                            {status === 'error' ? 'Couldn’t connect' : agentName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <span className="sr-only" aria-live="polite">
                {status === 'connecting' ? 'Connecting' : status === 'connected' ? `Connected to ${agentName}` : status === 'error' ? 'Connection failed' : ''}
              </span>
              <div className="flex items-center">
                <IconButton
                  onClick={() => setMuted(!isMuted)}
                  aria-pressed={isMuted}
                  aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                  className={cn(isMuted && 'bg-[var(--vcb-tint)]')}
                  disabled={!isConnected}
                >
                  {isMuted ? <MicOffIcon /> : <MicIcon />}
                </IconButton>
                {allowTyping && (
                  <IconButton
                    onClick={() => setKeyboardOpen(!keyboardOpen)}
                    aria-pressed={keyboardOpen}
                    aria-expanded={keyboardOpen}
                    aria-label={keyboardOpen ? 'Hide text input' : 'Type a message'}
                    className="relative"
                    disabled={!isConnected}
                  >
                    <KeyboardIcon
                      className={cn(
                        'h-5 w-5 transform-gpu transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
                        keyboardOpen ? 'scale-75 opacity-0' : 'scale-100 opacity-100',
                      )}
                    />
                    <ChevronDownIcon
                      className={cn(
                        'absolute inset-0 m-auto h-5 w-5 transform-gpu transition-[transform,opacity] delay-50 duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none',
                        keyboardOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0',
                      )}
                    />
                  </IconButton>
                )}
                <div className="mx-1 -my-2.5 h-9 w-px self-stretch" style={{ background: 'var(--vcb-line)' }} aria-hidden="true" />
                <IconButton onClick={handleStartOrEnd} aria-label={isConnected || status === 'connecting' ? 'End call' : 'Start call'}>
                  {isConnected || status === 'connecting' ? <XIcon /> : <PhoneIcon />}
                </IconButton>
              </div>
            </div>
          </div>

          {allowTyping && (
            <div className={cn('overflow-hidden transition-[max-height] duration-300 ease-out motion-reduce:transition-none', keyboardOpen ? 'max-h-[120px]' : 'max-h-0')} aria-hidden={!keyboardOpen}>
              <div className="relative px-2 pt-2 pb-2">
                <textarea
                  value={textInput}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setTextInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your message..."
                  aria-label={`Message ${agentName}`}
                  className="block min-h-[100px] w-full resize-none bg-transparent px-3 py-2 pr-12 text-sm outline-none placeholder:text-[color-mix(in_oklab,var(--vcb-ink)_45%,transparent)] disabled:opacity-50"
                  disabled={!isConnected}
                  tabIndex={keyboardOpen ? 0 : -1}
                />
                <IconButton
                  onClick={handleSendText}
                  aria-label="Send message"
                  disabled={!textInput.trim() || !isConnected}
                  tabIndex={keyboardOpen ? 0 : -1}
                  className="absolute right-3 bottom-3 size-8 hover:bg-[var(--vcb-accent)] hover:opacity-90"
                  style={textInput.trim() ? { background: accent, color: accentInk } : undefined}
                >
                  <ArrowUpIcon />
                </IconButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
