// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Julien Thibeaut
// Source: https://github.com/ibelick/prompt-kit/blob/5a94966/components/prompt-kit/reasoning.tsx
// Source: https://github.com/ibelick/prompt-kit/blob/5a94966/components/prompt-kit/thinking-bar.tsx
// Source: https://github.com/ibelick/prompt-kit/blob/5a94966/components/prompt-kit/text-shimmer.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import React, { createContext, useContext, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  label: 'Thinking',
  accent: '#334155',
  shimmerSpeed: 4,
  streamSpeed: 33,
  autoCollapse: true,
  showTimer: true,
  maxHeight: 160,
  fadeMask: true,
}
/* @motif:end */

type ReasoningContextType = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  contentId: string
}

const ReasoningContext = createContext<ReasoningContextType | undefined>(undefined)

function useReasoningContext() {
  const context = useContext(ReasoningContext)
  if (!context) {
    throw new Error('useReasoningContext must be used within a Reasoning provider')
  }
  return context
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export type ReasoningProps = {
  children: React.ReactNode
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  isStreaming?: boolean
  /** 流式结束时是否自动折叠。 */
  autoCollapse?: boolean
}

export function Reasoning({ children, className, open, onOpenChange, isStreaming, autoCollapse = true }: ReasoningProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [wasAutoOpened, setWasAutoOpened] = useState(false)
  const contentId = useId()

  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }

  useEffect(() => {
    if (isStreaming && !wasAutoOpened) {
      if (!isControlled) setInternalOpen(true)
      setWasAutoOpened(true)
    }

    if (!isStreaming && wasAutoOpened) {
      if (!isControlled && autoCollapse) setInternalOpen(false)
      setWasAutoOpened(false)
    }
  }, [isStreaming, wasAutoOpened, isControlled, autoCollapse])

  return (
    <ReasoningContext.Provider value={{ isOpen, onOpenChange: handleOpenChange, contentId }}>
      <div className={className}>{children}</div>
    </ReasoningContext.Provider>
  )
}

