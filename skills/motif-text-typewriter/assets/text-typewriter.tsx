// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/typing-animation.tsx
// Modified by Motif; see the item's provenance.
import { useEffect, useMemo, useRef, useState, type ComponentType, type CSSProperties, type RefAttributes } from 'react'
import { motion, type DOMMotionComponents, type HTMLMotionProps } from 'motion/react'
import { cn, useFrameLoop, usePrefersReducedMotion } from '@/lib/motif-runtime'

/* @motif:defaults */
export const defaults = {
  words: 'Design,Build,Ship',
  typeSpeed: 100,
  deleteSpeed: 50,
  pauseDelay: 1000,
  loop: true,
  cursorStyle: 'line',
  showCursor: true,
  blinkCursor: true,
}
/* @motif:end */

const motionElements = {
  article: motion.article,
  div: motion.div,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  h5: motion.h5,
  h6: motion.h6,
  li: motion.li,
  p: motion.p,
  section: motion.section,
  span: motion.span,
} as const

type MotionElementType = Extract<keyof DOMMotionComponents, keyof typeof motionElements>
type TypingAnimationMotionComponent = ComponentType<Omit<HTMLMotionProps<'span'>, 'ref'> & RefAttributes<HTMLElement>>

type Phase = 'typing' | 'pause' | 'deleting'
interface TypingState {
  displayedText: string
  currentWordIndex: number
  currentCharIndex: number
  phase: Phase
}

const INITIAL: TypingState = { displayedText: '', currentWordIndex: 0, currentCharIndex: 0, phase: 'typing' }

export type TypingAnimationProps = Partial<typeof defaults> & {
  /** 单个短语，words 为空时使用。 */
  children?: string
  /** 直接传数组时优先于 words 字符串。 */
  wordList?: string[]
  /** 开始打第一个字前的延迟（毫秒）。 */
  delay?: number
  as?: MotionElementType
  className?: string
  style?: CSSProperties
}

/**
 * 逐字打出一个短语，停顿后删掉，再打下一个。节奏由 useFrameLoop 的时间推进（离屏暂停）；
 * 减少动态效果时直接显示第一个短语，光标不闪。
 */
export function TypingAnimation({ children, wordList, delay = 0, as: Component = 'span', className, style, ...props }: TypingAnimationProps) {
  const options = { ...defaults, ...props }
  const { words, typeSpeed, deleteSpeed, pauseDelay, loop, showCursor, blinkCursor, cursorStyle } = options
  const MotionComponent = motionElements[Component] as TypingAnimationMotionComponent
  const elementRef = useRef<HTMLElement | null>(null)
  const reduced = usePrefersReducedMotion()

  const wordsToAnimate = useMemo(() => {
    if (wordList) return wordList
    const parsed = words
      .split(',')
      .map((word) => word.trim())
      .filter(Boolean)
    return parsed.length > 0 ? parsed : children ? [children] : []
  }, [wordList, words, children])
  const hasMultipleWords = wordsToAnimate.length > 1
  const animationSourceKey = wordsToAnimate.join('\u0000')

  const [state, setState] = useState<TypingState>(INITIAL)
  const stateRef = useRef<TypingState>(INITIAL)
  const waited = useRef(0)

  useEffect(() => {
    stateRef.current = INITIAL
    waited.current = 0
    setState(INITIAL)
  }, [animationSourceKey])

  // 上游用 setTimeout 一步步排队；这里把同样的状态机挂在帧循环上，按累计时间推进。
  useFrameLoop(elementRef, ({ delta }) => {
    if (wordsToAnimate.length === 0) return
    waited.current += delta * 1000
    let s = stateRef.current
    for (let guard = 0; guard < 16; guard++) {
      const timeoutDelay = delay > 0 && s.displayedText === '' ? delay : s.phase === 'typing' ? typeSpeed : s.phase === 'deleting' ? deleteSpeed : pauseDelay
      if (waited.current < timeoutDelay) break
      waited.current -= timeoutDelay

      const currentWord = wordsToAnimate[s.currentWordIndex] || ''
      const graphemes = Array.from(currentWord)
      let next = s
      switch (s.phase) {
        case 'typing':
          if (s.currentCharIndex < graphemes.length) {
            next = { ...s, displayedText: graphemes.slice(0, s.currentCharIndex + 1).join(''), currentCharIndex: s.currentCharIndex + 1 }
          } else if (hasMultipleWords || loop) {
            const isLastWord = s.currentWordIndex === wordsToAnimate.length - 1
            if (!isLastWord || loop) next = { ...s, phase: 'pause' }
          }
          break
        case 'pause':
          next = { ...s, phase: 'deleting' }
          break
        case 'deleting':
          if (s.currentCharIndex > 0) {
            next = { ...s, displayedText: graphemes.slice(0, s.currentCharIndex - 1).join(''), currentCharIndex: s.currentCharIndex - 1 }
          } else {
            next = { ...s, currentWordIndex: (s.currentWordIndex + 1) % wordsToAnimate.length, phase: 'typing' }
          }
          break
      }
      if (next === s) {
        // 打完最后一个短语且不循环：停住。
        waited.current = 0
        break
      }
      s = next
    }
    if (s !== stateRef.current) {
      stateRef.current = s
      setState(s)
    }
  })

  const view: TypingState = reduced
    ? { displayedText: wordsToAnimate[0] ?? '', currentWordIndex: 0, currentCharIndex: Array.from(wordsToAnimate[0] ?? '').length, phase: 'typing' }
    : state
  const { displayedText, currentWordIndex, currentCharIndex, phase } = view

  const currentWordGraphemes = Array.from(wordsToAnimate[currentWordIndex] || '')
  const isComplete = !loop && currentWordIndex === wordsToAnimate.length - 1 && currentCharIndex >= currentWordGraphemes.length && phase !== 'deleting'

  const shouldShowCursor = showCursor && !isComplete && (hasMultipleWords || loop || currentCharIndex < currentWordGraphemes.length)

  const getCursorChar = () => {
    switch (cursorStyle) {
      case 'block':
        return '▌'
      case 'underscore':
        return '_'
      case 'line':
      default:
        return '|'
    }
  }

  return (
    <MotionComponent ref={elementRef} className={cn('leading-20 tracking-[-0.02em]', Component === 'span' && 'inline-block', className)} style={style}>
      <span className="sr-only">{wordsToAnimate.join(', ')}</span>
      <span aria-hidden>
        {displayedText}
        {shouldShowCursor && (
          <span className={cn('inline-block', blinkCursor && 'animate-blink-cursor motion-reduce:animate-none')}>{getCursorChar()}</span>
        )}
      </span>
    </MotionComponent>
  )
}
