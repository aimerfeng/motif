// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/blur-fade.tsx
// Modified by Motif; see the item's provenance.
import { motion, useInView, useReducedMotion } from 'motion/react'
import { useRef, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  text: 'Craft the moments between screens',
  duration: 0.9,
  delay: 0,
  ease: [0.22, 1, 0.36, 1],
  direction: 'up',
  offset: 16,
  blur: 10,
  inView: false,
}
/* @motif:end */

export type BlurFadeProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 让内容从模糊、偏移的状态淡入并聚焦。可以包住任何元素，配合 delay 做错开入场。 */
export function BlurFade({ children, className, style, ...props }: BlurFadeProps) {
  const { text, duration, delay, ease, direction, offset, blur, inView } = { ...defaults, ...props }
  const ref = useRef<HTMLDivElement>(null)
  const seen = useInView(ref, { once: true, margin: '-50px' })
  // 减少动态效果时只保留一次很短的透明度渐变，不再位移或模糊。
  const reduced = useReducedMotion()
  const visible = !inView || seen

  const axis = direction === 'left' || direction === 'right' ? 'x' : 'y'
  const from = direction === 'right' || direction === 'down' ? -offset : offset
  const hidden = reduced ? { opacity: 0 } : { opacity: 0, [axis]: from, filter: `blur(${blur}px)` }
  const shown = reduced ? { opacity: 1 } : { opacity: 1, [axis]: 0, filter: 'blur(0px)' }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={hidden}
      animate={visible ? shown : hidden}
      transition={reduced ? { duration: 0.25 } : { duration, delay: 0.04 + delay, ease: ease as [number, number, number, number] }}
    >
      {children ?? text}
    </motion.div>
  )
}
