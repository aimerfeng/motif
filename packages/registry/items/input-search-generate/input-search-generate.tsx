// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Urvish Mali
// Source: https://github.com/iurvish/uselayouts/blob/678a478/registry/default/example/morphing-input.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  mode: 'search',
  searchPlaceholder: 'Search anything...',
  generatePlaceholder: 'Generate Image',
  flipStagger: 0.02,
  accent: '#a855f7',
  radius: 999,
  width: 384,
  spring: {
    visualDuration: 0.25,
    bounce: 0,
  },
}
/* @motif:end */

export type SearchGenerateMode = 'search' | 'generate'

export type InputSearchGenerateProps = Partial<typeof defaults> & {
  /** 受控模式；不传时由图标按钮在内部切换。 */
  activeMode?: SearchGenerateMode
  onModeChange?: (mode: SearchGenerateMode) => void
  value?: string
  onValueChange?: (value: string) => void
  onSubmit?: (value: string, mode: SearchGenerateMode) => void
  className?: string
  style?: CSSProperties
}

const svg = (children: ReactNode, className: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    {children}
  </svg>
)

const SparklesIcon = (className: string) =>
  svg(
    <>
      <path d="M12 3.5 13.9 9a2 2 0 0 0 1.2 1.2l5.4 1.8-5.4 1.9a2 2 0 0 0-1.2 1.2L12 20.5l-1.9-5.4a2 2 0 0 0-1.2-1.2L3.5 12l5.4-1.8A2 2 0 0 0 10.1 9z" />
      <path d="M19 3v3M17.5 4.5h3" />
    </>,
    className,
  )
const AlbumIcon = (className: string) =>
  svg(
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <circle cx="9" cy="9" r="1.6" />
      <path d="m20.5 15-4.2-4.2a1.5 1.5 0 0 0-2.1 0L5 20" />
    </>,
    className,
  )
const UnfoldIcon = (className: string) => svg(<path d="m7 9 5-5 5 5M7 15l5 5 5-5" />, className)
const ArrowIcon = (className: string) => svg(<path d="M4 12h16m-6-6 6 6-6 6" />, className)

const AnimatedPlaceholder = ({ text, stagger, reduced }: { text: string; stagger: number; reduced: boolean }) => {
  const letters = text.split('')

  return (
    <span className="inline-flex overflow-hidden" aria-hidden>
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          initial={reduced ? false : { opacity: 0, y: 6, filter: 'blur(2px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: stagger * index, duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
          className="inline-block"
        >
          {letter === ' ' ? ' ' : letter}
        </motion.span>
      ))}
    </span>
  )
}

/** 搜索 / 生成切换输入框：左侧图标按钮切换模式，占位文字逐字浮现。 */
export function InputSearchGenerate({ activeMode, onModeChange, value, onValueChange, onSubmit, className, style, ...props }: InputSearchGenerateProps) {
  const { mode, searchPlaceholder, generatePlaceholder, flipStagger, accent, radius, width, spring } = { ...defaults, ...props }
  const reduced = useReducedMotion() ?? false
  const [innerMode, setInnerMode] = useState<SearchGenerateMode>(mode as SearchGenerateMode)
  const [innerValue, setInnerValue] = useState('')
  const current = activeMode ?? innerMode
  const inputValue = value ?? innerValue
  const generating = current === 'generate'
  const placeholder = generating ? generatePlaceholder : searchPlaceholder

  const handleIconClick = () => {
    const next: SearchGenerateMode = generating ? 'search' : 'generate'
    if (activeMode === undefined) setInnerMode(next)
    onModeChange?.(next)
  }
  const setValue = (next: string) => {
    if (value === undefined) setInnerValue(next)
    onValueChange?.(next)
  }
  const submit = () => onSubmit?.(inputValue, current)
  const inner = `${Math.max(radius - 4, 0)}px`

  return (
    <div
      className={cn('flex w-full items-center justify-center overflow-hidden bg-muted px-1 py-1 transition-[box-shadow] duration-300', className)}
      style={{
        maxWidth: width,
        borderRadius: radius,
        boxShadow: generating ? `0 0 0 1.5px ${accent}, 0 0 18px -4px ${accent}` : '0 0 0 1.5px transparent',
        ...style,
      }}
    >
      <motion.button
        type="button"
        className="flex shrink-0 cursor-pointer items-center justify-center gap-1.5 overflow-hidden bg-background p-2.5 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ borderRadius: inner }}
        onClick={handleIconClick}
        whileTap={reduced ? undefined : { scale: 0.96 }}
        aria-label={generating ? 'Switch to search' : 'Switch to image generation'}
      >
        <span className="relative size-5 shrink-0 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={current}
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.85, filter: 'blur(3px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.85, filter: 'blur(3px)' }}
              transition={reduced ? { duration: 0 } : { type: 'spring', visualDuration: spring.visualDuration, bounce: spring.bounce }}
              className="absolute inset-0 flex items-center justify-center"
              style={{ color: generating ? accent : undefined }}
            >
              {generating ? AlbumIcon('size-5') : SparklesIcon('size-5 text-foreground')}
            </motion.span>
          </AnimatePresence>
        </span>
        {UnfoldIcon('size-3 shrink-0 text-muted-foreground')}
      </motion.button>
      <div className="relative min-w-0 flex-1">
        {!inputValue && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex w-full items-center overflow-hidden pl-1.5">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={current}
                initial={reduced ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={{ duration: reduced ? 0 : 0.15, ease: [0.32, 0.72, 0, 1] }}
                className="block overflow-hidden text-sm whitespace-nowrap text-muted-foreground"
              >
                <AnimatedPlaceholder text={placeholder} stagger={flipStagger} reduced={reduced} />
              </motion.span>
            </AnimatePresence>
          </div>
        )}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
          }}
          aria-label={placeholder}
          className="m-0 h-9 w-full border-0 bg-transparent pl-1.5 text-sm text-foreground outline-none"
        />
      </div>
      <button
        type="button"
        onClick={submit}
        aria-label={generating ? 'Generate' : 'Search'}
        className="flex cursor-pointer items-center justify-center self-stretch bg-background px-3 py-2.5 shadow-sm outline-none transition-transform duration-150 ease-in-out focus-visible:ring-2 focus-visible:ring-ring active:scale-95 motion-reduce:active:scale-100"
        style={{ borderRadius: inner }}
      >
        {ArrowIcon('h-4 w-4 text-foreground')}
      </button>
    </div>
  )
}
