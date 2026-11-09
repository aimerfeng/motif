// SPDX-License-Identifier: MIT
// Copyright (c) 2024 ibelick
// Source: https://github.com/ibelick/motion-primitives/blob/120f64f/components/core/text-morph.tsx
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion, type Transition, type Variants } from 'motion/react'
import { useId, useMemo, useRef, useState, type CSSProperties, type ElementType } from 'react'

/* @motif:defaults */
export const defaults = {
  words: 'Monthly, Yearly, Lifetime',
  interval: 1.8,
  stiffness: 280,
  damping: 18,
  enter: 'fade',
  font: 'Geist Variable',
  size: 56,
  weight: 500,
}
/* @motif:end */

export type TextMorphProps = Partial<typeof defaults> & {
  /** 传了就只显示这段文字（受控）；不传时按 words 和 interval 自动循环。 */
  children?: string
  as?: ElementType
  className?: string
  style?: CSSProperties
  variants?: Variants
  transition?: Transition
}

const VARIANTS: Record<string, Variants> = {
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  blur: { initial: { opacity: 0, filter: 'blur(6px)' }, animate: { opacity: 1, filter: 'blur(0px)' }, exit: { opacity: 0, filter: 'blur(6px)' } },
  rise: { initial: { opacity: 0, y: '0.4em' }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: '-0.4em' } },
}

function splitWords(words: string): string[] {
  return words
    .split(/[,\n]/)
    .map((word) => word.trim())
    .filter(Boolean)
}

export function TextMorph({ children, as: Component = 'p', className, style, variants, transition, ...props }: TextMorphProps) {
  const { words, interval, stiffness, damping, enter, font, size, weight } = { ...defaults, ...props }
  const uniqueId = useId()
  const reduced = useReducedMotion()
  const hostRef = useRef<HTMLElement>(null)
  const list = useMemo(() => splitWords(words), [words])
  const [index, setIndex] = useState(0)

  // 换词节奏由帧循环的时间决定：离屏暂停，截图可复现。
  useFrameLoop(
    hostRef,
    ({ time }) => {
      if (children !== undefined || list.length < 2) return
      const next = Math.floor(time / Math.max(interval, 0.1)) % list.length
      setIndex((current) => (current === next ? current : next))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  const text = children ?? list[index % Math.max(list.length, 1)] ?? ''

  const characters = useMemo(() => {
    const charCounts: Record<string, number> = {}

    return text.split('').map((char) => {
      const lowerChar = char.toLowerCase()
      charCounts[lowerChar] = (charCounts[lowerChar] || 0) + 1

      return {
        id: `${uniqueId}-${lowerChar}${charCounts[lowerChar]}`,
        label: char === ' ' ? ' ' : char,
      }
    })
  }, [text, uniqueId])

  const defaultTransition: Transition = reduced ? { duration: 0 } : { type: 'spring', stiffness, damping, mass: 0.3 }

  return (
    <Component
      ref={hostRef}
      className={cn(className)}
      aria-label={text}
      style={{ fontFamily: `'${font}', ui-sans-serif, system-ui, sans-serif`, fontSize: size, fontWeight: weight, ...style }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {characters.map((character) => (
          <motion.span
            key={character.id}
            layoutId={character.id}
            className="inline-block"
            aria-hidden="true"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants || VARIANTS[enter] || VARIANTS.fade}
            transition={transition || defaultTransition}
          >
            {character.label}
          </motion.span>
        ))}
      </AnimatePresence>
    </Component>
  )
}
