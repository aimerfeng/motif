// SPDX-License-Identifier: MIT
// Copyright (c) 2024 ibelick
// Source: https://github.com/ibelick/motion-primitives/blob/120f64f/components/core/text-roll.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { motion, useReducedMotion, type Transition } from 'motion/react'
import { useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  text: 'Selected work',
  variant: 'roll',
  direction: 'up',
  duration: 0.5,
  stagger: 0.03,
  easing: [0.65, 0, 0.35, 1],
  rollColor: '#9cc8ff',
}
/* @motif:end */

export type TextRollProps = Partial<typeof defaults> & {
  /** 优先于 text。 */
  children?: string
  /** 受控：为 true 时滚到第二份文字。不传时由指针悬停在文字上控制。 */
  active?: boolean
  className?: string
  style?: CSSProperties
}

/** 立方体半深（em）：正面向前推出这么多，底面向下推出这么多，转 90° 时两面正好交换。 */
const DEPTH = '0.5em'

type LetterProps = {
  char: string
  on: boolean
  up: boolean
  rollColor: string
  transition: Transition
}

/**
 * roll：每个字是一个小立方体，正面是原字，底面（或顶面）是第二份；绕 X 轴转 90° 把它翻到正面。
 * 背面隐藏，转过去的那一面不会透出来。
 */
function RollLetter({ char, on, up, rollColor, transition }: LetterProps) {
  return (
    <span className="relative inline-block perspective-[4em]">
      <span className="relative block transform-3d" style={{ transform: `translateZ(-${DEPTH})` }}>
        <motion.span className="relative block transform-3d" initial={false} animate={{ rotateX: on ? (up ? 90 : -90) : 0 }} transition={transition}>
          <span className="block backface-hidden" style={{ transform: `translateZ(${DEPTH})` }}>
            {char}
          </span>
          <span
            className="absolute inset-0 block backface-hidden"
            style={{ transform: `rotateX(${up ? -90 : 90}deg) translateZ(${DEPTH})`, color: rollColor }}
          >
            {char}
          </span>
        </motion.span>
      </span>
    </span>
  )
}

/** slide：两份字上下排着，从一条裁切线里滑过去（上游文档里的自定义过渡示例）。 */
function SlideLetter({ char, on, up, rollColor, transition }: LetterProps) {
  const away = up ? '-120%' : '120%'
  const ready = up ? '120%' : '-120%'
  return (
    // 上下各留 0.12em 再裁切，降部和重音符号不会被切掉。
    <span className="relative -my-[0.12em] inline-block overflow-hidden py-[0.12em]">
      <motion.span className="block" initial={false} animate={{ y: on ? away : '0%' }} transition={transition}>
        {char}
      </motion.span>
      <motion.span
        className="absolute inset-x-0 top-[0.12em] block"
        style={{ color: rollColor }}
        initial={false}
        animate={{ y: on ? '0%' : ready }}
        transition={transition}
      >
        {char}
      </motion.span>
    </span>
  )
}

/**
 * 逐字滚动：悬停（或 active 为 true）时每个字依次翻到第二份，离开时再翻回来。
 * 适合导航链接、按钮和大号菜单；整段文字放在 sr-only 里，读屏软件只读一遍。
 */
export function TextRoll({ children, active, className, style, ...props }: TextRollProps) {
  const { text, variant, direction, duration, stagger, easing, rollColor } = { ...defaults, ...props }
  const content = children ?? text
  const reduced = useReducedMotion()
  const [hovered, setHovered] = useState(false)
  const on = active ?? hovered
  const up = direction !== 'down'
  const ease = easing as [number, number, number, number]
  const words = content.split(/(\s+)/)
  let index = 0

  return (
    <span
      className={cn('relative inline-block', className)}
      style={style}
      onPointerEnter={active === undefined ? () => setHovered(true) : undefined}
      onPointerLeave={active === undefined ? () => setHovered(false) : undefined}
    >
      <span className="sr-only">{content}</span>
      {reduced ? (
        // 减少动态效果：不翻转，只换成第二份的颜色。
        <span aria-hidden style={on ? { color: rollColor } : undefined}>
          {content}
        </span>
      ) : (
        <span aria-hidden>
          {words.map((word, wordIndex) =>
            /^\s+$/.test(word) ? (
              <span key={wordIndex} className="whitespace-pre">
                {word}
              </span>
            ) : (
              // 一个词包成一块，换行只发生在词与词之间。
              <span key={wordIndex} className="inline-block whitespace-nowrap">
                {Array.from(word).map((char) => {
                  const position = index++
                  const transition: Transition = { duration, ease, delay: position * stagger }
                  const Letter = variant === 'slide' ? SlideLetter : RollLetter
                  return <Letter key={position} char={char} on={on} up={up} rollColor={rollColor} transition={transition} />
                })}
              </span>
            ),
          )}
        </span>
      )}
    </span>
  )
}