export type ReasoningTriggerProps = {
  children: React.ReactNode
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export function ReasoningTrigger({ children, className, ...props }: ReasoningTriggerProps) {
  const { isOpen, onOpenChange, contentId } = useReasoningContext()

  return (
    <button
      type="button"
      aria-expanded={isOpen}
      aria-controls={contentId}
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-sm text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
      onClick={() => onOpenChange(!isOpen)}
      {...props}
    >
      <span className="text-foreground">{children}</span>
      <div className={cn('transform text-muted-foreground transition-transform motion-reduce:transition-none', isOpen ? 'rotate-180' : '')}>
        <ChevronDownIcon className="size-4" />
      </div>
    </button>
  )
}

export type ReasoningContentProps = {
  children: React.ReactNode
  className?: string
  contentClassName?: string
  /** 内容区最大高度（px），超出后在内部滚动。 */
  maxHeight?: number
  /** 顶部渐隐遮罩。 */
  fadeMask?: boolean
  /** 流式输出时自动滚到底部。 */
  isStreaming?: boolean
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>

export function ReasoningContent({ children, className, contentClassName, maxHeight = 160, fadeMask = true, isStreaming, style, ...props }: ReasoningContentProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const { isOpen, contentId } = useReasoningContext()

  // 流式输出时内容一变就滚到底部
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (el && isStreaming) el.scrollTop = el.scrollHeight
  })

  useEffect(() => {
    const el = scrollRef.current
    const inner = innerRef.current
    if (!el || !inner) return
    const observer = new ResizeObserver(() => {
      if (isStreaming) el.scrollTop = el.scrollHeight
    })
    observer.observe(inner)
    return () => observer.disconnect()
  }, [isStreaming])

  const mask = fadeMask ? 'linear-gradient(to bottom, transparent 0, #000 28px, #000 100%)' : undefined

  return (
    <div
      id={contentId}
      aria-hidden={!isOpen}
      inert={!isOpen}
      className="grid transition-[grid-template-rows] duration-150 ease-out motion-reduce:transition-none"
      style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
    >
      <div className="min-h-0 overflow-hidden">
        <div className={className} style={style} {...props}>
          <div ref={scrollRef} className="overflow-y-auto overscroll-contain [scrollbar-width:none]" style={{ maxHeight, maskImage: mask, WebkitMaskImage: mask }}>
            <div ref={innerRef} aria-busy={isStreaming} className={cn('text-sm leading-relaxed text-muted-foreground', fadeMask && 'pt-3', contentClassName)}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export type TextShimmerProps = {
  as?: string
  duration?: number
  spread?: number
  children: React.ReactNode
} & React.HTMLAttributes<HTMLElement>

export function TextShimmer({ as = 'span', className, duration = 4, spread = 20, children, style, ...props }: TextShimmerProps) {
  const dynamicSpread = Math.min(Math.max(spread, 5), 45)
  const Component = as as React.ElementType

  return (
    <Component
      className={cn('mrt-shimmer font-medium', className)}
      style={{
        backgroundImage: `linear-gradient(to right, var(--muted-foreground) ${50 - dynamicSpread}%, var(--foreground) 50%, var(--muted-foreground) ${50 + dynamicSpread}%)`,
        animationDuration: `${duration}s`,
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  )
}

/** 流式输出时用 rAF 计时；外部传了 seconds 时直接用外部的。 */
function useElapsed(isStreaming: boolean, seconds: number | undefined): number {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (seconds !== undefined || !isStreaming) return
    const start = performance.now()
    let frame = 0
    const tick = () => {
      const s = Math.floor((performance.now() - start) / 1000)
      setElapsed((prev) => (prev === s ? prev : s))
      frame = requestAnimationFrame(tick)
    }
    setElapsed(0)
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [isStreaming, seconds])
  return seconds ?? elapsed
}

export type ReasoningTraceProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 已输出的推理文本；空行分段。 */
  reasoning?: string
  isStreaming?: boolean
  /** 已思考的秒数；不传时组件自己计时。 */
  seconds?: number
  /** 传入后显示「Answer now」，用来提前结束思考。 */
  onStop?: () => void
  stopLabel?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ReasoningTrace({ className, style, reasoning = '', isStreaming = false, seconds, onStop, stopLabel = 'Answer now', open, onOpenChange, ...props }: ReasoningTraceProps) {
  const { label, accent, shimmerSpeed, autoCollapse, showTimer, maxHeight, fadeMask } = { ...defaults, ...props }
  const elapsed = useElapsed(isStreaming, seconds)
  const paragraphs = reasoning.split(/\n{2,}/).filter((p) => p.trim().length > 0)
  const doneLabel = showTimer ? `Thought for ${Math.max(1, Math.round(elapsed))}s` : 'Show reasoning'

  return (
    <Reasoning isStreaming={isStreaming} autoCollapse={autoCollapse} open={open} onOpenChange={onOpenChange} className={cn('w-full', className)}>
      <div className="flex w-full items-center justify-between gap-3" style={style}>
        <ReasoningTrigger>
          {isStreaming ? (
            <span className="flex items-baseline gap-2">
              <TextShimmer duration={shimmerSpeed}>{label}</TextShimmer>
              {showTimer && <span className="text-xs tabular-nums text-muted-foreground">{Math.floor(elapsed)}s</span>}
            </span>
          ) : (
            <span className="font-medium text-muted-foreground">{doneLabel}</span>
          )}
        </ReasoningTrigger>
        {isStreaming && onStop ? (
          <button
            onClick={onStop}
            type="button"
            className="shrink-0 rounded-sm border-b border-dotted border-muted-foreground/50 text-sm text-muted-foreground outline-none transition-colors hover:border-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {stopLabel}
          </button>
        ) : null}
      </div>
      <ReasoningContent isStreaming={isStreaming} maxHeight={maxHeight} fadeMask={fadeMask} className="mt-2 ml-2 border-l-2 px-3 pb-1" style={{ borderLeftColor: accent }}>
        <div className="space-y-2">
          {paragraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-line">
              {p}
            </p>
          ))}
        </div>
      </ReasoningContent>
    </Reasoning>
  )
}
