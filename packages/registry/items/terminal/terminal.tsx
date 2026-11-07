// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/terminal.tsx
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop, usePrefersReducedMotion } from '@motif/runtime'
import { Children, createContext, isValidElement, useContext, useMemo, useRef, useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  speed: 1,
  loop: true,
  prompt: '❯',
  caret: 'block',
  accent: '#9db1ff',
  font: 'geist',
  chrome: 'traffic',
  radius: 12,
  title: '~/code — zsh',
}
/* @motif:end */

const FONTS: Record<string, string> = {
  geist: "'Geist Mono Variable', ui-monospace, SFMono-Regular, Menlo, monospace",
  jetbrains: "'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, monospace",
  plex: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
}

const TONES: Record<string, string> = {
  default: 'var(--foreground)',
  muted: 'var(--muted-foreground)',
  success: '#4cc38a',
  info: '#6aa8f0',
  warning: '#e5a64b',
  error: '#f06a6a',
}

// 速度为 1 时的节奏（秒）：每个字符、敲命令前的停顿、敲完回车前的停顿、一行输出、任务默认时长、结尾淡出、光标闪烁半周期。
const CHAR = 0.045
const LEAD = 0.3
const TAIL = 0.4
const LINE = 0.15
const TASK = 1.6
const FADE = 0.45
const BLINK = 0.53
const SPINNER = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'

type StepKind = 'command' | 'line' | 'task'
type Step = { kind: StepKind; start: number; typeStart: number; typeEnd: number; end: number; length: number }

type Playback = {
  /** 当前时刻（秒，按速度 1 计）。 */
  t: number
  steps: Step[]
  prompt: string
  caret: string
  accent: string
  /** 为读屏渲染的完整文本：不做动画，全部显示。 */
  transcript: boolean
}

const PlaybackContext = createContext<Playback | null>(null)
const IndexContext = createContext(-1)

function usePlayback(): { playback: Playback; step: Step | undefined } {
  const playback = useContext(PlaybackContext)
  const index = useContext(IndexContext)
  if (!playback) throw new Error('Terminal parts must be used inside <Terminal>')
  return { playback, step: playback.steps[index] }
}

function Caret({ shape: kind, on }: { shape: string; on: boolean }) {
  const { playback } = usePlayback()
  const shape = kind === 'bar' ? 'w-[2px] h-[1.2em] align-[-0.22em]' : kind === 'underline' ? 'w-[0.62em] h-[2px] align-[-0.12em]' : 'w-[0.62em] h-[1.2em] align-[-0.22em]'
  // 闪烁用 opacity 而不是 visibility：子元素的 visibility: visible 会盖过还没播到的行上的 hidden。
  return <span className={cn('ml-px inline-block', shape)} style={{ background: playback.accent, opacity: on ? (kind === 'block' ? 0.85 : 1) : 0 }} />
}

/** 光标从 since 时刻开始闪：先亮半个周期。 */
const blinkOn = (t: number, since: number) => Math.floor(Math.max(0, t - since) / BLINK) % 2 === 0

export type TerminalCommandProps = {
  /** 要敲出来的命令（纯文本）。 */
  children: string
  /** 开始之前额外等多久（秒）。 */
  delay?: number
  className?: string
}

/** 一条命令：提示符 + 逐字敲出的文本 + 光标。 */
export function TerminalCommand({ children, className }: TerminalCommandProps) {
  const { playback, step } = usePlayback()
  const text = typeof children === 'string' ? children : String(children)
  if (playback.transcript) return <p>{`${playback.prompt} ${text}`}</p>
  const t = playback.t
  const visible = !step || t >= step.start
  let shown = text
  let caret: boolean | null = null
  if (step && visible) {
    if (t < step.typeStart) {
      shown = ''
      caret = blinkOn(t, step.start)
    } else if (t < step.typeEnd) {
      shown = text.slice(0, Math.min(text.length, Math.floor((t - step.typeStart) / CHAR) + 1))
      caret = true
    } else if (t < step.end) {
      caret = blinkOn(t, step.typeEnd)
    }
  }
  return (
    <div className={cn('whitespace-pre-wrap', className)} style={{ visibility: visible ? 'visible' : 'hidden' }}>
      <span style={{ color: playback.accent }}>{playback.prompt}</span> <span className="text-foreground">{shown}</span>
      {caret !== null && <Caret shape={playback.caret} on={caret} />}
    </div>
  )
}

export type TerminalLineProps = {
  children: ReactNode
  /** 颜色：default / muted / success / info / warning / error，或者 #rrggbb。 */
  tone?: string
  /** 出现之前等多久（秒），用来模拟命令在处理。 */
  delay?: number
  className?: string
}

