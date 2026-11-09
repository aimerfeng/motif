// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Eduardo Calvo
// Source: https://github.com/educlopez/smoothui/blob/b6312bc/packages/smoothui/components/kinetic-center-build/index.tsx
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useRef, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  phrases: 'Designed for the way you work | Built to ship on day one | Made by a team of four',
  wordInterval: 0.43,
  pushDuration: 0.43,
  holdTime: 2.5,
  entryOffset: 88,
  entryBlur: 3.5,
  fontSize: 56,
  font: 'sans',
}
/* @motif:end */

export type KineticCenterBuildProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
}

const BUILD_EASE = [0.2, 0.8, 0.2, 1] as const
const EXIT_EASE = [0.4, 0, 0.2, 1] as const
const EXIT_TIME = 0.26 + 0.22

const FONT_STACKS: Record<string, string> = {
  sans: "'Inter Tight Variable', ui-sans-serif, system-ui, sans-serif",
  serif: "'Instrument Serif', ui-serif, Georgia, serif",
  grotesk: "'Space Grotesk Variable', ui-sans-serif, system-ui, sans-serif",
}

function splitPhrases(phrases: string): string[] {
  return phrases
    .split(/[|\n]/)
    .map((phrase) => phrase.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
}

/**
 * KineticCenterBuild — Apple keynote-style word-by-word build.
 * Each new word enters from the right and pushes the line until the full phrase locks centered.
 * 计时来自 useFrameLoop 的 time（截图时钟可以驱动），而不是 setTimeout。
 */
export function KineticCenterBuild({ className, style, ...props }: KineticCenterBuildProps) {
  const { phrases, wordInterval, pushDuration, entryOffset, entryBlur, holdTime, fontSize, font } = { ...defaults, ...props }
  const list = splitPhrases(phrases)
  const hostRef = useRef<HTMLSpanElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const [phase, setPhase] = useState({ phraseIndex: 0, wordCount: 1, exiting: false })

  const durationOf = (phrase: string) => (phrase.split(' ').length - 1) * wordInterval + pushDuration + holdTime + EXIT_TIME

  useFrameLoop(
    hostRef,
    ({ time }) => {
      if (list.length === 0) return
      const cycle = list.reduce((sum, phrase) => sum + durationOf(phrase), 0)
      let t = cycle > 0 ? time % cycle : 0
      let phraseIndex = 0
      while (phraseIndex < list.length - 1 && t >= durationOf(list[phraseIndex] ?? '')) {
        t -= durationOf(list[phraseIndex] ?? '')
        phraseIndex++
      }
      const phrase = list[phraseIndex] ?? ''
      const wordCount = Math.min(phrase.split(' ').length, 1 + Math.floor(t / wordInterval))
      const exiting = t >= durationOf(phrase) - EXIT_TIME
      setPhase((prev) =>
        prev.phraseIndex === phraseIndex && prev.wordCount === wordCount && prev.exiting === exiting ? prev : { phraseIndex, wordCount, exiting },
      )
    },
    { reducedMotion: 'slowed' },
  )

  const phraseIndex = list.length > 0 ? phase.phraseIndex % list.length : 0
  const currentPhrase = list[phraseIndex] ?? ''
  const words = currentPhrase.split(' ')
  const { wordCount, exiting } = phase

  const visibleWords = shouldReduceMotion ? words : words.slice(0, wordCount)
  const restingAnimate = shouldReduceMotion ? { opacity: 1 } : { filter: 'blur(0px)', opacity: 1, scale: 1, x: 0, y: 0 }
  const exitAnimate = {
    filter: `blur(${entryBlur * 0.7}px)`,
    opacity: 0,
    transition: { duration: 0.26, ease: EXIT_EASE },
    y: -6,
  }

  return (
    <span
      ref={hostRef}
      aria-live="polite"
      className={cn('flex flex-wrap items-center justify-center text-center leading-[1.1] font-semibold tracking-[-0.03em]', className)}
      style={{
        gap: '0.18em',
        fontSize: `clamp(24px, ${((fontSize / 1200) * 100).toFixed(2)}vw + 12px, ${fontSize}px)`,
        fontFamily: FONT_STACKS[font] ?? FONT_STACKS.sans,
        ...style,
      }}
    >
      <AnimatePresence mode="popLayout">
        {visibleWords.map((word, i) => (
          <motion.span
            animate={exiting && !shouldReduceMotion ? exitAnimate : restingAnimate}
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : {
                    filter: `blur(${entryBlur}px)`,
                    opacity: 0,
                    scale: 0.992,
                    x: entryOffset,
                    y: 6,
                  }
            }
            key={`${phraseIndex}-${i}`}
            layout={!shouldReduceMotion}
            style={{ display: 'inline-block' }}
            transition={
              shouldReduceMotion
                ? { duration: 0.3 }
                : {
                    duration: i === 0 ? pushDuration * 0.8 : pushDuration,
                    ease: BUILD_EASE,
                    layout: { duration: pushDuration, ease: BUILD_EASE },
                  }
            }
          >
            {word}
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  )
}
