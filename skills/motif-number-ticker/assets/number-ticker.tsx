// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/number-ticker.tsx
// Modified by Motif; see the item's provenance.
import { cn, usePrefersReducedMotion } from '@/lib/motif-runtime'
import { animate, useInView } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  value: 12480,
  startValue: 0,
  decimalPlaces: 0,
  prefix: '',
  suffix: '',
  grouping: true,
  spring: {
    visualDuration: 1.8,
    bounce: 0,
  },
  delay: 0,
  direction: 'up',
  startOnView: false,
}
/* @motif:end */

export type NumberTickerProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
}

/** 数字从起点用弹簧滚动到目标值；等宽数字保证宽度稳定。 */
export function NumberTicker({ className, style, ...props }: NumberTickerProps) {
  const { value, startValue, decimalPlaces, prefix, suffix, grouping, spring, delay, direction, startOnView } = { ...defaults, ...props }
  const ref = useRef<HTMLSpanElement>(null)
  const seen = useInView(ref, { once: true, margin: '0px' })
  const reduced = usePrefersReducedMotion()
  const from = direction === 'down' ? value : startValue
  const to = direction === 'down' ? startValue : value
  const [current, setCurrent] = useState(reduced ? to : from)
  const started = !startOnView || seen

  useEffect(() => {
    // 减少动态效果时直接给出最终值。
    if (reduced) {
      setCurrent(to)
      return
    }
    setCurrent(from)
    if (!started) return
    const controls = animate(from, to, {
      type: 'spring',
      visualDuration: spring.visualDuration,
      bounce: spring.bounce,
      delay,
      onUpdate: setCurrent,
    })
    return () => controls.stop()
  }, [reduced, started, from, to, spring.visualDuration, spring.bounce, delay])

  const text = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
    useGrouping: grouping,
  }).format(Number(current.toFixed(decimalPlaces)))

  return (
    <span ref={ref} className={cn('inline-block tracking-tight text-foreground tabular-nums', className)} style={style}>
      {prefix}
      {text}
      {suffix}
    </span>
  )
}
