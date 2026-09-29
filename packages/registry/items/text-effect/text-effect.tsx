// SPDX-License-Identifier: MIT
// Copyright (c) 2024 ibelick
// Source: https://github.com/ibelick/motion-primitives/blob/120f64f/components/core/text-effect.tsx
// Modified by Motif; see the item's provenance.
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'motion/react'
import { cn } from '@motif/runtime'
import { memo, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  text: 'Craft the details people feel but never notice.',
  preset: 'fade-in-blur',
  per: 'word',
  speedReveal: 0.7,
  speedSegment: 1,
  delay: 0,
  blur: 12,
  distance: 20,
}
/* @motif:end */

export type TextEffectPreset = 'blur' | 'fade-in-blur' | 'scale' | 'fade' | 'slide'
export type TextEffectPer = 'word' | 'char'
type TextTag = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'div' | 'span'

export type TextEffectProps = Partial<typeof defaults> & {
  /** 优先于 text，方便直接写成 <TextEffect>…</TextEffect>。 */
  children?: string
  /** 渲染成哪个标签。 */
  as?: TextTag
  /** 为 false 时播放退场动画，重新变为 true 时再次入场。 */
  trigger?: boolean
  onAnimationComplete?: () => void
  onAnimationStart?: () => void
  className?: string
  style?: CSSProperties
}

const STAGGER: Record<TextEffectPer, number> = { char: 0.03, word: 0.05 }

function itemVariants(preset: TextEffectPreset, blur: number, distance: number): Variants {
  const hidden = { opacity: 0 }
  const visible = { opacity: 1 }
  switch (preset) {
    case 'blur':
      return { hidden: { ...hidden, filter: `blur(${blur}px)` }, visible: { ...visible, filter: 'blur(0px)' } }
    case 'fade-in-blur':
      return { hidden: { ...hidden, y: distance, filter: `blur(${blur}px)` }, visible: { ...visible, y: 0, filter: 'blur(0px)' } }
    case 'scale':
      return { hidden: { ...hidden, scale: 0 }, visible: { ...visible, scale: 1 } }
    case 'slide':
      return { hidden: { ...hidden, y: distance }, visible: { ...visible, y: 0 } }
    default:
      return { hidden, visible }
  }
}

const Segment = memo(function Segment({ segment, per, variants }: { segment: string; per: TextEffectPer; variants: Variants }) {
  if (per === 'word') {
    return (
      <motion.span aria-hidden="true" variants={variants} className="inline-block whitespace-pre">
        {segment}
      </motion.span>
    )
  }
  // 按字拆分时整词包在 inline-block 里，避免换行把一个词拆开。
  return (
    <span className="inline-block whitespace-pre">
      {segment.split('').map((char, index) => (
        <motion.span key={index} aria-hidden="true" variants={variants} className="inline-block whitespace-pre">
          {char}
        </motion.span>
      ))}
    </span>
  )
})

/** 文字逐词 / 逐字入场。可读的完整文字放在 sr-only 里，屏幕阅读器不会读到拆开的片段。 */
export function TextEffect({ children, as = 'p', trigger = true, onAnimationComplete, onAnimationStart, className, style, ...props }: TextEffectProps) {
  const options = { ...defaults, ...props }
  const text = children ?? options.text
  const per: TextEffectPer = options.per === 'char' ? 'char' : 'word'
  const preset = options.preset as TextEffectPreset
  // 减少动态效果时直接显示完整文字。
  const reducedMotion = useReducedMotion()

  if (reducedMotion) {
    const Tag = as
    return (
      <Tag className={className} style={style}>
        {text}
      </Tag>
    )
  }

  const MotionTag = motion[as]
  const segments = text.split(/(\s+)/)
  const stagger = STAGGER[per] / Math.max(options.speedReveal, 0.1)
  const duration = 0.3 / Math.max(options.speedSegment, 0.1)

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: stagger, delayChildren: options.delay } },
    exit: { transition: { staggerChildren: stagger, staggerDirection: -1 } },
  }
  const base = itemVariants(preset, options.blur, options.distance)
  const item: Variants = {
    hidden: base.hidden,
    visible: { ...base.visible, transition: { duration } },
    exit: { ...base.hidden, transition: { duration } },
  }

  return (
    <AnimatePresence mode="wait">
      {trigger && (
        <MotionTag
          key="text"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={container}
          className={cn(className)}
          style={style}
          onAnimationComplete={onAnimationComplete}
          onAnimationStart={onAnimationStart}
        >
          <span className="sr-only">{text}</span>
          {segments.map((segment, index) => (
            <Segment key={`${per}-${index}-${segment}`} segment={segment} per={per} variants={item} />
          ))}
        </MotionTag>
      )}
    </AnimatePresence>
  )
}