/** 一行输出：到点淡入，还没轮到时保持隐形但占位，窗口不会变高。 */
export function TerminalLine({ children, tone = 'muted', className }: TerminalLineProps) {
  const { playback, step } = usePlayback()
  if (playback.transcript) return <p>{children}</p>
  const visible = !step || playback.t >= step.start
  return (
    <div
      className={cn(
        'whitespace-pre-wrap motion-reduce:transition-none',
        // 只有出现时才过渡；隐藏（重播时清屏）立刻生效，不会在下一轮开头闪一下。
        visible ? 'translate-y-0 opacity-100 transition-[opacity,transform] duration-300 ease-out' : '-translate-y-1 opacity-0',
        className,
      )}
      style={{ color: TONES[tone] ?? tone }}
    >
      {children}
    </div>
  )
}

export type TerminalTaskProps = {
  /** 运行中显示的文字。 */
  children: ReactNode
  /** 完成后显示的文字，默认同 children。 */
  done?: ReactNode
  /** 转多久（秒）。 */
  duration?: number
  /** 完成时的图标和颜色。 */
  status?: 'success' | 'warning' | 'error'
  delay?: number
  className?: string
}

const STATUS_GLYPH = { success: '✔', warning: '▲', error: '✖' } as const

/** 一个耗时任务：转圈（盲文点阵）若干秒，然后变成打勾的完成行。 */
export function TerminalTask({ children, done, status = 'success', className }: TerminalTaskProps) {
  const { playback, step } = usePlayback()
  if (playback.transcript) return <p>{`${STATUS_GLYPH[status]} `}{done ?? children}</p>
  const t = playback.t
  const visible = !step || t >= step.start
  const finished = !step || t >= step.end
  const frame = step ? Math.floor(Math.max(0, t - step.start) * 12.5) % SPINNER.length : 0
  return (
    <div
      className={cn(
        'whitespace-pre-wrap motion-reduce:transition-none',
        visible ? 'translate-y-0 opacity-100 transition-[opacity,transform] duration-300 ease-out' : '-translate-y-1 opacity-0',
        className,
      )}
    >
      {finished ? (
        <>
          <span style={{ color: TONES[status] }}>{STATUS_GLYPH[status]}</span> <span className="text-foreground">{done ?? children}</span>
        </>
      ) : (
        <>
          <span style={{ color: playback.accent }}>{SPINNER[frame]}</span> <span className="text-muted-foreground">{children}</span>
        </>
      )}
    </div>
  )
}

export type TerminalProps = Partial<typeof defaults> & {
  /** TerminalCommand / TerminalLine / TerminalTask，按播放顺序排。 */
  children: ReactNode
  /** 放完后停在最后的提示符上多久再重播（秒）。 */
  hold?: number
  className?: string
  style?: CSSProperties
}

function kindOf(element: ReactElement): StepKind {
  if (element.type === TerminalCommand) return 'command'
  if (element.type === TerminalTask) return 'task'
  return 'line'
}

/** 按 children 排出时间表：每一步的开始、打字区间和结束时刻。 */
function schedule(elements: ReactElement[]): { steps: Step[]; end: number } {
  let cursor = 0
  const steps = elements.map((element) => {
    const props = element.props as { children?: unknown; delay?: number; duration?: number }
    const kind = kindOf(element)
    const start = cursor + Math.max(0, props.delay ?? 0)
    if (kind === 'command') {
      const length = typeof props.children === 'string' ? props.children.length : 0
      const typeStart = start + LEAD
      const typeEnd = typeStart + length * CHAR
      cursor = typeEnd + TAIL
      return { kind, start, typeStart, typeEnd, end: cursor, length }
    }
    cursor = start + (kind === 'task' ? Math.max(0.2, props.duration ?? TASK) : LINE)
    return { kind, start, typeStart: start, typeEnd: start, end: cursor, length: 0 }
  })
  return { steps, end: cursor }
}

/**
 * 自己演示的终端窗口。时间表在渲染前排好，useFrameLoop 推进同一个时钟：
 * 离屏和切到后台时暂停，截图时钟下每一帧都可复现。窗口一开始就是最终的高度。
 */
