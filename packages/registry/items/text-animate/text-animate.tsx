// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/text-animate.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { motion, useReducedMotion, type TargetAndTransition, type Variants } from 'motion/react'
import type { CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  text: 'Type that arrives with intent',
  animation: 'blurInUp',
  by: 'word',
  duration: 0.6,
  spread: 0.6,
  delay: 0,
  startOnView: false,
}
/* @motif:end */

const elements = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
  div: motion.div,
  span: motion.span,
} as const

export type TextAnimateProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 每一段（词或字）的 className。 */
  segmentClassName?: string
  /** 要动画的文字；不传时用 text 参数。 */
  children?: string
  /** 渲染成哪种元素。 */
  as?: keyof typeof elements
}

type Pair = { hidden: TargetAndTransition; show: TargetAndTransition }

const spring = { type: 'spring', damping: 15, stiffness: 300 } as const

/** 十种入场：隐藏态与显示态，过渡在下面统一加。 */
const ANIMATIONS: Record<string, Pair> = {
  fadeIn: { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } },
  blurIn: { hidden: { opacity: 0, filter: 'blur(10px)' }, show: { opacity: 1, filter: 'blur(0px)' } },
  blurInUp: { hidden: { opacity: 0, filter: 'blur(10px)', y: 20 }, show: { opacity: 1, filter: 'blur(0px)', y: 0 } },
  blurInDown: { hidden: { opacity: 0, filter: 'blur(10px)', y: -20 }, show: { opacity: 1, filter: 'blur(0px)', y: 0 } },
  slideUp: { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } },
  slideDown: { hidden: { opacity: 0, y: -20 }, show: { opacity: 1, y: 0 } },
  slideLeft: { hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } },
  slideRight: { hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } },
  scaleUp: { hidden: { opacity: 0, scale: 0.5 }, show: { opacity: 1, scale: 1 } },
  scaleDown: { hidden: { opacity: 0, scale: 1.5 }, show: { opacity: 1, scale: 1 } },
}

/** 让一段文字按词、按字或整段依次入场。 */
export function TextAnimate({ className, style, segmentClassName, children, as = 'p', ...props }: TextAnimateProps) {
  const { text, animation, by, duration, spread, delay, startOnView } = { ...defaults, ...props }
  const content = children ?? text
  const reduced = useReducedMotion()
  const Tag = elements[as]

  const segments = by === 'character' ? content.split('') : by === 'word' ? content.split(/(\s+)/) : [content]
  const spring_ = animation === 'scaleUp' || animation === 'scaleDown'
  const states = ANIMATIONS[animation] ?? ANIMATIONS.blurInUp!

  // 减少动态效果：整段一起做一次很短的淡入。
  const item: Variants = reduced
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.25 } } }
    : {
        hidden: states.hidden,
        show: { ...states.show, transition: { duration, ease: 'easeOut', ...(spring_ ? { scale: spring } : {}) } },
      }
  const container: Variants = {
    hidden: {},
    show: { transition: reduced ? {} : { delayChildren: delay, staggerChildren: segments.length > 1 ? spread / segments.length : 0 } },
  }

  return (
    <Tag
      variants={container}
      initial="hidden"
      whileInView={startOnView ? 'show' : undefined}
      animate={startOnView ? undefined : 'show'}
      viewport={{ once: true }}
      aria-label={content}
      className={cn('whitespace-pre-wrap', className)}
      style={style}
    >
      {segments.map((segment, index) => (
        <motion.span key={`${by}-${index}`} variants={item} aria-hidden className={cn('inline-block whitespace-pre', segmentClassName)}>
          {segment}
        </motion.span>
      ))}
    </Tag>
  )
}
