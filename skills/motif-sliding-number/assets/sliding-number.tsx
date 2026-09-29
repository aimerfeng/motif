// SPDX-License-Identifier: MIT
// Copyright (c) 2024 ibelick
// Source: https://github.com/ibelick/motion-primitives/blob/120f64f/components/core/sliding-number.tsx
// Modified by Motif; see the item's provenance.
import { motion, useReducedMotion, useSpring, useTransform, type MotionValue } from 'motion/react'
import { cn } from '@/lib/motif-runtime'
import { useEffect, useRef, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  value: 12480,
  prefix: '$',
  suffix: '',
  minDigits: 1,
  grouping: true,
  spring: {
    visualDuration: 0.7,
    bounce: 0.2,
  },
}
/* @motif:end */

type SpringOptions = typeof defaults.spring

// 上下各留出 0.12em，让滚动中的数字在边缘渐隐而不是被生硬切掉；再大就会在静止时露出相邻数字。
const FADE_MASK: CSSProperties = {
  maskImage: 'linear-gradient(to bottom, transparent 0%, #000 14%, #000 86%, transparent 100%)',
  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 14%, #000 86%, transparent 100%)',
}

export type SlidingNumberProps = Partial<typeof defaults> & {
  /** 小数分隔符，只在数值带小数时出现。 */
  decimalSeparator?: string
  className?: string
  style?: CSSProperties
}

/** 一位数字：竖向排着 0–9，按弹簧滚动到当前位的数字。 */
function Digit({ value, place, spring, reduced }: { value: number; place: number; spring: SpringOptions; reduced: boolean }) {
  const digit = Math.floor(value / place) % 10
  const position = useSpring(digit, spring)
  // total 是累计滚动的位置：数值上涨就向前滚，下降就向后滚，不会绕远路转过所有数字。
  const state = useRef({ digit, total: digit, value })

  useEffect(() => {
    const current = state.current
    if (current.value === value) return
    const forward = value >= current.value
    const step = forward ? (digit - current.digit + 10) % 10 : -((current.digit - digit + 10) % 10)
    current.total += step
    current.digit = digit
    current.value = value
    if (reduced) position.jump(current.total)
    else position.set(current.total)
  }, [value, digit, reduced, position])

  return (
    <span
      className="relative -my-[0.12em] inline-block w-[1ch] overflow-y-clip overflow-x-visible py-[0.12em] leading-[1.15] tabular-nums"
      style={FADE_MASK}
    >
      <span className="invisible">0</span>
      {Array.from({ length: 10 }, (_, number) => (
        <Numeral key={number} position={position} number={number} />
      ))}
    </span>
  )
}

function Numeral({ position, number }: { position: MotionValue<number>; number: number }) {
  // 每个数字相对当前位置的偏移（单位：一行高），落在 -4 ~ 5 之间，百分比按自身高度换算。
  const y = useTransform(position, (latest) => {
    const current = ((latest % 10) + 10) % 10
    let offset = (10 + number - current) % 10
    if (offset > 5) offset -= 10
    return `${offset * 100}%`
  })
  return (
    <motion.span aria-hidden style={{ y }} className="absolute inset-x-0 top-[0.12em] flex h-[1.15em] items-center justify-center">
      {number}
    </motion.span>
  )
}

/** 数字滚动。数值、前后缀、位数都从 props 来，数值一变，各位数字各自滚动到新值。 */
export function SlidingNumber({ className, style, decimalSeparator = '.', ...props }: SlidingNumberProps) {
  const { value, prefix, suffix, minDigits, grouping, spring } = { ...defaults, ...props }
  const reduced = useReducedMotion() ?? false

  const absolute = Math.abs(value)
  const [integerText = '0', decimalText] = absolute.toString().split('.')
  const integerValue = parseInt(integerText, 10)
  const digits = integerText.padStart(Math.max(1, Math.round(minDigits)), '0').split('')
  const places = digits.map((_, index) => 10 ** (digits.length - index - 1))

  return (
    <span className={cn('inline-flex items-center', className)} style={style} role="text" aria-label={`${value < 0 ? '-' : ''}${prefix}${value}${suffix}`}>
      <span aria-hidden className="inline-flex items-center whitespace-pre">
        {value < 0 && '-'}
        {prefix}
        {digits.map((_, index) => {
          const remaining = digits.length - index - 1
          return (
            <span key={`int-${places[index]}`} className="inline-flex items-center">
              <Digit value={integerValue} place={places[index]!} spring={spring} reduced={reduced} />
              {grouping && remaining > 0 && remaining % 3 === 0 && <span>,</span>}
            </span>
          )
        })}
        {decimalText && (
          <>
            <span>{decimalSeparator}</span>
            {decimalText.split('').map((_, index) => (
              <Digit key={`dec-${index}`} value={parseInt(decimalText, 10)} place={10 ** (decimalText.length - index - 1)} spring={spring} reduced={reduced} />
            ))}
          </>
        )}
        {suffix}
      </span>
    </span>
  )
}