export function Terminal({ children, hold = 2.45, className, style, ...props }: TerminalProps) {
  const { speed, loop, prompt, caret, accent, font, chrome, radius, title } = { ...defaults, ...props }
  const reduced = usePrefersReducedMotion()
  const hostRef = useRef<HTMLDivElement>(null)
  const elements = useMemo(() => Children.toArray(children).filter(isValidElement) as ReactElement[], [children])
  const { steps, end } = useMemo(() => schedule(elements), [elements])
  const cycle = end + hold + FADE

  const clock = useRef(0)
  const [time, setTime] = useState(0)
  const [paused, setPaused] = useState(false)
  const pausedRef = useRef(paused)
  pausedRef.current = paused

  useFrameLoop(
    hostRef,
    ({ delta }) => {
      if (pausedRef.current) return
      clock.current += delta
      // 量化到 1/30 秒：打字（45ms 一个字）、转圈（80ms 一帧）和光标都是离散的，不必每一帧都重新渲染；行的淡入交给 CSS 过渡。
      const next = Math.floor((loop ? clock.current % cycle : clock.current) * 30) / 30
      setTime((current) => (current === next ? current : next))
    },
    { speed, reducedMotion: 'static' },
  )

  // 减少动态效果：直接显示放完的样子，光标常亮。
  const t = reduced ? end : time
  const finished = !loop && t >= end
  const fadeOut = loop && !reduced ? Math.min(1, Math.max(0, (t - end - hold) / FADE)) : 0

  const playback: Playback = { t, steps, prompt, caret, accent, transcript: false }
  // 正文和读屏文本渲染同一组 children，区别只在 PlaybackContext 的 transcript。
  const wrap = () =>
    elements.map((element, index) => (
      <IndexContext.Provider key={element.key ?? index} value={index}>
        {element}
      </IndexContext.Provider>
    ))

  const toggle = () => {
    if (finished) {
      clock.current = 0
      setTime(0)
      setPaused(false)
      return
    }
    setPaused((current) => !current)
  }

  const control = !reduced && (
    <button
      type="button"
      onClick={toggle}
      aria-label={finished ? 'Replay' : paused ? 'Play' : 'Pause'}
      className="grid size-6 place-items-center rounded-md text-muted-foreground/70 outline-none transition-colors duration-150 hover:bg-foreground/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor" aria-hidden>
        {finished ? (
          <path d="M8 3a5 5 0 1 1-4.6 3.05.75.75 0 1 1 1.38.58A3.5 3.5 0 1 0 8 4.5H6.75L8.3 6.05a.75.75 0 0 1-1.06 1.06L4.4 4.27a.75.75 0 0 1 0-1.06L7.24.38A.75.75 0 0 1 8.3 1.44L6.75 3z" />
        ) : paused ? (
          <path d="M5 3.4v9.2a.6.6 0 0 0 .92.5l7.1-4.6a.6.6 0 0 0 0-1L5.92 2.9A.6.6 0 0 0 5 3.4" />
        ) : (
          <path d="M4.5 3h2v10h-2zM9.5 3h2v10h-2z" />
        )}
      </svg>
    </button>
  )

  return (
    <div
      ref={hostRef}
      role="group"
      aria-label={title || 'Terminal'}
      className={cn('relative w-full overflow-hidden border bg-card text-[13.5px] leading-[1.7] text-card-foreground shadow-[0_24px_60px_-28px_rgb(0_0_0/0.7),0_4px_14px_-6px_rgb(0_0_0/0.35)]', className)}
      style={{ borderRadius: radius, fontFamily: FONTS[font] ?? FONTS.geist, ...style }}
    >
      {chrome !== 'none' ? (
        <div className="relative flex h-10 items-center gap-2 border-b px-4">
          {(chrome === 'traffic' ? ['#ef6b5f', '#f2bd4c', '#5fc366'] : ['', '', '']).map((color, index) => (
            <span key={index} className={cn('size-[11px] rounded-full', !color && 'bg-muted-foreground/25')} style={color ? { background: color } : undefined} />
          ))}
          <span className="pointer-events-none absolute inset-x-16 truncate text-center text-xs text-muted-foreground">{title}</span>
          <span className="ml-auto">{control}</span>
        </div>
      ) : (
        <span className="absolute top-2.5 right-2.5 z-10">{control}</span>
      )}

      <PlaybackContext.Provider value={playback}>
        <div className="px-5 py-4" aria-hidden style={{ opacity: 1 - fadeOut }}>
          {wrap()}
          <div style={{ visibility: t >= end ? 'visible' : 'hidden' }}>
            <span style={{ color: accent }}>{prompt}</span> <Caret shape={caret} on={reduced || blinkOn(t, end)} />
          </div>
        </div>
      </PlaybackContext.Provider>
      {/* 读屏读到的是完整的会话，而不是一个字一个字冒出来的文本。 */}
      <PlaybackContext.Provider value={{ ...playback, transcript: true }}>
        <div className="sr-only">{wrap()}</div>
      </PlaybackContext.Provider>
    </div>
  )
}
